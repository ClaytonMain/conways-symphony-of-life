import {
    Bounds,
    Environment,
    OrbitControls,
    PerformanceMonitor,
    SizeProps,
    Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { enableMapSet } from "immer";
import { Suspense, useState } from "react";
import * as THREE from "three";
import "./App.css";
import DetectClick from "./DetectClick";
import DrumSequencer from "./DrumSequencer";
import NoteGroups from "./NoteGroups";
import PlayStateController from "./PlayStateController";
import Sequencer from "./Sequencer";
import ShortcutWrapper from "./ShortcutWrapper";
import SynthAndDrumStatesController from "./SynthAndDrumStatesController";
import Timekeeper from "./Timekeeper";

enableMapSet();

type OrbitControlsEventTarget = EventTarget & {
    object: THREE.Camera;
    target: THREE.Vector3;
};

function App() {
    const [dpr, setDpr] = useState<number>(1.5);
    const bgColor = "#eeaa44";
    // const bgColor = "#1a191f";
    const [minPan, setMinPan] = useState(new THREE.Vector3(-50, -50, 0));
    const [maxPan, setMaxPan] = useState(new THREE.Vector3(50, 50, 0));
    const _v = new THREE.Vector3();

    function handleOnFit(data: SizeProps) {
        const centerX = data.center.x;
        const centerY = data.center.y;
        const boxXRange = data.box.max.x - data.box.min.x;
        const boxYRange = data.box.max.y - data.box.min.y;
        setMinPan(
            new THREE.Vector3(
                centerX - boxXRange / 2,
                centerY - boxYRange / 2,
                0
            )
        );
        setMaxPan(
            new THREE.Vector3(
                centerX + boxXRange / 2,
                centerY + boxYRange / 2,
                0
            )
        );
    }

    return (
        <>
            <DetectClick />
            <Canvas
                orthographic
                dpr={dpr}
            >
                {/* <Perf position={"top-left"} /> */}
                <OrbitControls
                    makeDefault
                    enableRotate={false}
                    maxAzimuthAngle={0}
                    minAzimuthAngle={0}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                    target0={new THREE.Vector3(0, 0, 0)}
                    mouseButtons={{
                        LEFT: undefined,
                        MIDDLE: THREE.MOUSE.PAN,
                        RIGHT: undefined,
                    }}
                    // screenSpacePanning
                    minZoom={10}
                    maxZoom={500}
                    onChange={(e) => {
                        if (!e) return;
                        _v.copy((e.target as OrbitControlsEventTarget).target);
                        (e.target as OrbitControlsEventTarget).target.clamp(
                            minPan,
                            maxPan
                        );
                        _v.sub((e.target as OrbitControlsEventTarget).target);
                        e.target.object.position.sub(_v);
                    }}
                />
                <PerformanceMonitor
                    onIncline={() => setDpr(2)}
                    onDecline={() => setDpr(1)}
                />
                <Suspense fallback={null}>
                    <ShortcutWrapper>
                        <Environment preset="city" />
                        <color
                            attach="background"
                            args={[bgColor]}
                        />
                        <ambientLight intensity={0.5} />
                        <Timekeeper />
                        <PlayStateController />
                        <SynthAndDrumStatesController />
                        <Bounds
                            fit
                            clip
                            maxDuration={0}
                            onFit={handleOnFit}
                            margin={1.5}
                        >
                            <Sequencer />
                            <NoteGroups />
                            <DrumSequencer />
                        </Bounds>
                        {/* <Instrument />
                        <Conductor />
                        <Conway /> */}
                    </ShortcutWrapper>
                </Suspense>
                <Stats />
            </Canvas>
        </>
    );
}

export default App;
