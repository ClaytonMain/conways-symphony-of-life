import {
    Html,
    Instance,
    Instances,
    PivotControls,
    useCursor,
    useKeyboardControls,
} from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { chordRoots, octaves } from "./constants";
import HtmlLabel from "./HtmlLabel";
import InstrumentArrowSelect from "./InstrumentArrowSelect";
import { generateNoteGroupNotes } from "./noteGroupFunctions";
import "./NoteGroups.css";
import {
    NoteAccidental,
    NoteGroupChangeMode,
    NoteName,
    NoteOctave,
    PointerEventTypes,
    ShortcutEnum,
} from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";
import ValuesKnob from "./ValuesKnob";

interface NoteGroupCellComponentProps {
    index: number;
    cellHeight: number;
    sequencerHeight: number;
    baseXOffset?: number;
}

function NoteGroupCellComponent({
    index,
    cellHeight,
    sequencerHeight,
    baseXOffset = 0,
}: NoteGroupCellComponentProps) {
    const [subscribeKeys] = useKeyboardControls<ShortcutEnum>();
    const noteGroup = useGlobalStore((state) => state.noteGroupCells[index]);
    const noteGroupEditMode = useGlobalStore(
        (state) => state.noteGroupEditMode
    );
    const [active, setActive] = useState(noteGroup.active);
    const [enabled, setEnabled] = useState(noteGroup.enabled);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    useEffect(() => {
        const unsubActiveIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setActive(value === index);
            }
        );
        return () => {
            unsubActiveIndex();
        };
    });

    useEffect(() => {
        const unsubEnabled = useGlobalStore.subscribe(
            (state) => state.noteGroupCells[index].enabled,
            (value) => {
                setEnabled(value);
            }
        );
        return () => {
            unsubEnabled();
        };
    });

    useEffect(() => {
        const unsubscribeKey = subscribeKeys(
            (state) => state[`key${(index + 1) % 10}` as ShortcutEnum],
            (pressed) => {
                const userHasClicked = useGlobalStore.getState().userHasClicked;
                if (pressed && userHasClicked) {
                    useGlobalStore.setState((state) => {
                        state.noteGroupCells[index].active = true;
                        state.currentNoteGroupIndex = index;
                    });
                }
            }
        );
        return () => {
            unsubscribeKey();
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
        const secondaryMouse = buttonsBinary.charAt(3) === "1";
        // const ctrlKey = e.ctrlKey;

        if (["down", "over"].includes(pointerEventType)) {
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (pointerEventType === "over") {
                setHovered(true);
            }
            if (noteGroupEditMode === null) {
                if (primaryMouse) {
                    if (!active) {
                        useGlobalStore.setState((state) => {
                            state.noteGroupCells[index].active = true;
                            state.currentNoteGroupIndex = index;
                        });
                    }
                } else if (secondaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.noteGroupCells[index].enabled =
                            !state.noteGroupCells[index].enabled;
                    });
                }
            } else {
                // TODO: handle non-null cellEditMode
            }
        }
        if (pointerEventType === "out") {
            setHovered(false);
        }
    }

    return (
        <Instance
            scale={0.95}
            position={[
                -baseXOffset - cellHeight * ((index + 1) % 2),
                sequencerHeight -
                    Math.floor(index / 2) * cellHeight -
                    cellHeight / 2,
                0,
            ]}
            color={active ? "white" : enabled ? "gray" : "black"}
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

interface RowNoteLabelProps {
    index: number;
}

function RowNoteLabel({ index }: RowNoteLabelProps) {
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [note, setNote] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex].notes[
            index
        ].note
    );

    useEffect(() => {
        const unsubNote = useGlobalStore.subscribe(
            (state) =>
                state.noteGroupCells[currentNoteGroupIndex].notes[index].note,
            (value) => {
                setNote(value);
            }
        );
        return () => {
            unsubNote();
        };
    });

    useEffect(() => {
        const unsubNoteGroupIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
                setNote(
                    useGlobalStore.getState().noteGroupCells[value].notes[index]
                        .note
                );
            }
        );
        return () => {
            unsubNoteGroupIndex();
        };
    });

    return (
        <HtmlLabel
            position={[-1.5, index + 0.5, 0]}
            label={note}
        />
    );
}

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

