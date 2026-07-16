/** Single-code fallback profiles used when no 2/3-code match exists. */
export function getFallbackSingleCodeData(code) {
    switch (code) {
        case "R":
            return {
                title: "物理工匠与实干家路线",
                desc: "适合不喜欢抽象空谈，追求双手改变物理环境、创造实在器物的实干型同学。",
                jobs: [{ name: "智能制造装调工" }, { name: "新能源电池技术工程师" }],
                why: "现实型(R)核心驱动对工具、精密机械和物理媒介的操作直觉。在数字时代，他们是虚拟技术落地的现实保障。",
                skills: "三维数字测绘、材料力学工艺、硬件焊接、传感器电路调试。",
            };
        case "I":
            return {
                title: "逻辑重构与前沿探索路线",
                desc: "适合对未知的逻辑规律充满好奇，热衷于发现事物运行底层机制的同学。",
                jobs: [{ name: "应用基础学科研究员" }, { name: "系统性数据挖掘工程师" }],
                why: "研究型(I)的核心是理性和逻辑求真，最能让他们兴奋的是复杂问题在数理模型或系统机制下的完美拆解。",
                skills: "数理统计推断、研究方法学(R/Python)、逻辑回归建模、学术情报检索。",
            };
        case "A":
            return {
                title: "自由媒介创作与情感共振",
                desc: "适合无法忍受千篇一律、崇尚自由美学，并拥有极强精神表达冲动的同学。",
                jobs: [{ name: "新媒体独立内容创作者" }, { name: "多媒体场景视觉交互师" }],
                why: "艺术型(A)生来抗拒过度结构化的框架。他们需要充沛的想象力土壤和非线性的探索空间来向世界传递其内心感知。",
                skills: "创意叙事框架、视听剪辑处理、图形交互软件应用、潮流审美洞察。",
            };
        case "S":
            return {
                title: "社会契约、助人成长与共情整合",
                desc: "适合那些觉得『帮助他人成长、解答他人痛苦』才富有最大生命意义的同学。",
                jobs: [{ name: "课程体验开发与引导专家" }, { name: "组织协作/生涯发展导师" }],
                why: "社会型(S)是典型的倾听者和赋能者。他们最大的天赋不在于面对冷冰冰的代码，而是在与真实的、有情绪的人合作中爆发。",
                skills: "深度共情与倾听术、协作会议引导(Facilitation)、PBL项目开发方法。",
            };
        case "E":
            return {
                title: "愿景传播、说服与商业价值兑现",
                desc: "适合极富能量，渴望通过个人影响力组织并调动资源、推进项目盈利与落地的人。",
                jobs: [{ name: "创新项目商业路演主干" }, { name: "新媒体私域增长官" }],
                why: "企业型(E)往往能凭借敏锐的商业嗅觉和对资源的超强整合能力说服他人，将好点子变成产生巨大实际现金流或社会效应的大组织。",
                skills: "项目路演演讲、敏锐的财务成本直觉、团队动员能力、销售心理机制。",
            };
        case "C":
            return {
                title: "精益流程规划、风控与数据治理",
                desc: "适合喜欢一切尽在掌控之中、有条不紊。擅长从庞杂和无序中构建逻辑秩序的同学。",
                jobs: [{ name: "数字安全合规与审计师" }, { name: "高维流程精益分析官" }],
                why: "常规型(C)具有最高级别的细致度和流程敬畏。在数字化泛滥的失序时代，他们是确保一切在安全红线内有规有序高效运转的卫士。",
                skills: "复杂流程图构建、Excel极客应用、合规风险指标建模、法务监管制度阅读。",
            };
        default:
            return {
                title: "继续探索你的兴趣组合",
                desc: "请选择至少一个霍兰德代码以查看推荐方向。",
                jobs: [],
                why: "",
                skills: "",
            };
    }
}

