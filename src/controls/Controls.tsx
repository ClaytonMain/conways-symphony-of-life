import { Center, Instances, Text } from "@react-three/drei";
import { useEffect, useState } from "react";
import {
    arrowGeometry,
    buttonLabelElementMaterial,
    buttonMaterial,
    colors,
    genericBoxGeometry,
    genericPlaneGeometry,
    staticLabelMaterialElement,
} from "../constants";
import { recalculateNeighborAddresses } from "../gameOfLifeFunctions";
import {
    CellEditMode,
    GameWrapMode,
    NoteGroupChangeMode,
    NoteGroupSelectMode,
    VoiceMode,
    Waveform,
} from "../sharedTypes";
import { useGlobalStore } from "../stores/useGlobalStore";
import InstancedButtonOrLabel from "./InstancedButtonOrLabel";
import InstrumentButton from "./InstrumentButton";
import ValuesKnob from "./ValuesKnob";

function NoteGroupsControls({
    position,
}: {
    position: [number, number, number];
}) {
    const [noteGroupChangeMode, setNoteGroupChangeMode] = useState(
        useGlobalStore.getState().noteGroupChangeMode
    );
    const [noteGroupSelectMode, setNoteGroupSelectMode] = useState(
        useGlobalStore.getState().noteGroupSelectMode
    );
    const [npg, setNpg] = useState(useGlobalStore.getState().npg);

    const groupChangeModeKnobOptions = {
        knobValues: ["SEQ", "RND", "SRND", "OFF"],
        displayLabels: ["SEQUENTIAL", "RANDOM", "SEMI-RANDOM", "OFF"],
        options: ["sequential", "true random", "avoid prev random", null],
    };
    const groupSelectModeKnobOptions = {
        knobValues: ["KBM", "TGGL", "ACTV"],
        displayLabels: ["KEYBOARD & MOUSE", "TOGGLE", "ACTIVATE"],
        options: [null, "toggle", "activate"],
    };
    const npgKnobChangeOptions = {
        knobValues: [1, 2, 4, 8, 16],
        displayLabels: [1, 2, 4, 8, 16],
        options: [1, 2, 4, 8, 16],
    };

    function handleGroupChangeModeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.noteGroupChangeMode = groupChangeModeKnobOptions.options[
                index
            ] as NoteGroupChangeMode;
            state.displayLabel = "Group Change Mode";
            state.displayValue =
                groupChangeModeKnobOptions.displayLabels[index];
        });
        setNoteGroupChangeMode(
            groupChangeModeKnobOptions.options[index] as NoteGroupChangeMode
        );
    }
    function handleGroupSelectModeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.noteGroupSelectMode = groupSelectModeKnobOptions.options[
                index
            ] as NoteGroupSelectMode;
            state.displayLabel = "Group Select Mode";
            state.displayValue =
                groupSelectModeKnobOptions.displayLabels[index];
        });
        setNoteGroupSelectMode(
            groupSelectModeKnobOptions.options[index] as NoteGroupSelectMode
        );
    }
    function handleNpgValueChange(index: number) {
        useGlobalStore.setState((state) => {
            state.npg = npgKnobChangeOptions.options[index];
            state.displayLabel = "Notes Per Group";
            state.displayValue = npgKnobChangeOptions.displayLabels[index];
        });
        setNpg(npgKnobChangeOptions.options[index]);
    }

    return (
        <group position={position}>
            <mesh
                geometry={genericPlaneGeometry}
                scale={[10, 1.25, 1]}
            >
                <meshBasicMaterial
                    color={"black"}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <Text
                fontWeight={"bold"}
                position={[0, 0, 0.1]}
            >
                <meshBasicMaterial
                    color={colors.background}
                    toneMapped={false}
                />
                NOTE GROUPS
            </Text>
            <ValuesKnob
                position={[-2, -2.5, 0]}
                values={groupSelectModeKnobOptions.knobValues}
                startIndex={groupSelectModeKnobOptions.options.indexOf(
                    noteGroupSelectMode
                )}
                label={"NOTE GROUP\nSELECT MODE"}
                onChange={(index) => {
                    handleGroupSelectModeChange(index);
                }}
            />
            <ValuesKnob
                position={[2, -2.5, 0]}
                values={npgKnobChangeOptions.knobValues}
                startIndex={npgKnobChangeOptions.options.indexOf(npg)}
                label={"NPG"}
                onChange={(index) => {
                    handleNpgValueChange(index);
                }}
            />
            <ValuesKnob
                position={[-2, -6, 0]}
                values={groupChangeModeKnobOptions.knobValues}
                startIndex={groupChangeModeKnobOptions.options.indexOf(
                    noteGroupChangeMode
                )}
                label={"GROUP\nCHANGE\nMODE"}
                onChange={(index) => {
                    handleGroupChangeModeChange(index);
                }}
            />
            <InstrumentButton
                position={[2, -6, 0]}
                buttonScale={[2.25, 1.0, 1]}
                label="EDIT"
                labelDistanceFactor={20}
                onClick={() => {
                    useGlobalStore.setState((state) => {
                        state.editingNoteGroups = true;
                        state.cellsIgnorePointerEvents = true;
                        state.playState = "stopped";
                    });
                }}
            />
        </group>
    );
}

