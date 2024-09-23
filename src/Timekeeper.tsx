import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { aliveStates } from "./constants";
import { getCellsToUpdateOnNextTick } from "./gameOfLifeFunctions";
import { SequencerCell } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";
import { playDrums, playSynthNotes } from "./synthAndDrumFunctions";

export default function Timekeeper() {
    const [sequencerLength, setSequencerLength] = useState(
        useGlobalStore.getState().sequencerLength
    );
    const [npm, setNpm] = useState(useGlobalStore.getState().npm);
    const [npt, setNpt] = useState(useGlobalStore.getState().npt);
    const [npg, setNpg] = useState(useGlobalStore.getState().npg);
    const [playState, setPlayState] = useState(
        useGlobalStore.getState().playState
    );
    const [noteDuration, setNoteDuration] = useState(
        useGlobalStore.getState().noteDuration
    );
    const [drumDuration, setDrumDuration] = useState(
        useGlobalStore.getState().drumDuration
    );
    const indexDurationRef = useRef(0);
    const sequencerIndexRef = useRef(
        useGlobalStore.getState().currentSequencerIndex
    );
    const shouldIncrementIndexRef = useRef(false);
    const tickPlayedNotesCountRef = useRef<number | null>(null);
    const groupPlayedNotesCountRef = useRef<number | null>(null);

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
        const unsubNpm = useGlobalStore.subscribe(
            (state) => state.npm,
            (value) => {
                setNpm(value);
            }
        );
        return () => {
            unsubNpm();
        };
    });
    useEffect(() => {
        const unsubNpt = useGlobalStore.subscribe(
            (state) => state.npt,
            (value) => {
                setNpt(value);
            }
        );
        return () => {
            unsubNpt();
        };
    });
    useEffect(() => {
        const unsubNpg = useGlobalStore.subscribe(
            (state) => state.npg,
            (value) => {
                setNpg(value);
            }
        );
        return () => {
            unsubNpg();
        };
    });
    useEffect(() => {
        const unsubPlayState = useGlobalStore.subscribe(
            (state) => state.playState,
            (value) => {
                setPlayState(value);
            }
        );
        return () => {
            unsubPlayState();
        };
    });
    useEffect(() => {
        const unsubNoteDuration = useGlobalStore.subscribe(
            (state) => state.noteDuration,
            (value) => {
                setNoteDuration(value);
            }
        );
        return () => {
            unsubNoteDuration();
        };
    });
    useEffect(() => {
        const unsubDrumDuration = useGlobalStore.subscribe(
            (state) => state.drumDuration,
            (value) => {
                setDrumDuration(value);
            }
        );
        return () => {
            unsubDrumDuration();
        };
    });

    function moduloIncrement(
        value: number | null,
        modulo: number,
        returnNullAs: 1 | 0 = 1
    ) {
        if (value === null) return returnNullAs;
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

    let sequencerCells = useGlobalStore.getState().sequencerCells;
    let cellsToUpdate: Record<number, SequencerCell> = {};
    let currentNoteGroupIndex = useGlobalStore.getState().currentNoteGroupIndex;
    let nextNoteGroupIndex = currentNoteGroupIndex;
    let synth = useGlobalStore.getState().synth;
    let currentNoteGroup =
        useGlobalStore.getState().noteGroupCells[nextNoteGroupIndex];
    let globallyEnabledSequencerRows =
        useGlobalStore.getState().globallyEnabledSequencerRows;
    let noteIndicesToPlay = Object.values(sequencerCells)
        .filter(
            (cell) =>
                cell.x === sequencerIndexRef.current &&
                aliveStates.includes(cell.state) &&
                currentNoteGroup.enabledRows[cell.y] &&
                globallyEnabledSequencerRows[cell.y]
        )
        .map((cell) => cell.y);
    let frequenciesToPlay = noteIndicesToPlay.map(
        (noteIndex) => currentNoteGroup.notes[noteIndex].frequency
    );
    let voiceMode = useGlobalStore.getState().voiceMode;
    let drumSampler = useGlobalStore.getState().drumSampler;
    let drumCells = useGlobalStore.getState().drumCells;
    let drumTypesToPlay = drumCells[0]
        .filter((cell) => cell.alive)
        .map((cell) => cell.drumType);

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
                indexDurationRef.current =
                    indexDurationRef.current % (60 / npm);
                shouldIncrementIndexRef.current = true;
            }
        }

        if (!shouldIncrementIndexRef.current) return;
        shouldIncrementIndexRef.current = false;

        sequencerIndexRef.current = moduloIncrement(
            sequencerIndexRef.current,
            sequencerLength,
            0
        );

        sequencerCells = useGlobalStore.getState().sequencerCells;
        cellsToUpdate = {};
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

        currentNoteGroupIndex = useGlobalStore.getState().currentNoteGroupIndex;
        nextNoteGroupIndex = currentNoteGroupIndex;
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

        synth = useGlobalStore.getState().synth;
        currentNoteGroup =
            useGlobalStore.getState().noteGroupCells[nextNoteGroupIndex];
        globallyEnabledSequencerRows =
            useGlobalStore.getState().globallyEnabledSequencerRows;
        noteIndicesToPlay = Object.values(sequencerCells)
            .filter(
                (cell) =>
                    cell.x === sequencerIndexRef.current &&
                    aliveStates.includes(cell.state) &&
                    currentNoteGroup.enabledRows[cell.y] &&
                    globallyEnabledSequencerRows[cell.y]
            )
            .map((cell) => cell.y);
        frequenciesToPlay = noteIndicesToPlay.map(
            (noteIndex) => currentNoteGroup.notes[noteIndex].frequency
        );
        voiceMode = useGlobalStore.getState().voiceMode;
        if (synth && frequenciesToPlay.length > 0) {
            playSynthNotes(synth, frequenciesToPlay, voiceMode, noteDuration);
        }

        drumSampler = useGlobalStore.getState().drumSampler;
        drumCells = useGlobalStore.getState().drumCells;
        drumTypesToPlay = drumCells[sequencerIndexRef.current]
            .filter((cell) => cell.alive)
            .map((cell) => cell.drumType);
        if (drumSampler && drumTypesToPlay.length > 0) {
            playDrums(drumSampler, drumTypesToPlay, drumDuration);
        }
        if (Object.keys(cellsToUpdate).length) {
            useGlobalStore.setState((state) => {
                state.sequencerCells = sequencerCells;
            });
        }
        useGlobalStore.setState((state) => {
            state.currentSequencerIndex = sequencerIndexRef.current;
        });
        if (nextNoteGroupIndex !== currentNoteGroupIndex) {
            useGlobalStore.setState((state) => {
                state.currentNoteGroupIndex = nextNoteGroupIndex;
                state.noteGroupCells[nextNoteGroupIndex].active = true;
                state.noteGroupCells[currentNoteGroupIndex].active = false;
            });
        }
    });
    return null;
}
