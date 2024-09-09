import {
    CellStates,
    DrumType,
    GameWrapMode,
    NoteAccidental,
    NoteName,
} from "./sharedTypes";

export const initialSequencerLength = 16;
export const initialSequencerHeight = 16;
export const initialNpm = 240;
export const initialGameWrapMode: GameWrapMode = "both";
export const drumTypes: Array<DrumType> = ["Kick", "Snare", "HiHat"];
export const drumNoteMap: Record<DrumType, "A1" | "A2" | "A3"> = {
    Kick: "A1",
    Snare: "A2",
    HiHat: "A3",
};
export const sequencerScale = 0.3;
export const sequencerCellScale = 0.9;
export const aliveStates: CellStates[] = ["alive", "invincible"];
export const chordRoots: Array<`${NoteName}${NoteAccidental}`> = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];

// Old code below:
export const initialDimensions: [number, number] = [16, 16];
// export const drumTypes: Array<DrumType> = ["Kick", "Snare", "HiHat"];
export const octaves = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// export const noteNames: Array<Note> = [
//     "Cb",
//     "C",
//     "C#",
//     "Db",
//     "D",
//     "D#",
//     "Eb",
//     "E",
//     "E#",
//     "Fb",
//     "F",
//     "F#",
//     "Gb",
//     "G",
//     "G#",
//     "Ab",
//     "A",
//     "A#",
//     "Bb",
//     "B",
//     "B#",
// ];
