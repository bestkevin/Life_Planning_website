import { ChevronDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    PADLET_EMBED_URL,
    projectOneInputHint,
    projectOneIntroText,
    projectOneOpeningLine,
    projectOnePhotoWallText,
    proustAnswerComparison,
    proustIntroSections,
} from "../data/proustContent.js";
import { proustQuestions } from "../data/proustQuestions.js";
import { useTypewriter } from "../hooks/useTypewriter.js";

const PHASE = {
    BLACK: "black",
    RIPPLE: "ripple",
    READY: "ready",
};

function CollapsiblePanel({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="project-one-collapse">
            <button
                type="button"
                className="project-one-collapse-trigger"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span>{title}</span>
                <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className={open ? "rotate-180" : ""}
                />
            </button>
            {open && <div className="project-one-collapse-body">{children}</div>}
        </div>
    );
}

export default function ProjectOnePage() {
    const [phase, setPhase] = useState(PHASE.BLACK);
    const [messages, setMessages] = useState([]);
    const [questionIndex, setQuestionIndex] = useState(-1);
    const [chatStarted, setChatStarted] = useState(false);
    const [awaitingAnswer, setAwaitingAnswer] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputHint, setInputHint] = useState("");
    const [openingDone, setOpeningDone] = useState(false);
    const dialogRef = useRef(null);
    const inputRef = useRef(null);

    const { displayed: introDisplayed, done: introDone } = useTypewriter(
        projectOneIntroText,
        phase === PHASE.RIPPLE,
        58,
    );

    const { displayed: openingDisplayed, done: openingTypedDone } = useTypewriter(
        projectOneOpeningLine,
        phase === PHASE.READY,
        52,
    );

    useEffect(() => {
        const blackTimer = window.setTimeout(() => setPhase(PHASE.RIPPLE), 1200);
        return () => window.clearTimeout(blackTimer);
    }, []);

    useEffect(() => {
        if (!introDone || phase !== PHASE.RIPPLE) return undefined;

        const readyTimer = window.setTimeout(() => setPhase(PHASE.READY), 3000);
        return () => window.clearTimeout(readyTimer);
    }, [introDone, phase]);

    useEffect(() => {
        if (openingTypedDone && !openingDone) {
            setOpeningDone(true);
            setInputHint(projectOneInputHint);
        }
    }, [openingTypedDone, openingDone]);

    useEffect(() => {
        if (!dialogRef.current) return;
        dialogRef.current.scrollTop = dialogRef.current.scrollHeight;
    }, [messages, openingDisplayed, questionIndex]);

    const startChat = () => {
        if (chatStarted) return;
        setChatStarted(true);
        setInputHint("");
        setInputValue("");
        setQuestionIndex(0);
        setMessages([{ role: "mystery", text: `神秘人：${proustQuestions[0]}` }]);
        setAwaitingAnswer(true);
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);

        if (!chatStarted && value.length > 0) {
            startChat();
        }
    };

    const submitAnswer = () => {
        const trimmed = inputValue.trim();
        if (!chatStarted || !awaitingAnswer || !trimmed) return;

        const nextMessages = [...messages, { role: "me", text: `我：${trimmed}` }];
        const nextIndex = questionIndex + 1;

        if (nextIndex < proustQuestions.length) {
            nextMessages.push({
                role: "mystery",
                text: `神秘人：${proustQuestions[nextIndex]}`,
            });
            setMessages(nextMessages);
            setQuestionIndex(nextIndex);
            setInputValue("");
            return;
        }

        nextMessages.push({
            role: "mystery",
            text: "神秘人：谢谢你愿意分享。愿这些问题成为你认识自己、也拥抱未来自己的起点。",
        });
        setMessages(nextMessages);
        setQuestionIndex(nextIndex);
        setInputValue("");
        setAwaitingAnswer(false);
        setInputHint("问卷已完成，欢迎继续浏览下方照片墙。");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            submitAnswer();
        }
    };

    return (
        <div className="project-one-page">
            {(phase === PHASE.BLACK || phase === PHASE.RIPPLE) && (
                <div className={`project-one-intro project-one-intro--${phase}`}>
                    {phase === PHASE.RIPPLE && (
                        <>
                            <div className="project-one-ripple" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>
                            <p className="project-one-ripple-text">{introDisplayed}</p>
                        </>
                    )}
                </div>
            )}

            {phase === PHASE.READY && (
                <div className="project-one-layout">
                    <aside className="project-one-sidebar liquid-glass-panel">
                        <div className="project-one-portrait" aria-hidden="true">
                            <span>MP</span>
                        </div>
                        <p className="project-one-sidebar-title">普鲁斯特问卷</p>
                        <p className="project-one-sidebar-subtitle">你是谁？</p>

                        {proustIntroSections.map((section) => (
                            <CollapsiblePanel key={section.id} title={section.title}>
                                <p>{section.content}</p>
                            </CollapsiblePanel>
                        ))}

                        <CollapsiblePanel title="普鲁斯特的回答（对比参考）">
                            <ul className="project-one-compare-list">
                                {proustAnswerComparison.map((item) => (
                                    <li key={item.question}>
                                        <strong>{item.question}</strong>
                                        <span>{item.answer}</span>
                                    </li>
                                ))}
                            </ul>
                        </CollapsiblePanel>
                    </aside>

                    <section className="project-one-dialog-wrap">
                        <div className="project-one-dialog liquid-glass-panel">
                            <div className="project-one-dialog-scroll" ref={dialogRef}>
                                {(openingDisplayed || openingDone) && (
                                    <p className="project-one-message project-one-message--mystery">
                                        {openingDone ? projectOneOpeningLine : openingDisplayed}
                                    </p>
                                )}
                                {messages.map((message, index) => (
                                    <p
                                        key={`${message.role}-${index}`}
                                        className={`project-one-message project-one-message--${message.role}`}
                                    >
                                        {message.text}
                                    </p>
                                ))}
                            </div>

                            <form
                                className="project-one-input-row"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    submitAnswer();
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={inputHint || "在此输入你的回答"}
                                    aria-label="对话输入框"
                                    disabled={!openingDone || (!awaitingAnswer && chatStarted)}
                                />
                                <button
                                    type="submit"
                                    aria-label="发送回答"
                                    disabled={
                                        !openingDone ||
                                        !inputValue.trim() ||
                                        (!awaitingAnswer && chatStarted)
                                    }
                                >
                                    <Send aria-hidden="true" size={18} />
                                </button>
                            </form>
                        </div>

                        <section className="project-one-photo-wall">
                            <p className="project-one-photo-wall-text">
                                {projectOnePhotoWallText}
                            </p>
                            <div className="project-one-padlet">
                                <iframe
                                    src={PADLET_EMBED_URL}
                                    title="普鲁斯特问卷照片墙"
                                    loading="lazy"
                                    allow="camera; microphone; clipboard-write; fullscreen"
                                    allowFullScreen
                                />
                            </div>
                        </section>
                    </section>
                </div>
            )}
        </div>
    );
}
