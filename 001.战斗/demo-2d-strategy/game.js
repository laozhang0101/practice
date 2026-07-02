const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
const DEMO_VERSION = "2026.06.30-energy-icon-position";
const DEFAULT_MELEE_CINEMATIC_DURATION = 0.82;
const NORMAL_ATTACK_DAMAGE = 22;
const GOURD_HEAL_CHANCE = 0.5;
const GOURD_HEAL_AMOUNT = 10;
const GOURD_MAX_USES = 3;

const sprites = {
  background: new Image(),
  player: new Image(),
  boss: new Image(),
  bossArmsBroken: new Image(),
  bossLegsBroken: new Image(),
  bossArmsLegsBroken: new Image(),
  bossChestBroken: new Image(),
  bossRockThrow: new Image(),
  partArms: new Image(),
  partCore: new Image(),
  partFeet: new Image(),
  armorShield: new Image(),
  loadoutGourd: new Image(),
  playerAvatar: new Image(),
};

sprites.background.src = "./assets/arena-bg.jpeg";
sprites.player.src = "./assets/player.png";
sprites.boss.src = "./assets/boss.png";
sprites.bossArmsBroken.src = "./assets/boss-arms-broken.png";
sprites.bossLegsBroken.src = "./assets/boss-legs-broken.png";
sprites.bossArmsLegsBroken.src = "./assets/boss-arms-legs-broken.png";
sprites.bossChestBroken.src = "./assets/boss-chest-broken.png";
sprites.bossRockThrow.src = "./assets/boss-rock-throw.png";
sprites.partArms.src = "./assets/part-arms.png";
sprites.partCore.src = "./assets/part-core.png";
sprites.partFeet.src = "./assets/part-feet.png";
sprites.armorShield.src = "./assets/armor-shield.png";
sprites.loadoutGourd.src = "./assets/loadout-gourd.jpeg";
sprites.playerAvatar.src = "./assets/player-avatar.png";
Object.values(sprites).forEach((image) => {
  image.onload = () => draw();
});

const ui = {
  versionLabels: document.querySelectorAll("[data-demo-version]"),
  phaseLabel: document.getElementById("phaseLabel"),
  soulGauge: document.getElementById("soulGauge"),
  playerHp: document.getElementById("playerHp"),
  selectedWeapon: document.getElementById("selectedWeapon"),
  turnState: document.getElementById("turnState"),
  currentTarget: document.getElementById("currentTarget"),
  brokenParts: document.getElementById("brokenParts"),
  weaponOverlay: document.getElementById("weaponOverlay"),
  weaponToggle: document.getElementById("weaponToggle"),
  weaponButtons: document.getElementById("weaponButtons"),
  battleSkillOverlay: document.getElementById("battleSkillOverlay"),
  battleSkillButtons: document.getElementById("battleSkillButtons"),
  skillButtons: document.getElementById("skillButtons"),
  soulSkillButtons: document.getElementById("soulSkillButtons"),
  soulArmorButton: document.getElementById("soulArmorButton"),
  soulArmorCount: document.getElementById("soulArmorCount"),
  resetBtn: document.getElementById("resetBtn"),
  reactionPanel: document.getElementById("reactionPanel"),
  threatText: document.getElementById("threatText"),
  videoOverlay: document.getElementById("videoOverlay"),
  skillVideo: document.getElementById("skillVideo"),
  qteOverlay: document.getElementById("qteOverlay"),
  qteTitle: document.getElementById("qteTitle"),
  qteCopy: document.getElementById("qteCopy"),
  qteGauge: document.getElementById("qteGauge"),
  accessoryChoice: document.getElementById("accessoryChoice"),
  weakpointTip: document.getElementById("weakpointTip"),
  turnInfo: document.getElementById("turnInfo"),
  bossInfo: document.getElementById("bossInfo"),
  logList: document.getElementById("logList"),
  prebattleScreen: document.getElementById("prebattleScreen"),
  prebattleStepButtons: document.querySelectorAll("[data-prebattle-step]"),
  characterTabButtons: document.querySelectorAll("[data-character-tab]"),
  nextLoadoutBtn: document.getElementById("nextLoadoutBtn"),
  nextLoadoutFromCharacterBtn: document.getElementById("nextLoadoutFromCharacterBtn"),
  nextSkillBtn: document.getElementById("nextSkillBtn"),
  nextSkillFromWeaponBtn: document.getElementById("nextSkillFromWeaponBtn"),
  backToBossBtn: document.getElementById("backToBossBtn"),
  backToBossFromCharacterBtn: document.getElementById("backToBossFromCharacterBtn"),
  backToCharacterFromWeaponBtn: document.getElementById("backToCharacterFromWeaponBtn"),
  backToLoadoutBtn: document.getElementById("backToLoadoutBtn"),
  characterStyleCard: document.getElementById("characterStyleCard"),
  characterTabPanel: document.getElementById("characterTabPanel"),
  bossCards: document.getElementById("bossCards"),
  bossIntel: document.getElementById("bossIntel"),
  weaponCarrySlots: document.getElementById("weaponCarrySlots"),
  weaponSelectionTitle: document.getElementById("weaponSelectionTitle"),
  weaponGallery: document.getElementById("weaponGallery"),
  weaponDetailPanel: document.getElementById("weaponDetailPanel"),
  skillLoadoutWeapons: document.getElementById("skillLoadoutWeapons"),
  skillSourceTabs: document.getElementById("skillSourceTabs"),
  skillConfigList: document.getElementById("skillConfigList"),
  skillEditor: document.getElementById("skillEditor"),
  armorBoardParts: document.getElementById("armorBoardParts"),
  armorBoardConfig: document.getElementById("armorBoardConfig"),
  tacticalLinkMap: document.getElementById("tacticalLinkMap"),
  tacticalLinkDetail: document.getElementById("tacticalLinkDetail"),
  backToCharacterFromLinksBtn: document.getElementById("backToCharacterFromLinksBtn"),
  backToLoadoutFromArmorBoardBtn: document.getElementById("backToLoadoutFromArmorBoardBtn"),
  enterBattleFromLinksBtn: document.getElementById("enterBattleFromLinksBtn"),
  enterBattleBtn: document.getElementById("enterBattleBtn"),
};

const partBlueprint = [
  { id: "arms", label: "手部", armor: "armored", maxHp: 130, maxArmor: 95, effect: "破坏后削弱 Boss 近战攻击" },
  { id: "core", label: "胸口核心", armor: "exposed", weakpoint: true, maxHp: 170, maxArmor: 0, effect: "裸露弱点，适合爆发输出" },
  { id: "legs", label: "脚部", armor: "armored", maxHp: 120, maxArmor: 85, effect: "破坏后降低 Boss 稳定性" },
];

const bossBlueprints = [
  {
    id: "lava_golem",
    name: "熔岩石头人",
    title: "巨型熔岩构装体",
    threatLevel: "高威胁",
    image: "./assets/boss.png",
    summary: "硬甲覆盖全身，胸口核心裸露。手部投石有明显蓄力，可被打断。",
    ecology: "古代熔岩坑中苏醒的巨型构装体，行动迟缓，但正面压迫感极强。",
    habitat: "熔岩坑 / 古代遗迹",
    habitLine: "不追击弱小目标，会缓慢逼近并用巨石压制空间。",
    habitTags: ["迟缓压迫", "硬甲护体", "蓄力投石", "核心外露"],
    attributeTendencies: [
      { label: "水", value: "偏弱", trend: "down" },
      { label: "火", value: "极强", trend: "up" },
      { label: "电", value: "一般", trend: "flat" },
      { label: "冰", value: "偏弱", trend: "down" },
      { label: "光", value: "不明", trend: "flat" },
      { label: "暗", value: "略低", trend: "down" },
    ],
    abilityProfile: [
      { label: "体力", value: 8 },
      { label: "攻击", value: 9 },
      { label: "速度", value: 3 },
      { label: "防御", value: 8 },
    ],
    partIntel: [
      {
        partId: "core",
        label: "躯干核心",
        tags: [
          { label: "裸露", tone: "exposed" },
          { label: "弱点", tone: "weak" },
        ],
        hint: "可直接压低总血量。",
      },
      {
        partId: "arms",
        label: "双臂",
        tags: [
          { label: "硬甲", tone: "armor" },
          { label: "投石", tone: "danger" },
          { label: "可打断", tone: "interrupt" },
        ],
        hint: "准备投石时打手部可中断。",
      },
      {
        partId: "legs",
        label: "双腿",
        tags: [
          { label: "硬甲", tone: "armor" },
          { label: "支撑", tone: "control" },
        ],
        hint: "破甲后适合压制稳定性。",
      },
    ],
    startTip: "怪物全身硬甲，躯干核心裸露；看到手部举石时，攻击手部可以打断投石。",
    recommendedPlan: "先判断武器是否具备破甲能力：破甲武器处理硬甲部位，爆发技能优先压低躯干核心。",
    intel: [
      {
        iconSrc: "./assets/armor-shield.png",
        title: "全身硬甲",
        tip: "除躯干核心外，全身其他部位都被硬甲覆盖。普通输出收益低，破甲后再打更有效。",
      },
      {
        partId: "core",
        title: "躯干核心裸露",
        tip: "躯干处不是硬甲，可直接攻击，是压低总血量的主要突破口。",
      },
      {
        partId: "arms",
        title: "手部投石可打断",
        tip: "投石前会举起巨石。准备回合攻击手部，可中断这次高威胁技能。",
      },
    ],
    mysteries: ["生命降低后的新动作尚未记录"],
  },
  {
    id: "frost_behemoth",
    name: "冰脊巨兽",
    title: "极寒重甲异兽",
    threatLevel: "未开放",
    short: "冰",
    locked: true,
  },
  {
    id: "storm_wyvern",
    name: "风暴翼龙",
    title: "高速飞行型 Boss",
    threatLevel: "未开放",
    short: "翼",
    locked: true,
  },
  {
    id: "sand_colossus",
    name: "荒砂巨像",
    title: "范围压制型 Boss",
    threatLevel: "未开放",
    short: "砂",
    locked: true,
  },
];

const weapons = [
  {
    id: "fists",
    name: "拳套",
    short: "拳",
    icon: "./assets/weapon-fists.png",
    playerSprite: "./assets/player-fists.png",
    role: "近战猛攻",
  },
  {
    id: "greatsword",
    name: "大剑",
    short: "剑",
    icon: "./assets/weapon-greatsword.png",
    playerSprite: "./assets/player-greatsword.png",
    role: "重型破甲",
  },
  {
    id: "bow",
    name: "弓弩",
    short: "弓",
    icon: "./assets/weapon-bow.png",
    playerSprite: "./assets/player-bow.png",
    role: "远程点破",
  },
  {
    id: "hammer",
    name: "战锤",
    short: "锤",
    role: "重装震击",
    locked: true,
  },
  {
    id: "spear",
    name: "长枪",
    short: "枪",
    role: "中距突刺",
    locked: true,
  },
  {
    id: "staff",
    name: "法杖",
    short: "杖",
    role: "能量操控",
    locked: true,
  },
];

const skills = [
  {
    id: "gs_arm_sunder",
    weaponId: "greatsword",
    name: "碎臂重斩",
    targetParts: ["arms"],
    targetLabel: "手部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: true,
    damage: 68,
    armorDamage: 86,
    exposedBonus: 1.18,
    actionCost: 3,
    soulGain: 13,
    color: "#f0b84f",
    desc: "重型破甲，优先剥离手部硬甲。",
  },
  {
    id: "gs_leg_cleave",
    weaponId: "greatsword",
    name: "断足裂击",
    targetParts: ["legs"],
    targetLabel: "脚部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: true,
    damage: 74,
    armorDamage: 96,
    exposedBonus: 1.2,
    actionCost: 3,
    soulGain: 13,
    color: "#f0b84f",
    desc: "重型破甲，打开脚部硬甲。",
  },
  {
    id: "gs_sweep",
    weaponId: "greatsword",
    name: "蓄势",
    targetParts: ["core"],
    targetLabel: "胸部",
    kind: "stance",
    kindLabel: "蓄势",
    armorBreaker: false,
    damage: 0,
    armorDamage: 0,
    exposedBonus: 1,
    actionCost: 0,
    soulGain: 8,
    color: "#f0b84f",
    stance: "greatsword_counter",
    summaryOverride: "反击率 70% / 下次伤害 +20%",
    desc: "默认瞄准躯干蓄势，受击后有概率反击。",
  },
  {
    id: "fist_arm_rush",
    weaponId: "fists",
    name: "核心连打",
    targetParts: ["core"],
    targetLabel: "胸部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: false,
    damage: 24,
    armorDamage: 8,
    exposedBonus: 1.65,
    actionCost: 0,
    soulGain: 15,
    color: "#76d17b",
    comboChance: 0.5,
    comboDamage: NORMAL_ATTACK_DAMAGE,
    desc: "近战爆发，直击胸口核心弱点。",
    accessoryFlow: {
      introVideo: "./assets/videos/fist-skill-1-attack-web.mp4",
      selectLoopVideo: "./assets/videos/accessory-select-loop-web.mp4",
      effects: {
        jet: { label: "喷气挂件", video: "./assets/videos/jet-accessory-effect-web.mp4", damageMultiplier: 1.5 },
        drone: { label: "无人机挂件", video: "./assets/videos/drone-accessory-effect-web.mp4", damageMultiplier: 1.18 },
      },
    },
  },
  {
    id: "fist_leg_drive",
    weaponId: "fists",
    name: "贴地踢击",
    targetParts: ["legs"],
    targetLabel: "脚部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: false,
    damage: 44,
    armorDamage: 8,
    exposedBonus: 1.6,
    actionCost: 1,
    soulGain: 14,
    color: "#76d17b",
    comboChance: 0.5,
    comboDamage: NORMAL_ATTACK_DAMAGE,
    desc: "打裸露脚部收益高，硬甲状态收益低。",
    cinematicVideo: "./assets/videos/fist-leg-drive.mp4",
  },
  {
    id: "fist_flurry",
    weaponId: "fists",
    name: "近身乱舞",
    targetParts: ["core", "arms", "legs"],
    targetLabel: "胸部+手部+脚部",
    kind: "aoe",
    kindLabel: "AOE",
    armorBreaker: false,
    damage: 56,
    armorDamage: 6,
    exposedBonus: 1.35,
    actionCost: 3,
    soulGain: 18,
    color: "#76d17b",
    desc: "近战 AOE，同时打击胸部、手部和脚部。",
  },
  {
    id: "bow_core_burst",
    weaponId: "bow",
    name: "核心爆射",
    targetParts: ["core"],
    targetLabel: "胸部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: false,
    damage: 76,
    armorDamage: 0,
    exposedBonus: 1.55,
    actionCost: 2,
    ammoCost: 2,
    soulGain: 9,
    color: "#58b7ff",
    desc: "消耗弹药，单点爆破裸露核心。",
  },
  {
    id: "bow_arm_pierce",
    weaponId: "bow",
    name: "穿臂箭",
    targetParts: ["arms"],
    targetLabel: "手部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: true,
    damage: 38,
    armorDamage: 68,
    exposedBonus: 1.28,
    actionCost: 1,
    ammoCost: 1,
    soulGain: 10,
    color: "#58b7ff",
    desc: "远程破甲，精准打开手部硬甲。",
  },
  {
    id: "bow_volley",
    weaponId: "bow",
    name: "压制箭雨",
    targetParts: ["legs"],
    targetLabel: "脚部",
    kind: "single",
    kindLabel: "单体",
    armorBreaker: false,
    damage: 84,
    armorDamage: 0,
    exposedBonus: 1.25,
    actionCost: 3,
    ammoCost: 2,
    soulGain: 13,
    color: "#58b7ff",
    desc: "远程压制，将箭雨集中倾泻到脚部。",
  },
];

const soulArmorSkills = [
  {
    id: "soul_armor_overdrive",
    name: "灵魂战甲·超载解放",
    kind: "ultimate",
    kindLabel: "大招",
    targetParts: ["core", "arms", "legs"],
    targetLabel: "部位选择",
    damage: 42,
    soulCost: 25,
    maxDots: 4,
    color: "#ff9d42",
    desc: "常驻大招，不随武器切换。长按蓄力后选择怪物部位释放。",
  },
];
const enemyVideoAttacks = {
  rightThrow: {
    id: "right_throw",
    label: "怪物右侧进攻",
    type: "video_qte",
    introVideo: "./assets/videos/monster-right-attack-web.mp4",
    successVideo: "./assets/videos/block-success-web.mp4",
    failVideo: "./assets/videos/block-fail-web.mp4",
    qteStart: 5,
    qteEnd: 6,
    validResponses: ["right", "block"],
    damageOnSuccess: 0,
    damageOnFail: 38,
  },
  lavaBurst: {
    id: "lava_burst",
    label: "胸口熔岩喷射",
    type: "timed_qte",
    validResponses: ["left", "right"],
    qteDuration: 2.25,
    damageOnSuccess: 0,
    damageOnFail: 46,
    warningText: "怪物好像要释放大招了，快攻击胸口。",
  },
  rockThrow: {
    id: "rock_throw",
    label: "巨石投掷",
    type: "delayed_unblockable",
    sourcePart: "arms",
    interruptPart: "arms",
    prepareVideo: "./assets/videos/rock-throw-prepare-web.mp4",
    releaseVideo: "./assets/videos/rock-throw-release-web.mp4",
    damageOnRelease: 72,
    warningText: "Boss 正在举起巨石，攻击手部可以打断！",
  },
};

const enemyAttackSequence = [enemyVideoAttacks.rightThrow, enemyVideoAttacks.lavaBurst, enemyVideoAttacks.rockThrow];

let state;
let lastTime = performance.now();
let floaters = [];
let playerHitFloaters = [];
let soulHoldTimer = null;
let hoveredTargetParts = [];
let activeVideoSkipHandler = null;
const bossEdgeMaskCache = new WeakMap();

const loadoutParts = [
  { id: "head", label: "头盔", icon: "♜", slots: ["脸部", "护额"], defaultItem: "修罗头盔" },
  { id: "torso", label: "上衣", icon: "♛", slots: ["肩膀", "前胸", "后背", "上臂", "脖子"], defaultItem: "修罗上衣" },
  { id: "pants", label: "裤子", icon: "♟", slots: ["前腰", "后腰", "左腿", "右腰", "大腿"], defaultItem: "修罗下装" },
  { id: "bracer", label: "护腕", icon: "◒", slots: ["腕部"], defaultItem: "修罗护腕" },
  { id: "shoes", label: "鞋子", icon: "♞", slots: ["小腿前", "小腿后", "小腿侧", "脚部"], defaultItem: "修罗鞋子" },
];

const weaponLoadoutSlots = [
  { id: "weaponA", label: "武器A" },
  { id: "weaponB", label: "武器B" },
];
const WEAPON_SKILL_SLOT_COUNT = 3;

const loadoutState = {
  prebattleStep: "boss",
  selectedBossId: "lava_golem",
  selectedWeaponIds: ["fists", "greatsword"],
  activeWeaponSlot: 0,
  activeWeaponDetailId: "fists",
  weaponDetailOpen: false,
  weaponSkillLoadout: {},
  weaponSkillPickerOpen: false,
  activeWeaponSkillSlot: 0,
  armorFactorLoadout: {},
  armorFactorBoardSlots: {},
  armorFactorPickerOpen: false,
  activeArmorFactorSlot: 0,
  activeSkillGroupId: "weapon",
  activeSkillSourceId: "",
  activeSkillEditorId: "",
  skillGroupExpanded: { weapon: true, armor: false, accessory: false },
  activeCharacterTab: "weapons",
  activePartId: "head",
  activeSlot: "base",
  isFocusing: false,
  equipped: {},
};

const armorThemeLoadoutOptions = [
  { name: "岩铠", icon: "岩", trait: "重甲型基础装饰" },
  { name: "疾影", icon: "影", trait: "敏捷型基础装饰" },
  { name: "猎手", icon: "猎", trait: "技巧型基础装饰" },
].flatMap((theme) => loadoutParts.map((part) => ({
  name: `${theme.name}${part.label}`,
  icon: theme.icon,
  trait: theme.trait,
  category: "base",
  parts: [part.id],
})));

const attachmentOptions = [
  { name: "修罗头盔", icon: "♜", trait: "头部基础装饰", category: "base", parts: ["head"], image: "./assets/loadout-shura-head.jpeg" },
  { name: "修罗上衣", icon: "♛", trait: "上身基础装饰", category: "base", parts: ["torso"], image: "./assets/loadout-shura-torso.jpeg" },
  { name: "修罗下装", icon: "♟", trait: "腿部基础装饰", category: "base", parts: ["pants"], image: "./assets/loadout-shura-pants.jpeg" },
  { name: "修罗护腕", icon: "◒", trait: "护腕基础装饰", category: "base", parts: ["bracer"], image: "./assets/loadout-shura-bracer.jpeg" },
  { name: "修罗鞋子", icon: "♞", trait: "鞋子基础装饰", category: "base", parts: ["shoes"], image: "./assets/loadout-shura-shoes.jpeg" },
  ...armorThemeLoadoutOptions,
  {
    name: "无人机",
    icon: "◉",
    trait: "上臂挂件，远程协同",
    category: "drone",
    slots: ["上臂"],
    socketCount: 2,
    image: "./assets/loadout-drone.png",
    tacticalInfo: {
      title: "无人机",
      role: "远程协同攻击",
      trigger: "使用拳套攻击怪物躯干时，有概率触发。",
      effect: "无人机会从角色身后展开火力，对当前躯干目标追加协同攻击。",
    },
  },
  {
    name: "箭袋",
    icon: "箭",
    trait: "后背挂件，强化穿臂箭破甲",
    category: "quiver",
    slots: ["后背"],
    socketCount: 3,
    image: "./assets/loadout-quiver.jpeg",
    tacticalInfo: {
      title: "箭袋",
      role: "弓弩破甲强化",
      trigger: "装备在后背时生效。",
      effect: "使原有穿臂箭获得箭袋破甲效果，更容易击穿怪物手部硬甲。",
    },
  },
  {
    name: "喷气式装置",
    icon: "✦",
    trait: "肩膀挂件，跃升爆发",
    category: "jet",
    slots: ["肩膀"],
    socketCount: 4,
    image: "./assets/loadout-jet.png",
    tacticalInfo: {
      title: "喷气式装置",
      role: "力量增幅",
      trigger: "释放近战攻击时可作为挂件效果介入。",
      effect: "增强手部力量，使本次攻击伤害增加 50%。",
    },
  },
  {
    name: "酒葫芦",
    icon: "葫",
    trait: "前腰固定挂件，回合开始概率饮酒回血",
    category: "gourd",
    slots: ["前腰"],
    socketCount: 1,
    image: "./assets/loadout-gourd.jpeg",
    tacticalInfo: {
      title: "酒葫芦",
      role: "回合恢复",
      trigger: "每回合开始时自动判定。",
      effect: "有 50% 概率饮酒恢复 10 点血量，最多饮用 3 次。",
    },
  },
];

const socketCountPipMap = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const loadoutSlotSocketCounts = {
  "head:脸部": 1,
  "head:护额": 2,
  "torso:肩膀": 4,
  "torso:前胸": 5,
  "torso:后背": 3,
  "torso:上臂": 2,
  "torso:脖子": 1,
  "pants:前腰": 1,
  "pants:后腰": 2,
  "pants:左腿": 3,
  "pants:右腰": 4,
  "pants:大腿": 6,
  "bracer:腕部": 2,
  "shoes:小腿前": 3,
  "shoes:小腿后": 4,
  "shoes:小腿侧": 5,
  "shoes:脚部": 1,
};

const armorStatProfiles = {
  head: { attack: 4, defense: 2, hp: 10 },
  torso: { attack: 0, defense: 10, hp: 35 },
  pants: { attack: 0, defense: 5, hp: 25 },
  bracer: { attack: 7, defense: 3, hp: 10 },
  shoes: { attack: 2, defense: 2, hp: 15 },
};

const armorFactorTypes = {
  resource: { label: "资源", short: "源", tone: "blue" },
  weapon: { label: "武装", short: "武", tone: "red" },
  assist: { label: "辅助", short: "辅", tone: "cyan" },
  survival: { label: "生存", short: "生", tone: "gold" },
};

const armorFactorSlots = {
  head: 0,
  bracer: 2,
  torso: 4,
  pants: 6,
  shoes: 8,
};

const armorFactorProfiles = {
  shura: {
    name: "修罗",
    head: "assist",
    torso: "resource",
    pants: "survival",
    bracer: "weapon",
    shoes: "assist",
  },
  guardian: {
    name: "岩铠",
    head: "survival",
    torso: "resource",
    pants: "survival",
    bracer: "weapon",
    shoes: "survival",
  },
  shadow: {
    name: "疾影",
    head: "assist",
    torso: "resource",
    pants: "assist",
    bracer: "weapon",
    shoes: "assist",
  },
  hunter: {
    name: "猎手",
    head: "assist",
    torso: "resource",
    pants: "survival",
    bracer: "weapon",
    shoes: "assist",
  },
};

const armorEnergyProfiles = {
  shura: {
    head: 3,
    torso: 6,
    pants: 4,
    bracer: 5,
    shoes: 3,
  },
  guardian: {
    head: 4,
    torso: 10,
    pants: 8,
    bracer: 8,
    shoes: 5,
  },
  shadow: {
    head: 3,
    torso: 4,
    pants: 5,
    bracer: 4,
    shoes: 6,
  },
  hunter: {
    head: 5,
    torso: 5,
    pants: 4,
    bracer: 6,
    shoes: 4,
  },
};

const armorFactorCatalog = [
  {
    id: "tech_focus",
    type: "assist",
    name: "弱点扫描",
    cost: 3,
    tier: "标准",
    effect: "标记裸露核心和可打断部位，提高应对效率。",
  },
  {
    id: "guard_core",
    type: "survival",
    name: "护盾核心",
    cost: 6,
    tier: "强化",
    effect: "提供护盾与抗打断收益，提高承压能力。",
  },
  {
    id: "agility_drive",
    type: "assist",
    name: "无人机链路",
    cost: 4,
    tier: "标准",
    effect: "强化协同攻击、追击和辅助判定。",
  },
  {
    id: "power_servo",
    type: "weapon",
    name: "破甲臂甲",
    cost: 5,
    tier: "强化",
    effect: "强化手部武装和破甲攻击收益。",
  },
  {
    id: "speed_joint",
    type: "assist",
    name: "机动喷口",
    cost: 3,
    tier: "标准",
    effect: "提高闪避、位移和行动窗口。",
  },
  {
    id: "burst_reactor",
    type: "resource",
    name: "胸口反应堆",
    cost: 10,
    tier: "高耗",
    effect: "提供高额能量，支持激光、喷气和无人机模块。",
  },
  {
    id: "soul_converter",
    type: "resource",
    name: "魂能转换器",
    cost: 8,
    tier: "高耗",
    effect: "提供魂能充能资源，强化灵魂战甲释放。",
  },
  {
    id: "light_weight",
    type: "survival",
    name: "应急酒囊",
    cost: 1,
    tier: "轻量",
    effect: "提供低占用续航模块，适合补足生存能力。",
  },
];

const defaultArmorFactorLoadout = {
  head: "tech_focus",
  torso: "burst_reactor",
  pants: "light_weight",
  bracer: "power_servo",
  shoes: "speed_joint",
};

const defaultArmorFactorBoardSlots = Object.fromEntries(
  Object.entries(armorFactorSlots).map(([partId, slotIndex]) => [
    slotIndex,
    defaultArmorFactorLoadout[partId],
  ]),
);

