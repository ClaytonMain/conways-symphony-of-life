import { Html, useCursor } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import { buttonMaterial, genericBoxGeometry } from "../constants";
import "./Controls.css";

interface InstrumentButtonProps {
    position?: [number, number, number] | THREE.Vector3;
    scale?: [number, number, number] | THREE.Vector3 | number;
    buttonScale?: [number, number, number] | THREE.Vector3 | number;
    labelScale?: [number, number, number] | THREE.Vector3 | number;
    label?: string;
    labelDistanceFactor?: number;
    onClick?: (() => void) | undefined;
    children?: React.ReactNode;
}

export default function InstrumentButton({
    position = [0, 0, 0],
    scale = 1,
    buttonScale = 1,
    labelScale = 1,
    label = "",
    labelDistanceFactor = 10,
    onClick = undefined,
    children,
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
            <mesh
                geometry={genericBoxGeometry}
                material={buttonMaterial}
                scale={buttonScale}
            />
            {label && (
                <Html
                    transform
                    distanceFactor={labelDistanceFactor}
                    style={{
                        cursor: "pointer",
                    }}
                    scale={labelScale}
                >
                    <div
                        onClick={onClick}
                        className="instrument-button-label"
                    >
                        {label}
                    </div>
                </Html>
            )}
            {children}
        </group>
    );
}
