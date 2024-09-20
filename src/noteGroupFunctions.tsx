import { Frequency, FrequencyClass } from "tone";
import {
    NoteAccidental,
    NoteGroupCell,
    NoteGroupNote,
    NoteName,
    NoteOctave,
} from "./sharedTypes";

export function generateNoteGroupNotes(
    sequencerHeight: number,
    root: `${NoteName}${NoteAccidental}`,
    semitones: number[],
    octaveStart: NoteOctave,
    octaveIncrement: number
) {
    const groupNotes: NoteGroupNote[] = [];
    const initialFrequency: FrequencyClass<number> = Frequency(
        `${root}${octaveStart}`
    );
    let currentChordStepIndex = 0;
    let currentOctave: NoteOctave = octaveStart;
    let octaveDelta: number = 0;
    let thisFrequency: FrequencyClass<number> = initialFrequency;
    for (let i = 0; i < sequencerHeight; i++) {
        thisFrequency = initialFrequency.transpose(
            octaveDelta * 12 + semitones[currentChordStepIndex]
        );
        groupNotes.push({
            note: thisFrequency.toNote(),
            frequency: thisFrequency,
            noteGroupRowEnabled: true,
            globalRowEnabled: true,
        });
        currentChordStepIndex++;
        if (currentChordStepIndex >= semitones.length) {
            currentChordStepIndex = 0;
            currentOctave = Math.min(
                Math.max(currentOctave + octaveIncrement, -4),
                11
            ) as NoteOctave;
            octaveDelta = currentOctave - octaveStart;
        }
    }
    return groupNotes;
}

interface NoteGroupGenerationParameters {
    root: `${NoteName}${NoteAccidental}`;
    semitones: number[];
    octaveStart: NoteOctave;
    octaveIncrement: number;
}

const initialNoteGroupGenerationParameters: NoteGroupGenerationParameters[] = [
    {
        root: "C",
        semitones: [-2, 1, 5, 8, 13, 18],
        octaveStart: 3,
        octaveIncrement: 1,
    },
    {
        root: "C",
        semitones: [-1, 3, 6, 13, 15, 18],
        octaveStart: 3,
        octaveIncrement: 1,
    },
    {
        root: "C",
        semitones: [1, 5, 8, 13, 17, 18],
        octaveStart: 3,
        octaveIncrement: 1,
    },
    {
        root: "C",
        semitones: [3, 6, 10, 15, 17, 20],
        octaveStart: 3,
        octaveIncrement: 1,
    },
];

export function initializeNoteGroups(
    numberOfNoteGroups: number,
    sequencerHeight: number
): NoteGroupCell[] {
    const noteGroups: NoteGroupCell[] = [];
    let noteGroupGenerationParameters: NoteGroupGenerationParameters =
        initialNoteGroupGenerationParameters[0];
    for (let i = 0; i < numberOfNoteGroups; i++) {
        noteGroupGenerationParameters =
            initialNoteGroupGenerationParameters[
                i % initialNoteGroupGenerationParameters.length
            ];
        noteGroups.push({
            enabled: true,
            active: i === 0,
            notes: generateNoteGroupNotes(
                sequencerHeight,
                noteGroupGenerationParameters.root,
                noteGroupGenerationParameters.semitones,
                noteGroupGenerationParameters.octaveStart,
                noteGroupGenerationParameters.octaveIncrement
            ),
            root: noteGroupGenerationParameters.root,
            semitones: noteGroupGenerationParameters.semitones,
            octaveStart: noteGroupGenerationParameters.octaveStart,
            octaveIncrement: noteGroupGenerationParameters.octaveIncrement,
            enabledRows: Array.from({ length: sequencerHeight }, () => true),
        });
    }
    return noteGroups;
}
