import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { noteNames, octaves } from "../constants";
import { Note, NoteConfig } from "../sharedTypes";
import "./NoteConfigEditModal.css";
import { useGridStore } from "./useGridStore";

export default function NoteConfigEditModal() {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNoteConfigIndex, setEditingNoteConfigIndex] = useState<
        null | number
    >(null);
    const [currentNoteConfigs, setCurrentNoteConfigs] = useState<
        null | NoteConfig[]
    >(null);
    useEffect(() => {
        const unsubscribeEditingNoteConfigIndex = useGridStore.subscribe(
            (state) => state.editingNoteConfigIndex,
            (value) => {
                if (value === null) {
                    setModalVisible(false);
                    setEditingNoteConfigIndex(null);
                    setCurrentNoteConfigs(null);
                } else {
                    setModalVisible(true);
                    setEditingNoteConfigIndex(value);
                    const currentConfig =
                        useGridStore.getState().noteConfigCells[value]
                            .noteConfigs;
                    setCurrentNoteConfigs(currentConfig);
                }
            }
        );
        return () => {
            unsubscribeEditingNoteConfigIndex();
        };
    });

    function stopEditingNoteConfig() {
        useGridStore.setState((state) => {
            state.editingNoteIndices = null;
        });
    }

    function handleOnClickSave() {
        const noteConfigIndex = editingNoteConfigIndex!;
        const newNoteConfigs = [...currentNoteConfigs!];
        newNoteConfigs[noteIndex] = {
            note: `${selectedNoteName}${selectedOctave}`,
            enabled: currentNoteConfigs![noteIndex].enabled,
            noteName: selectedNoteName!,
            octave: selectedOctave!,
        };
        useGridStore.setState((state) => {
            state.noteConfigCells[noteConfigIndex].noteConfigs = newNoteConfigs;
        });
        stopEditingNoteConfig();
    }

    const backgroundVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
        },
        exit: {
            opacity: 0,
        },
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0,
            y: 10,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
        },
        exit: {
            opacity: 0,
            scale: 0,
            y: 10,
        },
    };

    return (
        <AnimatePresence>
            {modalVisible && (
                <motion.div
                    className="modal-container"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={backgroundVariants}
                    onClick={stopEditingNote}
                >
                    <motion.div
                        className="modal"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="note-selection-container">
                            <span className="note-header">Note</span>
                            <div className="note-container">
                                {noteNames.map((noteName) => (
                                    <div
                                        key={noteName}
                                        className={
                                            noteName === selectedNoteName
                                                ? "note selected"
                                                : "note"
                                        }
                                        onClick={() =>
                                            setSelectedNoteName(noteName)
                                        }
                                    >
                                        {noteName}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="octave-selection-container">
                            <span className="octave-header">Octave</span>
                            <div className="octave-container">
                                {octaves.map((octave) => (
                                    <span
                                        key={octave}
                                        className={
                                            octave === selectedOctave
                                                ? "octave selected"
                                                : "octave"
                                        }
                                        onClick={() =>
                                            setSelectedOctave(octave)
                                        }
                                    >
                                        {octave}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="button-container">
                            <button onClick={handleOnClickSave}>Save</button>
                            <button onClick={stopEditingNote}>Cancel</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
