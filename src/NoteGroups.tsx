import { Instance, Instances, useCursor } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { chordRoots } from "./constants";
import HtmlLabel from "./HtmlLabel";
import InstrumentArrowSelect from "./InstrumentArrowSelect";
import { generateNoteGroupNotes } from "./noteGroupFunctions";
import { NoteAccidental, NoteName, PointerEventTypes } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

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

function SemitoneButton() {}

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
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [rootName, setRootName] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex].root
    );
    const [semitones, setSemitones] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
            .semitones
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
                setSemitones(currentNoteGroup.semitones);
                setOctaveStart(currentNoteGroup.octaveStart);
                setOctaveIncrement(currentNoteGroup.octaveIncrement);
            }
        );
        return () => {
            unsubIndex();
        };
    });

    function handleChordRootChange(value: string | number) {
        const currentNoteGroupIndex =
            useGlobalStore.getState().currentNoteGroupIndex;
        const currentNoteGroup =
            useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex];
        const sequencerHeight = useGlobalStore.getState().sequencerHeight;
        const newNotes = generateNoteGroupNotes(
            sequencerHeight,
            value as `${NoteName}${NoteAccidental}`,
            currentNoteGroup.semitones,
            currentNoteGroup.octaveStart,
            currentNoteGroup.octaveIncrement
        );
        useGlobalStore.setState((state) => {
            state.noteGroupCells[currentNoteGroupIndex].notes = newNotes;
            state.noteGroupCells[currentNoteGroupIndex].root =
                value as `${NoteName}${NoteAccidental}`;
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
            <InstrumentArrowSelect
                position={[-1, -0.6, 0]}
                scale={2}
                orientation="horizontal"
                label="ROOT"
                options={chordRoots}
                startingOptionIndex={chordRoots.indexOf(rootName)}
                onChange={handleChordRootChange}
            />
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
