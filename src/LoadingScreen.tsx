import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGlobalStore } from "./stores/useGlobalStore";

export default function LoadingScreen() {
    const [userHasClicked, setUserHasClicked] = useState(
        useGlobalStore.getState().userHasClicked
    );
    const [loading, setLoading] = useState(
        useGlobalStore.getState().loadingPercent !== 100
    );
    const [textVariant, setTextVariant] = useState("show");
    const [displayText, setDisplayText] = useState("Loading...");
    const variants = {
        show: { opacity: 1, transition: { duration: 1.0 } },
        hide: { opacity: 0, transition: { duration: 1.0 } },
    };
    function setLoadingAfterDelay(value: boolean) {
        const timerId = setTimeout(() => {
            setLoading(value);
        }, 1000);
        return () => {
            clearTimeout(timerId);
        };
    }
    useEffect(() => {
        const unsubLoadingPercent = useGlobalStore.subscribe(
            (state) => state.loadingPercent,
            (value) => {
                if (value === 100) {
                    setLoadingAfterDelay(false);
                }
            }
        );
        return () => {
            unsubLoadingPercent();
        };
    });
    useEffect(() => {
        const unsubUserHasClicked = useGlobalStore.subscribe(
            (state) => state.userHasClicked,
            (value) => {
                setUserHasClicked(value);
            }
        );
        return () => {
            unsubUserHasClicked();
        };
    });
    useEffect(() => {
        if (!loading && !userHasClicked) {
            setTextVariant("hide");
            setTimeout(() => {
                setDisplayText("Click to Continue");
                setTextVariant("show");
            }, 1000);
        }
    }, [loading, userHasClicked]);
    return (
        <AnimatePresence>
            {(!userHasClicked || loading) && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "black",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: "1rem",
                        fontFamily: "monospace",
                        zIndex: 9999,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={textVariant}
                        variants={variants}
                    >
                        {displayText}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
