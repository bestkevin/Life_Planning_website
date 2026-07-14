import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTypewriter } from "../hooks/useTypewriter.js";

const INTRO_TEXT =
    "你来了？我们都在等你。刚好我们在聊一个有趣的话题……";

const sconceSrc = `${import.meta.env.BASE_URL}img/wall-sconce.png`;

const PHASE = {
    DARK: "dark",
    LAMP: "lamp",
    TEXT: "text",
    HOLD: "hold",
    BLACKOUT: "blackout",
    DONE: "done",
};

const TIMING = {
    darkHold: 1800,
    lampHold: 2800,
    typeSpeed: 72,
    textHold: 3200,
    blackoutFade: 1200,
    blackoutHold: 800,
};

export default function HomeIntroOverlay({ onBlackoutComplete }) {
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

        const blackoutTimer = window.setTimeout(() => setPhase(PHASE.BLACKOUT), 500);
        return () => window.clearTimeout(blackoutTimer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.BLACKOUT) return undefined;

        const doneTimer = window.setTimeout(() => {
            setPhase(PHASE.DONE);
            onBlackoutComplete?.();
        }, TIMING.blackoutFade + TIMING.blackoutHold);

        return () => window.clearTimeout(doneTimer);
    }, [phase, onBlackoutComplete]);

    if (phase === PHASE.DONE) {
        return null;
    }

    return createPortal(
        <div
            className={`home-intro-overlay home-intro-overlay--${phase}`}
            aria-hidden="true"
        >
            <div className="home-intro-lamp-wrap">
                <img
                    className="home-intro-lamp-image"
                    src={sconceSrc}
                    alt=""
                    draggable="false"
                />
                <div className="home-intro-lamp-beam" />
            </div>
            <p className="home-intro-text">{displayed}</p>
        </div>,
        document.body,
    );
}
