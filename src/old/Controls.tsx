import { useKeyboardControls } from "@react-three/drei";
import { button, useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";
import * as Tone from "tone";
import Knob from "../Knob";
import { CellRecord, ShortcutEnum } from "../sharedTypes";
import { useGridStore } from "./useGridStore";

interface ControlsProps {
    instrumentScale?: number;
}
export default function Controls({ instrumentScale = 1 }: ControlsProps) {
    const setAnimationState = useGridStore((state) => state.setAnimationState);
    const setBarsPerMinute = useGridStore((state) => state.setBarsPerMinute);
    const setNotesPerBar = useGridStore((state) => state.setNotesPerBar);
    const notesPerBar = useGridStore((state) => state.notesPerBar);
    const cellColors = useGridStore.getState().cellColors;
    const dimensionY = useGridStore((state) => state.dimensionY);

    function handleBarsPerMinuteChange(value: number) {
        setBarsPerMinute(value);
        Tone.getTransport().bpm.value = value * notesPerBar;
    }

    const [subscribeKeys] = useKeyboardControls<ShortcutEnum>();

    useEffect(() => {
        const unsubscribeSpace = subscribeKeys(
            (state) => state.space,
            (pressed) => {
                const animationState = useGridStore.getState().animationState;
                const userHasClicked = useGridStore.getState().userHasClicked;
                if (pressed && userHasClicked) {
                    setAnimationState(
                        animationState === "playing" ? "paused" : "playing"
                    );
                }
            }
        );
        return () => {
            unsubscribeSpace();
        };
    });

    function handleCellColorChange(
        color: string,
        key:
            | "alive"
            | "alivePlaying"
            | "aliveDisabled"
            | "dead"
            | "deadDisabled"
    ) {
        useGridStore.setState((state) => {
            state.cellColors[key] = new THREE.Color(color);
        });
    }

    useControls(() => ({
        "Clear Grid": button(() => {
            setAnimationState("paused");
            const cells = useGridStore.getState().cells;
            const modifiedCells: Record<string, CellRecord> = {};
            for (const cellAddress in cells) {
                if (cells[cellAddress].alive) {
                    modifiedCells[cellAddress] = {
                        ...cells[cellAddress],
                        alive: false,
                        cellType: "normal",
                    };
                } else if (cells[cellAddress].cellType === "invincible") {
                    modifiedCells[cellAddress] = {
                        ...cells[cellAddress],
                        cellType: "normal",
                    };
                }
            }
            useGridStore.setState((state) => {
                state.cells = {
                    ...state.cells,
                    ...modifiedCells,
                };
            });
        }),
        "Randomize Grid": button(() => {
            // setAnimationState("paused");
            const cells = useGridStore.getState().cells;
            const modifiedCells: Record<string, CellRecord> = {};
            for (const cellAddress in cells) {
                const alive = Math.random() > 0.8;
                if (cells[cellAddress].alive !== alive) {
                    modifiedCells[cellAddress] = {
                        ...cells[cellAddress],
                        alive,
                    };
                }
            }
            useGridStore.setState((state) => {
                state.cells = {
                    ...state.cells,
                    ...modifiedCells,
                };
            });
        }),
        "Set Diagonal Ascending": button(() => {
            const cells = useGridStore.getState().cells;
            const modifiedCells: Record<string, CellRecord> = {};
            for (const cellAddress in cells) {
                const [x, y] = cellAddress.split(",").map(Number);
                if (x === y) {
                    modifiedCells[cellAddress] = {
                        ...cells[cellAddress],
                        alive: true,
                    };
                } else if (cells[cellAddress].alive) {
                    modifiedCells[cellAddress] = {
                        ...cells[cellAddress],
                        alive: false,
                    };
                }
            }
            useGridStore.setState((state) => {
                state.cells = {
                    ...state.cells,
                    ...modifiedCells,
                };
            });
        }),
        "Notes Per Bar": {
            value: useGridStore.getState().notesPerBar,
            min: 1,
            max: 16,
            step: 1,
            onChange: (value) => setNotesPerBar(value),
        },
        attack: {
            value: useGridStore.getState().attack,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => useGridStore.setState({ attack: value }),
        },
        decay: {
            value: useGridStore.getState().decay,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => useGridStore.setState({ decay: value }),
        },
        sustain: {
            value: useGridStore.getState().sustain,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => useGridStore.setState({ sustain: value }),
        },
        release: {
            value: useGridStore.getState().release,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (value) => useGridStore.setState({ release: value }),
        },
        "Alive Color": {
            value: `#${cellColors.alive.getHexString()}`,
            onChange: (color) => handleCellColorChange(color, "alive"),
        },
        "Alive Playing Color": {
            value: `#${cellColors.alivePlaying.getHexString()}`,
            onChange: (color) => handleCellColorChange(color, "alivePlaying"),
        },
        "Alive Disabled Color": {
            value: `#${cellColors.aliveDisabled.getHexString()}`,
            onChange: (color) => handleCellColorChange(color, "aliveDisabled"),
        },
        "Dead Color": {
            value: `#${cellColors.dead.getHexString()}`,
            onChange: (color) => handleCellColorChange(color, "dead"),
        },
        "Dead Disabled Color": {
            value: `#${cellColors.deadDisabled.getHexString()}`,
            onChange: (color) => handleCellColorChange(color, "deadDisabled"),
        },
    }));
    return (
        <>
            <group position={[0, -dimensionY * instrumentScale * 2, 0]}>
                <group
                    onClick={() => setAnimationState("playing")}
                    position={[-2, 0, 0]}
                    scale={1.5}
                >
                    <mesh
                        position={[0, 0, -0.01]}
                        visible={false}
                    >
                        <planeGeometry args={[1, 1]} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
                        <cylinderGeometry
                            args={[0, 1 / Math.sqrt(3), 1, 3, 1]}
                        />
                        <meshBasicMaterial color={"#413324"} />
                    </mesh>
                </group>
                <group
                    onClick={() => setAnimationState("paused")}
                    position={[0, 0, 0]}
                    scale={1.5}
                >
                    <mesh
                        position={[0, 0, -0.01]}
                        visible={false}
                    >
                        <planeGeometry args={[1, 1]} />
                    </mesh>
                    <mesh position={[-0.25, 0, 0]}>
                        <planeGeometry args={[0.25, 1]} />
                        <meshBasicMaterial color={"#413324"} />
                    </mesh>
                    <mesh position={[0.25, 0, 0]}>
                        <planeGeometry args={[0.25, 1]} />
                        <meshBasicMaterial color={"#413324"} />
                    </mesh>
                </group>
                <Knob
                    position={[-6, -3, 0]}
                    minValue={10}
                    maxValue={100}
                    onChange={(value) => handleBarsPerMinuteChange(value)}
                    label="Bars / Minute"
                    startValue={30}
                />
                <Knob
                    position={[-2, -3, 0]}
                    minValue={10}
                    maxValue={100}
                    onDragEnd={(value) => {
                        useGridStore.setState({ tpm: value });
                    }}
                    label="Ticks / Minute"
                    startValue={30}
                />
            </group>
        </>
    );
}
