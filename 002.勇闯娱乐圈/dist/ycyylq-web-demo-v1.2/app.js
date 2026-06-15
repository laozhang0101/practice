const STORAGE_KEY = "ycylq-map-prototype-v7";

const candidateArtists = [
  {
    id: "lin-xiaotang",
    name: "林小棠",
    role: "练习生 / 舞台路线",
    initial: "棠",
    color: "red",
    tags: ["天赋怪", "玻璃心", "舞台型"],
    note: "舞台爆发力强，但压力容易飙升，需要经纪人稳住节奏。",
    route: "舞台潜力突出，但也可以转向音乐、影视或商业路线，取决于玩家选择的阶段目标。",
    attrs: { vocal: 58, acting: 31, stage: 58, charm: 65, creativity: 46 },
    market: { heat: 18, fans: 12, reputation: 45 },
    mind: { stress: 20, trust: 48 },
    profile: { age: 19, background: "普通练习生", fandom: "舞台粉刚起步", capital: 18, difficulty: "资源少，容错高，适合从底层慢慢养成。" },
    personality: { sensibility: 60, ambition: 64, romance: 48, discipline: 45 }
  },
  {
    id: "jiang-che",
    name: "江澈",
    role: "糊咖演员 / 逆袭路线",
    initial: "澈",
    color: "blue",
    tags: ["事业脑", "低热度", "演技派"],
    note: "演技底子不错，但曝光很低，适合走口碑翻身。",
    route: "表演底子较好，但路线不固定，可以靠作品、综艺或音乐重新打开局面。",
    attrs: { vocal: 28, acting: 66, stage: 58, charm: 49, creativity: 44 },
    market: { heat: 10, fans: 8, reputation: 54 },
    mind: { stress: 16, trust: 55 },
    profile: { age: 28, background: "小公司糊咖", fandom: "散粉少但路人盘稳", capital: 12, difficulty: "资源贫瘠，但恋情和年龄焦虑压力较低。" },
    personality: { sensibility: 52, ambition: 70, romance: 35, discipline: 62 }
  },
  {
    id: "qiao-yiyi",
    name: "乔一一",
    role: "网红素人 / 热梗路线",
    initial: "一",
    color: "gold",
    tags: ["自带热度", "梗体质", "风险高"],
    note: "很会制造话题，能快速起势，也容易把公关部逼疯。",
    route: "自带热度和话题体质，但最终走综艺、商业、音乐或影视都由玩家兑现。",
    attrs: { vocal: 34, acting: 35, stage: 46, charm: 68, creativity: 55 },
    market: { heat: 42, fans: 28, reputation: 31 },
    mind: { stress: 24, trust: 40 },
    profile: { age: 22, background: "网红转艺人", fandom: "热梗粉多，黑粉也多", capital: 28, difficulty: "流量来得快，舆论翻车也快。" },
    personality: { sensibility: 58, ambition: 68, romance: 57, discipline: 32 }
  },
  {
    id: "wen-ran",
    name: "温然",
    role: "唱作新人 / 长线路线",
    initial: "然",
    color: "green",
    tags: ["慢热", "创作型", "口碑苗子"],
    note: "短期爆点不强，但创作潜力高，适合稳扎稳打。",
    route: "创作潜力高，但可以通过阶段目标转向唱作、影视配乐、综艺或商业合作。",
    attrs: { vocal: 54, acting: 26, stage: 50, charm: 43, creativity: 68 },
    market: { heat: 14, fans: 10, reputation: 52 },
    mind: { stress: 14, trust: 52 },
    profile: { age: 24, background: "独立音乐新人", fandom: "作品粉慢热", capital: 16, difficulty: "热度慢，但口碑沉淀稳定。" },
    personality: { sensibility: 72, ambition: 50, romance: 44, discipline: 58 }
  },
  {
    id: "yan-ruoxi",
    name: "燕若曦",
    role: "京圈公主 / 资源咖争议",
    initial: "曦",
    color: "purple",
    tags: ["资本背景", "资源充足", "路人逆反"],
    note: "天生能进很多人进不去的局，但每一步都会被审判是不是靠背景。",
    route: "资本和人脉能打开资源门，但如果作品撑不住，口碑反噬会比普通艺人更凶。",
    attrs: { vocal: 32, acting: 54, stage: 48, charm: 68, creativity: 50 },
    market: { heat: 58, fans: 35, reputation: 42 },
    mind: { stress: 28, trust: 44 },
    profile: { age: 24, background: "京圈二代，家族有人脉", fandom: "粉丝少但资源声量大", capital: 82, difficulty: "资源多，口碑难，容易被贴资源咖标签。" },
    personality: { sensibility: 55, ambition: 74, romance: 42, discipline: 50 }
  },
  {
    id: "luo-yinhe",
    name: "洛银河",
    role: "当红养成系男团成员 / 粉圈高压",
    initial: "河",
    color: "black",
    tags: ["高粉丝量", "爱豆规训", "恋情雷区"],
    note: "粉丝基础强，资源方主动靠近，但恋爱、夜归、同框都可能变成核爆热搜。",
    route: "开局站位高，商务和综艺机会多；难点是粉圈期待、私生活风险和转型焦虑。",
    attrs: { vocal: 62, acting: 38, stage: 64, charm: 78, creativity: 44 },
    market: { heat: 76, fans: 82, reputation: 55 },
    mind: { stress: 46, trust: 38 },
    profile: { age: 20, background: "头部选秀男团出身", fandom: "高黏性高战斗力粉圈", capital: 58, difficulty: "资源丰厚但规则极严，恋情与塌房风险最高。" },
    personality: { sensibility: 50, ambition: 80, romance: 66, discipline: 48 }
  }
];

const mapLocations = [
  {
    id: "office",
    name: "公司办公室",
    icon: "办",
    x: 52,
    y: 52,
    desc: "处理沟通、合约和艺人状态。",
    projects: [
      {
        id: "talk",
        name: "经纪人谈心",
        cost: 2,
        minCafe: 1,
        resourceTier: "基础维护",
        desc: "降低压力，提升信任。",
        delta: { stress: -10, trust: 8, heat: -1, sensibility: 3 },
        result: "你和艺人认真聊了一次。没有通告收益，但信任这种东西，关键时候会救命。"
      },
      {
        id: "contract-review",
        name: "路线复盘",
        cost: 2,
        minCafe: 1,
        resourceTier: "基础维护",
        desc: "稳定口碑和信任，小幅提升创作判断。",
        delta: { reputation: 2, trust: 4, creativity: 1, stress: -2, discipline: 2 },
        result: "你把近期路线掰开揉碎讲清楚，艺人对下一步没那么迷茫了。"
      }
    ]
  },
  {
    id: "training",
    name: "培训教室",
    icon: "训",
    x: 24,
    y: 34,
    desc: "基础能力成长最稳定的地方。",
    projects: [
      {
        id: "vocal-class",
        name: "声乐训练",
        cost: 3,
        minCafe: 1,
        resourceTier: "基础训练",
        desc: "提升唱功和创作手感。",
        delta: { vocal: 6, creativity: 2, stage: -1, stress: 5, trust: 1, sensibility: 1 },
        result: "声乐老师说这嗓子还能抢救，而且抢救空间很大。唱功提升。"
      },
      {
        id: "camera-class",
        name: "镜头表现课",
        cost: 3,
        minCafe: 1,
        resourceTier: "基础训练",
        desc: "提升演技、魅力和镜头稳定性。",
        delta: { acting: 5, charm: 2, stage: 1, stress: 5, trust: 1, sensibility: 2, romance: 1 },
        result: "镜头一怼，表情终于不再像被 HR 临时约谈。演技提升。"
      },
      {
        id: "physical",
        name: "体能管理",
        cost: 2,
        minCafe: 1,
        resourceTier: "基础训练",
        desc: "提升体能，降低部分压力。",
        delta: { stage: 5, stress: -3, charm: 1, discipline: 3, romance: -1 },
        result: "体能师看完训练表沉默三秒，然后决定先从活着开始。体能提升。"
      }
    ]
  },
  {
    id: "tv",
    name: "电视台",
    icon: "台",
    x: 72,
    y: 28,
    desc: "综艺曝光、临时救场和热梗发生器。",
    projects: [
      {
        id: "variety-lab",
        name: "综艺试录",
        cost: 3,
        minCafe: 2,
        resourceTier: "小透明资源",
        desc: "提升综艺感，获得热度。",
        delta: { charm: 6, heat: 5, fans: 2, stress: 5, ambition: 2 },
        result: "试录片段被剪成表情包，节目组说这人有点综艺命。"
      },
      {
        id: "meme-business",
        name: "热梗营业",
        cost: 2,
        minCafe: 1,
        resourceTier: "低门槛曝光",
        desc: "快速拉热度，但口碑有波动。",
        delta: { charm: 2, heat: 10, fans: 4, reputation: -4, stress: 5, trust: -1, ambition: 3, discipline: -1 },
        result: "热梗冲上广场。粉丝说可爱，路人说吵，数据说赢。"
      },
      {
        id: "prime-variety",
        name: "黄金档飞行嘉宾",
        cost: 5,
        minCafe: 4,
        resourceTier: "当红资源",
        desc: "头部综艺曝光，收益高，翻车也更响。",
        delta: { charm: 5, heat: 18, fans: 8, reputation: -2, stress: 10, ambition: 4 },
        result: "黄金档镜头给足了。数据很好看，但所有人都在放大每一个表情。"
      }
    ]
  },
  {
    id: "film",
    name: "影视城",
    icon: "影",
    x: 34,
    y: 72,
    desc: "试镜、剧组机会和口碑路线。",
    projects: [
      {
        id: "audition",
        name: "角色试镜",
        cost: 4,
        minCafe: 2,
        resourceTier: "小透明资源",
        desc: "争取影视机会，演技和热度都会变化。",
        delta: { acting: 4, heat: 5, fans: 2, stress: 7, reputation: 1, ambition: 2 },
        result: "试镜没有当场定角，但副导演把资料留下了。机会开始露头。"
      },
      {
        id: "script-reading",
        name: "剧本围读",
        cost: 3,
        minCafe: 1,
        resourceTier: "基础机会",
        desc: "提升演技与口碑，热度较慢。",
        delta: { acting: 6, reputation: 3, creativity: 1, stress: 4, sensibility: 4 },
        result: "围读时终于不是只会点头，角色理解变扎实了。"
      },
      {
        id: "leading-audition",
        name: "S 级项目主角局",
        cost: 6,
        minCafe: 5,
        resourceTier: "顶流资源",
        desc: "真正的塔尖机会，门槛极高。",
        delta: { acting: 7, heat: 22, fans: 10, reputation: 6, stress: 14, ambition: 5 },
        result: "S 级项目愿意开门，说明你们已经不是来凑数的人了。"
      }
    ]
  },
  {
    id: "music",
    name: "唱片公司",
    icon: "唱",
    x: 64,
    y: 76,
    desc: "歌曲、小样、制作人和作品口碑。",
    projects: [
      {
        id: "demo-record",
        name: "录制小样",
        cost: 4,
        minCafe: 2,
        resourceTier: "小透明资源",
        desc: "提升唱功、创作和粉丝黏性。",
        delta: { vocal: 3, creativity: 6, fans: 3, heat: 2, stress: 6, sensibility: 3 },
        result: "制作人听完小样说：不一定爆，但至少不是工业糖精。"
      },
      {
        id: "producer-chat",
        name: "制作人会面",
        cost: 2,
        minCafe: 3,
        resourceTier: "上升期资源",
        desc: "提升创作和口碑，偶尔打开资源。",
        delta: { creativity: 4, reputation: 3, trust: 1, stress: 2, ambition: 1, sensibility: 1 },
        result: "你们蹭到了一次制作人会面，对方愿意下次再听一版。"
      },
      {
        id: "album-plan",
        name: "概念 EP 企划",
        cost: 5,
        minCafe: 4,
        resourceTier: "当红资源",
        desc: "作品路线升级，口碑和粉丝黏性收益明显。",
        delta: { vocal: 5, creativity: 8, fans: 8, reputation: 5, stress: 9, sensibility: 4 },
        result: "EP 企划终于不是作业感小样，而像一个真正的艺人作品了。"
      }
    ]
  },
  {
    id: "fans",
    name: "粉丝社区",
    icon: "粉",
    x: 82,
    y: 62,
    desc: "观察舆论、经营粉丝、处理争议。",
    projects: [
      {
        id: "fan-care",
        name: "粉丝维护",
        cost: 2,
        minCafe: 1,
        resourceTier: "基础维护",
        desc: "提升粉丝与信任，降低压力。",
        delta: { fans: 5, trust: 2, stress: -2, heat: 1, discipline: 1 },
        result: "粉丝觉得工作室终于像个人了，艺人也松了一口气。"
      },
      {
        id: "public-repair",
        name: "口碑修复",
        cost: 3,
        minCafe: 1,
        resourceTier: "基础公关",
        desc: "降低热度噪音，修复口碑。",
        delta: { reputation: 6, heat: -2, stress: 2, trust: 2, discipline: 2 },
        result: "你压住了几条歪楼节奏。没那么热闹，但路人评价回暖。"
      }
    ]
  }
];

