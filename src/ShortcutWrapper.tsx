import { KeyboardControls } from "@react-three/drei";
import { ReactNode } from "react";
import { ShortcutEnum } from "./sharedTypes";

interface ShortcutWrapperProps {
    children: ReactNode;
}

export default function ShortcutWrapper({ children }: ShortcutWrapperProps) {
    const keyboardControlsMap = [
        { name: ShortcutEnum.space, keys: ["Space"] },
        { name: ShortcutEnum.key1, keys: ["1"] },
        { name: ShortcutEnum.key2, keys: ["2"] },
        { name: ShortcutEnum.key3, keys: ["3"] },
        { name: ShortcutEnum.key4, keys: ["4"] },
        { name: ShortcutEnum.key5, keys: ["5"] },
        { name: ShortcutEnum.key6, keys: ["6"] },
        { name: ShortcutEnum.key7, keys: ["7"] },
        { name: ShortcutEnum.key8, keys: ["8"] },
        { name: ShortcutEnum.key9, keys: ["9"] },
        { name: ShortcutEnum.key0, keys: ["0"] },
    ];
    return (
        <KeyboardControls map={keyboardControlsMap}>
            {children}
        </KeyboardControls>
    );
}
