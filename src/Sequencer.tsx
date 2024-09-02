import { Instance, Instances } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { aliveStates, sequencerCellScale } from "./constants";
import { useGlobalStore } from "./stores/useGlobalStore";

type PointerEventTypes = "down" | "over" | "out";

interface SequencerCellProps {
    index: number;
}

function SequencerCell({ index }: SequencerCellProps) {
    const cellRecord = useGlobalStore((state) => state.sequencerCells[index]);
    const cellEditMode = useGlobalStore((state) => state.cellEditMode);
    const [alive, setAlive] = useState(aliveStates.includes(cellRecord.state));
    const [playing, setPlaying] = useState(cellRecord.playing);
    const [sequenceColumnActive, setSequenceColumnActive] = useState(false);
    // const [sequenceRowActive, setSequenceRowActive] = useState(false);
    // const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
    //     useGlobalStore.getState().currentNoteGroupIndex
    // );

    useEffect(() => {
        const unsubState = useGlobalStore.subscribe(
            (state) => state.sequencerCells[index].state,
            (value) => {
                if (aliveStates.includes(value)) {
                    setAlive(true);
                } else {
                    setAlive(false);
                }
            }
        );
        return () => {
            unsubState();
        };
    });

    useEffect(() => {
        const unsubPlaying = useGlobalStore.subscribe(
            (state) => state.sequencerCells[index].playing,
            (value) => {
                setPlaying(value);
            }
        );
        return () => {
            unsubPlaying();
        };
    });

    useEffect(() => {
        const unsubSequenceColumnActive = useGlobalStore.subscribe(
            (state) => state.currentSequencerIndex,
            (value) => {
                setSequenceColumnActive(value === cellRecord.x);
            }
        );
        return () => {
            unsubSequenceColumnActive();
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
        const ctrlKey = e.ctrlKey;

        if (["down", "over"].includes(pointerEventType)) {
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (cellEditMode === null) {
                if (primaryMouse) {
                    if (cellRecord.state !== "invincible" && ctrlKey) {
                        useGlobalStore.setState((state) => {
                            state.sequencerCells[index].state = "invincible";
                        });
                    } else if (cellRecord.state !== "alive" && !ctrlKey) {
                        useGlobalStore.setState((state) => {
                            state.sequencerCells[index].state = "alive";
                        });
                    }
                } else if (secondaryMouse && alive) {
                    useGlobalStore.setState((state) => {
                        state.sequencerCells[index].state = "dead";
                    });
                }
            }
        }
    }

    return (
        <Instance
            position={[cellRecord.x, cellRecord.y, 0]}
            scale={[sequencerCellScale, sequencerCellScale, 1]}
            color={
                alive
                    ? "yellow"
                    : playing
                    ? "white"
                    : sequenceColumnActive
                    ? "gray"
                    : "black"
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

export default function Sequencer() {
    const sequencerLength = useGlobalStore((state) => state.sequencerLength);
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
    const sequencerCells = useGlobalStore((state) => state.sequencerCells);

    return (
        <group>
            <Instances limit={sequencerLength * sequencerHeight}>
                <planeGeometry />
                <meshBasicMaterial />
                {Object.keys(sequencerCells).map((cellKey) => (
                    <SequencerCell
                        key={cellKey}
                        index={parseInt(cellKey)}
                    />
                ))}
            </Instances>
        </group>
    );
}
