import {
    createInstances,
    Icosahedron,
    InstancedAttribute,
    useCursor,
} from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WebGLProgramParametersWithUniforms } from "three";
import { aliveStates, sequencerCellScale } from "./constants";
import InstrumentButton from "./InstrumentButton";
import { PointerEventTypes } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

interface SequencerCellProps {
    index: number;
}

interface SequencerCellInstanceAttributes {
    specialCellState: number;
}

const [SequencerCellInstances, SequencerCellInstance] =
    createInstances<SequencerCellInstanceAttributes>();

function SequencerCell({ index }: SequencerCellProps) {
    const cellRecord = useGlobalStore((state) => state.sequencerCells[index]);
    const cellEditMode = useGlobalStore((state) => state.cellEditMode);
    const [alive, setAlive] = useState(aliveStates.includes(cellRecord.state));
    const [playing, setPlaying] = useState(cellRecord.playing);
    const [sequenceColumnActive, setSequenceColumnActive] = useState(false);
    const [hovered, setHovered] = useState(false);
    // const [sequenceRowActive, setSequenceRowActive] = useState(false);
    // const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
    //     useGlobalStore.getState().currentNoteGroupIndex
    // );
    useCursor(hovered);

    useEffect(() => {
        const unsubState = useGlobalStore.subscribe(
            (state) => state.sequencerCells[index].state,
            (value) => {
                if (aliveStates.includes(value)) {
                    setAlive(true);
                } else {
                    setAlive(false);
                }
            }
        );
        return () => {
            unsubState();
        };
    });

    useEffect(() => {
        const unsubPlaying = useGlobalStore.subscribe(
            (state) => state.sequencerCells[index].playing,
            (value) => {
                setPlaying(value);
            }
        );
        return () => {
            unsubPlaying();
        };
    });

    useEffect(() => {
        const unsubSequenceColumnActive = useGlobalStore.subscribe(
            (state) => state.currentSequencerIndex,
            (value) => {
                setSequenceColumnActive(value === cellRecord.x);
            }
        );
        return () => {
            unsubSequenceColumnActive();
        };
    });

    function handlePointerEvents({
        e,
        pointerEventType,
    }: {
        e: ThreeEvent<PointerEvent>;
        pointerEventType: PointerEventTypes;
    }) {
        const buttonsBinary = e.buttons.toString(2).padStart(5, "0");
        const primaryMouse = buttonsBinary.charAt(4) === "1";
        const secondaryMouse = buttonsBinary.charAt(3) === "1";
        const ctrlKey = e.ctrlKey;

        if (["down", "over"].includes(pointerEventType)) {
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (pointerEventType === "over") {
                setHovered(true);
            }
            if (cellEditMode === null) {
                if (primaryMouse) {
                    if (cellRecord.state !== "invincible" && ctrlKey) {
                        useGlobalStore.setState((state) => {
                            state.sequencerCells[index].state = "invincible";
                        });
                    } else if (cellRecord.state !== "alive" && !ctrlKey) {
                        useGlobalStore.setState((state) => {
                            state.sequencerCells[index].state = "alive";
                        });
                    }
                } else if (secondaryMouse && alive) {
                    useGlobalStore.setState((state) => {
                        state.sequencerCells[index].state = "dead";
                    });
                }
            } else {
                // TODO: handle non-null cellEditMode
            }
        }
        if (pointerEventType === "out") {
            setHovered(false);
        }
    }

    return (
        <SequencerCellInstance
            position={[cellRecord.x, cellRecord.y, 0]}
            scale={[sequencerCellScale, sequencerCellScale, 1]}
            specialCellState={cellRecord.state === "invincible" ? 1 : 0}
            color={
                playing
                    ? "white"
                    : alive
                    ? "yellow"
                    : sequenceColumnActive
                    ? "gray"
                    : "black"
            }
            onPointerDown={(e) =>
                handlePointerEvents({ e, pointerEventType: "down" })
            }
            onPointerOver={(e) =>
                handlePointerEvents({ e, pointerEventType: "over" })
            }
            onPointerOut={(e) =>
                handlePointerEvents({ e, pointerEventType: "out" })
            }
        />
    );
}

