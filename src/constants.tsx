import * as THREE from "three";
import {
    CellStates,
    DrumType,
    GameWrapMode,
    NoteAccidental,
    NoteName,
    NoteOctave,
} from "./sharedTypes";

export const initialSequencerLength = 32;
export const initialSequencerHeight = 16;
export const initialNpm = 240;
export const initialGameWrapMode: GameWrapMode = "both";
export const drumTypes: Array<DrumType> = ["Kick", "Snare", "HiHat"];
export const drumNoteMap: Record<DrumType, "A1" | "A2" | "A3"> = {
    Kick: "A1",
    Snare: "A2",
    HiHat: "A3",
};
export const sequencerScale = 0.3;
export const sequencerCellScale = 0.9;
export const aliveStates: CellStates[] = ["alive", "invincible"];
export const chordRoots: Array<`${NoteName}${NoteAccidental}`> = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];
export const octaves: NoteOctave[] = [
    -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
];
export const colors = {
    background: "#eeaa44",
    playingCell: "#ffffff",
    aliveCell: "#ffff00",
    activeCell: "#696969",
    deadCell: "#000000",
    instrumentButtons: "#545454",
    lightText: "#ffffff",
    darkText: "#000000",
    highlight1: "#f5ebc6",
    enabledDiatonic: "#eeaa44",
    enabledAccidental: "#b07620",
};
export const genericBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
const latheGeometryPoints = [
    new THREE.Vector2(1.0, 0.0),
    new THREE.Vector2(0.75, 0.2),
    new THREE.Vector2(0.65, 1),
    new THREE.Vector2(0.0, 1),
];
export const knobGeometry = new THREE.LatheGeometry(latheGeometryPoints, 13);
export const buttonMaterial = new THREE.MeshStandardMaterial({
    color: colors.instrumentButtons,
    toneMapped: false,
});
export const genericCircleGeometry = new THREE.CircleGeometry(0.5, 16);
export const knobDotMaterial = new THREE.MeshBasicMaterial({
    color: colors.highlight1,
});
export const arrowGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 3);
export const arrowMaterial = new THREE.MeshBasicMaterial({
    color: colors.highlight1,
});
export const buttonLabelElementMaterial = new THREE.MeshBasicMaterial({
    color: colors.lightText,
});
export const genericPlaneGeometry = new THREE.PlaneGeometry(1, 1);
export const staticLabelMaterialElement = (
    <meshBasicMaterial
        color="white"
        toneMapped={false}
        // transparent
    />
);
