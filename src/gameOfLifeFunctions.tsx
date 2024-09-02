import { aliveStates } from "./constants";
import { GameWrapMode, SequencerCell } from "./sharedTypes";

function getNeighborAddresses(
    x: number,
    y: number,
    sequencerLength: number,
    sequencerHeight: number,
    gameWrapMode: GameWrapMode
): number[] {
    const nbrAddresses: number[] = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let nbrX = x + i;
            let nbrY = y + j;
            if (gameWrapMode === "both" || gameWrapMode === "x") {
                nbrX = (nbrX + sequencerLength) % sequencerLength;
            } else if (nbrX < 0 || nbrX >= sequencerLength) {
                continue;
            }
            if (gameWrapMode === "both" || gameWrapMode === "y") {
                nbrY = (nbrY + sequencerHeight) % sequencerHeight;
            } else if (nbrY < 0 || nbrY >= sequencerHeight) {
                continue;
            }
            nbrAddresses.push(nbrX + sequencerLength * nbrY);
        }
    }
    return nbrAddresses;
}

export function initializeSequencerCells(
    sequencerLength: number,
    sequencerHeight: number,
    gameWrapMode: GameWrapMode,
    aliveProbability: number = 0.2
): Record<number, SequencerCell> {
    const sequencerCells: Record<number, SequencerCell> = {};
    for (let x = 0; x < sequencerLength; x++) {
        for (let y = 0; y < sequencerHeight; y++) {
            const alive = Math.random() < aliveProbability;
            sequencerCells[x + sequencerLength * y] = {
                x,
                y,
                neighborAddresses: getNeighborAddresses(
                    x,
                    y,
                    sequencerLength,
                    sequencerHeight,
                    gameWrapMode
                ),
                state: alive ? "alive" : "dead",
                playing: false,
            };
        }
    }
    return sequencerCells;
}

export function recalculateNeighborAddresses(
    sequencerCells: Record<number, SequencerCell>,
    sequencerLength: number,
    sequencerHeight: number,
    gameWrapMode: GameWrapMode
): Record<number, SequencerCell> {
    for (const cellKey in sequencerCells) {
        const cell = sequencerCells[cellKey];
        cell.neighborAddresses = getNeighborAddresses(
            cell.x,
            cell.y,
            sequencerLength,
            sequencerHeight,
            gameWrapMode
        );
    }
    return sequencerCells;
}

export function getCellsToUpdateOnNextTick(
    sequencerCells: Record<number, SequencerCell>
): Record<number, SequencerCell> {
    const cellsToUpdate: Record<number, SequencerCell> = {};
    for (const cellKey in sequencerCells) {
        const cell = sequencerCells[cellKey];
        const alive = aliveStates.includes(cell.state);
        const aliveNeighbors = cell.neighborAddresses.reduce(
            (acc, address) =>
                aliveStates.includes(sequencerCells[address].state)
                    ? acc + 1
                    : acc,
            0
        );
        if (alive) {
            if (
                (aliveNeighbors < 2 || aliveNeighbors > 3) &&
                !(cell.state === "invincible")
            ) {
                cellsToUpdate[cellKey] = {
                    ...cell,
                    state: "dead",
                };
            }
        } else if (aliveNeighbors === 3) {
            cellsToUpdate[cellKey] = {
                ...cell,
                state: "alive",
            };
        }
    }
    return cellsToUpdate;
}
