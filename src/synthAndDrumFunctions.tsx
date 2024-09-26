import * as Tone from "tone";
import { drumNoteMap, drumTypes } from "./constants";
import {
    DrumCell,
    DrumType,
    NoteGroupNote,
    SynthCheckIfPlay,
    VoiceMode,
} from "./sharedTypes";

export function playSynthNotes(
    synth: Tone.PolySynth | Tone.MonoSynth,
    synthCheckIfPlay: SynthCheckIfPlay[],
    notes: NoteGroupNote[],
    voiceMode: VoiceMode,
    noteDuration: number
): SynthCheckIfPlay[] {
    const synthCheckedIfPlay: SynthCheckIfPlay[] = synthCheckIfPlay;
    if (voiceMode === "poly") {
        if (!(synth instanceof Tone.PolySynth)) {
            console.error("Synth is not a PolySynth.");
            return synthCheckedIfPlay;
        }
        const playedFrequencies: Tone.FrequencyClass<number>[] = [];
        let frequency: Tone.FrequencyClass<number>;
        synthCheckIfPlay.forEach(({ noteIndex }, i) => {
            frequency = notes[noteIndex].frequency;
            if (
                playedFrequencies.includes(frequency) ||
                synth.activeVoices >= synth.maxPolyphony
            ) {
                return;
            }
            synth.triggerAttackRelease(frequency.toFrequency(), noteDuration);
            playedFrequencies.push(frequency);
            synthCheckedIfPlay[i].played = true;
        });
    } else {
        if (!(synth instanceof Tone.MonoSynth)) {
            console.error("Synth is not a MonoSynth.");
            return synthCheckedIfPlay;
        }
        let playedIndex: number | undefined;
        if (voiceMode === "monotop") {
            playedIndex = synthCheckIfPlay.length - 1;
        } else if (voiceMode === "monobottom") {
            playedIndex = 0;
        } else if (voiceMode === "monomid") {
            playedIndex = Math.floor(synthCheckIfPlay.length / 2);
        } else if (voiceMode === "monorandom") {
            playedIndex = Math.floor(Math.random() * synthCheckIfPlay.length);
        }
        if (playedIndex !== undefined) {
            synth.triggerAttackRelease(
                notes[
                    synthCheckIfPlay[playedIndex].noteIndex
                ].frequency.toFrequency(),
                noteDuration
            );
            synthCheckedIfPlay[playedIndex].played = true;
        }
    }
    return synthCheckedIfPlay;
}

export function playDrums(
    drumSampler: Tone.Sampler,
    drumTypesToPlay: DrumType[],
    drumDuration: number
) {
    for (const drumType of drumTypesToPlay) {
        drumSampler.triggerAttackRelease(drumNoteMap[drumType], drumDuration);
    }
}

export function initializeDrumCells(sequencerLength: number) {
    const drumCells: Array<Array<DrumCell>> = [];
    for (let i = 0; i < sequencerLength; i++) {
        const drumColumn: DrumCell[] = [];
        drumTypes.forEach((drumType) => {
            drumColumn.push({
                alive:
                    drumType === "HiHat" && i % 2 === 1
                        ? true
                        : drumType === "Snare" && i % 4 === 2
                        ? true
                        : drumType === "Kick" && i % 4 === 0
                        ? true
                        : false,
                drumType: drumType,
            });
        });

        drumCells.push(drumColumn);
    }
    return drumCells;
}
