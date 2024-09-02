import { KeyboardControls } from "@react-three/drei";
import { ReactNode } from "react";
import { ShortcutEnum } from "./sharedTypes";

interface ShortcutWrapperProps {
    children: ReactNode;
}

export default function ShortcutWrapper({ children }: ShortcutWrapperProps) {
    return (
        <KeyboardControls map={[{ name: ShortcutEnum.space, keys: ["Space"] }]}>
            {children}
        </KeyboardControls>
    );
}