const armorFactorLineIndices = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const armorFactorLineRecipes = {
  "resource-resource-resource": {
    name: "补给循环",
    effect: "能量、弹药和充能类模块的供给效率提高。",
    statBonus: { technique: 0.6, burst: 0.6 },
  },
  "weapon-weapon-weapon": {
    name: "火力联动",
    effect: "武装模块伤害和破甲收益提高。",
    statBonus: { power: 1.2, burst: 0.8 },
  },
  "assist-assist-assist": {
    name: "协同网络",
    effect: "无人机、瞄准、打断提示和追击收益提高。",
    statBonus: { technique: 1.1, speed: 0.6 },
  },
  "survival-survival-survival": {
    name: "续航防线",
    effect: "护盾、回血、减伤和抗打断收益提高。",
    statBonus: { defense: 1.5 },
  },
};

const armorFactorBingoRewards = [
  {
    count: 1,
    title: "1 Bingo",
    effect: "激活首条模块连线，对应模块体系获得加成。",
  },
  {
    count: 3,
    title: "3 Bingo",
    effect: "模块形成稳定构型，战甲获得额外战术收益。",
  },
  {
    count: 5,
    title: "5 Bingo",
    effect: "形成完整改造体系，解锁高阶套装奖励。",
  },
];

const armorSkillProfiles = Object.fromEntries(
  loadoutParts.map((part) => {
    const stats = armorStatProfiles[part.id] || { attack: 0, defense: 0, hp: 0 };
    return [
      part.id,
      {
        name: `${part.label}属性`,
        targetParts: [],
        targetLabel: "自身",
        kind: "stat",
        kindLabel: "基础属性",
        statBonus: stats,
        damage: 0,
        armorDamage: 0,
        actionCost: 0,
        color: "#9aa8ba",
        desc: `${part.label}提供基础属性加成。`,
      },
    ];
  })
);

const accessorySkillProfiles = [
  {
    itemName: "无人机",
    sourceId: "accessory_drone",
    fallbackIcon: "机",
    role: "上臂挂件",
    skill: {
      id: "accessory_drone_support",
      name: "无人机协同",
      targetParts: ["core"],
      targetLabel: "胸部",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#58b7ff",
      summaryOverride: "拳套攻击躯干时概率协同",
      desc: "使用拳套攻击胸口核心时，无人机有概率从侧翼追加远程射击。",
      previewVideo: "./assets/videos/drone-accessory-effect-web.mp4",
      previewVideoLabel: "挂件功能预览",
    },
  },
  {
    itemName: "喷气式装置",
    sourceId: "accessory_jet",
    fallbackIcon: "喷",
    role: "肩膀挂件",
    skill: {
      id: "accessory_jet_boost",
      name: "喷气跃升",
      targetParts: ["arms"],
      targetLabel: "手部",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#ffb15f",
      summaryOverride: "近战攻击伤害 +50%",
      desc: "近战出手时点燃喷气装置，改变攻击表现并显著提高本次伤害。",
      previewVideo: "./assets/videos/jet-accessory-effect-web.mp4",
      previewVideoLabel: "挂件功能预览",
    },
  },
  {
    itemName: "酒葫芦",
    sourceId: "accessory_gourd",
    fallbackIcon: "葫",
    role: "前腰挂件",
    skill: {
      id: "accessory_gourd_heal",
      name: "烈酒回气",
      targetParts: ["core"],
      targetLabel: "自身",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#76d17b",
      summaryOverride: "回合开始 50% 概率回血",
      desc: "自己的回合开始时有概率饮酒恢复生命，最多触发三次。",
      previewVideo: "./assets/videos/gourd-heal.mp4",
      previewVideoLabel: "挂件功能预览",
    },
  },
  {
    itemName: "箭袋",
    sourceId: "accessory_quiver",
    fallbackIcon: "箭",
    role: "后背挂件",
    skill: {
      id: "accessory_quiver_pierce",
      name: "穿甲箭备装",
      targetParts: ["arms"],
      targetLabel: "手部",
      kind: "accessory",
      kindLabel: "挂件",
      armorBreaker: true,
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#9ed5ff",
      summaryOverride: "穿臂箭获得强化破甲",
      desc: "装备箭袋后，原有穿臂箭获得更高破甲收益，更适合击穿手部硬甲。",
    },
  },
  {
    itemName: "戒律圆徽",
    sourceId: "accessory_sigils",
    fallbackIcon: "徽",
    role: "暂定挂件位",
    skill: {
      id: "accessory_sigils_tune",
      name: "魂能调律",
      targetParts: ["core"],
      targetLabel: "胸部",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#d8b4ff",
      summaryOverride: "提高灵魂战甲充能效率",
      desc: "暂定第五挂件位，用于表达后续可扩展的灵魂战甲充能流派。",
    },
  },
];

const loadoutFocusMap = {
  脸部: "head",
  护额: "head",
  肩膀: "torso",
  前胸: "torso",
  后背: "back",
  上臂: "arm",
  脖子: "head",
  前腰: "waist",
  后腰: "waist",
  左腿: "leg",
  右腰: "waist",
  大腿: "leg",
  腕部: "arm",
  小腿前: "leg",
  小腿后: "leg",
  小腿侧: "leg",
  脚部: "foot",
};

function initializeDefaultLoadout() {
  loadoutParts.forEach((part) => {
    const item = attachmentOptions.find((option) => option.name === part.defaultItem);
    if (item) {
      loadoutState.equipped[`${part.id}:base`] = item;
    }
  });
  const drone = attachmentOptions.find((option) => option.name === "无人机");
  const quiver = attachmentOptions.find((option) => option.name === "箭袋");
  const jet = attachmentOptions.find((option) => option.name === "喷气式装置");
  const gourd = attachmentOptions.find((option) => option.name === "酒葫芦");
  if (drone) loadoutState.equipped["torso:上臂"] = drone;
  if (quiver) loadoutState.equipped["torso:后背"] = quiver;
  if (jet) loadoutState.equipped["torso:肩膀"] = jet;
  if (gourd) loadoutState.equipped["pants:前腰"] = gourd;
}

function isBossUnlocked(boss) {
  return boss && !boss.locked;
}

function isWeaponUnlocked(weapon) {
  return weapon && !weapon.locked;
}

function currentBossBlueprint() {
  return bossBlueprints.find((boss) => boss.id === loadoutState.selectedBossId && isBossUnlocked(boss))
    || bossBlueprints.find(isBossUnlocked)
    || bossBlueprints[0];
}

function carriedWeapons() {
  const selected = loadoutState.selectedWeaponIds || [];
  const ordered = selected.map((id) => weapons.find((weapon) => weapon.id === id && isWeaponUnlocked(weapon))).filter(Boolean);
  return ordered.length ? ordered : weapons.filter(isWeaponUnlocked).slice(0, 1);
}

function weaponSkillPool(weaponId) {
  return skills
    .filter((skill) => skill.weaponId === weaponId)
    .sort((a, b) => (a.actionCost || 0) - (b.actionCost || 0) || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function ensureWeaponSkillLoadout() {
  if (!loadoutState.weaponSkillLoadout) loadoutState.weaponSkillLoadout = {};
  weapons.filter(isWeaponUnlocked).forEach((weapon) => {
    const validIds = weaponSkillPool(weapon.id).map((skill) => skill.id);
    const current = Array.isArray(loadoutState.weaponSkillLoadout[weapon.id])
      ? loadoutState.weaponSkillLoadout[weapon.id].filter((id) => validIds.includes(id))
      : validIds.slice(0, WEAPON_SKILL_SLOT_COUNT);
    loadoutState.weaponSkillLoadout[weapon.id] = current.slice(0, WEAPON_SKILL_SLOT_COUNT);
  });
}

function configuredWeaponSkillIds(weaponId) {
  ensureWeaponSkillLoadout();
  return loadoutState.weaponSkillLoadout[weaponId] || [];
}

function configuredWeaponSkills(weaponId) {
  const equippedIds = configuredWeaponSkillIds(weaponId);
  const pool = weaponSkillPool(weaponId);
  return equippedIds
    .map((id) => pool.find((skill) => skill.id === id))
    .filter(Boolean)
    .sort((a, b) => (a.actionCost || 0) - (b.actionCost || 0) || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function availableWeaponSkills(weaponId) {
  const equipped = new Set(configuredWeaponSkillIds(weaponId));
  return weaponSkillPool(weaponId).filter((skill) => !equipped.has(skill.id));
}

function equipSkillToWeapon(weaponId, skillId) {
  ensureWeaponSkillLoadout();
  const pool = weaponSkillPool(weaponId);
  if (!pool.some((skill) => skill.id === skillId)) return;
  const current = configuredWeaponSkillIds(weaponId);
  if (current.includes(skillId) || current.length >= WEAPON_SKILL_SLOT_COUNT) return;
  loadoutState.weaponSkillLoadout[weaponId] = [...current, skillId];
  loadoutState.activeWeaponDetailId = weaponId;
  loadoutState.weaponDetailOpen = true;
  loadoutState.weaponSkillPickerOpen = false;
  renderPrebattleWeapons();
}

function unequipSkillFromWeapon(weaponId, skillId) {
  ensureWeaponSkillLoadout();
  const current = configuredWeaponSkillIds(weaponId);
  if (!current.includes(skillId)) return;
  loadoutState.weaponSkillLoadout[weaponId] = current.filter((id) => id !== skillId);
  loadoutState.activeWeaponDetailId = weaponId;
  loadoutState.weaponDetailOpen = true;
  loadoutState.weaponSkillPickerOpen = false;
  renderPrebattleWeapons();
}

function equippedArmorStats() {
  return loadoutParts.reduce(
    (total, part) => {
      const hasBaseArmor = Boolean(loadoutState.equipped[`${part.id}:base`]);
      if (!hasBaseArmor) return total;
      const stats = armorStatProfiles[part.id] || {};
      total.attack += stats.attack || 0;
      total.defense += stats.defense || 0;
      total.hp += stats.hp || 0;
      return total;
    },
    { attack: 0, defense: 0, hp: 0 }
  );
}

function clampPercent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function renderMeter(label, value, max, className = "") {
  const percent = clampPercent(value, max);
  return `
    <div class="ui-meter ${className}" style="--meter-value:${percent}%">
      <span><b>${label}</b><em>${value} / ${max}</em></span>
      <i><u></u></i>
    </div>
  `;
}

function renderEnergyDots(value, max, className = "") {
  const total = Math.max(1, Math.min(12, Number(max) || 1));
  const filled = Math.max(0, Math.min(total, Math.round((Number(value) || 0) / Math.max(1, Number(max) || 1) * total)));
  return `
    <span class="energy-dot-row ${className}" aria-hidden="true">
      ${Array.from({ length: total }, (_, index) => `<i${index < filled ? " class=\"filled\"" : ""}></i>`).join("")}
    </span>
  `;
}

function renderFactorCostBadge(cost, className = "") {
  return `<em class="factor-cost-badge ${className}">占用 ${cost}</em>`;
}

function isWeaponCarried(weaponId) {
  return carriedWeapons().some((weapon) => weapon.id === weaponId);
}

function toggleLoadoutWeapon(weaponId) {
  const targetWeapon = weapons.find((weapon) => weapon.id === weaponId);
  if (!isWeaponUnlocked(targetWeapon)) return;
  const selected = [...(loadoutState.selectedWeaponIds || [])];
  const slotIndex = Math.max(0, Math.min(1, loadoutState.activeWeaponSlot || 0));
  while (selected.length < 2) {
    const fallback = weapons.find((weapon) => isWeaponUnlocked(weapon) && !selected.includes(weapon.id));
    selected.push(fallback?.id || weapons.find(isWeaponUnlocked)?.id || weapons[0].id);
  }
  if (selected[slotIndex] === weaponId) {
    return;
  }
  const existingIndex = selected.findIndex((id, index) => id === weaponId && index !== slotIndex);
  if (existingIndex >= 0) {
    const previous = selected[slotIndex];
    selected[slotIndex] = weaponId;
    selected[existingIndex] = previous;
  } else {
    selected[slotIndex] = weaponId;
  }
  loadoutState.selectedWeaponIds = selected.slice(0, 2);
  loadoutState.activeWeaponDetailId = weaponId;
  loadoutState.weaponSkillPickerOpen = false;
  if (loadoutState.prebattleStep === "weapons") {
    renderPrebattleWeapons();
  } else {
    renderPrebattleLoadout();
  }
}

function removeLoadoutWeapon(weaponId) {
  const selected = [...(loadoutState.selectedWeaponIds || [])];
  const equippedIndex = selected.indexOf(weaponId);
  if (equippedIndex < 0) return;
  selected.splice(equippedIndex, 1);
  loadoutState.selectedWeaponIds = selected;
  loadoutState.activeWeaponSlot = Math.min(equippedIndex, Math.max(0, selected.length - 1));
  loadoutState.activeWeaponDetailId = weaponId;
  loadoutState.weaponSkillPickerOpen = false;
  renderPrebattleWeapons();
}

function createState() {
  const boss = currentBossBlueprint();
  const equippedWeapons = carriedWeapons();
  const armorStats = equippedArmorStats();
  const playerMaxHp = 220 + armorStats.hp;
  const parts = partBlueprint.map((part) => ({
    ...part,
    hp: part.maxHp,
    armorValue: part.maxArmor,
    armorState: part.armor,
    broken: false,
  }));

  return {
    phase: "玩家回合准备",
    turn: "player_start",
    round: 1,
    selectedWeaponId: equippedWeapons[0]?.id || weapons[0].id,
    player: {
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      attack: armorStats.attack,
      defense: armorStats.defense,
      soul: 0,
      ammo: 10,
      maxAmmo: 10,
      action: 4,
      maxAction: 7,
      gourdUses: 0,
      guardCounterChance: 0,
      nextDamageBonus: 0,
    },
    enemy: {
      bossId: boss.id,
      name: boss.name,
      hp: parts.reduce((sum, part) => sum + part.hp, 0),
      maxHp: parts.reduce((sum, part) => sum + part.maxHp, 0),
      stage: 1,
      intent: null,
      attackIndex: 0,
      pendingAttack: null,
      skippedAttackNotices: [],
      extraDamage: 0,
      aoeHpCompensation: 0,
      parts,
    },
    activeSkill: null,
    activeTarget: null,
    soulTargetSelection: null,
    soulChargeDots: 0,
    reactionTimer: 0,
    reactionDuration: 2.25,
    videoAttack: null,
    skillCinematic: null,
    qte: null,
    pendingWeakpointWarning: false,
    pendingHandWarning: false,
    playerHitFlashTimer: 0,
    weakpointTipTimer: 1.5,
    actionAnimTimer: 0,
    log: [],
    result: null,
    time: 0,
  };
}

function resetGame() {
  hideVideoOverlay();
  state = createState();
  const boss = currentBossBlueprint();
  const weaponNames = carriedWeapons().map((weapon) => weapon.name).join(" / ");
  const armorStats = equippedArmorStats();
  floaters = [];
  playerHitFloaters = [];
  buildWeaponControls();
  buildSkillControls();
  buildSoulSkillControls();
  updatePlayerSpriteForWeapon();
  renderWeaponToggle();
  showWeakpointTip(boss.startTip || "胸口核心已暴露，优先攻击弱点。", 1.5);
  log(`挑战开始：${boss.name}。${boss.summary}`);
  log(`携带武器：${weaponNames}。`);
  log(`战甲属性：攻击 +${armorStats.attack} / 防御 +${armorStats.defense} / 生命 +${armorStats.hp}。`);
  beginPlayerTurn({ initial: true });
}

function loadoutNavigationItems() {
  return loadoutParts;
}

function renderArmorEnergyBadge(part, item) {
  const currentItem = equippedArmorItemForPart(part);
  const currentCapacity = armorEnergyCapacityForItem(part, currentItem);
  const nextCapacity = armorEnergyCapacityForItem(part, item);
  const delta = nextCapacity - currentCapacity;
  const deltaText = delta === 0 ? "±0" : delta > 0 ? `+${delta}` : `${delta}`;
  const deltaClass = delta > 0 ? "up" : delta < 0 ? "down" : "same";
  return `
    <em class="attachment-energy ${deltaClass}">
      战甲能量 ${nextCapacity}
      <b>${deltaText}</b>
    </em>
  `;
}

function renderArmorMountSpec(activePart, item) {
  const capacity = armorEnergyCapacityForItem(activePart, item);
  const slots = activePart.slots || [];
  const slotSamples = slots.slice(0, 5);
  const totalSocketCount = slots.reduce((sum, slot) => sum + getLoadoutSlotSocketCount(activePart.id, slot), 0);
  const maxSocketCount = slots.reduce((max, slot) => Math.max(max, getLoadoutSlotSocketCount(activePart.id, slot)), 0);
  return `
    <div class="armor-mount-spec" aria-label="${item.name}挂载规则">
      <span>
        <b>挂载部位</b>
        <em>${slotSamples.join(" / ")}${slots.length > slotSamples.length ? " ..." : ""}</em>
      </span>
      <span>
        <b>孔位制式</b>
        <em>${slots.length}槽 / 最高${maxSocketCount}孔</em>
      </span>
      <span>
        <b>战甲能量</b>
        <em>${capacity}</em>
      </span>
      <small>该部位共提供 ${totalSocketCount} 个挂载孔。孔位越多，可兼容越大的挂件；战甲能量用于驱动挂件和模组。</small>
    </div>
  `;
}

function renderArmorStatMeter(label, value, max, className) {
  return renderMeter(label, value, max, `armor-stat-meter ${className}`);
}

function renderArmorStatChip(label, value, max, className) {
  return `
    <div class="armor-stat-chip ${className}" style="--stat-value:${clampPercent(value, max)}%">
      <span>${label}</span>
      <strong>+${value}</strong>
      <i><u></u></i>
    </div>
  `;
}

function openArmorEnergyBoard(partId = "") {
  const targetPartId = partId || loadoutState.activePartId || "head";
  loadoutState.activePartId = targetPartId;
  loadoutState.activeArmorFactorSlot = armorFactorSlots[targetPartId] ?? 0;
  loadoutState.armorFactorPickerOpen = false;
  setPrebattleStep("armorBoard");
}

function renderLoadoutArmorSummary(activePart) {
  const panel = document.getElementById("loadoutArmorSummary");
  if (!panel) return;
  const board = buildArmorFactorBoard();
  panel.innerHTML = `
    <div class="armor-energy-hud">
      <button class="armor-board-open armor-board-open-minimal" type="button" data-open-armor-energy-board aria-label="打开战甲能量盘" title="打开战甲能量盘">
        <img src="./assets/armor-shield.png" alt="" />
      </button>
      <i class="armor-energy-bar" style="--energy-value:${clampPercent(board.capacityUsed, board.capacityTotal)}%">
        <u></u>
        <strong class="armor-energy-value">${board.capacityUsed}<b>/ ${board.capacityTotal}</b></strong>
      </i>
    </div>
  `;
  panel.querySelector("[data-open-armor-energy-board]")?.addEventListener("click", () => {
    openArmorEnergyBoard(activePart.id);
  });
}

function renderPrebattleLoadout() {
  const partNav = document.getElementById("loadoutParts");
  const slotsEl = document.getElementById("attachmentSlots");
  const itemsEl = document.getElementById("attachmentItems");
  const titleEl = document.getElementById("attachmentTitle");
  if (!partNav || !slotsEl || !itemsEl || !titleEl) return;

  renderPrebattleFlow();
  renderBossSelection();

  const navItems = loadoutNavigationItems();
  let activeTab = navItems.find((part) => part.id === loadoutState.activePartId) || loadoutParts[0];
  const activePart = loadoutParts.find((part) => part.id === activeTab.id) || loadoutParts[0];
  if (loadoutState.activeSlot !== "base" && !activePart.slots.includes(loadoutState.activeSlot)) {
    loadoutState.activeSlot = activePart.slots[0];
  }
  renderLoadoutArmorSummary(activePart);

  partNav.innerHTML = "";
  navItems.forEach((part) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `loadout-part-button${part.id === activeTab.id ? " active" : ""}`;
    button.dataset.part = part.id;
    button.innerHTML = `<span class="loadout-part-icon">${part.icon}</span><span>${part.label}</span>`;
    button.addEventListener("click", () => {
      loadoutState.activePartId = part.id;
      loadoutState.activeSlot = "base";
      loadoutState.isFocusing = false;
      hideLoadoutTacticalInfo();
      renderPrebattleLoadout();
    });
    partNav.appendChild(button);
  });

  itemsEl.classList.remove("weapon-selection-grid", "armor-base-list");
  itemsEl.classList.toggle("armor-base-list", loadoutState.activeSlot === "base");

  slotsEl.innerHTML = "";
  activePart.slots.forEach((slot) => {
    const key = `${activePart.id}:${slot}`;
    const equipped = loadoutState.equipped[key];
    const slotEl = document.createElement("button");
    slotEl.type = "button";
    const isFixedGourdSlot = activePart.id === "pants" && slot === "前腰";
    slotEl.className = `attachment-slot${slot === loadoutState.activeSlot ? " active" : ""}${isFixedGourdSlot ? " fixed-gourd" : ""}`;
    slotEl.dataset.slotKey = key;
    const slotSocketCount = getLoadoutSlotSocketCount(activePart.id, slot);
    slotEl.innerHTML = `
      <span class="attachment-slot-head">
        <b>${slot}</b>
        ${renderSocketCountMark(slotSocketCount, "slot-socket-marks")}
      </span>
      <span class="attachment-slot-box${equipped ? " equipped" : ""}">
        ${renderLoadoutItemPreview(equipped, "+")}
        ${equipped ? renderSocketCountMark(getLoadoutItemSocketCount(equipped), "equipped-socket-marks") : ""}
      </span>
    `;
    slotEl.addEventListener("click", () => {
      loadoutState.activeSlot = slot;
      loadoutState.isFocusing = true;
      renderPrebattleLoadout();
      const currentSlot = findLoadoutSlotButton(key);
      if (equipped?.tacticalInfo) {
        showLoadoutTacticalInfo(equipped, currentSlot);
      } else {
        hideLoadoutTacticalInfo();
      }
    });
    slotsEl.appendChild(slotEl);
  });

  updateLoadoutFocus(activePart);
  titleEl.textContent = loadoutState.activeSlot === "base" ? `选择基础装备：${activePart.label}` : `装配挂件：${activePart.label} / ${loadoutState.activeSlot}`;
  itemsEl.innerHTML = "";
  getLoadoutOptions(activePart, loadoutState.activeSlot).forEach((item) => {
    const key = `${activePart.id}:${loadoutState.activeSlot}`;
    const active = loadoutState.equipped[key]?.name === item.name;
    const compatible = loadoutState.activeSlot === "base" || isLoadoutItemSocketCompatible(activePart, loadoutState.activeSlot, item);
    const card = document.createElement("button");
    const isBaseSelection = loadoutState.activeSlot === "base";
    card.type = "button";
    card.className = `attachment-card${isBaseSelection ? " armor-base-card" : ""}${active ? " active" : ""}${compatible ? "" : " incompatible"}`;
    card.dataset.itemName = item.name;
    card.disabled = !compatible && !active;
    card.innerHTML = isBaseSelection ? `
      <span class="attachment-card-preview armor-base-preview">
        ${renderLoadoutItemPreview(item, item.icon)}
      </span>
      <span class="armor-base-name">${item.name}</span>
    ` : `
      <span class="attachment-card-preview">
        ${renderLoadoutItemPreview(item, item.icon)}
        ${renderSocketCountMark(getLoadoutItemSocketCount(item), "card-socket-marks")}
      </span>
      <span>${item.name}</span>
      <small>${item.trait}</small>
      ${compatible ? "" : "<em class=\"socket-mismatch\">孔位不匹配</em>"}
    `;
    card.addEventListener("click", () => {
      if (!compatible && !active) return;
      loadoutState.equipped[key] = item;
      renderPrebattleLoadout();
      if (item.tacticalInfo) {
        showLoadoutTacticalInfo(item, findLoadoutSlotButton(key));
      } else {
        hideLoadoutTacticalInfo();
      }
    });
    itemsEl.appendChild(card);
  });
  if (!itemsEl.children.length) {
    const empty = document.createElement("p");
    empty.className = "attachment-empty";
    empty.textContent = "该槽位暂无可装配挂件";
    itemsEl.appendChild(empty);
  }
  updateEnterBattleState();
}

function renderWeaponLoadoutTab(slotsEl, itemsEl, titleEl) {
  const selected = loadoutState.selectedWeaponIds || [];
  const activeSlot = Math.max(0, Math.min(1, loadoutState.activeWeaponSlot || 0));
  titleEl.textContent = `选择携带武器：${weaponLoadoutSlots[activeSlot].label}`;
  slotsEl.innerHTML = "";
  weaponLoadoutSlots.forEach((slot, index) => {
    const weapon = weapons.find((item) => item.id === selected[index]);
    const slotEl = document.createElement("button");
    slotEl.type = "button";
    slotEl.className = `attachment-slot weapon-carry-slot${index === activeSlot ? " active" : ""}`;
    slotEl.dataset.weaponSlot = slot.id;
    slotEl.innerHTML = `
      <span>${slot.label}</span>
      <span class="attachment-slot-box${weapon ? " equipped" : ""}">
        ${renderWeaponPreview(weapon, "+")}
      </span>
    `;
    slotEl.addEventListener("click", () => {
      loadoutState.activeWeaponSlot = index;
      renderPrebattleLoadout();
    });
    slotsEl.appendChild(slotEl);
  });
  itemsEl.innerHTML = "";
  weapons.forEach((weapon) => {
    const equippedIndex = selected.indexOf(weapon.id);
    const active = selected[activeSlot] === weapon.id;
    const locked = !isWeaponUnlocked(weapon);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `loadout-weapon-card${active ? " active" : ""}${equippedIndex >= 0 && !active ? " in-other-slot" : ""}${locked ? " locked" : ""}`;
    button.dataset.weapon = weapon.id;
    button.disabled = locked;
    button.innerHTML = `
      <span class="loadout-weapon-icon">
        ${renderWeaponPreview(weapon, weapon.short)}
      </span>
      <span>
        <strong>${weapon.name}</strong>
        <small>${weapon.role}</small>
        ${locked ? "<em>未解锁</em>" : equippedIndex >= 0 && !active ? `<em>已装入${weaponLoadoutSlots[equippedIndex].label}</em>` : ""}
      </span>
    `;
    button.addEventListener("click", () => toggleLoadoutWeapon(weapon.id));
    itemsEl.appendChild(button);
  });
}

function renderWeaponPreview(weapon, fallback) {
  if (weapon?.icon) return `<img src="${weapon.icon}" alt="${weapon.name}" />`;
  return `<strong>${weapon?.short || fallback}</strong>`;
}

function renderWeaponSkillTags(skill) {
  const tags = [];
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  if (skill.kindLabel) tags.push(skill.kindLabel);
  return tags.map((tag) => `<i class="${skillTagClass(tag)}">${tag}</i>`).join("");
}

function renderWeaponSkillCard(skill, weaponId, mode = "equipped", slotIndex = 0) {
  if (!skill) {
    return `
      <button class="weapon-skill-slot empty" type="button" data-open-skill-picker="${weaponId}" data-skill-slot="${slotIndex}">
        <b>+</b>
        <span>空技能槽</span>
        <small>点击选择技能</small>
      </button>
    `;
  }
  return `
    <article class="weapon-skill-slot ${mode}">
      <span class="weapon-skill-target${skill.targetParts.length > 1 ? " multi" : ""}" style="--skill-color:${skill.color}">
        ${renderPartIconGroup(skill.targetParts || [], "badge")}
      </span>
      <span class="weapon-skill-copy">
        <span class="weapon-skill-title-line">
          <strong>${skill.name}</strong>
          <em class="weapon-skill-cost">${skill.actionCost > 0 ? `行动力 ${skill.actionCost}` : "0费"}</em>
        </span>
        <span class="weapon-skill-tag-row">${renderWeaponSkillTags(skill)}</span>
        <small>${skill.desc} ${skillSummaryText(skill)}</small>
      </span>
      ${mode === "equipped"
        ? `<button class="weapon-skill-remove" type="button" data-remove-skill="${skill.id}" data-weapon="${weaponId}" aria-label="卸下${skill.name}">卸下</button>`
        : `<button class="weapon-skill-equip" type="button" data-equip-skill="${skill.id}" data-weapon="${weaponId}" aria-label="装配${skill.name}">装配</button>`}
    </article>
  `;
}

function renderWeaponSkillPicker(weapon) {
  const equippedCount = configuredWeaponSkillIds(weapon.id).length;
  const available = availableWeaponSkills(weapon.id);
  if (!loadoutState.weaponSkillPickerOpen || equippedCount >= WEAPON_SKILL_SLOT_COUNT) return "";
  const slotIndex = Math.max(0, Math.min(WEAPON_SKILL_SLOT_COUNT - 1, Number(loadoutState.activeWeaponSkillSlot) || equippedCount));
  return `
    <section class="weapon-skill-picker-panel" role="dialog" aria-label="选择武器技能">
      <div class="weapon-detail-section-head">
        <strong>选择技能</strong>
        <small>技能槽 ${slotIndex + 1}</small>
        <button class="weapon-skill-picker-close" type="button" data-close-skill-picker aria-label="关闭技能选择">×</button>
      </div>
      <div class="weapon-skill-candidates">
        ${available.length
          ? available.map((skill) => renderWeaponSkillCard(skill, weapon.id, "candidate")).join("")
          : `<p>当前没有未装配技能。</p>`}
      </div>
    </section>
  `;
}

function renderWeaponDetailPanel(weapon) {
  if (!ui.weaponDetailPanel || !weapon) return;
  const shouldShow = loadoutState.weaponDetailOpen && isWeaponUnlocked(weapon);
  ui.weaponDetailPanel.classList.toggle("open", shouldShow);
  ui.prebattleScreen?.classList.toggle("weapon-detail-open", shouldShow);
  if (!shouldShow) {
    ui.weaponDetailPanel.innerHTML = "";
    return;
  }
  ensureWeaponSkillLoadout();
  const selected = loadoutState.selectedWeaponIds || [];
  const activeSlot = Math.max(0, Math.min(1, loadoutState.activeWeaponSlot || 0));
  const equippedIndex = selected.indexOf(weapon.id);
  const equippedSkills = configuredWeaponSkills(weapon.id);
  const skillSlots = Array.from({ length: WEAPON_SKILL_SLOT_COUNT }, (_, index) => equippedSkills[index] || null);
  const locked = !isWeaponUnlocked(weapon);
  if (equippedSkills.length >= WEAPON_SKILL_SLOT_COUNT) {
    loadoutState.weaponSkillPickerOpen = false;
  }
  ui.weaponDetailPanel.innerHTML = `
    <header class="weapon-detail-head">
      <span class="weapon-detail-icon">${renderWeaponPreview(weapon, weapon.short)}</span>
      <span>
        <small>${equippedIndex >= 0 ? `已装配：${weaponLoadoutSlots[equippedIndex]?.label || "武器槽"}` : "未装配"}</small>
        <strong>${weapon.name}</strong>
        <em>${weapon.role}</em>
      </span>
    </header>

    <section class="weapon-detail-skills">
      <div class="weapon-skill-equipped-list">
        ${skillSlots.map((skill, index) => renderWeaponSkillCard(skill, weapon.id, "equipped", index)).join("")}
      </div>
      ${renderWeaponSkillPicker(weapon)}
    </section>

    <footer class="weapon-detail-actions">
      <button class="weapon-detail-equip" type="button" data-equip-weapon="${weapon.id}" ${locked || selected[activeSlot] === weapon.id ? "disabled" : ""}>
        装配到${weaponLoadoutSlots[activeSlot].label}
      </button>
      <button class="weapon-detail-remove" type="button" data-remove-weapon="${weapon.id}" ${equippedIndex < 0 ? "disabled" : ""}>
        卸下
      </button>
    </footer>
  `;

  ui.weaponDetailPanel.querySelectorAll("[data-open-skill-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.activeWeaponDetailId = button.dataset.openSkillPicker;
      loadoutState.activeWeaponSkillSlot = Number(button.dataset.skillSlot) || 0;
      loadoutState.weaponDetailOpen = true;
      loadoutState.weaponSkillPickerOpen = true;
      renderPrebattleWeapons();
    });
  });
  ui.weaponDetailPanel.querySelector("[data-close-skill-picker]")?.addEventListener("click", () => {
    loadoutState.weaponSkillPickerOpen = false;
    renderPrebattleWeapons();
  });
  ui.weaponDetailPanel.querySelectorAll("[data-equip-skill]").forEach((button) => {
    button.addEventListener("click", () => equipSkillToWeapon(button.dataset.weapon, button.dataset.equipSkill));
  });
  ui.weaponDetailPanel.querySelectorAll("[data-remove-skill]").forEach((button) => {
    button.addEventListener("click", () => unequipSkillFromWeapon(button.dataset.weapon, button.dataset.removeSkill));
  });
  ui.weaponDetailPanel.querySelector("[data-equip-weapon]")?.addEventListener("click", () => toggleLoadoutWeapon(weapon.id));
  ui.weaponDetailPanel.querySelector("[data-remove-weapon]")?.addEventListener("click", () => removeLoadoutWeapon(weapon.id));
}

