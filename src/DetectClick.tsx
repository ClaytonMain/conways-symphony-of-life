import { useEffect } from "react";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function DetectClick() {
    function handleClick() {
        useGlobalStore.setState((state) => {
            state.userHasClicked = true;
        });
    }
    useEffect(() => {
        document.body.addEventListener("click", handleClick, { once: true });
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);
    return null;
}
