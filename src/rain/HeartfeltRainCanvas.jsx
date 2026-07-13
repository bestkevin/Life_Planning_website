import { useEffect, useRef } from "react";
import cafeBg from "../../cafe1.jpg";
import { createHeartfeltRain } from "./heartfeltRain.js";

export default function HeartfeltRainCanvas({ onReady, onFrame }) {
    const canvasRef = useRef(null);
    const onReadyRef = useRef(onReady);
    const onFrameRef = useRef(onFrame);

    onReadyRef.current = onReady;
    onFrameRef.current = onFrame;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let rain;
        let cancelled = false;

        const start = async () => {
            try {
                rain = createHeartfeltRain(canvas, cafeBg, {
                    onFrame: (target) => onFrameRef.current?.(target),
                });
                await rain.ready;
                if (!cancelled) {
                    onReadyRef.current?.(true);
                }
            } catch (error) {
                console.warn("Heartfelt rain shader failed; using CSS background.", error);
                if (!cancelled) {
                    onReadyRef.current?.(false);
                }
            }
        };

        start();

        return () => {
            cancelled = true;
            rain?.destroy();
            onReadyRef.current?.(false);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="heartfelt-rain-layer"
            data-dynamic=""
            aria-hidden="true"
        />
    );
}
