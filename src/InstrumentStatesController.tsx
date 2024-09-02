import { useEffect, useState } from "react";
import * as Tone from "tone";
import { drumNoteMap } from "./constants";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function InstrumentStatesController() {
    const userHasClicked = useGlobalStore((state) => state.userHasClicked);
    const [synth, setSynth] = useState<Tone.PolySynth | Tone.MonoSynth | null>(
        useGlobalStore.getState().synth
    );
    const [, setDrumSampler] = useState<Tone.Sampler | null>(
        useGlobalStore.getState().drumSampler
    );
    const npm = useGlobalStore((state) => state.npm);
    const voiceMode = useGlobalStore((state) => state.voiceMode);
    const waveform = useGlobalStore((state) => state.waveform);
    const synthVolume = useGlobalStore((state) => state.synthVolume);
    const drumsVolume = useGlobalStore((state) => state.drumsVolume);
    const attack = useGlobalStore((state) => state.attack);
    const decay = useGlobalStore((state) => state.decay);
    const sustain = useGlobalStore((state) => state.sustain);
    const release = useGlobalStore((state) => state.release);

    useEffect(() => {
        if (!synth) return;
        let _synth;
        if (voiceMode === "poly") {
            _synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: waveform },
                volume: synthVolume,
                envelope: {
                    attack,
                    decay,
                    sustain,
                    release,
                },
            }).toDestination();
        } else {
            _synth = new Tone.MonoSynth({
                oscillator: { type: waveform },
                volume: synthVolume,
                envelope: {
                    attack,
                    decay,
                    sustain,
                    release,
                },
            }).toDestination();
        }
        if (!_synth) return;
        synth.dispose();
        setSynth(_synth);
        useGlobalStore.setState((state) => {
            state.synth = _synth;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voiceMode]);

    useEffect(() => {
        if (!synth) return;
        synth.set({
            oscillator: { type: waveform },
            volume: synthVolume,
            envelope: {
                attack,
                decay,
                sustain,
                release,
            },
        });
    }, [waveform, synthVolume, attack, decay, sustain, release, synth]);

    useEffect(() => {
        if (!userHasClicked) return;
        let _synth;
        if (voiceMode === "poly") {
            _synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: waveform },
                volume: synthVolume,
                envelope: {
                    attack,
                    decay,
                    sustain,
                    release,
                },
            }).toDestination();
        } else {
            _synth = new Tone.MonoSynth({
                oscillator: { type: waveform },
                volume: synthVolume,
                envelope: {
                    attack,
                    decay,
                    sustain,
                    release,
                },
            }).toDestination();
        }
        const _drumSampler = new Tone.Sampler({
            urls: {
                [drumNoteMap.Kick]: "audio/Cassette808_BD02.wav",
                [drumNoteMap.Snare]: "audio/Cassette808_Snr01.wav",
                [drumNoteMap.HiHat]: "audio/Cassette808_HH_01.wav",
            },
            volume: drumsVolume,
        }).toDestination();
        if (!_synth || !_drumSampler) return;
        setSynth(_synth);
        setDrumSampler(_drumSampler);
        useGlobalStore.setState((state) => {
            state.synth = _synth;
            state.drumSampler = _drumSampler;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userHasClicked]);

    useEffect(() => {
        Tone.getTransport().bpm.value = npm;
    }, [npm]);

    return null;
}