function renderPrebattleWeapons() {
  if (!ui.weaponCarrySlots || !ui.weaponGallery) return;
  ensureWeaponSkillLoadout();
  renderPrebattleFlow();
  updateEnterBattleState();
  const selected = loadoutState.selectedWeaponIds || [];
  const activeSlot = Math.max(0, Math.min(1, loadoutState.activeWeaponSlot || 0));
  const detailWeapon = weapons.find((weapon) => weapon.id === loadoutState.activeWeaponDetailId)
    || weapons.find((weapon) => weapon.id === selected[activeSlot])
    || weapons.find(isWeaponUnlocked)
    || weapons[0];
  loadoutState.activeWeaponDetailId = detailWeapon?.id || "";
  if (ui.weaponSelectionTitle) {
    ui.weaponSelectionTitle.textContent = `当前装配槽：${weaponLoadoutSlots[activeSlot].label}`;
  }

  ui.weaponCarrySlots.innerHTML = "";
  weaponLoadoutSlots.forEach((slot, index) => {
    const weapon = weapons.find((item) => item.id === selected[index]);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `weapon-carry-card${index === activeSlot ? " active" : ""}`;
    button.dataset.weaponSlot = slot.id;
    button.innerHTML = `
      <span>${slot.label}</span>
      <span class="weapon-carry-box${weapon ? " equipped" : ""}">
        ${renderWeaponPreview(weapon, "+")}
      </span>
    `;
    button.addEventListener("click", () => {
      loadoutState.activeWeaponSlot = index;
      if (weapon) loadoutState.activeWeaponDetailId = weapon.id;
      loadoutState.weaponDetailOpen = Boolean(weapon);
      loadoutState.weaponSkillPickerOpen = false;
      renderPrebattleWeapons();
    });
    ui.weaponCarrySlots.appendChild(button);
  });

  ui.weaponGallery.innerHTML = "";
  weapons.forEach((weapon) => {
    const equippedIndex = selected.indexOf(weapon.id);
    const active = selected[activeSlot] === weapon.id;
    const locked = !isWeaponUnlocked(weapon);
    const statusLabel = locked ? "未解锁" : "";
    const card = document.createElement("button");
    card.type = "button";
    card.className = `weapon-gallery-card${weapon.id === detailWeapon.id ? " active" : ""}${equippedIndex >= 0 ? " equipped" : ""}${locked ? " locked" : ""}`;
    card.disabled = locked;
    card.dataset.weapon = weapon.id;
    card.innerHTML = `
      <span class="weapon-gallery-art">${renderWeaponPreview(weapon, weapon.short)}</span>
      <span class="weapon-gallery-name">${weapon.name}</span>
      <small>${statusLabel || (equippedIndex >= 0 ? `已装配：${weaponLoadoutSlots[equippedIndex]?.label}` : weapon.role)}</small>
    `;
    card.addEventListener("click", () => {
      loadoutState.activeWeaponDetailId = weapon.id;
      loadoutState.weaponDetailOpen = true;
      loadoutState.weaponSkillPickerOpen = false;
      renderPrebattleWeapons();
    });
    ui.weaponGallery.appendChild(card);
  });

  renderWeaponDetailPanel(detailWeapon);
}

function renderBossTrendIcon(trend) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "–";
}

function renderBossTendencies(items = []) {
  return items
    .map((item) => `
      <span class="boss-tendency ${item.trend || "flat"}">
        <b>${item.label}</b>
        <em>${item.value}</em>
        <i>${renderBossTrendIcon(item.trend)}</i>
      </span>
    `)
    .join("");
}

function renderBossScale(value = 0, max = 10) {
  const filled = Math.max(0, Math.min(max, value));
  return Array.from({ length: max }, (_, index) => `<i${index < filled ? " class=\"filled\"" : ""}></i>`).join("");
}

function renderBossAbilityProfile(items = []) {
  return items
    .map((item) => `
      <div class="boss-ability-row">
        <span>${item.label}</span>
        <b>${renderBossScale(item.value)}</b>
      </div>
    `)
    .join("");
}

function bossPartIntelTagTone(label = "") {
  if (/弱点|裸露|核心/.test(label)) return "weak";
  if (/硬甲|护甲/.test(label)) return "armor";
  if (/投石|大招|高威胁|不可/.test(label)) return "danger";
  if (/打断|中断/.test(label)) return "interrupt";
  if (/支撑|稳定|压制/.test(label)) return "control";
  if (/未知|未披露|不明/.test(label)) return "unknown";
  return "neutral";
}

function renderBossPartIntelTags(item = {}) {
  const tags = item.tags?.length
    ? item.tags
    : String(item.state || "")
      .split(/[\/、,，]/)
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({ label, tone: bossPartIntelTagTone(label) }));
  return tags
    .map((tag) => `<em class="boss-intel-tag tone-${tag.tone || bossPartIntelTagTone(tag.label)}">${tag.label}</em>`)
    .join("");
}

function renderBossPartIntel(items = [], mysteries = []) {
  const knownRows = items
    .map((item) => {
      const part = item.partId ? partIconInfo(item.partId) : null;
      const icon = part ? `<img src="${part.src}" alt="${part.label}" />` : "?";
      return `
        <article class="boss-part-row">
          <span class="boss-part-name">
            <span class="boss-part-icon">${icon}</span>
            <strong>${item.label}</strong>
          </span>
          <span class="boss-part-advice">
            <span class="boss-intel-tags">${renderBossPartIntelTags(item)}</span>
            <small>${item.hint}</small>
          </span>
        </article>
      `;
    })
    .join("");
  const hiddenRows = (mysteries || [])
    .map((label) => `
      <article class="boss-part-row mystery-note">
        <span class="boss-part-name">
          <span class="boss-part-icon">?</span>
          <strong>未披露</strong>
        </span>
        <span class="boss-part-advice">
          <span class="boss-intel-tags"><em class="boss-intel-tag tone-unknown">未知情报</em></span>
          <small>${label}</small>
        </span>
      </article>
    `)
    .join("");
  return `
    <div class="boss-part-table">
      <div class="boss-part-table-head">
        <span>部位</span>
        <span>情报与应对</span>
      </div>
      ${knownRows}${hiddenRows}
    </div>
  `;
}

function renderBossSelection() {
  if (!ui.bossCards || !ui.bossIntel) return;
  const boss = currentBossBlueprint();
  ui.bossCards.innerHTML = "";
  bossBlueprints.forEach((item) => {
    const locked = !isBossUnlocked(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `boss-card-button${item.id === boss.id ? " active" : ""}${locked ? " locked" : ""}`;
    button.dataset.boss = item.id;
    button.disabled = locked;
    button.innerHTML = `
      <span class="boss-card-art">${item.image ? `<img src="${item.image}" alt="${item.name}" />` : `<strong>${item.short || "?"}</strong>`}</span>
      <span class="boss-card-copy">
        <strong>${item.name}</strong>
        <small>${item.title}</small>
        <em>${locked ? "未开放" : item.threatLevel}</em>
      </span>
    `;
    if (!locked) {
      button.addEventListener("click", () => {
        loadoutState.selectedBossId = item.id;
        renderPrebattleLoadout();
      });
    }
    ui.bossCards.appendChild(button);
  });
  ui.bossIntel.innerHTML = `
    <div class="boss-bestiary">
      <div class="boss-bestiary-copy">
        <span class="boss-bestiary-kicker">${boss.habitat || boss.title}</span>
        <h2>${boss.name}</h2>
        <section class="boss-note-panel compact">
          <strong>属性倾向</strong>
          <div class="boss-tendency-grid">${renderBossTendencies(boss.attributeTendencies)}</div>
        </section>
        <section class="boss-note-panel compact boss-ability-panel">
          <strong>能力倾向</strong>
          <div class="boss-ability-list">${renderBossAbilityProfile(boss.abilityProfile)}</div>
        </section>
      </div>
      <div class="boss-bestiary-art">
        <img src="${boss.image}" alt="${boss.name}" />
      </div>
      <aside class="boss-bestiary-danger">
        <section class="boss-part-notes">
          <strong>形态·部位信息</strong>
          <div class="boss-part-list">${renderBossPartIntel(boss.partIntel, boss.mysteries)}</div>
        </section>
      </aside>
    </div>
  `;
}

function armorThemeForItem(item) {
  const name = item?.name || "";
  if (name.includes("岩") || name.includes("铠") || name.includes("重")) return "guardian";
  if (name.includes("疾") || name.includes("影") || name.includes("忍")) return "shadow";
  if (name.includes("猎") || name.includes("弓")) return "hunter";
  return "shura";
}

function armorFactorById(factorId) {
  return armorFactorCatalog.find((factor) => factor.id === factorId) || armorFactorCatalog[0];
}

function ensureArmorFactorLoadout() {
  if (!loadoutState.armorFactorLoadout) loadoutState.armorFactorLoadout = {};
  loadoutParts.forEach((part) => {
    if (!loadoutState.armorFactorLoadout[part.id]) {
      loadoutState.armorFactorLoadout[part.id] = defaultArmorFactorLoadout[part.id] || armorFactorCatalog[0].id;
    }
  });
  if (!loadoutState.armorFactorBoardSlots || typeof loadoutState.armorFactorBoardSlots !== "object") {
    loadoutState.armorFactorBoardSlots = {};
  }
  Object.entries(defaultArmorFactorBoardSlots).forEach(([slotIndex, factorId]) => {
    if (!Object.prototype.hasOwnProperty.call(loadoutState.armorFactorBoardSlots, slotIndex)) {
      loadoutState.armorFactorBoardSlots[slotIndex] = factorId;
    }
  });
}

function armorFactorPartForSlot(slotIndex) {
  const normalized = Number(slotIndex);
  return loadoutParts.find((part) => armorFactorSlots[part.id] === normalized) || null;
}

function armorFactorSlotCapacity(slotIndex) {
  const part = armorFactorPartForSlot(slotIndex);
  if (part) return armorEnergyCapacityForPart(part);
  const totalCapacity = loadoutParts.reduce((sum, item) => sum + armorEnergyCapacityForPart(item), 0);
  return Math.max(3, Math.min(7, Math.round(totalCapacity / 5)));
}

function armorFactorCapacityTotal() {
  ensureArmorFactorLoadout();
  return Array.from({ length: 9 }, (_, index) => armorFactorSlotCapacity(index))
    .reduce((sum, capacity) => sum + capacity, 0);
}

function armorFactorCostUsed(excludedSlotIndex = null) {
  ensureArmorFactorLoadout();
  const excluded = excludedSlotIndex === null ? null : Number(excludedSlotIndex);
  return Object.entries(loadoutState.armorFactorBoardSlots || {}).reduce((sum, [slotIndex, factorId]) => {
    const normalized = Number(slotIndex);
    if (!factorId || normalized === excluded) return sum;
    return sum + armorFactorById(factorId).cost;
  }, 0);
}

function canEquipArmorFactorSlot(slotIndex, factorId) {
  const normalized = Number(slotIndex);
  const factor = armorFactorById(factorId);
  if (!Number.isInteger(normalized) || normalized < 0 || normalized > 8 || !factor) return false;
  return armorFactorCostUsed(normalized) + factor.cost <= armorFactorCapacityTotal();
}

function armorEnergyCapacityForItem(part, item) {
  const themeId = armorThemeForItem(item);
  const profile = armorEnergyProfiles[themeId] || armorEnergyProfiles.shura;
  return profile[part.id] ?? armorEnergyProfiles.shura[part.id] ?? 0;
}

function equippedArmorItemForPart(part) {
  return loadoutState.equipped[`${part.id}:base`]
    || attachmentOptions.find((item) => item.name === part.defaultItem)
    || null;
}

function armorEnergyCapacityForPart(part) {
  return armorEnergyCapacityForItem(part, equippedArmorItemForPart(part));
}

function refreshArmorFactorViews() {
  if (loadoutState.prebattleStep === "armorBoard") {
    renderStandaloneArmorEnergyBoard();
  } else {
    renderPrebattleSkillConfig();
  }
}

function equipArmorFactor(partId, factorId) {
  ensureArmorFactorLoadout();
  const part = loadoutParts.find((item) => item.id === partId);
  const factor = armorFactorById(factorId);
  if (!part || !factor) return;
  const slotIndex = armorFactorSlots[partId];
  if (slotIndex !== undefined && !canEquipArmorFactorSlot(slotIndex, factor.id)) return;
  loadoutState.armorFactorLoadout[partId] = factor.id;
  if (slotIndex !== undefined) loadoutState.armorFactorBoardSlots[slotIndex] = factor.id;
  loadoutState.armorFactorPickerOpen = false;
  refreshArmorFactorViews();
}

function equipArmorFactorSlot(slotIndex, factorId) {
  ensureArmorFactorLoadout();
  const normalized = Number(slotIndex);
  const factor = armorFactorById(factorId);
  if (!Number.isInteger(normalized) || normalized < 0 || normalized > 8 || !factor) return;
  if (!canEquipArmorFactorSlot(normalized, factor.id)) return;
  loadoutState.armorFactorBoardSlots[normalized] = factor.id;
  const part = armorFactorPartForSlot(normalized);
  if (part) loadoutState.armorFactorLoadout[part.id] = factor.id;
  loadoutState.activeArmorFactorSlot = normalized;
  loadoutState.armorFactorPickerOpen = false;
  refreshArmorFactorViews();
}

function clearArmorFactorSlot(slotIndex) {
  ensureArmorFactorLoadout();
  const normalized = Number(slotIndex);
  if (!Number.isInteger(normalized) || normalized < 0 || normalized > 8) return;
  loadoutState.armorFactorBoardSlots[normalized] = null;
  loadoutState.activeArmorFactorSlot = normalized;
  loadoutState.armorFactorPickerOpen = false;
  refreshArmorFactorViews();
}

function moveArmorFactorSlot(fromSlot, toSlot) {
  ensureArmorFactorLoadout();
  const from = Number(fromSlot);
  const to = Number(toSlot);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 8 || to < 0 || to > 8 || from === to) return;
  const fromFactor = loadoutState.armorFactorBoardSlots[from];
  if (!fromFactor) return;
  const toFactor = loadoutState.armorFactorBoardSlots[to] || null;
  loadoutState.armorFactorBoardSlots[to] = fromFactor;
  loadoutState.armorFactorBoardSlots[from] = toFactor;
  Object.entries(armorFactorSlots).forEach(([partId, slotIndex]) => {
    const factorId = loadoutState.armorFactorBoardSlots[slotIndex];
    loadoutState.armorFactorLoadout[partId] = factorId || null;
  });
  loadoutState.activeArmorFactorSlot = to;
  loadoutState.armorFactorPickerOpen = false;
  refreshArmorFactorViews();
}

function armorFactorForPart(part) {
  ensureArmorFactorLoadout();
  const equipped = equippedArmorItemForPart(part);
  if (!equipped) return null;
  const themeId = armorThemeForItem(equipped);
  const theme = armorEnergyProfiles[themeId] || armorEnergyProfiles.shura;
  const slotIndex = armorFactorSlots[part.id];
  const boardSlots = loadoutState.armorFactorBoardSlots || {};
  const hasBoardSlot = Object.prototype.hasOwnProperty.call(boardSlots, slotIndex);
  const factorId = hasBoardSlot
    ? boardSlots[slotIndex]
    : (loadoutState.armorFactorLoadout[part.id] || defaultArmorFactorLoadout[part.id]);
  if (!factorId) return null;
  const factor = armorFactorById(factorId);
  const capacity = armorEnergyCapacityForPart(part);
  const typeId = factor.type || "resource";
  const type = armorFactorTypes[typeId] || armorFactorTypes.resource;
  return {
    partId: part.id,
    partLabel: part.label,
    itemName: equipped.name,
    themeId,
    themeName: armorFactorProfiles[themeId]?.name || themeId,
    typeId,
    factorId: factor.id,
    factorName: factor.name,
    factorTier: factor.tier,
    factorEffect: factor.effect,
    cost: factor.cost,
    capacity,
    canEquip: true,
    ...type,
  };
}

function armorFactorForSlot(slotIndex) {
  ensureArmorFactorLoadout();
  const normalized = Number(slotIndex);
  const factorId = loadoutState.armorFactorBoardSlots?.[normalized];
  if (!factorId) return null;
  const factor = armorFactorById(factorId);
  const typeId = factor.type || "resource";
  const type = armorFactorTypes[typeId] || armorFactorTypes.resource;
  const capacity = armorFactorSlotCapacity(normalized);
  return {
    index: normalized,
    typeId,
    factorId: factor.id,
    factorName: factor.name,
    factorTier: factor.tier,
    factorEffect: factor.effect,
    cost: factor.cost,
    capacity,
    canEquip: true,
    ...type,
  };
}

function armorFactorLineKey(factors) {
  const ids = factors.map((factor) => factor.typeId);
  if (ids.every((id) => id === ids[0])) return `${ids[0]}-${ids[0]}-${ids[0]}`;
  return "";
}

function buildArmorFactorBoard() {
  ensureArmorFactorLoadout();
  const cells = Array.from({ length: 9 }, (_, index) => {
    const factor = armorFactorForSlot(index);
    if (!factor) {
      return {
        index,
        empty: true,
        capacity: armorFactorSlotCapacity(index),
      };
    }
    return {
      index,
      empty: false,
      ...factor,
    };
  });

  const capacityUsed = cells.filter((cell) => !cell.empty).reduce((sum, cell) => sum + cell.cost, 0);
  const capacityTotal = armorFactorCapacityTotal();
  const overCapacity = capacityUsed > capacityTotal;
  const activeLines = armorFactorLineIndices
    .map((indices) => {
      const factors = indices.map((index) => cells[index]).filter((cell) => !cell.empty && !overCapacity);
      if (factors.length !== 3) return null;
      const recipe = armorFactorLineRecipes[armorFactorLineKey(factors)];
      if (!recipe) return null;
      return { indices, factors, ...recipe };
    })
    .filter(Boolean);
  const activeIndices = new Set(activeLines.flatMap((line) => line.indices));
  return {
    cells,
    activeLines,
    activeIndices,
    capacityUsed,
    capacityTotal,
    overCapacity,
    title: "战甲能量盘",
  };
}

function factorLineCenter(index) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    x: 16.667 + col * 33.333,
    y: 16.667 + row * 33.333,
  };
}