interface SequencerControlsProps {
    sequencerLength: number;
    sequencerHeight: number;
}

function SequencerControls({
    sequencerLength,
    sequencerHeight,
}: SequencerControlsProps) {
    function handleClear() {
        useGlobalStore.setState((state) => {
            for (const cellKey in state.sequencerCells) {
                state.sequencerCells[cellKey].state = "dead";
            }
        });
    }
    function handleRandomize() {
        useGlobalStore.setState((state) => {
            for (const cellKey in state.sequencerCells) {
                state.sequencerCells[cellKey].state =
                    Math.random() > 0.8 ? "alive" : "dead";
            }
        });
    }
    return (
        <>
            <InstrumentButton
                position={[sequencerLength - 2, sequencerHeight + 0.5, 0]}
                roundedBoxProps={{ args: [3, 1.5, 1], radius: 0.25 }}
                scale={[
                    (sequencerCellScale + 2) / 3,
                    (sequencerCellScale + 0.5) / 1.5,
                    1,
                ]}
                label="CLEAR"
                labelDistanceFactor={20}
                onClick={() => handleClear()}
            />
            <InstrumentButton
                position={[sequencerLength - 5, sequencerHeight + 0.5, 0]}
                roundedBoxProps={{ args: [3, 1.5, 1], radius: 0.25 }}
                scale={[
                    (sequencerCellScale + 2) / 3,
                    (sequencerCellScale + 0.5) / 1.5,
                    1,
                ]}
                label="RAND"
                labelDistanceFactor={20}
                onClick={() => handleRandomize()}
            />
        </>
    );
}

export default function Sequencer() {
    const sequencerLength = useGlobalStore((state) => state.sequencerLength);
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
    const sequencerCells = useGlobalStore((state) => state.sequencerCells);

    function modifyShader(
        shader: WebGLProgramParametersWithUniforms
    ): WebGLProgramParametersWithUniforms {
        shader.vertexShader = shader.vertexShader.replace(
            "void main() {",
            `attribute float specialCellState;
varying float vSpecialCellState;
varying vec2 vUv;
void main() {
    vSpecialCellState = specialCellState;
    vUv = uv;`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            `void main() {
\tvec4 diffuseColor = vec4( diffuse, opacity );`,
            `varying float vSpecialCellState;
varying vec2 vUv;
void main() {
    float strength = step(vSpecialCellState == 1.0 ? 0.2 : 0.0, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    vec4 diffuseColor = vec4( diffuse * vec3(strength), opacity );`
        );
        return shader;
    }

    const ref = useRef<THREE.Mesh>(null!);
    useFrame((_, delta) => {
        ref.current.rotation.x += 2.0 * delta;
        ref.current.rotation.y += 1.0 * delta;
        ref.current.rotation.z += 0.5 * delta;
    });

    return (
        <group>
            <Icosahedron
                ref={ref}
                position={[0, sequencerHeight + 5, 0]}
                scale={2}
            >
                <meshStandardMaterial
                    color="lightblue"
                    roughness={0.2}
                    metalness={0.7}
                />
            </Icosahedron>
            <SequencerCellInstances limit={sequencerLength * sequencerHeight}>
                <planeGeometry />
                <meshBasicMaterial
                    onBeforeCompile={(shader) =>
                        (shader = modifyShader(shader))
                    }
                />
                <InstancedAttribute
                    name="specialCellState"
                    defaultValue={0}
                />
                {Object.keys(sequencerCells).map((cellKey) => (
                    <SequencerCell
                        key={cellKey}
                        index={parseInt(cellKey)}
                    />
                ))}
            </SequencerCellInstances>
            <SequencerControls
                sequencerLength={sequencerLength}
                sequencerHeight={sequencerHeight}
            />
        </group>
    );
}
