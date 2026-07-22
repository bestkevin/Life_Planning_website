import { useMemo, useState } from "react";

const PRESETS = [
    {
        label: "高中教师",
        job: "高中学科教师",
        industry: "基础教育",
        interviewee: "张老师 / 高中语文教师",
    },
    {
        label: "临床医生",
        job: "住院医师 / 专科医生",
        industry: "医疗卫生",
        interviewee: "李医生 / 内科主治医师",
    },
    {
        label: "软件工程师",
        job: "软件开发工程师",
        industry: "互联网与信息技术",
        interviewee: "王工 / 后端开发工程师",
    },
    {
        label: "结构工程师",
        job: "建筑结构工程师",
        industry: "建筑设计与土木",
        interviewee: "赵工 / 结构设计工程师",
    },
    {
        label: "材料科研",
        job: "材料科学研究员",
        industry: "高等院校 / 科研院所",
        interviewee: "陈博士 / 材料科学课题组",
    },
    {
        label: "生物医学科研",
        job: "生物医学科研工作者",
        industry: "生命科学与医药研发",
        interviewee: "刘研究员 / 实验室课题骨干",
    },
    {
        label: "产品经理",
        job: "互联网产品经理",
        industry: "互联网产品",
        interviewee: "周经理 / 产品负责人",
    },
    {
        label: "心理咨询师",
        job: "心理咨询师",
        industry: "心理健康服务",
        interviewee: "吴老师 / 注册心理咨询师",
    },
];

const INITIAL_QUESTIONS = {
    growth: [
        {
            id: "g1",
            text: "您最初是如何进入这个职业领域的？背后有什么特殊的契机吗？",
            checked: true,
        },
        {
            id: "g2",
            text: "如果重回校园，您在专业选择或者技能储备上会做出哪些改变？",
            checked: true,
        },
        {
            id: "g3",
            text: "您认为自己在这个岗位上做得优秀，得益于哪些性格特质或软技能？",
            checked: false,
        },
    ],
    daily: [
        {
            id: "d1",
            text: "一个典型的“工作日”，您的日常工作时间是如何分配的？",
            checked: true,
        },
        {
            id: "d2",
            text: "在日常工作中，您最喜欢、最享受的部分是什么？最抓狂的又是什么？",
            checked: true,
        },
        {
            id: "d3",
            text: "这个岗位的加班情况或差旅频次如何？您如何平衡个人生活？",
            checked: false,
        },
    ],
    skills: [
        {
            id: "s1",
            text: "要做好这个岗位，最不可或缺的三项硬技能分别是什么？",
            checked: true,
        },
        {
            id: "s2",
            text: "对于现在的在校学生，想要积累该方向的经验，有哪些推荐的书籍或项目？",
            checked: true,
        },
        {
            id: "s3",
            text: "该行业对学历背景或特定证书有哪些隐形要求吗？",
            checked: false,
        },
    ],
    challenge: [
        {
            id: "c1",
            text: "当前AI等新技术的发展，对您日常的工作模式产生了哪些影响？",
            checked: true,
        },
        {
            id: "c2",
            text: "该行业或岗位未来的供需前景如何？适合怎样心理预期的学生加入？",
            checked: true,
        },
        {
            id: "c3",
            text: "如果给今天想进入该领域的年轻人一句话建议，您会说什么？",
            checked: false,
        },
    ],
};

const TABS = [
    { key: "growth", label: "个人背景与契机" },
    { key: "daily", label: "典型工作日内容" },
    { key: "skills", label: "关键技能与准备" },
    { key: "challenge", label: "挑战与前景" },
];

const STEP_LABELS = ["目标筹备", "定制提问", "访谈笔记", "报告生成"];

