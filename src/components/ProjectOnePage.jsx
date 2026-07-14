import { ChevronDown, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const INTRO_SEEN_KEY = "projectOneIntroSeen";
const CHAT_STATE_KEY = "projectOneChatState";

function loadChatState() {
    try {
        const raw = localStorage.getItem(CHAT_STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        return {
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            questionIndex:
                typeof parsed.questionIndex === "number" ? parsed.questionIndex : -1,
            chatStarted: Boolean(parsed.chatStarted),
            awaitingAnswer: Boolean(parsed.awaitingAnswer),
            inputValue: typeof parsed.inputValue === "string" ? parsed.inputValue : "",
            inputHint: typeof parsed.inputHint === "string" ? parsed.inputHint : "",
            openingDone: Boolean(parsed.openingDone),
        };
    } catch {
        return null;
    }
}

function saveChatState(state) {
    try {
        localStorage.setItem(CHAT_STATE_KEY, JSON.stringify(state));
    } catch {
        // Ignore quota / private-mode failures.
    }
}

function hasSeenIntro() {
    return localStorage.getItem(INTRO_SEEN_KEY) === "1";
}

function markIntroSeen() {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
}

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
    const savedChat = loadChatState();
    const introAlreadySeen = hasSeenIntro();

    const [phase, setPhase] = useState(() =>
        introAlreadySeen ? PHASE.READY : PHASE.BLACK,
    );
    const [messages, setMessages] = useState(() => savedChat?.messages ?? []);
    const [questionIndex, setQuestionIndex] = useState(
        () => savedChat?.questionIndex ?? -1,
    );
    const [chatStarted, setChatStarted] = useState(() => savedChat?.chatStarted ?? false);
    const [awaitingAnswer, setAwaitingAnswer] = useState(
        () => savedChat?.awaitingAnswer ?? false,
    );
    const [inputValue, setInputValue] = useState(() => savedChat?.inputValue ?? "");
    const [inputHint, setInputHint] = useState(() => {
        if (savedChat?.inputHint) return savedChat.inputHint;
        if (savedChat?.openingDone && !savedChat?.chatStarted) return projectOneInputHint;
        return "";
    });
    const [openingDone, setOpeningDone] = useState(
        () => Boolean(savedChat?.openingDone || (savedChat?.messages?.length ?? 0) > 0),
    );
    const dialogRef = useRef(null);
    const inputRef = useRef(null);

    const playIntro = phase === PHASE.BLACK || phase === PHASE.RIPPLE;
    const typeOpening = phase === PHASE.READY && !openingDone;

    const { displayed: introDisplayed, done: introDone } = useTypewriter(
        projectOneIntroText,
        phase === PHASE.RIPPLE,
        58,
    );

    const { displayed: openingDisplayed, done: openingTypedDone } = useTypewriter(
        projectOneOpeningLine,
        typeOpening,
        52,
    );

    useEffect(() => {
        if (hasSeenIntro() || phase !== PHASE.BLACK) return undefined;

        const blackTimer = window.setTimeout(() => setPhase(PHASE.RIPPLE), 1200);
        return () => window.clearTimeout(blackTimer);
    }, [phase]);

    useEffect(() => {
        if (playIntro) {
            document.body.dataset.projectOneIntro = "true";
        } else {
            delete document.body.dataset.projectOneIntro;
        }
        return () => delete document.body.dataset.projectOneIntro;
    }, [playIntro]);

    useEffect(() => {
        if (!introDone || phase !== PHASE.RIPPLE) return undefined;

        const readyTimer = window.setTimeout(() => {
            markIntroSeen();
            setPhase(PHASE.READY);
        }, 3000);

        return () => window.clearTimeout(readyTimer);
    }, [introDone, phase]);

    useEffect(() => {
        if (openingTypedDone && !openingDone) {
            setOpeningDone(true);
            if (!chatStarted) {
                setInputHint(projectOneInputHint);
            }
        }
    }, [openingTypedDone, openingDone, chatStarted]);

    useEffect(() => {
        if (!dialogRef.current) return;
        dialogRef.current.scrollTop = dialogRef.current.scrollHeight;
    }, [messages, openingDisplayed, questionIndex, openingDone]);

    useEffect(() => {
        saveChatState({
            messages,
            questionIndex,
            chatStarted,
            awaitingAnswer,
            inputValue,
            inputHint,
            openingDone,
        });
    }, [
        messages,
        questionIndex,
        chatStarted,
        awaitingAnswer,
        inputValue,
        inputHint,
        openingDone,
    ]);

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
            setAwaitingAnswer(true);
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

    const showOpeningLine = openingDone || Boolean(openingDisplayed);

    return (
        <div className="project-one-page">
            {playIntro &&
                createPortal(
                    <div
                        className={`project-one-intro project-one-intro--${phase}`}
                        aria-hidden="true"
                    >
                        {phase === PHASE.RIPPLE && (
                            <>
                                <div className="project-one-ripple">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <p className="project-one-ripple-text">{introDisplayed}</p>
                            </>
                        )}
                    </div>,
                    document.body,
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
                                {showOpeningLine && (
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
