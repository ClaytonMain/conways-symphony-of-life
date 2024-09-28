import { FrequencyClass } from "tone";
import { Note } from "tone/build/esm/core/type/Units";

export type PlayStateType = "playing" | "paused" | "stopped";
export type GameWrapMode = "both" | "x" | "y" | "none";
export type DrumType = "Kick" | "Snare" | "HiHat";
export type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type NoteAccidental = "b" | "#" | "";
export type NoteOctave =
    | -4
    | -3
    | -2
    | -1
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11;

export type VoiceMode =
    | "poly"
    | "monotop"
    | "monomid"
    | "monobottom"
    | "monorandom";
export type Waveform = "sine" | "square" | "triangle" | "sawtooth";

export interface SequencerCell {
    x: number;
    y: number;
    neighborAddresses: number[];
    state: CellStates;
    playing: boolean;
}

export interface DrumCell {
    alive: boolean;
    drumType: DrumType;
}

export interface NoteGroupNote {
    note: Note;
    frequency: FrequencyClass<number>;
    noteGroupRowEnabled: boolean;
    globalRowEnabled: boolean;
}

export interface NoteGroupCell {
    enabled: boolean;
    active: boolean;
    notes: NoteGroupNote[];
    root: `${NoteName}${NoteAccidental}`;
    semitones: number[];
    octaveStart: NoteOctave;
    octaveIncrement: number;
    enabledRows: boolean[];
}

export type CellStates = "alive" | "dead" | "invincible";
export type CellEditMode = CellStates | null;
export type NoteGroupChangeMode =
    | "sequential"
    | "true random"
    | "avoid prev random"
    | null;
export type NoteGroupSelectMode = "toggle" | "activate" | null;
export type PointerEventTypes = "down" | "over" | "out";
export type DrumEditMode = "alive" | "dead" | null;
export type DisplayVariant = "show" | "hideSlow" | "hideFast";
export type SynthCheckIfPlay = {
    key: number;
    noteIndex: number;
    played: boolean;
};

export enum ShortcutEnum {
    space = "space",
    key1 = "key1",
    key2 = "key2",
    key3 = "key3",
    key4 = "key4",
    key5 = "key5",
    key6 = "key6",
    key7 = "key7",
    key8 = "key8",
    key9 = "key9",
    key0 = "key0",
}
