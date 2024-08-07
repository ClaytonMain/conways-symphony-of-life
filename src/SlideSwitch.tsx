import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface SlideSwitchProps {
    position: [number, number, number];
    scale: number;
    knobEnabledColor: string;
    knobDisabledColor: string;
    backgroundColor: string;
    enabled: boolean;
    onClick: () => void;
}

export default function SlideSwitch({
    position,
    scale,
    knobEnabledColor,
    knobDisabledColor,
    backgroundColor,
    enabled,
    onClick,
}: SlideSwitchProps) {
    const knobRef = useRef<THREE.Mesh>(null!);
    const backgroundAlphaMap = useTexture("images/SliderAlphaMap.png");

    useFrame(() => {
        knobRef.current.position.x = THREE.MathUtils.lerp(
            knobRef.current.position.x,
            enabled ? 0.5 : -0.5,
            0.1
        );
    });
    return (
        <group
            position={position}
            scale={scale}
            onClick={onClick}
        >
            <mesh
                ref={knobRef}
                position={[0, 0, 0.01]}
            >
                <circleGeometry args={[0.5]} />
                <meshBasicMaterial
                    color={enabled ? knobEnabledColor : knobDisabledColor}
                />
            </mesh>
            <mesh
                position={[0, 0, -0.01]}
                scale={0.95}
            >
                <planeGeometry args={[2, 1]} />
                <meshBasicMaterial
                    color={backgroundColor}
                    alphaMap={backgroundAlphaMap}
                    transparent
                />
            </mesh>
        </group>
    );
}
