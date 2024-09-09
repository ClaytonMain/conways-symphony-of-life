import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { drumTypes } from "../constants";
import { DrumType } from "../sharedTypes";
import { useGridStore } from "./useGridStore";

export default function Conductor() {
    const barsPerMinute = useGridStore((state) => state.barsPerMinute);
    const notesPerBar = useGridStore((state) => state.notesPerBar);
    const animationState = useGridStore((state) => state.animationState);
    const dimensionX = useGridStore((state) => state.dimensionX);
    const dimensionY = useGridStore((state) => state.dimensionY);
    const sequenceColumnRef = useRef(0);
    const autoChangeActiveConfigEveryNNotes = useGridStore(
        (state) => state.autoChangeActiveConfigEveryNNotes
    );
    const changeActiveConfigCountRef = useRef(0);
    const handleAutoChangeActiveConfig = useGridStore(
        (state) => state.handleAutoChangeActiveConfig
    );

    const elapsedBpm = useRef(0);

    const userHasClicked = useGridStore((state) => state.userHasClicked);

    const [synth, setSynth] = useState<Tone.PolySynth | null>(
        useGridStore.getState().synth
    );
    const [drums, setDrums] = useState<Tone.Sampler | null>(
        useGridStore.getState().drums
    );
    const attack = useGridStore((state) => state.attack);
    const decay = useGridStore((state) => state.decay);
    const sustain = useGridStore((state) => state.sustain);
    const release = useGridStore((state) => state.release);

    const currentNoteConfigCellIndex = useGridStore(
        (state) => state.currentNoteConfigCellIndex
    );
    const currentNoteConfigCellIndexRef = useRef(
        useGridStore.getState().currentNoteConfigCellIndex
    );

    const drumNoteMap: Record<DrumType, "A1" | "A2" | "A3"> = {
        Kick: "A1",
        Snare: "A2",
        HiHat: "A3",
    };

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
        Tone.getTransport().timeSignature = notesPerBar;
    }, [barsPerMinute, notesPerBar]);

    useEffect(() => {
        if (
            currentNoteConfigCellIndex !== currentNoteConfigCellIndexRef.current
        ) {
            currentNoteConfigCellIndexRef.current = currentNoteConfigCellIndex;
        }
    }, [currentNoteConfigCellIndex]);

    useEffect(() => {
        if (userHasClicked) {
            Tone.start().then(() => {
                const _synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: {
                        // sawtooth, sine, square, triangle
                        type: "square",
                    },
                    volume: -10,
                    envelope: {
                        attack: attack,
                        decay: decay,
                        sustain: sustain,
                        release: release,
                    },
                }).toDestination();
                const _drums = new Tone.Sampler({
                    urls: {
                        [drumNoteMap.Kick]: "audio/Cassette808_BD02.wav",
                        [drumNoteMap.Snare]: "audio/Cassette808_Snr01.wav",
                        [drumNoteMap.HiHat]: "audio/Cassette808_HH_01.wav",
                    },
                    volume: 0,
                }).toDestination();
                setSynth(_synth);
                setDrums(_drums);
                useGridStore.setState((state) => {
                    state.audioInitialized = true;
                    state.synth = _synth;
                    state.drums = _drums;
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
        if (elapsedBpm.current >= 60 / barsPerMinute / notesPerBar) {
            elapsedBpm.current = 0;

            if (autoChangeActiveConfigEveryNNotes > 0) {
                if (
                    changeActiveConfigCountRef.current >=
                    autoChangeActiveConfigEveryNNotes
                ) {
                    currentNoteConfigCellIndexRef.current =
                        handleAutoChangeActiveConfig();
                    changeActiveConfigCountRef.current = 0;
                }
                changeActiveConfigCountRef.current++;
            }

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
            const drumCells = useGridStore.getState().drumCells;
            const played: Array<string | number> = [];
            const currentNoteConfigs =
                useGridStore.getState().noteConfigCells[
                    currentNoteConfigCellIndexRef.current
                ].noteConfigs;

            for (let i = 0; i < dimensionY; i++) {
                const cell = cells[`${sequenceColumnRef.current},${i}`];
                if (
                    cell.alive &&
                    !played.includes(currentNoteConfigs[i % dimensionY].note) &&
                    synth!.activeVoices < synth!.maxPolyphony &&
                    currentNoteConfigs[i % dimensionY].enabled
                ) {
                    played.push(currentNoteConfigs[i % dimensionY].note);
                    synth!.triggerAttackRelease(
                        currentNoteConfigs[i % dimensionY].note,
                        `${notesPerBar}n`
                    );
                }
            }
            for (const drumType of drumTypes) {
                const drumCell =
                    drumCells[`${drumType},${sequenceColumnRef.current}`];
                if (drumCell.alive) {
                    drums!.triggerAttackRelease(
                        drumNoteMap[drumType],
                        `${notesPerBar}n`
                    );
                }
            }
        }
    });
    return null;
}