export function analyzeConsistency(selectedCodes, codeSequence) {
    if (selectedCodes.length < 2) {
        return {
            level: "none",
            title: "等待更多代码",
            desc: "请至少选定前两个核心代码以判定一致性特征。",
            showConflictTip: false,
        };
    }

    const first = selectedCodes[0];
    const second = selectedCodes[1];
    const idx1 = codeSequence.indexOf(first);
    const idx2 = codeSequence.indexOf(second);
    const diff = Math.min(Math.abs(idx1 - idx2), 6 - Math.abs(idx1 - idx2));

    if (diff === 1) {
        return {
            level: "high",
            title: "高度一致（相邻特质）",
            desc: `主导代码 ${first} 与辅助代码 ${second} 在六角形模型中相邻。兴趣聚焦度较高，行为风格比较连贯稳定，容易在垂直领域找到对齐的工作场景。`,
            showConflictTip: false,
        };
    }

    if (diff === 2) {
        return {
            level: "mid",
            title: "中度一致（相隔特质）",
            desc: `主导代码 ${first} 与辅助代码 ${second} 在六角形模型中相隔一个维度。既保持一定一致性，又多出一层跨界张力，常能胜任需要多维协调的综合岗位。`,
            showConflictTip: false,
        };
    }

    return {
        level: "tension",
        title: "存在高层级心理张力（对角对立特质）",
        desc: `主导代码 ${first} 与辅助代码 ${second} 位于六角模型的正对角线两侧（例如 R和S，I和E，A和C）。体内并存着两股看似冲突的底层力量。`,
        showConflictTip: true,
    };
}

export function findCareerMatch(selectedCodes, careerDatabase) {
    if (selectedCodes.length === 0) {
        return { matchedData: null, matchType: "智能生涯推荐", codeStr: "" };
    }

    const currentCodeStr = selectedCodes.join("");
    let matchedData = null;
    let matchType = "";

    if (selectedCodes.length === 3) {
        const permutations = [
            currentCodeStr,
            `${selectedCodes[0]}${selectedCodes[2]}${selectedCodes[1]}`,
            `${selectedCodes[1]}${selectedCodes[0]}${selectedCodes[2]}`,
            `${selectedCodes[1]}${selectedCodes[2]}${selectedCodes[0]}`,
            `${selectedCodes[2]}${selectedCodes[0]}${selectedCodes[1]}`,
            `${selectedCodes[2]}${selectedCodes[1]}${selectedCodes[0]}`,
        ];
        for (const p of permutations) {
            if (careerDatabase[p]) {
                matchedData = careerDatabase[p];
                matchType = "完美匹配 3 码方案";
                break;
            }
        }
    }

    if (!matchedData && selectedCodes.length >= 2) {
        const combination1 = `${selectedCodes[0]}_${selectedCodes[1]}`;
        const combination2 = `${selectedCodes[1]}_${selectedCodes[0]}`;
        if (careerDatabase[combination1]) {
            matchedData = careerDatabase[combination1];
            matchType = "核心两码匹配组合";
        } else if (careerDatabase[combination2]) {
            matchedData = careerDatabase[combination2];
            matchType = "核心两码匹配组合";
        }
    }

    if (!matchedData) {
        matchedData = getFallbackSingleCodeData(selectedCodes[0]);
        matchType = "首发核心代码指引";
    }

    return { matchedData, matchType, codeStr: currentCodeStr };
}

export function buildTextReport({
    selectedCodes,
    codeNames,
    codeSequence,
    matchedData,
    matchType,
}) {
    if (selectedCodes.length === 0) {
        return [
            "暂未生成生涯定位卡",
            "",
            "请在互动六边形中选择你的霍兰德职业兴趣核心代码。",
        ].join("\n");
    }

    const codeStr = selectedCodes.join("");
    const typeNames = selectedCodes.map((c) => codeNames[c].split(" ")[0]).join(" + ");
    const lines = [
        "霍兰德职业兴趣生涯定位卡",
        "",
        "一、核心霍兰德特质",
        `当前生涯定位代码：${codeStr}`,
        `特质核心组合：${typeNames}`,
        `判定日期：${new Date().toLocaleDateString("zh-CN")}`,
        "",
        "二、特质关系解读",
    ];

    if (selectedCodes.length >= 2) {
        const analysis = analyzeConsistency(selectedCodes, codeSequence);
        lines.push(`${analysis.title}：${analysis.desc}`);
    } else {
        lines.push(
            "目前仅解锁第一主导代码，建议继续探索，锁定前两项特质关联，以获得更完整的一致性分析。",
        );
    }

    lines.push(
        "",
        "三、推荐生涯蓝图探索",
        `建议方向：${matchedData?.title ?? "—"}（${matchType}）`,
    );

    if (matchedData?.desc) {
        lines.push("", `方向描述：${matchedData.desc}`);
    }

    if (matchedData?.jobs?.length) {
        lines.push("", "重点推荐典型岗位：");
        matchedData.jobs.forEach((job) => {
            lines.push(`- ${job.name}`);
        });
    }

    if (matchedData?.why) {
        lines.push("", "匹配原因分析：", matchedData.why);
    }

    lines.push(
        "",
        "本报告由「霍兰德职业兴趣 (RIASEC) 组合探索器」自动导出。",
    );

    return lines.join("\n");
}