function renderArmorFactorLines(activeLines) {
  if (!activeLines.length) return "";
  return `
    <svg class="armor-factor-lines" viewBox="0 0 100 100" aria-hidden="true">
      ${activeLines.map((line, index) => {
        const start = factorLineCenter(line.indices[0]);
        const end = factorLineCenter(line.indices[2]);
        return `<line class="factor-line-${index % 3}" x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}"></line>`;
      }).join("")}
    </svg>
  `;
}

function renderArmorFactorPicker() {
  if (!loadoutState.armorFactorPickerOpen) return "";
  const slotIndex = Math.max(0, Math.min(8, Number(loadoutState.activeArmorFactorSlot) || 0));
  const current = armorFactorForSlot(slotIndex);
  const board = buildArmorFactorBoard();
  const usedWithoutCurrent = armorFactorCostUsed(slotIndex);
  const remaining = Math.max(0, board.capacityTotal - usedWithoutCurrent);
  return `
    <div class="armor-factor-modal-layer" role="presentation">
      <div class="armor-factor-modal-backdrop" data-close-factor-picker aria-label="关闭模块列表"></div>
      <section class="armor-factor-picker-panel" role="dialog" aria-modal="true" aria-label="选择战甲模块">
        <div class="armor-factor-picker-head">
          <span>
            <b>选择模块</b>
            <small>剩余战甲能量 ${remaining} / ${board.capacityTotal}${current ? ` · 当前 ${current.factorName}` : ""}</small>
          </span>
          <button type="button" data-close-factor-picker aria-label="关闭模块列表">×</button>
        </div>
        <div class="armor-factor-choice-list">
          ${armorFactorCatalog.map((factor) => {
            const type = armorFactorTypes[factor.type] || armorFactorTypes.resource;
            const disabled = usedWithoutCurrent + factor.cost > board.capacityTotal;
            const active = current?.factorId === factor.id;
            return `
              <button class="armor-factor-choice factor-${type.tone}${active ? " active" : ""}" type="button" data-factor-slot="${slotIndex}" data-factor-id="${factor.id}" ${disabled ? "disabled" : ""}>
                <i>${type.short}</i>
                <span>
                <strong>${factor.name}</strong>
                <small>${type.label}模块 · ${factor.tier}</small>
              </span>
              <span class="factor-choice-energy">
                ${renderFactorCostBadge(factor.cost)}
              </span>
            </button>
          `;
          }).join("")}
        </div>
        <button class="armor-factor-clear" type="button" data-clear-factor-slot="${slotIndex}" ${current ? "" : "disabled"}>清空该槽</button>
      </section>
    </div>
  `;
}

function renderArmorFactorContent() {
  const board = buildArmorFactorBoard();
  const bingoCount = board.activeLines.length;
  const maxBingo = armorFactorBingoRewards[armorFactorBingoRewards.length - 1]?.count || 0;
  return `
    <span>战甲能量盘</span>
    <strong>${bingoCount} Bingo</strong>
    <div class="armor-factor-capacity-summary">
      ${renderMeter("战甲能量", board.capacityUsed, board.capacityTotal, "factor-energy-meter")}
      <span class="factor-bingo-count">
        <b>Bingo</b>
        <em>${bingoCount} / ${maxBingo}</em>
      </span>
    </div>
    <div class="armor-factor-board">
      ${renderArmorFactorLines(board.activeLines)}
      ${board.cells.map((cell) => {
        if (cell.empty) {
          return `
            <button class="armor-factor-cell empty" type="button" data-open-factor-picker="${cell.index}" data-factor-drop="${cell.index}" aria-label="装填模块槽位${cell.index + 1}">
              <i>+</i>
              <b>空槽</b>
              <em class="factor-cost-badge muted">点击装填</em>
            </button>
          `;
        }
        return `
          <button class="armor-factor-cell factor-${cell.tone}${board.activeIndices.has(cell.index) ? " linked" : ""}${board.overCapacity ? " overloaded" : ""}" type="button" draggable="true" data-factor-drag="${cell.index}" data-factor-drop="${cell.index}" data-open-factor-picker="${cell.index}" aria-label="替换${cell.factorName}">
            <i>${cell.short}</i>
            <b>${cell.factorName}</b>
            ${renderFactorCostBadge(cell.cost)}
          </button>
        `;
      }).join("")}
    </div>
    ${renderArmorFactorPicker()}
    <div class="armor-factor-effects">
      ${armorFactorBingoRewards.map((reward) => {
        const unlocked = bingoCount >= reward.count;
        return `
          <span class="${unlocked ? "unlocked" : "locked"}">
            <i>${unlocked ? reward.count : "?"}</i>
            <b>${reward.title}</b>
            <em>${unlocked ? reward.effect : "未披露"}</em>
          </span>
        `;
      }).join("")}
      ${board.activeLines.length
        ? `<div class="armor-factor-line-notes">
          ${board.activeLines.map((line, index) => `<small>连线 ${index + 1}：${line.effect}</small>`).join("")}
        </div>`
        : `<div class="armor-factor-line-notes"><small>将同类型模块排成横、竖或斜向三连后，才会点亮连线并解锁 Bingo 奖励。</small></div>`}
    </div>
    <small>点击模块槽可替换模块。模块总消耗不能超过战甲提供的能量；只有同类型三连会触发 Bingo。</small>
  `;
}

function attachArmorFactorBoardEvents(container, rerender) {
  if (!container) return;
  const refresh = typeof rerender === "function" ? rerender : refreshArmorFactorViews;
  container.querySelectorAll("[data-open-factor-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.activeArmorFactorSlot = Number(button.dataset.openFactorPicker) || 0;
      loadoutState.armorFactorPickerOpen = true;
      refresh();
    });
  });
  container.querySelectorAll("[data-factor-drag]").forEach((button) => {
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", button.dataset.factorDrag);
      button.classList.add("dragging");
    });
    button.addEventListener("dragend", () => {
      button.classList.remove("dragging");
      container.querySelectorAll(".factor-drop-target").forEach((target) => target.classList.remove("factor-drop-target"));
    });
  });
  container.querySelectorAll("[data-factor-drop]").forEach((button) => {
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      button.classList.add("factor-drop-target");
    });
    button.addEventListener("dragleave", () => {
      button.classList.remove("factor-drop-target");
    });
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      button.classList.remove("factor-drop-target");
      moveArmorFactorSlot(event.dataTransfer.getData("text/plain"), button.dataset.factorDrop);
    });
  });
  container.querySelectorAll("[data-close-factor-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.armorFactorPickerOpen = false;
      refresh();
    });
  });
  container.querySelectorAll("[data-factor-slot][data-factor-id]").forEach((button) => {
    button.addEventListener("click", () => equipArmorFactorSlot(button.dataset.factorSlot, button.dataset.factorId));
  });
  container.querySelector("[data-clear-factor-slot]")?.addEventListener("click", (event) => {
    clearArmorFactorSlot(event.currentTarget.dataset.clearFactorSlot);
  });
  container.querySelectorAll("[data-factor-part][data-factor-id]").forEach((button) => {
    button.addEventListener("click", () => equipArmorFactor(button.dataset.factorPart, button.dataset.factorId));
  });
}

function renderArmorFactorEditor() {
  if (!ui.skillEditor) return;
  ui.skillEditor.classList.add("armor-factor-editor");
  ui.skillEditor.innerHTML = `
    <div class="armor-factor-editor-body">
      ${renderArmorFactorContent()}
    </div>
  `;
  attachArmorFactorBoardEvents(ui.skillEditor, renderPrebattleSkillConfig);
}

function armorBodyMapPoint(partId) {
  const points = {
    head: { bodyX: 51, bodyY: 18, cardX: 17, cardY: 13 },
    torso: { bodyX: 51, bodyY: 39, cardX: 82, cardY: 24 },
    bracer: { bodyX: 37, bodyY: 45, cardX: 18, cardY: 48 },
    pants: { bodyX: 51, bodyY: 62, cardX: 82, cardY: 63 },
    shoes: { bodyX: 48, bodyY: 82, cardX: 22, cardY: 82 },
  };
  return points[partId] || points.head;
}

function renderArmorBodyMap(activePart) {
  const lines = loadoutParts.map((part) => {
    const point = armorBodyMapPoint(part.id);
    return `
      <line
        class="armor-body-link-line ${part.id === activePart.id ? "active" : ""}"
        x1="${point.bodyX}" y1="${point.bodyY}"
        x2="${point.cardX}" y2="${point.cardY}"
      ></line>
    `;
  }).join("");
  return `
    <div class="armor-body-map-head">
      <span>战甲部位图</span>
      <strong>点击装备图片切换对应部位，再在右侧调整能量盘模块。</strong>
    </div>
    <div class="armor-body-map">
      <svg class="armor-body-links" viewBox="0 0 100 100" aria-hidden="true">${lines}</svg>
      <div class="armor-body-silhouette" aria-hidden="true">
        <span class="body-head"></span>
        <span class="body-torso"></span>
        <span class="body-arm left"></span>
        <span class="body-arm right"></span>
        <span class="body-leg left"></span>
        <span class="body-leg right"></span>
      </div>
      ${loadoutParts.map((part) => {
        const item = equippedArmorItemForPart(part);
        const slotIndex = armorFactorSlots[part.id];
        const factor = armorFactorForSlot(slotIndex);
        const capacity = armorEnergyCapacityForPart(part);
        const isActive = part.id === activePart.id;
        return `
          <button class="armor-body-card armor-body-card-${part.id}${isActive ? " active" : ""}" type="button" data-armor-board-part="${part.id}">
            <span class="armor-body-card-image">${item?.image ? `<img src="${item.image}" alt="" />` : part.icon}</span>
            <span class="armor-body-card-copy">
              <strong>${part.label}</strong>
              <small>${item?.name || "未装配战甲"}</small>
            </span>
            ${part.id === "head" ? "" : `<em>承载 ${capacity}</em>`}
            <i>${factor ? factor.factorName : "空槽"}</i>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderStandaloneArmorEnergyBoard() {
  if (!ui.armorBoardParts || !ui.armorBoardConfig) return;
  ensureArmorFactorLoadout();
  const activePart = loadoutParts.find((part) => part.id === loadoutState.activePartId) || loadoutParts[0];
  loadoutState.activePartId = activePart.id;
  const board = buildArmorFactorBoard();
  ui.armorBoardParts.innerHTML = renderArmorBodyMap(activePart);
  ui.armorBoardConfig.innerHTML = `
    <div class="armor-board-config-head">
      <span>${activePart.label} / ${equippedArmorItemForPart(activePart)?.name || "未装配战甲"}</span>
      <strong>总能量 ${board.capacityUsed} / ${board.capacityTotal}</strong>
    </div>
    <div class="armor-factor-editor-body armor-board-factor-body">
      ${renderArmorFactorContent()}
    </div>
  `;
  ui.armorBoardParts.querySelectorAll("[data-armor-board-part]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.activePartId = button.dataset.armorBoardPart || "head";
      loadoutState.activeArmorFactorSlot = armorFactorSlots[loadoutState.activePartId] ?? 0;
      loadoutState.armorFactorPickerOpen = false;
      renderStandaloneArmorEnergyBoard();
    });
  });
  attachArmorFactorBoardEvents(ui.armorBoardConfig, renderStandaloneArmorEnergyBoard);
}

function armorFactorStatBonus() {
  return buildArmorFactorBoard().activeLines.reduce((bonus, line) => {
    Object.entries(line.statBonus || {}).forEach(([key, value]) => {
      bonus[key] = (bonus[key] || 0) + value;
    });
    return bonus;
  }, {});
}

function isConfiguredSkillActive(skillId) {
  return carriedWeapons().some((weapon) => configuredWeaponSkills(weapon.id).some((skill) => skill.id === skillId));
}

function tacticalLinkStatus(requirements) {
  const met = requirements.filter((item) => item.ok).length;
  if (met === requirements.length) return "active";
  if (met > 0) return "partial";
  return "missing";
}

function tacticalLinkGaps(requirements) {
  return requirements.filter((item) => !item.ok).map((item) => item.gap);
}

function tacticalLinks() {
  const hasFists = isWeaponCarried("fists");
  const hasGreatsword = isWeaponCarried("greatsword");
  const hasBow = isWeaponCarried("bow");
  const hasDrone = isLoadoutItemEquipped("无人机");
  const hasJet = isLoadoutItemEquipped("喷气式装置");
  const hasGourd = isLoadoutItemEquipped("酒葫芦");
  const hasQuiver = isLoadoutItemEquipped("箭袋");
  const fistCore = isConfiguredSkillActive("fist_arm_rush");
  const bowPierce = isConfiguredSkillActive("bow_arm_pierce");
  const greatswordStance = isConfiguredSkillActive("gs_sweep");

  const makeLink = (link) => {
    const status = tacticalLinkStatus(link.requirements);
    return {
      ...link,
      status,
      gaps: tacticalLinkGaps(link.requirements),
    };
  };

  return [
    makeLink({
      id: "drone_core",
      title: "机关火控回路",
      tone: "blue",
      civilization: "机械文明",
      energy: "外挂火力",
      fit: "弱点压制",
      requirements: [
        { ok: hasDrone, gap: "上臂未装配无人机" },
        { ok: hasFists, gap: "未携带拳套" },
        { ok: fistCore, gap: "拳套未装配核心连打" },
      ],
      nodes: [
        { title: "能源来源", text: "上臂无人机", iconSrc: "./assets/loadout-drone.png" },
        { title: "转化器", text: "拳套近身定位", iconSrc: "./assets/weapon-fists.png" },
        { title: "释放端", text: "侧翼远程齐射", iconText: "射" },
        { title: "战斗结果", text: "压低躯干核心", iconSrc: "./assets/part-core.png" },
      ],
      payoff: "机械系不是单纯加伤害，而是把角色的近身定位转化成无人机可执行的火控坐标。",
    }),
    makeLink({
      id: "quiver_pierce",
      title: "游猎弹药回路",
      tone: "cyan",
      civilization: "游猎文明",
      energy: "穿甲弹药",
      fit: "手部应对",
      requirements: [
        { ok: hasQuiver, gap: "后背未装配箭袋" },
        { ok: hasBow, gap: "未携带弓弩" },
        { ok: bowPierce, gap: "弓弩未装配穿臂箭" },
      ],
      nodes: [
        { title: "能源来源", text: "后背箭袋", iconSrc: "./assets/loadout-quiver.jpeg" },
        { title: "转化器", text: "弓弩蓄力结构", iconSrc: "./assets/weapon-bow.png" },
        { title: "释放端", text: "穿甲箭头", iconText: "箭" },
        { title: "战斗结果", text: "破手部硬甲", iconSrc: "./assets/part-arms.png" },
      ],
      payoff: "游猎系把携带资源转化成针对性弹药，用较低风险处理 Boss 的危险部位。",
    }),
    makeLink({
      id: "jet_melee",
      title: "推进爆发回路",
      tone: "orange",
      civilization: "机动铠装",
      energy: "推进力",
      fit: "近战增伤",
      requirements: [
        { ok: hasJet, gap: "肩膀未装配喷气式装置" },
        { ok: hasFists || hasGreatsword, gap: "未携带近战武器" },
      ],
      nodes: [
        { title: "能源来源", text: "肩部喷气装置", iconSrc: "./assets/loadout-jet.png" },
        { title: "转化器", text: "姿态与惯性控制", iconText: "势" },
        { title: "释放端", text: "跃升重击", iconText: "跃" },
        { title: "战斗结果", text: "近战爆发提高", iconText: "伤" },
      ],
      payoff: "推进系把外部动力转化成身体动量，让同一个近战技能拥有更强的命中表现和爆发价值。",
    }),
    makeLink({
      id: "gourd_recover",
      title: "酒气调息回路",
      tone: "gold",
      civilization: "东方武学",
      energy: "酒气 / 血气",
      fit: "回合续航",
      requirements: [
        { ok: hasGourd, gap: "前腰未装配酒葫芦" },
      ],
      nodes: [
        { title: "能源来源", text: "前腰酒葫芦", iconSrc: "./assets/loadout-gourd.jpeg" },
        { title: "转化器", text: "呼吸与血气调动", iconText: "气" },
        { title: "释放端", text: "回合开始饮酒", iconText: "饮" },
        { title: "战斗结果", text: "恢复生命", iconText: "生" },
      ],
      payoff: "东方武学不需要机械能源，也能被纳入同一体系：酒气先转成血气，再释放为续航。",
    }),
    makeLink({
      id: "greatsword_counter",
      title: "架势反击回路",
      tone: "red",
      civilization: "重装武技",
      energy: "受击势能",
      fit: "承压反击",
      requirements: [
        { ok: hasGreatsword, gap: "未携带大剑" },
        { ok: greatswordStance, gap: "大剑未装配蓄势" },
      ],
      nodes: [
        { title: "能源来源", text: "大剑架势", iconSrc: "./assets/weapon-greatsword.png" },
        { title: "转化器", text: "承压蓄势", iconText: "蓄" },
        { title: "释放端", text: "受击反击", iconText: "反" },
        { title: "战斗结果", text: "下次攻击强化", iconText: "强" },
      ],
      payoff: "重装武技把敌人的冲击转化为自己的反击资源，体现慢但不容易断的价值。",
    }),
  ];
}

function tacticalLinkStatusLabel(status) {
  if (status === "active") return "回路闭合";
  if (status === "partial") return "回路缺口";
  return "未接入";
}

function renderTacticalLinkIcon(node) {
  if (node.iconSrc) return `<img src="${node.iconSrc}" alt="" />`;
  return `<b>${node.iconText || "?"}</b>`;
}

function renderTacticalLinkCard(link) {
  const statusText = link.gaps.length ? link.gaps.slice(0, 2).join(" / ") : "已闭合";
  return `
    <article class="tactical-link-card ${link.status} tone-${link.tone}">
      <header>
        <span>${tacticalLinkStatusLabel(link.status)}</span>
        <strong>${link.title}</strong>
        <em>${link.energy}</em>
        <small>${link.civilization} / ${link.fit}</small>
      </header>
      <div class="tactical-link-flow">
        ${link.nodes.map((node, index) => `
          <div class="tactical-link-node">
            <i>${renderTacticalLinkIcon(node)}</i>
            <span>${node.title}</span>
            <b>${node.text}</b>
          </div>
          ${index < link.nodes.length - 1 ? `<u aria-hidden="true"></u>` : ""}
        `).join("")}
      </div>
      <div class="tactical-link-gaps">
        <span>${link.gaps.length ? "缺口" : "状态"}</span>
        <i>${statusText}${link.gaps.length > 2 ? " ..." : ""}</i>
      </div>
    </article>
  `;
}

function renderTacticalLinkPage() {
  if (!ui.tacticalLinkMap || !ui.tacticalLinkDetail) return;
  updateEnterBattleState();
  const links = tacticalLinks();
  const activeLinks = links.filter((link) => link.status === "active");
  const partialLinks = links.filter((link) => link.status === "partial");

  ui.tacticalLinkMap.innerHTML = `
    <section class="link-overview">
      <span>当前能源构型</span>
      <strong>${links.length} 条能源回路</strong>
      <div>
        <i>${activeLinks.length} 条闭合回路</i>
        <i>${partialLinks.length} 条存在缺口</i>
        <i>${links.length - activeLinks.length - partialLinks.length} 条未接入</i>
        <i>${carriedWeapons().map((weapon) => weapon.name).join(" / ")}</i>
      </div>
    </section>
    <div class="tactical-link-grid">
      ${links.map(renderTacticalLinkCard).join("")}
    </div>
  `;

  ui.tacticalLinkDetail.innerHTML = "";
  ui.tacticalLinkDetail.hidden = true;
}

function characterTabContent(tabId) {
  const equippedWeapons = carriedWeapons();
  const weaponNames = equippedWeapons.map((weapon) => weapon.name).join(" / ");
  const accessoryNames = ["无人机", "喷气式装置", "酒葫芦", "箭袋"].filter(isLoadoutItemEquipped);
  const content = {
    skills: {
      title: "技能流派",
      eyebrow: "战斗定位",
      summary: "通过近战压制与重型破甲打开 Boss 部位，再用灵魂战甲完成爆发。",
      points: [
        "拳套负责贴身连击和弱点爆发。",
        "大剑负责破甲、蓄势和反击窗口。",
        "灵魂战甲作为固定大招，不随武器切换。",
      ],
    },
    outfit: {
      title: "服饰挂件",
      eyebrow: "当前战甲",
      summary: "修罗主题战甲默认穿戴，挂件提供协同、回复和破甲强化。",
      points: accessoryNames.length
        ? accessoryNames.map((name) => `${name} 已装配。`)
        : ["暂无挂件装配。"],
    },
    weapons: {
      title: "武器携带",
      eyebrow: "当前武器组",
      summary: `当前携带 ${weaponNames || "未选择武器"}，战斗中可在携带武器之间切换。`,
      points: equippedWeapons.map((weapon) => `${weapon.name}：${weapon.role}`),
    },
  };
  return content[tabId] || content.skills;
}

function renderCharacterInfo() {
  const activeTab = loadoutState.activeCharacterTab || "skills";
  ui.characterTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.characterTab === activeTab);
  });
  if (!ui.characterStyleCard || !ui.characterTabPanel) return;
  const info = characterTabContent(activeTab);
  const boss = currentBossBlueprint();
  ui.characterStyleCard.innerHTML = `
    <span>当前流派</span>
    <h2>机动破甲武士</h2>
    <p>面向 ${boss.name} 的战前策略：用破甲打开硬甲部位，用高爆发压低胸口核心。</p>
    <div class="character-style-tags">
      <i>近战压制</i>
      <i>破甲应对</i>
      <i>挂件协同</i>
    </div>
  `;
  ui.characterTabPanel.innerHTML = `
    <span>${info.eyebrow}</span>
    <h3>${info.title}</h3>
    <p>${info.summary}</p>
    <ul>
      ${info.points.map((point) => `<li>${point}</li>`).join("")}
    </ul>
  `;
}

function equippedLoadoutItemByName(itemName) {
  return Object.values(loadoutState.equipped).find((item) => item?.name === itemName)
    || attachmentOptions.find((item) => item.name === itemName)
    || null;
}

function lockedSkillPreviewForSource(source) {
  const weaponPreviews = {
    fists: {
      id: "locked_fists_air_combo",
      name: "裂空追击",
      targetParts: ["core", "arms"],
      targetLabel: "胸部+手部",
      kindLabel: "连携",
      comboChance: 0.65,
      damage: 88,
      armorDamage: 18,
      actionCost: 4,
      color: "#76d17b",
      desc: "贴身二段追击，适合破甲后连续压低弱点血量。",
      unlockHint: "拳套熟练度 Lv.2 解锁",
    },
    greatsword: {
      id: "locked_gs_mountain_break",
      name: "崩山断甲",
      targetParts: ["arms", "legs"],
      targetLabel: "手部+脚部",
      kindLabel: "重破甲",
      armorBreaker: true,
      damage: 96,
      armorDamage: 140,
      actionCost: 5,
      color: "#f0b84f",
      desc: "高行动力重击，专门处理多处硬甲部位。",
      unlockHint: "大剑熟练度 Lv.2 解锁",
    },
    bow: {
      id: "locked_bow_core_burst",
      name: "爆裂穿心矢",
      targetParts: ["core"],
      targetLabel: "胸部",
      kindLabel: "远程爆发",
      armorBreaker: true,
      damage: 120,
      armorDamage: 40,
      actionCost: 4,
      ammoCost: 2,
      color: "#58b7ff",
      desc: "消耗更多弹药，对裸露核心造成高额单点爆发。",
      unlockHint: "弓弩熟练度 Lv.2 解锁",
    },
  };

  const armorPreviews = {
    armor_head: ["战术解析", "读取 Boss 未披露情报，提前看到关键准备动作。"],
    armor_torso: ["熔核护盾", "承受高威胁攻击后生成临时护盾。"],
    armor_pants: ["稳步推进", "降低被击退和踉跄带来的行动损失。"],
    armor_bracer: ["过载臂甲", "强化下一次近战破甲或连击判定。"],
    armor_shoes: ["踏焰步", "闪避成功后提高下次攻击收益。"],
  };

  const accessoryPreviews = {
    accessory_drone: ["蜂群齐射", "无人机在破甲窗口中追加多段远程射击。"],
    accessory_jet: ["垂直轰击", "喷气装置改变攻击轨迹，形成跃升重击。"],
    accessory_gourd: ["醉意爆发", "饮酒后短时间提高攻击与抗打断能力。"],
    accessory_quiver: ["破甲箭幕", "箭袋提供更多穿甲箭，压制多个硬甲部位。"],
    accessory_sigils: ["魂能回路", "提高灵魂战甲充能效率并强化大招。"],
  };

  const weaponPreview = weaponPreviews[source.id];
  if (weaponPreview) {
    return [{ ...weaponPreview, locked: true }];
  }

  const armorPreview = armorPreviews[source.id];
  if (armorPreview) {
    return [{
      id: `locked_${source.id}_mastery`,
      name: armorPreview[0],
      targetParts: [],
      targetLabel: "自身",
      kindLabel: "战甲技",
      sourcePreview: true,
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#9aa8ba",
      desc: armorPreview[1],
      unlockHint: "战甲部位强化后解锁",
      locked: true,
    }];
  }

  const accessoryPreview = accessoryPreviews[source.id];
  if (accessoryPreview) {
    return [{
      id: `locked_${source.id}_mastery`,
      name: accessoryPreview[0],
      targetParts: [],
      targetLabel: "挂件",
      kindLabel: "挂件技",
      sourcePreview: true,
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#d8b4ff",
      desc: accessoryPreview[1],
      unlockHint: "挂件强化后解锁",
      locked: true,
    }];
  }

  return [];
}

function skillsForSource(source) {
  return [...(source.skills || []), ...lockedSkillPreviewForSource(source)];
}

function prebattleSkillGroups() {
  const weaponSources = carriedWeapons().map((weapon) => ({
    id: weapon.id,
    type: "weapon",
    group: "weapon",
    name: weapon.name,
    role: weapon.role,
    icon: weapon.icon,
    short: weapon.short,
    skills: configuredWeaponSkills(weapon.id),
  }));

  const armorSources = loadoutParts.map((part) => {
    const equippedItem = loadoutState.equipped[`${part.id}:base`]
      || attachmentOptions.find((item) => item.name === part.defaultItem);
    const profile = armorSkillProfiles[part.id];
    return {
      id: `armor_${part.id}`,
      type: "armor",
      group: "armor",
      name: part.label,
      role: equippedItem?.name || "战甲部位",
      icon: equippedItem?.image || "",
      short: part.icon,
      skills: profile ? [{ ...profile, id: `armor_${part.id}_${profile.kind}` }] : [],
    };
  });

  const accessorySources = accessorySkillProfiles.map((profile) => {
    const equippedItem = equippedLoadoutItemByName(profile.itemName);
    return {
      id: profile.sourceId,
      type: "accessory",
      group: "accessory",
      name: profile.itemName,
      role: profile.role,
      icon: equippedItem?.image || "",
      short: equippedItem?.icon || profile.fallbackIcon,
      skills: [{ ...profile.skill }],
    };
  });

  return [
    { id: "weapon", title: "武器", summary: "已携带武器技能", sources: weaponSources },
    { id: "armor", title: "战甲", summary: "五个基础部位能力", sources: armorSources },
    { id: "accessory", title: "挂件", summary: "五个挂件技能位", sources: accessorySources },
  ];
}

function prebattleSkillSources() {
  return prebattleSkillGroups().flatMap((group) => group.sources);
}

function renderPrebattleSkillConfig() {
  if (!ui.skillLoadoutWeapons || !ui.skillSourceTabs || !ui.skillConfigList || !ui.skillEditor) return;
  updateEnterBattleState();
  const groups = prebattleSkillGroups();
  const sources = groups.flatMap((group) => group.sources);
  if (!sources.length) return;
  const preferredGroup = groups.find((group) => group.id === loadoutState.activeSkillGroupId) || groups[0];
  if (!sources.some((source) => source.id === loadoutState.activeSkillSourceId)) {
    loadoutState.activeSkillSourceId = preferredGroup.sources[0]?.id || sources[0].id;
  }
  const activeSource = sources.find((source) => source.id === loadoutState.activeSkillSourceId) || preferredGroup.sources[0] || sources[0];
  const activeGroup = groups.find((group) => group.sources.some((source) => source.id === activeSource.id)) || preferredGroup;
  const activeSourceSkills = skillsForSource(activeSource);
  const unlockedSkillCount = activeSourceSkills.filter((skill) => !skill.locked).length;
  const activeArmorBoard = activeGroup.id === "armor" ? buildArmorFactorBoard() : null;
  loadoutState.activeSkillGroupId = activeGroup.id;
  loadoutState.skillGroupExpanded = {
    weapon: false,
    armor: false,
    accessory: false,
    ...(loadoutState.skillGroupExpanded || {}),
  };
  if (!activeSourceSkills.some((skill) => skill.id === loadoutState.activeSkillEditorId)) {
    loadoutState.activeSkillEditorId = activeSourceSkills[0]?.id || "";
  }

  ui.skillSourceTabs.className = "skill-source-tabs skill-source-tabs-visible";
  ui.skillSourceTabs.innerHTML = `
    <span class="skill-board-path">${activeGroup.title}</span>
    <span class="skill-board-title">
      <strong>${activeArmorBoard ? "战甲能量盘" : activeSource.name}</strong>
      <small>${activeArmorBoard ? "由五个战甲部位提供能量承载，并驱动挂件与模组" : activeSource.role}</small>
    </span>
    <em>${activeArmorBoard ? `${activeArmorBoard.activeLines.length} 条连线` : `${unlockedSkillCount}/${activeSourceSkills.length} 可用`}</em>
  `;
  ui.skillLoadoutWeapons.innerHTML = groups
    .map((group) => `
      <section class="skill-filter-group${loadoutState.skillGroupExpanded[group.id] ? " expanded" : ""}${group.id === activeGroup.id ? " active" : ""}">
        <button class="skill-filter-head" type="button" data-skill-group="${group.id}" aria-expanded="${loadoutState.skillGroupExpanded[group.id] ? "true" : "false"}">
          <span>
            <strong>${group.title}</strong>
            <small>${group.summary}</small>
          </span>
          <i></i>
        </button>
        <div class="skill-filter-body">
          ${group.sources
            .map((source) => `
              <button class="skill-loadout-chip${source.id === activeSource.id ? " active" : ""}" type="button" data-skill-source="${source.id}">
                <span>${renderSkillSourceIcon(source)}</span>
                <strong>${source.name}</strong>
                <small>${source.role}</small>
              </button>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");

  ui.skillConfigList.className = "skill-config-list";
  ui.skillConfigList.innerHTML = activeSourceSkills
    .map((skill) => renderSkillConfigCard(skill, activeSource))
    .join("");

  ui.skillLoadoutWeapons.querySelectorAll("[data-skill-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = groups.find((item) => item.id === button.dataset.skillGroup);
      if (!group) return;
      const wasExpanded = !!loadoutState.skillGroupExpanded?.[group.id];
      loadoutState.activeSkillGroupId = group.id;
      loadoutState.skillGroupExpanded = {
        ...(loadoutState.skillGroupExpanded || {}),
        [group.id]: !wasExpanded,
      };
      if (!group.sources.some((source) => source.id === loadoutState.activeSkillSourceId)) {
        loadoutState.activeSkillSourceId = group.sources[0]?.id || "";
        loadoutState.activeSkillEditorId = skillsForSource(group.sources[0] || {})[0]?.id || "";
      }
      renderPrebattleSkillConfig();
    });
  });

  ui.skillLoadoutWeapons.querySelectorAll("[data-skill-source]").forEach((button) => {
    button.addEventListener("click", () => {
      const source = sources.find((item) => item.id === button.dataset.skillSource);
      if (!source) return;
      const group = groups.find((item) => item.sources.some((groupSource) => groupSource.id === source.id));
      if (group) {
        loadoutState.activeSkillGroupId = group.id;
        loadoutState.skillGroupExpanded = {
          ...(loadoutState.skillGroupExpanded || {}),
          [group.id]: true,
        };
      }
      loadoutState.activeSkillSourceId = source.id;
      loadoutState.activeSkillEditorId = skillsForSource(source)[0]?.id || "";
      renderPrebattleSkillConfig();
    });
  });

  ui.skillConfigList.querySelectorAll("[data-skill-config]").forEach((button) => {
    button.addEventListener("click", () => {
      const source = sources.find((item) => item.id === button.dataset.skillSource);
      if (!source) return;
      loadoutState.activeSkillSourceId = source.id;
      loadoutState.activeSkillEditorId = button.dataset.skillConfig || source.skills[0]?.id || "";
      renderPrebattleSkillConfig();
    });
  });

  const activeSkill = activeSourceSkills.find((skill) => skill.id === loadoutState.activeSkillEditorId) || activeSourceSkills[0];
  if (activeGroup.id === "armor") {
    renderArmorFactorEditor();
  } else {
    renderSkillEditor(activeSkill, activeSource);
  }
}

function renderSkillSourceIcon(source) {
  return source.icon ? `<img src="${source.icon}" alt="" />` : `<b>${source.short}</b>`;
}

function skillConfigMeta(skill) {
  if (skill.statBonus) {
    return [`基础属性`, statBonusText(skill.statBonus)];
  }
  if (skill.noEffect) return ["无战斗效果"];
  const meta = [];
  if (skill.targetLabel && (skill.targetParts || []).length) meta.push(skill.targetLabel);
  if (skill.kindLabel) meta.push(skill.kindLabel);
  if (skill.damage > 0) meta.push(skill.maxDots ? `每档伤害 ${skill.damage}` : `伤害 ${skill.damage}`);
  const armorDamage = effectiveArmorDamage(skill);
  if (armorDamage > 0) meta.push(`护甲 ${armorDamage}`);
  if (skill.ammoCost) meta.push(`弹药 ${skill.ammoCost}`);
  return meta.length ? meta : ["配置预览"];
}

function renderSkillConfigCard(skill, source) {
  const partIds = skill.targetParts || [];
  const iconMarkup = skill.noEffect || skill.statBonus || skill.sourcePreview ? renderSkillSourceIcon(source) : renderPartIconGroup(partIds, "badge");
  const meta = skillConfigMeta(skill);
  return `
    <button class="skill-config-card${skill.id === loadoutState.activeSkillEditorId ? " active" : ""}${skill.locked ? " locked" : ""}" type="button" data-skill-source="${source.id}" data-skill-config="${skill.id}">
      <span class="skill-config-part${partIds.length > 1 ? " multi" : ""}${skillTargetClass(skill)}${skillTargetCountClass(skill)}${skill.noEffect ? " no-effect" : ""}${skill.statBonus ? " stat-bonus" : ""}" style="--skill-color:${skill.color}">
        ${iconMarkup}
      </span>
      <span class="skill-config-copy">
        <span class="skill-config-title-row">
          <strong>${skill.name}</strong>
          <em>${skill.locked ? "未解锁" : "可用"}</em>
        </span>
        <span class="skill-config-tags">${renderPrebattleSkillTags(skill)}</span>
        <span class="skill-config-meta">${meta.map((item) => `<i>${item}</i>`).join("")}</span>
        <small>${skill.desc}${skill.locked && skill.unlockHint ? ` ${skill.unlockHint}` : ""}</small>
      </span>
      ${skill.actionCost > 0 ? `<span class="skill-config-cost">行动力<b>${skill.actionCost}</b></span>` : ""}
    </button>
  `;
}

function partLabelForConfig(partId) {
  const runtimePart = state?.enemy?.parts?.find((part) => part.id === partId);
  if (runtimePart) return runtimePart.label;
  const blueprintPart = partBlueprint.find((part) => part.id === partId);
  return blueprintPart?.label || partId;
}

function renderPrebattleSkillTags(skill) {
  const tags = [];
  if (skill.locked) tags.push("未解锁");
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  return tags.map((tag) => `<i class="${skillTagClass(tag)}">${tag}</i>`).join("");
}

function statBonusText(stats = {}) {
  const pieces = [];
  if (stats.attack) pieces.push(`攻击 +${stats.attack}`);
  if (stats.defense) pieces.push(`防御 +${stats.defense}`);
  if (stats.hp) pieces.push(`生命 +${stats.hp}`);
  return pieces.length ? pieces.join(" / ") : "无属性";
}

function skillPreviewVideo(skill) {
  if (skill.previewVideo) {
    return { src: skill.previewVideo, label: skill.previewVideoLabel || "表现预览" };
  }
  if (skill.cinematicVideo) {
    return { src: skill.cinematicVideo, label: "技能表现预览" };
  }
  if (skill.accessoryFlow?.introVideo) {
    return { src: skill.accessoryFlow.introVideo, label: "挂件选择起手" };
  }
  const firstAccessoryEffect = skill.accessoryFlow?.effects
    ? Object.values(skill.accessoryFlow.effects).find((effect) => effect?.video)
    : null;
  if (firstAccessoryEffect?.video) {
    return { src: firstAccessoryEffect.video, label: `${firstAccessoryEffect.label || "挂件"}预览` };
  }
  return null;
}

function renderSkillPreviewVideo(skill) {
  const preview = skillPreviewVideo(skill);
  if (!preview) return "";
  return `
    <section class="skill-editor-video-preview" aria-label="${preview.label}">
      <span>${preview.label}</span>
      <video src="${preview.src}" muted loop playsinline autoplay preload="metadata"></video>
    </section>
  `;
}

function renderSkillEditor(skill, source) {
  if (!ui.skillEditor) return;
  ui.skillEditor.classList.remove("armor-factor-editor");
  if (!skill) {
    ui.skillEditor.innerHTML = `<p class="skill-editor-empty">当前来源暂无技能。</p>`;
    return;
  }
  if (skill.locked) {
    const targetNames = (skill.targetParts || []).length ? skill.targetParts.map(partLabelForConfig).join(" / ") : skill.targetLabel || "自身";
    ui.skillEditor.innerHTML = `
      <div class="skill-editor-head">
        <span class="skill-editor-source locked">未解锁</span>
        <h2>${skill.name}</h2>
        <p>${skill.desc}</p>
      </div>
      ${renderSkillPreviewVideo(skill)}
      <dl class="skill-editor-fields">
        <div><dt>附着来源</dt><dd>${source.name}</dd></div>
        <div><dt>解锁条件</dt><dd>${skill.unlockHint || "后续版本开放"}</dd></div>
        <div><dt>技能方向</dt><dd>${skill.kindLabel || "预告技能"}</dd></div>
        <div><dt>目标</dt><dd>${targetNames}</dd></div>
        ${skill.actionCost > 0 ? `<div><dt>行动力</dt><dd>${skill.actionCost}</dd></div>` : ""}
        ${skill.damage > 0 ? `<div><dt>预计伤害</dt><dd>${skill.damage}</dd></div>` : ""}
        ${skill.armorDamage > 0 ? `<div><dt>预计破甲</dt><dd>${skill.armorDamage}</dd></div>` : ""}
      </dl>
      <button class="skill-editor-apply locked" type="button">未解锁，仅作配置预览</button>
    `;
    return;
  }
  if (skill.noEffect) {
    ui.skillEditor.innerHTML = `
      <div class="skill-editor-head">
        <span class="skill-editor-source">${source.name}</span>
        <h2>无效果</h2>
        <p>${skill.desc}</p>
      </div>
      ${renderSkillPreviewVideo(skill)}
      <dl class="skill-editor-fields">
        <div><dt>附着来源</dt><dd>${source.name}</dd></div>
        <div><dt>当前状态</dt><dd>无战斗效果</dd></div>
      </dl>
      <button class="skill-editor-apply" type="button">当前装备无效果</button>
    `;
    return;
  }
  if (skill.statBonus) {
    ui.skillEditor.innerHTML = `
      <div class="skill-editor-head">
        <span class="skill-editor-source">${source.name}</span>
        <h2>${skill.name}</h2>
        <p>${skill.desc}</p>
      </div>
      ${renderSkillPreviewVideo(skill)}
      <dl class="skill-editor-fields">
        <div><dt>附着来源</dt><dd>${source.name}</dd></div>
        <div><dt>属性类型</dt><dd>基础属性</dd></div>
        <div><dt>攻击</dt><dd>+${skill.statBonus.attack || 0}</dd></div>
        <div><dt>防御</dt><dd>+${skill.statBonus.defense || 0}</dd></div>
        <div><dt>生命</dt><dd>+${skill.statBonus.hp || 0}</dd></div>
      </dl>
      <button class="skill-editor-apply" type="button">${statBonusText(skill.statBonus)}</button>
    `;
    return;
  }
  const targetNames = skill.targetParts.map(partLabelForConfig).join(" / ");
  const armorDamage = effectiveArmorDamage(skill);
  ui.skillEditor.innerHTML = `
    <div class="skill-editor-head">
      <span class="skill-editor-source">${source.name}</span>
      <h2>${skill.name}</h2>
      <p>${skill.desc}</p>
    </div>
    ${renderSkillPreviewVideo(skill)}
    <dl class="skill-editor-fields">
      <div><dt>附着来源</dt><dd>${source.name}</dd></div>
      <div><dt>打击部位</dt><dd>${targetNames}</dd></div>
      <div><dt>技能类型</dt><dd>${skill.kindLabel}</dd></div>
      <div><dt>行动力</dt><dd>${skill.actionCost || 0}</dd></div>
      <div><dt>伤害</dt><dd>${skill.maxDots ? `每档 ${skill.damage}` : skill.damage}</dd></div>
      <div><dt>护甲损坏</dt><dd>${armorDamage || 0}</dd></div>
      ${skill.ammoCost ? `<div><dt>弹药消耗</dt><dd>${skill.ammoCost}</dd></div>` : ""}
      ${skill.comboChance ? `<div><dt>连击</dt><dd>${Math.round(skill.comboChance * 100)}% 概率追加普攻</dd></div>` : ""}
    </dl>
    <button class="skill-editor-apply" type="button">已使用当前技能配置</button>
  `;
}

function updateEnterBattleState() {
  if (!ui.enterBattleBtn) return;
  const selectedWeapons = loadoutState.selectedWeaponIds || [];
  const readyBoss = bossBlueprints.some((boss) => boss.id === loadoutState.selectedBossId && isBossUnlocked(boss));
  const readyWeapons = selectedWeapons.length === 2
    && new Set(selectedWeapons).size === 2
    && selectedWeapons.every((id) => weapons.some((weapon) => weapon.id === id && isWeaponUnlocked(weapon)));
  const ready = readyBoss && readyWeapons;
  ui.enterBattleBtn.disabled = !ready;
  ui.enterBattleBtn.title = ready ? "进入挑战" : "请选择 Boss，并携带 2 件武器";
  if (ui.nextSkillBtn) {
    ui.nextSkillBtn.disabled = !ready;
    ui.nextSkillBtn.title = ready ? "进入技能配置" : "请选择 Boss，并携带 2 件武器";
  }
  if (ui.nextSkillFromWeaponBtn) {
    ui.nextSkillFromWeaponBtn.disabled = !ready;
    ui.nextSkillFromWeaponBtn.title = ready ? "进入技能配置" : "请选择 Boss，并携带 2 件武器";
  }
  if (ui.enterBattleFromLinksBtn) {
    ui.enterBattleFromLinksBtn.disabled = !ready;
    ui.enterBattleFromLinksBtn.title = ready ? "进入挑战" : "请选择 Boss，并携带 2 件武器";
  }
}

function setPrebattleStep(step) {
  if (step !== "weapons") {
    loadoutState.weaponDetailOpen = false;
    loadoutState.weaponSkillPickerOpen = false;
  }
  if (step === "battle") {
    enterBattleFromLoadout();
    return;
  }
  if (step === "skills") {
    updateEnterBattleState();
    if (ui.nextSkillBtn?.disabled) {
      loadoutState.prebattleStep = "loadout";
    } else {
      loadoutState.prebattleStep = "skills";
      renderPrebattleSkillConfig();
    }
  } else if (step === "character") {
    loadoutState.prebattleStep = "character";
    renderCharacterInfo();
  } else if (step === "loadout") {
    loadoutState.prebattleStep = "loadout";
    renderPrebattleLoadout();
  } else if (step === "armorBoard") {
    loadoutState.prebattleStep = "armorBoard";
    renderStandaloneArmorEnergyBoard();
  } else if (step === "weapons") {
    loadoutState.prebattleStep = "weapons";
    renderPrebattleWeapons();
  } else if (step === "links") {
    loadoutState.prebattleStep = "links";
    renderTacticalLinkPage();
  } else {
    loadoutState.prebattleStep = "boss";
  }
  renderPrebattleFlow();
}

function openCharacterDestination(tabId) {
  loadoutState.activeCharacterTab = tabId || "skills";
  if (tabId === "skills") {
    setPrebattleStep("skills");
    return;
  }
  if (tabId === "weapons") {
    loadoutState.activeWeaponSlot = 0;
    setPrebattleStep("weapons");
    return;
  }
  if (tabId === "links") {
    setPrebattleStep("links");
    return;
  } else {
    loadoutState.activePartId = "head";
    loadoutState.activeSlot = "base";
  }
  loadoutState.isFocusing = false;
  hideLoadoutTacticalInfo();
  setPrebattleStep("loadout");
}

function renderPrebattleFlow() {
  if (!ui.prebattleScreen) return;
  ui.prebattleScreen.dataset.step = loadoutState.prebattleStep;
  ui.prebattleStepButtons.forEach((button) => {
    const isActive = button.dataset.prebattleStep === loadoutState.prebattleStep;
    button.classList.toggle("active", isActive);
  });
}

function showLoadoutTacticalInfo(item, anchor) {
  const info = item.tacticalInfo;
  if (!info) return;
  let panel = document.getElementById("loadoutTacticalInfo");
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "loadoutTacticalInfo";
    panel.className = "loadout-tactical-info";
    panel.setAttribute("aria-live", "polite");
    document.getElementById("prebattleScreen")?.appendChild(panel);
  }
  panel.innerHTML = `
    <button class="loadout-tactical-close" type="button" aria-label="关闭">×</button>
    <div class="loadout-tactical-head">
      <span class="loadout-tactical-icon">${renderLoadoutItemPreview(item, item.icon)}</span>
      <div>
        <strong>${info.title}</strong>
        <small>${info.role}</small>
      </div>
    </div>
    <dl>
      <div>
        <dt>触发</dt>
        <dd>${info.trigger}</dd>
      </div>
      <div>
        <dt>效果</dt>
        <dd>${info.effect}</dd>
      </div>
    </dl>
  `;
  panel.querySelector(".loadout-tactical-close")?.addEventListener("click", hideLoadoutTacticalInfo);
  positionLoadoutTacticalInfo(panel, anchor);
  panel.classList.add("active");
}

function hideLoadoutTacticalInfo() {
  document.getElementById("loadoutTacticalInfo")?.classList.remove("active");
}

function positionLoadoutTacticalInfo(panel, anchor) {
  const screen = document.getElementById("prebattleScreen");
  if (!screen || !anchor) return;
  const screenRect = screen.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const bubbleW = 300;
  const bubbleH = 174;
  const anchorCenter = anchorRect.left - screenRect.left + anchorRect.width / 2;
  const left = Math.min(screenRect.width - bubbleW - 18, Math.max(18, anchorCenter - bubbleW / 2));
  const canShowAbove = anchorRect.top - screenRect.top > bubbleH + 26;
  const top = canShowAbove
    ? anchorRect.top - screenRect.top - bubbleH - 14
    : anchorRect.bottom - screenRect.top + 14;
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.setProperty("--bubble-arrow-left", `${Math.max(22, Math.min(bubbleW - 22, anchorCenter - left))}px`);
  panel.classList.toggle("below", !canShowAbove);
  panel.classList.toggle("above", canShowAbove);
}

function findLoadoutSlotButton(key) {
  return [...document.querySelectorAll(".attachment-slot")].find((button) => button.dataset.slotKey === key) || null;
}

function renderLoadoutItemPreview(item, fallback) {
  if (item?.image) return `<img src="${item.image}" alt="" />`;
  return `<strong>${item?.icon || fallback}</strong>`;
}

function getLoadoutSlotSocketCount(partId, slot) {
  return loadoutSlotSocketCounts[`${partId}:${slot}`] || 0;
}

function getLoadoutItemSocketCount(item) {
  return Number(item?.socketCount) || 0;
}

function renderSocketCountMark(count, extraClass = "") {
  const normalized = Math.max(0, Math.min(6, Number(count) || 0));
  if (!normalized) return "";
  const label = `${normalized}孔制式`;
  const pips = socketCountPipMap[normalized] || [];
  return `
    <span class="socket-dice ${extraClass}" title="${label}" aria-label="${label}">
      ${pips.map((position) => `<i class="socket-pip socket-pip-${position}" aria-hidden="true"></i>`).join("")}
    </span>
  `;
}

function isLoadoutItemSocketCompatible(activePart, slot, item) {
  const slotCount = getLoadoutSlotSocketCount(activePart.id, slot);
  const itemCount = getLoadoutItemSocketCount(item);
  return Boolean(slotCount && itemCount && slotCount >= itemCount);
}

function getLoadoutOptions(activePart, slot) {
  if (slot === "base") {
    return attachmentOptions.filter((item) => item.category === "base" && item.parts?.includes(activePart.id));
  }
  if (activePart.id === "pants" && slot === "前腰") {
    return attachmentOptions.filter((item) => item.name === "酒葫芦");
  }
  return attachmentOptions.filter((item) => {
    if (item.category === "base" || !item.slots?.length) return false;
    return item.slots.some((candidateSlot) => activePart.slots.includes(candidateSlot));
  });
}

function updateLoadoutFocus(activePart) {
  const screen = document.getElementById("prebattleScreen");
  if (!screen) return;
  screen.dataset.focus = loadoutState.isFocusing ? loadoutFocusMap[loadoutState.activeSlot] || activePart.id : "full";
}

function enterBattleFromLoadout() {
  updateEnterBattleState();
  if (ui.enterBattleBtn?.disabled) {
    setPrebattleStep("loadout");
    return;
  }
  document.getElementById("prebattleScreen")?.classList.add("is-hidden");
  document.getElementById("battleApp")?.classList.remove("is-hidden");
  resetGame();
}

function showWeakpointTip(message, duration = 1.5) {
  ui.weakpointTip.querySelector("p").textContent = message;
  ui.weakpointTip.classList.remove("hidden");
  state.weakpointTipTimer = duration;
}

function currentWeapon() {
  const carried = carriedWeapons();
  return carried.find((weapon) => weapon.id === state.selectedWeaponId) || carried[0] || weapons[0];
}

function updatePlayerSpriteForWeapon() {
  const weapon = currentWeapon();
  if (!weapon.playerSprite || sprites.player.src.endsWith(weapon.playerSprite.replace("./", ""))) return;
  sprites.player.src = weapon.playerSprite;
}

function currentSkills() {
  return configuredWeaponSkills(state.selectedWeaponId);
}

function isLoadoutItemEquipped(itemName) {
  return Object.values(loadoutState.equipped).some((item) => item?.name === itemName);
}

function buildWeaponControls() {
  ui.weaponButtons.innerHTML = "";
  const equippedWeapons = carriedWeapons();
  ui.weaponOverlay?.style.setProperty("--weapon-count", String(equippedWeapons.length));
  equippedWeapons.forEach((weapon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weapon-card";
    button.dataset.weapon = weapon.id;
    button.innerHTML = `
      <span class="weapon-icon-frame">
        ${weapon.icon ? `<img src="${weapon.icon}" alt="${weapon.name}" />` : `<span class="weapon-icon-fallback">${weapon.short}</span>`}
      </span>
      <small>${weapon.role}</small>
    `;
    button.addEventListener("click", () => selectWeapon(weapon.id));
    ui.weaponButtons.appendChild(button);
  });
}

function renderWeaponToggle() {
  const weapon = currentWeapon();
  ui.weaponToggle.innerHTML = weapon.icon
    ? `<img src="${weapon.icon}" alt="${weapon.name}" />`
    : `<span class="weapon-icon-fallback">${weapon.short}</span>`;
  ui.weaponToggle.title = weapon.name;
}

function selectWeapon(weaponId) {
  if (!state || state.turn !== "player" || state.enemy.intent || state.result) return;
  if (!isWeaponCarried(weaponId)) return;
  if (state.selectedWeaponId === weaponId) return;
  state.selectedWeaponId = weaponId;
  const weapon = currentWeapon();
  updatePlayerSpriteForWeapon();
  log(`切换武器：${weapon.name}，技能列表已更新。`);
  buildSkillControls();
  renderWeaponToggle();
  closeWeaponOverlay();
  updateUi();
}

function buildSkillControls() {
  ui.skillButtons.innerHTML = "";
  ui.battleSkillButtons.innerHTML = "";
  currentSkills().forEach((skill) => {
    ui.skillButtons.appendChild(createSkillButton(skill, false));
    ui.battleSkillButtons.appendChild(createSkillButton(skill, true));
  });
}

function createSkillButton(skill, compact) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `skill-card${skill.actionCost > 0 ? " has-action-cost" : ""}${compact ? " battle-skill-card" : ""}`;
  button.dataset.skill = skill.id;
  button.dataset.targetParts = skill.targetParts.join(",");
  button.innerHTML = `
    ${skill.actionCost > 0 ? `<span class="action-cost-corner" style="--skill-color:${skill.color}"><b>${skill.actionCost}</b></span>` : ""}
    <span class="part-badge${skill.targetParts.length > 1 ? " part-badge-ring" : ""}${skillTargetClass(skill)}${skillTargetCountClass(skill)}" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
    <span class="skill-copy">
      <strong>${skill.name}</strong>
      ${renderSkillTags(skill)}
      <small>${skill.desc} ${skillSummaryText(skill)}</small>
    </span>
  `;
  button.addEventListener("pointerenter", () => setHoveredTargetParts(skill.targetParts));
  button.addEventListener("pointerleave", () => clearHoveredTargetParts());
  button.addEventListener("focus", () => setHoveredTargetParts(skill.targetParts));
  button.addEventListener("blur", () => clearHoveredTargetParts());
  button.querySelectorAll("[data-skill-tag]").forEach((tagButton) => {
    tagButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSkillTagBubble(tagButton, skill, tagButton.dataset.skillTag);
    });
  });
  button.addEventListener("click", () => useSkill(skill.id));
  return button;
}

function showSkillTagBubble(anchor, skill, tag) {
  let bubble = document.getElementById("skillTagBubble");
  if (!bubble) {
    bubble = document.createElement("aside");
    bubble.id = "skillTagBubble";
    bubble.className = "skill-tag-bubble";
    document.querySelector(".battle-frame")?.appendChild(bubble);
  }
  const copy = tag === "连击" && skill.comboChance
    ? `连击率增加 ${Math.round(skill.comboChance * 100)}%，技能命中后有概率追加一次普通攻击。`
    : `${tag}效果已生效。`;
  bubble.innerHTML = `<strong>${tag}</strong><span>${copy}</span>`;
  positionSkillTagBubble(bubble, anchor);
  bubble.classList.add("active");
  window.clearTimeout(bubble._hideTimer);
  bubble._hideTimer = window.setTimeout(() => bubble.classList.remove("active"), 2200);
}

function hideSkillTagBubble() {
  const bubble = document.getElementById("skillTagBubble");
  if (!bubble) return;
  window.clearTimeout(bubble._hideTimer);
  bubble.classList.remove("active");
}

function positionSkillTagBubble(bubble, anchor) {
  const frame = document.querySelector(".battle-frame");
  if (!frame || !anchor) return;
  const frameRect = frame.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const width = 230;
  const left = Math.min(frameRect.width - width - 12, Math.max(12, anchorRect.left - frameRect.left + anchorRect.width / 2 - width / 2));
  const top = Math.max(12, anchorRect.top - frameRect.top - 68);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function showSoulArmorTargetSelection(skill, dots) {
  state.soulTargetSelection = { skillId: skill.id, dots };
  state.activeSkill = skill;
  state.activeTarget = null;
  ui.battleSkillButtons.innerHTML = "";
  skill.targetParts.forEach((partId) => {
    const part = partById(partId);
    if (part) ui.battleSkillButtons.appendChild(createSoulTargetButton(skill, part));
  });
  ui.battleSkillOverlay.classList.add("active");
  closeWeaponOverlay();
  log(`${skill.name}已蓄力 ${dots} 档：选择释放部位。`);
  updateUi();
}

function createSoulTargetButton(skill, part) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "skill-card battle-skill-card soul-target-card";
  button.dataset.soulTarget = part.id;
  button.innerHTML = `
    <span class="part-badge" style="--skill-color:${skill.color}">${renderPartIconGroup([part.id], "badge")}</span>
    <span class="skill-copy">
      <strong>${part.label}</strong>
      <span class="skill-tags">
        <span class="skill-tag" style="--skill-color:${skill.color}">灵魂战甲</span>
        <span class="skill-tag" style="--skill-color:${skill.color}">目标部位</span>
      </span>
      <small>选择该部位释放当前蓄力档位。</small>
    </span>
  `;
  button.addEventListener("click", () => confirmSoulArmorTarget(part.id));
  return button;
}

function confirmSoulArmorTarget(partId) {
  const selection = state?.soulTargetSelection;
  if (!selection) return;
  const skill = soulArmorSkills.find((item) => item.id === selection.skillId);
  const target = partById(partId);
  if (!skill || !target || !canUseSoulArmorSkill(skill)) return;
  state.soulTargetSelection = null;
  buildSkillControls();
  ui.battleSkillOverlay.classList.remove("active");
  useSoulArmorSkill(skill.id, selection.dots, partId);
}

function setHoveredTargetParts(partIds) {
  hoveredTargetParts = [...new Set(partIds)];
}

function clearHoveredTargetParts() {
  hoveredTargetParts = [];
}

function skillSummaryText(skill) {
  if (skill.noEffect) return "";
  if (skill.statBonus) return `（${statBonusText(skill.statBonus)}）`;
  if (skill.summaryOverride) return `（${skill.summaryOverride}）`;
  const pieces = [`伤害 ${skill.damage}`];
  if (skill.maxDots) pieces[0] = `每档伤害 ${skill.damage}`;
  const armorDamage = effectiveArmorDamage(skill);
  if (skill.armorBreaker && armorDamage > 0) pieces.push(`破甲 ${armorDamage}`);
  if (skill.ammoCost) pieces.push(`弹药 ${skill.ammoCost}`);
  return `（${pieces.join(" / ")}）`;
}

function renderSkillTags(skill) {
  const tags = [];
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  if (!tags.length) return "";
  return `<span class="skill-tags skill-tags-visible">${tags
    .map((tag) => `<button class="skill-tag ${skillTagClass(tag)}" type="button" data-skill-tag="${tag}">${tag}</button>`)
    .join("")}</span>`;
}

function skillTagClass(tag) {
  if (tag === "未解锁") return "skill-tag-locked";
  if (tag === "连击") return "skill-tag-combo";
  if (tag.includes("破甲")) return "skill-tag-break";
  return "skill-tag-generic";
}

function hasQuiverPierceBuff(skill) {
  return skill.id === "bow_arm_pierce" && isLoadoutItemEquipped("箭袋");
}

function effectiveArmorDamage(skill) {
  return hasQuiverPierceBuff(skill) ? 120 : skill.armorDamage;
}

function toggleWeaponOverlay() {
  if (!state || state.result || state.turn !== "player" || state.enemy.intent) return;
  const expanded = !ui.weaponOverlay.classList.contains("expanded");
  ui.weaponOverlay.classList.toggle("expanded", expanded);
  ui.weaponToggle.setAttribute("aria-expanded", String(expanded));
}

function closeWeaponOverlay() {
  ui.weaponOverlay.classList.remove("expanded");
  ui.weaponToggle.setAttribute("aria-expanded", "false");
}

function updateBattleSkillOverlay() {
  const visible = state && state.turn === "player" && !state.enemy.intent && !state.result && !state.skillCinematic;
  ui.battleSkillOverlay.classList.toggle("active", Boolean(visible));
}

function availableSoulDots() {
  return Math.max(0, Math.min(4, Math.floor((state?.player.soul || 0) / 25)));
}

function buildSoulSkillControls() {
  ui.soulSkillButtons.innerHTML = "";
  soulArmorSkills.forEach((skill) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skill-card soul-skill-card";
    button.dataset.soulSkill = skill.id;
    button.innerHTML = `
      <span class="part-badge${skill.targetParts.length > 1 ? " part-badge-ring" : ""}${skillTargetClass(skill)}${skillTargetCountClass(skill)}" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
      <span class="skill-copy">
        <strong>${skill.name}</strong>
        <span class="skill-tags">
          <span class="skill-tag" style="--skill-color:${skill.color}">灵魂战甲</span>
          <span class="skill-tag" style="--skill-color:${skill.color}">${skill.kindLabel}</span>
          <span class="skill-tag" style="--skill-color:${skill.color}">${skill.targetLabel}</span>
        </span>
        <small>${skill.desc} ${skillSummaryText(skill)}</small>
      </span>
    `;
    button.addEventListener("click", () => showSoulArmorTargetSelection(skill, 1));
    ui.soulSkillButtons.appendChild(button);
  });
}

function partIcon(label) {
  if (label.includes("+")) return "群";
  if (label.includes("手")) return "手";
  if (label.includes("脚")) return "脚";
  if (label.includes("胸")) return "胸";
  return label.slice(0, 1);
}

function partIconInfo(partId) {
  const map = {
    core: { src: "./assets/part-core.png", label: "胸部" },
    arms: { src: "./assets/part-arms.png", label: "手部" },
    legs: { src: "./assets/part-feet.png", label: "脚部" },
  };
  return map[partId];
}

function renderPartIconGroup(partIds, mode) {
  const icons = partIds
    .map((partId) => {
      const info = partIconInfo(partId);
      if (!info) return "";
      return `
        <span class="part-icon-wrap part-icon-${mode}" title="${info.label}">
          <img class="part-icon" src="${info.src}" alt="${info.label}" />
          <b>${info.label}</b>
        </span>
      `;
    })
    .filter(Boolean);
  if (icons.length <= 1) return icons.join("");
  return `<span class="part-icon-cluster part-icon-cluster-${Math.min(icons.length, 4)} part-icon-${mode}-cluster">${icons.join("")}</span>`;
}

function skillTargetClass(skill) {
  return (skill.targetParts || []).length > 1 ? " multi-target" : "";
}

function skillTargetCountClass(skill) {
  const count = Math.min((skill.targetParts || []).length, 4);
  return count > 1 ? ` target-count-${count}` : "";
}

function log(text) {
  state.log.push(text);
  if (state.log.length > 36) state.log.shift();
  renderLog();
}

function partById(id) {
  return state.enemy.parts.find((part) => part.id === id);
}

function livingParts() {
  return state.enemy.parts.filter((part) => !part.broken);
}

function totalEnemyHp() {
  const partHp = state.enemy.parts.reduce((sum, part) => sum + Math.max(0, part.hp), 0);
  return Math.max(0, partHp - (state.enemy.extraDamage || 0) + (state.enemy.aoeHpCompensation || 0));
}

function canUseSkill(skill) {
  if (!state || state.result || state.turn !== "player" || state.enemy.intent || state.skillCinematic) return false;
  if (skill.actionCost && state.player.action < skill.actionCost) return false;
  if (skill.ammoCost && state.player.ammo < skill.ammoCost) return false;
  return skill.targetParts.some((partId) => {
    const target = partById(partId);
    return Boolean(target);
  });
}

function canUseSoulArmorSkill(skill) {
  if (!state || state.result || state.turn !== "player" || state.enemy.intent || state.skillCinematic) return false;
  if (availableSoulDots() < 1) return false;
  return skill.targetParts.some((partId) => {
    const target = partById(partId);
    return Boolean(target);
  });
}

function useSkill(skillId) {
  const skill = currentSkills().find((item) => item.id === skillId);
  if (!skill || !canUseSkill(skill)) return;
  ui.battleSkillOverlay.classList.remove("active");
  closeWeaponOverlay();

  const targets = skill.targetParts.map(partById).filter(Boolean);
  state.activeSkill = skill;
  state.activeTarget = targets.length > 1 ? "multi" : targets[0]?.id;
  state.actionAnimTimer = 0.45;
  state.phase = "玩家行动";

  if (skill.ammoCost) {
    state.player.ammo -= skill.ammoCost;
  }
  if (skill.actionCost) {
    state.player.action = Math.max(0, state.player.action - skill.actionCost);
  }

  if (skill.stance === "greatsword_counter") {
    activateGreatswordCounterStance(skill);
    updateUi();
    return;
  }

  if (skill.accessoryFlow) {
    startAccessorySkillFlow(skill, targets);
    updateUi();
    return;
  }

  if (skill.cinematicVideo) {
    startCinematicSkillVideo(skill, targets);
    updateUi();
    return;
  }

  if (shouldUseDefaultMeleeCinematic(skill)) {
    startDefaultMeleeSkillFlow(skill, targets);
    updateUi();
    return;
  }

  settlePlayerSkill(skill, targets);
}

function shouldUseDefaultMeleeCinematic(skill) {
  return ["fists", "greatsword"].includes(skill.weaponId);
}

function activateGreatswordCounterStance(skill) {
  state.player.guardCounterChance = 0.7;
  state.player.nextDamageBonus = Math.max(state.player.nextDamageBonus || 0, 0.2);
  state.activeTarget = "core";
  state.actionAnimTimer = 0.45;
  state.skillCinematic = {
    skill,
    stage: "greatsword_stance",
    elapsed: 0,
    duration: 0.86,
    settled: false,
  };
  log(`${skill.name}：进入大剑防守蓄势。受到怪物攻击后有 70% 概率反击，下次出手伤害提高 20%。`);
}

function startCinematicSkillVideo(skill, targets) {
  state.skillCinematic = { skill, targets, stage: "skill_video" };
  log(`${skill.name}发动：播放专属表现。`);
  playCinematicVideo(skill.cinematicVideo, false, () => {
    finishCinematicSkillVideo();
  });
}

function finishCinematicSkillVideo() {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "skill_video") return;
  hideVideoOverlay();
  state.skillCinematic = null;
  settlePlayerSkill(cinematic.skill, cinematic.targets);
}

function settlePlayerSkill(skill, targets, context = {}) {
  const nextDamageMultiplier = state.player.nextDamageBonus && skill.damage > 0 ? 1 + state.player.nextDamageBonus : 1;
  const summary = targets.map((target) => applySkillToPart(target, skill, { ...context, nextDamageMultiplier }));
  if (nextDamageMultiplier > 1) {
    log(`蓄势兑现：${skill.name} 伤害提高 ${Math.round((nextDamageMultiplier - 1) * 100)}%。`);
    state.player.nextDamageBonus = 0;
  }
  normalizeAoeBossHpDamage(skill, summary);
  const interruptedAttack = checkPendingAttackInterrupt(targets);
  updateStage();
  logSkillSummary(skill, summary);
  if (interruptedAttack) {
    log(`打断成功：${interruptedAttack.label} 被手部攻击中断。`);
    showWeakpointTip("手部被击中，巨石投掷已被打断。", 1.8);
  }

  if (state.enemy.hp <= 0) {
    state.result = "victory";
    state.phase = "胜利";
    state.turn = "ended";
    log("Boss 被击败，战斗胜利。");
  } else {
    const comboRoll = rollComboFollowUp(skill, targets);
    if (comboRoll?.triggered) {
      startComboFollowUpFlow(skill, comboRoll.target);
      updateUi();
      return;
    }
    if (comboRoll) {
      log(`连击未触发：${skill.name}本次没有追加普通攻击。`);
    }
    endPlayerTurn();
  }

  updateUi();
}

function normalizeAoeBossHpDamage(skill, summary) {
  if (skill.kind !== "aoe" || summary.length <= 1) return;
  const hpImpacts = summary.map((result) => Math.max(0, (result.damage || 0) + (result.globalChipDamage || 0)));
  const totalImpact = hpImpacts.reduce((sum, value) => sum + value, 0);
  const allowedImpact = Math.round(totalImpact / hpImpacts.length);
  const compensation = Math.max(0, totalImpact - allowedImpact);
  if (compensation <= 0) return;
  state.enemy.aoeHpCompensation = (state.enemy.aoeHpCompensation || 0) + compensation;
  state.enemy.hp = totalEnemyHp();
  log(`AOE结算：${skill.name} 对Boss总血量计入 ${allowedImpact} 点平均伤害，其余用于部位压制。`);
}

function rollComboFollowUp(skill, targets) {
  if (!skill.comboChance || !targets.length || state.enemy.hp <= 0) return null;
  const target = targets[0];
  if (!target) return null;
  if (Math.random() > skill.comboChance) {
    return { triggered: false, damage: 0 };
  }
  return { triggered: true, target };
}

function startComboFollowUpFlow(skill, target) {
  state.skillCinematic = {
    skill,
    target,
    targets: [target],
    stage: "combo_followup",
    elapsed: 0,
    duration: 0.72,
    settled: false,
  };
  state.phase = "连击追打";
  log(`连击触发：${skill.name}追加一次普通攻击。`);
}

function applyComboFollowUpDamage(skill, target) {
  const comboSkill = { name: "连击追打", color: skill.color };
  const baseDamage = skill.comboDamage || NORMAL_ATTACK_DAMAGE;
  let damage = baseDamage + (state.player.attack || 0);
  if (target.broken) {
    damage = Math.round(baseDamage * 1.2);
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
  } else if (target.armorState === "armored") {
    damage = Math.max(1, Math.round(baseDamage * 0.2));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
  } else {
    target.hp = Math.max(0, target.hp - damage);
  }
  state.enemy.hp = totalEnemyHp();
  addSkillResultFloater(comboSkill, damage, "damage", { x: partPosition(target.id).x + 22, y: partPosition(target.id).y + 22 }, skill.color);
  if (!target.broken && target.hp <= 0) {
    breakPart(target);
  }
  updateStage();
  log(`连击追打：造成 ${damage} 点普通攻击伤害。`);
  return { damage, target };
}

function checkPendingAttackInterrupt(targets) {
  const pending = state.enemy.pendingAttack;
  if (!pending || pending.stage !== "prepared") return null;
  const attack = pending.attack || pending;
  const didHitInterruptPart = targets.some((target) => target.id === attack.interruptPart);
  if (!didHitInterruptPart) return null;
  state.enemy.pendingAttack = { ...pending, interrupted: true };
  state.pendingHandWarning = false;
  return attack;
}

function startAccessorySkillFlow(skill, targets) {
  state.skillCinematic = { skill, targets, stage: "intro", selectedAccessory: null };
  log(`${skill.name}发动：进入挂件协同选择。`);
  playCinematicVideo(skill.accessoryFlow.introVideo, false, () => {
    if (!state?.skillCinematic || state.skillCinematic.skill.id !== skill.id) return;
    showAccessorySelectionLoop(skill, targets);
  });
}

function showAccessorySelectionLoop(skill, targets) {
  state.skillCinematic = { skill, targets, stage: "select", selectedAccessory: null };
  ui.accessoryChoice.classList.remove("hidden");
  playCinematicVideo(skill.accessoryFlow.selectLoopVideo, true);
}

function chooseAccessory(accessoryId) {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "select") return;
  const effect = cinematic.skill.accessoryFlow.effects[accessoryId];
  if (!effect) return;
  cinematic.stage = "effect";
  cinematic.selectedAccessory = accessoryId;
  ui.accessoryChoice.classList.add("hidden");
  log(`挂件选择：${effect.label}。`);
  playCinematicVideo(effect.video, false, () => {
    finishAccessorySkillFlow(effect);
  });
}

function finishAccessorySkillFlow(effect) {
  const cinematic = state?.skillCinematic;
  if (!cinematic) return;
  hideVideoOverlay();
  state.skillCinematic = null;
  settlePlayerSkill(cinematic.skill, cinematic.targets, { accessoryEffect: effect });
}

function startDefaultMeleeSkillFlow(skill, targets) {
  state.skillCinematic = {
    skill,
    targets,
    stage: "default_melee",
    elapsed: 0,
    duration: DEFAULT_MELEE_CINEMATIC_DURATION,
    settled: false,
  };
  log(`${skill.name}发动：近身突进打击。`);
}

function updateDefaultMeleeSkillFlow(delta) {
  const cinematic = state?.skillCinematic;
  if (!cinematic || !["default_melee", "combo_followup"].includes(cinematic.stage)) return;
  cinematic.elapsed += delta;
  if (cinematic.elapsed < cinematic.duration || cinematic.settled) return;
  cinematic.settled = true;
  state.skillCinematic = null;
  if (cinematic.stage === "combo_followup") {
    applyComboFollowUpDamage(cinematic.skill, cinematic.target);
    if (state.enemy.hp <= 0) {
      state.result = "victory";
      state.phase = "胜利";
      state.turn = "ended";
      log("Boss 被连击追打击败，战斗胜利。");
    } else {
      endPlayerTurn();
    }
    updateUi();
    return;
  }
  settlePlayerSkill(cinematic.skill, cinematic.targets);
}

function useSoulArmorSkill(skillId, dots = 1, targetPartId = null) {
  const skill = soulArmorSkills.find((item) => item.id === skillId);
  if (!skill || !canUseSoulArmorSkill(skill)) return;
  const selectedTargetId = targetPartId || skill.targetParts[0];
  const target = partById(selectedTargetId);
  if (!target) return;
  const spendDots = Math.max(1, Math.min(skill.maxDots || 4, availableSoulDots(), dots));
  const soulCost = spendDots * skill.soulCost;

  state.activeSkill = skill;
  state.activeTarget = null;
  state.actionAnimTimer = 0.45;
  state.phase = "玩家行动";
  state.player.soul = Math.max(0, state.player.soul - soulCost);
  state.soulChargeDots = 0;
  ui.soulArmorButton.classList.remove("charging");

  const targets = [target];
  state.activeTarget = target.id;
  log(`${skill.name}发动：${spendDots} 档释放，目标${target.label}。`);
  targets.forEach((target) => {
    const brokenBonus = target.broken ? 1.2 : 1;
    const attackBonus = state.player.attack || 0;
    const baseDamage = skill.damage * spendDots + attackBonus;
    const damage = Math.round((target.weakpoint ? baseDamage * 1.35 : baseDamage) * brokenBonus);
    if (target.broken) {
      state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
    } else {
      target.hp = Math.max(0, target.hp - damage);
    }
    addSkillResultFloater(skill, damage, "damage", partPosition(target.id), skill.color);
    log(`${target.label}受到战甲压制 ${damage} 伤害。`);
    if (!target.broken && target.hp <= 0) {
      breakPart(target);
    }
  });

  state.enemy.hp = totalEnemyHp();
  updateStage();

  if (state.enemy.hp <= 0) {
    state.result = "victory";
    state.phase = "胜利";
    state.turn = "ended";
    log("Boss 被击败，战斗胜利。");
  } else {
    endPlayerTurn();
  }

  updateUi();
}

function startSoulArmorHold(event) {
  event.preventDefault();
  const skill = soulArmorSkills[0];
  if (!skill || !canUseSoulArmorSkill(skill)) return;
  clearSoulHoldTimer();
  state.soulChargeDots = 1;
  ui.soulArmorButton.classList.add("charging");
  updateUi();
  soulHoldTimer = window.setInterval(() => {
    const maxDots = Math.min(skill.maxDots || 4, availableSoulDots());
    if (state.soulChargeDots < maxDots) {
      state.soulChargeDots += 1;
      updateUi();
    }
  }, 520);
}

function releaseSoulArmorHold(event) {
  event.preventDefault();
  const skill = soulArmorSkills[0];
  if (!skill || !state || state.soulChargeDots < 1) {
    clearSoulHoldTimer();
    return;
  }
  const dots = state.soulChargeDots;
  clearSoulHoldTimer();
  ui.soulArmorButton.classList.remove("charging");
  showSoulArmorTargetSelection(skill, dots);
}

function cancelSoulArmorHold() {
  clearSoulHoldTimer();
  if (state) state.soulChargeDots = 0;
  ui.soulArmorButton.classList.remove("charging");
  updateUi();
}

function clearSoulHoldTimer() {
  if (soulHoldTimer) {
    window.clearInterval(soulHoldTimer);
    soulHoldTimer = null;
  }
}

function applySkillToPart(target, skill, context = {}) {
  let damage = skill.damage > 0 ? skill.damage + (state.player.attack || 0) : skill.damage;
  let armorDamage = effectiveArmorDamage(skill);
  let armorDamageDone = 0;
  let globalChipDamage = 0;
  let bounced = false;
  let exposedNow = false;
  const accessoryMultiplier = context.accessoryEffect?.damageMultiplier || 1;
  const damageMultiplier = accessoryMultiplier * (context.nextDamageMultiplier || 1);

  if (target.broken) {
    damage = Math.round(damage * damageMultiplier * 1.2 * (target.weakpoint ? skill.exposedBonus : Math.max(1, skill.exposedBonus)));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
    state.player.soul = Math.min(100, state.player.soul + skill.soulGain + 4);
    state.enemy.hp = totalEnemyHp();
    addSkillResultFloater(skill, damage, "damage", partPosition(target.id), skill.color);
    return { target, damage, armorDamage: 0, bounced: false, exposedNow: false, brokenNow: false, brokenTarget: true };
  }

  if (target.armorState === "armored") {
    if (skill.armorBreaker) {
      armorDamageDone = Math.min(target.armorValue, Math.max(0, armorDamage));
      target.armorValue = Math.max(0, target.armorValue - armorDamage);
      if (target.armorValue <= 0) {
        exposedNow = exposePart(target);
      }
    } else {
      bounced = true;
      armorDamage = armorDamage > 0 ? Math.max(1, Math.round(armorDamage * 0.25)) : 0;
      armorDamageDone = Math.min(target.armorValue, Math.max(0, armorDamage));
      target.armorValue = Math.max(0, target.armorValue - armorDamage);
      if (target.armorValue <= 0) {
        exposedNow = exposePart(target);
      }
    }
    globalChipDamage = Math.max(1, Math.round(damage * damageMultiplier * 0.2));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + globalChipDamage;
    damage = 0;
  } else {
    damage = Math.round(damage * (target.weakpoint ? skill.exposedBonus : Math.max(1, skill.exposedBonus)));
    damage = Math.round(damage * damageMultiplier);
    target.hp = Math.max(0, target.hp - damage);
  }
  state.player.soul = Math.min(100, state.player.soul + skill.soulGain + (bounced ? 0 : 4));
  state.enemy.hp = totalEnemyHp();
  if (damage > 0) {
    addSkillResultFloater(skill, damage, "damage", partPosition(target.id), skill.color);
  } else if (armorDamageDone > 0) {
    addSkillResultFloater(skill, armorDamageDone, "armor", partPosition(target.id), bounced ? "#b8bdc5" : "#f4f7fb");
    if (globalChipDamage > 0) {
      addSkillResultFloater(skill, globalChipDamage, "damage", { x: partPosition(target.id).x, y: partPosition(target.id).y + 28 }, skill.color);
    }
  } else if (globalChipDamage > 0) {
    addSkillResultFloater(skill, globalChipDamage, "damage", partPosition(target.id), skill.color);
  }

  let brokenNow = false;
  if (!target.broken && target.hp <= 0) {
    brokenNow = true;
    breakPart(target);
  }

  return { target, damage, armorDamage: armorDamageDone, globalChipDamage, bounced, exposedNow, brokenNow };
}

function logSkillSummary(skill, results) {
  const targetNames = results.map((item) => item.target.label).join("、");
  const tagText = `${currentWeapon().name}/${skill.kindLabel}/${skill.targetLabel}`;
  log(`${skill.name}发动：${tagText}，命中${targetNames}。`);
  results.forEach((item) => {
    if (item.brokenTarget) {
      log(`${item.target.label}已被破坏，追击该部位获得 20% 增伤，造成 ${item.damage} 伤害。`);
    } else if (item.bounced) {
      log(`${item.target.label}硬甲弹开了攻击，造成 ${item.armorDamage} 点低效破甲，并造成 ${item.globalChipDamage || 0} 点总血量伤害。`);
    } else if (item.target.armorState === "armored") {
      log(`${item.target.label}硬甲受到 ${item.armorDamage} 破甲值，并造成 ${item.globalChipDamage || 0} 点总血量伤害。`);
    } else if (item.exposedNow) {
      log(`${item.target.label}护甲被击破，部位血量从下一次命中开始受损。`);
    } else {
      log(`${item.target.label}受到 ${item.damage} 伤害。`);
    }
  });
}

function exposePart(target) {
  if (target.armorState !== "armored") return false;
  target.armorState = "exposed";
  target.armorValue = 0;
  log(`${target.label}破甲：熔岩硬甲脱落，进入裸露状态。`);
  return true;
}

function breakPart(target) {
  target.broken = true;
  target.hp = 0;
  target.armorState = "broken";
  state.player.soul = Math.min(100, state.player.soul + 18);
  state.enemy.hp = totalEnemyHp();
  log(`部位破坏：${target.label}。效果：${target.effect}。`);
  showWeakpointTip(`太好了，${target.label}部位已破坏`, 2.2);
}

function updateStage() {
  const brokenCount = state.enemy.parts.filter((part) => part.broken).length;
  const exposedCount = state.enemy.parts.filter((part) => part.armorState === "exposed").length;
  const nextStage = brokenCount >= 2 || exposedCount >= 3 ? 2 : 1;
  if (nextStage !== state.enemy.stage) {
    state.enemy.stage = nextStage;
    log("Boss 进入狂暴状态，下一次攻击更危险。");
  }
}

function endPlayerTurn() {
  state.turn = "enemy";
  state.phase = "敌方回合";
  window.setTimeout(() => {
    if (!state || state.result || state.turn !== "enemy") return;
    createEnemyThreat();
  }, 450);
}

function endEnemyTurn() {
  if (state.result) return;
  state.round += 1;
  state.enemy.intent = null;
  state.reactionTimer = 0;
  state.activeSkill = null;
  state.activeTarget = null;
  state.player.action = Math.min(state.player.maxAction, state.player.action + 2);
  ui.reactionPanel.classList.add("hidden");
  log(`第 ${state.round} 回合：行动力恢复 2。`);
  beginPlayerTurn();
}

function beginPlayerTurn(options = {}) {
  state.turn = "player_start";
  state.phase = "玩家回合准备";
  ui.reactionPanel.classList.add("hidden");
  updateUi();
  const shouldTryGourd = state.player.gourdUses < GOURD_MAX_USES && state.player.hp < state.player.maxHp;
  if (shouldTryGourd && Math.random() < GOURD_HEAL_CHANCE) {
    triggerGourdHeal();
    return;
  }
  enterPlayerActionPhase(options);
}

function triggerGourdHeal() {
  state.skillCinematic = { stage: "gourd_heal" };
  state.phase = "酒葫芦饮用";
  state.player.gourdUses += 1;
  log(`酒葫芦触发：饮酒恢复 ${GOURD_HEAL_AMOUNT} 点生命。`);
  updateUi();
  playCinematicVideo("./assets/videos/gourd-heal.mp4", false, () => {
    finishGourdHeal();
  });
}

function finishGourdHeal() {
  if (!state || state.result) return;
  hideVideoOverlay();
  state.skillCinematic = null;
  const before = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + GOURD_HEAL_AMOUNT);
  const healed = state.player.hp - before;
  if (healed > 0) {
    addPlayerHealFloater(healed);
  }
  enterPlayerActionPhase();
}

function enterPlayerActionPhase() {
  state.turn = "player";
  state.phase = "玩家回合";
  updatePendingEnemyWarning();
  log("玩家行动开始。");
  updateUi();
  draw();
}

function updatePendingEnemyWarning() {
  const pendingAttack = currentPendingEnemyAttack();
  state.pendingHandWarning = pendingAttack?.id === "rock_throw" && !state.enemy.pendingAttack?.interrupted && !isPartBroken(pendingAttack.interruptPart);
  if (state.pendingHandWarning) {
    showWeakpointTip(pendingAttack.warningText, 2.4);
    state.pendingWeakpointWarning = false;
    return;
  }
  const nextAttack = peekNextAvailableEnemyAttack();
  state.pendingWeakpointWarning = nextAttack?.id === "lava_burst";
  if (state.pendingWeakpointWarning) {
    showWeakpointTip(nextAttack.warningText, 2.4);
  }
}

function createEnemyThreat() {
  const pendingAttack = currentPendingEnemyAttack();
  if (pendingAttack) {
    if (!isEnemyAttackAvailable(pendingAttack)) {
      logDisabledEnemyAttack(pendingAttack);
      state.enemy.pendingAttack = null;
      state.enemy.intent = null;
      advanceEnemyAttack();
      createEnemyThreat();
      return;
    }
    releaseDelayedEnemyAttack(pendingAttack);
    return;
  }
  const attack = getNextAvailableEnemyAttack({ logSkip: true });
  if (!attack) {
    log("Boss 当前没有可用技能，结束行动。");
    endEnemyTurn();
    return;
  }
  if (attack.type === "delayed_unblockable") {
    startDelayedEnemyAttackPrepare(attack);
    return;
  }
  state.enemy.intent = attack;
  state.pendingWeakpointWarning = false;
  state.pendingHandWarning = false;
  state.qte = null;
  state.phase = "敌方视频攻击";
  ui.reactionPanel.classList.add("hidden");
  log(`Boss 行动：${attack.label}。`);
  if (attack.type === "video_qte") {
    state.videoAttack = { attack, stage: "intro", qteResolved: false, result: null };
    playVideo(attack.introVideo, () => {
      if (!state || !state.videoAttack || state.videoAttack.stage !== "intro") return;
      resolveVideoQte("fail");
    });
  } else {
    state.videoAttack = null;
    startTimedEnemyQte(attack);
  }
  updateUi();
}

function currentPendingEnemyAttack() {
  const pending = state.enemy.pendingAttack;
  if (!pending || pending.stage !== "prepared") return null;
  return pending.attack || pending;
}

function isPartBroken(partId) {
  return !!partById(partId)?.broken;
}

function enemyAttackDisabledReason(attack) {
  if (attack.type === "delayed_unblockable" && attack.sourcePart && isPartBroken(attack.sourcePart)) {
    const part = partById(attack.sourcePart);
    return `${part?.label || "对应部位"}已破坏`;
  }
  return "";
}

function isEnemyAttackAvailable(attack) {
  return !enemyAttackDisabledReason(attack);
}

function logDisabledEnemyAttack(attack) {
  const reason = enemyAttackDisabledReason(attack);
  if (!reason) return;
  state.enemy.skippedAttackNotices ||= [];
  if (state.enemy.skippedAttackNotices.includes(attack.id)) return;
  state.enemy.skippedAttackNotices.push(attack.id);
  log(`${attack.label}已从循环中移除：${reason}。Boss 将继续使用剩余技能。`);
}

function peekNextAvailableEnemyAttack() {
  for (let offset = 0; offset < enemyAttackSequence.length; offset += 1) {
    const attack = enemyAttackSequence[(state.enemy.attackIndex + offset) % enemyAttackSequence.length];
    if (isEnemyAttackAvailable(attack)) return attack;
  }
  return null;
}

function getNextAvailableEnemyAttack({ logSkip = false } = {}) {
  for (let checked = 0; checked < enemyAttackSequence.length; checked += 1) {
    const attack = enemyAttackSequence[state.enemy.attackIndex % enemyAttackSequence.length];
    if (isEnemyAttackAvailable(attack)) return attack;
    if (logSkip) logDisabledEnemyAttack(attack);
    advanceEnemyAttack();
  }
  return null;
}

function advanceEnemyAttack() {
  state.enemy.attackIndex += 1;
}

function startDelayedEnemyAttackPrepare(attack) {
  if (isPartBroken(attack.sourcePart)) {
    logDisabledEnemyAttack(attack);
    advanceEnemyAttack();
    createEnemyThreat();
    return;
  }
  state.enemy.intent = attack;
  state.enemy.pendingAttack = { attack, stage: "prepared", interrupted: false };
  state.pendingWeakpointWarning = false;
  state.pendingHandWarning = true;
  state.qte = null;
  state.videoAttack = null;
  state.phase = "敌方准备";
  ui.reactionPanel.classList.add("hidden");
  log(`Boss 准备：${attack.label}。下一回合将投掷巨石，攻击手部可打断。`);
  showWeakpointTip(attack.warningText, 2.4);
  playCinematicVideo(attack.prepareVideo, false, () => {
    hideVideoOverlay();
    if (!state || state.result) return;
    state.enemy.intent = null;
    endEnemyTurn();
  });
  updateUi();
}

function releaseDelayedEnemyAttack(attack) {
  const pending = state.enemy.pendingAttack;
  state.pendingHandWarning = false;
  state.pendingWeakpointWarning = false;
  state.qte = null;
  state.videoAttack = null;
  ui.reactionPanel.classList.add("hidden");

  if (isPartBroken(attack.sourcePart)) {
    logDisabledEnemyAttack(attack);
    state.enemy.pendingAttack = null;
    state.enemy.intent = null;
    advanceEnemyAttack();
    createEnemyThreat();
    return;
  }

  if (pending?.interrupted) {
    log(`${attack.label}释放失败：准备动作被打断。`);
    state.enemy.pendingAttack = null;
    state.enemy.intent = null;
    advanceEnemyAttack();
    endEnemyTurn();
    return;
  }

  state.enemy.intent = attack;
  state.phase = "敌方释放";
  state.qte = { active: false, locked: true, reason: "unavoidable" };
  log(`Boss 释放：${attack.label}。该攻击无法闪避或格挡。`);
  playCinematicVideo(attack.releaseVideo, false, () => {
    finishDelayedEnemyAttack(attack);
  });
  updateUi();
}

function applyPlayerDamage(attack, damage, options = {}) {
  if (damage <= 0) return;
  const mitigatedDamage = Math.max(1, damage - (state.player.defense || 0));
  state.player.hp = Math.max(0, state.player.hp - mitigatedDamage);
  state.playerHitFlashTimer = 0.42;
  playerHitFloaters.push({
    text: `受到${attack.label}攻击，损失${mitigatedDamage}点血量`,
    x: canvas.width / 2,
    y: canvas.height * 0.38,
    life: 1.25,
  });
  log(`受到${attack.label}攻击，防御抵消 ${damage - mitigatedDamage} 点，损失${mitigatedDamage}点血量。`);
  if (options.allowCounter !== false) {
    resolveGreatswordCounterAfterHit(attack);
  }
}

function resolveGreatswordCounterAfterHit(attack) {
  const chance = state.player.guardCounterChance || 0;
  if (chance <= 0 || state.result) return;
  state.player.guardCounterChance = 0;
  if (Math.random() <= chance) {
    applyGuardCounterDamage(attack, 18, "大剑蓄势反击");
    return;
  }
  log("大剑蓄势反击未触发。");
}

function applyGuardCounterDamage(attack, damage = 10, counterName = "格挡反击") {
  const target = partById("core") || livingParts()[0];
  if (!target) return;
  const counterSkill = { name: counterName, color: "#ffe08a" };
  if (target.broken) {
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
  } else {
    target.hp = Math.max(0, target.hp - damage);
  }
  state.enemy.hp = totalEnemyHp();
  addSkillResultFloater(counterSkill, damage, "damage", partPosition(target.id), counterSkill.color);
  if (counterName === "格挡反击") {
    log(`格挡反击：化解${attack.label}后，对${target.label}造成 ${damage} 点伤害。`);
  } else {
    log(`${counterName}：承受${attack.label}后，对${target.label}造成 ${damage} 点伤害。`);
  }
  if (!target.broken && target.hp <= 0) {
    breakPart(target);
    updateStage();
  }
}

function finishDelayedEnemyAttack(attack) {
  hideVideoOverlay();
  const damage = attack.damageOnRelease;
  state.qte = null;
  applyPlayerDamage(attack, damage, { allowCounter: false });
  state.enemy.pendingAttack = null;
  state.enemy.intent = null;
  advanceEnemyAttack();

  if (state.player.hp <= 0) {
    state.result = "defeat";
    state.turn = "ended";
    state.phase = "失败";
    log("玩家倒下，战斗失败。");
    updateUi();
    return;
  }

  endEnemyTurn();
}

function react(type) {
  if (!state.enemy.intent || state.turn !== "enemy" || state.result) return;
  if (state.qte?.locked || state.enemy.intent.type === "delayed_unblockable") {
    log(`${state.enemy.intent.label}无法通过${reactionLabel(type)}规避。`);
    return;
  }
  if (state.qte && state.qte.active) {
    const success = state.qte.validResponses.includes(type);
    if (state.videoAttack) {
      resolveVideoQte(success ? "success" : "fail", type);
    } else {
      resolveTimedEnemyQte(success);
    }
  }
}

function startTimedEnemyQte(attack) {
  state.phase = "敌方大招";
  state.reactionTimer = attack.qteDuration;
  state.reactionDuration = attack.qteDuration;
  state.qte = {
    active: true,
    validResponses: attack.validResponses,
  };
  ui.reactionPanel.classList.remove("hidden");
  ui.threatText.textContent = `Boss 发动「${attack.label}」。A 左闪 / D 右闪；不可格挡。`;
}

function resolveTimedEnemyQte(success) {
  if (!state.enemy.intent || !state.qte?.active) return;
  const attack = state.enemy.intent;
  state.qte = null;
  state.reactionTimer = 0;
  ui.reactionPanel.classList.add("hidden");
  const damage = success ? attack.damageOnSuccess : attack.damageOnFail;
  if (damage > 0) {
    applyPlayerDamage(attack, damage);
    log("闪避失败：胸口熔岩喷射命中。");
  } else {
    log("闪避成功：避开胸口熔岩喷射。");
  }
  state.enemy.attackIndex += 1;
  state.enemy.intent = null;

  if (state.player.hp <= 0) {
    state.result = "defeat";
    state.turn = "ended";
    state.phase = "失败";
    log("玩家倒下，战斗失败。");
    updateUi();
    return;
  }

  endEnemyTurn();
}

function playVideo(src, onEnded) {
  ui.videoOverlay.classList.remove("hidden");
  ui.qteOverlay.classList.add("hidden");
  ui.accessoryChoice.classList.add("hidden");
  ui.skillVideo.loop = false;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.src = src;
  ui.skillVideo.currentTime = 0;
  const finish = () => finishActiveVideo(onEnded);
  activeVideoSkipHandler = finish;
  ui.skillVideo.onended = finish;
  ui.skillVideo.onerror = () => {
    activeVideoSkipHandler = null;
    log("视频播放失败，使用默认失败结算。");
    if (state?.videoAttack) {
      resolveVideoQte("fail");
    }
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      activeVideoSkipHandler = null;
      log("浏览器阻止了视频自动播放，使用默认失败结算。");
      if (state?.videoAttack) {
        resolveVideoQte("fail");
      }
    });
  }
}

function playCinematicVideo(src, loop = false, onEnded = null) {
  ui.videoOverlay.classList.remove("hidden");
  ui.qteOverlay.classList.add("hidden");
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.loop = loop;
  ui.skillVideo.src = src;
  ui.skillVideo.currentTime = 0;
  const finish = () => finishActiveVideo(onEnded);
  activeVideoSkipHandler = loop || !onEnded ? null : finish;
  ui.skillVideo.onended = loop ? null : finish;
  ui.skillVideo.onerror = () => {
    activeVideoSkipHandler = null;
    log("技能表现视频播放失败，跳过当前表现。");
    if (onEnded) onEnded();
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      activeVideoSkipHandler = null;
      log("浏览器阻止了技能表现视频自动播放，跳过当前表现。");
      if (onEnded) onEnded();
    });
  }
}

function finishActiveVideo(onEnded) {
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  if (onEnded) onEnded();
}

function skipCurrentVideo() {
  if (!activeVideoSkipHandler || ui.videoOverlay.classList.contains("hidden")) return false;
  const finish = activeVideoSkipHandler;
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.pause();
  log("已跳过当前视频，进入结算。");
  finish();
  return true;
}

function maybeOpenVideoQte() {
  if (!state.videoAttack || state.videoAttack.stage !== "intro" || state.videoAttack.qteResolved) return;
  const attack = state.videoAttack.attack;
  const time = ui.skillVideo.currentTime || 0;
  if (time < attack.qteStart || time > attack.qteEnd) return;
  state.qte = {
    active: true,
    start: attack.qteStart,
    end: attack.qteEnd,
    validResponses: attack.validResponses,
  };
  ui.qteTitle.textContent = "QTE";
  ui.qteCopy.textContent = "D 右闪 / W 格挡";
  ui.qteOverlay.classList.remove("hidden");
}

function updateVideoQteUi() {
  if (!state.qte?.active) return;
  const duration = Math.max(0.01, state.qte.end - state.qte.start);
  const remaining = Math.max(0, state.qte.end - (ui.skillVideo.currentTime || 0));
  ui.qteGauge.style.width = `${Math.min(100, (remaining / duration) * 100)}%`;
  if ((ui.skillVideo.currentTime || 0) >= state.qte.end) {
    resolveVideoQte("fail");
  }
}

function resolveVideoQte(result, responseType = null) {
  if (!state.videoAttack || state.videoAttack.qteResolved) return;
  const attack = state.videoAttack.attack;
  state.videoAttack.qteResolved = true;
  state.videoAttack.result = result;
  state.videoAttack.responseType = responseType;
  state.videoAttack.stage = "result";
  state.qte = null;
  ui.qteOverlay.classList.add("hidden");
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.pause();
  const success = result === "success";
  log(success ? "QTE 成功：右闪/格挡化解攻击。" : "QTE 失败：未能化解右侧进攻。");
  playVideo(success ? attack.successVideo : attack.failVideo, () => finishVideoEnemyAttack(success));
}

function reactionLabel(type) {
  if (type === "left") return "左闪";
  if (type === "right") return "右闪";
  if (type === "block") return "格挡";
  return "反应";
}

function finishVideoEnemyAttack(success) {
  if (!state.videoAttack) return;
  const attack = state.videoAttack.attack;
  const responseType = state.videoAttack.responseType;
  const damage = success ? attack.damageOnSuccess : attack.damageOnFail;
  if (damage > 0) {
    applyPlayerDamage(attack, damage);
    log("格挡/闪避失败：玩家受到伤害。");
  } else {
    if (success && responseType === "block") {
      applyGuardCounterDamage(attack);
      log("格挡成功：玩家没有受到伤害，并造成少量反击。");
    } else {
      log("闪避成功：玩家没有受到伤害。");
    }
  }
  hideVideoOverlay();
  state.videoAttack = null;
  state.qte = null;
  state.enemy.intent = null;
  state.enemy.attackIndex += 1;

  if (state.enemy.hp <= 0) {
    state.result = "victory";
    state.phase = "胜利";
    state.turn = "ended";
    log("Boss 被格挡反击击败，战斗胜利。");
    updateUi();
    return;
  }

  if (state.player.hp <= 0) {
    state.result = "defeat";
    state.turn = "ended";
    state.phase = "失败";
    log("玩家倒下，战斗失败。");
    updateUi();
    return;
  }

  endEnemyTurn();
}

function hideVideoOverlay() {
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.loop = false;
  ui.skillVideo.pause();
  ui.skillVideo.removeAttribute("src");
  ui.skillVideo.load();
  ui.qteOverlay.classList.add("hidden");
  ui.accessoryChoice.classList.add("hidden");
  ui.videoOverlay.classList.add("hidden");
}

function partPosition(id) {
  const map = {
    arms: { x: 1012, y: 390 },
    core: { x: 910, y: 334 },
    legs: { x: 940, y: 492 },
  };
  return map[id] || map.core;
}

function partEffectPositions(id) {
  if (id !== "arms") return [partPosition(id)];
  const rockPose = currentPendingEnemyAttack()?.id === "rock_throw";
  return rockPose
    ? [
        { x: 854, y: 418 },
        { x: 1062, y: 388 },
      ]
    : [
        { x: 830, y: 405 },
        { x: 1045, y: 382 },
      ];
}

function bossSpriteForState() {
  const pendingRockThrow = currentPendingEnemyAttack()?.id === "rock_throw";
  if (pendingRockThrow && !state.enemy.pendingAttack?.interrupted && !isPartBroken("arms") && sprites.bossRockThrow.complete) {
    return sprites.bossRockThrow;
  }
  const arms = partById("arms").armorState !== "armored" || partById("arms").broken;
  const legs = partById("legs").armorState !== "armored" || partById("legs").broken;
  const core = partById("core").broken;
  if (core && sprites.bossChestBroken.complete) return sprites.bossChestBroken;
  if (arms && legs && sprites.bossArmsLegsBroken.complete) return sprites.bossArmsLegsBroken;
  if (arms && sprites.bossArmsBroken.complete) return sprites.bossArmsBroken;
  if (legs && sprites.bossLegsBroken.complete) return sprites.bossLegsBroken;
  return sprites.boss;
}

function update(delta) {
  if (!state) return;
  state.time += delta;
  if (state.weakpointTipTimer > 0) {
    state.weakpointTipTimer = Math.max(0, state.weakpointTipTimer - delta);
    if (state.weakpointTipTimer <= 0) {
      ui.weakpointTip.classList.add("hidden");
    }
  }
  state.actionAnimTimer = Math.max(0, state.actionAnimTimer - delta);
  state.playerHitFlashTimer = Math.max(0, state.playerHitFlashTimer - delta);
  updateGreatswordStanceFlow(delta);
  updateDefaultMeleeSkillFlow(delta);
  floaters = floaters
    .map((floater) => ({ ...floater, y: floater.y - 36 * delta, life: floater.life - delta }))
    .filter((floater) => floater.life > 0);
  playerHitFloaters = playerHitFloaters
    .map((floater) => ({ ...floater, y: floater.y - 24 * delta, life: floater.life - delta }))
    .filter((floater) => floater.life > 0);
  if (state.videoAttack && state.turn === "enemy") {
    maybeOpenVideoQte();
    updateVideoQteUi();
  } else if (state.qte?.active && state.enemy.intent?.type === "timed_qte") {
    state.reactionTimer = Math.max(0, state.reactionTimer - delta);
    if (state.reactionTimer <= 0) {
      resolveTimedEnemyQte(false);
    }
  }
}

function updateGreatswordStanceFlow(delta) {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "greatsword_stance") return;
  cinematic.elapsed += delta;
  if (cinematic.elapsed < cinematic.duration || cinematic.settled) return;
  cinematic.settled = true;
  state.skillCinematic = null;
  endPlayerTurn();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawCombatants();
  drawWeakpointEffects();
  drawGreatswordStanceEffects();
  drawDefaultMeleeCinematicEffects();
  drawFloaters();
  drawThreatOverlay();
  drawPlayerDamageFeedback();
  drawHoveredTargetHighlights();
}

function drawBackground() {
  if (sprites.background.complete && sprites.background.naturalWidth) {
    drawCoverImage(sprites.background, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#101114";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(4, 8, 12, 0.2)");
  gradient.addColorStop(1, "rgba(4, 6, 9, 0.42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCombatants() {
  const meleeFx = currentDefaultMeleeCinematic();
  const player = meleeFx ? meleePlayerPose(meleeFx) : { x: 365, footY: 738, height: 455 };
  const bossImage = bossSpriteForState();
  const rockPose = bossImage === sprites.bossRockThrow;
  const boss = rockPose ? { x: 945, bottom: 570, height: 360 } : { x: 938, bottom: 560, height: 330 };
  state.currentBossDraw = {
    image: bossImage,
    x: boss.x,
    y: boss.bottom - boss.height,
    height: boss.height,
    width: bossImage.complete && bossImage.naturalHeight ? boss.height * (bossImage.naturalWidth / bossImage.naturalHeight) : boss.height,
  };
  if (meleeFx) {
    drawSprite(bossImage, boss.x, boss.bottom - boss.height, boss.height, false);
    drawMeleeDashAfterimage(player);
    drawSprite(sprites.player, player.x, player.footY - player.height, player.height, true);
    drawPlayerGourd(player);
  } else {
    drawSprite(sprites.player, player.x, player.footY - player.height, player.height, true);
    drawPlayerGourd(player);
    drawSprite(bossImage, boss.x, boss.bottom - boss.height, boss.height, false);
  }
  drawPlayerHud(canvas.width - 172, canvas.height - 42);
  const bossHpW = Math.min(360, canvas.width * 0.34);
  const bossHpX = canvas.width / 2 - bossHpW / 2;
  const bossHpY = 18;
  drawHealthBar(bossHpX, bossHpY, bossHpW, state.enemy.hp / state.enemy.maxHp, "#e86c62");
  drawBarText(bossHpX, bossHpY, bossHpW, 7, `${state.enemy.hp}/${state.enemy.maxHp}`);
  drawArmorStatus(bossHpX, bossHpY + 14, bossHpW);
}

function drawPlayerGourd(player) {
  if (!sprites.loadoutGourd.complete || !sprites.loadoutGourd.naturalWidth) return;
  const size = Math.max(24, player.height * 0.1);
  const x = player.x - player.height * 0.02;
  const y = player.footY - player.height * 0.44;
  ctx.save();
  ctx.shadowColor = "rgba(255, 176, 74, 0.55)";
  ctx.shadowBlur = state?.skillCinematic?.stage === "gourd_heal" ? 18 : 5;
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.drawImage(sprites.loadoutGourd, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawGreatswordStanceEffects() {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "greatsword_stance") return;
  const progress = Math.max(0, Math.min(1, cinematic.elapsed / cinematic.duration));
  const pulse = 0.55 + 0.45 * Math.sin(state.time * 34);
  const x = 365 + Math.sin(state.time * 92) * (2 + pulse * 3);
  const footY = 738;
  const bodyY = footY - 230;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const aura = ctx.createRadialGradient(x, bodyY, 10, x, bodyY, 190 + pulse * 28);
  aura.addColorStop(0, `rgba(255, 230, 190, ${0.25 + pulse * 0.2})`);
  aura.addColorStop(0.28, `rgba(255, 46, 28, ${0.3 + pulse * 0.22})`);
  aura.addColorStop(1, "rgba(255, 0, 0, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, 126 + pulse * 18, 188 + pulse * 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 68, 42, ${0.55 + pulse * 0.28})`;
  ctx.lineWidth = 4 + pulse * 3;
  ctx.beginPath();
  ctx.ellipse(x, footY - 18, 84 + progress * 26, 22 + pulse * 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const angle = state.time * 5 + i * 0.7;
    const px = x + Math.cos(angle) * (48 + i * 7);
    const py = bodyY + Math.sin(angle * 1.4) * 90;
    ctx.fillStyle = `rgba(255, ${90 + i * 8}, 42, ${0.32 + pulse * 0.24})`;
    ctx.beginPath();
    ctx.arc(px, py, 3 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = "900 22px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(32, 0, 0, 0.88)";
  ctx.fillStyle = "#ffcf8a";
  ctx.strokeText("蓄势", x, bodyY - 178);
  ctx.fillText("蓄势", x, bodyY - 178);
  ctx.restore();
}

function drawHoveredTargetHighlights() {
  if (!hoveredTargetParts.length || !state || state.result) return;
  const pulse = 0.65 + 0.35 * Math.sin(state.time * 9);
  const bossDraw = state.currentBossDraw;
  if (!bossDraw?.image?.complete || !bossDraw.image.naturalWidth) return;
  hoveredTargetParts.forEach((partId) => {
    const part = partById(partId);
    if (!part) return;
    drawBossPartPixelOutline(bossDraw, partId, pulse);
  });
}

function bossPartSourceRegions(image, partId) {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  if (image === sprites.bossRockThrow) {
    const regions = {
      arms: [
        { x: 0.08 * w, y: 0.3 * h, w: 0.32 * w, h: 0.38 * h },
        { x: 0.62 * w, y: 0.18 * h, w: 0.34 * w, h: 0.46 * h },
      ],
      legs: [
        { x: 0.31 * w, y: 0.63 * h, w: 0.2 * w, h: 0.34 * h },
        { x: 0.48 * w, y: 0.62 * h, w: 0.24 * w, h: 0.36 * h },
      ],
      core: [{ x: 0.36 * w, y: 0.42 * h, w: 0.28 * w, h: 0.2 * h }],
    };
    return regions[partId] || [];
  }
  const regions = {
    arms: [
      { x: 0.08 * w, y: 0.28 * h, w: 0.25 * w, h: 0.45 * h },
      { x: 0.68 * w, y: 0.16 * h, w: 0.24 * w, h: 0.5 * h },
    ],
    legs: [
      { x: 0.28 * w, y: 0.55 * h, w: 0.22 * w, h: 0.4 * h },
      { x: 0.48 * w, y: 0.55 * h, w: 0.24 * w, h: 0.4 * h },
    ],
    core: [{ x: 0.34 * w, y: 0.18 * h, w: 0.3 * w, h: 0.38 * h }],
  };
  return regions[partId] || [];
}

function bossPartHighlightColor(partId) {
  if (partId === "arms") return "#ffdf78";
  if (partId === "legs") return "#8fd7ff";
  return "#ff7b54";
}

function drawBossPartPixelOutline(bossDraw, partId, pulse) {
  const color = bossPartHighlightColor(partId);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  drawPartFallbackContour(bossDraw, partId, pulse, color);
  ctx.restore();
}

function drawPartFallbackContour(bossDraw, partId, pulse, color) {
  const points = bossPartFallbackPoints(bossDraw.image, partId);
  if (!points.length) return;
  const sx = bossDraw.width;
  const sy = bossDraw.height;
  const dx = bossDraw.x - bossDraw.width / 2;
  const dy = bossDraw.y;
  strokePartContour(points, dx, dy, sx, sy, color, 5, 0.88 + pulse * 0.12, 20 + pulse * 16);
  strokePartContour(points, dx, dy, sx, sy, "#fff6d8", 2, 0.82 + pulse * 0.18, 2);
}

function strokePartContour(points, dx, dy, sx, sy, color, lineWidth, alpha, shadowBlur) {
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = shadowBlur;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  points.forEach((poly) => {
    ctx.beginPath();
    poly.forEach((point, index) => {
      const x = dx + point[0] * sx;
      const y = dy + point[1] * sy;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  });
}

function bossPartFallbackPoints(image, partId) {
  const rock = image === sprites.bossRockThrow;
  if (partId === "arms") {
    return rock
      ? [
          [[0.12, 0.34], [0.23, 0.29], [0.34, 0.39], [0.32, 0.58], [0.22, 0.68], [0.1, 0.6], [0.06, 0.47]],
          [[0.65, 0.22], [0.84, 0.17], [0.95, 0.29], [0.93, 0.54], [0.84, 0.65], [0.69, 0.55], [0.61, 0.38]],
        ]
      : [
          [[0.1, 0.32], [0.21, 0.27], [0.31, 0.39], [0.29, 0.62], [0.2, 0.72], [0.1, 0.67], [0.06, 0.5]],
          [[0.69, 0.22], [0.83, 0.15], [0.91, 0.29], [0.89, 0.56], [0.8, 0.67], [0.7, 0.58], [0.66, 0.38]],
        ];
  }
  if (partId === "legs") {
    return rock
      ? [
          [[0.31, 0.63], [0.46, 0.62], [0.5, 0.78], [0.46, 0.96], [0.32, 0.97], [0.25, 0.82]],
          [[0.48, 0.62], [0.65, 0.63], [0.73, 0.83], [0.69, 0.98], [0.52, 0.96], [0.45, 0.78]],
        ]
      : [
          [[0.28, 0.56], [0.45, 0.56], [0.5, 0.78], [0.47, 0.94], [0.31, 0.94], [0.24, 0.76]],
          [[0.48, 0.56], [0.67, 0.57], [0.73, 0.82], [0.67, 0.96], [0.51, 0.93], [0.45, 0.75]],
        ];
  }
  return rock
    ? [[[0.37, 0.43], [0.49, 0.39], [0.63, 0.45], [0.62, 0.58], [0.48, 0.64], [0.36, 0.58]]]
    : [[[0.35, 0.2], [0.5, 0.15], [0.64, 0.27], [0.61, 0.47], [0.48, 0.57], [0.34, 0.43]]];
}

function getBossEdgeMask(image, partId) {
  let imageCache = bossEdgeMaskCache.get(image);
  if (!imageCache) {
    imageCache = {};
    bossEdgeMaskCache.set(image, imageCache);
  }
  if (imageCache[partId]) return imageCache[partId];
  if (!image.naturalWidth || !image.naturalHeight) return null;

  const source = document.createElement("canvas");
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  sourceCtx.drawImage(image, 0, 0);
  const sourceData = sourceCtx.getImageData(0, 0, source.width, source.height);
  const mask = document.createElement("canvas");
  mask.width = source.width;
  mask.height = source.height;
  const maskCtx = mask.getContext("2d");
  const output = maskCtx.createImageData(mask.width, mask.height);
  const regions = bossPartSourceRegions(image, partId);
  regions.forEach((region) => writeEdgeRegion(sourceData, output, region, partId === "core", bossPartHighlightColor(partId)));
  maskCtx.putImageData(output, 0, 0);
  imageCache[partId] = mask;
  return mask;
}

function writeEdgeRegion(sourceData, output, region, useLavaCore, color) {
  const width = sourceData.width;
  const height = sourceData.height;
  const x0 = Math.max(1, Math.floor(region.x));
  const y0 = Math.max(1, Math.floor(region.y));
  const x1 = Math.min(width - 2, Math.ceil(region.x + region.w));
  const y1 = Math.min(height - 2, Math.ceil(region.y + region.h));
  const data = sourceData.data;
  const out = output.data;
  const isTarget = (x, y) => {
    const i = (y * width + x) * 4;
    const alpha = data[i + 3];
    if (useLavaCore) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      return alpha > 70 && r > 130 && g > 45 && b < 75;
    }
    return alpha > 70;
  };

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (!isTarget(x, y)) continue;
      const edge =
        !isTarget(x - 1, y) ||
        !isTarget(x + 1, y) ||
        !isTarget(x, y - 1) ||
        !isTarget(x, y + 1) ||
        localColorEdge(data, width, x, y);
      if (!edge) continue;
      writeEdgeDot(out, width, height, x, y, color, useLavaCore ? 2 : 3);
    }
  }
}

function localColorEdge(data, width, x, y) {
  const center = (y * width + x) * 4;
  const right = (y * width + x + 1) * 4;
  const down = ((y + 1) * width + x) * 4;
  const luma = (i) => data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  const colorDistance = (a, b) =>
    Math.abs(data[a] - data[b]) +
    Math.abs(data[a + 1] - data[b + 1]) +
    Math.abs(data[a + 2] - data[b + 2]);
  return Math.abs(luma(center) - luma(right)) > 28 || Math.abs(luma(center) - luma(down)) > 28 || colorDistance(center, right) > 82 || colorDistance(center, down) > 82;
}

function writeEdgeDot(out, width, height, x, y, color, radius) {
  const rgb = hexToRgb(color);
  for (let oy = -radius; oy <= radius; oy += 1) {
    for (let ox = -radius; ox <= radius; ox += 1) {
      if (ox * ox + oy * oy > radius * radius) continue;
      const px = x + ox;
      const py = y + oy;
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const distance = Math.sqrt(ox * ox + oy * oy);
      const alpha = Math.round(255 * Math.max(0.35, 1 - distance / (radius + 0.8)));
      const oi = (py * width + px) * 4;
      out[oi] = rgb.r;
      out[oi + 1] = rgb.g;
      out[oi + 2] = rgb.b;
      out[oi + 3] = Math.max(out[oi + 3], alpha);
    }
  }
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.replace(/(.)/g, "$1$1") : normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function currentDefaultMeleeCinematic() {
  const cinematic = state?.skillCinematic;
  if (!cinematic || !["default_melee", "combo_followup"].includes(cinematic.stage)) return null;
  const progress = Math.max(0, Math.min(1, cinematic.elapsed / cinematic.duration));
  return { ...cinematic, progress };
}

function meleePlayerPose(meleeFx) {
  const progress = meleeFx.progress;
  const isCombo = meleeFx.stage === "combo_followup";
  const arrive = easeOutCubic(Math.min(1, progress / (isCombo ? 0.16 : 0.22)));
  const exit = progress > (isCombo ? 0.68 : 0.72) ? easeInOutCubic((progress - (isCombo ? 0.68 : 0.72)) / (isCombo ? 0.32 : 0.28)) : 0;
  const nearX = isCombo ? 812 : meleeFx.skill.weaponId === "greatsword" ? 760 : 782;
  const nearFootY = isCombo ? 622 : meleeFx.skill.weaponId === "greatsword" ? 642 : 630;
  const nearHeight = isCombo ? 302 : meleeFx.skill.weaponId === "greatsword" ? 340 : 315;
  const home = { x: 365, footY: 738, height: 455 };
  const attackLean = Math.sin(Math.min(1, progress / (isCombo ? 0.5 : 0.65)) * Math.PI) * (isCombo ? 28 : 18);
  return {
    x: lerp(home.x, nearX + attackLean, arrive) + exit * (isCombo ? 70 : 44),
    footY: lerp(home.footY, nearFootY, arrive),
    height: lerp(home.height, nearHeight, arrive),
  };
}

function drawMeleeDashAfterimage(player) {
  const meleeFx = currentDefaultMeleeCinematic();
  if (!meleeFx || meleeFx.progress > 0.36) return;
  const alpha = Math.max(0, 0.34 - meleeFx.progress * 0.8);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i += 1) {
    drawSprite(sprites.player, player.x - 42 - i * 34, player.footY - player.height, player.height, true);
  }
  ctx.restore();
}

function drawDefaultMeleeCinematicEffects() {
  const meleeFx = currentDefaultMeleeCinematic();
  if (!meleeFx) return;
  const targets = meleeFx.targets?.length ? meleeFx.targets : [partById("core")].filter(Boolean);
  const hitTimings = meleeFx.stage === "combo_followup" ? [0.4, 0.55] : meleeFx.skill.kind === "aoe" ? [0.34, 0.49, 0.64] : [0.43, 0.58];
  const color = meleeFx.skill.color || "#f0b84f";
  targets.forEach((target, targetIndex) => {
    const pos = partPosition(target.id);
    if (meleeFx.stage === "combo_followup" && targetIndex === 0) {
      drawComboFollowupMark(pos, meleeFx.progress, color);
    }
    hitTimings.forEach((hitTime, hitIndex) => {
      const offsetTime = hitTime + targetIndex * 0.045;
      const intensity = hitPulse(meleeFx.progress, offsetTime, 0.09);
      if (intensity <= 0) return;
      drawBossHitCard(pos, intensity, color, targetIndex + hitIndex);
      drawSlashFlash(pos, intensity, color, hitIndex);
    });
  });
}

function drawComboFollowupMark(pos, progress, color) {
  const appear = easeOutCubic(Math.min(1, progress / 0.18));
  const fade = progress > 0.72 ? 1 - easeOutCubic((progress - 0.72) / 0.28) : 1;
  const pulse = Math.max(hitPulse(progress, 0.4, 0.16), hitPulse(progress, 0.55, 0.16));
  const alpha = Math.max(0, appear * fade);
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(pos.x, pos.y - 112 - pulse * 16);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(8, 16, 14, 0.72)";
  ctx.strokeStyle = hexToRgba(color, 0.9);
  ctx.lineWidth = 2;
  roundedRect(-66, -19, 132, 38, 10);
  ctx.fill();
  ctx.stroke();
  ctx.globalCompositeOperation = "lighter";
  ctx.font = "900 20px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0, 20, 8, 0.85)";
  ctx.fillStyle = "#d8ffe6";
  ctx.strokeText("连击追打", 0, 1);
  ctx.fillText("连击追打", 0, 1);
  ctx.restore();
}

function drawBossHitCard(pos, intensity, color, index) {
  const wobble = Math.sin(state.time * 42 + index) * 5 * intensity;
  const w = 96 + 28 * intensity;
  const h = 118 + 22 * intensity;
  ctx.save();
  ctx.translate(pos.x + wobble, pos.y - 6);
  ctx.rotate((-0.08 + index * 0.025) * intensity);
  ctx.globalAlpha = 0.22 + 0.42 * intensity;
  ctx.fillStyle = "rgba(8, 10, 14, 0.72)";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 + 3 * intensity;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.globalCompositeOperation = "lighter";
  const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 0.76);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${0.72 * intensity})`);
  gradient.addColorStop(0.22, hexToRgba(color, 0.62 * intensity));
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.48, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSlashFlash(pos, intensity, color, index) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = Math.min(1, 0.35 + intensity);
  ctx.translate(pos.x, pos.y);
  ctx.rotate(index % 2 === 0 ? -0.52 : 0.44);
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.96)";
  ctx.lineWidth = 9 * intensity + 2;
  ctx.beginPath();
  ctx.moveTo(-78 * intensity, -18);
  ctx.lineTo(88 * intensity, 18);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 18 * intensity + 5;
  ctx.globalAlpha = 0.22 + 0.36 * intensity;
  ctx.beginPath();
  ctx.moveTo(-90 * intensity, -22);
  ctx.lineTo(98 * intensity, 22);
  ctx.stroke();
  ctx.restore();
}

function hitPulse(progress, center, width) {
  const distance = Math.abs(progress - center);
  if (distance > width) return 0;
  return 1 - distance / width;
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function easeOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

function easeInOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.replace(/(.)/g, "$1$1") : normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawPlayerHud(x, y) {
  ctx.save();
  const panelX = x - 50;
  const panelY = y - 42;
  const avatarSize = 42;
  const barX = panelX + avatarSize + 8;
  const barW = 156;
  const showAmmo = state.selectedWeaponId === "bow";
  ctx.fillStyle = "rgba(3, 5, 8, 0.54)";
  roundedRect(panelX - 8, panelY - 8, 224, showAmmo ? 82 : 66, 8);
  ctx.fill();
  drawHudAvatar(panelX, panelY, avatarSize);
  drawPlayerHpStrip(barX, panelY + 3, barW);
  drawPlayerActionCells(barX, panelY + 28, barW);
  if (showAmmo) drawPlayerAmmoStrip(barX, panelY + 47, barW);
  ctx.restore();
}

function drawHudAvatar(x, y, size) {
  ctx.save();
  ctx.fillStyle = "rgba(20, 24, 30, 0.9)";
  roundedRect(x, y, size, size, 6);
  ctx.fill();
  if (sprites.playerAvatar.complete && sprites.playerAvatar.naturalWidth) {
    ctx.save();
    roundedRect(x, y, size, size, 6);
    ctx.clip();
    drawCoverImage(sprites.playerAvatar, x, y, size, size);
    ctx.restore();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  ctx.restore();
}

function drawPlayerHpStrip(x, y, width) {
  const ratio = Math.max(0, Math.min(1, state.player.hp / state.player.maxHp));
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 14, 0.88)";
  roundedRect(x, y, width, 18, 3);
  ctx.fill();
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, "#c9dde7");
  gradient.addColorStop(0.52, "#eef6f9");
  gradient.addColorStop(1, "#93aab5");
  ctx.fillStyle = gradient;
  roundedRect(x + 2, y + 2, Math.max(0, (width - 4) * ratio), 14, 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 17);
  drawBarText(x, y, width, 18, `${state.player.hp}/${state.player.maxHp}`);
  ctx.restore();
}

function drawPlayerActionCells(x, y, width) {
  const cells = state.player.maxAction;
  const gap = 3;
  const cellW = (width - gap * (cells - 1)) / cells;
  ctx.save();
  for (let i = 0; i < cells; i += 1) {
    const cx = x + i * (cellW + gap);
    const filled = i < state.player.action;
    ctx.fillStyle = filled ? "#2f8fff" : "rgba(18, 28, 40, 0.82)";
    roundedRect(cx, y, cellW, 13, 2);
    ctx.fill();
    if (filled) {
      ctx.fillStyle = "rgba(164, 218, 255, 0.55)";
      roundedRect(cx + 1, y + 1, cellW - 2, 3, 1);
      ctx.fill();
    }
    ctx.strokeStyle = filled ? "rgba(180, 224, 255, 0.62)" : "rgba(90, 119, 142, 0.44)";
    ctx.strokeRect(cx + 0.5, y + 0.5, cellW - 1, 12);
  }
  drawBarText(x, y, width, 13, `${state.player.action}/${state.player.maxAction}`);
  ctx.restore();
}

function drawPlayerAmmoStrip(x, y, width) {
  const cells = state.player.maxAmmo;
  const gap = 4;
  const cellW = (width - gap * (cells - 1)) / cells;
  ctx.save();
  for (let i = 0; i < cells; i += 1) {
    const cx = x + i * (cellW + gap);
    const filled = i < state.player.ammo;
    ctx.fillStyle = filled ? "#d7a94d" : "rgba(45, 32, 16, 0.82)";
    roundedRect(cx, y, cellW, 12, 2);
    ctx.fill();
    if (filled) {
      ctx.fillStyle = "rgba(255, 232, 165, 0.55)";
      roundedRect(cx + 1, y + 1, cellW - 2, 3, 1);
      ctx.fill();
    }
    ctx.strokeStyle = filled ? "rgba(255, 222, 140, 0.7)" : "rgba(148, 112, 58, 0.44)";
    ctx.strokeRect(cx + 0.5, y + 0.5, cellW - 1, 11);
  }
  drawBarText(x, y, width, 12, `弹药 ${state.player.ammo}/${state.player.maxAmmo}`);
  ctx.restore();
}

function drawSprite(image, centerX, topY, height, flip) {
  if (!image.complete || !image.naturalWidth) return;
  const width = height * (image.naturalWidth / image.naturalHeight);
  ctx.save();
  if (flip) {
    ctx.translate(centerX, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(image, -width / 2, topY, width, height);
  } else {
    ctx.drawImage(image, centerX - width / 2, topY, width, height);
  }
  ctx.restore();
}

function drawCoverImage(image, x, y, w, h) {
  const ratio = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / ratio;
  const sh = h / ratio;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function drawHealthBar(x, y, w, ratio, color, h = 7) {
  ctx.fillStyle = "rgba(3, 5, 8, 0.72)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.strokeRect(x, y, w, h);
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBarText(x, y, w, h, text) {
  ctx.save();
  ctx.font = "900 10px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.82)";
  ctx.fillStyle = "#f8fbff";
  ctx.strokeText(text, x + w / 2, y + h / 2 + 0.5);
  ctx.fillText(text, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
}

function drawName(x, y, text) {
  ctx.font = "18px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#eef2f7";
  ctx.fillText(text, x, y);
}

function drawWeakpointEffects() {
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 5.8);
  const core = partById("core");
  if (core && !core.broken) {
    const pos = partPosition("core");
    const introFocus = state.weakpointTipTimer > 0 && !state.pendingHandWarning;
    const redWarning = state.pendingWeakpointWarning || state.enemy.intent?.id === "lava_burst";
    drawCoreWeakpointGlow(pos, 22 + pulse * 4, pulse, introFocus, redWarning);
  }

  const arms = partById("arms");
  const handWarning = state.pendingHandWarning || currentPendingEnemyAttack()?.id === "rock_throw";
  if (arms && !arms.broken && handWarning) {
    partEffectPositions("arms").forEach((pos) => {
      drawCoreWeakpointGlow(pos, 15 + pulse * 3, pulse, true, true);
    });
  }
}

function drawCoreWeakpointGlow(pos, radius, pulse, introFocus, redWarning = false) {
  const focusBoost = introFocus ? 1.35 : 1;
  const glowRadius = radius + 22 * focusBoost + pulse * 9;
  const gradient = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, glowRadius);
  if (redWarning) {
    gradient.addColorStop(0, `rgba(255, 210, 210, ${0.82 * focusBoost})`);
    gradient.addColorStop(0.28, `rgba(255, 35, 24, ${0.58 * focusBoost})`);
    gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
  } else {
    gradient.addColorStop(0, `rgba(255, 238, 154, ${0.72 * focusBoost})`);
    gradient.addColorStop(0.24, `rgba(255, 96, 34, ${0.42 * focusBoost})`);
    gradient.addColorStop(1, "rgba(255, 80, 24, 0)");
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = redWarning ? `rgba(255, 42, 32, ${0.5 + pulse * 0.38})` : `rgba(255, 196, 72, ${0.4 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 1, radius * 0.48, radius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawArmorStatus(x, y, width) {
  const items = [
    { part: partById("core"), image: sprites.partCore },
    { part: partById("arms"), image: sprites.partArms },
    { part: partById("legs"), image: sprites.partFeet },
  ].filter((item) => item.part);
  const gap = 4;
  const segmentW = (width - gap * Math.max(0, items.length - 1)) / Math.max(1, items.length);
  ctx.save();
  ctx.font = "bold 11px Microsoft YaHei, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  items.forEach((item, index) => {
    const part = item.part;
    const armorRatio = part.maxArmor > 0 ? Math.max(0, part.armorValue) / part.maxArmor : 0;
    const hpRatio = Math.max(0, part.hp) / part.maxHp;
    const hasArmor = part.armorState === "armored" && armorRatio > 0 && !part.broken;
    const displayPercent = Math.round(Math.max(0, Math.min(1, hasArmor ? armorRatio : hpRatio)) * 100);
    const segmentX = x + index * (segmentW + gap);
    const barX = segmentX + 33;
    const barY = y + 6;
    const barW = Math.max(32, segmentW - 35);
    const barH = 10;
    ctx.fillStyle = "rgba(12, 14, 18, 0.78)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = part.broken ? "#303640" : "#58616c";
    ctx.fillRect(barX, barY, barW * Math.max(0, Math.min(1, hpRatio)), barH);
    if (hasArmor) {
      ctx.fillStyle = "#f0f3f7";
      ctx.fillRect(barX, barY, barW * Math.max(0, Math.min(1, armorRatio)), barH);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(barX, barY, barW, barH);
    drawArmorIcon(item.image, segmentX + 3, y - 3, 22, part.broken, hasArmor);
    drawBarText(barX, barY, barW, barH, `${displayPercent}%`);
  });
  ctx.restore();
}

function drawArmorIcon(image, x, y, size, destroyed = false, armored = false) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 6, 10, 0.82)";
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (image.complete && image.naturalWidth) {
    ctx.drawImage(image, x, y, size, size);
    if (armored) drawShieldBadge(x, y, size);
    if (destroyed) drawDestroyedCross(x, y, size);
    ctx.restore();
    return;
  }
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(x, y, size, size);
  if (armored) drawShieldBadge(x, y, size);
  if (destroyed) drawDestroyedCross(x, y, size);
  ctx.restore();
}

function drawShieldBadge(x, y, size) {
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = 3;
  if (sprites.armorShield.complete && sprites.armorShield.naturalWidth) {
    const aspect = sprites.armorShield.naturalWidth / sprites.armorShield.naturalHeight;
    const badgeW = Math.max(34, Math.round(size * 1.7));
    const badgeH = Math.round(badgeW / aspect);
    const badgeX = x + size - badgeW * 0.62;
    const badgeY = y + size - badgeH * 0.6;
    ctx.drawImage(sprites.armorShield, badgeX, badgeY, badgeW, badgeH);
  } else {
    const badgeSize = Math.max(18, Math.round(size * 0.9));
    const badgeX = x + size - badgeSize * 0.74;
    const badgeY = y + size - badgeSize * 0.7;
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffd36a";
    ctx.font = `900 ${Math.round(badgeSize * 0.66)}px Microsoft YaHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("甲", badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);
  }
  ctx.restore();
}

function drawDestroyedCross(x, y, size) {
  ctx.save();
  ctx.strokeStyle = "#ff3b2f";
  ctx.lineWidth = Math.max(3, size * 0.16);
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 3;
  const pad = Math.max(4, size * 0.18);
  ctx.beginPath();
  ctx.moveTo(x + pad, y + pad);
  ctx.lineTo(x + size - pad, y + size - pad);
  ctx.moveTo(x + size - pad, y + pad);
  ctx.lineTo(x + pad, y + size - pad);
  ctx.stroke();
  ctx.restore();
}

function drawFloaters() {
  floaters.forEach((floater) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, floater.life);
    const scale = 0.86 + 0.28 * Math.max(0, floater.life);
    const text = floater.text || `-${floater.value}`;
    const baseSize = floater.text ? 19 : 38;
    ctx.font = `900 ${Math.round(baseSize * scale)}px Microsoft YaHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(6, 8, 12, 0.88)";
    ctx.strokeText(text, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(text, floater.x, floater.y);
    ctx.restore();
  });
}

function drawThreatOverlay() {
  if (!state.enemy.intent || state.videoAttack) return;
  const ratio = state.reactionTimer / state.reactionDuration;
  ctx.save();
  ctx.fillStyle = `rgba(232, 42, 40, ${0.12 + 0.2 * Math.sin(state.time * 14)})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(18, 5, 5, 0.76)";
  ctx.fillRect(468, 72, 430, 78);
  ctx.fillStyle = "#ff4e44";
  ctx.fillRect(492, 124, 382 * ratio, 10);
  ctx.strokeStyle = "rgba(255,255,255,0.48)";
  ctx.strokeRect(492, 124, 382, 10);
  ctx.fillStyle = "#fff0ed";
  ctx.font = "bold 22px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`危险攻击：${state.enemy.intent.label}`, 683, 108);
  ctx.restore();
}

function drawPlayerDamageFeedback() {
  if (state.playerHitFlashTimer > 0) {
    const ratio = state.playerHitFlashTimer / 0.42;
    ctx.save();
    ctx.fillStyle = `rgba(255, 18, 28, ${0.34 * ratio})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  playerHitFloaters.forEach((floater) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, floater.life));
    const scale = 0.92 + 0.12 * Math.max(0, floater.life);
    ctx.font = `900 ${Math.round(30 * scale)}px Microsoft YaHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 6;
    const isHeal = floater.type === "heal";
    ctx.strokeStyle = isHeal ? "rgba(0, 26, 10, 0.92)" : "rgba(25, 0, 0, 0.92)";
    ctx.fillStyle = isHeal ? "#9cffaf" : "#ffebe8";
    ctx.shadowColor = isHeal ? "rgba(77, 255, 121, 0.58)" : "rgba(255, 0, 0, 0.55)";
    ctx.shadowBlur = 12;
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.restore();
  });
}

function addPlayerHealFloater(amount) {
  playerHitFloaters.push({
    type: "heal",
    text: `酒葫芦恢复 +${amount}`,
    x: 350,
    y: 405,
    life: 1.35,
  });
}

function addFloater(value, pos, color) {
  floaters.push({ value, x: pos.x, y: pos.y - 18, life: 0.9, color });
}

function addSkillResultFloater(skill, amount, type, pos, color) {
  const resultText = type === "armor" ? `造成${amount}点护甲损坏` : `造成${amount}点伤害`;
  floaters.push({
    text: `使用${skill.name}技能，${resultText}`,
    x: pos.x,
    y: pos.y - 18,
    life: 1.05,
    color,
  });
}

function renderLog() {
  ui.logList.innerHTML = "";
  [...state.log].reverse().slice(0, 12).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    ui.logList.appendChild(li);
  });
}

function updateUi() {
  const weapon = currentWeapon();
  const canSwitchWeapon = state.turn === "player" && !state.enemy.intent && !state.result && !state.skillCinematic;
  ui.phaseLabel.textContent = state.phase;
  ui.soulGauge.style.width = `${state.player.soul}%`;
  ui.playerHp.textContent = `${state.player.hp} / ${state.player.maxHp}`;
  ui.selectedWeapon.textContent = weapon.name;
  ui.turnState.textContent = state.phase;
  ui.turnInfo.textContent = `第 ${state.round} 回合：${turnDisplayName()}`;
  ui.bossInfo.textContent = `阶段 ${state.enemy.stage} / 弹药 ${state.player.ammo} / 行动力 ${state.player.action}`;
  ui.currentTarget.textContent =
    state.activeTarget === "multi" ? "多个部位" : state.activeTarget ? partById(state.activeTarget)?.label || "--" : "--";
  ui.brokenParts.textContent = `${state.enemy.parts.filter((part) => part.broken).length} / ${state.enemy.parts.length}`;

  ui.weaponToggle.disabled = !canSwitchWeapon;
  if (!canSwitchWeapon) {
    closeWeaponOverlay();
  }

  [...ui.weaponButtons.children].forEach((button) => {
    const isActive = button.dataset.weapon === state.selectedWeaponId;
    button.classList.toggle("active", isActive);
    button.disabled = !canSwitchWeapon;
  });

  const activeWeaponSkills = currentSkills();
  [...ui.skillButtons.children].forEach((button) => {
    const skill = activeWeaponSkills.find((item) => item.id === button.dataset.skill);
    button.disabled = !skill || !canUseSkill(skill);
  });

  [...ui.battleSkillButtons.children].forEach((button) => {
    if (button.dataset.soulTarget) {
      button.disabled = !state.soulTargetSelection;
      return;
    }
    const skill = activeWeaponSkills.find((item) => item.id === button.dataset.skill);
    button.disabled = !skill || !canUseSkill(skill);
  });

  [...ui.soulSkillButtons.children].forEach((button) => {
    const skill = soulArmorSkills.find((item) => item.id === button.dataset.soulSkill);
    button.disabled = !skill || !canUseSoulArmorSkill(skill);
  });
  updateSoulArmorButton();
  updateBattleSkillOverlay();
}

function updateSoulArmorButton() {
  const dots = availableSoulDots();
  const chargeDots = state.soulChargeDots || 0;
  const canUse = canUseSoulArmorSkill(soulArmorSkills[0]);
  ui.soulArmorButton.disabled = !canUse;
  ui.soulArmorButton.classList.toggle("ready", canUse);
  ui.soulArmorButton.classList.toggle("active-charge", chargeDots > 0);
  ui.soulArmorCount.textContent = String(chargeDots || dots);
  [...ui.soulArmorButton.querySelectorAll(".soul-armor-dots i")].forEach((dot, index) => {
    dot.classList.toggle("filled", index < dots);
    dot.classList.toggle("charging", index < chargeDots);
  });
}

function loop(now) {
  const delta = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

ui.resetBtn.addEventListener("click", resetGame);
document.getElementById("enterBattleBtn")?.addEventListener("click", enterBattleFromLoadout);
ui.nextLoadoutBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.nextLoadoutFromCharacterBtn?.addEventListener("click", () => setPrebattleStep("battle"));
ui.nextSkillBtn?.addEventListener("click", () => setPrebattleStep("skills"));
ui.nextSkillFromWeaponBtn?.addEventListener("click", () => setPrebattleStep("skills"));
ui.backToBossBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.backToBossFromCharacterBtn?.addEventListener("click", () => setPrebattleStep("boss"));
ui.backToCharacterFromWeaponBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.backToLoadoutBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.backToCharacterFromLinksBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.backToLoadoutFromArmorBoardBtn?.addEventListener("click", () => setPrebattleStep("loadout"));
ui.enterBattleFromLinksBtn?.addEventListener("click", enterBattleFromLoadout);
ui.characterTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openCharacterDestination(button.dataset.characterTab || "skills");
  });
});
ui.prebattleStepButtons.forEach((button) => {
  button.addEventListener("click", () => setPrebattleStep(button.dataset.prebattleStep));
});
ui.prebattleScreen?.addEventListener("click", (event) => {
  if (loadoutState.prebattleStep !== "weapons" || !loadoutState.weaponDetailOpen) return;
  const target = event.target;
  if (
    target.closest?.(".weapon-detail-panel")
    || target.closest?.(".weapon-gallery-card")
    || target.closest?.(".weapon-carry-card")
  ) {
    return;
  }
  loadoutState.weaponDetailOpen = false;
  loadoutState.weaponSkillPickerOpen = false;
  renderPrebattleWeapons();
});
ui.weaponToggle.addEventListener("click", toggleWeaponOverlay);
document.addEventListener("click", (event) => {
  if (event.target.closest?.("[data-skill-tag]") || event.target.closest?.("#skillTagBubble")) return;
  hideSkillTagBubble();
});
ui.soulArmorButton.addEventListener("pointerdown", startSoulArmorHold);
ui.soulArmorButton.addEventListener("pointerup", releaseSoulArmorHold);
ui.soulArmorButton.addEventListener("pointerleave", cancelSoulArmorHold);
ui.soulArmorButton.addEventListener("pointercancel", cancelSoulArmorHold);
document.querySelectorAll("[data-accessory]").forEach((button) => {
  button.addEventListener("click", () => chooseAccessory(button.dataset.accessory));
});
document.querySelectorAll("[data-react]").forEach((button) => {
  button.addEventListener("click", () => react(button.dataset.react));
});
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    if (skipCurrentVideo()) {
      event.preventDefault();
    }
    return;
  }
  const keyMap = { a: "left", w: "block", d: "right" };
  const action = keyMap[event.key.toLowerCase()];
  if (action) react(action);
});

function renderDemoVersion() {
  ui.versionLabels.forEach((label) => {
    label.textContent = `Demo ${DEMO_VERSION}`;
  });
}

function turnDisplayName() {
  if (state.turn === "player") return "玩家行动";
  if (state.turn === "player_start") return "玩家回合准备";
  if (state.turn === "enemy") return "敌方行动";
  if (state.turn === "ended") return state.phase;
  return state.phase;
}

renderDemoVersion();
initializeDefaultLoadout();
renderPrebattleLoadout();
resetGame();
requestAnimationFrame(loop);
