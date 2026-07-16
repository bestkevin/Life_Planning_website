import { ChevronDown, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
    hollandSidebarSections,
    hollandTypes,
    projectTwoResultCue,
    SDS_TEST_URL,
} from "../data/hollandContent.js";
import HollandHexagon from "./HollandHexagon.jsx";
import ProjectTwoIntro, { hasSeenProjectTwoIntro } from "./ProjectTwoIntro.jsx";
import RiasecExplorer from "./RiasecExplorer.jsx";

function CollapsiblePanel({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="project-two-collapse">
            <button
                type="button"
                className="project-two-collapse-trigger"
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
            {open && <div className="project-two-collapse-body">{children}</div>}
        </div>
    );
}

export default function ProjectTwoPage() {
    const [introDone, setIntroDone] = useState(() => hasSeenProjectTwoIntro());
    const [activeType, setActiveType] = useState(null);

    const handleIntroDone = useCallback(() => {
        setIntroDone(true);
    }, []);

    const type = activeType ? hollandTypes[activeType] : null;

    return (
        <div className="project-two-page">
            <ProjectTwoIntro onDone={handleIntroDone} />

            {introDone && (
                <div className="project-two-layout">
                    <aside className="project-two-sidebar">
                        <div className="project-two-hex-float">
                            <HollandHexagon
                                size={200}
                                onSelect={(code) => setActiveType(code)}
                            />
                            <p className="project-two-hex-hint">点击扇区查看类型介绍</p>
                        </div>

                        <p className="project-two-sidebar-title">霍兰德职业兴趣</p>
                        <p className="project-two-sidebar-subtitle">RIASEC · 认识兴趣与方向</p>

                        {hollandSidebarSections.map((section) => (
                            <CollapsiblePanel key={section.id} title={section.title}>
                                <p>{section.content}</p>
                            </CollapsiblePanel>
                        ))}
                    </aside>

                    <div className="project-two-main">
                        <section className="project-two-sds" aria-labelledby="project-two-sds-title">
                            <h2 id="project-two-sds-title">霍兰德职业兴趣测试（SDS）</h2>
                            <p className="project-two-sds-lead">
                                在下方完成免费 SDS 测试，获得你的兴趣代码后再继续向下探索。
                            </p>
                            <div className="project-two-sds-frame">
                                <iframe
                                    src={SDS_TEST_URL}
                                    title="霍兰德职业兴趣测试(SDS)免费-职业测试"
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="clipboard-write; encrypted-media; fullscreen"
                                    allowFullScreen
                                />
                            </div>
                            <p className="project-two-sds-fallback">
                                若嵌入窗口无法加载或互动，可
                                <a href={SDS_TEST_URL} target="_blank" rel="noopener noreferrer">
                                    在新标签页打开 SDS 测试
                                </a>
                                。
                            </p>
                        </section>

                        <p className="project-two-result-cue">{projectTwoResultCue}</p>

                        <RiasecExplorer />
                    </div>
                </div>
            )}

            {type && (
                <div
                    className="project-two-type-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="project-two-type-title"
                    onClick={() => setActiveType(null)}
                >
                    <div
                        className="project-two-type-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="project-two-type-close"
                            aria-label="关闭类型介绍"
                            onClick={() => setActiveType(null)}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                        <p className="project-two-type-code">
                            {type.code} · {type.en}
                        </p>
                        <h3 id="project-two-type-title">
                            {type.name}
                            <span>{type.short}</span>
                        </h3>
                        <p className="project-two-type-summary">{type.summary}</p>
                        <div className="project-two-type-grid">
                            <div>
                                <strong>典型特质</strong>
                                <ul>
                                    {type.traits.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <strong>常感兴趣的活动</strong>
                                <ul>
                                    {type.likes.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <strong>相关职业方向</strong>
                                <ul>
                                    {type.careers.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
