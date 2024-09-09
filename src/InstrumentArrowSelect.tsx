import { Html, RoundedBox, useCursor } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import "./InstrumentArrowSelect.css";
import { RoundedBoxProps } from "./sharedTypes";

interface InstrumentArrowSelectProps {
    position?: [number, number, number] | THREE.Vector3;
    orientation?: "horizontal" | "vertical";
    roundedBoxProps?: RoundedBoxProps;
    scale?: [number, number, number] | THREE.Vector3 | number;
    label?: string;
    options?: Array<string | number>;
    htmlDistanceFactor?: number;
    startingOptionIndex?: number;
    onChange?: ((value: string | number) => void) | undefined;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonArrowColor?: string;
}

export default function InstrumentArrowSelect({
    position = [0, 0, 0],
    orientation = "horizontal",
    roundedBoxProps = { radius: 0.2 },
    scale = 1,
    label = "",
    options = [],
    htmlDistanceFactor = 10,
    startingOptionIndex = 0,
    onChange = undefined,
    buttonColor = "#545454",
    buttonTextColor = "white",
    buttonArrowColor = "white",
}: InstrumentArrowSelectProps) {
    const [hovered, setHovered] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] =
        useState(startingOptionIndex);
    useCursor(hovered);

    function generateArrowRoundedBoxProps(): RoundedBoxProps {
        return {
            ...roundedBoxProps,
            args:
                orientation === "horizontal"
                    ? [
                          0.5,
                          roundedBoxProps.args?.[1] ?? 1.0,
                          roundedBoxProps.args?.[2] ?? 1.0,
                      ]
                    : [
                          0.5,
                          roundedBoxProps.args?.[2] ?? 1.0,
                          roundedBoxProps.args?.[1] ?? 1.0,
                      ],
        };
    }
    const arrowRoundedBoxProps = generateArrowRoundedBoxProps();

    function handleOnChange(increment: 1 | -1) {
        const newOptionIndex =
            (selectedOptionIndex + options.length + increment) % options.length;
        setSelectedOptionIndex(newOptionIndex);
        if (onChange) {
            onChange(options[newOptionIndex]);
        }
    }

    const arrowButtonPosition: [number, number, number] = [
        orientation === "horizontal"
            ? -((roundedBoxProps.args?.[0] ?? 1.0) + 0.5) / 2 - 0.05
            : -((roundedBoxProps.args?.[1] ?? 1.0) + 0.5) / 2 - 0.05,
        0,
        0,
    ];

    const arrowGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 3);
    const arrowMaterial = new THREE.MeshBasicMaterial({
        color: buttonArrowColor,
    });

    useEffect(() => {
        setSelectedOptionIndex(startingOptionIndex);
    }, [startingOptionIndex]);

    return (
        <group
            position={position}
            scale={scale}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <group
                rotation={
                    orientation === "vertical" ? [0, 0, Math.PI / 2] : [0, 0, 0]
                }
            >
                <group
                    position={arrowButtonPosition}
                    onClick={() => handleOnChange(-1)}
                >
                    <RoundedBox {...arrowRoundedBoxProps}>
                        <meshBasicMaterial color={buttonColor} />
                    </RoundedBox>
                    <mesh
                        geometry={arrowGeometry}
                        material={arrowMaterial}
                        position={[0.05, 0, 1.1]}
                        rotation={[Math.PI / 2, -Math.PI / 2, 0]}
                        scale={[3, 1, 2]}
                    />
                </group>
                <group
                    position={
                        arrowButtonPosition.map((value) => -value) as [
                            number,
                            number,
                            number
                        ]
                    }
                    onClick={() => handleOnChange(1)}
                >
                    <RoundedBox {...arrowRoundedBoxProps}>
                        <meshBasicMaterial color={buttonColor} />
                    </RoundedBox>
                    <mesh
                        geometry={arrowGeometry}
                        material={arrowMaterial}
                        position={[-0.05, 0, 1.1]}
                        rotation={[Math.PI / 2, Math.PI / 2, 0]}
                        scale={[3, 1, 2]}
                    />
                </group>
            </group>
            <RoundedBox {...roundedBoxProps}>
                <meshBasicMaterial color={buttonColor} />
            </RoundedBox>
            <Html
                center
                transform
                distanceFactor={htmlDistanceFactor}
                className="htmlDefault"
            >
                {label && (
                    <div
                        className="labelDefault"
                        style={{ color: buttonTextColor }}
                    >
                        {label}
                    </div>
                )}
                <div
                    className="optionDefault"
                    style={{ color: buttonTextColor }}
                >
                    {options[selectedOptionIndex]}
                </div>
            </Html>
        </group>
    );
}
