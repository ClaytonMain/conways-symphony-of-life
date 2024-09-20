import {
    Html,
    Instance,
    Instances,
    PivotControls,
    Text,
    useCursor,
} from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
    arrowGeometry,
    buttonLabelElementMaterial,
    chordRoots,
    colors,
    genericBoxGeometry,
    octaves,
    sequencerCellScale,
} from "../constants";
import { generateNoteGroupNotes } from "../noteGroupFunctions";
import {
    NoteAccidental,
    NoteGroupChangeMode,
    noteGroupSelectMode,
    NoteName,
    NoteOctave,
    PointerEventTypes,
    Waveform,
} from "../sharedTypes";
import { useGlobalStore } from "../stores/useGlobalStore";
import InstrumentArrowSelect from "./InstrumentArrowSelect";
import InstrumentButton from "./InstrumentButton";
import RangeKnob from "./RangeKnob";
import ValuesKnob from "./ValuesKnob";

interface SemitoneButtonProps {
    index: number;
}

function SemitoneButton({ index }: SemitoneButtonProps) {
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [active, setActive] = useState(
        useGlobalStore
            .getState()
            .noteGroupCells[currentNoteGroupIndex].semitones.includes(index)
    );
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    useEffect(() => {
        const unsubNoteGroupIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
                setActive(
                    useGlobalStore
                        .getState()
                        .noteGroupCells[value].semitones.includes(index)
                );
            }
        );
        return () => {
            unsubNoteGroupIndex();
        };
    });

    function handlePointerEvents({
        e,
        pointerEventType,
    }: {
        e: ThreeEvent<PointerEvent>;
        pointerEventType: PointerEventTypes;
    }) {
        const buttonsBinary = e.buttons.toString(2).padStart(5, "0");
        const primaryMouse = buttonsBinary.charAt(4) === "1";

        if (["down", "over"].includes(pointerEventType)) {
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (pointerEventType === "over") {
                setHovered(true);
            }
            if (primaryMouse) {
                const activeSemitones =
                    useGlobalStore.getState().noteGroupCells[
                        currentNoteGroupIndex
                    ].semitones;
                let newSemitones: number[] = [];
                if (!active) {
                    newSemitones = [...activeSemitones, index];
                    newSemitones.sort((a, b) => a - b);
                } else {
                    activeSemitones.forEach((semitone) => {
                        if (semitone !== index) {
                            newSemitones.push(semitone);
                        }
                    });
                }
                setActive(!active);
                const currentNoteGroup =
                    useGlobalStore.getState().noteGroupCells[
                        currentNoteGroupIndex
                    ];
                const sequencerHeight =
                    useGlobalStore.getState().sequencerHeight;
                const newNotes = generateNoteGroupNotes(
                    sequencerHeight,
                    currentNoteGroup.root,
                    newSemitones,
                    currentNoteGroup.octaveStart,
                    currentNoteGroup.octaveIncrement
                );
                console.log(newSemitones);
                useGlobalStore.setState((state) => {
                    state.noteGroupCells[currentNoteGroupIndex].notes =
                        newNotes;
                    state.noteGroupCells[currentNoteGroupIndex].semitones =
                        newSemitones;
                });
            }
        }
        if (pointerEventType === "out") {
            setHovered(false);
        }
    }

    return (
        <Instance
            scale={0.95}
            position={[-2 + Math.floor(index / 6), (index % 6) - 5, 0]}
            color={active ? "white" : "black"}
            onPointerDown={(e) => {
                handlePointerEvents({ e, pointerEventType: "down" });
            }}
            onPointerOver={(e) => {
                handlePointerEvents({ e, pointerEventType: "over" });
            }}
            onPointerOut={(e) => {
                handlePointerEvents({ e, pointerEventType: "out" });
            }}
        />
    );
}
interface SemitoneControlsProps {
    position?: [number, number, number];
}
function SemitoneControls({ position = [0, 0, 0] }: SemitoneControlsProps) {
    return (
        <group position={position}>
            <Html
                center
                transform
                distanceFactor={10}
                className="semitone-controls-header"
                position={[-0.5, 0.8, 0]}
            >
                SEMITONES
            </Html>
            <Instances limit={24}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial />
                {Array.from({ length: 24 }).map((_, i) => {
                    return (
                        <SemitoneButton
                            key={i}
                            index={i}
                        />
                    );
                })}
            </Instances>
            {Array.from({ length: 6 }).map((_, i) => {
                return (
                    <Html
                        key={i}
                        center
                        transform
                        distanceFactor={10}
                        className="semitone-controls-label"
                        position={[-2.75, -5 + i, 0]}
                    >
                        {i}
                    </Html>
                );
            })}
            {Array.from({ length: 4 }).map((_, i) => {
                return (
                    <Html
                        key={i}
                        center
                        transform
                        distanceFactor={10}
                        className="semitone-controls-label"
                        position={[-2 + i, -5.75, 0]}
                    >
                        {i * 6}
                    </Html>
                );
            })}
        </group>
    );
}
interface NoteGroupControlsProps {
    noteGroupCellHeight: number;
    sequencerHeight: number;
    baseXOffset?: number;
}

