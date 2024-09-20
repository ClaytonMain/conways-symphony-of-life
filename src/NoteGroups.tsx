import {
    Instance,
    Instances,
    useCursor,
    useKeyboardControls,
} from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { colors, genericBoxGeometry } from "./constants";
import InstancedButtonOrLabel from "./controls/InstancedButtonOrLabel";
import "./NoteGroups.css";
import { PointerEventTypes, ShortcutEnum } from "./sharedTypes";
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
    const [subscribeKeys] = useKeyboardControls<ShortcutEnum>();
    const noteGroup = useGlobalStore((state) => state.noteGroupCells[index]);
    const noteGroupSelectMode = useGlobalStore(
        (state) => state.noteGroupSelectMode
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
            if (noteGroupSelectMode === null) {
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
            } else if (noteGroupSelectMode === "activate") {
                if (primaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.noteGroupCells[index].active = true;
                        state.currentNoteGroupIndex = index;
                    });
                }
            } else if (noteGroupSelectMode === "toggle") {
                if (primaryMouse) {
                    useGlobalStore.setState((state) => {
                        state.noteGroupCells[index].enabled =
                            !state.noteGroupCells[index].enabled;
                    });
                }
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
            color={
                active
                    ? colors.playingCell
                    : enabled
                    ? colors.activeCell
                    : colors.deadCell
            }
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

export default function NoteGroups() {
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
    const noteGroupCells = useGlobalStore((state) => state.noteGroupCells);
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [notes, setNotes] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex].notes
    );
    const noteGroupCellHeight = useGlobalStore(
        (state) => state.noteGroupCellHeight
    );
    const baseXOffset = useGlobalStore((state) => state.noteGroupCellXOffset);

    useEffect(() => {
        const unsubNoteGroupIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
            }
        );
        return () => {
            unsubNoteGroupIndex();
        };
    });
    useEffect(() => {
        const unsubNotes = useGlobalStore.subscribe(
            (state) => state.noteGroupCells[currentNoteGroupIndex].notes,
            (value) => {
                setNotes(value);
            }
        );
        return () => {
            unsubNotes();
        };
    });

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
            <Instances
                limit={sequencerHeight}
                geometry={genericBoxGeometry}
            >
                <meshBasicMaterial color={"darkred"} />
                {notes.map((note, i) => {
                    return (
                        <InstancedButtonOrLabel
                            key={i}
                            scale={0.9}
                            boxScale={[2, 1, 0.01]}
                            labelScale={0.75}
                            label={note.frequency.toNote()}
                            position={[-1.5, i + 0.5, 0]}
                            hoverCursor={false}
                            labelMaterialElement={
                                <meshBasicMaterial
                                    color="white"
                                    toneMapped={false}
                                />
                            }
                        />
                    );
                })}
            </Instances>
        </group>
    );
}
