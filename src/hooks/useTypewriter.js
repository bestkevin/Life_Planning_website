import { useEffect, useState } from "react";

export function useTypewriter(text, active, speed = 42) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!active) {
            setDisplayed("");
            setDone(false);
            return;
        }

        setDisplayed("");
        setDone(false);

        let index = 0;
        const timer = window.setInterval(() => {
            index += 1;
            setDisplayed(text.slice(0, index));

            if (index >= text.length) {
                window.clearInterval(timer);
                setDone(true);
            }
        }, speed);

        return () => window.clearInterval(timer);
    }, [text, active, speed]);

    return { displayed, done };
}
