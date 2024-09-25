import { Instance, Instances, useCursor } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
    colors,
    drumTypes,
    genericBoxGeometry,
    sequencerCellScale,
    staticLabelMaterialElement,
} from "./constants";
import InstancedButtonOrLabel from "./controls/InstancedButtonOrLabel";
import { CellEditMode, PointerEventTypes } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

interface DrumCellProps {
    x: number;
    y: number;
    cellEditMode: CellEditMode;
}

function DrumCell({ x, y, cellEditMode }: DrumCellProps) {
    const [alive, setAlive] = useState(
        useGlobalStore.getState().drumCells[x][y].alive
    );
    const [sequenceColumnActive, setSequenceColumnActive] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);
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
            if (useGlobalStore.getState().cameraControlsEnabled) return;
            if (useGlobalStore.getState().cellsIgnorePointerEvents) return;
            if (pointerEventType === "over") {
                setHovered(true);
            }
            if (cellEditMode === null) {
                if (primaryMouse && !alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = true;
                    });
                } else if (secondaryMouse && alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = false;
                    });
                }
            } else if (
                cellEditMode === "alive" ||
                cellEditMode === "invincible"
            ) {
                if (!alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = true;
                    });
                }
            } else if (cellEditMode === "dead") {
                if (alive) {
                    useGlobalStore.setState((state) => {
                        state.drumCells[x][y].alive = false;
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
    const [sequencerLength, setSequencerLength] = useState(
        useGlobalStore.getState().sequencerLength
    );
    const [cellEditMode, setCellEditMode] = useState(
        useGlobalStore.getState().cellEditMode
    );
    const [drumCells, setDrumCells] = useState(
        useGlobalStore.getState().drumCells
    );

    useEffect(() => {
        const unsubSequencerLength = useGlobalStore.subscribe(
            (state) => state.sequencerLength,
            (value) => {
                setSequencerLength(value);
            }
        );
        return () => {
            unsubSequencerLength();
        };
    });
    useEffect(() => {
        const unsubCellEditMode = useGlobalStore.subscribe(
            (state) => state.cellEditMode,
            (value) => {
                setCellEditMode(value);
            }
        );
        return () => {
            unsubCellEditMode();
        };
    });
    useEffect(() => {
        const unsubDrumCells = useGlobalStore.subscribe(
            (state) => state.drumCells,
            (value) => {
                setDrumCells(value);
            }
        );
        return () => {
            unsubDrumCells();
        };
    });

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
                            cellEditMode={cellEditMode}
                        />
                    ))
                )}
            </Instances>
            <Instances
                limit={drumTypes.length}
                geometry={genericBoxGeometry}
            >
                <meshBasicMaterial color={"darkred"} />
                {drumTypes.map((drumType, i) => (
                    <InstancedButtonOrLabel
                        key={i}
                        scale={0.9}
                        boxScale={[2, 1, 0.01]}
                        labelScale={0.55}
                        label={drumType}
                        position={[-1.5, -i - 2, 0]}
                        hoverCursor={false}
                        labelMaterialElement={staticLabelMaterialElement}
                    />
                ))}
            </Instances>
        </group>
    );
}
