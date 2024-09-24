import {
    Center,
    Instance,
    Instances,
    OrthographicCamera,
    RenderTexture,
    Text,
    useCursor,
    useTexture,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";
import { colors, genericBoxGeometry } from "../constants";
import InstancedButtonOrLabel from "../controls/InstancedButtonOrLabel";
import DrumSequencer from "../DrumSequencer";
import { generateNoteGroupNotes } from "../noteGroupFunctions";
import NoteGroups from "../NoteGroups";
import Sequencer from "../Sequencer";
import {
    DisplayVariant,
    NoteGroupCell,
    NoteGroupNote,
    NoteOctave,
    PointerEventTypes,
} from "../sharedTypes";
import { useGlobalStore } from "../stores/useGlobalStore";

interface DisplayVariantObject {
    opacity?: number;
    transition?: {
        duration?: number;
    };
}
type DisplayVariants = Record<DisplayVariant, DisplayVariantObject>;
const displayVariants: DisplayVariants = {
    show: {
        opacity: 1,
        transition: {
            duration: 0.1,
        },
    },
    hideSlow: {
        opacity: 0,
        transition: {
            duration: 1.0,
        },
    },
    hideFast: {
        opacity: 0,
        transition: {
            duration: 0.1,
        },
    },
};
const overlayVariants: DisplayVariants = {
    ...displayVariants,
    show: {
        ...displayVariants.show,
        opacity: 0.5,
    },
};

function ValueChangeDisplay() {
    const [variant, setVariant] = useState<DisplayVariant>("hideFast");
    const [displayValue, setDisplayValue] = useState(
        useGlobalStore.getState().displayValue
    );
    const [showValueChangeDisplay, setShowValueChangeDisplay] = useState(false);
    const [displayLabel, setDisplayLabel] = useState(
        useGlobalStore.getState().displayLabel
    );
    const displayDurationRef = useRef(10);

    useEffect(() => {
        const unsubDisplayValue = useGlobalStore.subscribe(
            (state) => state.displayValue,
            (value) => {
                setDisplayValue(value);
                setVariant("show");
                setShowValueChangeDisplay(true);
                displayDurationRef.current = 0;
                useGlobalStore.setState({
                    showValueChangeDisplay: true,
                    showNoteGroupEditDisplay: false,
                });
            }
        );
        return () => {
            unsubDisplayValue();
        };
    });
    useEffect(() => {
        const unsubShowNoteGroupEditDisplay = useGlobalStore.subscribe(
            (state) => state.showNoteGroupEditDisplay,
            (value) => {
                if (value) {
                    setVariant("hideFast");
                    setShowValueChangeDisplay(false);
                    useGlobalStore.setState({ showValueChangeDisplay: false });
                }
            }
        );
        return () => {
            unsubShowNoteGroupEditDisplay();
        };
    });
    useEffect(() => {
        const unsubDisplayLabel = useGlobalStore.subscribe(
            (state) => state.displayLabel,
            (value) => {
                setDisplayLabel(value);
            }
        );
        return () => {
            unsubDisplayLabel();
        };
    });

    useFrame((_, delta) => {
        displayDurationRef.current += delta;
        if (displayDurationRef.current > 1) {
            if (variant !== "hideSlow") {
                setVariant("hideSlow");
            }
            if (showValueChangeDisplay) {
                setShowValueChangeDisplay(false);
                useGlobalStore.setState({ showValueChangeDisplay: false });
            }
        }
    });
    const materialComponent = (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={variant}
            variants={displayVariants}
            color={colors.lightText}
            transparent
            opacity={0.0}
            toneMapped={false}
        />
    );

    return (
        <>
            <Text
                position={[0, 3, 0]}
                fontWeight={"bold"}
                anchorY={"bottom"}
            >
                {materialComponent}
                {displayLabel}
            </Text>
            <Text
                position={[0, 3, 0]}
                scale={4}
                fontWeight={"bold"}
                maxWidth={8}
                textAlign={"center"}
                anchorY={"top"}
            >
                {materialComponent}
                {displayValue}
            </Text>
        </>
    );
}

const keyOffsets = [0, 0.4, 1, 1.6, 2, 3, 3.4, 4, 4.5, 5, 5.6, 6];

interface UpdatePendingNoteGroupParams {
    semitones?: number[];
    octaveStart?: NoteOctave;
    octaveIncrement?: number;
}

interface PianoKeyProps {
    index: number;
    keysStartXPosition: number;
    whiteKeyWidth: number;
    synth:
        | Tone.PolySynth<Tone.Synth<Tone.SynthOptions>>
        | Tone.MonoSynth
        | null;
    pendingNoteGroup: NoteGroupCell;
    updatePendingNoteGroup: (params: UpdatePendingNoteGroupParams) => void;
    variant?: DisplayVariant;
}

function PianoKey({
    index,
    keysStartXPosition,
    whiteKeyWidth,
    synth,
    pendingNoteGroup,
    updatePendingNoteGroup,
    variant,
}: PianoKeyProps) {
    const relativeSemitone = index - 12;
    const enabled = pendingNoteGroup.semitones.includes(relativeSemitone);
    const accidental = [1, 3, 6, 8, 10].includes(index % 12);
    const keyIndex = keyOffsets[index % 12] + Math.floor(index / 12) * 7;

    function handleOnClick() {
        if (variant !== "show") return;
        const activeSemitones = pendingNoteGroup.semitones;
        const octaveStart = pendingNoteGroup.octaveStart;
        let newSemitones: number[] = [];
        if (!enabled) {
            newSemitones = [...activeSemitones, relativeSemitone];
            newSemitones.sort((a, b) => a - b);
            synth?.triggerAttackRelease(
                Tone.Frequency(`C${octaveStart}`)
                    .transpose(relativeSemitone)
                    .toFrequency(),
                "8n"
            );
        } else {
            if (activeSemitones.length < 4) {
                // @todo: Notify user that at least 3 noted must be enabled.
                return;
            }
            activeSemitones.forEach((semitone) => {
                if (semitone !== relativeSemitone) {
                    newSemitones.push(semitone);
                }
            });
        }
        updatePendingNoteGroup({ semitones: newSemitones });
    }

    return (
        <>
            <Instance
                position={[
                    keysStartXPosition + whiteKeyWidth * keyIndex,
                    accidental ? 0.66 : 0,
                    accidental ? 0.01 : 0,
                ]}
                scale={[
                    whiteKeyWidth * (accidental ? 0.66 : 1) * 0.9,
                    accidental ? 2.66 : 4,
                    0.1,
                ]}
                color={
                    accidental
                        ? enabled
                            ? colors.enabledAccidental
                            : "black"
                        : enabled
                        ? colors.enabledDiatonic
                        : "white"
                }
                onClick={(e) => {
                    e.stopPropagation();
                    handleOnClick();
                }}
            />
        </>
    );
}

interface ScreenArrowSelectorProps {
    position?: [number, number, number];
    options: Array<string | number>;
    optionScale?: [number, number, number] | number | THREE.Vector3;
    startingOptionIndex?: number;
    onIndexChange?: (index: number) => void;
    animate?: DisplayVariant;
    variants?: DisplayVariants;
    label?: string;
    labelScale?: [number, number, number] | number | THREE.Vector3;
    motionMaterialElement?: JSX.Element;
}
function ScreenArrowSelector({
    position,
    options,
    optionScale = 1,
    startingOptionIndex = 0,
    onIndexChange,
    animate,
    variants,
    label,
    labelScale = 1,
    motionMaterialElement,
}: ScreenArrowSelectorProps) {
    const [currentOptionIndex, setCurrentOptionIndex] =
        useState(startingOptionIndex);
    const arrowButtonAlphaMap = useTexture("images/ArrowButtonAlphaMap.png");
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    useEffect(() => {
        setCurrentOptionIndex(startingOptionIndex);
    }, [startingOptionIndex]);

    function handleOnClick(increment: -1 | 1) {
        if (animate !== "show") return;
        const newIndex =
            (currentOptionIndex + increment + options.length) % options.length;
        setCurrentOptionIndex(newIndex);
        if (onIndexChange) {
            onIndexChange(newIndex);
        }
    }

    function handlePointerEvents({
        pointerEventType,
    }: {
        pointerEventType: PointerEventTypes;
    }) {
        if (animate !== "show") return;
        if (pointerEventType === "over") {
            setHovered(true);
        } else if (pointerEventType === "out") {
            setHovered(false);
        }
    }

    const material = motionMaterialElement ?? (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={animate}
            variants={variants}
            color={colors.lightText}
            transparent
        />
    );
    const arrowButtonMaterial = (
        <motion.meshBasicMaterial
            {...material.props}
            transparent
            alphaMap={arrowButtonAlphaMap}
        />
    );

    return (
        <group position={position}>
            <group
                position={[0, 1.25, 0]}
                onClick={() => handleOnClick(1)}
                onPointerOver={() =>
                    handlePointerEvents({ pointerEventType: "over" })
                }
                onPointerOut={() =>
                    handlePointerEvents({ pointerEventType: "out" })
                }
            >
                <mesh
                    geometry={genericBoxGeometry}
                    scale={[1.5, 1, 0.01]}
                >
                    {arrowButtonMaterial}
                </mesh>
            </group>
            <group
                position={[0, -1.25, 0]}
                rotation={[0, 0, Math.PI]}
                onClick={() => handleOnClick(-1)}
                onPointerOver={() =>
                    handlePointerEvents({ pointerEventType: "over" })
                }
                onPointerOut={() =>
                    handlePointerEvents({ pointerEventType: "out" })
                }
            >
                <mesh
                    geometry={genericBoxGeometry}
                    scale={[1.5, 1, 0.01]}
                >
                    {arrowButtonMaterial}
                </mesh>
            </group>
            <Text
                fontWeight={"bold"}
                textAlign="center"
                scale={optionScale}
            >
                {material}
                {options[currentOptionIndex]}
            </Text>
            <Text
                fontWeight={"bold"}
                position={[0, -1.75, 0]}
                textAlign="center"
                anchorY={"top"}
                fontSize={0.5}
                scale={labelScale}
            >
                {material}
                {label}
            </Text>
        </group>
    );
}

interface NoteGroupEditNotesDisplayProps {
    index: number;
    position?: [number, number, number];
    label?: string;
    labelScale?: [number, number, number] | number | THREE.Vector3;
    labelMotionMaterialElement?: JSX.Element;
    labelFontWeight?: "bold" | "normal";
    labelTextAlign?: "center" | "left" | "right";
    labelAnchorX?: "center" | "left" | "right";
    labelAnchorY?:
        | number
        | "top"
        | "bottom"
        | "middle"
        | "top-baseline"
        | "bottom-baseline";
    onClick?: () => void;
    variant?: DisplayVariant;
}

function NoteGroupEditNotesDisplay({
    index,
    position = [0, 0, 0],
    label,
    labelScale = 1,
    labelMotionMaterialElement,
    labelFontWeight = "bold",
    labelTextAlign = "center",
    labelAnchorX,
    labelAnchorY,
    onClick,
    variant,
}: NoteGroupEditNotesDisplayProps) {
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);
    useEffect(() => {
        const unsubPlayingNoteGroupNotesTimestamp = useGlobalStore.subscribe(
            (state) => state.playingNoteGroupNotesTimestamp,
            () => {
                const timer = setTimeout(() => {
                    setPlaying(true);
                    const otherTimer = setTimeout(() => {
                        setPlaying(false);
                        clearTimeout(otherTimer);
                    }, 100);
                }, index * 100 + 100);
                return () => clearTimeout(timer);
            }
        );
        return () => {
            unsubPlayingNoteGroupNotesTimestamp();
        };
    });
    function handlePointerEvents({
        pointerEventType,
    }: {
        pointerEventType: PointerEventTypes;
    }) {
        if (variant !== "show" || onClick === undefined) return;
        if (pointerEventType === "over") {
            setHovered(true);
        } else if (pointerEventType === "out") {
            setHovered(false);
        }
    }
    return (
        <>
            <Instance
                position={position}
                scale={[2 * 0.95, 1.0 * 0.95, 0.01]}
                onClick={onClick}
                onPointerOver={() =>
                    handlePointerEvents({ pointerEventType: "over" })
                }
                onPointerOut={() =>
                    handlePointerEvents({ pointerEventType: "out" })
                }
                color={playing ? colors.lightText : colors.enabledDiatonic}
            />
            <Text
                position={[0, position[1], 0.01]}
                scale={labelScale}
                fontWeight={labelFontWeight}
                textAlign={labelTextAlign}
                anchorX={labelAnchorX}
                anchorY={labelAnchorY}
            >
                {labelMotionMaterialElement}
                {label}
            </Text>
        </>
    );
}

