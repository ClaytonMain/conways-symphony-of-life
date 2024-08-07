import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { CellRecord } from "./sharedTypes";
import { useGridStore } from "./useGridStore";

/**
 * Conway controls all the logic for the Game of Life.
 */

function getNeighborAddresses(
    x: number,
    y: number,
    dimensionX: number,
    dimensionY: number
) {
    const neighborAddresses: string[] = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            neighborAddresses.push(
                `${(x + i + dimensionX) % dimensionX},${
                    (y + j + dimensionY) % dimensionY
                }`
            );
        }
    }
    return neighborAddresses;
}

function initializeCells(dimensionX: number, dimensionY: number) {
    const cells: Record<string, CellRecord> = {};
    let alive;
    for (let i = 0; i < dimensionX; i++) {
        for (let j = 0; j < dimensionY; j++) {
            alive = Math.random() > 0.8;
            cells[`${i},${j}`] = {
                x: i,
                y: j,
                alive: alive,
                neighborAddresses: getNeighborAddresses(
                    i,
                    j,
                    dimensionX,
                    dimensionY
                ),
                cellType: "normal",
            };
        }
    }
    return cells;
}

export default function Conway() {
    const [cellsInitialized, setCellsInitialized] = useState(false);
    const tpm = useGridStore((state) => state.tpm);
    const animationState = useGridStore((state) => state.animationState);
    const dimensionX = useGridStore((state) => state.dimensionX);
    const dimensionY = useGridStore((state) => state.dimensionY);

    const elapsedTpm = useRef(0);

    useEffect(() => {
        if (cellsInitialized) setCellsInitialized(false);
        useGridStore.setState((state) => {
            state.cells = initializeCells(dimensionX, dimensionY);
        });
        setCellsInitialized(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensionX, dimensionY]);

    useFrame((_, delta) => {
        if (!cellsInitialized) return;
        if (animationState === "paused") {
            if (elapsedTpm.current > 0) elapsedTpm.current = 0;
            return;
        }
        elapsedTpm.current += delta;

        /**
         * Game of Life calculations.
         */
        if (tpm > 0 && elapsedTpm.current >= 60 / tpm) {
            elapsedTpm.current = 0;
            const cells = useGridStore.getState().cells;
            const updatedCells: Record<string, CellRecord> = {};
            for (const cellAddress in cells) {
                const cell = cells[cellAddress];
                const aliveNeighbors = cell.neighborAddresses.reduce(
                    (acc, address) => (cells[address].alive ? acc + 1 : acc),
                    0
                );
                if (cell.alive) {
                    if (
                        (aliveNeighbors < 2 || aliveNeighbors > 3) &&
                        cell.cellType !== "invincible"
                    ) {
                        updatedCells[cellAddress] = {
                            ...cell,
                            alive: false,
                        };
                    }
                } else {
                    if (aliveNeighbors === 3) {
                        updatedCells[cellAddress] = {
                            ...cell,
                            alive: true,
                        };
                    }
                }
            }
            useGridStore.setState((state) => {
                state.cells = {
                    ...state.cells,
                    ...updatedCells,
                };
            });
        }
    });
    return null;
}
