import { useMemo, useState } from "react";
import {
    riasecCodeNames,
    riasecCodeSequence,
    riasecCoordinates,
} from "../data/hollandContent.js";
import { careerDatabase } from "../data/riasecCareerDatabase.js";
import {
    analyzeConsistency,
    buildTextReport,
    findCareerMatch,
} from "../data/riasecFallbacks.js";

const SELECT_COLORS = ["#c29b57", "#7d9b6a", "#b07848"];

const CODE_OPTIONS = [
    { value: "", label: "未选择" },
    { value: "R", label: "R · 现实型" },
    { value: "I", label: "I · 研究型" },
    { value: "A", label: "A · 艺术型" },
    { value: "S", label: "S · 社会型" },
    { value: "E", label: "E · 企业型" },
    { value: "C", label: "C · 常规型" },
];

export default function RiasecExplorer() {
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        window.setTimeout(() => setToast(""), 3200);
    };

    const selectVertex = (code) => {
        setSelectedCodes((prev) => {
            const index = prev.indexOf(code);
            if (index > -1) {
                const next = prev.filter((c) => c !== code);
                showToast(`已移除 ${riasecCodeNames[code].split(" ")[0]} 代码。`);
                return next;
            }
            const next = prev.length >= 3 ? [...prev.slice(1), code] : [...prev, code];
            showToast(
                `已添加 ${riasecCodeNames[code].split(" ")[0]} 作为第 ${next.length} 核心代码。`,
            );
            return next;
        });
    };

    const syncFromDropdown = (slot, value) => {
        setSelectedCodes((prev) => {
            const next = [...prev];
            while (next.length < 3) next.push("");
            next[slot] = value;
            const cleaned = [];
            next.forEach((code) => {
                if (code && !cleaned.includes(code)) cleaned.push(code);
            });
            return cleaned.slice(0, 3);
        });
    };

    const resetAll = () => {
        setSelectedCodes([]);
        showToast("已成功清空所有选择状态。");
    };

    const consistency = useMemo(
        () => analyzeConsistency(selectedCodes, riasecCodeSequence),
        [selectedCodes],
    );

    const { matchedData, matchType, codeStr } = useMemo(
        () => findCareerMatch(selectedCodes, careerDatabase),
        [selectedCodes],
    );

    const report = useMemo(
        () =>
            buildTextReport({
                selectedCodes,
                codeNames: riasecCodeNames,
                codeSequence: riasecCodeSequence,
                matchedData,
                matchType,
            }),
        [selectedCodes, matchedData, matchType],
    );

    const polygonPoints =
        selectedCodes.length >= 2
            ? selectedCodes
                  .map((code) => {
                      const coord = riasecCoordinates[code];
                      return `${coord.x},${coord.y}`;
                  })
                  .join(" ")
            : "";

    const copyReport = async () => {
        try {
            await navigator.clipboard.writeText(report);
            showToast("生涯定位卡已复制为文本，可直接粘贴使用。");
        } catch {
            showToast("复制失败，请手动选中报告文本。");
        }
    };

    return (
        <div className="riasec-explorer-wrap">
            <header className="riasec-explorer-titlebar">
                <div className="riasec-explorer-titlebar-text">
                    <p className="riasec-explorer-eyebrow">专业生涯规划辅助工具</p>
                    <h2 id="riasec-explorer-title">霍兰德职业兴趣（RIASEC）组合探索器</h2>
                </div>
                <button type="button" className="riasec-reset" onClick={resetAll}>
                    重置探索器
                </button>
            </header>

            <section
                className="riasec-explorer"
                aria-labelledby="riasec-explorer-title"
            >
            <div className="riasec-explorer-grid">
                <div className="riasec-panel">
                    <div className="riasec-panel-head">
                        <h3>1. 交互式霍兰德六角模型</h3>
                        <span>点击顶点或在下方直接选择</span>
                    </div>

                    <div className="riasec-svg-wrap">
                        <svg
                            width="340"
                            height="340"
                            viewBox="0 0 400 400"
                            className="riasec-svg"
                            aria-label="可点击的霍兰德六角模型"
                        >
                            <polygon
                                points="200,80 304,140 304,260 200,320 96,260 96,140"
                                fill="none"
                                stroke="rgba(190, 151, 91, 0.35)"
                                strokeWidth="1.5"
                            />
                            <polygon
                                points="200,120 269,160 269,240 200,280 131,240 131,160"
                                fill="none"
                                stroke="rgba(190, 151, 91, 0.2)"
                                strokeWidth="1"
                            />
                            <polygon
                                points="200,160 235,180 235,220 200,240 165,220 165,180"
                                fill="none"
                                stroke="rgba(190, 151, 91, 0.12)"
                                strokeWidth="1"
                            />
                            <line
                                x1="200"
                                y1="80"
                                x2="200"
                                y2="320"
                                stroke="rgba(190, 151, 91, 0.18)"
                                strokeDasharray="3,3"
                            />
                            <line
                                x1="304"
                                y1="140"
                                x2="96"
                                y2="260"
                                stroke="rgba(190, 151, 91, 0.18)"
                                strokeDasharray="3,3"
                            />
                            <line
                                x1="304"
                                y1="260"
                                x2="96"
                                y2="140"
                                stroke="rgba(190, 151, 91, 0.18)"
                                strokeDasharray="3,3"
                            />
                            <polygon
                                points={polygonPoints}
                                fill="rgba(194, 155, 87, 0.12)"
                                stroke="rgba(194, 155, 87, 0.55)"
                                strokeWidth="2"
                            />

                            {riasecCodeSequence.map((code) => {
                                const { x, y } = riasecCoordinates[code];
                                const selectedIndex = selectedCodes.indexOf(code);
                                const active = selectedIndex > -1;
                                const fill = active
                                    ? SELECT_COLORS[selectedIndex]
                                    : "rgba(30, 22, 14, 0.85)";
                                const stroke = active
                                    ? SELECT_COLORS[selectedIndex]
                                    : "rgba(190, 151, 91, 0.55)";
                                const labelPos = {
                                    R: { x: 65, y: 144, anchor: "end" },
                                    I: { x: 200, y: 55, anchor: "middle" },
                                    A: { x: 335, y: 144, anchor: "start" },
                                    S: { x: 335, y: 264, anchor: "start" },
                                    E: { x: 200, y: 352, anchor: "middle" },
                                    C: { x: 65, y: 264, anchor: "end" },
                                }[code];

                                return (
                                    <g
                                        key={code}
                                        className="riasec-vertex"
                                        onClick={() => selectVertex(code)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`选择 ${riasecCodeNames[code]}`}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                selectVertex(code);
                                            }
                                        }}
                                    >
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={active ? 18 : 16}
                                            fill={fill}
                                            stroke={stroke}
                                            strokeWidth={active ? 4 : 2}
                                        />
                                        <text
                                            x={x}
                                            y={y + 5}
                                            textAnchor="middle"
                                            className="riasec-vertex-letter"
                                            fill={active ? "#1a140c" : "#e8d6b4"}
                                        >
                                            {active ? selectedIndex + 1 : code}
                                        </text>
                                        <text
                                            x={labelPos.x}
                                            y={labelPos.y}
                                            textAnchor={labelPos.anchor}
                                            className="riasec-vertex-name"
                                        >
                                            {riasecCodeNames[code].split(" ")[0]} {code}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div className="riasec-selects">
                        {[0, 1, 2].map((slot) => (
                            <label key={slot} className="riasec-select-field">
                                <span>第 {slot + 1} 代码</span>
                                <select
                                    value={selectedCodes[slot] || ""}
                                    onChange={(event) =>
                                        syncFromDropdown(slot, event.target.value)
                                    }
                                >
                                    {CODE_OPTIONS.map((option) => (
                                        <option key={option.value || "empty"} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>

                    <div className="riasec-consistency">
                        <h4>特质一致性 / 张力分析</h4>
                        <p className={`riasec-consistency-title is-${consistency.level}`}>
                            {consistency.title}
                        </p>
                        <p>{consistency.desc}</p>
                        {consistency.showConflictTip && (
                            <div className="riasec-conflict-tip">
                                <strong>指导贴士：</strong>
                                别逼他们二选一。对角冲突型人才往往可通过跨界岗位升华，例如 C+A →
                                UI/UX；I+E → 科技商业合规；R+S → 智慧社区与农业推广。
                            </div>
                        )}
                    </div>
                </div>

                <div className="riasec-panel riasec-panel--result">
                    <div className="riasec-panel-head">
                        <h3>2. 智能生涯推荐</h3>
                        <span className="riasec-code-badge">{codeStr || "---"}</span>
                    </div>
                    <p className="riasec-match-type">{matchType}</p>
                    <h4 className="riasec-profile-title">
                        {matchedData?.title ?? "推荐职业方向"}
                    </h4>

                    {!matchedData || selectedCodes.length === 0 ? (
                        <p className="riasec-empty">
                            请在左侧选取职业兴趣，我们将在这里实时呈现最适合的跨界职业、核心优势与实践微行动。
                        </p>
                    ) : (
                        <div className="riasec-match-body">
                            <p>{matchedData.desc}</p>
                            <div className="riasec-jobs">
                                {matchedData.jobs.map((job) => (
                                    <div key={job.name} className="riasec-job">
                                        <span>{job.name}</span>
                                        {job.match && <code>{job.match}</code>}
                                    </div>
                                ))}
                            </div>
                            <div className="riasec-why">
                                <strong>为什么匹配这个组合？</strong>
                                <p>{matchedData.why}</p>
                            </div>
                            <div className="riasec-meta-grid">
                                <div>
                                    <strong>重点攻坚硬核技能</strong>
                                    <p>{matchedData.skills}</p>
                                </div>
                                <div>
                                    <strong>建议下周「微行动」</strong>
                                    <p>
                                        {matchedData.action ||
                                            "尝试查阅或走访该行业的任何一篇文章、一位学长，迈出第一步。"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="riasec-report">
                        <div className="riasec-report-head">
                            <h4>生涯定位卡（TXT）</h4>
                            <button type="button" onClick={copyReport}>
                                一键复制
                            </button>
                        </div>
                        <pre className="riasec-report-view">{report}</pre>
                    </div>
                </div>
            </div>

            </section>

            {toast && (
                <div className="riasec-toast" role="status">
                    {toast}
                </div>
            )}
        </div>
    );
}
