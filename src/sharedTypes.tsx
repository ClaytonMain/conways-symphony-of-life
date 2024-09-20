import { NamedArrayTuple } from "@react-three/drei/helpers/ts-utils";
import * as THREE from "three";
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
// export type Note = `${NoteName}${NoteAccidental}${NoteOctave}`;
export type ChordQuality =
    | "" // Major triad
    | "m" // Minor triad
    | "dim" // Diminished triad
    | "aug" // Augmented triad
    | "sus2" // Suspended 2nd
    | "sus4" // Suspended 4th
    | "maj7" // Major 7th
    | "m7" // Minor 7th
    | "7" // Dominant 7th
    | "7sus2" // Dominant 7th suspended 2nd
    | "7sus4" // Dominant 7th suspended 4th
    | "add9" // Add 9th
    | "9sus4"; // 9th suspended 4th

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
export type noteGroupSelectMode = "toggle" | "activate" | null;
export type PointerEventTypes = "down" | "over" | "out";
export type DrumEditMode = "alive" | "dead" | null;
export type RoundedBoxProps = {
    args?: NamedArrayTuple<
        (width?: number, height?: number, depth?: number) => void
    >;
    radius?: number;
    smoothness?: number;
    bevelSegments?: number;
    steps?: number;
    creaseAngle?: number;
};
export type DisplayVariant = "show" | "hideSlow" | "hideFast";

// Old code below:
export interface CellRecord {
    x: number;
    y: number;
    alive: boolean;
    neighborAddresses: string[];
    cellType: CellType;
}

export interface DrumCellRecord {
    x: number;
    y: number;
    alive: boolean;
    drumType: DrumType;
}

// export type Note =
//     | "Cb"
//     | "C"
//     | "C#"
//     | "Db"
//     | "D"
//     | "D#"
//     | "Eb"
//     | "E"
//     | "E#"
//     | "Fb"
//     | "F"
//     | "F#"
//     | "Gb"
//     | "G"
//     | "G#"
//     | "Ab"
//     | "A"
//     | "A#"
//     | "Bb"
//     | "B"
//     | "B#";

export interface GenerateNoteConfigsProps {
    startingNote: Note;
    numberOfNotes: number;
    startingOctave?: number;
    stepSizes?: "major" | "minor" | Array<number> | number;
    enabledArray?: Array<boolean>;
}

export type NoteAndOctave = string;

export interface NoteConfig {
    note: NoteAndOctave;
    enabled: boolean;
    noteName: Note;
    octave: number;
}

export interface CellColors {
    alive: THREE.Color;
    alivePlaying: THREE.Color;
    aliveDisabled: THREE.Color;
    dead: THREE.Color;
    deadDisabled: THREE.Color;
}

export type CellType = "normal" | "invincible";

// export type DrumType = "Kick" | "Snare" | "HiHat";

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

export interface NoteConfigCell {
    enabled: boolean;
    noteConfigs: Array<NoteConfig>;
}
