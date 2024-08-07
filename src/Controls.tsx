import { button, useControls } from "leva";
import * as THREE from "three";
import * as Tone from "tone";
import { CellRecord } from "./sharedTypes";
import { useGridStore } from "./useGridStore";

export default function Controls() {
    const setAnimationState = useGridStore((state) => state.setAnimationState);
    const setBarsPerMinute = useGridStore((state) => state.setBarsPerMinute);
    const setNotesPerBar = useGridStore((state) => state.setNotesPerBar);
    const notesPerBar = useGridStore((state) => state.notesPerBar);
    const setTpm = useGridStore((state) => state.setTpm);
    const cellColors = useGridStore.getState().cellColors;

    function handleBarsPerMinuteChange(value: number) {
        setBarsPerMinute(value);
        Tone.getTransport().bpm.value = value * notesPerBar;
    }

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
        Play: button(() => setAnimationState("playing")),
        Pause: button(() => setAnimationState("paused")),
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
        "Bars Per Minute": {
            value: useGridStore.getState().barsPerMinute,
            min: 30,
            max: 360,
            step: 1,
            onEditEnd: handleBarsPerMinuteChange,
        },
        "Notes Per Bar": {
            value: useGridStore.getState().notesPerBar,
            min: 1,
            max: 16,
            step: 1,
            onChange: (value) => setNotesPerBar(value),
        },
        TPM: {
            value: useGridStore.getState().tpm,
            min: 0,
            max: 360,
            step: 1,
            onEditEnd: (value) => setTpm(value),
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
    return null;
}
