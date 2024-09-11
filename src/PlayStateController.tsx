import { useKeyboardControls } from "@react-three/drei";
import { useEffect } from "react";
import { PlayStateType, ShortcutEnum } from "./sharedTypes";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function PlayStateController() {
    const [subscribeKeys] = useKeyboardControls<ShortcutEnum>();
    function getNewPlayState(playState: PlayStateType) {
        switch (playState) {
            case "playing":
                return "paused";
            case "paused":
                return "playing";
            case "stopped":
                useGlobalStore.setState((state) => {
                    state.startingCells =
                        useGlobalStore.getState().sequencerCells;
                });
                return "playing";
        }
    }
    useEffect(() => {
        const unsubscribeSpace = subscribeKeys(
            (state) => state.space,
            (pressed) => {
                const userHasClicked = useGlobalStore.getState().userHasClicked;
                const playState = useGlobalStore.getState().playState;
                if (pressed && userHasClicked) {
                    const newPlayState = getNewPlayState(playState);
                    useGlobalStore.setState((state) => {
                        state.playState = newPlayState;
                    });
                }
            }
        );
        return () => {
            unsubscribeSpace();
        };
    });
    return null;
}