function CellControls({ position }: { position: [number, number, number] }) {
    const [cellEditMode, setCellEditMode] = useState(
        useGlobalStore.getState().cellEditMode
    );
    const [gameWrapMode, setGameWrapMode] = useState(
        useGlobalStore.getState().gameWrapMode
    );
    const [npt, setNpt] = useState(useGlobalStore.getState().npt);

    const cellEditModeKnobChangeOptions = {
        knobValues: ["KBM", "ALIVE", "DEAD", "INV"],
        displayLabels: ["KEYBOARD & MOUSE", "ALIVE", "DEAD", "INVINCIBLE"],
        options: [null, "alive", "dead", "invincible"],
    };
    const gameWrapModeKnobChangeOptions = {
        knobValues: ["XY", "X", "Y", "NONE"],
        displayLabels: ["WRAP X & Y", "WRAP X", "WRAP Y", "NO WRAP"],
        options: ["both", "x", "y", "none"],
    };
    const nptKnobChangeOptions = {
        knobValues: [1, 2, 4, 8, 16],
        displayLabels: [1, 2, 4, 8, 16],
        options: [1, 2, 4, 8, 16],
    };

    function handleCellEditModeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.cellEditMode = cellEditModeKnobChangeOptions.options[
                index
            ] as CellEditMode;
            state.displayLabel = "Cell Edit Mode";
            state.displayValue =
                cellEditModeKnobChangeOptions.displayLabels[index];
        });
        setCellEditMode(
            cellEditModeKnobChangeOptions.options[index] as CellEditMode
        );
    }
    function handleGameWrapModeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.gameWrapMode = gameWrapModeKnobChangeOptions.options[
                index
            ] as GameWrapMode;
            state.displayLabel = "Game Wrap Mode";
            state.displayValue =
                gameWrapModeKnobChangeOptions.displayLabels[index];
            state.sequencerCells = recalculateNeighborAddresses(
                state.sequencerCells,
                state.sequencerLength,
                state.sequencerHeight,
                gameWrapModeKnobChangeOptions.options[index] as GameWrapMode
            );
        });
        setGameWrapMode(
            gameWrapModeKnobChangeOptions.options[index] as GameWrapMode
        );
    }
    function handleNptValueChange(index: number) {
        useGlobalStore.setState((state) => {
            state.npt = nptKnobChangeOptions.options[index];
            state.displayLabel = "Notes Per Group";
            state.displayValue = nptKnobChangeOptions.displayLabels[index];
        });
        setNpt(nptKnobChangeOptions.options[index]);
    }
    function handleClear() {
        useGlobalStore.setState((state) => {
            for (const cellKey in state.sequencerCells) {
                state.sequencerCells[cellKey].state = "dead";
            }
        });
    }
    function handleRandomize() {
        useGlobalStore.setState((state) => {
            for (const cellKey in state.sequencerCells) {
                state.sequencerCells[cellKey].state =
                    Math.random() > 0.8 ? "alive" : "dead";
            }
        });
    }

    return (
        <group position={position}>
            <mesh
                geometry={genericPlaneGeometry}
                scale={[10, 1.25, 1]}
            >
                <meshBasicMaterial
                    color={"black"}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <Text
                fontWeight={"bold"}
                position={[0, 0, 0.1]}
            >
                <meshBasicMaterial
                    color={colors.background}
                    toneMapped={false}
                />
                CELLS
            </Text>
            <ValuesKnob
                position={[-2, -2.5, 0]}
                values={cellEditModeKnobChangeOptions.knobValues}
                startIndex={cellEditModeKnobChangeOptions.options.indexOf(
                    cellEditMode
                )}
                label={"CELL EDIT\nMODE"}
                onChange={(index) => {
                    handleCellEditModeChange(index);
                }}
            />
            <ValuesKnob
                position={[2, -2.5, 0]}
                values={gameWrapModeKnobChangeOptions.knobValues}
                startIndex={gameWrapModeKnobChangeOptions.options.indexOf(
                    gameWrapMode
                )}
                label={"GAME WRAP\nMODE"}
                onChange={(index) => {
                    handleGameWrapModeChange(index);
                }}
            />
            <ValuesKnob
                position={[-2, -6, 0]}
                values={nptKnobChangeOptions.knobValues}
                startIndex={nptKnobChangeOptions.options.indexOf(npt!)}
                label={"NPT"}
                onChange={(index) => {
                    handleNptValueChange(index);
                }}
            />
            <Instances
                limit={2}
                geometry={genericBoxGeometry}
                material={buttonMaterial}
            >
                <InstancedButtonOrLabel
                    position={[2, -5.5, 0]}
                    scale={0.9}
                    boxScale={[2.25, 1.0, 1]}
                    label="CLEAR"
                    onClick={() => {
                        handleClear();
                    }}
                    labelScale={0.6}
                    labelZPosition={0.51}
                    labelMaterialElement={staticLabelMaterialElement}
                />
                <InstancedButtonOrLabel
                    position={[2, -6.5, 0]}
                    scale={0.9}
                    boxScale={[2.25, 1.0, 1]}
                    label="RAND"
                    onClick={() => {
                        handleRandomize();
                    }}
                    labelScale={0.6}
                    labelZPosition={0.51}
                    labelMaterialElement={staticLabelMaterialElement}
                />
            </Instances>
        </group>
    );
}

