import { DragControls, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
    genericCircleGeometry,
    knobDotMaterial,
    knobGeometry,
    staticLabelMaterialElement,
} from "../constants";
import { useGlobalStore } from "../stores/useGlobalStore";

interface ValuesKnobProps {
    values: Array<number | string>;
    startIndex?: number;
    position?: [number, number, number];
    scale?: number;
    angleRangeValues?: [number, number];
    onChange?: (index: number) => void;
    onDragEnd?: (index: number) => void;
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
    onChange,
    onDragEnd,
    label = "",
    labelOptions = true,
}: ValuesKnobProps) {
    const [dragging, setDragging] = useState(false);
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

    function handleOnDrag(deltaLocalMatrix: THREE.Matrix4) {
        const dragY = deltaLocalMatrix.toArray()[13] * 100;

        const newIndex = Math.round(
            Math.max(Math.min(dragStartIndexRef.current + dragY, ticks - 1), 0)
        );
        const rotationPercent = newIndex / (ticks - 1);
        const rotationAngle =
            angleRangeValues[0] - angleRange * rotationPercent;
        setIndex(newIndex);
        ref.current.rotation.z = rotationAngle;
        ref.current.updateMatrix();
        if (onChange) onChange(newIndex);
    }

    function handleOnClick() {
        if (dragging) return;
        const newIndex = (index + 1) % ticks;
        const rotationPercent = newIndex / (ticks - 1);
        const rotationAngle =
            angleRangeValues[0] - angleRange * rotationPercent;
        setIndex(newIndex);
        ref.current.rotation.z = rotationAngle;
        ref.current.updateMatrix();
        if (onChange) onChange(newIndex);
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
            {labelOptions && (
                <>
                    {values.map((val, i) => {
                        return (
                            <Text
                                key={i}
                                position={[
                                    Math.cos(
                                        angleRangeValues[0] - i * snapFactor
                                    ) * knobRadius,
                                    Math.sin(
                                        angleRangeValues[0] - i * snapFactor
                                    ) * knobRadius,
                                    0,
                                ]}
                                fontWeight={"bold"}
                                lineHeight={1}
                                scale={0.35}
                                textAlign={"center"}
                                anchorY={
                                    Math.sign(
                                        Math.sin(
                                            angleRangeValues[0] - i * snapFactor
                                        )
                                    ) > 0
                                        ? "bottom"
                                        : "top"
                                }
                                anchorX={
                                    Math.abs(
                                        Math.cos(
                                            angleRangeValues[0] - i * snapFactor
                                        )
                                    ) < 0.01
                                        ? "center"
                                        : Math.sign(
                                              Math.cos(
                                                  angleRangeValues[0] -
                                                      i * snapFactor
                                              )
                                          ) > 0
                                        ? "left"
                                        : "right"
                                }
                            >
                                {staticLabelMaterialElement}
                                {val}
                            </Text>
                        );
                    })}
                </>
            )}
            <Text
                position={[0, -knobRadius - 0.1, 0]}
                fontWeight={"bold"}
                lineHeight={1}
                scale={0.35}
                textAlign={"center"}
                anchorY={"top"}
            >
                {staticLabelMaterialElement}
                {label}
            </Text>
            <DragControls
                ref={ref}
                dragLimits={[[0, 0], undefined, [0, 0]]}
                autoTransform={false}
                onDragStart={() => {
                    setDragging(true);
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartIndexRef.current = index;
                    useGlobalStore.setState({ cellsIgnorePointerEvents: true });
                }}
                onDrag={(_, deltaLocalMatrix) => {
                    handleOnDrag(deltaLocalMatrix);
                }}
                onDragEnd={() => {
                    setDragging(false);
                    dragStartRotationRef.current = ref.current.rotation.z;
                    dragStartIndexRef.current = index;
                    useGlobalStore.setState({
                        cellsIgnorePointerEvents: false,
                    });
                    if (onDragEnd) onDragEnd(index);
                }}
            >
                <group onClick={handleOnClick}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={knobGeometry}
                        // material={buttonMaterial}
                        material-flatShading={true}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={[knobRadius, knobRadius, 1]}
                    >
                        <meshStandardMaterial
                            color={"#333333"}
                            roughness={0.5}
                            metalness={0.5}
                            flatShading
                        />
                    </mesh>
                    <mesh
                        position={[0.5, 0, 1.01]}
                        geometry={genericCircleGeometry}
                        material={knobDotMaterial}
                        scale={0.2}
                    />
                </group>
            </DragControls>
        </group>
    );
}
