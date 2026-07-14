import { useEffect, useState } from "react";
import { useTypewriter } from "../hooks/useTypewriter.js";

const INTRO_TEXT =
    "你来了？我们都在等你。刚好我们在聊一个有趣的话题……";

const PHASE = {
    DARK: "dark",
    LAMP: "lamp",
    TEXT: "text",
    HOLD: "hold",
    REVEAL: "reveal",
    DONE: "done",
};

const TIMING = {
    darkHold: 1800,
    lampHold: 2800,
    typeSpeed: 72,
    textHold: 3200,
    revealHold: 2600,
};

export default function HomeIntroOverlay({ onComplete }) {
    const [phase, setPhase] = useState(PHASE.DARK);
    const { displayed, done } = useTypewriter(
        INTRO_TEXT,
        phase === PHASE.TEXT || phase === PHASE.HOLD,
        TIMING.typeSpeed,
    );

    useEffect(() => {
        if (phase !== PHASE.DARK) return undefined;

        const lampTimer = window.setTimeout(() => setPhase(PHASE.LAMP), TIMING.darkHold);
        return () => window.clearTimeout(lampTimer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.LAMP) return undefined;

        const textTimer = window.setTimeout(() => setPhase(PHASE.TEXT), TIMING.lampHold);
        return () => window.clearTimeout(textTimer);
    }, [phase]);

    useEffect(() => {
        if (!done || phase !== PHASE.TEXT) return undefined;

        const holdTimer = window.setTimeout(() => setPhase(PHASE.HOLD), TIMING.textHold);
        return () => window.clearTimeout(holdTimer);
    }, [done, phase]);

    useEffect(() => {
        if (phase !== PHASE.HOLD) return undefined;

        const revealTimer = window.setTimeout(() => setPhase(PHASE.REVEAL), 600);
        return () => window.clearTimeout(revealTimer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.REVEAL) return undefined;

        const doneTimer = window.setTimeout(() => {
            setPhase(PHASE.DONE);
            onComplete?.();
        }, TIMING.revealHold);

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