const statLabels = {
  vocal: "唱功",
  acting: "演技",
  stage: "舞台",
  charm: "魅力",
  creativity: "创作",
  heat: "热度",
  fans: "粉丝",
  reputation: "口碑",
  stress: "压力",
  trust: "信任",
  sensibility: "感性",
  ambition: "野心",
  romance: "恋爱倾向",
  discipline: "自律",
  capital: "资本支持"
};

const professionalAttrKeys = ["vocal", "acting", "stage", "charm", "creativity"];

const personalityLabels = {
  sensibility: "感性",
  ambition: "野心",
  romance: "恋爱倾向",
  discipline: "自律"
};

const cafeTiers = [
  { level: 5, name: "顶流 / 影歌双栖", score: 280, resource: "S 级主角、头部代言、奖项资源" },
  { level: 4, name: "当红艺人", score: 210, resource: "黄金档综艺、重点角色、正式作品企划" },
  { level: 3, name: "上升期", score: 140, resource: "制作人会面、配角机会、稳定商务" },
  { level: 2, name: "小透明", score: 90, resource: "试录、小样、普通试镜、低门槛曝光" },
  { level: 1, name: "素人 / 练习生", score: 0, resource: "基础训练、内部沟通、粉丝维护" }
];

const pathLabels = {
  acting: "影视演艺",
  music: "音乐唱作",
  variety: "综艺舞台",
  commercial: "商业热度",
  none: "无目标"
};

const pathTierTitles = {
  acting: {
    1: "表演新人",
    2: "小透明演员",
    3: "腰部演员",
    4: "一线演员",
    5: "影帝/影后候选"
  },
  music: {
    1: "音乐新人",
    2: "新人歌手",
    3: "上升歌手",
    4: "一线歌手",
    5: "歌王/歌后候选"
  },
  variety: {
    1: "通告新人",
    2: "飞行嘉宾",
    3: "常驻嘉宾",
    4: "头部综艺咖",
    5: "国民综艺咖"
  },
  commercial: {
    1: "商务试水",
    2: "带货新面孔",
    3: "品牌合作艺人",
    4: "品牌宠儿",
    5: "商业顶流"
  }
};

const pathAwardTargets = {
  acting: {
    1: "新人提名",
    2: "平台新人奖",
    3: "最佳配角提名",
    4: "最佳主角提名",
    5: "影帝/影后/视帝/视后"
  },
  music: {
    1: "平台新声",
    2: "最佳新人提名",
    3: "创作类提名",
    4: "年度歌曲/专辑提名",
    5: "歌王/歌后/年度专辑"
  },
  variety: {
    1: "综艺新人",
    2: "年度新面孔",
    3: "年度综艺表现",
    4: "最受欢迎综艺艺人",
    5: "年度综艺人物"
  },
  commercial: {
    1: "商业新人",
    2: "新锐商业艺人",
    3: "年度商业潜力",
    4: "年度商业价值",
    5: "年度品牌影响力"
  }
};

const goalTemplates = [
  {
    id: "city-singing",
    name: "市级歌唱大赛",
    path: "music",
    duration: 3,
    desc: "地方台办的新人歌唱比赛，适合把唱功和创作兑现成音乐荣誉。",
    requirements: { vocal: 64, creativity: 52 },
    rewards: { honor: 55, delta: { heat: 8, fans: 6, reputation: 6, stress: 3 } },
    fail: { delta: { heat: 2, reputation: -3, stress: 5, trust: -2 } }
  },
  {
    id: "city-film",
    name: "XX市影视短片项目",
    path: "acting",
    duration: 3,
    desc: "城市宣传短片公开选角，能把演技兑现成第一份影视履历。",
    requirements: { acting: 64, charm: 50 },
    rewards: { honor: 55, delta: { heat: 7, fans: 4, reputation: 8, stress: 4 } },
    fail: { delta: { heat: 1, reputation: -2, stress: 6, trust: -1 } }
  },
  {
    id: "variety-rookie",
    name: "新人综艺试录",
    path: "variety",
    duration: 2,
    desc: "平台小综艺试录，综艺感和魅力过关就可能拿到飞行嘉宾机会。",
    requirements: { charm: 60, stage: 56 },
    rewards: { honor: 45, delta: { heat: 12, fans: 6, reputation: 1, stress: 5 } },
    fail: { delta: { heat: 3, reputation: -4, stress: 6 } }
  },
  {
    id: "local-brand",
    name: "城市品牌推广",
    path: "commercial",
    duration: 2,
    desc: "本地品牌想找新面孔试水，热度、粉丝和魅力会决定转化表现。",
    requirements: { heat: 35, fans: 24, charm: 58 },
    rewards: { honor: 45, delta: { heat: 6, fans: 5, reputation: 2, stress: 4 }, money: 5 },
    fail: { delta: { fans: -2, reputation: -3, stress: 4 }, money: 1 }
  },
  {
    id: "s-leading-role",
    name: "S 级剧集主演局",
    path: "acting",
    duration: 3,
    desc: "平台头部项目临时开局。资本能把门推开，但演技和口碑兜不住就会被全网审判。",
    requirements: { acting: 54, creativity: 52, capital: 75 },
    rewards: { honor: 95, delta: { heat: 20, fans: 10, reputation: 6, stress: 10 }, money: 8 },
    fail: { delta: { heat: 10, reputation: -10, stress: 12, trust: -3 }, money: 3 },
    minCapital: 70,
    tag: "资本项目"
  },
  {
    id: "luxury-endorsement",
    name: "顶奢品牌单人title",
    path: "commercial",
    duration: 3,
    desc: "品牌方看中粉丝购买力和话题势能。粉圈能把销量打上去，也能把争议打上热搜。",
    requirements: { heat: 70, fans: 70, charm: 70 },
    rewards: { honor: 90, delta: { heat: 12, fans: 10, reputation: 3, stress: 8 }, money: 12 },
    fail: { delta: { fans: -6, reputation: -8, stress: 10 }, money: 4 },
    minTier: 4,
    tag: "头部商务"
  },
  {
    id: "lay-flat",
    name: "本轮先躺平",
    path: "none",
    duration: 2,
    desc: "不设明确发展目标，给艺人和团队一个喘气窗口。不会获得路线荣誉，但能修复信任和压力。",
    requirements: {},
    rewards: { honor: 0, delta: { stress: -8, trust: 4, reputation: 1 } },
    fail: { delta: { heat: -2, fans: -1 } }
  }
];

