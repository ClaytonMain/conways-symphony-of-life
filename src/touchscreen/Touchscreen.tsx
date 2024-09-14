import { Center, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useEffect, useRef, useState } from "react";
import DrumSequencer from "../DrumSequencer";
import NoteGroups from "../NoteGroups";
import Sequencer from "../Sequencer";
import { useGlobalStore } from "../stores/useGlobalStore";

export default function Touchscreen() {
    const sequencerLength = useGlobalStore((state) => state.sequencerLength);
    const sequencerHeight = useGlobalStore((state) => state.sequencerHeight);
    const noteGroupCellHeight = useGlobalStore(
        (state) => state.noteGroupCellHeight
    );
    const noteGroupCellXOffset = useGlobalStore(
        (state) => state.noteGroupCellXOffset
    );
    const [displayLabel, setDisplayLabel] = useState(
        useGlobalStore.getState().displayLabel
    );
    const [displayValue, setDisplayValue] = useState(
        useGlobalStore.getState().displayValue
    );
    const displayDurationRef = useRef(10);
    const [variant, setVariant] = useState("hidden");
    const backgroundVariants = {
        hidden: {
            opacity: 0,
            transition: {
                duration: 1.0,
            },
        },
        visible: {
            opacity: 0.3,
            transition: {
                duration: 0.1,
            },
        },
    };
    const textVariants = {
        hidden: {
            opacity: 0,
            transition: {
                duration: 1.0,
            },
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.1,
            },
        },
    };

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

    useEffect(() => {
        const unsubDisplayValue = useGlobalStore.subscribe(
            (state) => state.displayValue,
            (value) => {
                setDisplayValue(value);
                displayDurationRef.current = 0;
                if (variant === "hidden") setVariant("visible");
            }
        );
        return () => {
            unsubDisplayValue();
        };
    });

    useFrame((_, delta) => {
        displayDurationRef.current += delta;
        if (displayDurationRef.current > 1) {
            setVariant("hidden");
        }
    });

    return (
        <group>
            <mesh>
                <planeGeometry
                    args={[
                        sequencerLength +
                            noteGroupCellHeight * 2 +
                            noteGroupCellXOffset +
                            4,
                        sequencerHeight + 6,
                    ]}
                />
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={backgroundVariants}
                    color="black"
                    transparent
                    opacity={0.0}
                />
            </mesh>
            <Text
                position={[0, 3, 0]}
                fontWeight={"bold"}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={textVariants}
                    color="white"
                    transparent
                    opacity={0.0}
                />
                {displayLabel}
            </Text>
            <Text
                position={[0, -5, 0]}
                scale={5}
                fontWeight={"bold"}
            >
                <motion.meshBasicMaterial
                    initial={"hidden"}
                    animate={variant}
                    variants={textVariants}
                    color="white"
                    transparent
                    opacity={0.0}
                />
                {displayValue}
            </Text>
            <Center>
                <Sequencer />
                <NoteGroups />
                <DrumSequencer />
            </Center>
        </group>
    );
}
