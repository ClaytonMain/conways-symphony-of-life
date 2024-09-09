import { Html } from "@react-three/drei";
import * as THREE from "three";
import "./HtmlLabel.css";

interface HtmlLabelProps {
    position: [number, number, number] | THREE.Vector3;
    label?: string;
    className?: string;
    styleUpdate?: React.CSSProperties | undefined;
}

export default function HtmlLabel({
    position,
    label = "",
    className = "default",
    styleUpdate,
}: HtmlLabelProps) {
    return (
        <Html
            center
            transform
            position={position}
            className={className}
            style={styleUpdate}
        >
            {label}
        </Html>
    );
}