function NoteGroupControls({
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

    const groupChangeDisplayOptions = [
        "SEQUENTIAL",
        "RANDOM",
        "SEMIRANDOM",
        "NONE",
    ];
    const groupChangeModeOptions: NoteGroupChangeMode[] = [
        "sequential",
        "true random",
        "avoid prev random",
        null,
    ];
    function handleGroupChangeModeChange(value: string | number) {
        useGlobalStore.setState((state) => {
            state.noteGroupChangeMode =
                groupChangeModeOptions[
                    groupChangeDisplayOptions.indexOf(value as string)
                ];
        });
    }

    return (
        <group
            position={[
                -baseXOffset - noteGroupCellHeight * 2,
                sequencerHeight - 0.5,
                0,
            ]}
        >
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[4.8, 2.43, 0]}
            >
                <InstrumentArrowSelect
                    position={[4.8, 1.43, 0]}
                    roundedBoxProps={{ args: [4, 1.5, 1] }}
                    orientation="horizontal"
                    label="GRP CHNG MODE"
                    options={groupChangeDisplayOptions}
                    startingOptionIndex={groupChangeModeOptions.indexOf(
                        noteGroupChangeMode
                    )}
                    onChange={(value) => {
                        handleGroupChangeModeChange(value);
                    }}
                    labelStyle={{ width: "100px", fontSize: "0.5rem" }}
                    optionStyle={{ width: "100px", fontSize: "1.0rem" }}
                />
            </PivotControls>
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[-1, 0.5, 0]}
            >
                <InstrumentArrowSelect
                    position={[-1, -0.35, 0]}
                    roundedBoxProps={{ args: [2, 1.5, 1] }}
                    orientation="horizontal"
                    label="ROOT"
                    options={chordRoots}
                    startingOptionIndex={chordRoots.indexOf(rootName)}
                    onChange={(value) => {
                        handleNoteGenerationParamsChange(value, "chordRoot");
                    }}
                />
            </PivotControls>
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[-1.0, -1.3, 0]}
            >
                <SemitoneControls position={[-0.5, -2.3, 0]} />
            </PivotControls>
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[-1, -8.2, 0]}
            >
                <InstrumentArrowSelect
                    position={[-1, -9.2, 0]}
                    roundedBoxProps={{ args: [2, 1.5, 1] }}
                    orientation="horizontal"
                    label="8VE STRT"
                    options={octaves}
                    startingOptionIndex={octaves.indexOf(octaveStart)}
                    onChange={(value) => {
                        handleNoteGenerationParamsChange(value, "octaveStart");
                    }}
                />
            </PivotControls>
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[-1, -10, 0]}
            >
                <InstrumentArrowSelect
                    position={[-1, -11.0, 0]}
                    roundedBoxProps={{ args: [2, 1.5, 1] }}
                    orientation="horizontal"
                    label="8VE++"
                    options={octaveIncrements}
                    startingOptionIndex={octaveIncrements.indexOf(
                        octaveIncrement
                    )}
                    onChange={(value) => {
                        handleNoteGenerationParamsChange(
                            value,
                            "octaveIncrement"
                        );
                    }}
                />
            </PivotControls>
            <PivotControls
                enabled={pivotControlsEnabled}
                activeAxes={[true, true, false]}
                depthTest={false}
                offset={[0, 0, 0]}
            >
                <ValuesKnob
                    values={[1, 2, 4, 8, 16]}
                    startIndex={2}
                    position={[-1, 6, 0]}
                    label="NPG"
                    onChange={(value) => {
                        useGlobalStore.setState({ npg: value as number });
                    }}
                />
            </PivotControls>
        </group>
    );
}

export default function NoteGroups() {
    // const currentNoteGroupIndex = useGlobalStore(
    //     (state) => state.currentNoteGroupIndex
    // );
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
    // const noteGroupChangeMode = useGlobalStore(
    //     (state) => state.noteGroupChangeMode
    // );
    const noteGroupCells = useGlobalStore((state) => state.noteGroupCells);
    // const noteGroupEditMode = useGlobalStore(
    //     (state) => state.noteGroupEditMode
    // );
    const noteGroupCellHeight = (sequencerHeight / 10) * 2;
    const baseXOffset = 4.1;

    return (
        <group position={[0, -0.5, 0]}>
            <Instances limit={noteGroupCells.length}>
                <planeGeometry
                    args={[noteGroupCellHeight, noteGroupCellHeight]}
                />
                <meshBasicMaterial />
                {noteGroupCells.map((_, i) => {
                    return (
                        <NoteGroupCellComponent
                            key={i}
                            index={i}
                            cellHeight={noteGroupCellHeight}
                            sequencerHeight={sequencerHeight}
                            baseXOffset={baseXOffset}
                        />
                    );
                })}
            </Instances>
            {Array.from({ length: sequencerHeight }).map((_, i) => {
                return (
                    <RowNoteLabel
                        key={i}
                        index={i}
                    />
                );
            })}
            <NoteGroupControls
                noteGroupCellHeight={noteGroupCellHeight}
                sequencerHeight={sequencerHeight}
                baseXOffset={baseXOffset}
            />
        </group>
    );
}
