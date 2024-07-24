import * as THREE from "three";
import * as Tone from "tone";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { defaultNoteConfigs } from "./noteConfigs";
import { CellRecord, NoteConfig } from "./sharedTypes";

interface GridStoreTypes {
    dimensionX: number;
    dimensionY: number;
    cells: Record<string, CellRecord>;
    setCellState: (x: number, y: number, alive: boolean) => void;
    cellColors: {
        alive: THREE.Color;
        aliveHover: THREE.Color;
        alivePlaying: THREE.Color;
        dead: THREE.Color;
        deadHover: THREE.Color;
    };
    bpm: number;
    setBpm: (bpm: number) => void;
    cellsPerBeat: number;
    setCellsPerBeat: (cellsPerBeat: number) => void;
    tpm: number;
    setTpm: (tpm: number) => void;
    currentSequenceColumn: number | null;
    animationState: "playing" | "paused";
    setAnimationState: (state: "playing" | "paused") => void;
    userHasClicked: boolean;
    audioInitialized: boolean;
    synth: Tone.PolySynth | null;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    noteConfigs: Array<Array<NoteConfig>>;
}

const initialDimensions: [number, number] = [32, 25];

export const useGridStore = create<GridStoreTypes>()(
    subscribeWithSelector(
        // @ts-expect-error SILENCE
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
            cellColors: {
                alive: new THREE.Color("#ffaa33"),
                aliveHover: new THREE.Color("#bb6622"),
                alivePlaying: new THREE.Color("#ffcc88"),
                dead: new THREE.Color("#000000"),
                deadHover: new THREE.Color("#774411"),
            },
            bpm: 120,
            setBpm: (bpm: number) => {
                set((state) => {
                    state.bpm = bpm;
                });
            },
            cellsPerBeat: 4,
            setCellsPerBeat: (cellsPerBeat: number) => {
                set((state) => {
                    state.cellsPerBeat = cellsPerBeat;
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
            attack: 0.41,
            decay: 0.01,
            sustain: 0.24,
            release: 0.75,
            noteConfigs: defaultNoteConfigs,
        }))
    )
);
