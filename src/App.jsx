import { useEffect, useRef, useState } from "react";
import { LiquidGlass } from "@ybouane/liquidglass";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Home,
    Sparkles,
    Sprout,
    Target,
} from "lucide-react";
import { navigation, projects } from "../script";

const icons = { Home, Sprout, BookOpen, Sparkles };

const liquidGlassDefaults = {
    blurAmount: 0.12,
    refraction: 0.86,
    chromAberration: 0.045,
    edgeHighlight: 0.16,
    specular: 0.12,
    fresnel: 0.68,
    distortion: 0.012,
    cornerRadius: 28,
    zRadius: 20,
    opacity: 0.5,
    saturation: -0.12,
    brightness: -0.26,
    shadowOpacity: 0.48,
    shadowSpread: 20,
    shadowOffsetY: 10,
};

function getPageFromHash() {
    const hash = window.location.hash || "#home";
    const matchedPage = navigation.find((item) => item.href === hash);

    return matchedPage ? matchedPage.href.slice(1) : "home";
}

function App() {
    const mainRef = useRef(null);
    const [expandedProject, setExpandedProject] = useState(null);
    const [activePage, setActivePage] = useState(getPageFromHash);

    useEffect(() => {
        const handleHashChange = () => {
            setActivePage(getPageFromHash());
            setExpandedProject(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    useEffect(() => {
        const root = mainRef.current;
        if (!root || !window.WebGLRenderingContext) return;

        let instance;
        let cancelled = false;

        const initializeGlass = async () => {
            try {
                await document.fonts?.ready;
                const glassElements = root.querySelectorAll(
                    ":scope > .liquid-glass-panel",
                );
                const nextInstance = await LiquidGlass.init({
                    root,
                    glassElements,
                    defaults: liquidGlassDefaults,
                });

                if (cancelled) {
                    nextInstance.destroy();
                } else {
                    instance = nextInstance;
                    root.dataset.liquidReady = "true";
                }
            } catch (error) {
                delete root.dataset.liquidReady;
                console.warn("LiquidGlass initialization failed; using CSS fallback.", error);
            }
        };

        const animationFrame = window.requestAnimationFrame(initializeGlass);

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(animationFrame);
            instance?.destroy();
            delete root.dataset.liquidReady;
        };
    }, [activePage]);

    return (
        <>
            <header>
                <nav aria-label="主导航">
                    {navigation.map((item) => {
                        const Icon = icons[item.icon];

                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 ${
                                    activePage === item.href.slice(1)
                                        ? "nav-link-active"
                                        : ""
                                }`}
                                aria-current={
                                    activePage === item.href.slice(1) ? "page" : undefined
                                }
                            >
                                <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>
            </header>

            <main ref={mainRef} className="liquid-root">
                <div className="liquid-scene" aria-hidden="true" />

                {activePage === "home" && <section id="home" className="liquid-glass-panel page-enter">
                    <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[#b89659]/30 bg-[#2d2018]/55 px-4 py-2 text-sm tracking-[0.16em] text-[#d5b77d] shadow-sm backdrop-blur">
                        <Sparkles aria-hidden="true" size={16} />
                        向理想生活缓缓生长
                    </div>
                    <h1>人生规划</h1>
                    <p>
                        在从容的节奏中看见方向，把珍视的愿景化为今日可以完成的小事。
                    </p>
                    <a
                        className="button mx-auto mt-8 w-fit"
                        href="#project-1"
                    >
                        查看我的计划
                        <ArrowRight aria-hidden="true" size={18} />
                    </a>
                </section>}

                {projects.filter((project) => project.id === activePage).map((project) => {
                    const Icon = icons[project.icon];
                    const isExpanded = expandedProject === project.id;

                    return (
                        <section
                            id={project.id}
                            key={project.id}
                            className="liquid-glass-panel page-enter"
                        >
                            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
                                <div>
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3a291d]/70 text-[#d5b77d] shadow-inner">
                                        <Icon aria-hidden="true" size={24} strokeWidth={1.6} />
                                    </div>
                                    <p className="mb-2 text-xs font-semibold tracking-[0.22em] !text-[#c8a86b]">
                                        {project.eyebrow}
                                    </p>
                                    <h2>{project.title}</h2>
                                    <p>{project.description}</p>
                                </div>

                                <div className="rounded-2xl border border-[#b89659]/25 bg-[#2d2018]/45 px-5 py-4 text-center backdrop-blur">
                                    <span className="block text-3xl font-semibold text-[#d5b77d]">
                                        {project.progress}%
                                    </span>
                                    <span className="text-xs tracking-wider text-[#c6bbab]">
                                        当前进度
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 h-2 overflow-hidden rounded-full bg-[#2a231d]/80">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#765622] to-[#c29b57]"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>

                            <button
                                className="mt-7"
                                type="button"
                                aria-expanded={isExpanded}
                                onClick={() =>
                                    setExpandedProject(isExpanded ? null : project.id)
                                }
                            >
                                {isExpanded ? "收起阶段计划" : "查看阶段计划"}
                                <ArrowRight
                                    aria-hidden="true"
                                    size={17}
                                    className={`transition-transform ${
                                        isExpanded ? "rotate-90" : ""
                                    }`}
                                />
                            </button>

                            {isExpanded && (
                                <div className="display-box mt-6 !rounded-2xl !p-5">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            aria-hidden="true"
                                            className="mt-1 shrink-0 text-[#c8a86b]"
                                            size={20}
                                        />
                                        <p>
                                            本阶段专注于建立稳定节奏：每周完成一次行动复盘，
                                            并为下一周选择一个最重要的目标。
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    );
                })}

                {activePage === "summary" && <section id="summary" className="liquid-glass-panel page-enter">
                    <div className="mb-6 flex items-center gap-3">
                        <Target aria-hidden="true" className="text-[#c8a86b]" size={28} />
                        <p className="text-xs font-semibold tracking-[0.22em] !text-[#c8a86b]">
                            REFLECTION
                        </p>
                    </div>
                    <h2>总结与展望</h2>
                    <p>
                        规划并非追赶时间，而是在变化中持续校准方向。记录已完成的每一步，
                        也为新的可能保留空间。
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="interactive-box !rounded-2xl !p-5">
                            <CalendarDays
                                aria-hidden="true"
                                className="mb-3 text-[#c8a86b]"
                                size={22}
                            />
                            <h3 className="mb-1 font-semibold text-[#f1eadf]">定期回顾</h3>
                            <p className="text-sm">每月整理进展，温和地调整下一阶段。</p>
                        </div>
                        <div className="interactive-box !rounded-2xl !p-5">
                            <Sparkles
                                aria-hidden="true"
                                className="mb-3 text-[#c8a86b]"
                                size={22}
                            />
                            <h3 className="mb-1 font-semibold text-[#f1eadf]">庆祝成长</h3>
                            <p className="text-sm">珍视过程，让细小的进步也被认真看见。</p>
                        </div>
                    </div>
                </section>}
            </main>

            <footer>
                <p>© 2026 人生规划 · 制作人：LYU</p>
            </footer>
        </>
    );
}

export default App;
