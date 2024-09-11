import { DragControls, Html, Instance, Instances } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./ValuesKnob.css";
import { useGlobalStore } from "./stores/useGlobalStore";

interface KnobTickProps {
    position: [number, number, number];
    rotation: [number, number, number];
}

function KnobTick({ position, rotation }: KnobTickProps) {
    return (
        <Instance
            position={position}
            rotation={rotation}
        />
    );
}

interface ValuesKnobProps {
    values: Array<number | string>;
    startIndex?: number;
    position?: [number, number, number];
    scale?: number;
    angleRangeValues?: [number, number];
    knobColor?: string;
    knobDotColor?: string;
    knobTickColor?: string;
    onChange?: (value: number | string) => void;
    onDragEnd?: (value: number | string) => void;
    label?: string;
    labelStyle?: React.CSSProperties;
    labelOptions?: boolean;
    labelOptionsStyle?: React.CSSProperties;
}

export default function ValuesKnob({
    values,
    startIndex = 0,
    position = [0, 0, 0],
    scale = 1,
    angleRangeValues = [(7 * Math.PI) / 6, -Math.PI / 6],
    knobColor = "#545454",
    knobDotColor = "#f5ebc6",
    knobTickColor = "#545454",
    onChange = (value: number | string) => {
        value;
    },
    onDragEnd = (value: number | string) => {
        value;
    },
    label = "",
    labelStyle = {},
    labelOptions = true,
    labelOptionsStyle = {},
}: ValuesKnobProps) {
    const tickGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.1);
    const tickMaterial = new THREE.MeshBasicMaterial({ color: knobTickColor });
    const knobRadius = 1;
    const ref = useRef<THREE.Group>(null!);
    const dragStartRotationRef = useRef(0);
    const dragStartIndexRef = useRef(startIndex);
    const ticks = values.length;
    if (ticks < 2) {
        throw new Error("ValuesKnob requires at least 2 values.");
    }
    const snapFactor =
        (angleRangeValues[0] - angleRangeValues[1]) / (ticks - 1);
    const [index, setIndex] = useState(startIndex);
    const angleRange = angleRangeValues[0] - angleRangeValues[1];

    const latheGeometryPoints = [
        new THREE.Vector2(1, 0).multiplyScalar(knobRadius),
        new THREE.Vector2(0.75, 0.2).multiplyScalar(knobRadius),
        new THREE.Vector2(0.65, 1).multiplyScalar(knobRadius),
        new THREE.Vector2(0.0, 1).multiplyScalar(knobRadius),
    ];
    const knobGeometry = new THREE.LatheGeometry(latheGeometryPoints, 24);

    function handleOnDrag(deltaLocalMatrix: THREE.Matrix4) {
        const dragY = deltaLocalMatrix.toArray()[13];

        const newIndex = Math.round(
            Math.max(Math.min(dragStartIndexRef.current + dragY, ticks - 1), 0)
        );
        const rotationPercent = newIndex / (ticks - 1);
        const rotationAngle =
            angleRangeValues[0] - angleRange * rotationPercent;
        setIndex(newIndex);
        ref.current.rotation.z = rotationAngle;
        ref.current.updateMatrix();
        onChange(values[newIndex]);
    }
    useEffect(() => {
        const rotationPercent = index / (ticks - 1);
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
                geometry={tickGeometry}
                material={tickMaterial}
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
            {labelOptions && (
                <>
                    {values.map((val, i) => {
                        return (
                            <Html
                                key={i}
                                transform
                                position={[
                                    Math.cos(
                                        angleRangeValues[0] - i * snapFactor
                                    ) *
                                        (knobRadius + 0.5),
                                    Math.sin(
                                        angleRangeValues[0] - i * snapFactor
                                    ) *
                                        (knobRadius + 0.5),
                                    0,
                                ]}
                                distanceFactor={10}
                                className="knob-label-options-default"
                                style={labelOptionsStyle}
                            >
                                {val}
                            </Html>
                        );
                    })}
                </>
            )}
            <Html
                transform
                position={[0, -knobRadius - 0.25, 0]}
                distanceFactor={10}
                className="knob-label-default"
                style={labelStyle}
            >
                {label}
            </Html>
            <Html
                transform
                position={[0, 0, 1.01]}
                distanceFactor={10}
                className="knob-value-default"
                style={labelStyle}
            >
                {values[index]}
            </Html>
            <DragControls
                ref={ref}
                dragLimits={[[0, 0], undefined, [0, 0]]}
                autoTransform={false}
                onDragStart={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartIndexRef.current = index;
                    useGlobalStore.setState({ cellsIgnorePointerEvents: true });
                }}
                onDrag={(_, deltaLocalMatrix) => {
                    handleOnDrag(deltaLocalMatrix);
                }}
                onDragEnd={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartIndexRef.current = index;
                    useGlobalStore.setState({
                        cellsIgnorePointerEvents: false,
                    });
                    onDragEnd(values[index]);
                }}
            >
                <mesh
                    geometry={knobGeometry}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <meshStandardMaterial
                        color={knobColor}
                        flatShading
                    />
                </mesh>
                <mesh position={[0.5, 0, 1.01]}>
                    <circleGeometry args={[0.1]} />
                    <meshBasicMaterial color={knobDotColor} />
                </mesh>
            </DragControls>
        </group>
    );
}
