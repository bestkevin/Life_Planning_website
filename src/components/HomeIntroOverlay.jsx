import { useEffect, useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter.js";

const INTRO_TEXT =
    "你来了？我们都在等你。刚好我们在聊一个有趣的话题……";

const PHASE = {
    DARK: "dark",
    LAMP: "lamp",
    TEXT: "text",
    REVEAL: "reveal",
    DONE: "done",
};

export default function HomeIntroOverlay({ onComplete }) {
    const [phase, setPhase] = useState(PHASE.DARK);
    const { displayed, done } = useTypewriter(INTRO_TEXT, phase === PHASE.TEXT, 46);

    useEffect(() => {
        if (phase !== PHASE.DARK) return undefined;

        const lampTimer = window.setTimeout(() => setPhase(PHASE.LAMP), 700);
        return () => window.clearTimeout(lampTimer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.LAMP) return undefined;

        const textTimer = window.setTimeout(() => setPhase(PHASE.TEXT), 1200);
        return () => window.clearTimeout(textTimer);
    }, [phase]);

    useEffect(() => {
        if (!done || phase !== PHASE.TEXT) return undefined;

        const revealTimer = window.setTimeout(() => setPhase(PHASE.REVEAL), 900);
        return () => window.clearTimeout(revealTimer);
    }, [done, phase]);

    useEffect(() => {
        if (phase !== PHASE.REVEAL) return undefined;

        const doneTimer = window.setTimeout(() => {
            setPhase(PHASE.DONE);
            onComplete?.();
        }, 1100);

        return () => window.clearTimeout(doneTimer);
    }, [phase, onComplete]);

    if (phase === PHASE.DONE) {
        return null;
    }

    return (
        <div
            className={`home-intro-overlay home-intro-overlay--${phase}`}
            aria-hidden="true"
        >
            <div className="home-intro-lamp-wrap">
                <div className="home-intro-lamp-cord" />
                <div className="home-intro-lamp-shade" />
                <div className="home-intro-lamp-glow" />
            </div>
            <p className="home-intro-text">{displayed}</p>
        </div>
    );
}
