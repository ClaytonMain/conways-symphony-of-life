import { GenerateNoteConfigsProps, Note, NoteConfig } from "./sharedTypes";

const notes: Note[] = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
];

export function generateNoteConfigs({
    startingNote,
    startingOctave = 2,
    numberOfNotes = 25,
    stepSizes = "major",
    enabledArray = [
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
    ],
}: GenerateNoteConfigsProps) {
    const stepSizesArray = Array.isArray(stepSizes)
        ? stepSizes
        : stepSizes === "major"
        ? [2, 2, 1, 2, 2, 2, 1]
        : stepSizes === "minor"
        ? [2, 1, 2, 2, 1, 2, 2]
        : [stepSizes];
    const noteConfigs: Array<NoteConfig> = [];
    let currentNote = startingNote;
    let currentNoteIndex = notes.indexOf(startingNote);
    let currentOctave = startingOctave;
    let currentEnabledIndex = 0;
    let currentStepSizesArrayIndex = 0;
    for (let i = 0; i < numberOfNotes; i++) {
        noteConfigs.push({
            note: `${currentNote}${currentOctave}` as Note,
            enabled: enabledArray[currentEnabledIndex],
        });
        currentNoteIndex += stepSizesArray[currentStepSizesArrayIndex];
        if (currentNoteIndex >= notes.length) {
            currentNoteIndex -= notes.length;
            currentOctave++;
        }
        currentNote = notes[currentNoteIndex];
        currentEnabledIndex++;
        currentStepSizesArrayIndex++;
        if (currentEnabledIndex >= enabledArray.length) currentEnabledIndex = 0;
        if (currentStepSizesArrayIndex >= stepSizesArray.length)
            currentStepSizesArrayIndex = 0;
    }
    return noteConfigs;
}

export const defaultNoteConfigs: Array<Array<NoteConfig>> = [
    generateNoteConfigs({
        startingNote: "C",
        stepSizes: "major",
    }),
];