function SynthControls({ position }: { position: [number, number, number] }) {
    const [synthVolume, setSynthVolume] = useState(
        useGlobalStore.getState().synthVolume
    );
    const [drumsVolume, setDrumsVolume] = useState(
        useGlobalStore.getState().drumsVolume
    );
    const [waveform, setWaveform] = useState(
        useGlobalStore.getState().waveform
    );
    const [voiceMode, setVoiceMode] = useState(
        useGlobalStore.getState().voiceMode
    );
    const [attack, setAttack] = useState(useGlobalStore.getState().attack);
    const [decay, setDecay] = useState(useGlobalStore.getState().decay);
    const [sustain, setSustain] = useState(useGlobalStore.getState().sustain);
    const [release, setRelease] = useState(useGlobalStore.getState().release);

    const synthVolumeKnobChangeOptions = {
        knobValues: [-20, -10, -7, -5, -3, -2, -1, 0],
        displayLabels: [-20, -10, -7, -5, -3, -2, -1, 0],
        options: [-20, -10, -7, -5, -3, -2, -1, 0],
    };
    const drumsVolumeKnobChangeOptions = {
        knobValues: [-20, -10, -7, -5, -3, -2, -1, 0],
        displayLabels: [-20, -10, -7, -5, -3, -2, -1, 0],
        options: [-20, -10, -7, -5, -3, -2, -1, 0],
    };
    const waveformKnobChangeOptions = {
        knobValues: ["SIN", "SQR", "SAW", "TRI"],
        displayLabels: ["SINE", "SQUARE", "SAWTOOTH", "TRIANGLE"],
        options: ["sine", "square", "sawtooth", "triangle"],
    };
    const voiceModeKnobChangeOptions = {
        knobValues: ["PLY", "MT", "MM", "MB", "MR"],
        displayLabels: [
            "POLY",
            "MONO TOP",
            "MONO MID",
            "MONO BOTTOM",
            "MONO RANDOM",
        ],
        options: ["poly", "monotop", "monomid", "monobottom", "monorandom"],
    };
    const attackKnobChangeOptions = {
        knobValues: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
        displayLabels: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
        options: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    };
    const decayKnobChangeOptions = {
        knobValues: [0.01, 0.05, 0.1, 0.5, 1, 2, 4],
        displayLabels: [0.01, 0.05, 0.1, 0.5, 1, 2, 4],
        options: [0.01, 0.05, 0.1, 0.5, 1, 2, 4],
    };
    const sustainKnobChangeOptions = {
        knobValues: [0.1, 0.3, 0.5, 0.7, 0.9, 1],
        displayLabels: [0.1, 0.3, 0.5, 0.7, 0.9, 1],
        options: [0.1, 0.3, 0.5, 0.7, 0.9, 1],
    };
    const releaseKnobChangeOptions = {
        knobValues: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        displayLabels: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        options: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    };

    function handleSynthVolumeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.synthVolume = synthVolumeKnobChangeOptions.options[index];
            state.displayLabel = "Synth Volume";
            state.displayValue =
                synthVolumeKnobChangeOptions.displayLabels[index];
        });
        setSynthVolume(synthVolumeKnobChangeOptions.options[index]);
    }
    function handleDrumsVolumeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.drumsVolume = drumsVolumeKnobChangeOptions.options[index];
            state.displayLabel = "Drums Volume";
            state.displayValue =
                drumsVolumeKnobChangeOptions.displayLabels[index];
        });
        setDrumsVolume(drumsVolumeKnobChangeOptions.options[index]);
    }
    function handleWaveformChange(index: number) {
        useGlobalStore.setState((state) => {
            state.waveform = waveformKnobChangeOptions.options[
                index
            ] as Waveform;
            state.displayLabel = "Waveform";
            state.displayValue = waveformKnobChangeOptions.displayLabels[index];
        });
        setWaveform(waveformKnobChangeOptions.options[index] as Waveform);
    }
    function handleVoiceModeChange(index: number) {
        useGlobalStore.setState((state) => {
            state.voiceMode = voiceModeKnobChangeOptions.options[
                index
            ] as VoiceMode;
            state.displayLabel = "Voice Mode";
            state.displayValue =
                voiceModeKnobChangeOptions.displayLabels[index];
        });
        setVoiceMode(voiceModeKnobChangeOptions.options[index] as VoiceMode);
    }
    function handleAttackChange(index: number) {
        useGlobalStore.setState((state) => {
            state.attack = attackKnobChangeOptions.options[index];
            state.displayLabel = "Attack";
            state.displayValue = attackKnobChangeOptions.displayLabels[index];
        });
        setAttack(attackKnobChangeOptions.options[index]);
    }
    function handleDecayChange(index: number) {
        useGlobalStore.setState((state) => {
            state.decay = decayKnobChangeOptions.options[index];
            state.displayLabel = "Decay";
            state.displayValue = decayKnobChangeOptions.displayLabels[index];
        });
        setDecay(decayKnobChangeOptions.options[index]);
    }
    function handleSustainChange(index: number) {
        useGlobalStore.setState((state) => {
            state.sustain = sustainKnobChangeOptions.options[index];
            state.displayLabel = "Sustain";
            state.displayValue = sustainKnobChangeOptions.displayLabels[index];
        });
        setSustain(sustainKnobChangeOptions.options[index]);
    }
    function handleReleaseChange(index: number) {
        useGlobalStore.setState((state) => {
            state.release = releaseKnobChangeOptions.options[index];
            state.displayLabel = "Release";
            state.displayValue = releaseKnobChangeOptions.displayLabels[index];
        });
        setRelease(releaseKnobChangeOptions.options[index]);
    }

    return (
        <group position={position}>
            <mesh
                geometry={genericPlaneGeometry}
                scale={[16, 1.25, 1]}
            >
                <meshBasicMaterial
                    color={"black"}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <Text
                fontWeight={"bold"}
                position={[0, 0, 0.1]}
            >
                <meshBasicMaterial
                    color={colors.background}
                    toneMapped={false}
                />
                INSTRUMENT
            </Text>
            <ValuesKnob
                position={[-6, -2.5, 0]}
                values={synthVolumeKnobChangeOptions.knobValues}
                startIndex={synthVolumeKnobChangeOptions.options.indexOf(
                    synthVolume
                )}
                label={"SYNTH\nVOLUME"}
                onChange={(index) => {
                    handleSynthVolumeChange(index);
                }}
            />
            <ValuesKnob
                position={[-2, -2.5, 0]}
                values={drumsVolumeKnobChangeOptions.knobValues}
                startIndex={drumsVolumeKnobChangeOptions.options.indexOf(
                    drumsVolume
                )}
                label={"DRUMS\nVOLUME"}
                onChange={(index) => {
                    handleDrumsVolumeChange(index);
                }}
            />
            <ValuesKnob
                position={[2, -2.5, 0]}
                values={waveformKnobChangeOptions.knobValues}
                startIndex={waveformKnobChangeOptions.options.indexOf(waveform)}
                label={"WAVEFORM"}
                onChange={(index) => {
                    handleWaveformChange(index);
                }}
            />
            <ValuesKnob
                position={[6, -2.5, 0]}
                values={voiceModeKnobChangeOptions.knobValues}
                startIndex={voiceModeKnobChangeOptions.options.indexOf(
                    voiceMode
                )}
                label={"VOICE\nMODE"}
                onChange={(index) => {
                    handleVoiceModeChange(index);
                }}
            />
            <ValuesKnob
                position={[-6, -6, 0]}
                values={attackKnobChangeOptions.knobValues}
                startIndex={attackKnobChangeOptions.options.indexOf(attack)}
                label={"ATTACK"}
                onChange={(index) => {
                    handleAttackChange(index);
                }}
            />
            <ValuesKnob
                position={[-2, -6, 0]}
                values={decayKnobChangeOptions.knobValues}
                startIndex={decayKnobChangeOptions.options.indexOf(decay)}
                label={"DECAY"}
                onChange={(index) => {
                    handleDecayChange(index);
                }}
            />
            <ValuesKnob
                position={[2, -6, 0]}
                values={sustainKnobChangeOptions.knobValues}
                startIndex={sustainKnobChangeOptions.options.indexOf(sustain)}
                label={"SUSTAIN"}
                onChange={(index) => {
                    handleSustainChange(index);
                }}
            />
            <ValuesKnob
                position={[6, -6, 0]}
                values={releaseKnobChangeOptions.knobValues}
                startIndex={releaseKnobChangeOptions.options.indexOf(release)}
                label={"RELEASE"}
                onChange={(index) => {
                    handleReleaseChange(index);
                }}
            />
        </group>
    );
}

