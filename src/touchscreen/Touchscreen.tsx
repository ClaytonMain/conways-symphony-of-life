import {
    Center,
    Instance,
    Instances,
    Text,
    useCursor,
    useTexture,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { colors, genericBoxGeometry } from "../constants";
import DrumSequencer from "../DrumSequencer";
import NoteGroups from "../NoteGroups";
import Sequencer from "../Sequencer";
import { NoteOctave, PointerEventTypes } from "../sharedTypes";
import { useGlobalStore } from "../stores/useGlobalStore";

type DisplayVariant = "show" | "hideSlow" | "hideFast";
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

// interface ValueChangeDisplayProps {}
function ValueChangeDisplay() {
    const [variant, setVariant] = useState<DisplayVariant>("hideFast");
    const [displayValue, setDisplayValue] = useState(
        useGlobalStore.getState().displayValue
    );
    const [showValueChangeDisplay, setShowValueChangeDisplay] = useState(false);
    const displayLabel = useGlobalStore((state) => state.displayLabel);
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

    useFrame((_, delta) => {
        displayDurationRef.current += delta;
        if (displayDurationRef.current > 1) {
            if (variant === "show") {
                setVariant("hideSlow");
            }
            if (showValueChangeDisplay) {
                setShowValueChangeDisplay(false);
                useGlobalStore.setState({ showValueChangeDisplay: false });
            }
        }
    });

    return (
        <>
            <Text
                position={[0, 3, 0]}
                fontWeight={"bold"}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={displayVariants}
                    color="white"
                    transparent
                    opacity={0.0}
                />
                {displayLabel}
            </Text>
            <Text
                position={[0, 0, 0]}
                scale={4}
                fontWeight={"bold"}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={displayVariants}
                    color="white"
                    transparent
                    opacity={0.0}
                />
                {displayValue}
            </Text>
        </>
    );
}

const keyOffsets = [0, 0.4, 1, 1.6, 2, 3, 3.4, 4, 4.5, 5, 5.6, 6];

interface PianoKeyProps {
    index: number;
    keysStartXPosition: number;
    whiteKeyWidth: number;
}

function PianoKey({ index, keysStartXPosition, whiteKeyWidth }: PianoKeyProps) {
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [enabled, setEnabled] = useState(
        useGlobalStore
            .getState()
            .noteGroupCells[currentNoteGroupIndex].semitones.includes(index)
    );
    const accidental = [1, 3, 6, 8, 10].includes(index % 12);
    const keyIndex = keyOffsets[index % 12] + Math.floor(index / 12) * 7;

    useEffect(() => {
        const unsubCurrentNoteGroupIndex = useGlobalStore.subscribe(
            (state) => state.currentNoteGroupIndex,
            (value) => {
                setCurrentNoteGroupIndex(value);
                setEnabled(
                    useGlobalStore
                        .getState()
                        .noteGroupCells[value].semitones.includes(index)
                );
            }
        );
        return () => {
            unsubCurrentNoteGroupIndex();
        };
    });

    function handleOnClick() {
        const activeSemitones =
            useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
                .semitones;
        let newSemitones: number[] = [];
        if (!enabled) {
            newSemitones = [...activeSemitones, index];
            newSemitones.sort((a, b) => a - b);
        } else {
            activeSemitones.forEach((semitone) => {
                if (semitone !== index) {
                    newSemitones.push(semitone);
                }
            });
        }
        setEnabled(!enabled);
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
}
function ScreenArrowSelector({
    position,
    options,
    startingOptionIndex = 0,
    onIndexChange,
    animate,
    variants,
    label,
}: ScreenArrowSelectorProps) {
    const [currentOptionIndex, setCurrentOptionIndex] =
        useState(startingOptionIndex);
    const arrowButtonAlphaMap = useTexture("images/ArrowButtonAlphaMap.png");
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    function handleOnClick(increment: -1 | 1) {
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

    return (
        <group position={position}>
            <group
                position={[0, 1.25, 0.01]}
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
                    position={[0, 0, 0]}
                >
                    <motion.meshBasicMaterial
                        initial={"hidden"}
                        animate={animate}
                        variants={variants}
                        color={"white"}
                        transparent
                        alphaMap={arrowButtonAlphaMap}
                    />
                </mesh>
            </group>
            <group
                position={[0, -1.25, 0.01]}
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
                    position={[0, 0, 0]}
                >
                    <motion.meshBasicMaterial
                        initial={"hidden"}
                        animate={animate}
                        variants={variants}
                        color={"white"}
                        transparent
                        alphaMap={arrowButtonAlphaMap}
                    />
                </mesh>
            </group>
            <Text
                fontWeight={"bold"}
                position={[0, 0, 0.01]}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={animate}
                    variants={variants}
                    color="white"
                    transparent
                />
                {options[currentOptionIndex]}
            </Text>
            <Text
                fontWeight={"bold"}
                position={[0, -2.5, 0.01]}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={animate}
                    variants={variants}
                    color="white"
                    transparent
                />
                {label}
            </Text>
        </group>
    );
}

interface NoteGroupEditDisplayProps {
    displayPlaneArgs: [number, number];
}

function NoteGroupEditDisplay({ displayPlaneArgs }: NoteGroupEditDisplayProps) {
    const [currentNoteGroupIndex, setCurrentNoteGroupIndex] = useState(
        useGlobalStore.getState().currentNoteGroupIndex
    );
    const [currentNoteGroup, setCurrentNoteGroup] = useState(
        useGlobalStore.getState().noteGroupCells[currentNoteGroupIndex]
    );
    const octaveStart = useGlobalStore(
        (state) => state.noteGroupCells[currentNoteGroupIndex].octaveStart
    );
    const [variant, setVariant] = useState<DisplayVariant>("hideFast");
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    const octaveOptions: NoteOctave[] = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7];

    const keysStartXPosition =
        -displayPlaneArgs[0] / 2 + 0.5 + (displayPlaneArgs[0] * 7) / (28 * 2);
    const whiteKeyWidth = displayPlaneArgs[0] / 28;

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
            }
        );
        return () => {
            unsubCurrentNoteGroupIndex();
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

    return (
        <>
            {/* "Editing Note Group: N" */}
            <group position={[0, 6, 0]}>
                <Text
                    fontWeight={"bold"}
                    scale={2}
                >
                    <motion.meshBasicMaterial
                        initial={"hidden"}
                        animate={variant}
                        variants={displayVariants}
                        color="white"
                        transparent
                    />
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
                    />
                    {Array.from({ length: 36 }, (_, i) => (
                        <PianoKey
                            key={i}
                            index={i}
                            keysStartXPosition={keysStartXPosition}
                            whiteKeyWidth={whiteKeyWidth}
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
                        color={"black"}
                        fontWeight={"bold"}
                    >
                        <motion.meshBasicMaterial
                            initial={"hidden"}
                            animate={variant}
                            variants={displayVariants}
                            transparent
                        />
                        {`C${octaveStart + i}`}
                    </Text>
                ))}
            </group>
            {/* Buttons & selectors. */}
            <group position={[0, -6, 0]}>
                <ScreenArrowSelector
                    options={octaveOptions}
                    startingOptionIndex={octaveOptions.indexOf(octaveStart)}
                    onIndexChange={(index) => {
                        useGlobalStore.setState((state) => {
                            state.noteGroupCells[
                                currentNoteGroupIndex
                            ].octaveStart = octaveOptions[index];
                        });
                    }}
                    animate={variant}
                    variants={displayVariants}
                    label={"OCTAVE"}
                />
            </group>
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
                    <motion.meshBasicMaterial
                        initial={"hidden"}
                        animate={variant}
                        variants={displayVariants}
                        color="white"
                        transparent
                    />
                    X
                </Text>
            </group>
        </>
    );
}

function Displays() {
    const sequencerLength = useGlobalStore((state) => state.sequencerLength);
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
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

    return (
        <group position={[0, 0, 0.1]}>
            <mesh position={[0, 0, -0.05]}>
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
            <NoteGroupEditDisplay displayPlaneArgs={displayPlaneArgs} />
        </group>
    );
}

export default function Touchscreen() {
    return (
        <group>
            <Displays />
            <Center>
                <Sequencer />
                <NoteGroups />
                <DrumSequencer />
            </Center>
        </group>
    );
}
