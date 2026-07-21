import { ArrowLeft, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    interviewToolkitIntro,
    projectThreeActivityLead,
    projectThreeBubbleLines,
    projectThreeCafeImage,
    projectThreeShareLead,
    projectThreeSuitableCriteria,
    projectThreeUsefulSites,
} from "../data/project3Content.js";
import { projectThreeVideos } from "../data/project3Videos.js";
import InterviewToolkit from "./InterviewToolkit.jsx";
import ProjectThreeIntro, {
    hasSeenProjectThreeIntro,
} from "./ProjectThreeIntro.jsx";

function useTypeOnView(text, active, speed = 56) {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
        if (!active) {
            setDisplayed("");
            return undefined;
        }
        setDisplayed("");
        let i = 0;
        const timer = window.setInterval(() => {
            i += 1;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) window.clearInterval(timer);
        }, speed);
        return () => window.clearInterval(timer);
    }, [text, active, speed]);
    return displayed;
}

export default function ProjectThreePage({ interviewMode = false }) {
    const [introDone, setIntroDone] = useState(() => hasSeenProjectThreeIntro());
    const [showSuitableModal, setShowSuitableModal] = useState(false);
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [activityInView, setActivityInView] = useState(false);
    const cafeRef = useRef(null);
    const activityRef = useRef(null);

    const activityTitle = useTypeOnView(
        "Activity：访谈活动策划",
        introDone && activityInView && !interviewMode,
        64,
    );

    const handleIntroDone = useCallback(() => setIntroDone(true), []);

    useEffect(() => {
        if (!introDone || interviewMode) return undefined;
        const cafeNode = cafeRef.current;
        const activityNode = activityRef.current;
        if (!cafeNode || !activityNode) return undefined;

        const cafeObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setBubbleVisible(true);
            },
            { threshold: 0.35 },
        );
        const activityObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setActivityInView(true);
            },
            { threshold: 0.4 },
        );

        cafeObserver.observe(cafeNode);
        activityObserver.observe(activityNode);
        return () => {
            cafeObserver.disconnect();
            activityObserver.disconnect();
        };
    }, [introDone, interviewMode]);

    if (interviewMode) {
        return (
            <div className="project-three-page project-three-page--interview">
                <a href="#project-3" className="project-three-back" aria-label="返回项目3">
                    <ArrowLeft size={20} aria-hidden="true" />
                    <span>返回项目3</span>
                </a>
                <p className="project-three-interview-intro">{interviewToolkitIntro}</p>
                <InterviewToolkit />
            </div>
        );
    }

    return (
        <div className="project-three-page">
            <ProjectThreeIntro onDone={handleIntroDone} />

            {introDone && (
                <>
                    <section className="project-three-share" aria-labelledby="p3-share-title">
                        <div className="project-three-share-main">
                            <h2 id="p3-share-title">职业信息分享</h2>
                            <div className="project-three-video-panel">
                                <div className="project-three-video-grid">
                                    {projectThreeVideos.map((video) => (
                                        <a
                                            key={video.bv}
                                            className="project-three-video-card"
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={video.title}
                                        >
                                            <img
                                                src={`${import.meta.env.BASE_URL}${video.cover}`}
                                                alt={video.title}
                                                loading="lazy"
                                            />
                                            <span className="project-three-video-meta">
                                                @{video.author} · bilibili
                                            </span>
                                        </a>
                                    ))}
                                </div>
                                <p className="project-three-ellipsis" aria-hidden="true">
                                    ···
                                </p>
                            </div>
                            <p className="project-three-share-lead">{projectThreeShareLead}</p>
                        </div>

                        <aside className="project-three-sites">
                            <h3>这里有一些可能有用的网站</h3>
                            <ul>
                                {projectThreeUsefulSites.map((site) => (
                                    <li key={site.url}>
                                        <a
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {site.name}
                                        </a>
                                        <span>{site.note}</span>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </section>

                    <section
                        className="project-three-activity"
                        ref={activityRef}
                        aria-labelledby="p3-activity-title"
                    >
                        <h2 id="p3-activity-title" className="project-three-activity-title">
                            {activityTitle}
                        </h2>
                        <p className="project-three-activity-lead">{projectThreeActivityLead}</p>

                        <div className="project-three-cafe-scene" ref={cafeRef}>
                            <img
                                className="project-three-cafe-img"
                                src={`${import.meta.env.BASE_URL}${projectThreeCafeImage}`}
                                alt="咖啡馆场景"
                            />
                            <div className="project-three-steam" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                            {bubbleVisible && (
                                <div className="project-three-bubble">
                                    {projectThreeBubbleLines.map((line) => (
                                        <p key={line}>{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="project-three-cafe-links">
                            <button
                                type="button"
                                onClick={() => setShowSuitableModal(true)}
                            >
                                什么是「合适的对象」？
                            </button>
                            <a href="#project-3-interview">如何进行访谈</a>
                        </div>
                    </section>
                </>
            )}

            {showSuitableModal && (
                <div
                    className="project-three-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="p3-suitable-title"
                    onClick={() => setShowSuitableModal(false)}
                >
                    <div
                        className="project-three-modal-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="project-three-modal-close"
                            aria-label="关闭"
                            onClick={() => setShowSuitableModal(false)}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                        <h3 id="p3-suitable-title">什么是「合适的对象」？</h3>
                        <p className="project-three-modal-lead">
                            筛选访谈对象时，可以参考以下标准：
                        </p>
                        <ul className="project-three-criteria">
                            {projectThreeSuitableCriteria.map((item) => (
                                <li key={item.title}>
                                    <strong>{item.title}</strong>
                                    <span>{item.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
