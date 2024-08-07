import * as THREE from "three";
import * as Tone from "tone";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { initialDimensions } from "./constants.tsx";
import { defaultNoteConfigs } from "./noteConfigs";
import {
    CellColors,
    CellRecord,
    CellType,
    DrumCellRecord,
    DrumType,
    NoteConfig,
} from "./sharedTypes";

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
    noteConfigs: Array<Array<NoteConfig>>;
    activeConfig: number;
    changeActiveConfigEveryNNotes: number;
    changeActiveConfigSequence: number[] | "random";
    changeActiveConfigSequenceCurrentIndex: number;
    setChangeActiveConfigSequence: (sequence: number[] | "random") => void;
    handleAutoChangeActiveConfig: () => number;
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
            barsPerMinute: 30,
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
            // attack: 0.41,
            attack: 0.005,
            // decay: 0.01,
            decay: 0.1,
            sustain: 0.3,
            // release: 0.75,
            release: 1,
            noteConfigs: defaultNoteConfigs,
            activeConfig: 0,
            changeActiveConfigEveryNNotes: 4,
            changeActiveConfigSequence: [0, 1, 2, 3],
            changeActiveConfigSequenceCurrentIndex: 0,
            setChangeActiveConfigSequence: (sequence: number[] | "random") => {
                if (sequence === "random") {
                    set((s) => {
                        s.changeActiveConfigSequence = sequence;
                        s.changeActiveConfigSequenceCurrentIndex = 0;
                    });
                } else {
                    set((s) => {
                        s.changeActiveConfigSequence = sequence;
                    });
                }
            },
            handleAutoChangeActiveConfig: () => {
                const changeActiveConfigSequence =
                    get().changeActiveConfigSequence;
                let changeActiveConfigSequenceCurrentIndex =
                    get().changeActiveConfigSequenceCurrentIndex;
                let activeConfig: number;
                if (changeActiveConfigSequence === "random") {
                    activeConfig = Math.floor(
                        Math.random() * get().noteConfigs.length
                    );
                    set((s) => {
                        s.activeConfig = activeConfig;
                    });
                } else {
                    changeActiveConfigSequenceCurrentIndex =
                        (changeActiveConfigSequenceCurrentIndex + 1) %
                        changeActiveConfigSequence.length;
                    activeConfig =
                        changeActiveConfigSequence[
                            changeActiveConfigSequenceCurrentIndex as number
                        ];
                    set((s) => {
                        s.changeActiveConfigSequenceCurrentIndex =
                            changeActiveConfigSequenceCurrentIndex;
                        s.activeConfig = activeConfig as number;
                    });
                }
                return activeConfig;
            },
        }))
    )
);
