export interface CellRecord {
    x: number;
    y: number;
    alive: boolean;
    neighborAddresses: string[];
}

export type Note =
    | "C"
    | "Db"
    | "D"
    | "Eb"
    | "E"
    | "F"
    | "F#"
    | "G"
    | "Ab"
    | "A"
    | "Bb"
    | "B";

export interface GenerateNoteConfigsProps {
    startingNote: Note;
    startingOctave?: number;
    numberOfNotes?: number;
    stepSizes?: "major" | "minor" | Array<number> | number;
    enabledArray?: Array<boolean>;
}

export interface NoteConfig {
    note: Note;
    enabled: boolean;
}