function TimingControls({ position }: { position: [number, number, number] }) {
    const [npm, setNpm] = useState(useGlobalStore.getState().npm);

    const npmKnobChangeOptions = {
        knobValues: [60, 120, 180, 240, 300, 360, 420, 480],
        displayLabels: [60, 120, 180, 240, 300, 360, 420, 480],
        options: [60, 120, 180, 240, 300, 360, 420, 480],
    };

    function handleNpmChange(index: number) {
        useGlobalStore.setState((state) => {
            state.npm = npmKnobChangeOptions.options[index];
            state.displayLabel = "Notes Per Minute";
            state.displayValue = npmKnobChangeOptions.displayLabels[index];
        });
        setNpm(npmKnobChangeOptions.options[index]);
    }
    function handleStop() {
        const currentPlayState = useGlobalStore.getState().playState;
        if (currentPlayState === "stopped") return;
        useGlobalStore.setState((state) => {
            state.playState = "stopped";
            state.sequencerCells = useGlobalStore.getState().startingCells;
        });
    }
    function handlePlayPause() {
        if (!useGlobalStore.getState().userHasClicked) return;
        const currentPlayState = useGlobalStore.getState().playState;
        if (currentPlayState === "stopped") {
            useGlobalStore.setState((state) => {
                state.playState = "playing";
                state.startingCells = useGlobalStore.getState().sequencerCells;
                state.currentSequencerIndex = null;
            });
        } else {
            useGlobalStore.setState((state) => {
                state.playState =
                    state.playState === "playing" ? "paused" : "playing";
            });
        }
    }

    return (
        <group position={position}>
            <mesh
                geometry={genericPlaneGeometry}
                scale={[5, 1.25, 1]}
            >
                <meshBasicMaterial
                    color={"black"}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <Text
                fontWeight={"bold"}
                position={[0, 0, 0.1]}
            >
                <meshBasicMaterial
                    color={colors.background}
                    toneMapped={false}
                />
                TIMING
            </Text>
            <ValuesKnob
                position={[0, -2.5, 0]}
                values={npmKnobChangeOptions.knobValues}
                startIndex={npmKnobChangeOptions.options.indexOf(npm)}
                label={"NOTES PER\nMINUTE"}
                onChange={(index) => {
                    handleNpmChange(index);
                }}
            />
            <Instances
                limit={2}
                geometry={genericBoxGeometry}
                material={buttonMaterial}
            >
                <InstancedButtonOrLabel
                    position={[0, -5.5, 0]}
                    scale={0.9}
                    boxScale={[2.25, 1.0, 1]}
                    onClick={() => {
                        handlePlayPause();
                    }}
                >
                    <group
                        position={[0, -5.5, 0]}
                        scale={0.8}
                    >
                        <mesh
                            position={[-0.5, 0, 0.539]}
                            scale={[4.5, 0.1, 4.5]}
                            geometry={arrowGeometry}
                            material={buttonLabelElementMaterial}
                            rotation={[Math.PI / 2, Math.PI / 2, 0]}
                        />
                        <mesh
                            position={[0.2, 0, 1.1]}
                            scale={[0.25, 0.8, 1.0]}
                            geometry={genericBoxGeometry}
                            material={buttonLabelElementMaterial}
                        />
                        <mesh
                            position={[0.6, 0, 1.1]}
                            scale={[0.25, 0.8, 1.0]}
                            geometry={genericBoxGeometry}
                            material={buttonLabelElementMaterial}
                        />
                    </group>
                </InstancedButtonOrLabel>
                <InstancedButtonOrLabel
                    position={[0, -6.5, 0]}
                    scale={0.9}
                    boxScale={[2.25, 1.0, 1]}
                    label="STOP"
                    onClick={() => {
                        handleStop();
                    }}
                    labelScale={0.6}
                    labelZPosition={0.51}
                    labelMaterialElement={staticLabelMaterialElement}
                />
            </Instances>
        </group>
    );
}

export default function Controls() {
    const [sequencerHeight, setSequencerHeight] = useState(
        useGlobalStore.getState().sequencerHeight
    );
    useEffect(() => {
        const unsubSequencerHeight = useGlobalStore.subscribe(
            (state) => state.sequencerHeight,
            (value) => {
                setSequencerHeight(value);
            }
        );
        return () => {
            unsubSequencerHeight();
        };
    });
    return (
        <group position={[0, sequencerHeight, 0]}>
            <Center precise={false}>
                <NoteGroupsControls position={[0, 0, 0]} />
                <CellControls position={[10.5, 0, 0]} />
                <SynthControls position={[24, 0, 0]} />
                <TimingControls position={[35, 0, 0]} />
            </Center>
        </group>
    );
}
