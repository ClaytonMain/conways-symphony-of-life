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
import { initializeNoteGroups } from "../noteGroupFunctions.tsx";
import {
    CellEditMode,
    DrumCell,
    DrumEditMode,
    GameWrapMode,
    NoteGroupCell,
    NoteGroupChangeMode,
    NoteGroupEditMode,
    PlayStateType,
    SequencerCell,
    VoiceMode,
    Waveform,
} from "../sharedTypes.tsx";
import { initializeDrumCells } from "../synthAndDrumFunctions.tsx";

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
    noteGroupChangeMode: NoteGroupChangeMode;
    noteGroupCells: NoteGroupCell[];
    globallyEnabledSequencerRows: boolean[];
    synth: Tone.PolySynth | Tone.MonoSynth | null;
    drumSampler: Tone.Sampler | null;
    equalizer: Tone.EQ3 | null;
    voiceMode: VoiceMode;
    waveform: Waveform;
    synthVolume: number;
    drumsVolume: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    noteDuration: number;
    cellsIgnorePointerEvents: boolean;
    cellEditMode: CellEditMode;
    noteGroupEditMode: NoteGroupEditMode;
    drumEditMode: DrumEditMode;
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
            npt: 1,
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
            noteGroupCells: initializeNoteGroups(10, initialSequencerHeight),
            globallyEnabledSequencerRows: Array(initialSequencerHeight).fill(
                true
            ),
            synth: null,
            drumSampler: null,
            equalizer: null,
            voiceMode: "poly",
            waveform: "sine",
            synthVolume: -10,
            drumsVolume: -6,
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5,
            noteDuration: 0.2,
            // release: 1,
            cellsIgnorePointerEvents: false,
            cellEditMode: null,
            noteGroupEditMode: null,
            drumEditMode: null,
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
