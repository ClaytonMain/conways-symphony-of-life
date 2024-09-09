import * as THREE from "three";
import * as Tone from "tone";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { initialDimensions } from "../constants.tsx";
import {
    CellColors,
    CellRecord,
    CellType,
    DrumCellRecord,
    DrumType,
    NoteConfigCell,
} from "../sharedTypes.tsx";
import { defaultNoteConfigCells } from "./noteConfigs.tsx";

interface GridStoreTypes {
    dimensionX: number;
    dimensionY: number;
    cells: Record<string, CellRecord>;
    setCellState: (x: number, y: number, alive: boolean) => void;
    setCellType: (x: number, y: number, cellType: CellType) => void;
    drumCells: Record<string, DrumCellRecord>;
    setDrumCellState: (drumType: DrumType, x: number, alive: boolean) => void;
    cellColors: CellColors;
    barsPerMinute: number;
    setBarsPerMinute: (barsPerMinute: number) => void;
    notesPerBar: number;
    setNotesPerBar: (notesPerBar: number) => void;
    tpm: number;
    setTpm: (tpm: number) => void;
    currentSequenceColumn: number | null;
    animationState: "playing" | "paused";
    setAnimationState: (state: "playing" | "paused") => void;
    userHasClicked: boolean;
    audioInitialized: boolean;
    synth: Tone.PolySynth | null;
    drums: Tone.Sampler | null;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    noteConfigCells: Array<NoteConfigCell>;
    currentNoteConfigCellIndex: number;
    autoChangeActiveConfigType:
        | "sequential"
        | "true random"
        | "avoid prev random"
        | null;
    autoChangeActiveConfigEveryNNotes: number;
    handleAutoChangeActiveConfig: () => number;
    adjustingKnob: boolean;
    editingNoteIndices: [number, number] | null;
    editingNoteConfigIndex: number | null;
}

export const useGridStore = create<GridStoreTypes>()(
    subscribeWithSelector(
        immer((set, get) => ({
            dimensionX: initialDimensions[0],
            dimensionY: initialDimensions[1],
            cells: {},
            setCellState: (x: number, y: number, alive: boolean) => {
                set((state) => {
                    const cell = state.cells[`${x},${y}`];
                    cell.alive = alive;
                });
            },
            setCellType: (x: number, y: number, cellType: CellType) => {
                set((state) => {
                    const cell = state.cells[`${x},${y}`];
                    cell.cellType = cellType;
                });
            },
            drumCells: {},
            setDrumCellState: (
                drumType: DrumType,
                x: number,
                alive: boolean
            ) => {
                set((state) => {
                    const drumCell = state.drumCells[`${drumType},${x}`];
                    drumCell.alive = alive;
                });
            },
            cellColors: {
                alive: new THREE.Color("#ff8600"),
                alivePlaying: new THREE.Color("#f5ebc6"),
                aliveDisabled: new THREE.Color("#c16706"),
                dead: new THREE.Color("#413324"),
                deadDisabled: new THREE.Color("#000000"),
            },
            barsPerMinute: 50,
            setBarsPerMinute: (barsPerMinute: number) => {
                set((state) => {
                    state.barsPerMinute = barsPerMinute;
                });
            },
            notesPerBar: 4,
            setNotesPerBar: (notesPerBar: number) => {
                set((state) => {
                    state.notesPerBar = notesPerBar;
                });
            },
            tpm: 30,
            setTpm: (tpm: number) => {
                set((state) => {
                    state.tpm = tpm;
                });
            },
            currentSequenceColumn: null,
            animationState: "paused",
            setAnimationState: (state: "playing" | "paused") => {
                set((s) => {
                    s.animationState = state;
                });
            },
            userHasClicked: false,
            audioInitialized: false,
            synth: null,
            drums: null,
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
            noteConfigCells: defaultNoteConfigCells,
            currentNoteConfigCellIndex: 0,
            autoChangeActiveConfigType: "sequential",
            autoChangeActiveConfigEveryNNotes: 4,
            handleAutoChangeActiveConfig: () => {
                const {
                    autoChangeActiveConfigType,
                    currentNoteConfigCellIndex,
                    noteConfigCells,
                } = get();
                let nextIndex = null;
                if (autoChangeActiveConfigType === "sequential") {
                    let checkIndex = currentNoteConfigCellIndex;
                    for (let i = 0; i < noteConfigCells.length; i++) {
                        checkIndex = (checkIndex + 1) % noteConfigCells.length;
                        if (noteConfigCells[checkIndex].enabled) {
                            nextIndex = checkIndex;
                            break;
                        }
                    }
                    nextIndex = nextIndex ?? currentNoteConfigCellIndex;
                } else if (autoChangeActiveConfigType === "true random") {
                    const enabledIndices = noteConfigCells
                        .map((cell, index) => (cell.enabled ? index : null))
                        .filter((index) => index !== null) as number[];
                    nextIndex =
                        enabledIndices[
                            Math.floor(Math.random() * enabledIndices.length)
                        ];
                } else if (autoChangeActiveConfigType === "avoid prev random") {
                    const enabledIndices = noteConfigCells
                        .map((cell, index) => (cell.enabled ? index : null))
                        .filter((index) => index !== null) as number[];
                    const prevIndex = currentNoteConfigCellIndex;
                    const nextIndices = enabledIndices.filter(
                        (index) => index !== prevIndex
                    );
                    if (nextIndices.length === 0) {
                        nextIndex = prevIndex;
                    } else {
                        nextIndex =
                            nextIndices[
                                Math.floor(Math.random() * nextIndices.length)
                            ];
                    }
                } else if (autoChangeActiveConfigType === null) {
                    nextIndex = currentNoteConfigCellIndex;
                } else {
                    throw new Error("Invalid autoChangeActiveConfigType");
                }
                set((state) => {
                    state.currentNoteConfigCellIndex = nextIndex!;
                });
                return nextIndex!;
            },
            adjustingKnob: false,
            editingNoteIndices: null,
            editingNoteConfigIndex: null,
        }))
    )
);
