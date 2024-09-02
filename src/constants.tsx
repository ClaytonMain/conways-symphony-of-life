import {
    CellStates,
    ChordQuality,
    DrumType,
    GameWrapMode,
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
export const chordQualitySteps: Record<ChordQuality, number[]> = {
    "": [0, 4, 7],
    m: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    maj7: [0, 4, 7, 11],
    m7: [0, 3, 7, 10],
    "7": [0, 4, 7, 10],
    "7sus2": [0, 2, 7, 10],
    "7sus4": [0, 5, 7, 10],
    // halfDiminished7: [0, 3, 6, 10],
    // diminished7: [0, 3, 6, 9],
    // augmented7: [0, 4, 8, 10],
    // major9: [0, 4, 7, 11, 14],
    // minor9: [0, 3, 7, 10, 14],
    // dominant9: [0, 4, 7, 10, 14],
    // halfDiminished9: [0, 3, 6, 10, 14],
    // diminished9: [0, 3, 6, 9, 14],
    // augmented9: [0, 4, 8, 10, 14],
    // major11: [0, 4, 7, 11, 14, 17],
    // minor11: [0, 3, 7, 10, 14, 17],
    // dominant11: [0, 4, 7, 10, 14, 17],
    // halfDiminished11: [0, 3, 6, 10, 14, 17],
    // diminished11: [0, 3, 6, 9, 14, 17],
    // augmented11: [0, 4, 8, 10, 14, 17],
    // major13: [0, 4, 7, 11, 14, 17, 21],
    // minor13: [0, 3, 7, 10, 14, 17, 21],
    // dominant13: [0, 4, 7, 10, 14, 17, 21],
};
// export const scaleIndexAccidentals = [
//     false,
//     true,
//     false,
//     true,
//     false,
//     false,
//     true,
//     false,
//     true,
//     false,
//     true,
//     false,
// ];
export const noteNames: Array<NoteName> = ["C", "D", "E", "F", "G", "A", "B"];
export const sequencerCellScale = 0.9;
export const aliveStates: CellStates[] = ["alive", "invincible"];

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
