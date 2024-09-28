import { useProgress } from "@react-three/drei";
import { useEffect } from "react";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function LoadProgressListener() {
    const progress = useProgress((state) => state.progress);
    useEffect(() => {
        useGlobalStore.setState((state) => {
            state.loadingPercent = progress;
        });
    }, [progress]);
    return null;
}
