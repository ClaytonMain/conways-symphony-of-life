import { Html, RoundedBox, useCursor } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import { RoundedBoxProps } from "./sharedTypes";

interface InstrumentButtonProps {
    position?: [number, number, number] | THREE.Vector3;
    roundedBoxProps?: RoundedBoxProps;
    scale?: [number, number, number] | THREE.Vector3 | number;
    label?: string;
    labelDistanceFactor?: number;
    onClick?: (() => void) | undefined;
}

export default function InstrumentButton({
    position = [0, 0, 0],
    roundedBoxProps = {},
    scale = 1,
    label = "",
    labelDistanceFactor = 10,
    onClick = undefined,
}: InstrumentButtonProps) {
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);
    return (
        <group
            position={position}
            scale={scale}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <RoundedBox {...roundedBoxProps}>
                <meshBasicMaterial color="grey" />
            </RoundedBox>
            <Html
                center
                transform
                distanceFactor={labelDistanceFactor}
                style={{
                    cursor: "pointer",
                }}
            >
                <div
                    onClick={onClick}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        fontWeight: "bold",
                        fontFamily: "monospace",
                        userSelect: "none",
                    }}
                >
                    {label}
                </div>
            </Html>
        </group>
    );
}
