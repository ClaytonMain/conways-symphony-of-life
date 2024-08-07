import * as THREE from "three";

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

export type Note =
    | "Cb"
    | "C"
    | "C#"
    | "Db"
    | "D"
    | "D#"
    | "Eb"
    | "E"
    | "E#"
    | "Fb"
    | "F"
    | "F#"
    | "Gb"
    | "G"
    | "G#"
    | "Ab"
    | "A"
    | "A#"
    | "Bb"
    | "B"
    | "B#";

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
}

export interface CellColors {
    alive: THREE.Color;
    alivePlaying: THREE.Color;
    aliveDisabled: THREE.Color;
    dead: THREE.Color;
    deadDisabled: THREE.Color;
}

export type CellType = "normal" | "invincible";

export type DrumType = "Kick" | "Snare" | "HiHat";