const snubLines = [
  "对方看了眼名单，笑得很标准：'这位现在还撑不起这个位置吧？'",
  "制片助理说档期满了，但你刚看到他们给隔壁当红艺人留了三页方案。",
  "品牌方语气很客气：'等 TA 再有一点国民度，我们一定第一时间考虑。'",
  "节目组把你们安排在茶水间等了四十分钟，最后只递来一句：'咖位还差点意思。'",
  "对接人没有明说拒绝，只把报价单默默换成了'新人友情支持价'。"
];

const projectFeedback = {
  talk: {
    speaker: "经纪人",
    lines: [
      "“别急着证明自己，娱乐圈最不缺的就是证明题，最缺的是别把自己写没了。”",
      "“今天不跑通告，跑一下脑子。脑子通了，公关部能少加两天班。”"
    ]
  },
  "contract-review": {
    speaker: "法务同事",
    lines: [
      "“这合同写得很艺术，翻译成人话就是：你们负责努力，对方负责解释。”",
      "“资源方说都好商量，一般意思是除了钱、番位和署名都好商量。”"
    ]
  },
  "vocal-class": {
    speaker: "声乐老师",
    lines: [
      "“气息比上周稳了，至少现在不是每个高音都像在和命运断联。”",
      "“这句有感情了，虽然感情像刚从热搜评论区捞出来的。”"
    ]
  },
  "camera-class": {
    speaker: "演员导师",
    lines: [
      "“眼神有戏了，但别每个镜头都像发现对家买了黑热搜。”",
      "“现在终于不是背台词，是像一个有灵魂的人在被甲方修改灵魂。”"
    ]
  },
  physical: {
    speaker: "体能教练",
    lines: [
      "“体能上来了。以后被临时加通告，至少能活着抵达现场。”",
      "“今天练得不错，塌房风险没降，摔倒风险先降了。”"
    ]
  },
  "variety-lab": {
    speaker: "综艺导演",
    lines: [
      "“你这个反应很真实，真实到后期老师已经开始想标题了。”",
      "“别怕尴尬，尴尬也是素材。我们台最擅长把人类局促剪成三分钟高光。”"
    ]
  },
  "meme-business": {
    speaker: "运营负责人",
    lines: [
      "“数据很好，尊严一般。问题不大，互联网先看前者。”",
      "“梗起来了，但别追太猛。网友喜欢活人，不喜欢活人被工作室当复读机。”"
    ]
  },
  "prime-variety": {
    speaker: "平台招商",
    lines: [
      "“黄金档给你镜头，是机会，也是高清审判。”",
      "“赞助商喜欢你，但他们更喜欢一个不会突然说真话的你。”"
    ]
  },
  audition: {
    speaker: "副导演",
    lines: [
      "“演得不错。不是说定你，是说我们终于可以认真拒绝别人了。”",
      "“资料留下吧。剧组说再看看，意思是要看演员，也要看背后谁在看。”"
    ]
  },
  "script-reading": {
    speaker: "编剧",
    lines: [
      "“理解人物了。虽然这个人物最不合理的地方，是甲方觉得观众会信。”",
      "“台词读顺了，恭喜你正式进入被临场改词的资格赛。”"
    ]
  },
  "leading-audition": {
    speaker: "总制片",
    lines: [
      "“S 级项目不缺演员，缺的是一个让会议室所有人都能交差的答案。”",
      "“资本愿意保你进门，但观众不收会议纪要。”"
    ]
  },
  "demo-record": {
    speaker: "制作人",
    lines: [
      "“这版能听了。不是客套，上一版我真的主要是在修身养性。”",
      "“旋律有记忆点，但别太相信副歌，副歌也有职业诈骗犯。”"
    ]
  },
  "producer-chat": {
    speaker: "音乐制作人",
    lines: [
      "“你们有想法。行业里有想法的人很多，能把想法交付的人少一点。”",
      "“下次带完整方案来。只带梦想的话，我们会议室坐不下。”"
    ]
  },
  "album-plan": {
    speaker: "企划总监",
    lines: [
      "“概念终于像概念，不像把三个关键词扔进 PPT 里祈福。”",
      "“作品方向可以，但宣发别太文艺。热搜不认识隐喻。”"
    ]
  },
  "fan-care": {
    speaker: "粉丝运营",
    lines: [
      "“粉丝要的是被看见，不是每次都被当成免费水军临时征召。”",
      "“今天话术像人说的，粉圈情绪至少先从沸腾降到小火慢炖。”"
    ]
  },
  "public-repair": {
    speaker: "公关负责人",
    lines: [
      "“口碑修复不是洗白，是让大家先别拿放大镜看你们呼吸。”",
      "“我们压住了节奏。不是赢了，只是今天少输一点。”"
    ]
  }
};

const weeklyEvents = [
  {
    id: "black-trend",
    title: "黑热搜冒头",
    tone: "bad",
    desc: "有人剪了断章取义视频，话题开始发酵。放着不管会伤口碑和信任。",
    choices: [
      {
        id: "clarify",
        label: "发澄清",
        costMoney: 2,
        desc: "花钱做基础公关，稳住口碑。",
        delta: { reputation: 5, trust: 2, heat: -2, stress: 2 },
        result: "澄清发得及时，节奏没有继续扩大。"
      },
      {
        id: "counter-meme",
        label: "反向玩梗",
        costMoney: 0,
        desc: "赌一把，把危机做成热梗。",
        delta: { heat: 8, fans: 3, reputation: -4, stress: 4 },
        result: "你们把黑热搜玩成梗，数据赢了，路人评价更分裂了。"
      }
    ]
  },
  {
    id: "producer-like",
    title: "制作人点名",
    tone: "good",
    desc: "一位制作人看到了艺人的片段，愿意给一次短会机会。",
    choices: [
      {
        id: "take-meeting",
        label: "立刻赴约",
        costEnergy: 2,
        desc: "消耗精力换资源线索。",
        delta: { creativity: 4, reputation: 3, trust: 1, stress: 2 },
        result: "会面聊得不错，对方愿意下次听完整方案。"
      },
      {
        id: "delay",
        label: "稳住节奏",
        costEnergy: 0,
        desc: "不消耗精力，艺人压力下降，但错过热机会。",
        delta: { stress: -5, trust: 2, heat: -1 },
        result: "你没有硬塞行程，艺人状态稳定了些。"
      }
    ]
  },
  {
    id: "fan-fight",
    title: "粉丝内讧",
    tone: "bad",
    desc: "粉丝因为路线问题吵起来了，站内站外都开始扩散。",
    choices: [
      {
        id: "fan-notice",
        label: "发粉丝信",
        costMoney: 1,
        desc: "维护粉丝关系，降低噪音。",
        delta: { fans: 3, reputation: 2, stress: 1 },
        result: "粉丝信稳住了核心粉，至少先别自己人打自己人。"
      },
      {
        id: "ignore",
        label: "冷处理",
        costMoney: 0,
        desc: "不花资源，但粉丝和热度会波动。",
        delta: { fans: -4, heat: 3, stress: 3, reputation: -2 },
        result: "冷处理省事，但粉丝内部裂缝更明显了。"
      }
    ]
  },
  {
    id: "viral-clip",
    title: "片段意外出圈",
    tone: "good",
    desc: "一个旧片段突然被转发，艺人获得临时曝光窗口。",
    choices: [
      {
        id: "follow-up",
        label: "追加营业",
        costEnergy: 2,
        desc: "趁热打铁，冲热度和粉丝。",
        delta: { heat: 10, fans: 5, stress: 3 },
        result: "追加营业接住了流量，粉丝明显上涨。"
      },
      {
        id: "quality-post",
        label: "发作品片段",
        costEnergy: 1,
        desc: "用作品接流量，热度少些但口碑更稳。",
        delta: { heat: 4, reputation: 5, fans: 2, stress: 1 },
        result: "你们没有纯蹭热度，而是把话题导向作品。"
      }
    ]
  }
];

let state = normalizeState(loadState() || createInitialState());

function createInitialState() {
  return {
    selectedId: null,
    artist: null,
    week: 1,
    money: 30,
    energy: 10,
    maxEnergy: 10,
    locationId: "office",
    pendingEvent: null,
    honors: { acting: 0, music: 0, variety: 0, commercial: 0 },
    goalChoices: getAvailableGoalTemplates(null),
    activeGoal: null,
    showGoalModal: false,
    rankUpNotice: null,
    actionNotice: null,
    attrView: "star",
    phoneTab: "hot",
    phoneFeed: [],
    phoneUnread: false,
    showPhone: false,
    eventText: "先从候选池签下第一位艺人，再去地图上选择地点和项目。",
    logs: []
  };
}

