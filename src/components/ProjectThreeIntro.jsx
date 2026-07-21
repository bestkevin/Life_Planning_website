import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    projectThreeIntroText,
    projectThreeOccupationPhotos,
    projectThreeTitleCue,
} from "../data/project3Content.js";
import { useTypewriter } from "../hooks/useTypewriter.js";

const PHASE = {
    BLACK: "black",
    TYPE: "type",
    HOLD: "hold",
    STACK: "stack",
    TITLE: "title",
    DONE: "done",
};

const INTRO_SEEN_KEY = "projectThreeIntroSeen";
const TYPE_SPEED = 72;
const BLACK_MS = 1200;
const HOLD_AFTER_TYPE_MS = 3000;
const PHOTO_INTERVAL_MS = 1000;
const AFTER_LAST_PHOTO_MS = 3000;
const TITLE_HOLD_MS = 2200;
const FAILSAFE_MS = 45000;

export function hasSeenProjectThreeIntro() {
    return localStorage.getItem(INTRO_SEEN_KEY) === "1";
}

export function markProjectThreeIntroSeen() {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
}

export default function ProjectThreeIntro({ onDone }) {
    const shouldPlayRef = useRef(!hasSeenProjectThreeIntro());
    const finishedRef = useRef(!shouldPlayRef.current);
    const [phase, setPhase] = useState(() =>
        shouldPlayRef.current ? PHASE.BLACK : PHASE.DONE,
    );
    const [visiblePhotos, setVisiblePhotos] = useState(0);

    const { displayed, done: typeDone } = useTypewriter(
        projectThreeIntroText,
        phase === PHASE.TYPE,
        TYPE_SPEED,
    );

    const finish = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        markProjectThreeIntroSeen();
        setPhase(PHASE.DONE);
        onDone?.();
    }, [onDone]);

    useEffect(() => {
        if (!shouldPlayRef.current) {
            onDone?.();
            return undefined;
        }

        const typeMs = projectThreeIntroText.length * TYPE_SPEED;
        const holdAt = BLACK_MS + typeMs;
        const stackAt = holdAt + HOLD_AFTER_TYPE_MS;
        const photoCount = projectThreeOccupationPhotos.length;
        const titleAt = stackAt + photoCount * PHOTO_INTERVAL_MS + AFTER_LAST_PHOTO_MS;
        const doneAt = titleAt + TITLE_HOLD_MS;

        const toType = window.setTimeout(() => {
            setPhase((c) => (c === PHASE.DONE ? c : PHASE.TYPE));
        }, BLACK_MS);

        const toHold = window.setTimeout(() => {
            setPhase((c) => (c === PHASE.DONE ? c : PHASE.HOLD));
        }, holdAt);

        const toStack = window.setTimeout(() => {
            setPhase((c) => (c === PHASE.DONE ? c : PHASE.STACK));
        }, stackAt);

        const photoTimers = projectThreeOccupationPhotos.map((_, index) =>
            window.setTimeout(
                () => setVisiblePhotos(index + 1),
                stackAt + (index + 1) * PHOTO_INTERVAL_MS,
            ),
        );

        const toTitle = window.setTimeout(() => {
            setPhase((c) => (c === PHASE.DONE ? c : PHASE.TITLE));
        }, titleAt);

        const toDone = window.setTimeout(finish, doneAt);
        const failsafe = window.setTimeout(finish, FAILSAFE_MS);

        const onHashChange = () => finish();
        window.addEventListener("hashchange", onHashChange);

        return () => {
            window.clearTimeout(toType);
            window.clearTimeout(toHold);
            window.clearTimeout(toStack);
            window.clearTimeout(toTitle);
            window.clearTimeout(toDone);
            window.clearTimeout(failsafe);
            photoTimers.forEach((id) => window.clearTimeout(id));
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [finish, onDone]);

    useEffect(() => {
        if (phase !== PHASE.DONE) {
            document.body.dataset.projectThreeIntro = "true";
        } else {
            delete document.body.dataset.projectThreeIntro;
        }
        return () => delete document.body.dataset.projectThreeIntro;
    }, [phase]);

    if (phase === PHASE.DONE || typeof document === "undefined") {
        return null;
    }

    const showType = phase === PHASE.BLACK || phase === PHASE.TYPE || phase === PHASE.HOLD;
    const showStack = phase === PHASE.STACK || phase === PHASE.TITLE;
    const showTitle = phase === PHASE.TITLE;

    return createPortal(
        <div
            className={`project-three-intro project-three-intro--${phase}`}
            role="dialog"
            aria-modal="true"
            aria-label="项目3入场"
        >
            {showType && (
                <div className="project-three-intro-type-wrap">
                    <div className="project-three-ripple" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </div>
                    <p className="project-three-intro-type">
                        {phase === PHASE.HOLD || typeDone
                            ? projectThreeIntroText
                            : displayed}
                    </p>
                </div>
            )}

            {showStack && (
                <div className="project-three-photo-stack" aria-hidden="true">
                    {projectThreeOccupationPhotos
                        .slice(0, visiblePhotos)
                        .map((src, index) => (
                            <img
                                key={src}
                                className="project-three-photo-card"
                                src={`${import.meta.env.BASE_URL}${src}`}
                                alt=""
                                style={{
                                    "--stack-i": index,
                                    zIndex: index + 1,
                                }}
                            />
                        ))}
                </div>
            )}

            {showTitle && (
                <p className="project-three-intro-title">{projectThreeTitleCue}</p>
            )}
        </div>,
        document.body,
    );
}
