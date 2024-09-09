import * as Tone from "tone";
import { drumNoteMap, drumTypes } from "./constants";
import { DrumCell, DrumType, VoiceMode } from "./sharedTypes";

export function playSynthNotes(
    synth: Tone.PolySynth | Tone.MonoSynth,
    frequencies: Tone.FrequencyClass<number>[],
    voiceMode: VoiceMode,
    noteDuration: number
) {
    if (voiceMode === "poly") {
        if (!(synth instanceof Tone.PolySynth)) {
            console.error("Synth is not a PolySynth.");
            return;
        }
        const playedNotes: Tone.FrequencyClass<number>[] = [];
        if (synth instanceof Tone.PolySynth) {
            for (const frequency of frequencies) {
                if (
                    playedNotes.includes(frequency) ||
                    synth.activeVoices >= synth.maxPolyphony
                ) {
                    continue;
                }
                synth.triggerAttackRelease(
                    frequency.toFrequency(),
                    noteDuration
                );
                playedNotes.push(frequency);
            }
        }
    } else {
        if (!(synth instanceof Tone.MonoSynth)) {
            console.error("Synth is not a MonoSynth.");
            return;
        }
        /**
         * @todo Implement MonoSynth play.
         * Will need to determine which note to play outside of this
         * function so that we can tell which cell to light up.
         */
    }
}

export function playDrums(
    drumSampler: Tone.Sampler,
    drumTypesToPlay: DrumType[]
) {
    for (const drumType of drumTypesToPlay) {
        drumSampler.triggerAttackRelease(drumNoteMap[drumType], "4n");
    }
}

export function initializeDrumCells(sequencerLength: number) {
    const drumCells: Array<Array<DrumCell>> = [];
    for (let i = 0; i < sequencerLength; i++) {
        const drumColumn: DrumCell[] = [];
        drumTypes.forEach((drumType) => {
            drumColumn.push({
                alive:
                    drumType === "HiHat"
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
