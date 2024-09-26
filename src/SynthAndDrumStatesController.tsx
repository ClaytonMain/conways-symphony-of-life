import { useEffect, useState } from "react";
import * as Tone from "tone";
import { drumNoteMap } from "./constants";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function SynthAndDrumStatesController() {
    const [userHasClicked, setUserHasClicked] = useState(
        useGlobalStore.getState().userHasClicked
    );
    const [npm, setNpm] = useState(useGlobalStore.getState().npm);
    const [voiceMode, setVoiceMode] = useState(
        useGlobalStore.getState().voiceMode
    );
    const [waveform, setWaveform] = useState(
        useGlobalStore.getState().waveform
    );
    const [synthVolume, setSynthVolume] = useState(
        useGlobalStore.getState().synthVolume
    );
    const [drumsVolume, setDrumsVolume] = useState(
        useGlobalStore.getState().drumsVolume
    );
    const [attack, setAttack] = useState(useGlobalStore.getState().attack);
    const [decay, setDecay] = useState(useGlobalStore.getState().decay);
    const [sustain, setSustain] = useState(useGlobalStore.getState().sustain);
    const [release, setRelease] = useState(useGlobalStore.getState().release);
    const [synth, setSynth] = useState<Tone.PolySynth | Tone.MonoSynth | null>(
        useGlobalStore.getState().synth
    );
    const [drumSampler, setDrumSampler] = useState<Tone.Sampler | null>(
        useGlobalStore.getState().drumSampler
    );
    const [, setEqualizer] = useState<Tone.EQ3 | null>(
        useGlobalStore.getState().equalizer
    );

    useEffect(() => {
        const unsubUserHasClicked = useGlobalStore.subscribe(
            (state) => state.userHasClicked,
            (value) => {
                setUserHasClicked(value);
            }
        );
        return () => {
            unsubUserHasClicked();
        };
    });
    useEffect(() => {
        const unsubNpm = useGlobalStore.subscribe(
            (state) => state.npm,
            (value) => {
                setNpm(value);
            }
        );
        return () => {
            unsubNpm();
        };
    });
    useEffect(() => {
        const unsubVoiceMode = useGlobalStore.subscribe(
            (state) => state.voiceMode,
            (value) => {
                setVoiceMode(value);
            }
        );
        return () => {
            unsubVoiceMode();
        };
    });
    useEffect(() => {
        const unsubWaveform = useGlobalStore.subscribe(
            (state) => state.waveform,
            (value) => {
                setWaveform(value);
            }
        );
        return () => {
            unsubWaveform();
        };
    });
    useEffect(() => {
        const unsubSynthVolume = useGlobalStore.subscribe(
            (state) => state.synthVolume,
            (value) => {
                setSynthVolume(value);
            }
        );
        return () => {
            unsubSynthVolume();
        };
    });
    useEffect(() => {
        const unsubDrumsVolume = useGlobalStore.subscribe(
            (state) => state.drumsVolume,
            (value) => {
                setDrumsVolume(value);
            }
        );
        return () => {
            unsubDrumsVolume();
        };
    });
    useEffect(() => {
        const unsubAttack = useGlobalStore.subscribe(
            (state) => state.attack,
            (value) => {
                setAttack(value);
            }
        );
        return () => {
            unsubAttack();
        };
    });
    useEffect(() => {
        const unsubDecay = useGlobalStore.subscribe(
            (state) => state.decay,
            (value) => {
                setDecay(value);
            }
        );
        return () => {
            unsubDecay();
        };
    });
    useEffect(() => {
        const unsubSustain = useGlobalStore.subscribe(
            (state) => state.sustain,
            (value) => {
                setSustain(value);
            }
        );
        return () => {
            unsubSustain();
        };
    });
    useEffect(() => {
        const unsubRelease = useGlobalStore.subscribe(
            (state) => state.release,
            (value) => {
                setRelease(value);
            }
        );
        return () => {
            unsubRelease();
        };
    });

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
                portamento: 0.05,
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
        if (!drumSampler) return;
        drumSampler.set({ volume: drumsVolume });
    }, [drumsVolume, drumSampler]);

    useEffect(() => {
        if (!userHasClicked) return;
        const _equalizer = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0,
        });
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
            // }).connect(_equalizer);
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
                portamento: 0.05,
            }).toDestination();
            // }).connect(_equalizer);
        }
        const _drumSampler = new Tone.Sampler({
            urls: {
                [drumNoteMap.Kick]: "audio/Cassette808_BD02.wav",
                [drumNoteMap.Snare]: "audio/Cassette808_Snr01.wav",
                [drumNoteMap.HiHat]: "audio/Cassette808_HH_01.wav",
            },
            volume: drumsVolume,
        }).toDestination();
        if (!_synth || !_drumSampler || !_equalizer) return;
        setSynth(_synth);
        setDrumSampler(_drumSampler);
        setEqualizer(_equalizer);
        useGlobalStore.setState((state) => {
            state.synth = _synth;
            state.drumSampler = _drumSampler;
            state.equalizer = _equalizer;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userHasClicked]);

    useEffect(() => {
        Tone.getTransport().bpm.value = npm;
    }, [npm]);

    return null;
}
