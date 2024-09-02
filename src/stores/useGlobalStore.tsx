import * as Tone from "tone";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    initialGameWrapMode,
    initialNpm,
    initialSequencerHeight,
    initialSequencerLength,
} from "../constants.tsx";
import { initializeSequencerCells } from "../gameOfLifeFunctions.tsx";
import { initializeDrumCells } from "../instrumentFunctions.tsx";
import { initializeNoteGroups } from "../noteGroupFunctions.tsx";
import {
    CellEditMode,
    DrumCell,
    GameWrapMode,
    NoteGroupCell,
    PlayStateType,
    SequencerCell,
    VoiceMode,
    Waveform,
} from "../sharedTypes.tsx";

interface GlobalStoreTypes {
    userHasClicked: boolean;
    playState: PlayStateType;
    sequencerLength: number;
    sequencerHeight: number;
    npm: number;
    npt: number | null; // Notes per tick.
    npg: number | null; // Notes per group.
    gameWrapMode: GameWrapMode;
    currentSequencerIndex: number | null;
    sequencerCells: Record<number, SequencerCell>;
    drumCells: Array<Array<DrumCell>>;
    currentNoteGroupIndex: number;
    noteGroupChangeMode:
        | "sequential"
        | "true random"
        | "avoid prev random"
        | null;
    noteGroupCells: NoteGroupCell[];
    globallyEnabledSequencerRows: boolean[];
    synth: Tone.PolySynth | Tone.MonoSynth | null;
    drumSampler: Tone.Sampler | null;
    voiceMode: VoiceMode;
    waveform: Waveform;
    synthVolume: number;
    drumsVolume: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    cellsIgnorePointerEvents: boolean;
    cellEditMode: CellEditMode;
    _placeholderValue: null;
    _placeholderSet: () => void;
    _placeholderGet: () => null;
}

export const useGlobalStore = create<GlobalStoreTypes>()(
    subscribeWithSelector(
        immer((set, get) => ({
            userHasClicked: false,
            playState: "stopped",
            sequencerLength: initialSequencerLength,
            sequencerHeight: initialSequencerHeight,
            npm: initialNpm,
            npt: 4,
            npg: 4,
            currentSequencerIndex: null,
            gameWrapMode: initialGameWrapMode,
            sequencerCells: initializeSequencerCells(
                initialSequencerLength,
                initialSequencerHeight,
                initialGameWrapMode
            ),
            drumCells: initializeDrumCells(initialSequencerLength),
            currentNoteGroupIndex: 0,
            noteGroupChangeMode: "sequential",
            noteGroupCells: initializeNoteGroups(
                initialSequencerLength,
                initialSequencerHeight
            ),
            globallyEnabledSequencerRows: Array(initialSequencerHeight).fill(
                true
            ),
            synth: null,
            drumSampler: null,
            voiceMode: "poly",
            waveform: "sine",
            synthVolume: -10,
            drumsVolume: 0,
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
            cellsIgnorePointerEvents: false,
            cellEditMode: null,
            _placeholderValue: null,
            _placeholderSet: () => {
                set((state) => {
                    state._placeholderValue = null;
                });
            },
            _placeholderGet: () => get()._placeholderValue,
        }))
    )
);
