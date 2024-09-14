import { Html, useCursor } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";
import {
    arrowGeometry,
    arrowMaterial,
    buttonMaterial,
    genericBoxGeometry,
} from "../constants";
import "./Controls.css";

interface StyleProps {
    color?: string;
    fontSize?: string;
    width?: string;
}

interface InstrumentArrowSelectProps {
    position?: [number, number, number] | THREE.Vector3;
    orientation?: "horizontal" | "vertical";
    groupScale?: [number, number, number] | THREE.Vector3 | number;
    centerScale?: [number, number, number] | THREE.Vector3 | number;
    buttonScale?: [number, number, number] | THREE.Vector3 | number;
    arrowScale?: [number, number, number] | THREE.Vector3 | number;
    labelScale?: [number, number, number] | THREE.Vector3 | number;
    optionScale?: [number, number, number] | THREE.Vector3 | number;
    label?: string;
    options?: Array<string | number>;
    htmlDistanceFactor?: number;
    startingOptionIndex?: number;
    onChange?: ((value: string | number) => void) | undefined;
    labelStyle?: StyleProps;
    optionStyle?: StyleProps;
}

export default function InstrumentArrowSelect({
    position = [0, 0, 0],
    orientation = "horizontal",
    groupScale = 1,
    centerScale = [2.0, 1.5, 1.0],
    buttonScale = [1.0, 1.5, 1.0],
    arrowScale = [3.0, 1.0, 2.5],
    labelScale = 1,
    optionScale = 1,
    label = "",
    options = [],
    htmlDistanceFactor = 15,
    startingOptionIndex = 0,
    onChange = undefined,
    labelStyle = {
        color: "white",
        fontSize: "0.4rem",
    },
    optionStyle = {
        color: "white",
        fontSize: "1.1rem",
    },
}: InstrumentArrowSelectProps) {
    const [hovered, setHovered] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] =
        useState(startingOptionIndex);
    useCursor(hovered);

    function getScaleArray(
        scale: number | THREE.Vector3 | [number, number, number]
    ) {
        return (
            Array.isArray(scale)
                ? scale
                : typeof scale === "number"
                ? [scale, scale, scale]
                : scale.toArray()
        ) as [number, number, number];
    }
    const scaleArrays = {
        group: getScaleArray(groupScale),
        center: getScaleArray(centerScale),
        button: getScaleArray(buttonScale),
        arrow: getScaleArray(arrowScale),
        label: getScaleArray(labelScale),
        option: getScaleArray(optionScale),
    };

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
            ? -scaleArrays.center[0] / 2 - scaleArrays.button[0] / 2 - 0.1
            : -scaleArrays.center[1] / 2 - scaleArrays.button[0] / 2 - 0.1,
        0,
        0,
    ];

    useEffect(() => {
        setSelectedOptionIndex(startingOptionIndex);
    }, [startingOptionIndex]);

    return (
        <group
            position={position}
            scale={scaleArrays.group}
        >
            <group
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                rotation={
                    orientation === "vertical" ? [0, 0, Math.PI / 2] : [0, 0, 0]
                }
            >
                {/* Left / bottom arrow group */}
                <group
                    position={arrowButtonPosition}
                    onClick={() => handleOnChange(-1)}
                >
                    <mesh
                        geometry={genericBoxGeometry}
                        material={buttonMaterial}
                        scale={scaleArrays.button}
                    />
                    <mesh
                        geometry={arrowGeometry}
                        material={arrowMaterial}
                        position={[0.05, 0, 1.1]}
                        rotation={[Math.PI / 2, -Math.PI / 2, 0]}
                        scale={scaleArrays.arrow}
                    />
                </group>
                {/* Right / top arrow group */}
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
                    <mesh
                        geometry={genericBoxGeometry}
                        material={buttonMaterial}
                        scale={scaleArrays.button}
                    />
                    <mesh
                        geometry={arrowGeometry}
                        material={arrowMaterial}
                        position={[-0.05, 0, 1.1]}
                        rotation={[Math.PI / 2, Math.PI / 2, 0]}
                        scale={scaleArrays.arrow}
                    />
                </group>
            </group>
            {/* Center group */}
            <group>
                <mesh
                    geometry={genericBoxGeometry}
                    material={buttonMaterial}
                    scale={scaleArrays.center}
                />
                <Html
                    transform
                    distanceFactor={htmlDistanceFactor}
                    className="arrow-select-container"
                >
                    {label && (
                        <div
                            className="arrow-select-label"
                            style={{
                                ...labelStyle,
                                scale: scaleArrays.label.slice(0, 2).join(", "),
                            }}
                        >
                            {label}
                        </div>
                    )}
                    <div
                        className="arrow-select-option"
                        style={{
                            ...optionStyle,
                            scale: scaleArrays.option.slice(0, 2).join(", "),
                        }}
                    >
                        {options[selectedOptionIndex]}
                    </div>
                </Html>
            </group>
        </group>
    );
}
