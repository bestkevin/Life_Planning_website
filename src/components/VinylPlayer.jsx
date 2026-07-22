import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TRACKS = [
    {
        id: "beautiful-dream",
        title: "Beautiful Dream",
        src: "audio/mixkit-beautiful-dream-493.mp3",
    },
    {
        id: "romantic-vacation",
        title: "Romantic Vacation",
        src: "audio/mixkit-romantic-vacation-89.mp3",
    },
    {
        id: "smooth-like-jazz",
        title: "Smooth Like Jazz",
        src: "audio/mixkit-smooth-like-jazz-24.mp3",
    },
    {
        id: "winter-wind",
        title: "Winter Wind",
        src: "audio/mixkit-winter-wind-502.mp3",
    },
];

const ARM_REST = -32;
const ARM_PLAY = 26;

function resolveAudioSrc(relativePath) {
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}${relativePath}`;
}

export default function VinylPlayer() {
    const audioRef = useRef(null);
    const deckRef = useRef(null);
    const draggingRef = useRef(false);
    const [armOn, setArmOn] = useState(false);
    const [armAngle, setArmAngle] = useState(ARM_REST);
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const track = TRACKS[trackIndex];
    const trackSrc = useMemo(() => resolveAudioSrc(track.src), [track.src]);

    const placeArm = useCallback((on) => {
        setArmOn(on);
        setArmAngle(on ? ARM_PLAY : ARM_REST);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;

        const onEnded = () => {
            setTrackIndex((current) => (current + 1) % TRACKS.length);
        };

        audio.addEventListener("ended", onEnded);
        return () => audio.removeEventListener("ended", onEnded);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;

        let cancelled = false;
        audio.src = trackSrc;
        audio.load();

        if (armOn) {
            audio
                .play()
                .then(() => {
                    if (!cancelled) setIsPlaying(true);
                })
                .catch(() => {
                    if (!cancelled) {
                        setIsPlaying(false);
                        placeArm(false);
                    }
                });
        } else {
            audio.pause();
            setIsPlaying(false);
        }

        return () => {
            cancelled = true;
        };
    }, [trackSrc, armOn, placeArm]);

    const angleFromPointer = (clientX, clientY) => {
        const deck = deckRef.current;
        if (!deck) return ARM_REST;
        const rect = deck.getBoundingClientRect();
        const pivotX = rect.left + rect.width * 0.78;
        const pivotY = rect.top + rect.height * 0.18;
        const dx = clientX - pivotX;
        const dy = clientY - pivotY;
        const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Map pointer angle into a usable tonearm range.
        const mapped = raw - 55;
        return Math.max(ARM_REST - 6, Math.min(ARM_PLAY + 8, mapped));
    };

    const onArmPointerDown = (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        draggingRef.current = true;
        setArmAngle(angleFromPointer(event.clientX, event.clientY));
    };

    const onArmPointerMove = (event) => {
        if (!draggingRef.current) return;
        setArmAngle(angleFromPointer(event.clientX, event.clientY));
    };

    const finishArmGesture = (event) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        const next = angleFromPointer(event.clientX, event.clientY);
        const shouldPlay = next >= (ARM_REST + ARM_PLAY) / 2;
        placeArm(shouldPlay);
    };

    const toggleByClick = () => {
        placeArm(!armOn);
    };

    return (
        <aside className="vinyl-player" aria-label="黑胶音乐播放器">
            <audio ref={audioRef} preload="metadata" playsInline />

            <div className="vinyl-player-deck" ref={deckRef}>
                <button
                    type="button"
                    className={`vinyl-disc ${isPlaying ? "is-spinning" : ""}`}
                    aria-label={armOn ? "抬起唱臂停止播放" : "放下唱臂开始播放"}
                    onClick={toggleByClick}
                >
                    <span className="vinyl-disc-grooves" aria-hidden="true" />
                    <span className="vinyl-disc-label">
                        <span className="vinyl-disc-title">{track.title}</span>
                    </span>
                    <span className="vinyl-disc-hub" aria-hidden="true" />
                </button>

                <div
                    className={`vinyl-arm ${armOn ? "is-on" : "is-off"}`}
                    style={{ transform: `rotate(${armAngle}deg)` }}
                    onPointerDown={onArmPointerDown}
                    onPointerMove={onArmPointerMove}
                    onPointerUp={finishArmGesture}
                    onPointerCancel={finishArmGesture}
                    role="slider"
                    aria-valuemin={ARM_REST}
                    aria-valuemax={ARM_PLAY}
                    aria-valuenow={Math.round(armAngle)}
                    aria-label="唱臂：拖到唱片上开始播放，移开则停止"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleByClick();
                        }
                    }}
                >
                    <span className="vinyl-arm-pivot" aria-hidden="true" />
                    <span className="vinyl-arm-shaft" aria-hidden="true" />
                    <span className="vinyl-arm-head" aria-hidden="true" />
                </div>
            </div>
        </aside>
    );
}
