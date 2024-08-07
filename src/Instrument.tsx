import { Instance, Instances, Text, useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { drumTypes } from "./constants";
import { CellColors, CellType, DrumCellRecord, DrumType } from "./sharedTypes";
import { useGridStore } from "./useGridStore";

type PointerEventTypes = "down" | "over" | "out";

interface CellProps {
    id: string;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
    cellColors: CellColors;
    setCellState: (x: number, y: number, alive: boolean) => void;
    setCellType: (x: number, y: number, cellType: CellType) => void;
}

function Cell({
    id,
    x,
    y,
    xOffset,
    yOffset,
    cellScale,
    cellColors,
    setCellState,
    setCellType,
}: CellProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const cellRecord = useGridStore.getState().cells[id];
    const [alive, setAlive] = useState<boolean>(cellRecord.alive);
    const [sequenceActive, setSequenceActive] = useState<boolean>(false);
    const activeConfig = useGridStore((state) => state.activeConfig);
    const noteEnabled = useGridStore(
        (state) => state.noteConfigs[activeConfig][y].enabled
    );

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
            if (primaryMouse) {
                if (!alive) {
                    setCellState(x, y, true);
                }
                setCellType(x, y, ctrlKey ? "invincible" : "normal");
            } else if (secondaryMouse && alive) {
                setCellState(x, y, false);
                setCellType(x, y, "normal");
            }
        }
    }

    useEffect(() => {
        const unsubscribeCellAlive = useGridStore.subscribe(
            (state) => state.cells[id].alive,
            (value) => {
                setAlive(value);
            }
        );
        return () => {
            unsubscribeCellAlive();
        };
    });

    useEffect(() => {
        const unsubscribeCurrentSequenceColumn = useGridStore.subscribe(
            (state) => state.currentSequenceColumn,
            (value) => {
                if (value === x) {
                    setSequenceActive(true);
                } else {
                    setSequenceActive(false);
                }
            }
        );
        return () => {
            unsubscribeCurrentSequenceColumn();
        };
    });

    return (
        <Instance
            ref={ref}
            position={[x - xOffset, y - yOffset, 0]}
            scale={[cellScale, cellScale, 1]}
            color={
                alive
                    ? noteEnabled
                        ? sequenceActive
                            ? cellColors.alivePlaying
                            : cellColors.alive
                        : cellColors.aliveDisabled
                    : noteEnabled
                    ? cellColors.dead
                    : cellColors.deadDisabled
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

interface InvincibleCellDecoratorProps {
    id: string;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
    cellColors: CellColors;
}

function InvincibleCellDecorator({
    id,
    x,
    y,
    xOffset,
    yOffset,
    cellScale,
    cellColors,
}: InvincibleCellDecoratorProps) {
    const cellRecord = useGridStore.getState().cells[id];
    const [invincible, setInvincible] = useState<boolean>(
        cellRecord.cellType === "invincible"
    );
    const activeConfig = useGridStore((state) => state.activeConfig);
    const noteEnabled = useGridStore(
        (state) => state.noteConfigs[activeConfig][y].enabled
    );

    useEffect(() => {
        const unsubscribeCellType = useGridStore.subscribe(
            (state) => state.cells[id].cellType,
            (value) => {
                if (value === "invincible") {
                    setInvincible(true);
                } else if (value === "normal") {
                    setInvincible(false);
                }
            }
        );
        return () => {
            unsubscribeCellType();
        };
    });

    return (
        <>
            {invincible && (
                <Instance
                    position={[x - xOffset, y - yOffset, 0.01]}
                    scale={[cellScale * 0.5, cellScale * 0.5, 0.1]}
                    color={
                        noteEnabled ? cellColors.dead : cellColors.deadDisabled
                    }
                />
            )}
        </>
    );
}

interface RowToggleProps {
    id: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
}

function RowToggle({ id, xOffset, yOffset, cellScale }: RowToggleProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const activeConfig = useGridStore((state) => state.activeConfig);
    const rowEnabled = useGridStore(
        (state) => state.noteConfigs[activeConfig][id].enabled
    );
    const cellColors = useGridStore((state) => state.cellColors);
    useFrame(() => {
        ref.current.position.x = THREE.MathUtils.lerp(
            ref.current.position.x,
            -xOffset - (rowEnabled ? 1 : 2),
            0.1
        );
    });
    return (
        <Instance
            ref={ref}
            position={[-xOffset, id - yOffset, 0]}
            scale={[cellScale * 0.8, cellScale * 0.8, 1.0]}
            color={rowEnabled ? cellColors.alive : cellColors.deadDisabled}
        />
    );
}

interface RowToggleBackgroundProps {
    id: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
}

function RowToggleBackground({
    id,
    xOffset,
    yOffset,
    cellScale,
}: RowToggleBackgroundProps) {
    const activeConfig = useGridStore((state) => state.activeConfig);
    return (
        <Instance
            position={[-xOffset - 1.5, id - yOffset, -0.1]}
            scale={[cellScale + (1 - cellScale) / 2, cellScale, 1]}
            color={"#663300"}
            onClick={() => {
                useGridStore.setState((state) => {
                    state.noteConfigs[activeConfig][id].enabled =
                        !state.noteConfigs[activeConfig][id].enabled;
                });
            }}
        />
    );
}

interface NoteConfigSelectorProps {
    id: number;
    xOffset: number;
    yOffset: number;
    dimensionY: number;
    cellScale: number;
}

function NoteConfigSelector({
    id,
    xOffset,
    yOffset,
    dimensionY,
    cellScale,
}: NoteConfigSelectorProps) {
    const activeConfig = useGridStore((state) => state.activeConfig);
    const cellColors = useGridStore((state) => state.cellColors);
    return (
        <Instance
            position={[
                -xOffset - (dimensionY / 5) * (((id + 1) % 2) + 2),
                yOffset -
                    dimensionY / 10 +
                    0.5 -
                    (dimensionY / 5) * Math.floor(id / 2),
                0,
            ]}
            scale={[cellScale, cellScale, 0.1]}
            color={
                activeConfig === id ? cellColors.alive : cellColors.deadDisabled
            }
            onClick={() => {
                if (activeConfig !== id) {
                    useGridStore.setState((state) => {
                        state.activeConfig = id;
                    });
                }
            }}
        />
    );
}

interface RowNoteLabelsProps {
    xOffset: number;
    yOffset: number;
}

function RowNoteLabels({ xOffset, yOffset }: RowNoteLabelsProps) {
    const activeConfig = useGridStore((state) => state.activeConfig);
    const noteConfigs = useGridStore((state) => state.noteConfigs);

    return (
        <>
            {noteConfigs[activeConfig].map((noteConfig, i) => (
                <Text
                    key={i}
                    position={[-xOffset - 2.5, -yOffset + i, 0]}
                    color="black"
                    scale={0.8}
                    anchorX={"right"}
                    fontWeight={"bold"}
                >
                    {noteConfig.note}
                </Text>
            ))}
        </>
    );
}

interface DrumCellProps {
    id: string;
    x: number;
    y: number;
    cellScale: number;
    cellColors: CellColors;
    setDrumCellState: (drumType: DrumType, x: number, alive: boolean) => void;
}

function DrumCell({
    id,
    x,
    y,
    cellScale,
    cellColors,
    setDrumCellState,
}: DrumCellProps) {
    const drumCellRecord = useGridStore.getState().drumCells[id];
    const [alive, setAlive] = useState<boolean>(drumCellRecord.alive);
    const [sequenceActive, setSequenceActive] = useState<boolean>(false);

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
            if (primaryMouse && !alive) {
                setDrumCellState(drumCellRecord.drumType, x, true);
            } else if (secondaryMouse && alive) {
                setDrumCellState(drumCellRecord.drumType, x, false);
            }
        }
    }

    useEffect(() => {
        const unsubscribeDrumCellAlive = useGridStore.subscribe(
            (state) => state.drumCells[id].alive,
            (value) => {
                setAlive(value);
            }
        );
        return () => {
            unsubscribeDrumCellAlive();
        };
    });

    useEffect(() => {
        const unsubscribeCurrentSequenceColumn = useGridStore.subscribe(
            (state) => state.currentSequenceColumn,
            (value) => {
                if (value === x) {
                    setSequenceActive(true);
                } else {
                    setSequenceActive(false);
                }
            }
        );
        return () => {
            unsubscribeCurrentSequenceColumn();
        };
    });

    return (
        <Instance
            position={[x, y, 0]}
            scale={[cellScale, cellScale, 1]}
            color={
                alive
                    ? sequenceActive
                        ? cellColors.alivePlaying
                        : cellColors.alive
                    : cellColors.dead
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

function initializeDrumCells(dimensionX: number) {
    const drumCells: Record<string, DrumCellRecord> = {};
    for (const drumType of drumTypes) {
        for (let i = 0; i < dimensionX; i++) {
            drumCells[`${drumType},${i}`] = {
                x: i,
                y: drumTypes.indexOf(drumType),
                alive: false,
                drumType: drumType,
            };
        }
    }
    return drumCells;
}

interface DrumCellsProps {
    xOffset: number;
    yOffset: number;
    cellScale: number;
    dimensionX: number;
    cellColors: CellColors;
}

function DrumCells({
    xOffset,
    yOffset,
    cellScale,
    dimensionX,
    cellColors,
}: DrumCellsProps) {
    const [drumCellsInitialized, setDrumCellsInitialized] = useState(false);
    const drumCells = useGridStore((state) => state.drumCells);
    const setDrumCellState = useGridStore((state) => state.setDrumCellState);

    useEffect(() => {
        if (drumCellsInitialized) setDrumCellsInitialized(false);
        useGridStore.setState((state) => {
            state.drumCells = initializeDrumCells(dimensionX);
        });
        setDrumCellsInitialized(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensionX]);

    return (
        <group position={[-xOffset, yOffset + 2, 0]}>
            <Instances limit={dimensionX * drumTypes.length}>
                <planeGeometry />
                <meshBasicMaterial />
                {Object.entries(drumCells).map(([id, drumCellRecord]) => (
                    <DrumCell
                        key={id}
                        id={id}
                        x={drumCellRecord.x}
                        y={drumCellRecord.y}
                        cellScale={cellScale}
                        cellColors={cellColors}
                        setDrumCellState={setDrumCellState}
                    />
                ))}
            </Instances>
            {drumTypes.map((drumType, i) => (
                <Text
                    key={i}
                    position={[-0.6, i, 0]}
                    color="black"
                    scale={0.8}
                    anchorX={"right"}
                    fontWeight={"bold"}
                >
                    {drumType}
                </Text>
            ))}
        </group>
    );
}

export default function Instrument() {
    const gridScale = 0.3;
    const cellScale = 0.9;
    const dimensionX = useGridStore((state) => state.dimensionX);
    const dimensionY = useGridStore((state) => state.dimensionY);
    const cells = useGridStore((state) => state.cells);
    const cellColors = useGridStore((state) => state.cellColors);
    const setCellState = useGridStore((state) => state.setCellState);
    const setCellType = useGridStore((state) => state.setCellType);
    const xOffset = dimensionX / 2 - 0.5;
    const yOffset = dimensionY / 2 - 0.5;
    const sliderAlphaMap = useTexture("images/SliderAlphaMap.png");

    return (
        <group
            scale={[gridScale, gridScale, 1]}
            position={[6 * gridScale, 0, 0]}
        >
            <Instances limit={dimensionX * dimensionY}>
                <planeGeometry />
                <meshBasicMaterial />
                {Object.entries(cells).map(([id, cellRecord]) => (
                    <Cell
                        key={id}
                        id={id}
                        x={cellRecord.x}
                        y={cellRecord.y}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        cellScale={cellScale}
                        cellColors={cellColors}
                        setCellState={setCellState}
                        setCellType={setCellType}
                    />
                ))}
            </Instances>
            <Instances limit={dimensionX * dimensionY}>
                <planeGeometry />
                <meshBasicMaterial />
                {Object.entries(cells).map(([id, cellRecord]) => (
                    <InvincibleCellDecorator
                        key={id}
                        id={id}
                        x={cellRecord.x}
                        y={cellRecord.y}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        cellScale={cellScale}
                        cellColors={cellColors}
                    />
                ))}
            </Instances>
            <Instances limit={dimensionY}>
                <circleGeometry args={[0.5, 32]} />
                <meshBasicMaterial />
                {Array.from({ length: dimensionY }).map((_, i) => (
                    <RowToggle
                        key={i}
                        id={i}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        cellScale={cellScale}
                    />
                ))}
            </Instances>
            <Instances limit={dimensionY}>
                <planeGeometry args={[2, 1]} />
                <meshBasicMaterial
                    alphaMap={sliderAlphaMap}
                    transparent
                />
                {Array.from({ length: dimensionY }).map((_, i) => (
                    <RowToggleBackground
                        key={i}
                        id={i}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        cellScale={cellScale}
                    />
                ))}
            </Instances>
            <Instances limit={10}>
                <boxGeometry args={[dimensionY / 5, dimensionY / 5, 1]} />
                <meshBasicMaterial />
                {Array.from({ length: 10 }).map((_, i) => (
                    <NoteConfigSelector
                        key={i}
                        id={i}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        dimensionY={dimensionY}
                        cellScale={cellScale}
                    />
                ))}
            </Instances>
            <RowNoteLabels
                xOffset={xOffset}
                yOffset={yOffset}
            />
            <DrumCells
                xOffset={xOffset}
                yOffset={yOffset}
                cellScale={cellScale}
                dimensionX={dimensionX}
                cellColors={cellColors}
            />
        </group>
    );
}
