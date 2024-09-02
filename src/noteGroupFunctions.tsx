import { Frequency, FrequencyClass } from "tone";
import { chordQualitySteps } from "./constants";
import {
    ChordQuality,
    NoteAccidental,
    NoteGroupCell,
    NoteGroupNote,
    NoteName,
    NoteOctave,
} from "./sharedTypes";

export function generateNoteGroupNotes(
    sequencerHeight: number,
    root: `${NoteName}${NoteAccidental}`,
    quality: ChordQuality,
    octaveStart: NoteOctave,
    octaveIncrement: number
) {
    const groupNotes: NoteGroupNote[] = [];
    const chordSteps = chordQualitySteps[quality];
    const initialFrequency: FrequencyClass<number> = Frequency(
        `${root}${octaveStart}`
    );
    let currentChordStepIndex = 0;
    let currentOctave: NoteOctave = octaveStart;
    let octaveDelta: number = 0;
    let thisFrequency: FrequencyClass<number> = initialFrequency;
    for (let i = 0; i < sequencerHeight; i++) {
        thisFrequency = initialFrequency.transpose(
            octaveDelta * 12 + chordSteps[currentChordStepIndex]
        );
        groupNotes.push({
            note: thisFrequency.toNote(),
            frequency: thisFrequency,
            noteGroupRowEnabled: true,
            globalRowEnabled: true,
        });
        currentChordStepIndex++;
        if (currentChordStepIndex >= chordSteps.length) {
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
    quality: ChordQuality;
    octaveStart: NoteOctave;
    octaveIncrement: number;
}

const initialNoteGroupGenerationParameters: NoteGroupGenerationParameters[] = [
    {
        root: "A#",
        quality: "7sus2",
        octaveStart: 2,
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
            active: false,
            notes: generateNoteGroupNotes(
                sequencerHeight,
                noteGroupGenerationParameters.root,
                noteGroupGenerationParameters.quality,
                noteGroupGenerationParameters.octaveStart,
                noteGroupGenerationParameters.octaveIncrement
            ),
            enabledRows: Array.from({ length: sequencerHeight }, () => true),
        });
    }
    console.log(noteGroups);
    return noteGroups;
}
