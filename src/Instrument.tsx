import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
    nodes: {
        Cube: THREE.Mesh;
    };
    materials: object;
};

export default function Instrument(props: JSX.IntrinsicElements["group"]) {
    const { nodes } = useGLTF("models/sequencer02.glb") as GLTFResult;
    const materialProps = useTexture({
        roughnessMap: "textures/Metal027_1K-JPG/Metal027_1K-JPG_Roughness.jpg",
        normalMap: "textures/Metal027_1K-JPG/Metal027_1K-JPG_NormalGL.jpg",
    });
    materialProps.roughnessMap.repeat.set(5, 5);
    materialProps.normalMap.repeat.set(5, 5);
    materialProps.roughnessMap.wrapS = THREE.RepeatWrapping;
    materialProps.roughnessMap.wrapT = THREE.RepeatWrapping;
    materialProps.normalMap.wrapS = THREE.RepeatWrapping;
    materialProps.normalMap.wrapT = THREE.RepeatWrapping;
    return (
        <group
            {...props}
            dispose={null}
        >
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cube.geometry}
                position={[0, 0.088, 0.082]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={14.8}
            >
                <meshStandardMaterial
                    {...materialProps}
                    displacementScale={0.0}
                    color={"#1d1d26"}
                />
            </mesh>
        </group>
    );
}

useGLTF.preload("/sequencer.glb");
