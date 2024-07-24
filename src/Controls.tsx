import { button, useControls } from "leva";
import * as Tone from "tone";
import { CellRecord } from "./sharedTypes";
import { useGridStore } from "./useGridStore";

export default function Controls() {
    const setAnimationState = useGridStore((state) => state.setAnimationState);
    const setBpm = useGridStore((state) => state.setBpm);
    const setCellsPerBeat = useGridStore((state) => state.setCellsPerBeat);
    const setTpm = useGridStore((state) => state.setTpm);

    function handleBpmChange(value: number) {
        setBpm(value);
        Tone.getTransport().bpm.value = value;
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
            setAnimationState("paused");
            const cells = useGridStore.getState().cells;
            const modifiedCells: Record<string, CellRecord> = {};
            for (const cellAddress in cells) {
                const alive = Math.random() > 0.9;
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
        BPM: {
            value: useGridStore.getState().bpm,
            min: 30,
            max: 360,
            step: 1,
            onEditEnd: handleBpmChange,
        },
        "Cells Per Beat": {
            value: useGridStore.getState().cellsPerBeat,
            min: 1,
            max: 32,
            step: 1,
            onEditEnd: (value) => setCellsPerBeat(value),
        },
        TPM: {
            value: useGridStore.getState().tpm,
            min: 60,
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
    }));
    return null;
}
