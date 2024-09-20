import { Instance, Text, useCursor } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import { DisplayVariant, PointerEventTypes } from "../sharedTypes";

function convertToVector3(
    v: [number, number, number] | THREE.Vector3 | number
) {
    if (Array.isArray(v)) {
        return new THREE.Vector3(v[0], v[1], v[2]);
    } else if (typeof v === "number") {
        return new THREE.Vector3(v, v, v);
    } else {
        return v;
    }
}

interface InstancedButtonOrLabelProps {
    position?: [number, number, number] | THREE.Vector3;
    scale?: [number, number, number] | THREE.Vector3 | number;
    boxScale?: [number, number, number] | THREE.Vector3 | number;
    labelScale?: [number, number, number] | THREE.Vector3 | number;
    label?: string;
    labelMaterialElement?: JSX.Element;
    labelFontWeight?: "bold" | "normal";
    labelTextAlign?: "center" | "left" | "right";
    labelAnchorX?: "center" | "left" | "right";
    labelAnchorY?:
        | number
        | "top"
        | "bottom"
        | "middle"
        | "top-baseline"
        | "bottom-baseline";
    labelZPosition?: number;
    onClick?: () => void;
    variant?: DisplayVariant;
    hoverCursor?: boolean;
    hoverVariants?: DisplayVariant[];
    children?: React.ReactNode;
}

export default function InstancedButtonOrLabel({
    position = [0, 0, 0],
    scale = 1,
    boxScale = 1,
    labelScale = 1,
    label = "",
    labelMaterialElement,
    labelFontWeight = "bold",
    labelTextAlign = "center",
    labelAnchorX,
    labelAnchorY,
    labelZPosition = 0.01,
    onClick,
    variant,
    hoverCursor = true,
    hoverVariants = ["show"],
    children,
}: InstancedButtonOrLabelProps) {
    const [hovered, setHovered] = useState(false);
    useCursor(hoverCursor ? hovered : false);
    const vectorPosition = convertToVector3(position);
    const groupScale = convertToVector3(scale);
    const instanceScale = convertToVector3(boxScale).multiply(groupScale);
    const textScale = convertToVector3(labelScale).multiply(groupScale);

    function handlePointerEvents({
        pointerEventType,
    }: {
        pointerEventType: PointerEventTypes;
    }) {
        if (
            (hoverVariants && !hoverVariants.includes(variant!)) ||
            onClick === undefined
        )
            return;
        if (pointerEventType === "over") {
            setHovered(true);
        } else {
            setHovered(false);
        }
    }

    return (
        <>
            <Instance
                position={vectorPosition}
                scale={instanceScale}
                onClick={onClick}
                onPointerOver={() =>
                    handlePointerEvents({ pointerEventType: "over" })
                }
                onPointerOut={() =>
                    handlePointerEvents({ pointerEventType: "out" })
                }
            />
            {label && (
                <Text
                    position={[
                        vectorPosition.x,
                        vectorPosition.y,
                        labelZPosition,
                    ]}
                    scale={textScale}
                    fontWeight={labelFontWeight}
                    textAlign={labelTextAlign}
                    anchorX={labelAnchorX}
                    anchorY={labelAnchorY}
                >
                    {labelMaterialElement}
                    {label}
                </Text>
            )}
            {children}
        </>
    );
}
