import { DragControls, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGridStore } from "./useGridStore";

interface KnobProps {
    position: [number, number, number];
    scale?: number;
    ticks?: number;
    minAngle?: number;
    maxAngle?: number;
    minValue?: number;
    maxValue?: number;
    startValue?: number;
    knobColor?: string;
    knobDotColor?: string;
    knobTickColor?: string;
    snap?: boolean;
    onChange?: (value: number) => void;
    onDragEnd?: (value: number) => void;
    label?: string;
    labelMinMax?: boolean;
    labelColor?: string;
}

export default function Knob({
    position,
    scale = 1,
    ticks = 10,
    minAngle = (-Math.PI * 2) / 3,
    maxAngle = (Math.PI * 2) / 3,
    minValue = 0,
    maxValue = 1,
    startValue = 0.5,
    knobColor = "#413324",
    knobDotColor = "#f5ebc6",
    knobTickColor = "#413324",
    snap = true,
    onChange = (value: number) => {
        value;
    },
    onDragEnd = (value: number) => {
        value;
    },
    label = "",
    labelMinMax = true,
    labelColor = "#000",
}: KnobProps) {
    const tickGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.1);
    const tickMaterial = new THREE.MeshBasicMaterial({ color: knobTickColor });
    const knobRadius = 1;
    const ref = useRef<THREE.Group>(null!);
    const dragStartRotationRef = useRef(0);
    const snapFactor = (maxAngle - minAngle) / (ticks - 1);
    const [value, setValue] = useState(startValue);

    function handleOnDrag(deltaLocalMatrix: THREE.Matrix4) {
        const dragY = deltaLocalMatrix.toArray()[13];
        // There has got to be a better way to do this...
        const rotationAngle = Math.min(
            Math.max(
                snap
                    ? Math.round(
                          (dragStartRotationRef.current - dragY) / snapFactor
                      ) *
                          snapFactor +
                          (ticks % 2 === 0
                              ? (snapFactor / 2) * (dragY > 0 ? 1 : -1)
                              : 0)
                    : dragStartRotationRef.current - dragY,
                minAngle
            ),
            maxAngle
        );
        const rotationPercent =
            (maxAngle - rotationAngle) / (maxAngle - minAngle);
        setValue(
            Math.round(minValue + rotationPercent * (maxValue - minValue))
        );
        ref.current.rotation.z = rotationAngle;
        ref.current.updateMatrix();
        onChange(value);
    }
    useEffect(() => {
        ref.current.rotation.z =
            minAngle +
            (1 - (value - minValue) / (maxValue - minValue)) *
                (maxAngle - minAngle);
        ref.current.updateMatrix();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <group
            position={position}
            scale={scale}
        >
            {Array.from({ length: ticks }).map((_, i) => {
                const angle = Math.PI / 2 - (i * snapFactor + minAngle);
                const x = Math.cos(angle) * (knobRadius + 0.15);
                const y = Math.sin(angle) * (knobRadius + 0.15);
                return (
                    <mesh
                        key={i}
                        position={[x, y, 0]}
                        rotation={[0, 0, angle]}
                        geometry={tickGeometry}
                        material={tickMaterial}
                    />
                );
            })}
            {labelMinMax && (
                <>
                    <Text
                        position={[
                            Math.cos(Math.PI / 2 - minAngle) *
                                (knobRadius + 0.2),
                            Math.sin(Math.PI / 2 - minAngle) *
                                (knobRadius + 0.2),
                            0,
                        ]}
                        scale={0.4}
                        color={labelColor}
                        fontWeight={"bold"}
                        anchorX={"right"}
                        anchorY={"top"}
                    >
                        {minValue}
                    </Text>
                    <Text
                        position={[
                            Math.cos(Math.PI / 2 - maxAngle) *
                                (knobRadius + 0.2),
                            Math.sin(Math.PI / 2 - maxAngle) *
                                (knobRadius + 0.2),
                            0,
                        ]}
                        scale={0.4}
                        color={labelColor}
                        fontWeight={"bold"}
                        anchorX={"left"}
                        anchorY={"top"}
                    >
                        {maxValue}
                    </Text>
                </>
            )}
            <Text
                position={[0, -knobRadius, 0]}
                scale={0.4}
                color={labelColor}
                fontWeight={"bold"}
                anchorX={"center"}
                anchorY={"top"}
                maxWidth={4}
                textAlign="center"
            >
                {label}
            </Text>
            <Text
                position={[0, 0, 0.01]}
                scale={0.6}
                fontWeight={"bold"}
                anchorX={"center"}
                anchorY={"middle"}
                color={"#ffffff"}
            >
                {value}
            </Text>
            <DragControls
                ref={ref}
                dragLimits={[[0, 0], undefined, [0, 0]]}
                autoTransform={false}
                onDragStart={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    useGridStore.setState({ adjustingKnob: true });
                }}
                onDrag={(_, deltaLocalMatrix) => {
                    handleOnDrag(deltaLocalMatrix);
                }}
                onDragEnd={() => {
                    dragStartRotationRef.current = ref.current.rotation.z;
                    useGridStore.setState({ adjustingKnob: false });
                    onDragEnd(value);
                }}
            >
                <mesh>
                    <circleGeometry args={[knobRadius]} />
                    <meshBasicMaterial color={knobColor} />
                </mesh>
                <mesh position={[0, 0.75, 0.01]}>
                    <circleGeometry args={[0.1]} />
                    <meshBasicMaterial color={knobDotColor} />
                </mesh>
            </DragControls>
        </group>
    );
}
