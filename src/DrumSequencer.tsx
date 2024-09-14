import { Instance, Instances, useCursor } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { colors, drumTypes, sequencerCellScale } from "./constants";
import HtmlLabel from "./HtmlLabel";
import { PointerEventTypes } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

interface DrumCellProps {
    x: number;
    y: number;
}

function DrumCell({ x, y }: DrumCellProps) {
    const drumCellRecord = useGlobalStore((state) => state.drumCells[x][y]);
    const drumEditMode = useGlobalStore((state) => state.drumEditMode);
    const [alive, setAlive] = useState(drumCellRecord.alive);
    const [sequenceColumnActive, setSequenceColumnActive] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);
    // const [sequenceRowActive, setSequenceRowActive] = useState(false);
    // const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
    //     useGlobalStore.getState().currentNoteGroupIndex
    // );
    useCursor(hovered);

    useEffect(() => {
        const unsubAlive = useGlobalStore.subscribe(
            (state) => state.drumCells[x][y].alive,
            (value) => {
                setAlive(value);
            }
        );
        return () => {
            unsubAlive();
        };
    });

    useEffect(() => {
        const unsubSequenceColumnActive = useGlobalStore.subscribe(
            (state) => state.currentSequencerIndex,
            (value) => {
                setSequenceColumnActive(value === x);
                if (value === x && alive) {
                    setPlaying(true);
                } else {
                    setPlaying(false);
                }
            }
        );
        return () => {
            unsubSequenceColumnActive();
        };
    });

    useEffect(() => {
        const unsubPlayState = useGlobalStore.subscribe(
            (state) => state.playState,
            (value) => {
                if (value === "stopped") {
                    setPlaying(false);
                    setSequenceColumnActive(false);
                }
            }
        );
        return () => {
            unsubPlayState();
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

        if (["down", "over"].includes(pointerEventType)) {
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (pointerEventType === "over") {
                setHovered(true);
            }
            if (drumEditMode === null) {
                if (primaryMouse && !alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = true;
                    });
                } else if (secondaryMouse && alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = false;
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
            position={[x, -y - 2, 0]}
            scale={[sequencerCellScale, sequencerCellScale, 1]}
            color={
                playing
                    ? colors.playingCell
                    : alive
                    ? colors.aliveCell
                    : sequenceColumnActive
                    ? colors.activeCell
                    : colors.deadCell
            }
            onPointerDown={(e) =>
                handlePointerEvents({ e, pointerEventType: "down" })
            }
            onPointerOver={(e) =>
                handlePointerEvents({ e, pointerEventType: "over" })
            }
            onPointerOut={(e) =>
                handlePointerEvents({ e, pointerEventType: "out" })
            }
        />
    );
}

export default function DrumSequencer() {
    const sequencerLength = useGlobalStore((state) => state.sequencerLength);
    const drumCells = useGlobalStore((state) => state.drumCells);

    return (
        <group>
            <Instances limit={sequencerLength * drumCells[0].length}>
                <planeGeometry />
                <meshBasicMaterial />
                {drumCells.map((row, x) =>
                    row.map((_, y) => (
                        <DrumCell
                            key={`${x},${y}`}
                            x={x}
                            y={y}
                        />
                    ))
                )}
            </Instances>
            {drumTypes.map((drumType, index) => (
                <HtmlLabel
                    key={index}
                    position={[-1.5, -index - 2, 0]}
                    label={drumType}
                    styleUpdate={{
                        fontSize: "1rem",
                    }}
                />
            ))}
        </group>
    );
}