function normalizeState(nextState) {
  if (nextState.artist) {
    const template = candidateArtists.find((artist) => artist.id === nextState.artist.id);
    nextState.artist.attrs = normalizeProfessionalAttrs(nextState.artist.attrs || template?.attrs || {});
    nextState.artist.profile ||= clone(template?.profile || { age: 22, background: "未知背景", fandom: "粉丝结构未知", capital: 20, difficulty: "需要重新评估发展难度。" });
    nextState.artist.personality ||= clone(template?.personality || { sensibility: 50, ambition: 50, romance: 40, discipline: 50 });
  }
  nextState.honors ||= { acting: 0, music: 0, variety: 0, commercial: 0 };
  nextState.goalChoices ||= getAvailableGoalTemplates(nextState.artist || null);
  if (
    !nextState.activeGoal &&
    nextState.goalChoices.length &&
    (!nextState.goalChoices.some((goal) => goal.id === "lay-flat") ||
      (nextState.artist && !nextState.goalChoices.some((goal) => goal.id === "s-leading-role") && (nextState.artist.profile?.capital || 0) >= 70))
  ) {
    nextState.goalChoices = getAvailableGoalTemplates(nextState.artist || null);
  }
  nextState.showGoalModal = Boolean(nextState.showGoalModal);
  nextState.rankUpNotice ||= null;
  nextState.actionNotice ||= null;
  nextState.attrView = nextState.attrView === "bar" ? "bar" : "star";
  nextState.phoneTab ||= "hot";
  nextState.phoneFeed ||= nextState.artist ? generatePhoneFeed(nextState.artist, nextState.week || 1) : [];
  nextState.phoneUnread = Boolean(nextState.phoneUnread);
  nextState.showPhone = Boolean(nextState.showPhone);
  return nextState;
}

