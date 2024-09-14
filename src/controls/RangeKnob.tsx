import { DragControls, Html, Instance, Instances } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
    buttonMaterial,
    genericBoxGeometry,
    genericCircleGeometry,
    knobDotMaterial,
    knobGeometry,
} from "../constants";
import { useGlobalStore } from "../stores/useGlobalStore";
import "./Controls.css";

interface KnobTickProps {
    position: [number, number, number];
    rotation: [number, number, number];
}

function KnobTick({ position, rotation }: KnobTickProps) {
    return (
        <Instance
            scale={[0.2, 0.1, 0.1]}
            position={position}
            rotation={rotation}
        />
    );
}

interface RangeKnobProps {
    position?: [number, number, number];
    scale?: number;
    ticks?: number;
    angleRangeValues?: [number, number];
    minValue?: number;
    maxValue?: number;
    startValue?: number;
    snap?: boolean;
    onChange?: (value: number) => void;
    onDragEnd?: (value: number) => void;
    label?: string;
    labelStyle?: React.CSSProperties;
    labelMinMax?: boolean;
    labelMinMaxStyle?: React.CSSProperties;
    fixedDecimal?: number;
}

export default function RangeKnob({
    position = [0, 0, 0],
    scale = 1,
    ticks = 11,
    angleRangeValues = [(7 * Math.PI) / 6, -Math.PI / 6],
    minValue = 0,
    maxValue = 100,
    startValue = 50,
    snap = true,
    onChange = (value: number) => {
        value;
    },
    onDragEnd = (value: number) => {
        value;
    },
    label = "",
    labelStyle = {},
    labelMinMax = true,
    labelMinMaxStyle = {},
    fixedDecimal = 0,
}: RangeKnobProps) {
    const knobRadius = 1;
    const ref = useRef<THREE.Group>(null!);
    const dragStartRotationRef = useRef(0);
    const dragStartValueRef = useRef(startValue);
    const snapFactor =
        (angleRangeValues[0] - angleRangeValues[1]) / (ticks - 1);
    const [value, setValue] = useState(startValue);
    const angleRange = angleRangeValues[0] - angleRangeValues[1];

    function handleOnDrag(deltaLocalMatrix: THREE.Matrix4) {
        const dragY = deltaLocalMatrix.toArray()[13];
        const dragFactor = maxValue - minValue;
        const normalizedDragY = (dragY * dragFactor) / (ticks - 1);
        const valueSnapFactor = dragFactor / (ticks - 1);
        let newValue = Math.max(
            Math.min(dragStartValueRef.current + normalizedDragY, maxValue),
            minValue
        );
        if (snap) {
            newValue = Math.round(newValue / valueSnapFactor) * valueSnapFactor;
        }
        newValue = parseFloat(newValue.toFixed(fixedDecimal));
        const rotationPercent = (newValue - minValue) / dragFactor;
        const rotationAngle =
            angleRangeValues[0] - angleRange * rotationPercent;
        setValue(newValue);
        ref.current.rotation.z = rotationAngle;
        ref.current.updateMatrix();
        onChange(newValue);
    }
    useEffect(() => {
        const rotationPercent = (value - minValue) / (maxValue - minValue);
        ref.current.rotation.z =
            angleRangeValues[0] - angleRange * rotationPercent;
        ref.current.updateMatrix();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <group
            position={position}
            scale={scale}
        >
            <Instances
                geometry={genericBoxGeometry}
                material={buttonMaterial}
            >
                {Array.from({ length: ticks }).map((_, i) => {
                    const angle = angleRangeValues[0] - i * snapFactor;
                    const x = Math.cos(angle) * (knobRadius + 0.15);
                    const y = Math.sin(angle) * (knobRadius + 0.15);
                    return (
                        <KnobTick
                            key={i}
                            position={[x, y, 0]}
                            rotation={[0, 0, angle]}
                        />
                    );
                })}
            </Instances>
            {labelMinMax && (
                <>
                    <Html
                        transform
                        position={[
                            Math.cos(angleRangeValues[0]) * (knobRadius + 0.3) -
                                minValue.toString().length * 0.1,
                            Math.sin(angleRangeValues[0]) * (knobRadius + 0.3),
                            0,
                        ]}
                        distanceFactor={10}
                        className="knob-label"
                        style={labelMinMaxStyle}
                    >
                        {minValue}
                    </Html>
                    <Html
                        transform
                        position={[
                            Math.cos(angleRangeValues[1]) * (knobRadius + 0.3) +
                                maxValue.toString().length * 0.1,
                            Math.sin(angleRangeValues[1]) * (knobRadius + 0.3),
                            0,
                        ]}
                        distanceFactor={10}
                        className="knob-label"
                        style={labelMinMaxStyle}
                    >
                        {maxValue}
                    </Html>
                </>
            )}
            <Html
                transform
                position={[0, -knobRadius - 0.25, 0]}
                distanceFactor={10}
                className="knob-label"
                style={labelStyle}
            >
                {label}
            </Html>
            <Html
                transform
                position={[0, 0, 1.01]}
                distanceFactor={10}
                className="knob-value"
                style={labelStyle}
            >
                {value}
            </Html>
            <DragControls
                ref={ref}
                dragLimits={[[0, 0], undefined, [0, 0]]}
                autoTransform={false}
                onDragStart={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartValueRef.current = value;
                    useGlobalStore.setState({ cellsIgnorePointerEvents: true });
                }}
                onDrag={(_, deltaLocalMatrix) => {
                    handleOnDrag(deltaLocalMatrix);
                }}
                onDragEnd={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartValueRef.current = value;
                    useGlobalStore.setState({
                        cellsIgnorePointerEvents: false,
                    });
                    onDragEnd(value);
                }}
            >
                <mesh
                    geometry={knobGeometry}
                    material={buttonMaterial}
                    material-flatShading={true}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[knobRadius, knobRadius, 1]}
                />
                <mesh
                    position={[0.5, 0, 1.01]}
                    geometry={genericCircleGeometry}
                    material={knobDotMaterial}
                    scale={0.2}
                />
            </DragControls>
        </group>
    );
}