interface NoteGroupEditDisplayProps {
    displayPlaneArgs: [number, number];
    sequencerHeight: number;
}

function NoteGroupEditDisplay({
    displayPlaneArgs,
    sequencerHeight,
}: NoteGroupEditDisplayProps) {
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [currentNoteGroup, setCurrentNoteGroup] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
    );
    const [pendingNoteGroup, setPendingNoteGroup] = useState(currentNoteGroup);
    const [variant, setVariant] = useState<DisplayVariant>("hideFast");
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    const octaveOptions: NoteOctave[] = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
    const octaveIncrementOptions: number[] = [-2, -1, 0, 1, 2];
    const [optionsStartIndex, setOptionsStartIndex] = useState(
        octaveOptions.indexOf(pendingNoteGroup.octaveStart)
    );
    const [incrementStartIndex, setIncrementStartIndex] = useState(
        octaveIncrementOptions.indexOf(pendingNoteGroup.octaveIncrement)
    );

    const keysStartXPosition =
        -displayPlaneArgs[0] / 2 + 0.5 + (displayPlaneArgs[0] * 7) / (28 * 2);
    const whiteKeyWidth = displayPlaneArgs[0] / 28;

    const [synth, setSynth] = useState(useGlobalStore.getState().synth);

    useEffect(() => {
        const unsubEditingNoteGroups = useGlobalStore.subscribe(
            (state) => state.editingNoteGroups,
            (value) => {
                if (value) {
                    setVariant("show");
                    useGlobalStore.setState({
                        showNoteGroupEditDisplay: true,
                        showValueChangeDisplay: false,
                    });
                } else {
                    // hideFast is handled by below useEffect.
                    if (!useGlobalStore.getState().showValueChangeDisplay) {
                        setVariant("hideSlow");
                    }
                    useGlobalStore.setState({
                        showNoteGroupEditDisplay: false,
                    });
                }
            }
        );
        return () => {
            unsubEditingNoteGroups();
        };
    });
    useEffect(() => {
        const unsubShowValueChangeDisplay = useGlobalStore.subscribe(
            (state) => state.showValueChangeDisplay,
            (value) => {
                if (value) {
                    setVariant("hideFast");
                    useGlobalStore.setState({ editingNoteGroups: false });
                }
            }
        );
        return () => {
            unsubShowValueChangeDisplay();
        };
    });
    useEffect(() => {
        const unsubCurrentNoteGroupIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
                setCurrentNoteGroup(
                    useGlobalStore.getState().noteGroupCells[value]
                );
                setPendingNoteGroup(
                    useGlobalStore.getState().noteGroupCells[value]
                );
                setOptionsStartIndex(
                    octaveOptions.indexOf(
                        useGlobalStore.getState().noteGroupCells[value]
                            .octaveStart
                    )
                );
                setIncrementStartIndex(
                    octaveIncrementOptions.indexOf(
                        useGlobalStore.getState().noteGroupCells[value]
                            .octaveIncrement
                    )
                );
            }
        );
        return () => {
            unsubCurrentNoteGroupIndex();
        };
    });
    useEffect(() => {
        const unsubSynth = useGlobalStore.subscribe(
            (state) => state.synth,
            (value) => {
                setSynth(value);
            }
        );
        return () => {
            unsubSynth();
        };
    });

    function handlePointerEvents({
        pointerEventType,
    }: {
        pointerEventType: PointerEventTypes;
    }) {
        if (variant !== "show") return;
        if (pointerEventType === "over") {
            setHovered(true);
        } else if (pointerEventType === "out") {
            setHovered(false);
        }
    }

    function updatePendingNoteGroup({
        semitones,
        octaveStart,
        octaveIncrement,
    }: {
        semitones?: number[];
        octaveStart?: NoteOctave;
        octaveIncrement?: number;
    }) {
        const notes: NoteGroupNote[] = generateNoteGroupNotes(
            useGlobalStore.getState().sequencerHeight,
            "C",
            semitones ?? pendingNoteGroup.semitones,
            octaveStart ?? pendingNoteGroup.octaveStart,
            octaveIncrement ?? pendingNoteGroup.octaveIncrement
        );
        const newNoteGroup = {
            ...pendingNoteGroup,
            semitones: semitones ?? pendingNoteGroup.semitones,
            octaveStart: octaveStart ?? pendingNoteGroup.octaveStart,
            octaveIncrement:
                octaveIncrement ?? pendingNoteGroup.octaveIncrement,
            notes,
        };
        setPendingNoteGroup(newNoteGroup);
    }

    const motionBasicWhiteMaterial = (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={variant}
            variants={displayVariants}
            color="white"
            transparent
            toneMapped={false}
        />
    );
    const motionBasicBlackMaterial = (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={variant}
            variants={displayVariants}
            color="black"
            transparent
            toneMapped={false}
        />
    );
    const motionBasicButtonMaterial = (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={variant}
            variants={displayVariants}
            color={colors.instrumentButtons}
            transparent
            toneMapped={false}
        />
    );
    const motionBasicNoColorMaterial = (
        <motion.meshBasicMaterial
            initial={"hidden"}
            animate={variant}
            variants={displayVariants}
            transparent
            toneMapped={false}
        />
    );

    return (
        <>
            {/* "Editing Note Group: N" */}
            <group position={[0, 6, 0]}>
                <Text
                    fontWeight={"bold"}
                    scale={2}
                >
                    {motionBasicWhiteMaterial}
                    {`Editing Note Group: ${currentNoteGroupIndex + 1}`}
                </Text>
            </group>
            {/* Piano keys, key labels, and keys hitbox. */}
            <group position={[0, 2, 0]}>
                <mesh
                    geometry={genericBoxGeometry}
                    scale={[
                        1.01 * ((displayPlaneArgs[0] * 21) / 28),
                        1.01 * 4,
                        0.01,
                    ]}
                    position={[0, 0, 0.051]}
                    onPointerOver={() =>
                        handlePointerEvents({ pointerEventType: "over" })
                    }
                    onPointerOut={() =>
                        handlePointerEvents({ pointerEventType: "out" })
                    }
                >
                    <meshBasicMaterial
                        transparent
                        opacity={0}
                    />
                </mesh>
                <Instances>
                    <planeGeometry />
                    <motion.meshBasicMaterial
                        initial={"hidden"}
                        animate={variant}
                        variants={displayVariants}
                        transparent
                        toneMapped={false}
                    />
                    {Array.from({ length: 36 }, (_, i) => (
                        <PianoKey
                            key={i}
                            index={i}
                            keysStartXPosition={keysStartXPosition}
                            whiteKeyWidth={whiteKeyWidth}
                            synth={synth}
                            pendingNoteGroup={pendingNoteGroup}
                            updatePendingNoteGroup={updatePendingNoteGroup}
                            variant={variant}
                        />
                    ))}
                </Instances>
                {Array.from({ length: 3 }, (_, i) => (
                    <Text
                        key={i}
                        position={[
                            keysStartXPosition + whiteKeyWidth * (i * 7),
                            -1.5,
                            0.1,
                        ]}
                        scale={0.5}
                        fontWeight={"bold"}
                    >
                        {motionBasicBlackMaterial}
                        {`C${pendingNoteGroup.octaveStart + i - 1}`}
                    </Text>
                ))}
            </group>
            {/* Buttons & selectors. */}
            <group position={[0, -3, 0]}>
                <ScreenArrowSelector
                    position={[-3, 0, 0]}
                    options={octaveOptions}
                    startingOptionIndex={optionsStartIndex}
                    onIndexChange={(index) => {
                        updatePendingNoteGroup({
                            octaveStart: octaveOptions[index],
                        });
                        setOptionsStartIndex(index);
                    }}
                    animate={variant}
                    variants={displayVariants}
                    label={"OCTAVE"}
                    motionMaterialElement={motionBasicWhiteMaterial}
                />
                <ScreenArrowSelector
                    position={[3, 0, 0]}
                    options={octaveIncrementOptions}
                    startingOptionIndex={incrementStartIndex}
                    onIndexChange={(index) => {
                        updatePendingNoteGroup({
                            octaveIncrement: octaveIncrementOptions[index],
                        });
                        setIncrementStartIndex(index);
                    }}
                    animate={variant}
                    variants={displayVariants}
                    label={"OCTAVE\nINCREMENT"}
                    motionMaterialElement={motionBasicWhiteMaterial}
                />
                <group position={[0, -5, 0]}>
                    <mesh
                        geometry={genericBoxGeometry}
                        scale={[3, 1.5, 0.01]}
                        position={[0, 0, 0]}
                        onPointerOver={() =>
                            handlePointerEvents({ pointerEventType: "over" })
                        }
                        onPointerOut={() =>
                            handlePointerEvents({ pointerEventType: "out" })
                        }
                        onClick={() => {
                            if (variant !== "show") return;
                            useGlobalStore.setState((state) => {
                                state.noteGroupCells[currentNoteGroupIndex] =
                                    pendingNoteGroup;
                                state.editingNoteGroups = false;
                                state.cellsIgnorePointerEvents = false;
                            });
                        }}
                    >
                        {motionBasicButtonMaterial}
                    </mesh>
                    <Text
                        position={[0, 0, 0.1]}
                        fontWeight={"bold"}
                    >
                        {motionBasicWhiteMaterial}
                        {"SAVE"}
                    </Text>
                </group>
            </group>
            {/* Generated notes display & player */}
            <Instances
                limit={sequencerHeight}
                position={[-keysStartXPosition + 2, 0, 0]}
                geometry={genericBoxGeometry}
            >
                {motionBasicNoColorMaterial}
                {pendingNoteGroup.notes.map((note, i) => (
                    <NoteGroupEditNotesDisplay
                        key={i}
                        index={i}
                        position={[0, i - sequencerHeight / 2, 0]}
                        label={note.frequency.toNote()}
                        labelScale={0.75}
                        labelMotionMaterialElement={motionBasicWhiteMaterial}
                        variant={variant}
                    />
                ))}
            </Instances>
            <Instances
                position={[
                    -keysStartXPosition + 2,
                    -sequencerHeight / 2 - 1.5,
                    0,
                ]}
                limit={1}
                geometry={genericBoxGeometry}
            >
                {motionBasicButtonMaterial}
                <InstancedButtonOrLabel
                    boxScale={[3.75, 1.25, 0.01]}
                    label={"PREVIEW"}
                    labelScale={0.75}
                    labelMaterialElement={motionBasicWhiteMaterial}
                    variant={variant}
                    onClick={() => {
                        if (variant !== "show") return;
                        pendingNoteGroup.notes.forEach((note, i) => {
                            synth?.triggerAttackRelease(
                                note.frequency.toFrequency(),
                                "16n",
                                `+${i * 0.1 + 0.1}`
                            );
                        });
                        useGlobalStore.setState({
                            playingNoteGroupNotesTimestamp: Date.now(),
                        });
                    }}
                />
            </Instances>
            {/* Corner "X" */}
            <group
                position={[
                    displayPlaneArgs[0] / 2 - 1,
                    displayPlaneArgs[1] / 2 - 1,
                    0,
                ]}
                onPointerOver={() =>
                    handlePointerEvents({ pointerEventType: "over" })
                }
                onPointerOut={() =>
                    handlePointerEvents({ pointerEventType: "out" })
                }
            >
                <Text
                    fontWeight={"bold"}
                    onClick={() =>
                        useGlobalStore.setState({
                            editingNoteGroups: false,
                            cellsIgnorePointerEvents: false,
                        })
                    }
                >
                    {motionBasicWhiteMaterial}X
                </Text>
            </group>
        </>
    );
}

