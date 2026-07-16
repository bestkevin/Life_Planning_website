export const projectTwoIntroText = "仅仅了解你自己是不够的……看看这个吧";

export const SDS_TEST_URL = "https://minke8.cn/gd7.html";

export const projectTwoResultCue = "有结果了吗？来看看自己的倾向吧。";

export const hollandSidebarSections = [
    {
        id: "what",
        title: "什么是霍兰德职业兴趣",
        content:
            "霍兰德职业兴趣理论由美国心理学家约翰·霍兰德提出，认为人的兴趣可以概括为六种类型：现实型（R）、研究型（I）、艺术型（A）、社会型（S）、企业型（E）、常规型（C）。兴趣类型与职业环境越匹配，越容易获得满足感与持久投入。",
    },
    {
        id: "hexagon",
        title: "六边形模型怎么用",
        content:
            "六种类型按相邻关系排布成六边形：相邻类型较一致，对角类型张力更大。测试结果通常给出 1–3 个字母代码（如 RIA），用来描述你的兴趣组合，并作为探索职业方向的线索。",
    },
    {
        id: "sds",
        title: "关于 SDS 测试",
        content:
            "Self-Directed Search（自我导向探索）是霍兰德理论的经典测评工具。右侧可完整体验免费 SDS 测试；得到代码后，可向下滚动到组合探索器，进一步解读一致性、张力与推荐方向。",
    },
    {
        id: "tip",
        title: "如何阅读你的结果",
        content:
            "兴趣代码不是标签，也不是命运。它更像一张地图：帮你看见偏好、能量来源，以及可能适合长期投入的活动方式。结合探索器里的组合分析，比只盯着单一字母更有用。",
    },
];

/** Order around the hexagon: I → A → S → E → C → R (clockwise from top). */
export const HOLLAND_TYPE_ORDER = ["I", "A", "S", "E", "C", "R"];

export const hollandTypes = {
    R: {
        code: "R",
        name: "现实型",
        en: "Realistic",
        short: "动手、工具、实物世界",
        summary:
            "喜欢具体、可操作的事务，偏好使用工具、机械或身体技能解决实际问题，不太热衷于长时间的抽象空谈。",
        traits: ["务实稳重", "动手能力强", "偏好具体任务", "重视结果可见"],
        likes: ["机械操作", "户外与实地工作", "制作与修理", "技术实操"],
        careers: ["工程师", "技师", "农业/园艺", "运动与体能相关职业"],
    },
    I: {
        code: "I",
        name: "研究型",
        en: "Investigative",
        short: "观察、分析、求真",
        summary:
            "对规律与原理充满好奇，喜欢用逻辑、实验与数据分析理解世界，倾向独立思考与深度钻研。",
        traits: ["理性好奇", "善于分析", "喜欢探索未知", "重视证据与逻辑"],
        likes: ["科学研究", "数学与数据", "阅读与推演", "解决复杂问题"],
        careers: ["研究员", "数据分析师", "医生/科研人员", "系统分析相关职业"],
    },
    A: {
        code: "A",
        name: "艺术型",
        en: "Artistic",
        short: "表达、审美、创意自由",
        summary:
            "重视自我表达与美学体验，偏好开放、少束缚的环境，善于用文字、图像、声音或表演传递感受。",
        traits: ["富有想象力", "敏感细腻", "追求独特表达", "抗拒过度规训"],
        likes: ["创作与设计", "表演与写作", "艺术鉴赏", "非结构化探索"],
        careers: ["设计师", "作家/内容创作者", "音乐家/演员", "艺术教育相关职业"],
    },
    S: {
        code: "S",
        name: "社会型",
        en: "Social",
        short: "助人、沟通、共情",
        summary:
            "乐于与人相处、倾听与支持他人成长，在合作、教导、服务与关怀中获得能量与意义感。",
        traits: ["善于共情", "乐于助人", "重视人际联结", "擅长沟通引导"],
        likes: ["教学与辅导", "咨询与陪伴", "团队协作", "公益与社区服务"],
        careers: ["教师/辅导员", "社工/心理咨询", "医护照护", "人力资源与培训"],
    },
    E: {
        code: "E",
        name: "企业型",
        en: "Enterprising",
        short: "影响、组织、推进落地",
        summary:
            "富有说服力与行动能量，喜欢主导项目、整合资源、推动目标达成，对机会与结果导向敏感。",
        traits: ["主动进取", "善于说服", "目标导向", "乐于承担影响"],
        likes: ["领导与组织", "销售与谈判", "创业与项目推进", "公开表达"],
        careers: ["管理者", "创业者", "市场/商务拓展", "政策倡导与公关"],
    },
    C: {
        code: "C",
        name: "常规型",
        en: "Conventional",
        short: "秩序、精确、流程",
        summary:
            "偏好清晰规则与结构化环境，擅长整理信息、执行流程与把控细节，追求准确、稳定与可预期。",
        traits: ["细致可靠", "注重秩序", "擅长执行", "重视规范与安全"],
        likes: ["数据整理", "流程管理", "文书与系统维护", "合规与审计"],
        careers: ["会计/审计", "行政与运营", "数据治理", "信息与合规管理"],
    },
};

export const riasecCodeNames = {
    R: "现实型 (Realistic)",
    I: "研究型 (Investigative)",
    A: "艺术型 (Artistic)",
    S: "社会型 (Social)",
    E: "企业型 (Enterprising)",
    C: "常规型 (Conventional)",
};

export const riasecCoordinates = {
    I: { x: 200, y: 80 },
    A: { x: 304, y: 140 },
    S: { x: 304, y: 260 },
    E: { x: 200, y: 320 },
    C: { x: 96, y: 260 },
    R: { x: 96, y: 140 },
};

export const riasecCodeSequence = ["I", "A", "S", "E", "C", "R"];