function NoteGroupsControls({
    noteGroupCellHeight,
    sequencerHeight,
    baseXOffset = 0,
}: NoteGroupControlsProps) {
    const pivotControlsEnabled = useGlobalStore(
        (state) => state.pivotControlsEnabled
    );
    const octaveIncrements = [-3, -2, -1, 0, 1, 2, 3];
    const noteGroupChangeMode = useGlobalStore(
        (state) => state.noteGroupChangeMode
    );
    const noteGroupSelectMode = useGlobalStore(
        (state) => state.noteGroupSelectMode
    );
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [rootName, setRootName] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex].root
    );
    const [octaveStart, setOctaveStart] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
            .octaveStart
    );
    const [octaveIncrement, setOctaveIncrement] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
            .octaveIncrement
    );

    useEffect(() => {
        const unsubIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
                const currentNoteGroup =
                    useGlobalStore.getState().noteGroupCells[value];
                setRootName(currentNoteGroup.root);
                setOctaveStart(currentNoteGroup.octaveStart);
                setOctaveIncrement(currentNoteGroup.octaveIncrement);
            }
        );
        return () => {
            unsubIndex();
        };
    });

    function handleNoteGenerationParamsChange(
        value: string | number,
        callingFrom: "chordRoot" | "octaveStart" | "octaveIncrement"
    ) {
        const currentNoteGroupIndex =
            useGlobalStore.getState().currentNoteGroupIndex;
        const currentNoteGroup =
            useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex];
        const sequencerHeight = useGlobalStore.getState().sequencerHeight;
        const chordRoot =
            callingFrom === "chordRoot"
                ? (value as `${NoteName}${NoteAccidental}`)
                : currentNoteGroup.root;
        const octaveStart =
            callingFrom === "octaveStart"
                ? (value as NoteOctave)
                : currentNoteGroup.octaveStart;
        const octaveIncrement =
            callingFrom === "octaveIncrement"
                ? (value as number)
                : currentNoteGroup.octaveIncrement;
        const newNotes = generateNoteGroupNotes(
            sequencerHeight,
            chordRoot,
            currentNoteGroup.semitones,
            octaveStart,
            octaveIncrement
        );
        useGlobalStore.setState((state) => {
            state.noteGroupCells[currentNoteGroupIndex].notes = newNotes;
            state.noteGroupCells[currentNoteGroupIndex].root = chordRoot;
            state.noteGroupCells[currentNoteGroupIndex].octaveStart =
                octaveStart;
            state.noteGroupCells[currentNoteGroupIndex].octaveIncrement =
                octaveIncrement;
        });
    }

    const groupSelectModeDisplayOptions = ["TGGL", "ACTV", "KBM"];
    const groupSelectModeDisplayLabels = ["TOGGLE", "ACTIVATE", "KBM"];
    const groupSelectModeOptions: noteGroupSelectMode[] = [
        "toggle",
        "activate",
        null,
    ];

    const groupChangeDisplayOptions = ["SEQ", "RND", "SRND", "OFF"];
    const groupChangeDisplayLabels = [
        "SEQUENTIAL",
        "RANDOM",
        "SEMI-RANDOM",
        "OFF",
    ];
    const groupChangeModeOptions: NoteGroupChangeMode[] = [
        "sequential",
        "true random",
        "avoid prev random",
        null,
    ];

    function handleGroupChangeModeChange(value: string | number) {
        const index = groupChangeDisplayOptions.indexOf(value as string);
        useGlobalStore.setState((state) => {
            state.noteGroupChangeMode = groupChangeModeOptions[index];
            state.displayLabel = "Group Change Mode";
            state.displayValue = groupChangeDisplayLabels[index];
        });
    }

    function handleGroupSelectModeChange(value: string | number) {
        const index = groupSelectModeDisplayOptions.indexOf(value as string);
        useGlobalStore.setState((state) => {
            state.noteGroupSelectMode = groupSelectModeOptions[index];
            state.displayLabel = "Group Select Mode";
            state.displayValue = groupSelectModeDisplayLabels[index];
        });
    }

    return (
        <group
            position={[
                -baseXOffset - noteGroupCellHeight * 2,
                sequencerHeight,
                0,
            ]}
        >
            <mesh>
                <planeGeometry args={[10, 1.25]} />
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
                position={[-3.5, -2.5, 0]}
                values={groupSelectModeDisplayOptions}
                startIndex={groupSelectModeOptions.indexOf(noteGroupSelectMode)}
                label={"NOTE GROUP\nSELECT MODE"}
                onChange={(value) => {
                    handleGroupSelectModeChange(value);
                }}
            />
            <ValuesKnob
                position={[0, -2.5, 0]}
                values={groupChangeDisplayOptions}
                startIndex={groupChangeModeOptions.indexOf(noteGroupChangeMode)}
                label={"GROUP\nCHANGE\nMODE"}
                onChange={(value) => {
                    handleGroupChangeModeChange(value);
                }}
            />
            <InstrumentButton
                position={[3.5, -2.5, 0]}
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

interface CellControlsProps {
    sequencerLength: number;
    sequencerHeight: number;
}

function CellControls({ sequencerLength, sequencerHeight }: CellControlsProps) {
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
    const nptValues = [1, 2, 4, 8, 16];
    return (
        <>
            <InstrumentButton
                position={[sequencerLength - 2, sequencerHeight + 0.5, 0]}
                buttonScale={[
                    sequencerCellScale + 2,
                    sequencerCellScale + 0.5,
                    1,
                ]}
                label="CLEAR"
                labelDistanceFactor={20}
                onClick={() => handleClear()}
            />
            <InstrumentButton
                position={[sequencerLength - 5, sequencerHeight + 0.5, 0]}
                buttonScale={[
                    sequencerCellScale + 2,
                    sequencerCellScale + 0.5,
                    1,
                ]}
                label="RAND"
                labelDistanceFactor={20}
                onClick={() => handleRandomize()}
            />
            <InstrumentButton
                position={[sequencerLength - 8, sequencerHeight + 0.5, 0]}
                buttonScale={[
                    sequencerCellScale + 2,
                    sequencerCellScale + 0.5,
                    1,
                ]}
                label="STOP"
                labelDistanceFactor={20}
                onClick={() => handleStop()}
            />
            <InstrumentButton
                position={[sequencerLength - 11, sequencerHeight + 0.5, 0]}
                buttonScale={[
                    sequencerCellScale + 2,
                    sequencerCellScale + 0.5,
                    1,
                ]}
                onClick={() => handlePlayPause()}
                children={
                    <group onClick={() => handlePlayPause()}>
                        <mesh
                            position={[-0.5, 0, 0.25]}
                            scale={[4.5, 1, 4.5]}
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
                }
            />
            <RangeKnob
                position={[sequencerLength + 2, sequencerHeight - 0.5, 0]}
                ticks={8}
                snap={true}
                label="NPM"
                startValue={useGlobalStore.getState().npm}
                onChange={(value) => {
                    useGlobalStore.setState({ npm: value });
                }}
                minValue={60}
                maxValue={480}
            />
            <ValuesKnob
                values={nptValues}
                position={[sequencerLength + 2, sequencerHeight - 4, 0]}
                startIndex={nptValues.indexOf(
                    useGlobalStore.getState().npt as number
                )}
                label="NPT"
                onChange={(value) => {
                    useGlobalStore.setState({ npt: value as number });
                }}
            />
            <InstrumentArrowSelect
                position={[sequencerLength + 3, sequencerHeight - 8, 0]}
                centerScale={[4, 1.5, 1]}
                label="WAVEFORM"
                options={["SINE", "SQUARE", "SAWTOOTH", "TRIANGLE"]}
                startingOptionIndex={0}
                onChange={(value) => {
                    useGlobalStore.setState({
                        waveform: value.toString().toLowerCase() as Waveform,
                    });
                }}
            />
            {/* <InstrumentArrowSelect
                position={[sequencerLength + 3, sequencerHeight - 11, 0]}
                centerScale={[4, 1.5, 1]}
                label="CELL SET MODE" */}
        </>
    );
}

function SynthControls() {
    return null;
}

function TimingControls() {
    return null;
}

export default function Controls() {
    const {
        noteGroupCellHeight,
        sequencerLength,
        sequencerHeight,
        noteGroupCellXOffset,
    } = useGlobalStore((state) => state);
    return (
        <>
            <NoteGroupsControls
                noteGroupCellHeight={noteGroupCellHeight}
                sequencerHeight={sequencerHeight}
                baseXOffset={noteGroupCellXOffset}
            />
            <CellControls
                sequencerLength={sequencerLength}
                sequencerHeight={sequencerHeight}
            />
            <SynthControls />
            <TimingControls />
        </>
    );
}