export default function InterviewToolkit() {
    const [step, setStep] = useState(1);
    const [qTab, setQTab] = useState("growth");
    const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
    const [notes, setNotes] = useState({});
    const [customQuestion, setCustomQuestion] = useState("");
    const [toast, setToast] = useState("");
    const [form, setForm] = useState({
        job: "",
        industry: "",
        interviewee: "",
        channel: "",
        reflectionCognitive: "",
        reflectionAction: "",
    });

    const showToast = (msg) => {
        setToast(msg);
        window.setTimeout(() => setToast(""), 3200);
    };

    const checkedQuestions = useMemo(() => {
        const list = [];
        Object.values(questions).forEach((group) => {
            group.filter((q) => q.checked).forEach((q) => list.push(q));
        });
        return list;
    }, [questions]);

    const report = useMemo(() => {
        const job = form.job.trim() || "未设定目标职业";
        const industry = form.industry.trim() || "未设定行业";
        const name = form.interviewee.trim() || "未设定访谈人物";
        const channel = form.channel.trim() || "未设定联络渠道";
        let text = `生涯人物访谈与职业调查报告

一、基本情况
- 目标职业：${job}
- 行业领域：${industry}
- 访谈对象：${name}
- 联络渠道：${channel}
- 生成日期：${new Date().toLocaleDateString("zh-CN")}

二、访谈核心记录
`;
        if (checkedQuestions.length === 0) {
            text += "\n（你还未在第二步勾选任何核心问题。请返回第二步选择定制）\n";
        } else {
            checkedQuestions.forEach((q) => {
                const ans = notes[q.id]?.trim() || "未在笔记中录入回答记录";
                text += `\n问题：${q.text}\n回答记录：${ans}\n`;
            });
        }
        text += `
三、深度自我反思

认知重塑
${form.reflectionCognitive.trim() || "暂无深度认知反思..."}

微行动实践指南（下周突破口）
${form.reflectionAction.trim() || "暂无下周微行动计划..."}

本报告由「生涯人物访谈与职业调查行动工具包」自动生成。`;
        return text;
    }, [checkedQuestions, form, notes]);

    const toggleQuestion = (tabKey, id) => {
        setQuestions((prev) => ({
            ...prev,
            [tabKey]: prev[tabKey].map((q) =>
                q.id === id ? { ...q, checked: !q.checked } : q,
            ),
        }));
    };

    const addCustomQuestion = () => {
        const text = customQuestion.trim();
        if (!text) return;
        setQuestions((prev) => ({
            ...prev,
            [qTab]: [
                ...prev[qTab],
                { id: `custom-${Date.now()}`, text, checked: true },
            ],
        }));
        setCustomQuestion("");
        showToast("成功添加自定义问题！");
    };

    const applyPreset = (preset) => {
        setForm((prev) => ({
            ...prev,
            job: preset.job,
            industry: preset.industry,
            interviewee: preset.interviewee,
            channel: "模拟联络渠道 / 师长推荐",
        }));
        showToast("已载入 1 组典型跨界探索预设！");
    };

    const copyReport = async () => {
        try {
            await navigator.clipboard.writeText(report);
            showToast("报告已复制，可直接粘贴使用。");
        } catch {
            showToast("复制失败，请手动选中报告文本。");
        }
    };

    return (
        <div className="interview-toolkit">
            <header className="interview-toolkit-header">
                <p className="interview-toolkit-eyebrow">实践探究工具</p>
                <h2>职业访谈与调查活动</h2>
                <p className="interview-toolkit-lead interview-copy-box">
                    如果对如何组织一场访谈并获得自己想要的信息感到棘手，你可以试着跟随这个小工具的指引设定并执行你的访谈计划，一步步填充其中的内容，最终完成这个活动。相信你会有别样的收获。
                </p>
            </header>

            <div className="interview-steps">
                {STEP_LABELS.map((label, index) => {
                    const n = index + 1;
                    const state = n === step ? "active" : n < step ? "done" : "";
                    return (
                        <button
                            key={label}
                            type="button"
                            className={`interview-step-btn ${state}`}
                            onClick={() => setStep(n)}
                        >
                            <span>{n}</span>
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="interview-panel">
                {step === 1 && (
                    <section>
                        <h3>第一步：选定目标与访谈人物</h3>
                        <div className="interview-form-grid">
                            {[
                                ["job", "想要调查的目标职业", "例如：AI教育研究员"],
                                ["industry", "所属行业或领域", "例如：人工智能与教育"],
                                ["interviewee", "拟访谈对象（姓名/代称）", "例如：张老师"],
                                ["channel", "联络方式/渠道", "例如：学长引荐"],
                            ].map(([key, label, placeholder]) => (
                                <label key={key} className="interview-field">
                                    <span>{label}</span>
                                    <input
                                        value={form[key]}
                                        placeholder={placeholder}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="interview-presets">
                            <p>常用跨界职业预设（快速开始）</p>
                            <div className="interview-preset-row">
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => applyPreset(preset)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section>
                        <h3>第二步：生成/精选提问清单</h3>
                        <p className="interview-help">
                            推荐 4 大核心方向的经典问题。点击卡片可移出/加入清单。
                        </p>
                        <div className="interview-tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={qTab === tab.key ? "is-active" : ""}
                                    onClick={() => setQTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="interview-q-pool">
                            {questions[qTab].map((q) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    className={`interview-q-card ${q.checked ? "is-checked" : ""}`}
                                    onClick={() => toggleQuestion(qTab, q.id)}
                                >
                                    <span>{q.checked ? "✓" : "○"}</span>
                                    {q.text}
                                </button>
                            ))}
                        </div>
                        <div className="interview-custom-q">
                            <input
                                value={customQuestion}
                                onChange={(e) => setCustomQuestion(e.target.value)}
                                placeholder="添加自定义问题…"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomQuestion();
                                    }
                                }}
                            />
                            <button type="button" onClick={addCustomQuestion}>
                                添加
                            </button>
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section>
                        <h3>第三步：访谈现场实录与笔记</h3>
                        {checkedQuestions.length === 0 ? (
                            <p className="interview-help">
                                你还没有在第二步选择任何问题。请返回第二步添加后记录。
                            </p>
                        ) : (
                            <div className="interview-notes">
                                {checkedQuestions.map((q) => (
                                    <label key={q.id} className="interview-field">
                                        <span>{q.text}</span>
                                        <textarea
                                            rows={3}
                                            value={notes[q.id] || ""}
                                            placeholder="点击此处录入访谈对象的回答记录…"
                                            onChange={(e) =>
                                                setNotes((prev) => ({
                                                    ...prev,
                                                    [q.id]: e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {step === 4 && (
                    <section>
                        <h3>第四步：生成生涯调查报告与自我反思</h3>
                        <p className="interview-help">
                            恭喜你完成了访谈！请填写下面两个核心反思问题，工具包会合并输出报告：
                        </p>
                        <label className="interview-field">
                            <span>
                                反思一：这次访谈是否颠覆了你对这个职业的既往认知？有哪些关键点超出了预料？
                            </span>
                            <textarea
                                rows={3}
                                value={form.reflectionCognitive}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        reflectionCognitive: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <label className="interview-field">
                            <span>
                                反思二：为了向该职业靠拢，你目前可以做出的最小、最可行的尝试（微行动）是什么？
                            </span>
                            <textarea
                                rows={3}
                                value={form.reflectionAction}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        reflectionAction: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <div className="interview-report">
                            <div className="interview-report-head">
                                <h4>报告预览</h4>
                                <button type="button" onClick={copyReport}>
                                    复制完整报告内容
                                </button>
                            </div>
                            <pre>{report}</pre>
                        </div>
                    </section>
                )}
            </div>

            <div className="interview-nav">
                <button
                    type="button"
                    className={step === 1 ? "is-invisible" : ""}
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                    上一步
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (step < 4) setStep((s) => s + 1);
                        else showToast("报告已生成，可滚动下方区域查看并复制。");
                    }}
                >
                    {step === 4 ? "完成并预览" : "下一步"}
                </button>
            </div>

            {toast && (
                <div className="interview-toast" role="status">
                    {toast}
                </div>
            )}
        </div>
    );
}
