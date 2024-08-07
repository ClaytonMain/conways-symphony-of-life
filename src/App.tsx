import {
    Environment,
    OrbitControls,
    PerformanceMonitor,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { enableMapSet } from "immer";
import { Suspense, useState } from "react";
import * as THREE from "three";
import "./App.css";
import Conductor from "./Conductor";
import Controls from "./Controls";
import Conway from "./Conway";
import DetectClick from "./DetectClick";
import Instrument from "./Instrument";

enableMapSet();

type OrbitControlsEventTarget = EventTarget & {
    object: THREE.Camera;
    target: THREE.Vector3;
};

function App() {
    const [dpr, setDpr] = useState<number>(1.5);
    const bgColor = "#eeaa44";
    // const bgColor = "#1a191f";
    const minPan = new THREE.Vector3(-5, -5, 0);
    const maxPan = new THREE.Vector3(5, 5, 0);
    const _v = new THREE.Vector3();

    return (
        <>
            <DetectClick />
            <Canvas
                orthographic
                dpr={dpr}
                camera={{ position: [0, 0, 10], zoom: 70 }}
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
                    <Environment preset="city" />
                    <color
                        attach="background"
                        args={[bgColor]}
                    />
                    <ambientLight intensity={0.5} />
                    <Instrument />
                    <Conductor />
                    <Conway />
                    <Controls />
                </Suspense>
            </Canvas>
        </>
    );
}

export default App;
