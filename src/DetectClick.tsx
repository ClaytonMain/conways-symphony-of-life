import { useEffect } from "react";
import { useGridStore } from "./useGridStore";

export default function DetectClick() {
    function handleClick() {
        useGridStore.setState((state) => {
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
