import {
    GenerateNoteConfigsProps,
    NoteAndOctave,
    NoteConfig,
    NoteConfigCell,
} from "../sharedTypes";
const initialDimensions = [16, 16];
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

const minMaxOctaves = [-4, 11];

// const notePositions: Record<Note, number> = {
//     Cb: 11,
//     C: 0,
//     "C#": 1,
//     Db: 1,
//     D: 2,
//     "D#": 3,
//     Eb: 3,
//     E: 4,
//     "E#": 5,
//     Fb: 4,
//     F: 5,
//     "F#": 6,
//     Gb: 6,
//     G: 7,
//     "G#": 8,
//     Ab: 8,
//     A: 9,
//     "A#": 10,
//     Bb: 10,
//     B: 11,
//     "B#": 0,
// };

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

function generateNoteConfigs({
    startingNote,
    numberOfNotes,
    startingOctave = 2,
    stepSizes = "major",
    enabledArray = [true, false, true, false, true, false, false],
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
            noteName: currentNote,
            octave: currentOctave,
        });
        currentNoteIndex += stepSizesArray[currentStepSizesArrayIndex];
        if (currentNoteIndex >= notes.length || currentNoteIndex < 0) {
            currentOctave +=
                (currentNoteIndex < 0 ? -1 : 1) *
                Math.floor(Math.abs(currentNoteIndex) / notes.length);
            currentNoteIndex = mod(currentNoteIndex, notes.length);
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

interface RepeatNoteConfigsProps {
    noteConfigsToRepeat: Array<NoteConfig>;
    numberOfNotes: number;
}

function repeatNoteConfigs({
    noteConfigsToRepeat,
    numberOfNotes,
}: RepeatNoteConfigsProps) {
    const noteConfigs: Array<NoteConfig> = [];
    for (let i = 0; i < numberOfNotes; i++) {
        noteConfigs.push(noteConfigsToRepeat[i % noteConfigsToRepeat.length]);
    }
    return noteConfigs;
}

interface RepeatChordSequenceProps {
    chordSequence: Array<[Note, number]>;
    numberOfNotes: number;
    maxRepeat?: number;
    startingOctave?: number;
    relativeOctaveChangeOnRepeat?: number;
    gridStartingPosition?: number;
}

function repeatChordSequence({
    chordSequence,
    numberOfNotes,
    maxRepeat = -1,
    startingOctave = 1,
    relativeOctaveChangeOnRepeat = 1,
    gridStartingPosition = 0,
}: RepeatChordSequenceProps) {
    const noteConfigs: Array<NoteConfig> = [];
    let currentOctave = startingOctave;
    let currentChordSequenceIndex = 0;
    let repeatCount = 0;

    for (let i = 0; i < gridStartingPosition; i++) {
        currentChordSequenceIndex--;
        if (currentChordSequenceIndex < 0) {
            currentOctave -= relativeOctaveChangeOnRepeat;
            currentChordSequenceIndex = chordSequence.length - 1;
        }
    }

    let noteEnabled;
    let chordNote;
    let chordRelativeOctave;
    let chordOctave;
    for (let i = 0; i < numberOfNotes; i++) {
        chordNote = chordSequence[currentChordSequenceIndex][0];
        chordRelativeOctave = chordSequence[currentChordSequenceIndex][1];
        chordOctave = Math.min(
            Math.max(currentOctave + chordRelativeOctave, minMaxOctaves[0]),
            minMaxOctaves[1]
        );
        if (i < gridStartingPosition) {
            noteEnabled = false;
        } else {
            noteEnabled = maxRepeat >= 0 ? repeatCount <= maxRepeat : true;
        }
        noteConfigs.push({
            note: `${chordNote}${chordOctave}` as NoteAndOctave,
            enabled: noteEnabled,
            noteName: chordNote,
            octave: chordOctave,
        });
        currentChordSequenceIndex++;
        if (currentChordSequenceIndex >= chordSequence.length) {
            currentOctave += relativeOctaveChangeOnRepeat;
            currentChordSequenceIndex = 0;
            if (noteEnabled) repeatCount++;
        }
    }

    // let currentOctave = startingOctave;
    // let currentNoteIndex = 0;
    // let repeatCount = 0;
    // for (let i = 0; i < startingPosition; i++) {
    //     currentNoteIndex--;
    //     if (currentNoteIndex < 0) {
    //         currentOctave--;
    //         currentNoteIndex = chordSequence.length - 1;
    //     }
    // }
    // for (let i = 0; i < numberOfNotes; i++) {
    //     noteConfigs.push({
    //         note: `${chordSequence[currentNoteIndex]}${currentOctave}` as NoteAndOctave,
    //         enabled:
    //             i >= startingPosition &&
    //             (maxRepeat > 0 ? repeatCount <= maxRepeat : true),
    //     });
    //     currentNoteIndex++;
    //     if (currentNoteIndex >= chordSequence.length) {
    //         currentOctave += increaseOctaveByOnRepeat;
    //         currentNoteIndex = 0;
    //         repeatCount++;
    //     }
    // }
    return noteConfigs;
}

export const defaultNoteConfigCells: Array<NoteConfigCell> = [
    {
        enabled: true,
        noteConfigs: repeatChordSequence({
            chordSequence: [
                ["A#", 0],
                ["F", 1],
                ["C#", 2],
                ["C#", 2],
                ["F#", 2],
            ],
            numberOfNotes: initialDimensions[1],
            startingOctave: 1,
            relativeOctaveChangeOnRepeat: 1,
        }),
    },
    {
        enabled: true,
        noteConfigs: repeatChordSequence({
            chordSequence: [
                ["B", 0],
                ["F#", 1],
                ["C#", 2],
                ["D#", 2],
                ["F#", 2],
            ],
            numberOfNotes: initialDimensions[1],
            startingOctave: 1,
            relativeOctaveChangeOnRepeat: 1,
        }),
    },
    {
        enabled: true,
        noteConfigs: repeatChordSequence({
            chordSequence: [
                ["C#", 1],
                ["G#", 1],
                ["C#", 2],
                ["F", 2],
                ["F#", 2],
            ],
            numberOfNotes: initialDimensions[1],
            startingOctave: 1,
            relativeOctaveChangeOnRepeat: 1,
        }),
    },
    {
        enabled: true,
        noteConfigs: repeatChordSequence({
            chordSequence: [
                ["D#", 1],
                ["A#", 1],
                ["C#", 2],
                ["C#", 2],
                ["F#", 2],
            ],
            numberOfNotes: initialDimensions[1],
            startingOctave: 1,
            relativeOctaveChangeOnRepeat: 1,
        }),
    },
    {
        enabled: false,
        noteConfigs: generateNoteConfigs({
            startingNote: "F",
            stepSizes: "major",
            numberOfNotes: initialDimensions[1],
        }),
    },
    {
        enabled: false,
        noteConfigs: generateNoteConfigs({
            startingNote: "F",
            stepSizes: "minor",
            numberOfNotes: initialDimensions[1],
        }),
    },
    {
        enabled: false,
        noteConfigs: repeatNoteConfigs({
            noteConfigsToRepeat: [
                { note: "A#1", enabled: true, noteName: "A#", octave: 1 },
                { note: "F2", enabled: true, noteName: "F", octave: 2 },
                { note: "C#3", enabled: true, noteName: "C#", octave: 3 },
                { note: "F#3", enabled: true, noteName: "F#", octave: 3 },
                { note: "A#3", enabled: true, noteName: "A#", octave: 3 },
                { note: "F4", enabled: true, noteName: "F", octave: 4 },
                { note: "C#5", enabled: true, noteName: "C#", octave: 5 },
                { note: "F#5", enabled: true, noteName: "F#", octave: 5 },
            ],
            numberOfNotes: initialDimensions[1],
        }),
    },
    {
        enabled: false,
        noteConfigs: repeatNoteConfigs({
            noteConfigsToRepeat: [
                { note: "B1", enabled: true, noteName: "B", octave: 1 },
                { note: "F#2", enabled: true, noteName: "F#", octave: 2 },
                { note: "C#3", enabled: true, noteName: "C#", octave: 3 },
                { note: "D#3", enabled: true, noteName: "D#", octave: 3 },
                { note: "F#3", enabled: true, noteName: "F#", octave: 3 },
                { note: "B3", enabled: true, noteName: "B", octave: 3 },
                { note: "F#4", enabled: true, noteName: "F#", octave: 4 },
                { note: "C#5", enabled: true, noteName: "C#", octave: 5 },
                { note: "D#5", enabled: true, noteName: "D#", octave: 5 },
                { note: "F#5", enabled: true, noteName: "F#", octave: 5 },
            ],
            numberOfNotes: initialDimensions[1],
        }),
    },
    {
        enabled: false,
        noteConfigs: repeatNoteConfigs({
            noteConfigsToRepeat: [
                { note: "C#2", enabled: true, noteName: "C#", octave: 2 },
                { note: "G#2", enabled: true, noteName: "G#", octave: 2 },
                { note: "C#3", enabled: true, noteName: "C#", octave: 3 },
                { note: "F3", enabled: true, noteName: "F", octave: 3 },
                { note: "F#3", enabled: true, noteName: "F#", octave: 3 },
                { note: "C#4", enabled: true, noteName: "C#", octave: 4 },
                { note: "G#4", enabled: true, noteName: "G#", octave: 4 },
                { note: "C#5", enabled: true, noteName: "C#", octave: 5 },
                { note: "F5", enabled: true, noteName: "F", octave: 5 },
                { note: "F#5", enabled: true, noteName: "F#", octave: 5 },
            ],
            numberOfNotes: initialDimensions[1],
        }),
    },
    {
        enabled: false,
        noteConfigs: repeatNoteConfigs({
            noteConfigsToRepeat: [
                { note: "D#2", enabled: true, noteName: "D#", octave: 2 },
                { note: "A#2", enabled: true, noteName: "A#", octave: 2 },
                { note: "C#3", enabled: true, noteName: "C#", octave: 3 },
                { note: "F#3", enabled: true, noteName: "F#", octave: 3 },
                { note: "D#4", enabled: true, noteName: "D#", octave: 4 },
                { note: "A#4", enabled: true, noteName: "A#", octave: 4 },
                { note: "C#5", enabled: true, noteName: "C#", octave: 5 },
                { note: "F#5", enabled: true, noteName: "F#", octave: 5 },
            ],
            numberOfNotes: initialDimensions[1],
        }),
    },
];
