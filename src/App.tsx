import {
    AccumulativeShadows,
    Bounds,
    Environment,
    Loader,
    OrbitControls,
    PerformanceMonitor,
    RandomizedLight,
    SizeProps,
    Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { enableMapSet } from "immer";
import { Suspense, useState } from "react";
import * as THREE from "three";
import "./App.css";
import DetectClick from "./DetectClick";
import Instrument from "./Instrument";
import PlayStateController from "./PlayStateController";
import ShortcutWrapper from "./ShortcutWrapper";
import SynthAndDrumStatesController from "./SynthAndDrumStatesController";
import Timekeeper from "./Timekeeper";
import { colors } from "./constants";
import Controls from "./controls/Controls";
import Touchscreen from "./touchscreen/Touchscreen";

enableMapSet();

type OrbitControlsEventTarget = EventTarget & {
    object: THREE.Camera;
    target: THREE.Vector3;
};

function App() {
    const [dpr, setDpr] = useState<number>(1.5);
    const [minPan, setMinPan] = useState(new THREE.Vector3(-50, 0, -50));
    const [maxPan, setMaxPan] = useState(new THREE.Vector3(50, 0, 50));
    const _v = new THREE.Vector3();
    const dprRange = [1, 2];
    const [accShadowFrames, setAccShadowFrames] = useState(64);
    const [accShadowResolution, setAccShadowResolution] = useState(1024);
    const accShadowFramesRange = [2, 512];
    const accShadowResolutionRange = [256, 4096];

    function handleOnFit(data: SizeProps) {
        const centerX = data.center.x;
        const centerZ = data.center.z;
        const boxXRange = data.box.max.x - data.box.min.x;
        const boxZRange = data.box.max.z - data.box.min.z;
        setMinPan(
            new THREE.Vector3(
                centerX - boxXRange / 2,
                0,
                centerZ - boxZRange / 2
            )
        );
        setMaxPan(
            new THREE.Vector3(
                centerX + boxXRange / 2,
                0,
                centerZ + boxZRange / 2
            )
        );
    }

    return (
        <>
            <SpeedInsights />
            <DetectClick />
            <Canvas
                // orthographic
                shadows
                dpr={dpr}
                camera={{ position: [-0.02, 10, 1], fov: 35 }}
            >
                <OrbitControls
                    makeDefault
                    // enableRotate={false}
                    // maxAzimuthAngle={0.05}
                    // minAzimuthAngle={-0.05}
                    // maxPolarAngle={Math.PI / 4}
                    // minPolarAngle={0.1}
                    target0={new THREE.Vector3(0, 0, 0)}
                    mouseButtons={{
                        LEFT: THREE.MOUSE.ROTATE,
                        MIDDLE: THREE.MOUSE.PAN,
                        RIGHT: undefined,
                    }}
                    // screenSpacePanning
                    minDistance={1}
                    maxDistance={10}
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
                    onDecline={() => {
                        if (dpr > 1) setDpr(1);
                        if (accShadowFrames > accShadowFramesRange[0])
                            setAccShadowFrames(accShadowFrames / 2);
                        if (accShadowResolution > accShadowResolutionRange[0])
                            setAccShadowResolution(accShadowResolution / 2);
                    }}
                />
                <Suspense fallback={null}>
                    <ShortcutWrapper>
                        <Environment preset="city" />
                        <color
                            attach="background"
                            args={[colors.background]}
                        />
                        {/* <ambientLight intensity={1} /> */}
                        <Timekeeper />
                        <PlayStateController />
                        <SynthAndDrumStatesController />
                        <AccumulativeShadows
                            temporal
                            frames={40}
                            color="orange"
                            colorBlend={2}
                            toneMapped={true}
                            alphaTest={0.75}
                            opacity={2}
                            resolution={1024}
                        >
                            <RandomizedLight
                                intensity={Math.PI}
                                amount={8}
                                radius={4}
                                ambient={0.5}
                                position={[5, 5, -10]}
                                bias={0.001}
                            />
                        </AccumulativeShadows>
                        <Bounds
                            fit
                            clip
                            maxDuration={0}
                            onFit={handleOnFit}
                            margin={1.2}
                        >
                            <group
                                rotation={[-Math.PI / 2, 0, 0]}
                                scale={0.051}
                                position={[0, 0.06, 0]}
                            >
                                <Instrument />
                                <group
                                    rotation={[0.077318, 0, 0]}
                                    position={[0, -4.3, 2.7]}
                                >
                                    <Touchscreen position={[0, 0, -0.8]} />
                                    <Controls />
                                </group>
                            </group>
                        </Bounds>
                    </ShortcutWrapper>
                </Suspense>
                <Stats />
            </Canvas>
            <Loader />
        </>
    );
}

export default App;
