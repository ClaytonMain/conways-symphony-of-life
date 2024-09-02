import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { aliveStates } from "./constants";
import { getCellsToUpdateOnNextTick } from "./gameOfLifeFunctions";
import { playDrums, playSynthNotes } from "./instrumentFunctions";
import { SequencerCell } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function Timekeeper() {
    const { sequencerLength, npm, npt, npg, playState } = useGlobalStore(
        (state) => state
    );
    const indexDurationRef = useRef(0);
    const sequencerIndexRef = useRef(
        useGlobalStore.getState().currentSequencerIndex
    );
    const shouldIncrementIndexRef = useRef(false);
    const tickPlayedNotesCountRef = useRef<number | null>(null);
    const groupPlayedNotesCountRef = useRef<number | null>(null);

    function moduloIncrement(value: number | null, modulo: number) {
        if (value === null) return 0;
        return (value + 1) % modulo;
    }

    function getNextNoteGroupIndex(currentNoteGroupIndex: number) {
        const noteGroupChangeMode =
            useGlobalStore.getState().noteGroupChangeMode;
        if (noteGroupChangeMode === null) return currentNoteGroupIndex;

        const noteGroupCells = useGlobalStore.getState().noteGroupCells;
        const enabledNoteGroupIndices = noteGroupCells
            .map((cell, i) => {
                if (cell.enabled) return i;
            })
            .filter((i) => i !== undefined) as number[];
        const enabledNoteGroupIndicesExcludeCurrent =
            enabledNoteGroupIndices.filter((i) => i !== currentNoteGroupIndex);
        let nextNoteGroupIndex = currentNoteGroupIndex;
        let checkIndex = currentNoteGroupIndex;
        switch (noteGroupChangeMode) {
            case "sequential":
                for (let i = 0; i < noteGroupCells.length; i++) {
                    checkIndex = (checkIndex + 1) % noteGroupCells.length;
                    if (noteGroupCells[checkIndex].enabled) {
                        nextNoteGroupIndex = checkIndex;
                        break;
                    }
                }
                break;
            case "true random":
                if (enabledNoteGroupIndices.length === 0) break;
                nextNoteGroupIndex =
                    enabledNoteGroupIndices[
                        Math.floor(
                            Math.random() * enabledNoteGroupIndices.length
                        )
                    ];
                break;
            case "avoid prev random":
                if (enabledNoteGroupIndicesExcludeCurrent.length === 0) break;
                nextNoteGroupIndex =
                    enabledNoteGroupIndicesExcludeCurrent[
                        Math.floor(
                            Math.random() *
                                enabledNoteGroupIndicesExcludeCurrent.length
                        )
                    ];
                break;
        }
        return nextNoteGroupIndex;
    }

    useFrame((_, delta) => {
        if (playState === "stopped") {
            if (indexDurationRef.current > 0) {
                indexDurationRef.current = 0;
            }
            if (sequencerIndexRef.current !== null) {
                sequencerIndexRef.current = null;
            }
            if (tickPlayedNotesCountRef.current !== null) {
                tickPlayedNotesCountRef.current = null;
            }
            if (groupPlayedNotesCountRef.current !== null) {
                groupPlayedNotesCountRef.current = null;
            }
            return;
        } else if (playState === "paused") {
            if (indexDurationRef.current > 0) {
                indexDurationRef.current = 0;
            }
            return;
        }
        // Handle starting from "stopped" playState.
        if (sequencerIndexRef.current === null) {
            shouldIncrementIndexRef.current = true;
        } else {
            // Otherwise, check if enough time has elapsed to move to the next index.
            indexDurationRef.current += delta;
            if (indexDurationRef.current >= 60 / npm) {
                indexDurationRef.current -= 60 / npm;
                shouldIncrementIndexRef.current = true;
            }
        }

        if (!shouldIncrementIndexRef.current) return;
        shouldIncrementIndexRef.current = false;

        sequencerIndexRef.current = moduloIncrement(
            sequencerIndexRef.current,
            sequencerLength
        );

        let sequencerCells = useGlobalStore.getState().sequencerCells;
        let cellsToUpdate: Record<number, SequencerCell> = {};
        if (npt !== null) {
            if (tickPlayedNotesCountRef.current === 0) {
                cellsToUpdate = getCellsToUpdateOnNextTick(sequencerCells);
            }
            tickPlayedNotesCountRef.current = moduloIncrement(
                tickPlayedNotesCountRef.current,
                npt
            );
        }
        sequencerCells = { ...sequencerCells, ...cellsToUpdate };

        const currentNoteGroupIndex =
            useGlobalStore.getState().currentNoteGroupIndex;
        let nextNoteGroupIndex = currentNoteGroupIndex;
        if (npg !== null) {
            if (groupPlayedNotesCountRef.current === 0) {
                nextNoteGroupIndex = getNextNoteGroupIndex(
                    currentNoteGroupIndex
                );
            }
            groupPlayedNotesCountRef.current = moduloIncrement(
                groupPlayedNotesCountRef.current,
                npg
            );
        }

        const synth = useGlobalStore.getState().synth;
        const currentNoteGroup =
            useGlobalStore.getState().noteGroupCells[nextNoteGroupIndex];
        const globallyEnabledSequencerRows =
            useGlobalStore.getState().globallyEnabledSequencerRows;
        const noteIndicesToPlay = Object.values(sequencerCells)
            .filter(
                (cell) =>
                    cell.x === sequencerIndexRef.current &&
                    aliveStates.includes(cell.state) &&
                    currentNoteGroup.enabledRows[cell.y] &&
                    globallyEnabledSequencerRows[cell.y]
            )
            .map((cell) => cell.y);
        const frequenciesToPlay = noteIndicesToPlay.map(
            (noteIndex) => currentNoteGroup.notes[noteIndex].frequency
        );
        const voiceMode = useGlobalStore.getState().voiceMode;
        if (synth && frequenciesToPlay.length > 0) {
            playSynthNotes(synth, frequenciesToPlay, voiceMode);
        }

        const drumSampler = useGlobalStore.getState().drumSampler;
        const drumCells = useGlobalStore.getState().drumCells;
        const drumTypesToPlay = drumCells[sequencerIndexRef.current]
            .filter((cell) => cell.alive)
            .map((cell) => cell.drumType);
        if (drumSampler && drumTypesToPlay.length > 0) {
            playDrums(drumSampler, drumTypesToPlay);
        }

        useGlobalStore.setState((state) => {
            state.currentSequencerIndex = sequencerIndexRef.current;
            state.sequencerCells = sequencerCells;
            state.currentNoteGroupIndex = nextNoteGroupIndex;
        });
    });
    return null;
}
