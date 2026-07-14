import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTypewriter } from "../hooks/useTypewriter.js";

const INTRO_TEXT =
    "你来了？我们都在等你。刚好我们在聊一个有趣的话题……";

const pendantSrc = `${import.meta.env.BASE_URL}img/pendant-lamp.png`;
const cordSrc = `${import.meta.env.BASE_URL}img/pendant-cord.png`;

const PHASE = {
    DARK: "dark",
    LAMP: "lamp",
    DROP: "drop",
    TEXT: "text",
    HOLD: "hold",
    BLACKOUT: "blackout",
    DONE: "done",
};

const TIMING = {
    darkHold: 1200,
    lampAppearHold: 1800,
    dropHold: 3600,
    typeSpeed: 72,
    textHold: 3200,
    fadeOut: 1400,
};

export default function HomeIntroOverlay({ onRevealHome, onBlackoutComplete }) {
    const [phase, setPhase] = useState(PHASE.DARK);
    const { displayed, done } = useTypewriter(
        INTRO_TEXT,
        phase === PHASE.TEXT || phase === PHASE.HOLD,
        TIMING.typeSpeed,
    );

    useEffect(() => {
        if (phase !== PHASE.DARK) return undefined;

        const timer = window.setTimeout(() => setPhase(PHASE.LAMP), TIMING.darkHold);
        return () => window.clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.LAMP) return undefined;

        const timer = window.setTimeout(() => setPhase(PHASE.DROP), TIMING.lampAppearHold);
        return () => window.clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.DROP) return undefined;

        const timer = window.setTimeout(() => setPhase(PHASE.TEXT), TIMING.dropHold);
        return () => window.clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (!done || phase !== PHASE.TEXT) return undefined;

        const timer = window.setTimeout(() => setPhase(PHASE.HOLD), TIMING.textHold);
        return () => window.clearTimeout(timer);
    }, [done, phase]);

    useEffect(() => {
        if (phase !== PHASE.HOLD) return undefined;

        const timer = window.setTimeout(() => setPhase(PHASE.BLACKOUT), 500);
        return () => window.clearTimeout(timer);
    }, [phase]);

    useEffect(() => {
        if (phase !== PHASE.BLACKOUT) return undefined;

        onRevealHome?.();

        const timer = window.setTimeout(() => {
            setPhase(PHASE.DONE);
            onBlackoutComplete?.();
        }, TIMING.fadeOut);

        return () => window.clearTimeout(timer);
    }, [phase, onRevealHome, onBlackoutComplete]);

    if (phase === PHASE.DONE) {
        return null;
    }

    return createPortal(
        <div
            className={`home-intro-overlay home-intro-overlay--${phase}`}
            aria-hidden="true"
        >
            <div className="home-intro-lamp-wrap">
                <div
                    className="home-intro-lamp-cord"
                    style={{ backgroundImage: `url(${cordSrc})` }}
                />
                <div className="home-intro-lamp-body">
                    <img
                        className="home-intro-lamp-image"
                        src={pendantSrc}
                        alt=""
                        draggable="false"
                    />
                    <div className="home-intro-lamp-beam" />
                </div>
            </div>
            <p className="home-intro-text">{displayed}</p>
        </div>,
        document.body,
    );
}
