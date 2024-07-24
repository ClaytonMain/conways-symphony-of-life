import { Html, Instance, Instances } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGridStore } from "./useGridStore";

type PointerEventTypes = "down" | "over" | "out";

interface CellProps {
    id: string;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
    cellColors: {
        alive: THREE.Color;
        aliveHover: THREE.Color;
        alivePlaying: THREE.Color;
        dead: THREE.Color;
        deadHover: THREE.Color;
    };
    setCellState: (x: number, y: number, alive: boolean) => void;
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
}: CellProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const cellRecord = useGridStore.getState().cells[id];
    const [alive, setAlive] = useState<boolean>(cellRecord.alive);
    const [hovered, setHovered] = useState<boolean>(false);
    // const note = 440 * Math.pow(2, Math.round(y - yOffset + 0.5) / 12);
    // const note = notes[y];
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
        const shiftKey = e.shiftKey;

        if (pointerEventType === "over") {
            setHovered(true);
        } else if (pointerEventType === "out") {
            setHovered(false);
        }

        if (primaryMouse && ["down", "over"].includes(pointerEventType)) {
            if (shiftKey && alive) {
                setCellState(x, y, false);
            } else if (!shiftKey && !alive) {
                setCellState(x, y, true);
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
            scale={[cellScale, cellScale, 0.1]}
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

interface NoteToggleProps {
    id: number;
    xOffset: number;
    yOffset: number;
    cellScale: number;
}

function NoteToggle({ id, xOffset, yOffset, cellScale }: NoteToggleProps) {
    const noteEnabled = useGridStore(
        (state) => state.noteConfigs[0][id].enabled
    );
    return (
        <Instance
            position={[-1 - xOffset, id - yOffset, 0]}
            scale={[cellScale, cellScale, 0.1]}
            color={noteEnabled ? "#ffaa33" : "#000000"}
            onClick={() => {
                useGridStore.setState((state) => {
                    state.noteConfigs[0][id].enabled =
                        !state.noteConfigs[0][id].enabled;
                });
            }}
        />
    );
}

interface NoteSetterProps {
    xOffset: number;
    yOffset: number;
    dimensionY: number;
}

function NoteSetter({ xOffset, yOffset, dimensionY }: NoteSetterProps) {
    const noteConfigs = useGridStore((state) => state.noteConfigs);
    const noteRegex = new RegExp(
        /[CDEFGABcdefgab](?:bb|b|#|x)?(?:-4|-3|-2|-1|0|1|2|3|4|5|6|7|8|9|10|11)/
    );
    function handleNoteChange(
        e: React.ChangeEvent<HTMLInputElement>,
        i: number
    ) {
        console.log(e);
        console.log(e.target);
        useGridStore.setState((state) => {
            state.noteConfigs[i].note = e.target.value;
        });
    }
    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>,
        i: number
    ) {
        console.log(e);
        console.log(e.target);
        // if (e.key === "Enter") {
        //     if (noteRegex.test(e.target)) {
        //         useGridStore.setState((state) => {
        //             state.noteConfigs[i].note = noteConfigs[i].note;
        //         });
        //     }
        // }
    }
    function handleBlur(e: React.SyntheticEvent<HTMLInputElement>, i: number) {
        console.log(e);
        console.log(e.target);
    }

    return (
        <Html
            type="div"
            position={[-2 - xOffset, 0, 0]}
            transform
            style={{
                display: "flex",
                flexDirection: "column",
            }}
            center
        >
            {noteConfigs[0].map((noteConfig, i) => (
                <input
                    key={i}
                    type="string"
                    value={noteConfig.note}
                    style={{
                        width: "20px",
                        minHeight: `${dimensionY * 0.96}px`,
                        margin: "5px 0",
                    }}
                    onChange={() => null}
                    // onKeyDown={(e) => handleKeyDown(e, i)}
                    onBlur={(e) => handleBlur(e, i)}
                />
            ))}
        </Html>
    );
}

export default function Grid() {
    const gridScale = 0.3;
    const cellScale = 0.9;
    const dimensionX = useGridStore((state) => state.dimensionX);
    const dimensionY = useGridStore((state) => state.dimensionY);
    const cells = useGridStore((state) => state.cells);
    const cellColors = useGridStore((state) => state.cellColors);
    const setCellState = useGridStore((state) => state.setCellState);
    const xOffset = dimensionX / 2 - 0.5;
    const yOffset = dimensionY / 2 - 0.5;

    return (
        <group scale={[gridScale, gridScale, 1]}>
            <Instances limit={dimensionX * dimensionY}>
                <boxGeometry />
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
                    />
                ))}
            </Instances>
            <Instances limit={dimensionY}>
                <circleGeometry args={[0.5, 32]} />
                <meshBasicMaterial />
                {Array.from({ length: dimensionY }).map((_, i) => (
                    <NoteToggle
                        key={i}
                        id={i}
                        xOffset={xOffset}
                        yOffset={yOffset}
                        cellScale={cellScale}
                    />
                ))}
            </Instances>
            <NoteSetter
                xOffset={xOffset}
                yOffset={yOffset}
                dimensionY={dimensionY}
            />
        </group>
    );
}