function normalizeProfessionalAttrs(attrs = {}) {
  const mergedCharm = attrs.charm ?? attrs.variety ?? 0;
  const normalized = {
    vocal: attrs.vocal ?? 0,
    acting: attrs.acting ?? 0,
    stage: attrs.stage ?? attrs.stamina ?? 0,
    charm: attrs.variety ? Math.round((mergedCharm + attrs.variety) / 2) : mergedCharm,
    creativity: attrs.creativity ?? 0
  };
  return Object.fromEntries(professionalAttrKeys.map((key) => [key, clamp(normalized[key] || 0)]));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getCafeScore(artist) {
  if (!artist) return 0;
  const honorBonus = state?.honors ? Math.max(...Object.values(state.honors)) : 0;
  const capitalBonus = (artist.profile?.capital || 0) * 0.9;
  return Math.round(artist.market.heat + artist.market.fans + artist.market.reputation + honorBonus + capitalBonus);
}

function getCafeTier(artist) {
  const score = getCafeScore(artist);
  return cafeTiers.find((tier) => score >= tier.score) || cafeTiers[cafeTiers.length - 1];
}

function getNextCafeTier(artist) {
  if (!artist) return cafeTiers[cafeTiers.length - 1];
  const current = getCafeTier(artist);
  return cafeTiers
    .slice()
    .reverse()
    .find((tier) => tier.level === current.level + 1);
}

function getPathTitle(artist, tier = getCafeTier(artist)) {
  if (!artist) return "未入圈";
  const path = getDominantPath();
  return pathTierTitles[path]?.[tier.level] || tier.name;
}

function getPathAward(artist, tier = getCafeTier(artist)) {
  if (!artist) return "暂无";
  const path = getDominantPath();
  return pathAwardTargets[path]?.[tier.level] || "行业奖项";
}

function getDominantPath() {
  const honors = state?.honors || {};
  const entries = Object.entries(honors);
  const best = entries.sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0) return best[0];
  if (!state?.artist) return "acting";
  const scores = {
    acting: state.artist.attrs.acting + state.artist.attrs.creativity * 0.35,
    music: state.artist.attrs.vocal + state.artist.attrs.creativity * 0.5,
    variety: state.artist.attrs.charm + state.artist.attrs.stage * 0.35,
    commercial: state.artist.market.heat + state.artist.market.fans + state.artist.attrs.charm * 0.3
  };
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function formatChoiceCost(choice) {
  const parts = [];
  if (choice.costMoney) parts.push(`${choice.costMoney} 万`);
  if (choice.costEnergy) parts.push(`${choice.costEnergy} 精力`);
  return parts.length ? parts.join(" / ") : "无消耗";
}

function generatePhoneFeed(artist, week) {
  if (!artist) return [];
  const score = Math.round(artist.market.heat + artist.market.fans + artist.market.reputation);
  const tier = cafeTiers.find((item) => score >= item.score) || cafeTiers[cafeTiers.length - 1];
  const ageTag = getAgeTendency(artist).title;
  return [
    {
      id: `hot-${week}-gate`,
      type: "hot",
      tone: "bad",
      source: "热搜广场",
      title: `#${tier.name}资源名单又洗牌了#`,
      body: `业内开始按咖位重新排项目顺位。${artist.name} 当前 L${tier.level}，资本背景 ${artist.profile.capital}，能撬门，但作品和口碑还得自己扛。`
    },
    {
      id: `hot-${week}-life`,
      type: "hot",
      tone: artist.personality.romance >= 60 ? "bad" : "good",
      source: "娱乐爆料号",
      title: `#${ageTag}艺人的私生活边界#`,
      body: `年轻爱豆容易被粉圈盯恋情，成熟演员会被催婚催生。${artist.name} 的恋爱倾向 ${artist.personality.romance}，感性 ${artist.personality.sensibility}。`
    },
    {
      id: `msg-${week}-producer`,
      type: "message",
      tone: "good",
      source: "制作人裴青",
      title: "有个项目在找合适的人",
      body: `“最近平台想找有话题但别太失控的人。你们要是能把口碑稳住，我可以帮忙递一次资料。”`
    },
    {
      id: `msg-${week}-artist`,
      type: "message",
      tone: "neutral",
      source: "同行艺人工作室",
      title: "对方想试探合作舞台",
      body: `“合作可以，但番位、镜头和粉丝控评要提前说清楚。别到时候两边粉丝开战。”`
    }
  ];
}

function getAgeTendency(artist) {
  const age = artist.profile?.age || 22;
  if (age <= 21) return { title: "养成系", risk: 1.35, text: "粉丝规训强，恋爱和夜归风险会被放大。" };
  if (age <= 26) return { title: "上升期", risk: 1.1, text: "事业和感情都容易被解读成路线选择。" };
  return { title: "成熟期", risk: 0.9, text: "恋情风险较低，但婚姻、家庭和转型议题会更强。" };
}

function getAvailableGoalTemplates(artist = state?.artist) {
  if (!artist) {
    return clone(goalTemplates.filter((goal) => !goal.minCapital && !goal.minTier));
  }
  const tier = getCafeTier(artist);
  const capital = artist.profile?.capital || 0;
  return clone(
    goalTemplates.filter((goal) => {
      if (goal.minCapital && capital < goal.minCapital) return false;
      if (goal.minTier && tier.level < goal.minTier) return false;
      return true;
    })
  );
}

function addPhoneItem(item) {
  state.phoneFeed = [item, ...(state.phoneFeed || [])].slice(0, 8);
  state.phoneUnread = true;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function selectArtist(id) {
  const selected = candidateArtists.find((artist) => artist.id === id);
  state.selectedId = id;
  state.artist = clone(selected);
  state.artist.attrs = normalizeProfessionalAttrs(state.artist.attrs);
  state.week = 1;
  state.money = 30;
  state.energy = 10;
  state.maxEnergy = 10;
  state.locationId = recommendedLocationFor(selected.id);
  state.pendingEvent = null;
  state.honors = { acting: 0, music: 0, variety: 0, commercial: 0 };
  state.goalChoices = getAvailableGoalTemplates(state.artist);
  state.activeGoal = null;
  state.showGoalModal = true;
  state.rankUpNotice = null;
  state.actionNotice = null;
  state.attrView = "star";
  state.phoneTab = "hot";
  state.phoneFeed = generatePhoneFeed(state.artist, state.week);
  state.phoneUnread = true;
  state.showPhone = false;
  state.eventText = `签约 ${selected.name}。请先从阶段目标中选择一个方向，再开始每周活动。`;
  state.logs = [
    {
      week: 1,
      text: `${selected.name} 加入工作室。${selected.route}`
    }
  ];
  saveState();
  render();
}

function recommendedLocationFor(id) {
  const map = {
    "lin-xiaotang": "training",
    "jiang-che": "film",
    "qiao-yiyi": "tv",
    "wen-ran": "music",
    "yan-ruoxi": "film",
    "luo-yinhe": "tv"
  };
  return map[id] || "office";
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  render();
}

function getLocation(id) {
  return mapLocations.find((location) => location.id === id) || mapLocations[0];
}

function moveToLocation(id) {
  if (state.showGoalModal) return;
  state.locationId = id;
  const location = getLocation(id);
  state.eventText = state.artist
    ? `${state.artist.name} 来到${location.name}。移动不消耗精力，选择项目才会结算。`
    : `来到${location.name}。先签约艺人，项目才会开放。`;
  saveState();
  render();
}

function getProject(projectId) {
  return mapLocations.flatMap((location) => location.projects).find((project) => project.id === projectId);
}

function applyDelta(artist, delta) {
  Object.entries(delta).forEach(([key, value]) => {
    if (key in artist.attrs) artist.attrs[key] = clamp(artist.attrs[key] + value);
    if (key in artist.market) artist.market[key] = clamp(artist.market[key] + value);
    if (key in artist.mind) artist.mind[key] = clamp(artist.mind[key] + value);
    if (artist.personality && key in artist.personality) artist.personality[key] = clamp(artist.personality[key] + value);
  });
}

function checkRankUp(beforeTier, trigger = "资源反馈") {
  if (!state.artist || !beforeTier) return;
  const afterTier = getCafeTier(state.artist);
  if (afterTier.level <= beforeTier.level) return;
  state.rankUpNotice = {
    fromLevel: beforeTier.level,
    fromTitle: getPathTitle(state.artist, beforeTier),
    toLevel: afterTier.level,
    toTitle: getPathTitle(state.artist, afterTier),
    trigger,
    score: getCafeScore(state.artist),
    award: getPathAward(state.artist, afterTier)
  };
}

function getProjectGateGap(project, cafeTier) {
  if (!project || !cafeTier) return 0;
  return Math.max(0, project.minCafe - cafeTier.level);
}

function shouldRejectByCafe(project, cafeTier) {
  const gap = getProjectGateGap(project, cafeTier);
  if (gap <= 0) return false;
  const capitalBuffer = Math.min(0.45, (state.artist.profile?.capital || 0) / 180);
  const rejectChance = Math.min(0.88, Math.max(0.18, 0.42 + gap * 0.18 - capitalBuffer));
  return Math.random() < rejectChance;
}

function resolveCafeSnub(project, cafeTier) {
  const line = snubLines[Math.floor(Math.random() * snubLines.length)];
  const energyLoss = Math.min(2, project.cost, state.energy);
  state.energy -= energyLoss;
  applyDelta(state.artist, { stress: 4, trust: -1, reputation: -1, heat: 1 });
  const capital = state.artist.profile?.capital || 0;
  const capitalText = capital >= 70 ? "资本已经帮你们把门缝撬开了，但这次对方还想再看看舆论风向。" : "背后没人递话时，门口的空气都更冷一点。";
  return `硬闯 ${project.name} 被挡回来了。${line} ${capitalText} 消耗 ${energyLoss} 精力，压力上升，口碑和信任小幅受损。当前 L${cafeTier.level}，对方要的是 L${project.minCafe} 的牌面。`;
}

function runProject(projectId) {
  if (!state.artist) return;
  const project = getProject(projectId);
  const cafeTier = getCafeTier(state.artist);
  if (!project || state.showGoalModal || state.pendingEvent || state.energy < project.cost) return;

  const beforeTier = getCafeTier(state.artist);
  if (shouldRejectByCafe(project, cafeTier)) {
    state.eventText = resolveCafeSnub(project, cafeTier);
    state.actionNotice = buildActionNotice(project, state.eventText, "bad");
    state.logs.unshift({
      week: state.week,
      text: `${getLocation(state.locationId).name} - ${project.name}：${state.eventText}`
    });
    state.logs = state.logs.slice(0, 10);
    checkRankUp(beforeTier, project.name);
    saveState();
    render();
    return;
  }

  state.energy -= project.cost;
  applyDelta(state.artist, project.delta);

  const extraEvent = resolveProjectEvent(project);
  const lifeEvent = resolveLifeSideEffect(project);
  const dialogue = getProjectDialogue(project);
  state.eventText = [extraEvent || lifeEvent || project.result, dialogue].filter(Boolean).join(" ");
  state.actionNotice = buildActionNotice(project, state.eventText, extraEvent ? "event" : "good");
  state.logs.unshift({
    week: state.week,
    text: `${getLocation(state.locationId).name} - ${project.name}：${state.eventText}`
  });
  state.logs = state.logs.slice(0, 10);
  checkRankUp(beforeTier, project.name);
  saveState();
  render();
}

function buildActionNotice(project, text, tone = "good") {
  const feedback = projectFeedback[project.id];
  return {
    title: project.name,
    location: getLocation(state.locationId).name,
    speaker: feedback?.speaker || "现场负责人",
    text,
    tone,
    energy: `${state.energy}/${state.maxEnergy}`
  };
}

function getProjectDialogue(project) {
  const feedback = projectFeedback[project.id];
  if (!feedback) return "";
  const line = feedback.lines[Math.floor(Math.random() * feedback.lines.length)];
  return `${feedback.speaker}反馈：${line}`;
}

function resolveProjectEvent(project) {
  const artist = state.artist;

  if (artist.mind.stress >= 85 && artist.mind.trust < 45) {
    artist.mind.trust = clamp(artist.mind.trust - 5);
    return `${artist.name} 压力爆表，当场拒绝继续配合。信任下降，今天最好别再硬压。`;
  }

  if (project.id === "meme-business" && artist.market.reputation < 30) {
    artist.market.fans = clamp(artist.market.fans + 3);
    return `${artist.name} 的热梗冲得太猛，粉丝狂欢，路人皱眉。黑红边缘继续滑行。`;
  }

  if (project.id === "audition" && artist.attrs.acting >= 70) {
    artist.market.heat = clamp(artist.market.heat + 4);
    artist.market.reputation = clamp(artist.market.reputation + 2);
    return `${artist.name} 试镜发挥超常，剧组态度明显变热。影视路线开始有眉目。`;
  }

  if (project.id === "demo-record" && artist.attrs.creativity >= 72) {
    artist.market.reputation = clamp(artist.market.reputation + 4);
    return `${artist.name} 的小样有了记忆点，制作人说这首能继续打磨。`;
  }

  return "";
}

function resolveLifeSideEffect(project) {
  const artist = state.artist;
  const personality = artist.personality || {};
  const tendency = getAgeTendency(artist);
  const projectStirsEmotion = Boolean(project.delta.sensibility || project.delta.romance || project.delta.charm || project.delta.creativity);
  if (!projectStirsEmotion) return "";

  const fandomPressure = artist.profile?.fandom?.includes("高") || artist.profile?.fandom?.includes("粉圈") ? 1.25 : 1;
  const rawRisk =
    (personality.sensibility * 0.28 + personality.romance * 0.42 + artist.market.heat * 0.22 - personality.discipline * 0.24) /
    100;
  const risk = Math.max(0.05, Math.min(0.62, rawRisk * tendency.risk * fandomPressure));

  if (Math.random() < risk) {
    const idolPenalty = artist.profile?.fandom?.includes("高") ? 1.4 : 1;
    artist.market.heat = clamp(artist.market.heat + 12);
    artist.market.fans = clamp(artist.market.fans - Math.round(5 * idolPenalty));
    artist.market.reputation = clamp(artist.market.reputation - Math.round(4 * idolPenalty));
    artist.mind.stress = clamp(artist.mind.stress + 9);
    artist.mind.trust = clamp(artist.mind.trust - 2);
    addPhoneItem({
      id: `hot-gossip-${state.week}-${Date.now()}`,
      type: "hot",
      tone: "bad",
      source: "狗仔速递",
      title: `#${artist.name} 深夜同框疑似恋情#`,
      body: `${tendency.text} 感性和恋爱倾向被培养起来后，私生活也更容易闯进事业线。`
    });
    return `${artist.name} 的感性被打开后，私下社交也变多了。狗仔拍到深夜同框，热度暴涨，但粉丝和口碑开始波动。`;
  }

  if (personality.sensibility >= 72 && (project.delta.creativity || project.delta.acting)) {
    artist.attrs.creativity = clamp(artist.attrs.creativity + 2);
    artist.market.reputation = clamp(artist.market.reputation + 1);
    artist.personality.romance = clamp(artist.personality.romance + 1);
    return `${artist.name} 的感性变成了作品理解力，创作和口碑获得额外提升。但越能共情，也越容易被关系牵动。`;
  }

  return "";
}

function pickWeeklyEvent() {
  if (!state.artist) return null;
  const pool = weeklyEvents.filter((event) => {
    if (event.id === "black-trend") return state.artist.market.heat >= 25 || state.artist.market.reputation < 45;
    if (event.id === "fan-fight") return state.artist.market.fans >= 18 || state.artist.market.heat >= 35;
    return true;
  });
  const index = Math.floor(Math.random() * pool.length);
  return clone(pool[index]);
}

function resolveWeeklyEventChoice(choiceId) {
  if (!state.artist || !state.pendingEvent) return;
  const choice = state.pendingEvent.choices.find((item) => item.id === choiceId);
  if (!choice) return;

  const costMoney = choice.costMoney || 0;
  const costEnergy = choice.costEnergy || 0;
  if (state.money < costMoney || state.energy < costEnergy) return;

  const beforeTier = getCafeTier(state.artist);
  const eventTitle = state.pendingEvent.title;
  state.money -= costMoney;
  state.energy -= costEnergy;
  applyDelta(state.artist, choice.delta || {});
  const message = `${state.pendingEvent.title}：${choice.result}`;
  state.eventText = message;
  state.logs.unshift({
    week: state.week,
    text: message
  });
  state.logs = state.logs.slice(0, 10);
  state.pendingEvent = null;
  checkRankUp(beforeTier, eventTitle);
  saveState();
  render();
}

function startGoal(goalId) {
  if (!state.artist || state.activeGoal) return;
  const goal = state.goalChoices.find((item) => item.id === goalId);
  if (!goal) return;
  state.activeGoal = {
    ...clone(goal),
    startWeek: state.week,
    dueWeek: state.week + goal.duration
  };
  state.goalChoices = [];
  state.showGoalModal = false;
  state.eventText =
    goal.path === "none"
      ? `已选择：${goal.name}。截止第 ${state.activeGoal.dueWeek} 周，本轮不追荣誉，优先修复状态和信任。`
      : `已选择阶段目标：${goal.name}。截止第 ${state.activeGoal.dueWeek} 周，围绕门槛补足能力。`;
  state.logs.unshift({
    week: state.week,
    text: `阶段目标启动：${goal.name}。${goal.desc}`
  });
  state.logs = state.logs.slice(0, 10);
  saveState();
  render();
}

function evaluateActiveGoal() {
  if (!state.artist || !state.activeGoal || state.week < state.activeGoal.dueWeek) return "";
  const goal = state.activeGoal;
  const missing = getGoalMissing(goal);
  const success = missing.length === 0;
  const beforeTier = getCafeTier(state.artist);
  if (success) {
    if (goal.path !== "none" && goal.rewards.honor > 0) {
      state.honors[goal.path] = (state.honors[goal.path] || 0) + goal.rewards.honor;
    }
    state.money += goal.rewards.money || 0;
    applyDelta(state.artist, goal.rewards.delta || {});
    state.activeGoal = null;
    state.goalChoices = getAvailableGoalTemplates(state.artist);
    state.showGoalModal = true;
    checkRankUp(beforeTier, goal.name);
    if (goal.path === "none") {
      return `${goal.name} 结束。没有新增荣誉，但 ${state.artist.name} 的状态缓了一口气，团队关系也更稳。`;
    }
    return `${goal.name} 达成！获得 ${pathLabels[goal.path]} 荣誉 +${goal.rewards.honor}，${state.artist.name} 的行业履历变硬了。`;
  }
  state.money += goal.fail.money || 0;
  applyDelta(state.artist, goal.fail.delta || {});
  state.activeGoal = null;
  state.goalChoices = getAvailableGoalTemplates(state.artist);
  state.showGoalModal = true;
  checkRankUp(beforeTier, goal.name);
  return `${goal.name} 未达标。差距：${missing.join("、")}。这次没能兑现成荣誉，但经验会留下。`;
}

function readStat(key) {
  if (!state.artist) return 0;
  if (key in state.artist.attrs) return state.artist.attrs[key];
  if (key in state.artist.market) return state.artist.market[key];
  if (key in state.artist.mind) return state.artist.mind[key];
  if (state.artist.personality && key in state.artist.personality) return state.artist.personality[key];
  if (state.artist.profile && key in state.artist.profile) return state.artist.profile[key];
  return 0;
}

function getGoalMissing(goal) {
  return Object.entries(goal.requirements)
    .filter(([key, value]) => readStat(key) < value)
    .map(([key, value]) => `${statLabels[key] || key} ${readStat(key)}/${value}`);
}

function advanceWeek() {
  if (!state.artist || state.pendingEvent) return;

  const beforeTier = getCafeTier(state.artist);
  const income = Math.max(2, Math.floor((state.artist.market.heat + state.artist.market.fans) / 18));
  const upkeep = 3;
  state.money = Math.max(0, state.money + income - upkeep);
  state.week += 1;
  state.energy = state.maxEnergy;
  state.phoneFeed = generatePhoneFeed(state.artist, state.week);
  state.phoneUnread = true;
  state.artist.mind.stress = clamp(state.artist.mind.stress - 6);
  state.artist.attrs.stage = clamp(state.artist.attrs.stage + 2);

  const goalResult = evaluateActiveGoal();
  state.pendingEvent = pickWeeklyEvent();
  state.eventText = state.pendingEvent
    ? `${goalResult ? `${goalResult} ` : ""}进入第 ${state.week} 周。精力恢复，公司净变化 ${income - upkeep >= 0 ? "+" : ""}${income - upkeep} 万。本周突发事件需要先处理：${state.pendingEvent.title}。`
    : `${goalResult ? `${goalResult} ` : ""}进入第 ${state.week} 周。精力恢复，压力小幅回落，公司净变化 ${income - upkeep >= 0 ? "+" : ""}${income - upkeep} 万。`;
  state.logs.unshift({
    week: state.week,
    text: state.eventText
  });
  state.logs = state.logs.slice(0, 10);
  checkRankUp(beforeTier, "周结算");
  saveState();
  render();
}

function render() {
  const app = document.querySelector("#app");
  if (!state.artist) {
    app.innerHTML = `
      <main class="app">
        ${renderTopbar()}
        ${renderArtistSelectScreen()}
      </main>
    `;
    bindEvents();
    return;
  }
  app.innerHTML = `
    <main class="app">
      ${renderTopbar()}
      <section class="shell">
        ${renderMapPanel()}
        ${renderRightPanel()}
      </section>
      ${state.showGoalModal ? renderGoalModal() : ""}
      ${state.actionNotice ? renderActionNoticeModal() : ""}
      ${state.rankUpNotice ? renderRankUpModal() : ""}
      ${state.showPhone ? renderPhoneModal() : ""}
    </main>
  `;
  bindEvents();
}

function renderArtistSelectScreen() {
  return `
    <section class="select-screen">
      <div class="select-intro">
        <p class="mini-label">流程 1 / 4</p>
        <h2>选择初始艺人</h2>
        <p>先签下第一位艺人。每个艺人只有初始优势、短板和性格标签，不绑定固定路线；后续发展由阶段目标和培养结果决定。</p>
      </div>
      <div class="select-grid">
        ${candidateArtists.map(renderCandidate).join("")}
      </div>
    </section>
  `;
}

function renderTopbar() {
  const artistName = state.artist ? state.artist.name : "未签约";
  const energyPercent = Math.round((state.energy / state.maxEnergy) * 100);
  const cafeTier = state.artist ? getCafeTier(state.artist) : null;
  const pathTitle = state.artist ? getPathTitle(state.artist, cafeTier) : "未入圈";
  return `
    <header class="topbar">
      <div class="brand">
        <h1 class="brand-title">勇闯娱乐圈</h1>
        <p class="brand-subtitle">地图行动原型</p>
      </div>
      <div class="top-stats">
        <span class="stat-pill">第 ${state.week} 周</span>
        <span class="stat-pill">资金 ${state.money} 万</span>
        <span class="stat-pill">当前艺人 ${artistName}</span>
        <span class="stat-pill">评级 ${pathTitle}</span>
        <span class="energy-pill">
          <span>精力 ${state.energy}/${state.maxEnergy}</span>
          <span class="energy-track"><span class="energy-fill" style="width:${energyPercent}%"></span></span>
        </span>
        <button class="phone-icon-btn ${state.phoneUnread ? "unread" : ""}" data-open-phone title="打开经纪人手机" aria-label="打开经纪人手机"><span></span></button>
        <button class="ghost-btn" data-reset title="重置原型进度">重置</button>
      </div>
    </header>
  `;
}

function renderLeftPanel() {
  return `
    <aside class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">候选池</h2>
          <p class="panel-note">开局只能签约 1 位艺人</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="candidate-list">
          ${candidateArtists.map(renderCandidate).join("")}
        </div>
      </div>
    </aside>
  `;
}

function renderCandidate(artist) {
  const selected = state.artist?.id === artist.id;
  return `
    <article class="candidate-card ${selected ? "selected" : ""}">
      <div class="portrait ${artist.color}">${artist.initial}</div>
      <div>
        <h3 class="candidate-name">${artist.name}</h3>
        <p class="candidate-role">${artist.role}</p>
        <div class="tag-row">${artist.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <p class="candidate-role">${artist.note}</p>
        <p class="route-tip">${artist.route}</p>
        <details class="candidate-details">
          <summary>查看详细属性</summary>
          <div class="candidate-profile">
            <span>${artist.profile.age} 岁</span>
            <span>${artist.profile.background}</span>
            <span>${artist.profile.fandom}</span>
            <span>资本背景 ${artist.profile.capital}</span>
          </div>
          <div class="candidate-attr-grid">
            ${Object.entries(artist.attrs).map(([key, value]) => `<span>${statLabels[key]} <strong>${value}</strong></span>`).join("")}
            ${Object.entries(artist.market).map(([key, value]) => `<span>${statLabels[key]} <strong>${value}</strong></span>`).join("")}
            ${Object.entries(artist.mind).map(([key, value]) => `<span>${statLabels[key]} <strong>${value}</strong></span>`).join("")}
          </div>
          <div class="candidate-attr-grid">
            ${Object.entries(artist.personality).map(([key, value]) => `<span>${personalityLabels[key]} <strong>${value}</strong></span>`).join("")}
          </div>
          <p class="route-tip">${artist.profile.difficulty}</p>
        </details>
        <button class="select-btn" data-select="${artist.id}">${selected ? "已签约" : "签约"}</button>
      </div>
    </article>
  `;
}

function renderMapPanel() {
  const location = getLocation(state.locationId);
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">娱乐圈地图</h2>
          <p class="panel-note">移动不耗精力，项目会消耗精力</p>
        </div>
        <button class="advance-btn" data-advance ${!state.artist || state.pendingEvent || state.showGoalModal ? "disabled" : ""}>进入下一周</button>
      </div>
      <div class="panel-body planner">
        <div class="event-box">${state.eventText}</div>
        ${state.pendingEvent ? renderPendingEvent() : ""}
        ${state.activeGoal ? renderGoalPanel() : ""}
        <div class="progress-layout">
          ${renderEnergyCard()}
          ${renderCafePyramid()}
        </div>
        <div class="map-layout">
          <div class="city-map">
            ${mapLocations.map(renderMapNode).join("")}
          </div>
          <div class="location-panel">
            <div class="location-head">
              <div class="location-icon">${location.icon}</div>
              <div>
                <h3>${location.name}</h3>
                <p>${location.desc}</p>
              </div>
            </div>
            <div class="project-list">
              ${location.projects.map(renderProject).join("")}
            </div>
          </div>
        </div>
        <div>
          <div class="section-label">地图地点</div>
          <div class="location-strip">
            ${mapLocations.map((item) => `<button class="location-chip ${item.id === state.locationId ? "active" : ""}" data-location="${item.id}">${item.name}</button>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPhoneModal() {
  const tab = state.phoneTab || "hot";
  const items = (state.phoneFeed || []).filter((item) => item.type === tab);
  return `
    <div class="phone-backdrop" data-phone-close>
      <section class="phone-modal">
        <div class="phone-speaker"></div>
        <div class="phone-screen">
          <div class="phone-head">
            <div>
              <p class="mini-label">经纪人手机</p>
              <h3>热搜与联系人</h3>
            </div>
            <button class="phone-close" data-phone-close title="关闭手机">×</button>
          </div>
          <div class="phone-tabs">
            <button class="${tab === "hot" ? "active" : ""}" data-phone-tab="hot">热搜</button>
            <button class="${tab === "message" ? "active" : ""}" data-phone-tab="message">联系人</button>
          </div>
          <div class="phone-feed">
            ${
              items.length
                ? items.map(renderPhoneItem).join("")
                : `<p class="empty">手机暂时安静。娱乐圈安静的时候，通常是在憋大的。</p>`
            }
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPhoneItem(item) {
  return `
    <article class="phone-item ${item.tone || "neutral"}">
      <div>
        <span>${item.source}</span>
        <strong>${item.title}</strong>
      </div>
      <p>${item.body}</p>
    </article>
  `;
}

function renderEnergyCard() {
  const energyPercent = Math.round((state.energy / state.maxEnergy) * 100);
  return `
    <section class="energy-card">
      <div>
        <p class="mini-label">本周精力</p>
        <strong>${state.energy}<span>/${state.maxEnergy}</span></strong>
      </div>
      <div class="big-energy-track"><span style="width:${energyPercent}%"></span></div>
      <p>项目会消耗精力；精力不足时只能处理事件或进入下一周。</p>
    </section>
  `;
}

function renderCafePyramid() {
  const current = state.artist ? getCafeTier(state.artist) : null;
  const score = state.artist ? getCafeScore(state.artist) : 0;
  const next = state.artist ? getNextCafeTier(state.artist) : null;
  const dominantPath = getDominantPath();
  const pathName = state.artist ? pathLabels[dominantPath] : "未定路线";
  return `
    <section class="pyramid-card">
      <div class="pyramid-head">
        <div>
          <p class="mini-label">娱乐圈金字塔 / ${pathName}</p>
          <strong>${state.artist ? getPathTitle(state.artist, current) : "未入圈"}</strong>
        </div>
        <span>咖位值 ${score}</span>
      </div>
      <div class="pyramid-list">
        ${cafeTiers
          .map(
            (tier) => `
              <div class="pyramid-row ${current && tier.level === current.level ? "current" : ""} ${current && tier.level < current.level ? "passed" : ""}">
                <span>L${tier.level}</span>
                <strong>${state.artist ? getPathTitle(state.artist, tier) : tier.name}</strong>
                <em>${state.artist ? getPathAward(state.artist, tier) : tier.resource}</em>
              </div>
            `
          )
          .join("")}
      </div>
      <p class="pyramid-note">${next && state.artist ? `距离 ${getPathTitle(state.artist, next)} 还差 ${Math.max(0, next.score - score)} 咖位值。` : "已经站到塔尖，接下来要守住口碑和风险。"}</p>
    </section>
  `;
}

function renderPendingEvent() {
  const event = state.pendingEvent;
  return `
    <section class="weekly-event ${event.tone}">
      <div>
        <p class="mini-label">本周随机事件</p>
        <h3>${event.title}</h3>
        <p>${event.desc}</p>
      </div>
      <div class="event-choice-list">
        ${event.choices
          .map((choice) => {
            const costMoney = choice.costMoney || 0;
            const costEnergy = choice.costEnergy || 0;
            const disabled = state.money < costMoney || state.energy < costEnergy;
            return `
              <button class="event-choice" data-choice="${choice.id}" ${disabled ? "disabled" : ""}>
                <strong>${choice.label}</strong>
                <span>${choice.desc}</span>
                <em>${formatChoiceCost(choice)}</em>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderGoalPanel() {
  if (!state.artist) {
    return `
      <section class="goal-panel">
        <div>
          <p class="mini-label">阶段目标</p>
          <h3>签约后选择目标</h3>
          <p>目标会给出明确期限和能力门槛，用来验证培养是否有效。</p>
        </div>
      </section>
    `;
  }

  if (state.activeGoal) {
    const goal = state.activeGoal;
    const isRestGoal = goal.path === "none";
    return `
      <section class="goal-panel active-goal">
        <div class="goal-head">
          <div>
            <p class="mini-label">当前阶段目标 / ${pathLabels[goal.path]}</p>
            <h3>${goal.name}</h3>
            <p>${goal.desc}</p>
          </div>
          <strong>截止第 ${goal.dueWeek} 周</strong>
        </div>
        ${
          isRestGoal
            ? `<div class="goal-req-list"><div class="goal-req ok"><span>本轮门槛</span><strong>无</strong></div></div>`
            : `<div class="goal-req-list">
                ${Object.entries(goal.requirements)
                  .map(([key, value]) => {
                    const current = readStat(key);
                    const ok = current >= value;
                    return `<div class="goal-req ${ok ? "ok" : ""}"><span>${statLabels[key] || key}</span><strong>${current}/${value}</strong></div>`;
                  })
                  .join("")}
              </div>`
        }
        <p class="goal-reward">${
          isRestGoal
            ? "本轮不会获得路线荣誉，但到期后会修复压力、信任和少量口碑。"
            : `成功：${pathLabels[goal.path]}荣誉 +${goal.rewards.honor}；失败会产生压力、口碑或信任损失。`
        }</p>
      </section>
    `;
  }

  return `
    <section class="goal-panel">
      <div class="goal-head">
        <div>
          <p class="mini-label">选择阶段目标</p>
          <h3>把培养兑现成荣誉</h3>
          <p>先选择一个目标，再围绕门槛培养。到期后自动验证结果。</p>
        </div>
      </div>
      <div class="goal-choice-grid">
        ${state.goalChoices.map(renderGoalChoice).join("")}
      </div>
    </section>
  `;
}

function renderGoalModal() {
  return `
    <div class="modal-backdrop">
      <section class="goal-modal">
        <div class="goal-modal-head">
          <div>
            <p class="mini-label">流程 2 / 4</p>
            <h2>选择发展目标</h2>
            <p>目标 N 选 1。完成会获得荣誉、热度、粉丝或口碑；未完成会带来粉丝、舆论、压力或信任惩罚。</p>
          </div>
        </div>
        <div class="goal-choice-grid modal-goals">
          ${state.goalChoices.map(renderGoalChoice).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderGoalChoice(goal) {
  const isRestGoal = goal.path === "none";
  const tag = goal.tag || (goal.minCapital ? "资本支持" : goal.minTier ? "头部机会" : pathLabels[goal.path]);
  const req =
    Object.keys(goal.requirements).length === 0
      ? "无硬性门槛"
      : Object.entries(goal.requirements)
          .map(([key, value]) => `${statLabels[key] || key} ${readStat(key)}/${value}`)
          .join(" / ");
  const failText = Object.entries(goal.fail.delta || {})
    .map(([key, value]) => `${statLabels[key] || key}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
  const rewardText = Object.entries(goal.rewards.delta || {})
    .map(([key, value]) => `${statLabels[key] || key}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
  return `
    <article class="goal-choice">
      <div>
        <span>${tag}</span>
        <h4>${goal.name}</h4>
        <p>${goal.desc}</p>
        <em>${req}</em>
        <small>完成：${isRestGoal ? "无荣誉" : `荣誉 +${goal.rewards.honor}`}${goal.rewards.money ? ` / 资金 +${goal.rewards.money} 万` : ""}${rewardText ? ` / ${rewardText}` : ""}</small>
        <small class="bad">未完成：${goal.fail.money ? `资金 +${goal.fail.money} 万 / ` : ""}${failText}</small>
      </div>
      <button data-goal="${goal.id}">选择</button>
    </article>
  `;
}

function renderActionNoticeModal() {
  const notice = state.actionNotice;
  return `
    <div class="modal-backdrop action-backdrop">
      <section class="goal-modal action-modal ${notice.tone}">
        <div class="action-modal-head">
          <p class="mini-label">项目反馈 / ${notice.location}</p>
          <h2>${notice.title}</h2>
        </div>
        <div class="action-dialogue">
          <div class="speaker-chip">${notice.speaker}</div>
          <p>${notice.text}</p>
        </div>
        <div class="action-footer">
          <span>剩余精力 ${notice.energy}</span>
          <button class="primary-btn" data-close-action>继续</button>
        </div>
      </section>
    </div>
  `;
}

function renderRankUpModal() {
  const notice = state.rankUpNotice;
  return `
    <div class="modal-backdrop rank-backdrop">
      <section class="goal-modal rank-modal">
        <div class="rank-badge">番位提升</div>
        <div class="goal-modal-head rank-head">
          <div>
            <p class="mini-label">${notice.trigger}</p>
            <h2>L${notice.fromLevel} ${notice.fromTitle} → L${notice.toLevel} ${notice.toTitle}</h2>
            <p>${state.artist.name} 的咖位值来到 ${notice.score}。现在行业看你们的眼神不一样了，下一档资源会更愿意开门。</p>
          </div>
        </div>
        <div class="rank-body">
          <div class="rank-line">
            <span>新奖项目标</span>
            <strong>${notice.award}</strong>
          </div>
          <div class="rank-line">
            <span>资源反馈</span>
            <strong>更高层项目仍可被拒，但不再只是来凑数的人。</strong>
          </div>
          <button class="primary-btn" data-close-rank>知道了</button>
        </div>
      </section>
    </div>
  `;
}

function renderMapNode(location) {
  const active = location.id === state.locationId;
  return `
    <button
      class="map-node ${active ? "active" : ""}"
      data-location="${location.id}"
      style="left:${location.x}%; top:${location.y}%"
      title="${location.name}"
    >
      <span>${location.icon}</span>
      <strong>${location.name}</strong>
    </button>
  `;
}

function renderProject(project) {
  const noArtist = !state.artist;
  const cafeTier = state.artist ? getCafeTier(state.artist) : null;
  const notEnough = state.energy < project.cost;
  const riskyByCafe = !noArtist && cafeTier.level < project.minCafe;
  const blockedByEvent = Boolean(state.pendingEvent);
  const blockedByGoal = Boolean(state.showGoalModal);
  const disabled = noArtist || notEnough || blockedByEvent || blockedByGoal;
  const deltaText = Object.entries(project.delta)
    .map(([key, value]) => `${statLabels[key] || key}${value > 0 ? "+" : ""}${value}`)
    .join(" / ");
  const lockText = blockedByGoal
    ? "先选目标"
    : blockedByEvent
      ? "先处理事件"
      : notEnough && !noArtist
        ? "精力不足"
        : riskyByCafe
          ? `硬闯 ${project.cost} 精力`
          : `${project.cost} 精力`;
  const gateText = riskyByCafe ? `资源门槛：L${project.minCafe} / 当前：L${cafeTier.level}，低番位硬闯大概率被拒` : `资源门槛：L${project.minCafe} / 当前：${cafeTier ? `L${cafeTier.level}` : "未签约"}`;

  return `
    <article class="project-card ${disabled ? "disabled" : ""} ${riskyByCafe ? "risky" : ""}">
      <div>
        <div class="project-title-row">
          <h3>${project.name}</h3>
          <span>${project.resourceTier}</span>
        </div>
        <p>${project.desc}</p>
        <span class="project-gate">${gateText}</span>
        <span class="project-delta">${deltaText}</span>
      </div>
      <button class="project-btn" data-project="${project.id}" ${disabled ? "disabled" : ""}>
        ${lockText}
      </button>
    </article>
  `;
}

function renderRightPanel() {
  return `
    <aside class="panel right-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">艺人状态</h2>
          <p class="panel-note">行动后即时变化</p>
        </div>
      </div>
      <div class="panel-body">
        ${state.artist ? renderArtistSheet(state.artist) : `<p class="empty">还没有签约艺人。先从候选池选择一位，再带 TA 去地图地点行动。</p>`}
        <div class="section-label">行动记录</div>
        <div class="log-list">${renderLogs()}</div>
      </div>
    </aside>
  `;
}

function renderArtistSheet(artist) {
  const cafeTier = getCafeTier(artist);
  const score = getCafeScore(artist);
  const next = getNextCafeTier(artist);
  const dominantPath = getDominantPath();
  const pathName = pathLabels[dominantPath] || "未定路线";
  const tendency = getAgeTendency(artist);
  return `
    <section class="artist-sheet">
      <div class="artist-head">
        <div class="portrait ${artist.color}">${artist.initial}</div>
        <div>
          <h3 class="artist-name">${artist.name}</h3>
          <p class="candidate-role">${artist.role}</p>
          <div class="tag-row">${artist.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
      </div>
      <div class="cafe-summary">
        <span>当前路线：${pathName}</span>
        <strong>L${cafeTier.level} ${getPathTitle(artist, cafeTier)}</strong>
        <em>${next ? `距 ${getPathTitle(artist, next)} 差 ${Math.max(0, next.score - score)}；奖项目标：${getPathAward(artist, cafeTier)}` : `塔尖守成；奖项目标：${getPathAward(artist, cafeTier)}`}</em>
      </div>
      <div class="life-summary">
        <span>${artist.profile.age} 岁 / ${artist.profile.background}</span>
        <strong>${tendency.title}人格倾向</strong>
        <em>${artist.profile.difficulty}</em>
      </div>
      <div class="honor-grid">
        ${Object.entries(state.honors)
          .map(([path, value]) => `<div class="honor-item ${path === dominantPath ? "active" : ""}"><span>${pathLabels[path]}</span><strong>${value}</strong></div>`)
          .join("")}
      </div>
      <div class="section-label">人格倾向</div>
      <div class="meter-list">
        ${Object.entries(artist.personality).map(([key, value]) => renderMeter(key, value, key === "romance" ? "hot" : key === "discipline" ? "good" : "")).join("")}
      </div>
      ${renderProfessionalAttrs(artist)}
      <div class="section-label">市场状态</div>
      <div class="meter-list">
        ${Object.entries(artist.market).map(([key, value]) => renderMeter(key, value, key === "heat" ? "hot" : "good")).join("")}
      </div>
      <div class="section-label">心理状态</div>
      <div class="meter-list">
        ${Object.entries(artist.mind).map(([key, value]) => renderMeter(key, value, key === "stress" ? "warn" : "good")).join("")}
      </div>
    </section>
  `;
}

function renderProfessionalAttrs(artist) {
  const mode = state.attrView === "bar" ? "bar" : "star";
  return `
    <div class="attr-head">
      <div class="section-label">专业属性</div>
      <div class="attr-toggle" aria-label="专业属性展示模式">
        <button class="${mode === "star" ? "active" : ""}" data-attr-view="star">五芒星图</button>
        <button class="${mode === "bar" ? "active" : ""}" data-attr-view="bar">柱状图</button>
      </div>
    </div>
    ${mode === "star" ? renderAttrStar(artist.attrs) : renderAttrBars(artist.attrs)}
  `;
}

function renderAttrBars(attrs) {
  return `
    <div class="meter-list">
      ${professionalAttrKeys.map((key) => renderMeter(key, attrs[key] || 0)).join("")}
    </div>
  `;
}

function renderAttrStar(attrs) {
  const center = 50;
  const radius = 38;
  const points = professionalAttrKeys.map((key, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / professionalAttrKeys.length;
    const valueRadius = radius * ((attrs[key] || 0) / 100);
    return {
      key,
      label: statLabels[key],
      value: attrs[key] || 0,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      labelX: center + Math.cos(angle) * 46,
      labelY: center + Math.sin(angle) * 46
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  return `
    <div class="attr-star-card">
      <svg class="attr-star" viewBox="0 0 100 100" role="img" aria-label="专业属性五芒星图">
        <polygon class="star-grid outer" points="50,12 86.14,38.26 72.36,80.74 27.64,80.74 13.86,38.26"></polygon>
        <polygon class="star-grid middle" points="50,25 73.78,42.27 64.69,70.23 35.31,70.23 26.22,42.27"></polygon>
        <polygon class="star-shape" points="${polygon}"></polygon>
        ${points.map((point) => `<circle class="star-dot" cx="${point.x}" cy="${point.y}" r="2.2"></circle>`).join("")}
        ${points
          .map(
            (point) => `
              <text class="star-label" x="${point.labelX}" y="${point.labelY}" text-anchor="middle">
                <tspan x="${point.labelX}" dy="0">${point.label}</tspan>
                <tspan x="${point.labelX}" dy="8">${point.value}</tspan>
              </text>
            `
          )
          .join("")}
      </svg>
    </div>
  `;
}

function renderMeter(key, value, tone = "") {
  return `
    <div class="meter-line">
      <span>${statLabels[key] || key}</span>
      <div class="meter-track"><div class="meter-fill ${tone}" style="width:${clamp(value)}%"></div></div>
      <span>${value}</span>
    </div>
  `;
}

function renderLogs() {
  if (!state.logs.length) return `<p class="empty">暂无记录。</p>`;
  return state.logs
    .map(
      (log) => `
        <article class="log-item">
          <p class="log-week">第 ${log.week} 周</p>
          <p class="log-text">${log.text}</p>
        </article>
      `
    )
    .join("");
}

function bindEvents() {
  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => selectArtist(button.dataset.select));
  });

  document.querySelectorAll("[data-location]").forEach((button) => {
    button.addEventListener("click", () => moveToLocation(button.dataset.location));
  });

  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => runProject(button.dataset.project));
  });

  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => resolveWeeklyEventChoice(button.dataset.choice));
  });

  document.querySelectorAll("[data-goal]").forEach((button) => {
    button.addEventListener("click", () => startGoal(button.dataset.goal));
  });

  document.querySelectorAll("[data-phone-tab]").forEach((button) => {
    button.addEventListener("click", () => setPhoneTab(button.dataset.phoneTab));
  });

  document.querySelectorAll("[data-attr-view]").forEach((button) => {
    button.addEventListener("click", () => setAttrView(button.dataset.attrView));
  });

  document.querySelector("[data-open-phone]")?.addEventListener("click", openPhone);
  document.querySelectorAll("[data-phone-close]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target === element) closePhone();
    });
  });
  document.querySelector("[data-close-rank]")?.addEventListener("click", closeRankUpNotice);
  document.querySelector("[data-close-action]")?.addEventListener("click", closeActionNotice);
  document.querySelector("[data-advance]")?.addEventListener("click", advanceWeek);
  document.querySelector("[data-reset]")?.addEventListener("click", resetGame);
}

function openPhone() {
  if (!state.artist) return;
  state.showPhone = true;
  state.phoneUnread = false;
  saveState();
  render();
}

function closePhone() {
  state.showPhone = false;
  saveState();
  render();
}

function setPhoneTab(tab) {
  state.phoneTab = tab;
  saveState();
  render();
}

function setAttrView(view) {
  state.attrView = view === "bar" ? "bar" : "star";
  saveState();
  render();
}

function closeRankUpNotice() {
  state.rankUpNotice = null;
  saveState();
  render();
}

function closeActionNotice() {
  state.actionNotice = null;
  saveState();
  render();
}

render();
