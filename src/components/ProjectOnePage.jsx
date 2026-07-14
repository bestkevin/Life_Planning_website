import { ChevronDown, Send, Undo2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    PADLET_BOARD_URL,
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

const INTRO_TYPE_SPEED = 116;
const INTRO_BLACK_MS = 2000;
const INTRO_HOLD_MS = 5000;
const INTRO_FAILSAFE_MS = 24000;
const OPENING_TYPE_SPEED = 104;
const QUESTION_TYPE_SPEED = 104;
const SPEAKER_HOLD_MS = 320;
const MYSTERY_SPEAKER = "友人A：";
const CLOSING_LINE =
    "谢谢你愿意分享。愿这些问题成为你认识自己、也拥抱未来自己的起点。";

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
    // Lock once per mount: never re-read localStorage mid-intro (avoids black-screen race).
    const shouldPlayIntroRef = useRef(!hasSeenIntro());
    const introFinishedRef = useRef(!shouldPlayIntroRef.current);

    const [phase, setPhase] = useState(() =>
        shouldPlayIntroRef.current ? PHASE.BLACK : PHASE.READY,
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
    const [typingBody, setTypingBody] = useState(null);
    const [speakerVisible, setSpeakerVisible] = useState(false);
    const [typedQuestion, setTypedQuestion] = useState("");
    const dialogRef = useRef(null);
    const inputRef = useRef(null);
    const typingDoneHandlerRef = useRef(null);
    const isTypingQuestion = typingBody !== null;

    const playIntro = phase === PHASE.BLACK || phase === PHASE.RIPPLE;
    const typeOpening = phase === PHASE.READY && !openingDone;

    const { displayed: introDisplayed } = useTypewriter(
        projectOneIntroText,
        phase === PHASE.RIPPLE,
        INTRO_TYPE_SPEED,
    );

    const { displayed: openingDisplayed, done: openingTypedDone } = useTypewriter(
        projectOneOpeningLine,
        typeOpening,
        OPENING_TYPE_SPEED,
    );

    const finishIntro = useCallback(() => {
        if (introFinishedRef.current) return;
        introFinishedRef.current = true;
        markIntroSeen();
        setPhase(PHASE.READY);
    }, []);

    // Fixed timeline — do not gate on localStorage or typewriter completion.
    useEffect(() => {
        if (!shouldPlayIntroRef.current) return undefined;

        const typeMs = projectOneIntroText.length * INTRO_TYPE_SPEED;
        const readyAt = INTRO_BLACK_MS + typeMs + INTRO_HOLD_MS;

        const toRipple = window.setTimeout(() => {
            setPhase((current) => (current === PHASE.READY ? current : PHASE.RIPPLE));
        }, INTRO_BLACK_MS);

        const toReady = window.setTimeout(finishIntro, readyAt);
        const failsafe = window.setTimeout(finishIntro, INTRO_FAILSAFE_MS);

        const onHashChange = () => finishIntro();
        window.addEventListener("hashchange", onHashChange);

        return () => {
            window.clearTimeout(toRipple);
            window.clearTimeout(toReady);
            window.clearTimeout(failsafe);
            window.removeEventListener("hashchange", onHashChange);
        };
    }, [finishIntro]);

    useEffect(() => {
        if (playIntro) {
            document.body.dataset.projectOneIntro = "true";
        } else {
            delete document.body.dataset.projectOneIntro;
        }
        return () => delete document.body.dataset.projectOneIntro;
    }, [playIntro]);

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
    }, [
        messages,
        openingDisplayed,
        questionIndex,
        openingDone,
        speakerVisible,
        typedQuestion,
        typingBody,
    ]);

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

    const poseMysteryQuestion = useCallback((body, onComplete) => {
        typingDoneHandlerRef.current = onComplete;
        setAwaitingAnswer(false);
        setSpeakerVisible(false);
        setTypedQuestion("");
        setTypingBody(body);
    }, []);

    useEffect(() => {
        if (typingBody === null) return undefined;

        let cancelled = false;
        let intervalId = 0;
        setSpeakerVisible(true);

        const holdId = window.setTimeout(() => {
            if (cancelled) return;
            let index = 0;
            intervalId = window.setInterval(() => {
                if (cancelled) {
                    window.clearInterval(intervalId);
                    return;
                }
                index += 1;
                setTypedQuestion(typingBody.slice(0, index));
                if (index >= typingBody.length) {
                    window.clearInterval(intervalId);
                    setMessages((current) => [
                        ...current,
                        { role: "mystery", text: `${MYSTERY_SPEAKER}${typingBody}` },
                    ]);
                    setTypingBody(null);
                    setSpeakerVisible(false);
                    setTypedQuestion("");
                    const onComplete = typingDoneHandlerRef.current;
                    typingDoneHandlerRef.current = null;
                    onComplete?.();
                }
            }, QUESTION_TYPE_SPEED);
        }, SPEAKER_HOLD_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(holdId);
            window.clearInterval(intervalId);
        };
    }, [typingBody]);

    const startChat = () => {
        if (chatStarted) return;
        setChatStarted(true);
        setInputHint("");
        setInputValue("");
        setQuestionIndex(0);
        setMessages([]);
        poseMysteryQuestion(proustQuestions[0], () => setAwaitingAnswer(true));
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
        if (!chatStarted || !awaitingAnswer || isTypingQuestion || !trimmed) return;

        setMessages((current) => [...current, { role: "me", text: `我：${trimmed}` }]);
        setInputValue("");
        const nextIndex = questionIndex + 1;

        if (nextIndex < proustQuestions.length) {
            setQuestionIndex(nextIndex);
            poseMysteryQuestion(proustQuestions[nextIndex], () => setAwaitingAnswer(true));
            return;
        }

        setQuestionIndex(nextIndex);
        poseMysteryQuestion(CLOSING_LINE, () => {
            setAwaitingAnswer(false);
            setInputHint("问卷已完成，欢迎继续浏览下方照片墙。");
        });
    };

    const cancelMysteryTyping = useCallback(() => {
        typingDoneHandlerRef.current = null;
        setTypingBody(null);
        setSpeakerVisible(false);
        setTypedQuestion("");
    }, []);

    const undoLastAnswer = () => {
        const lastMeIndex = messages.findLastIndex((message) => message.role === "me");
        if (lastMeIndex < 0) return;

        const lastAnswer = messages[lastMeIndex];
        const restoredText = lastAnswer.text.startsWith("我：")
            ? lastAnswer.text.slice(2)
            : lastAnswer.text;
        const restoredQuestionIndex = messages
            .slice(0, lastMeIndex)
            .filter((message) => message.role === "me").length;

        cancelMysteryTyping();
        setMessages(messages.slice(0, lastMeIndex));
        setQuestionIndex(restoredQuestionIndex);
        setAwaitingAnswer(true);
        setInputValue(restoredText);
        setInputHint("");
        window.requestAnimationFrame(() => inputRef.current?.focus());
    };

    const canUndo = messages.some((message) => message.role === "me");

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
                    <aside className="project-one-sidebar">
                        <div className="project-one-portrait" aria-hidden="true">
                            <img
                                src={`${import.meta.env.BASE_URL}img/proust-portrait.png`}
                                alt=""
                            />
                        </div>
                        <p className="project-one-sidebar-title">普鲁斯特问卷</p>
                        <p className="project-one-sidebar-subtitle">“了解你自己”</p>

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

                    <div className="project-one-dialog-wrap">
                        <div className="project-one-dialog">
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
                                {isTypingQuestion && (
                                    <p className="project-one-message project-one-message--mystery project-one-message--typing">
                                        {speakerVisible ? MYSTERY_SPEAKER : ""}
                                        {typedQuestion}
                                    </p>
                                )}
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
                                    disabled={
                                        !openingDone ||
                                        isTypingQuestion ||
                                        (!awaitingAnswer && chatStarted)
                                    }
                                />
                                <button
                                    type="submit"
                                    aria-label="发送回答"
                                    disabled={
                                        !openingDone ||
                                        isTypingQuestion ||
                                        !inputValue.trim() ||
                                        (!awaitingAnswer && chatStarted)
                                    }
                                >
                                    <Send aria-hidden="true" size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="project-one-undo-button"
                                    aria-label="回撤上一条回答"
                                    title="回撤上一条回答"
                                    onClick={undoLastAnswer}
                                    disabled={!openingDone || !canUndo}
                                >
                                    <Undo2 aria-hidden="true" size={18} />
                                </button>
                            </form>
                        </div>

                        <div className="project-one-photo-wall">
                            <p className="project-one-photo-wall-text">
                                {projectOnePhotoWallText}
                            </p>
                            <div className="project-one-padlet">
                                <iframe
                                    src={PADLET_EMBED_URL}
                                    title="普鲁斯特问卷照片墙"
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="camera; microphone; clipboard-write; encrypted-media; display-capture; fullscreen; storage-access"
                                    allowFullScreen
                                />
                            </div>
                            <p className="project-one-padlet-fallback">
                                若嵌入墙无法互动，可
                                <a
                                    href={PADLET_BOARD_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    在新标签页打开照片墙
                                </a>
                                。
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