function Displays() {
    const [sequencerLength, setSequencerLength] = useState(
        useGlobalStore.getState().sequencerLength
    );
    const [sequencerHeight, setSequencerHeight] = useState(
        useGlobalStore.getState().sequencerHeight
    );
    const noteGroupCellHeight = useGlobalStore(
        (state) => state.noteGroupCellHeight
    );
    const noteGroupCellXOffset = useGlobalStore(
        (state) => state.noteGroupCellXOffset
    );
    const showNoteGroupEditDisplay = useGlobalStore(
        (state) => state.showNoteGroupEditDisplay
    );
    const showValueChangeDisplay = useGlobalStore(
        (state) => state.showValueChangeDisplay
    );
    const displayPlaneArgs: [number, number] = [
        sequencerLength + noteGroupCellHeight * 2 + noteGroupCellXOffset + 4,
        sequencerHeight + 6,
    ];
    const [variant, setVariant] = useState<DisplayVariant>("hideFast");

    useEffect(() => {
        if (showNoteGroupEditDisplay || showValueChangeDisplay) {
            setVariant("show");
        } else {
            useGlobalStore.setState({ cellsIgnorePointerEvents: false });
            setVariant("hideSlow");
        }
    }, [showNoteGroupEditDisplay, showValueChangeDisplay]);
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
        const unsubSequencerHeight = useGlobalStore.subscribe(
            (state) => state.sequencerHeight,
            (value) => {
                setSequencerHeight(value);
            }
        );
        return () => {
            unsubSequencerHeight();
        };
    });

    return (
        <group position={[0, 0, 0]}>
            {/* <mesh position={[0, 0, -0.4]}>
                <planeGeometry args={displayPlaneArgs} />
                <meshBasicMaterial
                    color={colors.background}
                    toneMapped={false}
                />
            </mesh> */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={displayPlaneArgs} />
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={overlayVariants}
                    color="black"
                    transparent
                    opacity={0.0}
                />
            </mesh>
            <ValueChangeDisplay />
            <NoteGroupEditDisplay
                displayPlaneArgs={displayPlaneArgs}
                sequencerHeight={sequencerHeight}
            />
        </group>
    );
}

export default function Touchscreen({
    position = [0, 0, 0],
}: {
    position?: [number, number, number];
}) {
    const planeSize: [number, number] = [35, 22];
    return (
        <mesh position={position}>
            <planeGeometry args={planeSize} />
            <meshBasicMaterial toneMapped={false}>
                <RenderTexture
                    attach="map"
                    anisotropy={16}
                >
                    <OrthographicCamera
                        makeDefault
                        position={[0, 0, 10]}
                        zoom={1}
                        left={-planeSize[0] / 2}
                        right={planeSize[0] / 2}
                        top={planeSize[1] / 2}
                        bottom={-planeSize[1] / 2}
                    />
                    <color
                        attach="background"
                        args={[colors.background]}
                    />
                    <Displays />
                    <Center position={[0, 0, -0.2]}>
                        <Sequencer />
                        <NoteGroups />
                        <DrumSequencer />
                    </Center>
                </RenderTexture>
            </meshBasicMaterial>
        </mesh>
    );
}
