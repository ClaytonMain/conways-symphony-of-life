import * as Tone from "tone";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    initialGameWrapMode,
    initialNpm,
    initialSequencerHeight,
    initialSequencerLength,
    volumeOptions,
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
    NoteGroupSelectMode,
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
    npg: number; // Notes per group.
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
    drumDuration: number;
    cellsIgnorePointerEvents: boolean;
    cellEditMode: CellEditMode;
    noteGroupSelectMode: NoteGroupSelectMode;
    drumEditMode: DrumEditMode;
    pivotControlsEnabled: boolean;
    startingCells: Record<number, SequencerCell>;
    noteGroupCellHeight: number;
    noteGroupCellXOffset: number;
    showValueChangeDisplay: boolean;
    displayLabel: string | number | null;
    displayValue: string | number | null;
    showNoteGroupEditDisplay: boolean;
    editingNoteGroups: boolean;
    pendingNoteGroup: NoteGroupCell | null;
    playingNoteGroupNotesTimestamp: number | null;
    cameraControlsEnabled: boolean;
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
            noteGroupCells: initializeNoteGroups(10, initialSequencerHeight),
            globallyEnabledSequencerRows: Array(initialSequencerHeight).fill(
                true
            ),
            synth: null,
            drumSampler: null,
            equalizer: null,
            voiceMode: "poly",
            waveform: "sine",
            synthVolume: volumeOptions[6],
            drumsVolume: volumeOptions[7],
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5,
            noteDuration: 0.2,
            drumDuration: 0.2,
            // release: 1,
            cellsIgnorePointerEvents: true,
            cellEditMode: null,
            noteGroupSelectMode: null,
            drumEditMode: null,
            pivotControlsEnabled: false,
            startingCells: {},
            noteGroupCellHeight: ((initialSequencerHeight + 4) / 10) * 2,
            noteGroupCellXOffset: 4.5,
            showValueChangeDisplay: false,
            displayLabel: null,
            displayValue: null,
            showNoteGroupEditDisplay: false,
            editingNoteGroups: false,
            pendingNoteGroup: null,
            playingNoteGroupNotesTimestamp: null,
            cameraControlsEnabled: true,
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
