import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projectTwoIntroText } from "../data/hollandContent.js";
import { useTypewriter } from "../hooks/useTypewriter.js";
import HollandHexagon from "./HollandHexagon.jsx";

const PHASE = {
    BLACK: "black",
    TYPE: "type",
    PARCHMENT: "parchment",
    DONE: "done",
};

const INTRO_SEEN_KEY = "projectTwoIntroSeen";
const TYPE_SPEED = 96;
const BLACK_MS = 1600;
const PARCHMENT_MS = 5000;
const FAILSAFE_MS = 22000;

export function hasSeenProjectTwoIntro() {
    return localStorage.getItem(INTRO_SEEN_KEY) === "1";
}

export function markProjectTwoIntroSeen() {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
}

/**
 * Black screen → typewriter → parchment + hexagon (~5s) → done.
 */
export default function ProjectTwoIntro({ onDone }) {
    const shouldPlayRef = useRef(!hasSeenProjectTwoIntro());
    const finishedRef = useRef(!shouldPlayRef.current);
    const [phase, setPhase] = useState(() =>
        shouldPlayRef.current ? PHASE.BLACK : PHASE.DONE,
    );

    const { displayed } = useTypewriter(
        projectTwoIntroText,
        phase === PHASE.TYPE,
        TYPE_SPEED,
    );

    const finish = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        markProjectTwoIntroSeen();
        setPhase(PHASE.DONE);
        onDone?.();
    }, [onDone]);

    useEffect(() => {
        if (!shouldPlayRef.current) {
            onDone?.();
            return undefined;
        }

        const typeMs = projectTwoIntroText.length * TYPE_SPEED;
        const parchmentAt = BLACK_MS + typeMs + 700;
        const doneAt = parchmentAt + PARCHMENT_MS;

        const toType = window.setTimeout(() => {
            setPhase((current) => (current === PHASE.DONE ? current : PHASE.TYPE));
        }, BLACK_MS);

        const toParchment = window.setTimeout(() => {
            setPhase((current) => (current === PHASE.DONE ? current : PHASE.PARCHMENT));
        }, parchmentAt);

        const toDone = window.setTimeout(finish, doneAt);
        const failsafe = window.setTimeout(finish, FAILSAFE_MS);

        const onHashChange = () => finish();
        window.addEventListener("hashchange", onHashChange);

        return () => {
            window.clearTimeout(toType);
            window.clearTimeout(toParchment);
            window.clearTimeout(toDone);
            window.clearTimeout(failsafe);
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [finish, onDone]);

    useEffect(() => {
        const playing = phase !== PHASE.DONE;
        if (playing) {
            document.body.dataset.projectTwoIntro = "true";
        } else {
            delete document.body.dataset.projectTwoIntro;
        }
        return () => delete document.body.dataset.projectTwoIntro;
    }, [phase]);

    if (phase === PHASE.DONE || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className={`project-two-intro project-two-intro--${phase}`}
            role="dialog"
            aria-modal="true"
            aria-label="项目2入场"
        >
            {(phase === PHASE.BLACK || phase === PHASE.TYPE) && (
                <p className="project-two-intro-type">{displayed}</p>
            )}

            {phase === PHASE.PARCHMENT && (
                <div className="project-two-parchment">
                    <img
                        className="project-two-parchment-bg"
                        src={`${import.meta.env.BASE_URL}img/project2-parchment.png`}
                        alt=""
                    />
                    <div className="project-two-parchment-hex">
                        <HollandHexagon interactive={false} size={240} />
                    </div>
                </div>
            )}
        </div>,
        document.body,
    );
}
