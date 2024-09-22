import {
    createInstances,
    InstancedAttribute,
    useCursor,
} from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { WebGLProgramParametersWithUniforms } from "three";
import { aliveStates, colors, sequencerCellScale } from "./constants";
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
    const [cellRecord, setCellRecord] = useState(
        useGlobalStore.getState().sequencerCells[index]
    );
    const [cellEditMode, setCellEditMode] = useState(
        useGlobalStore.getState().cellEditMode
    );
    const [alive, setAlive] = useState(aliveStates.includes(cellRecord.state));
    const [playing, setPlaying] = useState(cellRecord.playing);
    const [sequenceColumnActive, setSequenceColumnActive] = useState(false);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    useEffect(() => {
        const unsubCellRecord = useGlobalStore.subscribe(
            (state) => state.sequencerCells[index],
            (value) => {
                setCellRecord(value);
            }
        );
        return () => {
            unsubCellRecord();
        };
    });
    useEffect(() => {
        const unsubCellEditMode = useGlobalStore.subscribe(
            (state) => state.cellEditMode,
            (value) => {
                setCellEditMode(value);
            }
        );
        return () => {
            unsubCellEditMode();
        };
    });
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
    useEffect(() => {
        const unsubPlayState = useGlobalStore.subscribe(
            (state) => state.playState,
            (value) => {
                if (value === "stopped") {
                    setSequenceColumnActive(false);
                }
            }
        );
        return () => {
            unsubPlayState();
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
            } else if (cellEditMode === "alive") {
                if (primaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.sequencerCells[index].state = "alive";
                    });
                }
            } else if (cellEditMode === "dead") {
                if (primaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.sequencerCells[index].state = "dead";
                    });
                }
            } else if (cellEditMode === "invincible") {
                if (primaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.sequencerCells[index].state = "invincible";
                    });
                }
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
                    ? colors.playingCell
                    : alive
                    ? colors.aliveCell
                    : sequenceColumnActive
                    ? colors.activeCell
                    : colors.deadCell
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

export default function Sequencer() {
    const [sequencerLength, setSequencerLength] = useState(
        useGlobalStore.getState().sequencerLength
    );
    const [sequencerHeight, setSequencerHeight] = useState(
        useGlobalStore.getState().sequencerHeight
    );
    const [sequencerCellKeys, setSequencerCellKeys] = useState(
        Object.keys(useGlobalStore.getState().sequencerCells)
    );

    useEffect(() => {
        const unsubSequencerLength = useGlobalStore.subscribe(
            (state) => state.sequencerLength,
            (value) => {
                setSequencerLength(value);
            }
        );
        return () => {
            unsubSequencerLength();
        };
    });
    useEffect(() => {
        const unsubSequencerHeight = useGlobalStore.subscribe(
            (state) => state.sequencerHeight,
            (value) => {
                setSequencerHeight(value);
            }
        );
        return () => {
            unsubSequencerHeight();
        };
    });
    useEffect(() => {
        const unsubSequencerCells = useGlobalStore.subscribe(
            (state) => state.sequencerCells,
            (value) => {
                for (const cellKey in value) {
                    if (!sequencerCellKeys.includes(cellKey)) {
                        setSequencerCellKeys(Object.keys(value));
                        break;
                    }
                }
            }
        );
        return () => {
            unsubSequencerCells();
        };
    });

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

    return (
        <group>
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
                {sequencerCellKeys.map((cellKey) => {
                    return (
                        <SequencerCell
                            key={cellKey}
                            index={parseInt(cellKey)}
                        />
                    );
                })}
            </SequencerCellInstances>
        </group>
    );
}
