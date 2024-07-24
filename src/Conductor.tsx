import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useGridStore } from "./useGridStore";

// const notes: Record<number, string> = {
//     0: "C5",
//     1: "E5",
//     2: "G5",
//     3: "D5",
//     4: "F5",
//     5: "A6",
//     6: "E5",
//     7: "G5",
//     8: "B6",
//     9: "F5",
//     10: "A6",
//     11: "C6",
//     12: "G5",
//     13: "B6",
//     14: "D6",
//     15: "A6",
//     16: "C6",
//     17: "E6",
//     18: "B6",
//     19: "D6",
//     20: "F6",
//     21: "C6",
//     22: "E6",
//     23: "G6",
//     24: "D6",
// };

const notes: Record<number, string> = {
    0: "C2",
    1: "D2",
    2: "E2",
    3: "F2",
    4: "G2",
    5: "A3",
    6: "B3",
    7: "C3",
    8: "D3",
    9: "E3",
    10: "F3",
    11: "G3",
    12: "A4",
    13: "B4",
    14: "C4",
    15: "D4",
    16: "E4",
    17: "F4",
    18: "G4",
    19: "A5",
    20: "B5",
    21: "C5",
    22: "D5",
    23: "E5",
    24: "F5",
};

export default function Conductor() {
    const bpm = useGridStore((state) => state.bpm);
    const cellsPerBeat = useGridStore((state) => state.cellsPerBeat);
    const animationState = useGridStore((state) => state.animationState);
    const dimensionX = useGridStore((state) => state.dimensionX);
    const dimensionY = useGridStore((state) => state.dimensionY);
    const sequenceColumnRef = useRef(0);

    const elapsedBpm = useRef(0);

    const userHasClicked = useGridStore((state) => state.userHasClicked);

    const [synth, setSynth] = useState<Tone.PolySynth | null>(
        useGridStore.getState().synth
    );
    const attack = useGridStore((state) => state.attack);
    const decay = useGridStore((state) => state.decay);
    const sustain = useGridStore((state) => state.sustain);
    const release = useGridStore((state) => state.release);

    useEffect(() => {
        if (!synth) return;
        synth.set({
            envelope: {
                attack: attack,
                decay: decay,
                sustain: sustain,
                release: release,
            },
        });
    }, [attack, decay, sustain, release, synth]);

    useEffect(() => {
        if (userHasClicked) {
            Tone.start().then(() => {
                const _synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: {
                        // sawtooth, sine, square, triangle
                        type: "square",
                    },
                    envelope: {
                        attack: attack,
                        decay: decay,
                        sustain: sustain,
                        release: release,
                    },
                }).toDestination();
                setSynth(_synth);
                useGridStore.setState((state) => {
                    state.audioInitialized = true;
                    state.synth = _synth;
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userHasClicked]);

    useFrame((_, delta) => {
        if (!synth) return;
        if (animationState === "paused") {
            if (elapsedBpm.current > 0) elapsedBpm.current = 0;
            return;
        }
        elapsedBpm.current += delta;

        /**
         * Sequencer timing.
         */
        if (elapsedBpm.current >= 60 / bpm / cellsPerBeat) {
            elapsedBpm.current = 0;
            const currentSequenceColumn =
                useGridStore.getState().currentSequenceColumn;
            if (currentSequenceColumn === null) {
                useGridStore.setState((state) => {
                    state.currentSequenceColumn = 0;
                });
                sequenceColumnRef.current = 0;
            } else {
                useGridStore.setState((state) => {
                    state.currentSequenceColumn =
                        (state.currentSequenceColumn! + 1) % dimensionX;
                });
                sequenceColumnRef.current =
                    (sequenceColumnRef.current + 1) % dimensionX;
            }
            const cells = useGridStore.getState().cells;
            const played: Array<string | number> = [];
            const noteConfigs = useGridStore.getState().noteConfigs;
            for (let i = 0; i < dimensionY; i++) {
                const cell = cells[`${sequenceColumnRef.current},${i}`];
                if (
                    cell.alive &&
                    !played.includes(noteConfigs[0][i].note) &&
                    synth!.activeVoices < synth!.maxPolyphony &&
                    noteConfigs[0][i].enabled
                ) {
                    played.push(noteConfigs[0][i].note);
                    synth!.triggerAttackRelease(noteConfigs[0][i].note, "16n");
                }
            }
        }
    });
    return null;
}
