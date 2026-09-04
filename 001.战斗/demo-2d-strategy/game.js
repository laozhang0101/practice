const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
const DEMO_VERSION = "2026.09.04-compact-tree-labels";
const DEFAULT_MELEE_CINEMATIC_DURATION = 0.82;
const NORMAL_ATTACK_DAMAGE = 22;
const GOURD_HEAL_CHANCE = 0.5;
const QTE_WINDOW_SECONDS = 0.5;
const GOURD_HEAL_AMOUNT = 10;
const GOURD_MAX_USES = 3;
let battleUiHidden = false;

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
  playerHudHp: document.getElementById("playerHudHp"),
  playerHudHpFill: document.getElementById("playerHudHpFill"),
  playerMana: document.getElementById("playerMana"),
  playerManaCells: document.getElementById("playerManaCells"),
  selectedWeapon: document.getElementById("selectedWeapon"),
  turnState: document.getElementById("turnState"),
  currentTarget: document.getElementById("currentTarget"),
  brokenParts: document.getElementById("brokenParts"),
  combatActionDock: document.getElementById("combatActionDock"),
  weaponOverlay: document.getElementById("weaponOverlay"),
  weaponToggle: document.getElementById("weaponToggle"),
  weaponButtons: document.getElementById("weaponButtons"),
  battleSkillOverlay: document.getElementById("battleSkillOverlay"),
  battleSkillButtons: document.getElementById("battleSkillButtons"),
  battleSkillPageToggle: document.getElementById("battleSkillPageToggle"),
  battleSkillPageIndex: document.getElementById("battleSkillPageIndex"),
  skillWheelGesturePath: document.getElementById("skillWheelGesturePath"),
  skillWheelPageDots: document.getElementById("skillWheelPageDots"),
  skillDescriptionOverlay: document.getElementById("skillDescriptionOverlay"),
  skillDescriptionPanel: document.getElementById("skillDescriptionPanel"),
  skillButtons: document.getElementById("skillButtons"),
  soulSkillButtons: document.getElementById("soulSkillButtons"),
  soulArmorButton: document.getElementById("soulArmorButton"),
  soulArmorCount: document.getElementById("soulArmorCount"),
  resetBtn: document.getElementById("resetBtn"),
  reactionPanel: document.getElementById("reactionPanel"),
  threatText: document.getElementById("threatText"),
  videoOverlay: document.getElementById("videoOverlay"),
  skillVideo: document.getElementById("skillVideo"),
  skillFrameSequence: document.getElementById("skillFrameSequence"),
  qteOverlay: document.getElementById("qteOverlay"),
  qteTitle: document.getElementById("qteTitle"),
  qteCopy: document.getElementById("qteCopy"),
  qteGauge: document.getElementById("qteGauge"),
  accessoryChoice: document.getElementById("accessoryChoice"),
  weakpointTip: document.getElementById("weakpointTip"),
  turnInfo: document.getElementById("turnInfo"),
  bossInfo: document.getElementById("bossInfo"),
  logList: document.getElementById("logList"),
  battleApp: document.getElementById("battleApp"),
  gmHideBattleUi: document.getElementById("gmHideBattleUi"),
  gmShowBattleUi: document.getElementById("gmShowBattleUi"),
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
  presetBossContext: document.getElementById("presetBossContext"),
  presetOwnedCount: document.getElementById("presetOwnedCount"),
  loadoutPresetList: document.getElementById("loadoutPresetList"),
  loadoutPresetStage: document.getElementById("loadoutPresetStage"),
  loadoutPresetDetail: document.getElementById("loadoutPresetDetail"),
  backToBossFromPresetsBtn: document.getElementById("backToBossFromPresetsBtn"),
  enterBattleFromPresetsBtn: document.getElementById("enterBattleFromPresetsBtn"),
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

const skillFrameSequences = {
  "fist-close-flurry": {
    basePath: "./assets/skill-frames/fist-close-flurry",
    frameCount: 8,
    fps: 4,
  },
  "gs-arm-sunder": {
    basePath: "./assets/skill-frames/gs-arm-sunder",
    frameCount: 8,
    fps: 4,
  },
  "gs-leg-cleave": {
    basePath: "./assets/skill-frames/gs-leg-cleave",
    frameCount: 8,
    fps: 4,
  },
  "gs-blood-reap": {
    basePath: "./assets/skill-frames/gs-blood-reap",
    frameCount: 8,
    fps: 4,
  },
  "bow-core-burst": {
    basePath: "./assets/skill-frames/bow-core-burst",
    frameCount: 8,
    fps: 4,
  },
  "bow-arm-pierce": {
    basePath: "./assets/skill-frames/bow-arm-pierce",
    frameCount: 8,
    fps: 4,
  },
  "bow-leg-rain": {
    basePath: "./assets/skill-frames/bow-leg-rain",
    frameCount: 8,
    fps: 4,
  },
  "soul-armor-overdrive": {
    basePath: "./assets/skill-frames/soul-armor-overdrive",
    frameCount: 8,
    fps: 4,
  },
};

const skills = [
  {
    id: "gs_arm_sunder",
    weaponId: "greatsword",
    name: "碎臂重斩",
    activation: "active",
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
    icon: "./assets/skill-icons/gs-arm-sunder.webp",
    frameSequence: "gs-arm-sunder",
    desc: "重型破甲，优先剥离手部硬甲。",
  },
  {
    id: "gs_leg_cleave",
    weaponId: "greatsword",
    name: "断足裂击",
    activation: "active",
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
    icon: "./assets/skill-icons/gs-leg-cleave.webp",
    frameSequence: "gs-leg-cleave",
    desc: "重型破甲，打开脚部硬甲。",
  },
  {
    id: "gs_guard_stance",
    weaponId: "greatsword",
    name: "防御姿态",
    activation: "active",
    targetParts: [],
    targetLabel: "自身",
    kind: "stance",
    kindLabel: "主动",
    armorBreaker: false,
    damage: 0,
    armorDamage: 0,
    exposedBonus: 1,
    actionCost: 0,
    soulGain: 8,
    color: "#f0b84f",
    icon: "./assets/skill-icons/gs-guard-stance.webp",
    stance: "greatsword_counter",
    counterChance: 0.7,
    counterDamage: 32,
    tags: ["反击"],
    summaryOverride: "反击率 70% / 反击伤害 32 / 仅反击近战",
    desc: "摆出防御姿态，本轮无法闪避；近战来袭时概率弹反并立即反击。",
  },
  {
    id: "gs_blood_reap",
    weaponId: "greatsword",
    name: "嗜血断流",
    activation: "active",
    targetParts: ["core"],
    targetLabel: "胸部",
    kind: "single",
    kindLabel: "主动",
    armorBreaker: false,
    damage: 136,
    armorDamage: 18,
    exposedBonus: 1.28,
    actionCost: 3,
    soulGain: 14,
    color: "#d95d4f",
    icon: "./assets/skill-icons/gs-blood-reap.webp",
    tags: ["流血"],
    bloodReap: true,
    frameSequence: "gs-blood-reap",
    summaryOverride: "伤害 136 / 嗜血 9、15 层时结算全部流血",
    desc: "造成 200% 重斩伤害；达到嗜血阈值时提前结算流血，并追加范围破韧。",
  },
  {
    id: "gs_counter_transfer",
    weaponId: "greatsword",
    name: "反击传导",
    activation: "passive",
    targetParts: [],
    targetLabel: "自身",
    kind: "passive",
    kindLabel: "被动",
    armorBreaker: false,
    damage: 0,
    armorDamage: 0,
    exposedBonus: 1,
    actionCost: 0,
    soulGain: 0,
    color: "#e59545",
    tags: ["反击"],
    passiveEffect: "counter_transfer",
    transferDamageRatio: 0.5,
    strengthDamageBonus: 0.5,
    summaryOverride: "传导伤害 50% / 力量高于 Boss 时反击伤害 +50%",
    desc: "防御姿态反击命中后，将部分伤害传给另一部位；力量占优时强化反击。",
  },
  {
    id: "gs_combo_rhythm",
    weaponId: "greatsword",
    name: "战意连斩",
    activation: "passive",
    targetParts: [],
    targetLabel: "自身",
    kind: "passive",
    kindLabel: "被动",
    armorBreaker: false,
    damage: 0,
    armorDamage: 0,
    exposedBonus: 1,
    actionCost: 0,
    soulGain: 0,
    color: "#75d27b",
    tags: ["连击"],
    passiveEffect: "damage_chain",
    triggerHitCount: 3,
    followUpDamageRatio: 0.7,
    strengthPerHit: 1,
    summaryOverride: "每 3 次伤害触发 / 随机部位追加 70% 斩击 / 每次伤害力量 +1",
    desc: "大剑每造成三次有效伤害，立即对随机部位追加一次斩击。",
  },
  {
    id: "gs_bleed_hunger",
    weaponId: "greatsword",
    name: "流血汲取",
    activation: "passive",
    targetParts: [],
    targetLabel: "自身",
    kind: "passive",
    kindLabel: "被动",
    armorBreaker: false,
    damage: 0,
    armorDamage: 0,
    exposedBonus: 1,
    actionCost: 0,
    soulGain: 0,
    color: "#d95d4f",
    tags: ["流血"],
    passiveEffect: "bleed_hunger",
    bleedChance: 0.35,
    bleedMaxStacks: 5,
    bleedDuration: 2,
    healRatio: 0.03,
    bloodlustMax: 15,
    summaryOverride: "流血率 35% / 最多 5 层·持续 2 回合 / 伤害吸血 3% / 嗜血上限 15",
    desc: "大剑命中时概率附加流血；每次成功施加流血获得嗜血并恢复生命。",
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
    icon: "./assets/skill-icons/fist-core-rush.webp",
    comboChance: 0.5,
    comboDamage: NORMAL_ATTACK_DAMAGE,
    desc: "近战爆发，直击胸口核心弱点。",
    accessoryFlow: {
      introVideo: "./assets/videos/fist-skill-1-attack-web.mp4",
      selectLoopVideo: "./assets/videos/accessory-select-loop-web.mp4",
      effects: {
        jet: {
          label: "喷气挂件",
          requiredItemName: "喷气式装置",
          video: "./assets/videos/jet-accessory-effect-web.mp4",
          damageMultiplier: 1.5,
          reactorBoostable: true,
          reactorBonus: 1.2,
        },
        drone: {
          label: "无人机挂件",
          requiredItemName: "无人机",
          video: "./assets/videos/drone-accessory-effect-web.mp4",
          damageMultiplier: 1.18,
        },
        shoulder_cannon: {
          label: "肩炮挂件",
          requiredItemName: "肩炮",
          video: "./assets/videos/drone-accessory-effect-web.mp4",
          damageMultiplier: 1.35,
          reactorBoostable: true,
          reactorBonus: 1.2,
        },
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
    icon: "./assets/skill-icons/fist-leg-drive.webp",
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
    icon: "./assets/skill-icons/fist-flurry.webp",
    frameSequence: "fist-close-flurry",
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
    icon: "./assets/skill-icons/bow-core-burst.webp",
    frameSequence: "bow-core-burst",
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
    icon: "./assets/skill-icons/bow-arm-pierce.webp",
    frameSequence: "bow-arm-pierce",
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
    icon: "./assets/skill-icons/bow-volley.webp",
    frameSequence: "bow-leg-rain",
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
    frameSequence: "soul-armor-overdrive",
    desc: "常驻大招，不随武器切换。长按蓄力后选择怪物部位释放。",
  },
];
const enemyVideoAttacks = {
  rightThrow: {
    id: "right_throw",
    label: "怪物普攻",
    type: "staged_block_qte",
    prepareVideo: "./assets/videos/大剑_准备格挡.mp4",
    loadingVideo: "./assets/videos/大剑_格挡loading.mp4",
    successVideo: "./assets/videos/大剑_格挡成功.mp4",
    failVideo: "./assets/videos/大剑_格挡失败.mp4",
    qteDuration: QTE_WINDOW_SECONDS,
    validResponses: ["block"],
    range: "melee",
    counterableByGreatsword: true,
    damageOnSuccess: 0,
    damageOnFail: 38,
  },
  lavaBurst: {
    id: "lava_burst",
    label: "胸口熔岩喷射",
    type: "timed_qte",
    validResponses: ["left", "right"],
    range: "ranged",
    counterableByGreatsword: false,
    qteDuration: QTE_WINDOW_SECONDS,
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
    range: "ranged",
    counterableByGreatsword: false,
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
let skillDescriptionHoldTimer = null;
let battleSkillPageByWeapon = Object.create(null);
let selectedBattleSkillByWeapon = Object.create(null);
let battleSkillPageTransitionTimer = null;
let skillWheelGeometryFrame = null;
let skillWheelGeometrySettleTimer = null;
let skillWheelGeometry = null;
let weaponOverlayTransitionTimer = null;
let combatDockMode = "skills";
let hoveredTargetParts = [];
let portraitDraggedSkillId = "";
let portraitPointerDrag = null;
let portraitSuppressSkillClickUntil = 0;
let activeVideoSkipHandler = null;
let activeVideoPlaybackId = 0;
let activeFrameSequenceTimer = null;
const preloadedFrameSequenceImages = new Map();
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
const WEAPON_SKILL_SLOT_COUNT = 6;
const DEFAULT_PORTRAIT_SKILLS_PER_WEAPON = 3;
const BATTLE_SKILLS_PER_PAGE = 3;
const UPPER_ARMOR_PASSIVE_SLOT_COUNT = 3;
const defaultWeaponSkillLoadout = {
  greatsword: ["gs_guard_stance", "gs_arm_sunder", "gs_blood_reap", "gs_leg_cleave"],
};
const defaultUpperArmorPassiveInlays = ["gs_counter_transfer", "gs_combo_rhythm", null];

const loadoutState = {
  prebattleStep: "boss",
  selectedBossId: "lava_golem",
  activeLoadoutPresetId: "balanced_hunter",
  activeLoadoutPresetSection: "weapons",
  selectedWeaponIds: ["fists", "greatsword"],
  activeWeaponSlot: 0,
  activeWeaponDetailId: "fists",
  weaponDetailOpen: false,
  weaponSkillLoadout: {},
  weaponSkillPickerOpen: false,
  activeWeaponSkillSlot: 0,
  upperArmorPassiveInlays: [...defaultUpperArmorPassiveInlays],
  upperArmorPassivePickerOpen: false,
  activeUpperArmorPassiveSlot: 0,
  armorFactorLoadout: {},
  armorFactorBoardSlots: {},
  armorFactorPickerOpen: false,
  activeArmorFactorSlot: 0,
  activeSkillGroupId: "weapon",
  activeSkillSourceId: "",
  activeSkillEditorId: "",
  skillGroupExpanded: { weapon: true, armor: false, accessory: false },
  activeCharacterTab: "presets",
  activePartId: "head",
  activeSlot: "base",
  portraitLoadoutView: "armor",
  activePortraitArmorSetId: "bio_full",
  activePortraitWeaponId: "",
  activePortraitSkillId: "",
  portraitSkillPopupOpen: false,
  portraitEquippedSkillIds: [],
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
    name: "方舟反应炉",
    icon: "炉",
    trait: "前胸挂件，能源支持",
    category: "reactor",
    slots: ["前胸"],
    socketCount: 5,
    image: "./assets/loadout-arc-reactor.jpeg",
    tacticalInfo: {
      title: "方舟反应炉",
      role: "能源核心",
      trigger: "装配在前胸后常驻生效。",
      effect: "为喷气式装置和肩炮提供能源支持，使它们的战斗介入伤害提高 20%。",
    },
  },
  {
    name: "肩炮",
    icon: "炮",
    trait: "肩膀挂件，远程轰击",
    category: "shoulder-cannon",
    slots: ["肩膀"],
    socketCount: 4,
    image: "./assets/loadout-shoulder-cannon.jpeg",
    tacticalInfo: {
      title: "肩炮",
      role: "肩部火力",
      trigger: "释放带挂件协同的近战技能时可选择介入。",
      effect: "从肩部发射远程火力追加打击；如果前胸装配方舟反应炉，伤害进一步提高。",
    },
  },
  {
    name: "尖刺肩甲",
    icon: "刺",
    trait: "肩膀挂件，强化反击",
    category: "spiked-pauldron",
    slots: ["肩膀"],
    socketCount: 4,
    tacticalInfo: {
      title: "尖刺肩甲",
      role: "反击增幅",
      trigger: "装备在肩膀后，反击成功时自动生效。",
      effect: "反击及其战甲追加攻击造成的伤害提高 10%。",
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

const loadoutPresets = [
  {
    id: "balanced_hunter",
    name: "均衡狩猎",
    role: "先拆甲，再转火",
    tone: "balanced",
    summary: "拳套负责试探与追击，大剑负责打开手部硬甲，挂件补足爆发和续航。",
    weapons: ["fists", "greatsword"],
    armorTheme: "修罗",
    attachments: {
      "torso:肩膀": "喷气式装置",
      "torso:前胸": "方舟反应炉",
      "torso:后背": "箭袋",
      "torso:上臂": "无人机",
      "pants:前腰": "酒葫芦",
    },
    weaponSkills: {
      fists: ["fist_arm_rush", "fist_leg_drive", "fist_flurry"],
      greatsword: ["gs_guard_stance", "gs_arm_sunder", "gs_blood_reap", "gs_leg_cleave"],
    },
    upperArmorPassives: ["gs_counter_transfer", "gs_combo_rhythm", null],
    factorSlots: {
      0: "tech_focus",
      2: "power_servo",
      4: "burst_reactor",
      6: "light_weight",
      8: "speed_joint",
    },
    route: [
      "拳套试探核心，观察 Boss 起手",
      "大剑拆除手部硬甲并处理投石准备",
      "硬甲打开后切回拳套追击弱点",
    ],
    risk: "武器切换较频繁，需要为破甲技能保留行动力。",
    tags: ["破甲", "连击", "挂件协同"],
  },
  {
    id: "counter_fortress",
    name: "重剑守反",
    role: "承压反击",
    tone: "counter",
    summary: "岩铠提高承压能力，大剑等待近战窗口，尖刺肩甲强化反击链，弓弩处理远程和裸露核心。",
    weapons: ["greatsword", "bow"],
    armorTheme: "岩铠",
    attachments: {
      "torso:肩膀": "尖刺肩甲",
      "torso:前胸": "方舟反应炉",
      "torso:后背": "箭袋",
      "pants:前腰": "酒葫芦",
    },
    weaponSkills: {
      greatsword: ["gs_guard_stance", "gs_arm_sunder", "gs_blood_reap", "gs_leg_cleave"],
      bow: ["bow_arm_pierce", "bow_core_burst", "bow_volley"],
    },
    upperArmorPassives: ["gs_counter_transfer", "gs_bleed_hunger", null],
    factorSlots: {
      0: "tech_focus",
      2: "power_servo",
      4: "burst_reactor",
      6: "guard_core",
      8: "speed_joint",
    },
    route: [
      "大剑防御姿态等待 Boss 近战",
      "反击后用穿臂箭继续压低手部硬甲",
      "护腕十字斩与尖刺肩甲组成强化反击链",
    ],
    risk: "远程攻击无法触发大剑反击，必须及时切换弓弩应对。",
    tags: ["防御姿态", "十字斩追击", "反击增幅"],
  },
  {
    id: "core_assault",
    name: "弱点突袭",
    role: "高速点杀",
    tone: "assault",
    summary: "疾影战甲降低承载但强调机动，拳套与弓弩围绕胸口核心形成连续爆发。",
    weapons: ["fists", "bow"],
    armorTheme: "疾影",
    attachments: {
      "torso:肩膀": "喷气式装置",
      "torso:后背": "箭袋",
      "torso:上臂": "无人机",
      "pants:前腰": "酒葫芦",
    },
    weaponSkills: {
      fists: ["fist_arm_rush", "fist_leg_drive", "fist_flurry"],
      bow: ["bow_arm_pierce", "bow_core_burst", "bow_volley"],
    },
    upperArmorPassives: [null, null, null],
    factorSlots: {
      0: "tech_focus",
      2: "speed_joint",
      4: "agility_drive",
      6: "light_weight",
      8: "guard_core",
    },
    route: [
      "弓弩穿臂箭远程打开手部硬甲",
      "拳套贴身连打裸露核心",
      "喷气装置与无人机在爆发窗口共同介入",
    ],
    risk: "缺少稳定反击与重型承压手段，失误后的恢复空间较小。",
    tags: ["弱点爆发", "远近切换", "高机动"],
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

const armorPartCombatEffects = {
  bracer: {
    id: "bracer_counter_cross_slash",
    name: "十字斩追击",
    trigger: "counter_success",
    damage: 24,
    video: "./assets/videos/counter-cross-slash-web.mp4",
    previewVideo: "./assets/videos/counter-cross-slash-web.mp4",
    previewVideoLabel: "反击追击表现预览",
    color: "#ff796b",
    summaryOverride: "反击成功后追加 1 次十字斩（伤害 24）",
    desc: "装备手部铠甲时，成功反击敌人后自动追加一次十字斩，并播放对应战甲追击表现。",
  },
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
    torso: 10,
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
    effect: "提供高额承载，支持激光、喷气和无人机等战斗模组。",
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
    effect: "提供低占用续航灵媒器，适合补足生存能力。",
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
    effect: "能量、弹药和充能类灵媒器的供给效率提高。",
    statBonus: { technique: 0.6, burst: 0.6 },
  },
  "weapon-weapon-weapon": {
    name: "火力联动",
    effect: "武装灵媒器伤害和破甲收益提高。",
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
    title: "1条共鸣",
    effect: "激活首条战灵共鸣，对应灵媒器体系获得加成。",
  },
  {
    count: 3,
    title: "3条共鸣",
    effect: "灵媒器形成稳定构型，战甲获得额外战术收益。",
  },
  {
    count: 5,
    title: "5条共鸣",
    effect: "形成完整战斗构型，解锁高阶套装奖励。",
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
    itemName: "方舟反应炉",
    sourceId: "accessory_arc_reactor",
    fallbackIcon: "炉",
    role: "前胸挂件",
    skill: {
      id: "accessory_arc_reactor_boost",
      name: "方舟供能",
      targetParts: ["core"],
      targetLabel: "自身",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#69c7ff",
      summaryOverride: "喷气与肩炮伤害 +20%",
      desc: "前胸能源核心，为喷气式装置和肩炮提供额外输出供能。",
    },
  },
  {
    itemName: "肩炮",
    sourceId: "accessory_shoulder_cannon",
    fallbackIcon: "炮",
    role: "肩膀挂件",
    skill: {
      id: "accessory_shoulder_cannon_fire",
      name: "肩炮轰击",
      targetParts: ["core"],
      targetLabel: "胸部",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#ff8e4d",
      summaryOverride: "挂件协同远程轰击",
      desc: "近战技能进入挂件选择时，可选择肩炮追加远程火力。方舟反应炉可进一步提高肩炮威力。",
      previewVideo: "./assets/videos/drone-accessory-effect-web.mp4",
      previewVideoLabel: "肩炮占位预览",
    },
  },
  {
    itemName: "尖刺肩甲",
    sourceId: "accessory_spiked_pauldron",
    fallbackIcon: "刺",
    role: "肩膀挂件",
    skill: {
      id: "accessory_spiked_pauldron_counter",
      name: "反击增幅",
      targetParts: ["core"],
      targetLabel: "自身",
      kind: "accessory",
      kindLabel: "挂件",
      damage: 0,
      armorDamage: 0,
      actionCost: 0,
      color: "#e36b5c",
      summaryOverride: "反击链伤害 +10%",
      desc: "装备尖刺肩甲后，反击与反击触发的战甲追加攻击伤害提高 10%。",
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
  const arcReactor = attachmentOptions.find((option) => option.name === "方舟反应炉");
  const quiver = attachmentOptions.find((option) => option.name === "箭袋");
  const jet = attachmentOptions.find((option) => option.name === "喷气式装置");
  const gourd = attachmentOptions.find((option) => option.name === "酒葫芦");
  if (drone) loadoutState.equipped["torso:上臂"] = drone;
  if (arcReactor) loadoutState.equipped["torso:前胸"] = arcReactor;
  if (quiver) loadoutState.equipped["torso:后背"] = quiver;
  if (jet) loadoutState.equipped["torso:肩膀"] = jet;
  if (gourd) loadoutState.equipped["pants:前腰"] = gourd;
}

function loadoutPresetById(presetId) {
  return loadoutPresets.find((preset) => preset.id === presetId) || loadoutPresets[0];
}

function armorPresetItemName(themeName, part) {
  return themeName === "修罗" ? part.defaultItem : `${themeName}${part.label}`;
}

function applyLoadoutPreset(presetId, options = {}) {
  const preset = loadoutPresetById(presetId);
  if (!preset) return;

  const nextEquipped = {};
  loadoutParts.forEach((part) => {
    const itemName = armorPresetItemName(preset.armorTheme, part);
    const item = attachmentOptions.find((option) => option.name === itemName)
      || attachmentOptions.find((option) => option.name === part.defaultItem);
    if (item) nextEquipped[`${part.id}:base`] = item;
  });
  Object.entries(preset.attachments || {}).forEach(([slotKey, itemName]) => {
    const item = attachmentOptions.find((option) => option.name === itemName);
    if (item) nextEquipped[slotKey] = item;
  });

  loadoutState.activeLoadoutPresetId = preset.id;
  loadoutState.selectedWeaponIds = [...preset.weapons];
  loadoutState.activeWeaponSlot = 0;
  loadoutState.activeWeaponDetailId = preset.weapons[0] || "";
  loadoutState.weaponDetailOpen = false;
  loadoutState.weaponSkillPickerOpen = false;
  loadoutState.weaponSkillLoadout = Object.fromEntries(
    Object.entries(preset.weaponSkills || {}).map(([weaponId, skillIds]) => [weaponId, [...skillIds]])
  );
  loadoutState.upperArmorPassiveInlays = [...(preset.upperArmorPassives || [])];
  while (loadoutState.upperArmorPassiveInlays.length < UPPER_ARMOR_PASSIVE_SLOT_COUNT) {
    loadoutState.upperArmorPassiveInlays.push(null);
  }
  loadoutState.upperArmorPassivePickerOpen = false;
  loadoutState.equipped = nextEquipped;
  loadoutState.armorFactorBoardSlots = { ...(preset.factorSlots || {}) };
  loadoutState.armorFactorLoadout = {};
  Object.entries(armorFactorSlots).forEach(([partId, slotIndex]) => {
    loadoutState.armorFactorLoadout[partId] = loadoutState.armorFactorBoardSlots[slotIndex] || null;
  });
  loadoutState.activePartId = "head";
  loadoutState.activeSlot = "base";
  loadoutState.portraitLoadoutView = "armor";
  loadoutState.activePortraitArmorSetId = "bio_full";
  loadoutState.activePortraitWeaponId = "";
  loadoutState.activePortraitSkillId = "";
  loadoutState.portraitSkillPopupOpen = false;
  loadoutState.isFocusing = false;

  ensureWeaponSkillLoadout();
  ensureUpperArmorPassiveInlays();
  ensureArmorFactorLoadout();
  initializePortraitSkillSelection();
  if (options.render !== false) renderLoadoutPresetPage();
}

function equippedPresetAccessories() {
  return Object.entries(loadoutState.equipped)
    .filter(([slotKey, item]) => !slotKey.endsWith(":base") && item)
    .map(([, item]) => item);
}

function renderPresetItemIcon(item, fallback = "") {
  if (!item) return `<span class="preset-mini-icon empty">${fallback || "+"}</span>`;
  const iconIsAsset = typeof item.icon === "string" && /\.(png|jpe?g|webp|svg)$/i.test(item.icon);
  const art = item.image
    ? `<img src="${item.image}" alt="" />`
    : iconIsAsset
      ? `<img src="${item.icon}" alt="" />`
      : `<b>${item.short || item.icon || fallback || "·"}</b>`;
  return `<span class="preset-mini-icon">${art}</span>`;
}

const presetSectionDefinitions = {
  weapons: {
    groupId: "weapon",
    label: "武器",
    short: "武",
    description: "当前携带武器及装配技能",
  },
  armor: {
    groupId: "armor",
    label: "战甲",
    short: "甲",
    description: "五个战甲部位及常驻能力",
  },
  accessories: {
    groupId: "accessory",
    label: "挂件",
    short: "挂",
    description: "当前已装配挂件及触发效果",
  },
};

function presetSectionEffectPresentation(sectionId, preset, section) {
  const skills = section.sources.flatMap((source) => source.skills || []);
  if (sectionId === "weapons") {
    const hasCounterStance = skills.some((skill) => skill.stance === "greatsword_counter");
    const hasCombo = skills.some((skill) => skill.comboChance > 0);
    const hasArmorBreak = skills.some((skill) => skill.armorBreaker || effectiveArmorDamage(skill) > (skill.damage || 0));
    const label = hasCounterStance
      ? "守反与点破"
      : hasCombo && hasArmorBreak
        ? "连击与破甲"
        : hasCombo
          ? "连续压制"
          : "主动战技";
    const sourceSummary = section.sources
      .map((source) => `${source.name}：${(source.skills || []).slice(0, 2).map((skill) => skill.name).join("、")}`)
      .filter((item) => !item.endsWith("："))
      .join(" · ");
    return {
      short: hasCounterStance ? "反" : hasCombo ? "连" : "攻",
      label,
      description: sourceSummary || "当前没有可用战技",
      metric: `${skills.length} 项战技`,
    };
  }

  if (sectionId === "armor") {
    const stats = equippedArmorStats();
    const combatEffects = skills.filter((skill) => !skill.statBonus && !skill.noEffect);
    const effectNames = [...new Set(combatEffects.map((skill) => skill.name))];
    return {
      short: effectNames.length ? "承" : "体",
      label: effectNames.includes("十字斩追击") ? "承压与追击" : "基础承载",
      description: `攻击 +${stats.attack} · 防御 +${stats.defense} · 生命 +${stats.hp}${effectNames.length ? ` · ${effectNames.join("、")}` : ""}`,
      metric: `攻${stats.attack} 防${stats.defense} 血${stats.hp}`,
    };
  }

  const effectSummaries = skills
    .map((skill) => skill.summaryOverride || skillConfigMeta(skill).slice(0, 2).join(" · "))
    .filter(Boolean);
  const hasCounterBoost = skills.some((skill) => skill.id === "accessory_spiked_pauldron_counter");
  const hasBurstLink = skills.some((skill) => [
    "accessory_drone_support",
    "accessory_jet_boost",
    "accessory_shoulder_cannon_fire",
  ].includes(skill.id));
  return {
    short: hasCounterBoost ? "链" : "联",
    label: hasCounterBoost ? "反击链增幅" : hasBurstLink ? "协同爆发" : "附加联动",
    description: effectSummaries.slice(0, 3).join(" · ") || "当前没有已生效的附加能力",
    metric: `${skills.length} 项联动`,
  };
}

function presetSectionData(sectionId) {
  const definition = presetSectionDefinitions[sectionId] || presetSectionDefinitions.weapons;
  const group = prebattleSkillGroups().find((item) => item.id === definition.groupId);
  let sources = group?.sources || [];
  if (definition.groupId === "accessory") {
    sources = sources.filter((source) => isLoadoutItemEquipped(source.name));
  }
  return { ...definition, id: sectionId, sources };
}

function presetSkillMark(skill) {
  if (isPassiveSkill(skill)) return "被";
  if (skill.stance) return "守";
  if (skill.statBonus) return "属";
  const targetParts = skill.targetParts || [];
  if (targetParts.length > 1) return "全";
  return {
    core: "胸",
    arms: "手",
    legs: "脚",
  }[targetParts[0]] || (skill.kind === "accessory" ? "联" : "技");
}

function renderPresetDetailTags(skill) {
  const tags = skill.statBonus
    ? ["基础属性"]
    : skill.kind === "accessory"
      ? ["联动"]
      : [isPassiveSkill(skill) ? "被动" : "主动"];
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  (skill.tags || []).forEach((tag) => tags.push(tag));
  return [...new Set(tags)].map((tag) => `<i class="${skillTagClass(tag)}">${tag}</i>`).join("");
}

function renderPresetDetailSkill(skill) {
  const meta = skillConfigMeta(skill).slice(0, 3);
  return `
    <article class="preset-detail-skill" style="--skill-color:${skill.color || "#7fbde8"}">
      <span class="preset-detail-skill-mark">${presetSkillMark(skill)}</span>
      <span class="preset-detail-skill-copy">
        <strong>${skill.name}</strong>
        <span class="preset-detail-skill-tags">${renderPresetDetailTags(skill)}</span>
        <small>${meta.join(" · ")}</small>
      </span>
      ${skill.actionCost > 0
        ? `<em class="preset-detail-skill-cost"><i>行动力</i><b>${skill.actionCost}</b></em>`
        : `<em class="preset-detail-skill-cost passive">${isPassiveSkill(skill) || skill.statBonus || skill.kind === "accessory" ? "常驻" : "0费"}</em>`}
    </article>
  `;
}

function renderPresetDetailSource(source, index) {
  const sourceSkills = source.skills || [];
  return `
    <section class="preset-detail-source">
      <header>
        <span class="preset-detail-source-icon">${renderSkillSourceIcon(source)}</span>
        <span>
          <small>${source.role}</small>
          <strong>${source.name}</strong>
        </span>
        <em>${sourceSkills.length} 项</em>
      </header>
      <div class="preset-detail-skill-list">
        ${sourceSkills.length
          ? sourceSkills.map((skill) => renderPresetDetailSkill(skill)).join("")
          : `<p class="preset-detail-empty">该部位当前没有战斗能力</p>`}
      </div>
    </section>
  `;
}

function openPresetDetail(sectionId) {
  if (sectionId === "weapons") {
    loadoutState.activeWeaponSlot = 0;
    setPrebattleStep("weapons");
    return;
  }
  if (sectionId === "armor") {
    loadoutState.activePartId = "head";
    loadoutState.activeSlot = "base";
    setPrebattleStep("loadout");
    return;
  }
  if (sectionId === "accessories") {
    loadoutState.activePartId = "torso";
    loadoutState.activeSlot = "前胸";
    setPrebattleStep("loadout");
    return;
  }
  if (sectionId === "skills") {
    setPrebattleStep("skills");
  }
}

const portraitSkillBranchPositions = [
  { x: 34, y: 99 },
  { x: 24, y: 82 },
  { x: 14, y: 65 },
  { x: 10, y: 48 },
  { x: 16, y: 31 },
  { x: 28, y: 14 },
];

const portraitArmorSetTabs = [
  {
    id: "bio_full",
    label: "生物全甲套",
    image: "./assets/armor-set-bio-full-emblem.png",
    unlocked: true,
  },
  {
    id: "tech_half",
    label: "科技半甲套",
    image: "./assets/loadout-shura-head.jpeg",
    unlocked: false,
  },
  {
    id: "bio_heavy",
    label: "生物重甲套",
    image: "./assets/loadout-shura-pants.jpeg",
    unlocked: false,
  },
];

const portraitDemoSkills = [
  {
    id: "fist_opening_chase",
    weaponId: "fists",
    name: "破绽追拳",
    targetParts: ["core"],
    targetLabel: "胸部",
    kind: "single",
    kindLabel: "单体",
    damage: 38,
    armorDamage: 12,
    exposedBonus: 1.45,
    actionCost: 1,
    comboChance: 0.4,
    color: "#65d58a",
    icon: "./assets/skill-icons/fist-core-rush.webp",
    tags: ["追击"],
    desc: "命中裸露部位后获得一次低消耗追击机会。",
  },
  {
    id: "fist_wind_step",
    weaponId: "fists",
    name: "回风架势",
    targetParts: [],
    targetLabel: "自身",
    kind: "buff",
    kindLabel: "状态",
    damage: 0,
    armorDamage: 0,
    actionCost: 1,
    evadeBonus: 35,
    actionDiscount: 1,
    color: "#55cbd0",
    icon: "./assets/skill-icons/fist-leg-drive.webp",
    tags: ["闪避"],
    desc: "获得 35% 闪避率；成功闪避后，下一次拳套技能行动力消耗降低 1 点。",
  },
  {
    id: "fist_hundred_breaks",
    weaponId: "fists",
    name: "百裂终式",
    targetParts: ["core", "arms", "legs"],
    targetLabel: "全身",
    kind: "aoe",
    kindLabel: "群体",
    damage: 72,
    armorDamage: 20,
    actionCost: 4,
    color: "#86e66f",
    icon: "./assets/skill-icons/fist-flurry.webp",
    tags: ["连击"],
    desc: "连续攻击多个部位，每命中一个裸露部位，最后一击伤害提高 20%。",
  },
  {
    id: "gs_mountain_arc",
    weaponId: "greatsword",
    name: "横断山河",
    targetParts: ["arms", "legs"],
    targetLabel: "手部+脚部",
    kind: "aoe",
    kindLabel: "群体",
    damage: 88,
    armorDamage: 60,
    actionCost: 4,
    armorBreaker: true,
    color: "#f2bb4e",
    icon: "./assets/skill-icons/gs-arm-sunder.webp",
    tags: ["破甲"],
    desc: "横扫两处硬甲部位；任一部位被击破时，返还 1 点行动力。",
  },
  {
    id: "gs_iron_momentum",
    weaponId: "greatsword",
    name: "不动战意",
    targetParts: [],
    targetLabel: "自身",
    kind: "buff",
    kindLabel: "状态",
    damage: 0,
    armorDamage: 0,
    actionCost: 2,
    damageBoost: 65,
    color: "#e68f4c",
    icon: "./assets/skill-icons/gs-guard-stance.webp",
    tags: ["蓄势"],
    desc: "本回合放弃闪避，下一次大剑攻击伤害提高 65%，且不会被打断。",
  },
];

function portraitWeaponTreeSkills(weaponId) {
  return [
    ...configuredWeaponSkills(weaponId),
    ...portraitDemoSkills.filter((skill) => skill.weaponId === weaponId),
  ].slice(0, WEAPON_SKILL_SLOT_COUNT);
}

function initializePortraitSkillSelection() {
  const initialSkillIds = carriedWeapons()
    .flatMap((weapon) => portraitWeaponTreeSkills(weapon.id).slice(0, DEFAULT_PORTRAIT_SKILLS_PER_WEAPON).map((skill) => skill.id))
    .slice(0, WEAPON_SKILL_SLOT_COUNT);
  loadoutState.portraitEquippedSkillIds = Array.from(
    { length: WEAPON_SKILL_SLOT_COUNT },
    (_, slotIndex) => initialSkillIds[slotIndex] || null,
  );
}

function portraitSkillById(skillId) {
  return skills.find((skill) => skill.id === skillId)
    || portraitDemoSkills.find((skill) => skill.id === skillId)
    || null;
}

function portraitEquippedSkillCount() {
  return loadoutState.portraitEquippedSkillIds.filter(Boolean).length;
}

function assignPortraitSkillToSlot(skillId, slotIndex) {
  const skill = portraitSkillById(skillId);
  const targetIndex = Number(slotIndex);
  if (!skill || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= WEAPON_SKILL_SLOT_COUNT) return false;

  const slots = Array.from(
    { length: WEAPON_SKILL_SLOT_COUNT },
    (_, index) => loadoutState.portraitEquippedSkillIds[index] || null,
  );
  const sourceIndex = slots.indexOf(skillId);
  if (sourceIndex === targetIndex) return true;

  if (sourceIndex >= 0) {
    [slots[sourceIndex], slots[targetIndex]] = [slots[targetIndex], slots[sourceIndex]];
  } else {
    slots[targetIndex] = skillId;
  }
  loadoutState.portraitEquippedSkillIds = slots;
  return true;
}

function isPortraitSkillEquipped(skillId) {
  return loadoutState.portraitEquippedSkillIds.includes(skillId);
}

function portraitArmorItem(part) {
  return loadoutState.equipped[`${part.id}:base`]
    || attachmentOptions.find((item) => item.name === part.defaultItem)
    || null;
}

function portraitArmorAttachments(partId) {
  return Object.entries(loadoutState.equipped)
    .filter(([slotKey, item]) => item && slotKey.startsWith(`${partId}:`) && !slotKey.endsWith(":base"))
    .map(([, item]) => item);
}

function renderPortraitSkillNode(weapon, skill, slotIndex, branchIndex) {
  const basePosition = portraitSkillBranchPositions[slotIndex];
  const x = branchIndex === 0 ? basePosition.x : 100 - basePosition.x;
  const active = skill?.id === loadoutState.activePortraitSkillId;
  const equipped = skill ? isPortraitSkillEquipped(skill.id) : false;
  const category = skill ? skillCategoryLabel(skill) : null;
  const style = skill
    ? `--node-x:${x}%;--node-y:${basePosition.y}%;--skill-color:${skill.color || "#79c8ef"}`
    : `--node-x:${x}%;--node-y:${basePosition.y}%;--skill-color:#52606b`;
  return `
    <button
      class="portrait-skill-node${skill ? " unlocked" : " locked"}${equipped ? " equipped" : " unequipped"}${active ? " active" : ""}"
      style="${style}"
      type="button"
      ${skill ? `data-portrait-skill="${skill.id}" data-portrait-weapon="${weapon.id}" draggable="true"` : "disabled"}
      aria-label="${skill ? skill.name : `未解锁技能 ${slotIndex + 1}`}"
    >
      <span class="portrait-skill-node-art">
        ${skill?.icon ? `<img src="${skill.icon}" alt="" draggable="false" />` : `<i>锁</i>`}
      </span>
      ${skill ? `<b class="portrait-skill-cost-badge" aria-label="消耗${skill.actionCost || 0}点行动力">${skill.actionCost || 0}</b>` : ""}
      <span class="portrait-skill-node-copy${category ? ` is-${category.key}` : ""}">
        <small>${category?.label || "未解锁"}</small>
      </span>
    </button>
  `;
}

function renderPortraitSkillConnections(branchIndex, skillCount) {
  const points = portraitSkillBranchPositions.map((position) => ({
    x: (branchIndex === 0 ? position.x : 100 - position.x) * 10,
    y: position.y * 12,
  })).slice(0, skillCount);
  if (points.length < 2) return "";

  const path = points.slice(0, -1).reduce((commands, point, index) => {
    const previous = points[index - 1] || point;
    const next = points[index + 1];
    const afterNext = points[index + 2] || next;
    const control1 = {
      x: point.x + (next.x - previous.x) / 6,
      y: point.y + (next.y - previous.y) / 6,
    };
    const control2 = {
      x: next.x - (afterNext.x - point.x) / 6,
      y: next.y - (afterNext.y - point.y) / 6,
    };
    return `${commands} C ${control1.x.toFixed(1)} ${control1.y.toFixed(1)}, ${control2.x.toFixed(1)} ${control2.y.toFixed(1)}, ${next.x} ${next.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
  return `<path class="portrait-tree-link branch-${branchIndex + 1} unlocked" d="${path}" />`;
}

function portraitSelectedSkill() {
  return portraitSkillById(loadoutState.activePortraitSkillId);
}

function renderPortraitSkillLoadout(equippedWeapons, treeOpen) {
  const slots = Array.from(
    { length: WEAPON_SKILL_SLOT_COUNT },
    (_, slotIndex) => portraitSkillById(loadoutState.portraitEquippedSkillIds[slotIndex]),
  );
  return `
    <section class="portrait-skill-loadout${treeOpen ? " tree-open" : ""}" aria-label="技能装配">
      <svg class="portrait-skill-loadout-arc" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
        <path class="portrait-skill-loadout-frame" d="M 0 -75 A 500 350 0 0 0 1000 -75 L 1000 420 L 0 420 Z" />
      </svg>
      <div class="portrait-skill-loadout-grid">
        ${slots.map((skill, slotIndex) => {
          const openWeaponId = skill?.weaponId || loadoutState.activePortraitWeaponId || equippedWeapons[0]?.id || "";
          const active = skill?.id === loadoutState.activePortraitSkillId;
          const category = skill ? skillCategoryLabel(skill) : null;
          return `
            <button
              class="portrait-skill-slot${skill ? " filled" : " empty"}${active ? " active" : ""}"
              type="button"
              data-portrait-skill-slot="${slotIndex}"
              data-slot-open-weapon="${openWeaponId}"
              ${skill ? `data-slot-skill="${skill.id}" draggable="true"` : ""}
              aria-label="${skill ? `技能槽${slotIndex + 1}，${skill.name}，消耗${skill.actionCost || 0}点行动力` : `技能槽${slotIndex + 1}，选择技能`}"
            >
              <span class="portrait-skill-slot-art">
                ${skill?.icon ? `<img src="${skill.icon}" alt="" draggable="false" />` : "<i>+</i>"}
              </span>
              ${skill ? `<b class="portrait-skill-slot-cost">${skill.actionCost || 0}</b>` : ""}
              <small class="portrait-skill-slot-label${category ? ` is-${category.key}` : ""}">${category?.label || "空槽"}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function clearPortraitSkillDrag(root) {
  portraitDraggedSkillId = "";
  root.querySelectorAll(".is-dragging, .drag-over").forEach((node) => {
    node.classList.remove("is-dragging", "drag-over");
  });
  document.querySelector(".portrait-skill-drag-ghost")?.remove();
  portraitPointerDrag = null;
}

function completePortraitSkillDrop(skillId, slotIndex) {
  if (!assignPortraitSkillToSlot(skillId, slotIndex)) return false;
  const skill = portraitSkillById(skillId);
  loadoutState.activePortraitWeaponId = skill?.weaponId || "";
  loadoutState.activePortraitSkillId = skillId;
  loadoutState.portraitSkillPopupOpen = false;
  renderLoadoutPresetPage();
  return true;
}

function bindPortraitSkillDrag(root) {
  const sources = root.querySelectorAll("[data-portrait-skill][draggable], [data-slot-skill][draggable]");
  const targets = root.querySelectorAll("[data-portrait-skill-slot]");

  sources.forEach((source) => {
    const skillId = source.dataset.portraitSkill || source.dataset.slotSkill;
    source.addEventListener("dragstart", (event) => {
      portraitDraggedSkillId = skillId;
      source.classList.add("is-dragging");
      event.dataTransfer?.setData("text/plain", skillId);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    source.addEventListener("dragend", () => clearPortraitSkillDrag(root));

    source.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" || event.button !== 0) return;
      portraitPointerDrag = {
        pointerId: event.pointerId,
        source,
        skillId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        over: null,
      };
      source.setPointerCapture?.(event.pointerId);
    });
    source.addEventListener("pointermove", (event) => {
      const drag = portraitPointerDrag;
      if (!drag || drag.pointerId !== event.pointerId || drag.source !== source) return;
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (!drag.moved && distance < 8) return;
      event.preventDefault();
      if (!drag.moved) {
        drag.moved = true;
        portraitDraggedSkillId = skillId;
        source.classList.add("is-dragging");
        const ghost = document.createElement("span");
        ghost.className = "portrait-skill-drag-ghost";
        const image = source.querySelector("img")?.cloneNode();
        if (image) ghost.append(image);
        document.body.append(ghost);
        drag.ghost = ghost;
      }
      if (drag.ghost) {
        drag.ghost.style.left = `${event.clientX}px`;
        drag.ghost.style.top = `${event.clientY}px`;
      }
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-portrait-skill-slot]");
      drag.over?.classList.remove("drag-over");
      drag.over = target || null;
      drag.over?.classList.add("drag-over");
    }, { passive: false });
    const finishPointerDrag = (event) => {
      const drag = portraitPointerDrag;
      if (!drag || drag.pointerId !== event.pointerId || drag.source !== source) return;
      if (drag.moved) {
        portraitSuppressSkillClickUntil = Date.now() + 450;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-portrait-skill-slot]");
        const slotIndex = target?.dataset.portraitSkillSlot;
        if (target) {
          clearPortraitSkillDrag(root);
          completePortraitSkillDrop(skillId, slotIndex);
          return;
        }
      }
      clearPortraitSkillDrag(root);
    };
    source.addEventListener("pointerup", finishPointerDrag);
    source.addEventListener("pointercancel", finishPointerDrag);
  });

  targets.forEach((target) => {
    target.addEventListener("dragover", (event) => {
      const skillId = portraitDraggedSkillId || event.dataTransfer?.getData("text/plain");
      const skill = portraitSkillById(skillId);
      if (!skill) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      targets.forEach((slot) => slot.classList.toggle("drag-over", slot === target));
    });
    target.addEventListener("dragleave", () => target.classList.remove("drag-over"));
    target.addEventListener("drop", (event) => {
      event.preventDefault();
      const skillId = portraitDraggedSkillId || event.dataTransfer?.getData("text/plain");
      clearPortraitSkillDrag(root);
      completePortraitSkillDrop(skillId, target.dataset.portraitSkillSlot);
    });
  });
}

function portraitSkillEffectMarkup(skill) {
  if (skill.evadeBonus > 0) {
    return `获得 <b class="bonus-value">${skill.evadeBonus}%</b> 闪避率；成功闪避后，下一次技能行动力消耗降低 <b class="weak-value">${skill.actionDiscount || 1}</b> 点。`;
  }
  if (skill.damageBoost > 0) {
    return `进入蓄势状态，下一次攻击伤害提高 <b class="damage-value">${skill.damageBoost}%</b>，并获得 <b class="weak-value">不可打断</b>。`;
  }
  if (skill.stance === "greatsword_counter") {
    return `进入防御姿态；受到近战攻击时，有 <b class="bonus-value">${Math.round((skill.counterChance || 0) * 100)}%</b> 概率反击并造成 <b class="damage-value">${skill.counterDamage || 0}</b> 点伤害。`;
  }
  if (skill.damage > 0) {
    const armorText = skill.armorDamage > 0
      ? `，并削减 <b class="break-value">${skill.armorDamage}</b> 点护甲`
      : "";
    const exposedText = skill.exposedBonus > 1
      ? `；命中 <b class="weak-value">裸露</b> 部位时，伤害提高 <b class="bonus-value">${Math.round((skill.exposedBonus - 1) * 100)}%</b>`
      : "";
    const comboText = skill.comboChance > 0
      ? `，有 <b class="bonus-value">${Math.round(skill.comboChance * 100)}%</b> 概率触发追击`
      : "";
    return `对敌方${skill.targetLabel || "目标"}造成 <b class="damage-value">${skill.damage}</b> 点伤害${armorText}${exposedText}${comboText}。`;
  }
  return skill.desc || "该状态技能的具体效果仍在演示中。";
}

function renderPortraitSkillPopup(skill, weapon) {
  if (!skill || !weapon || !loadoutState.portraitSkillPopupOpen) return "";
  const category = skillCategoryLabel(skill);
  const secondTag = skill.tags?.[0] || skill.kindLabel || "技能";
  const equipped = isPortraitSkillEquipped(skill.id);
  const equippedCount = portraitEquippedSkillCount();
  const atCapacity = !equipped && equippedCount >= WEAPON_SKILL_SLOT_COUNT;
  const capacityTitle = "已达到六个装备槽上限；也可将该技能拖到任意格子直接替换";
  return `
    <button class="portrait-skill-popup-backdrop" type="button" data-close-skill-popup aria-label="关闭技能说明"></button>
    <aside class="portrait-skill-popup" style="--popup-color:${skill.color || "#e5b651"}" aria-label="${skill.name}技能说明">
      <span class="portrait-popup-icon"><img src="${skill.icon || weapon.icon}" alt="" /></span>
      <section class="portrait-popup-main">
        <header>
          <span><small>${weapon.name}</small><strong>${skill.name}</strong></span>
          <span class="portrait-popup-tags"><i>${category.label}</i><i>${secondTag}</i></span>
        </header>
        <p>${portraitSkillEffectMarkup(skill)}</p>
        <small>${skill.desc || "原型技能，仅用于战前界面选择演示。"}</small>
      </section>
      <footer>
        <span>目标 <b>${skill.targetLabel || "自身"}</b></span>
        <span>消耗 <b>${skill.actionCost || 0}</b> 行动力</span>
        <button class="portrait-popup-equip${equipped ? " equipped" : ""}" type="button" data-toggle-skill-equip="${skill.id}" ${atCapacity ? `disabled title="${capacityTitle}"` : ""}>${equipped ? "卸下" : "装备"}</button>
      </footer>
      <button class="portrait-popup-close" type="button" data-close-skill-popup aria-label="关闭">×</button>
    </aside>
  `;
}

function renderPortraitLoadoutDetail(preset) {
  if (loadoutState.portraitLoadoutView === "weapon") {
    const weapon = weapons.find((item) => item.id === loadoutState.activePortraitWeaponId) || carriedWeapons()[0];
    const skill = portraitSelectedSkill() || configuredWeaponSkills(weapon?.id)[0];
    if (!weapon || !skill) return "";
    const category = skillCategoryLabel(skill);
    return `
      <section class="portrait-detail-panel skill-detail" style="--detail-color:${skill.color || "#79c8ef"}">
        <span class="portrait-detail-icon">${skill.icon ? `<img src="${skill.icon}" alt="" />` : weapon.short}</span>
        <span class="portrait-detail-copy">
          <small>${weapon.name} · ${category.label}</small>
          <strong>${skill.name}</strong>
          <p>${skill.desc || skill.summaryOverride || "该技能尚未补充说明。"}</p>
        </span>
        <span class="portrait-detail-cost"><small>行动力</small><b>${skill.actionCost || 0}</b></span>
      </section>
    `;
  }

  const part = loadoutParts.find((item) => item.id === loadoutState.activePartId) || loadoutParts[0];
  const item = portraitArmorItem(part);
  const attachments = portraitArmorAttachments(part.id);
  return `
    <section class="portrait-detail-panel armor-detail">
      <span class="portrait-detail-icon">${item?.image ? `<img src="${item.image}" alt="" />` : item?.icon || part.label.slice(0, 1)}</span>
      <span class="portrait-detail-copy">
        <small>${preset.armorTheme}战甲 · ${part.label}</small>
        <strong>${item?.name || "未装配"}</strong>
        <p>${item?.trait || "选择该部位查看当前战甲配置。"}${attachments.length ? ` · 挂件：${attachments.map((attachment) => attachment.name).join("、")}` : ""}</p>
      </span>
      <span class="portrait-detail-state">已装配</span>
    </section>
  `;
}

function renderLoadoutPresetPage() {
  if (!ui.loadoutPresetList || !ui.loadoutPresetStage || !ui.loadoutPresetDetail) return;
  updateEnterBattleState();
  const preset = loadoutPresetById(loadoutState.activeLoadoutPresetId);
  const boss = currentBossBlueprint();
  const equippedWeapons = carriedWeapons();
  const treeOpen = loadoutState.portraitLoadoutView === "weapon";
  const selectedWeapon = equippedWeapons.find((weapon) => weapon.id === loadoutState.activePortraitWeaponId)
    || equippedWeapons[0];
  const activeArmorSet = portraitArmorSetTabs.find((armorSet) => armorSet.id === loadoutState.activePortraitArmorSetId)
    || portraitArmorSetTabs.find((armorSet) => armorSet.unlocked)
    || portraitArmorSetTabs[0];

  if (ui.enterBattleFromPresetsBtn) ui.enterBattleFromPresetsBtn.hidden = treeOpen;

  if (ui.presetOwnedCount) ui.presetOwnedCount.textContent = `${loadoutPresets.length} 套`;
  if (ui.presetBossContext) {
    ui.presetBossContext.innerHTML = `
      <span class="preset-boss-portrait"><img src="${boss.image || "./assets/boss.png"}" alt="" /></span>
      <span>
        <small>目标</small>
        <strong>${boss.name}</strong>
        <em>战前配置将直接带入战斗</em>
      </span>
    `;
  }

  ui.loadoutPresetList.innerHTML = loadoutPresets
    .map((item) => {
      const active = item.id === preset.id;
      return `
        <button class="loadout-preset-card tone-${item.tone}${active ? " active" : ""}" type="button" data-loadout-preset="${item.id}" aria-pressed="${active}">
          <small>${item.role}</small>
          <strong>${item.name}</strong>
        </button>
      `;
    })
    .join("");

  ui.loadoutPresetStage.dataset.tone = preset.tone;
  ui.loadoutPresetStage.classList.toggle("skill-tree-mode", treeOpen);
  ui.loadoutPresetStage.innerHTML = `
    <div class="portrait-stage-grid" aria-hidden="true"></div>
    <nav class="portrait-armor-tabs" aria-label="战甲套装类型">
      <span class="portrait-rail-title">战甲</span>
      ${portraitArmorSetTabs.map((armorSet) => {
        const active = !treeOpen && armorSet.id === loadoutState.activePortraitArmorSetId;
        return `
          <button class="portrait-armor-tab${active ? " active" : ""}${armorSet.unlocked ? " unlocked" : " locked"}" type="button" data-portrait-armor-set="${armorSet.id}" aria-pressed="${active}" ${armorSet.unlocked ? "" : "disabled"}>
            <span><img src="${armorSet.image}" alt="" />${armorSet.unlocked ? "" : "<i>锁</i>"}</span>
            <small>${armorSet.label}</small>
            <em>${armorSet.unlocked ? "已装备" : "未解锁"}</em>
          </button>
        `;
      }).join("")}
    </nav>

    <section class="portrait-character${treeOpen ? " tree-open" : ""}" aria-label="当前装配角色">
      <span class="preset-live-state"><i></i>${preset.armorTheme}战甲</span>
      <img class="preset-character-art" src="./assets/loadout-character-front.png" alt="当前装配角色" />
      ${isLoadoutItemEquipped("无人机") ? `<img class="preset-character-drone" src="./assets/loadout-drone.png" alt="" />` : ""}
    </section>

    <section class="portrait-skill-tree${treeOpen ? " open" : ""}" data-active-branch="${Math.max(0, equippedWeapons.findIndex((weapon) => weapon.id === selectedWeapon?.id))}" aria-hidden="${!treeOpen}">
      <svg class="portrait-tree-lines" viewBox="0 0 1000 1200" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="500" cy="830" rx="430" ry="680" />
        <ellipse cx="500" cy="825" rx="310" ry="545" />
        ${equippedWeapons.map((weapon, branchIndex) => renderPortraitSkillConnections(branchIndex, portraitWeaponTreeSkills(weapon.id).length)).join("")}
        <path class="portrait-tree-root-link branch-1" d="M 340 1188 C 370 1280 430 1398 500 1450" />
        <path class="portrait-tree-root-link branch-2" d="M 660 1188 C 630 1280 570 1398 500 1450" />
      </svg>
      ${equippedWeapons.map((weapon, branchIndex) => {
        const weaponSkills = portraitWeaponTreeSkills(weapon.id);
        const branchActive = weapon.id === selectedWeapon?.id;
        return `
          <div class="portrait-skill-branch branch-${branchIndex + 1}${branchActive ? " active" : ""}" data-weapon-branch="${weapon.id}">
            ${Array.from({ length: WEAPON_SKILL_SLOT_COUNT }, (_, slotIndex) => renderPortraitSkillNode(
              weapon,
              weaponSkills[slotIndex] || null,
              slotIndex,
              branchIndex,
            )).join("")}
          </div>
        `;
      }).join("")}
    </section>

    <button class="portrait-tree-armor-root${treeOpen ? " tree-open" : ""}" type="button" data-portrait-armor-root aria-label="${activeArmorSet.label}">
      <span><img src="${activeArmorSet.image}" alt="" draggable="false" /></span>
      <small>战甲</small>
    </button>

    ${renderPortraitSkillLoadout(equippedWeapons, treeOpen)}
    ${renderPortraitSkillPopup(portraitSelectedSkill(), selectedWeapon)}
  `;

  ui.loadoutPresetDetail.innerHTML = renderPortraitLoadoutDetail(preset);

  ui.loadoutPresetList.querySelectorAll("[data-loadout-preset]").forEach((button) => {
    button.addEventListener("click", () => applyLoadoutPreset(button.dataset.loadoutPreset));
  });
  ui.loadoutPresetStage.querySelectorAll("[data-portrait-armor-set]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.portraitLoadoutView = "armor";
      loadoutState.activePortraitArmorSetId = button.dataset.portraitArmorSet;
      loadoutState.activePortraitWeaponId = "";
      loadoutState.activePortraitSkillId = "";
      loadoutState.portraitSkillPopupOpen = false;
      renderLoadoutPresetPage();
    });
  });
  ui.loadoutPresetStage.querySelectorAll("[data-portrait-armor-root]").forEach((button) => {
    button.addEventListener("click", () => {
      const treeIsOpen = loadoutState.portraitLoadoutView === "weapon";
      const firstWeapon = carriedWeapons()[0];
      loadoutState.portraitLoadoutView = treeIsOpen ? "armor" : "weapon";
      loadoutState.activePortraitWeaponId = treeIsOpen ? "" : loadoutState.activePortraitWeaponId || firstWeapon?.id || "";
      loadoutState.activePortraitSkillId = "";
      loadoutState.portraitSkillPopupOpen = false;
      renderLoadoutPresetPage();
    });
  });
  ui.loadoutPresetStage.querySelectorAll("[data-portrait-skill-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      if (Date.now() < portraitSuppressSkillClickUntil) return;
      const skillId = button.dataset.slotSkill || "";
      const skill = portraitSkillById(skillId);
      if (!skill) return;
      loadoutState.activePortraitWeaponId = skill.weaponId || "";
      loadoutState.activePortraitSkillId = skillId;
      loadoutState.portraitSkillPopupOpen = true;
      renderLoadoutPresetPage();
    });
  });
  ui.loadoutPresetStage.querySelectorAll("[data-portrait-skill]").forEach((button) => {
    button.addEventListener("click", () => {
      if (Date.now() < portraitSuppressSkillClickUntil) return;
      loadoutState.activePortraitWeaponId = button.dataset.portraitWeapon;
      loadoutState.activePortraitSkillId = button.dataset.portraitSkill;
      loadoutState.portraitSkillPopupOpen = true;
      renderLoadoutPresetPage();
    });
  });
  ui.loadoutPresetStage.querySelectorAll("[data-close-skill-popup]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.portraitSkillPopupOpen = false;
      renderLoadoutPresetPage();
    });
  });
  ui.loadoutPresetStage.querySelector("[data-toggle-skill-equip]")?.addEventListener("click", (event) => {
    const skillId = event.currentTarget.dataset.toggleSkillEquip;
    const equippedIds = [...loadoutState.portraitEquippedSkillIds];
    const equippedSlotIndex = equippedIds.indexOf(skillId);
    if (equippedSlotIndex >= 0) {
      equippedIds[equippedSlotIndex] = null;
      loadoutState.portraitEquippedSkillIds = equippedIds;
    } else {
      const emptySlotIndex = equippedIds.findIndex((equippedId) => !equippedId);
      if (emptySlotIndex < 0 || !assignPortraitSkillToSlot(skillId, emptySlotIndex)) return;
    }
    renderLoadoutPresetPage();
  });
  bindPortraitSkillDrag(ui.loadoutPresetStage);
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
    .filter((skill) => skill.weaponId === weaponId && !isPassiveSkill(skill))
    .sort((a, b) => {
      return (a.actionCost || 0) - (b.actionCost || 0) || a.name.localeCompare(b.name, "zh-Hans-CN");
    });
}

function ensureWeaponSkillLoadout() {
  if (!loadoutState.weaponSkillLoadout) loadoutState.weaponSkillLoadout = {};
  weapons.filter(isWeaponUnlocked).forEach((weapon) => {
    const validIds = weaponSkillPool(weapon.id).map((skill) => skill.id);
    const preferredIds = (defaultWeaponSkillLoadout[weapon.id] || validIds)
      .filter((id) => validIds.includes(id))
      .slice(0, WEAPON_SKILL_SLOT_COUNT);
    const current = Array.isArray(loadoutState.weaponSkillLoadout[weapon.id])
      ? loadoutState.weaponSkillLoadout[weapon.id].filter((id) => validIds.includes(id))
      : preferredIds;
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
    .filter(Boolean);
}

function isPassiveSkill(skill) {
  return skill?.activation === "passive" || skill?.kind === "passive";
}

function upperArmorPassivePool() {
  return skills
    .filter(isPassiveSkill)
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function ensureUpperArmorPassiveInlays() {
  const validIds = new Set(upperArmorPassivePool().map((skill) => skill.id));
  const current = Array.isArray(loadoutState.upperArmorPassiveInlays)
    ? loadoutState.upperArmorPassiveInlays
    : defaultUpperArmorPassiveInlays;
  const normalized = current
    .slice(0, UPPER_ARMOR_PASSIVE_SLOT_COUNT)
    .map((id) => (id && validIds.has(id) ? id : null));
  while (normalized.length < UPPER_ARMOR_PASSIVE_SLOT_COUNT) normalized.push(null);
  loadoutState.upperArmorPassiveInlays = normalized;
  return normalized;
}

function configuredUpperArmorPassiveSkills() {
  const pool = upperArmorPassivePool();
  return ensureUpperArmorPassiveInlays()
    .map((id) => pool.find((skill) => skill.id === id))
    .filter(Boolean);
}

function configuredUpperArmorPassiveByEffect(passiveEffect) {
  return configuredUpperArmorPassiveSkills().find((skill) => skill.passiveEffect === passiveEffect) || null;
}

function equipUpperArmorPassive(slotIndex, skillId) {
  const pool = upperArmorPassivePool();
  if (!pool.some((skill) => skill.id === skillId)) return;
  const targetIndex = Math.max(0, Math.min(UPPER_ARMOR_PASSIVE_SLOT_COUNT - 1, Number(slotIndex) || 0));
  const next = ensureUpperArmorPassiveInlays().map((id) => (id === skillId ? null : id));
  next[targetIndex] = skillId;
  loadoutState.upperArmorPassiveInlays = next;
  loadoutState.upperArmorPassivePickerOpen = false;
  renderPrebattleLoadout();
}

function unequipUpperArmorPassive(slotIndex) {
  const targetIndex = Math.max(0, Math.min(UPPER_ARMOR_PASSIVE_SLOT_COUNT - 1, Number(slotIndex) || 0));
  const next = [...ensureUpperArmorPassiveInlays()];
  next[targetIndex] = null;
  loadoutState.upperArmorPassiveInlays = next;
  loadoutState.upperArmorPassivePickerOpen = false;
  renderPrebattleLoadout();
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
  const avatarProfile = armorCombatAvatarProfile();
  const playerMaxHp = 220 + armorStats.hp;
  const playerMaxAmmo = avatarProfile.primaryTypeId === "resource" ? 12 : 10;
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
      ammo: playerMaxAmmo,
      maxAmmo: playerMaxAmmo,
      action: 4,
      maxAction: 7,
      gourdUses: 0,
      guardCounterChance: 0,
      guardCounterDamage: 0,
      greatswordStanceActive: false,
      greatswordDamageEvents: 0,
      greatswordStrength: 0,
      bloodlust: 0,
      bloodlustThresholdsResolved: [],
      avatarSurvivalGuardUsed: false,
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
      strength: 3,
      bleedStacks: 0,
      bleedTurns: 0,
      parts,
    },
    activeSkill: null,
    activeTarget: null,
    soulTargetSelection: null,
    soulChargeDots: 0,
    reactionTimer: 0,
    reactionDuration: QTE_WINDOW_SECONDS,
    videoAttack: null,
    skillCinematic: null,
    pendingCounterFollowUp: null,
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
  const avatarProfile = armorCombatAvatarProfile();
  floaters = [];
  playerHitFloaters = [];
  battleSkillPageByWeapon = Object.create(null);
  selectedBattleSkillByWeapon = Object.create(null);
  window.clearTimeout(battleSkillPageTransitionTimer);
  battleSkillPageTransitionTimer = null;
  window.cancelAnimationFrame(skillWheelGeometryFrame);
  skillWheelGeometryFrame = null;
  window.clearTimeout(skillWheelGeometrySettleTimer);
  skillWheelGeometrySettleTimer = null;
  skillWheelGeometry = null;
  closeWeaponOverlay();
  buildWeaponControls();
  buildSkillControls();
  buildSoulSkillControls();
  updatePlayerSpriteForWeapon();
  renderWeaponToggle();
  showWeakpointTip(`${boss.startTip || "胸口核心已暴露，优先攻击弱点。"} 战斗化身生效：${avatarProfile.opening}`, 2.6);
  log(`挑战开始：${boss.name}。${boss.summary}`);
  log(`战斗化身生效：${avatarProfile.title}（${avatarProfile.carryText}）。${avatarProfile.log}`);
  log(`携带武器：${weaponNames}。`);
  if (isWeaponCarried("greatsword")) {
    const greatswordLoadout = configuredWeaponSkills("greatsword");
    const activeNames = greatswordLoadout.map((skill) => skill.name).join("、") || "无";
    log(`大剑主动技能：${activeNames}。`);
  }
  const passiveNames = configuredUpperArmorPassiveSkills().map((skill) => skill.name).join("、") || "无";
  log(`上衣被动镶嵌：${passiveNames}。被动效果由战甲承载，并在对应武器行为中自动结算。`);
  const bracerCounterEffect = equippedArmorPartCombatEffect("bracer");
  if (bracerCounterEffect) {
    log(`手部铠甲效果：反击成功后追加${bracerCounterEffect.name}，造成 ${bracerCounterEffect.damage} 点基础伤害。`);
  }
  if (isLoadoutItemEquipped("尖刺肩甲")) {
    log("尖刺肩甲效果：反击与反击触发的追加攻击伤害提高 10%。");
  }
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
      战甲承载 ${nextCapacity}
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
        <b>战甲承载</b>
        <em>${capacity}</em>
      </span>
      <small>该部位共提供 ${totalSocketCount} 个挂载孔。孔位决定能否装上挂件；战甲承载决定能否驱动灵媒器与战斗模组。</small>
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
      <button class="armor-board-open armor-board-open-minimal" type="button" data-open-armor-energy-board aria-label="打开战甲承载面板" title="打开战甲承载面板">
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

function passiveInlayStatText(skill) {
  return weaponSkillCombatStats(skill)
    .slice(0, 2)
    .map(([label, value]) => `${label} ${value}`)
    .join(" · ");
}

function passiveInlayWeaponName(skill) {
  return weapons.find((weapon) => weapon.id === skill.weaponId)?.name || "战甲";
}

function renderUpperArmorPassivePicker(inlays) {
  if (!loadoutState.upperArmorPassivePickerOpen) return "";
  const activeSlot = Math.max(
    0,
    Math.min(UPPER_ARMOR_PASSIVE_SLOT_COUNT - 1, Number(loadoutState.activeUpperArmorPassiveSlot) || 0)
  );
  return `
    <div class="upper-inlay-modal-layer" role="presentation">
      <div class="upper-inlay-modal-backdrop" data-close-upper-inlay-picker aria-label="关闭被动镶嵌列表"></div>
      <section class="upper-inlay-picker" role="dialog" aria-modal="true" aria-label="选择上衣被动">
        <header>
          <span>
            <b>选择上衣被动</b>
            <small>镶嵌槽 ${activeSlot + 1} · 常驻效果由战甲提供，不占用武器主动技能槽</small>
          </span>
          <button type="button" data-close-upper-inlay-picker aria-label="关闭被动镶嵌列表">×</button>
        </header>
        <div class="upper-inlay-candidates">
          ${upperArmorPassivePool().map((skill) => {
            const equippedIndex = inlays.indexOf(skill.id);
            const active = equippedIndex === activeSlot;
            return `
              <button class="upper-inlay-candidate${active ? " active" : ""}" type="button" data-equip-upper-passive="${skill.id}" data-upper-passive-slot="${activeSlot}" ${active ? "disabled" : ""}>
                <i style="--inlay-color:${skill.color}">被</i>
                <span>
                  <small>${passiveInlayWeaponName(skill)}联动${equippedIndex >= 0 && !active ? ` · 当前在槽 ${equippedIndex + 1}` : ""}</small>
                  <strong>${skill.name}</strong>
                  <em>${passiveInlayStatText(skill)}</em>
                  <u>${skill.desc}</u>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderUpperArmorPassiveInlays(activePart) {
  const panel = document.getElementById("upperArmorPassiveInlays");
  if (!panel) return;
  if (activePart.id !== "torso") {
    panel.hidden = true;
    panel.innerHTML = "";
    loadoutState.upperArmorPassivePickerOpen = false;
    return;
  }

  const inlays = ensureUpperArmorPassiveInlays();
  const pool = upperArmorPassivePool();
  const equippedCount = inlays.filter(Boolean).length;
  panel.hidden = false;
  panel.innerHTML = `
    <header class="upper-inlay-head">
      <span>
        <small>上衣战甲</small>
        <strong>被动镶嵌</strong>
      </span>
      <em>${equippedCount}/${UPPER_ARMOR_PASSIVE_SLOT_COUNT}</em>
    </header>
    <div class="upper-inlay-slots">
      ${inlays.map((skillId, index) => {
        const skill = pool.find((item) => item.id === skillId);
        return `
          <article class="upper-inlay-slot${skill ? " equipped" : " empty"}">
            <button type="button" data-open-upper-passive="${index}" aria-label="${skill ? `替换${skill.name}` : `装配第${index + 1}个被动`}">
              <i style="--inlay-color:${skill?.color || "#607087"}">${skill ? "被" : "+"}</i>
              <span>
                <strong>${skill?.name || "空镶嵌槽"}</strong>
                <small>${skill ? `${passiveInlayWeaponName(skill)} · ${passiveInlayStatText(skill)}` : "点击选择战甲被动"}</small>
              </span>
            </button>
            ${skill ? `<button class="upper-inlay-remove" type="button" data-remove-upper-passive="${index}" aria-label="卸下${skill.name}">×</button>` : ""}
          </article>
        `;
      }).join("")}
    </div>
    <p>被动由上衣承载；只有使用对应武器时才会触发。</p>
    ${renderUpperArmorPassivePicker(inlays)}
  `;

  panel.querySelectorAll("[data-open-upper-passive]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.activeUpperArmorPassiveSlot = Number(button.dataset.openUpperPassive) || 0;
      loadoutState.upperArmorPassivePickerOpen = true;
      renderPrebattleLoadout();
    });
  });
  panel.querySelectorAll("[data-remove-upper-passive]").forEach((button) => {
    button.addEventListener("click", () => unequipUpperArmorPassive(button.dataset.removeUpperPassive));
  });
  panel.querySelectorAll("[data-close-upper-inlay-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadoutState.upperArmorPassivePickerOpen = false;
      renderPrebattleLoadout();
    });
  });
  panel.querySelectorAll("[data-equip-upper-passive]").forEach((button) => {
    button.addEventListener("click", () => {
      equipUpperArmorPassive(button.dataset.upperPassiveSlot, button.dataset.equipUpperPassive);
    });
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
  renderUpperArmorPassiveInlays(activePart);

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
  const tags = [isPassiveSkill(skill) ? "被动" : "主动"];
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  (skill.tags || []).forEach((tag) => tags.push(tag));
  return [...new Set(tags)].map((tag) => `<i class="${skillTagClass(tag)}">${tag}</i>`).join("");
}

function weaponSkillCombatStats(skill) {
  if (skill.stance === "greatsword_counter") {
    return [
      ["反击率", `${Math.round((skill.counterChance || 0) * 100)}%`],
      ["反击伤害", `${skill.counterDamage || 0}`],
      ["有效目标", "近战"],
    ];
  }
  if (skill.passiveEffect === "counter_transfer") {
    return [
      ["传导伤害", `${Math.round((skill.transferDamageRatio || 0) * 100)}%`],
      ["力量压制", `+${Math.round((skill.strengthDamageBonus || 0) * 100)}%`],
    ];
  }
  if (skill.passiveEffect === "damage_chain") {
    return [
      ["触发", `${skill.triggerHitCount || 3} 次伤害`],
      ["追斩", `${Math.round((skill.followUpDamageRatio || 0) * 100)}%`],
      ["力量", `每击 +${skill.strengthPerHit || 1}`],
    ];
  }
  if (skill.passiveEffect === "bleed_hunger") {
    return [
      ["流血率", `${Math.round((skill.bleedChance || 0) * 100)}%`],
      ["叠层", `${skill.bleedMaxStacks || 5} 层`],
      ["吸血", `${Math.round((skill.healRatio || 0) * 100)}%`],
    ];
  }

  const stats = [];
  if (skill.damage > 0) stats.push(["伤害", `${skill.damage}`]);
  const armorDamage = effectiveArmorDamage(skill);
  if (armorDamage > 0) stats.push(["破甲", `${armorDamage}`]);
  if (skill.comboChance) stats.push(["连击率", `${Math.round(skill.comboChance * 100)}%`]);
  if (skill.bloodReap) stats.push(["流血结算", "嗜血 9 / 15"]);
  if (skill.ammoCost) stats.push(["弹药", `${skill.ammoCost}`]);
  return stats;
}

function renderWeaponSkillCombatStats(skill) {
  const stats = weaponSkillCombatStats(skill);
  if (!stats.length) return "";
  return `
    <span class="weapon-skill-stat-row" aria-label="战斗数值">
      ${stats.map(([label, value]) => `<span><small>${label}</small><b>${value}</b></span>`).join("")}
    </span>
  `;
}

function renderWeaponSkillTarget(skill) {
  if (isPassiveSkill(skill)) {
    return `
      <span class="weapon-skill-passive-mark" aria-label="被动技能">
        <b>被</b>
        <small>常驻</small>
      </span>
    `;
  }
  if (skill.stance) {
    return `
      <span class="weapon-skill-passive-mark stance" aria-label="自身架势">
        <b>守</b>
        <small>自身</small>
      </span>
    `;
  }
  return renderPartIconGroup(skill.targetParts || [], "badge");
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
  const targetParts = skill.targetParts || [];
  const passive = isPassiveSkill(skill);
  return `
    <article class="weapon-skill-slot ${mode}${passive ? " passive" : " active-skill"}">
      <span class="weapon-skill-target${targetParts.length > 1 ? " multi" : ""}${passive ? " passive" : ""}" style="--skill-color:${skill.color}">
        ${renderWeaponSkillTarget(skill)}
      </span>
      <span class="weapon-skill-copy">
        <span class="weapon-skill-title-line">
          <strong>${skill.name}</strong>
          <em class="weapon-skill-cost${passive ? " passive" : ""}">${passive ? "常驻被动" : skill.actionCost > 0 ? `行动力 ${skill.actionCost}` : "0费"}</em>
        </span>
        <span class="weapon-skill-tag-row">${renderWeaponSkillTags(skill)}</span>
        ${renderWeaponSkillCombatStats(skill)}
        <small>${skill.desc}</small>
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
        ${available.length ? `
          <section class="weapon-skill-candidate-group">
            <header><strong>主动技能</strong><small>进入战斗操作栏</small></header>
            ${available.map((skill) => renderWeaponSkillCard(skill, weapon.id, "candidate")).join("")}
          </section>
        ` : ""}
        ${available.length ? "" : `<p>当前没有未装配技能。</p>`}
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
  return loadoutParts.reduce((sum, part) => sum + armorEnergyCapacityForPart(part), 0);
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

function canPlaceArmorFactorInSlot(slotIndex, factorId) {
  const normalized = Number(slotIndex);
  const factor = armorFactorById(factorId);
  if (!Number.isInteger(normalized) || normalized < 0 || normalized > 8 || !factor) return false;
  return factor.cost <= armorFactorSlotCapacity(normalized);
}

function canEquipArmorFactorSlot(slotIndex, factorId) {
  const normalized = Number(slotIndex);
  const factor = armorFactorById(factorId);
  if (!factor || !canPlaceArmorFactorInSlot(normalized, factor.id)) return false;
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
  if (!canPlaceArmorFactorInSlot(to, fromFactor)) return;
  if (toFactor && !canPlaceArmorFactorInSlot(from, toFactor)) return;
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
    const capacity = armorFactorSlotCapacity(index);
    if (!factor) {
      return {
        index,
        empty: true,
        capacity,
      };
    }
    return {
      index,
      empty: false,
      overloaded: factor.cost > capacity,
      ...factor,
      capacity,
    };
  });

  const capacityUsed = cells.filter((cell) => !cell.empty).reduce((sum, cell) => sum + cell.cost, 0);
  const capacityTotal = armorFactorCapacityTotal();
  const overCapacity = capacityUsed > capacityTotal || cells.some((cell) => !cell.empty && cell.overloaded);
  const capacityRemaining = Math.max(0, capacityTotal - capacityUsed);
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
    capacityRemaining,
    overCapacity,
    title: "战甲承载",
  };
}

function armorFactorTypeCounts(board = buildArmorFactorBoard()) {
  return board.cells.reduce((counts, cell) => {
    if (cell.empty) return counts;
    counts[cell.typeId] = (counts[cell.typeId] || 0) + 1;
    return counts;
  }, {});
}

function armorBuildIdentity(board = buildArmorFactorBoard()) {
  const counts = armorFactorTypeCounts(board);
  const sortedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primaryTypeId = sortedTypes[0]?.[0] || "resource";
  const primaryType = armorFactorTypes[primaryTypeId] || armorFactorTypes.resource;
  const usedRate = board.capacityTotal ? board.capacityUsed / board.capacityTotal : 0;
  let title = "修罗均衡型";
  let summary = "当前战甲以均衡承载为主，适合验证武器、挂件和灵媒器之间的基础协同。";
  if ((counts.weapon || 0) >= 2) {
    title = "武装破阵型";
    summary = "武装灵媒器占比更高，适合围绕近身压制、破甲和反击窗口塑造战斗化身。";
  } else if ((counts.assist || 0) >= 2) {
    title = "挂件协同型";
    summary = "辅助模组占比更高，适合把打对部位、机动追击和挂件协同做成核心打法。";
  } else if ((counts.survival || 0) >= 2) {
    title = "续战守势型";
    summary = "生存灵媒器占比更高，适合承压、防护和持续作战的稳定打法。";
  } else if ((counts.resource || 0) >= 2 || usedRate >= 0.62) {
    title = "高承载驱动型";
    summary = "资源灵媒器和高承载占用更突出，适合驱动高耗挂件或强化持续释放能力。";
  }
  return {
    title,
    summary,
    primaryType,
    tags: [
      `主轴：${primaryType.label}`,
      `承载：${board.capacityUsed}/${board.capacityTotal}`,
      `余量：${board.capacityRemaining}`,
    ],
  };
}

function armorCombatAvatarProfile(board = buildArmorFactorBoard()) {
  const identity = armorBuildIdentity(board);
  const counts = armorFactorTypeCounts(board);
  const primaryTypeId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "resource";
  const carryText = `战甲承载 ${board.capacityUsed}/${board.capacityTotal}`;
  const profileByType = {
    weapon: {
      opening: "这套化身更适合主动破阵，优先拆硬甲和打断危险部位。",
      log: "武装灵媒器更集中，战斗中应把破甲和近身压制作为主要节奏。",
    },
    assist: {
      opening: "这套化身更适合读弱点和衔接挂件，优先抓手部打断与核心爆发窗口。",
      log: "挂件协同能力更集中，战斗中应围绕打对部位、打断和协同追击展开。",
    },
    survival: {
      opening: "这套化身更适合承压换节奏，保留行动力并利用防御姿态、格挡和续航。",
      log: "生存灵媒器更集中，战斗中应通过承压、防守反击和恢复稳住回合。",
    },
    resource: {
      opening: "这套化身更适合驱动高耗挂件和爆发技能，注意把承载转化成关键回合输出。",
      log: "资源灵媒器更集中，战斗中应把弹药、挂件介入和大招蓄力串成爆发链路。",
    },
  };
  const profile = profileByType[primaryTypeId] || profileByType.resource;
  return {
    ...identity,
    primaryTypeId,
    carryText,
    opening: profile.opening,
    log: profile.log,
  };
}

function combatAvatarSkillHint(skill) {
  if (!skill) return "";
  const profile = armorCombatAvatarProfile();
  const targets = state?.enemy?.parts ? skill.targetParts.map(partById).filter(Boolean) : [];
  const namesOf = (predicate) => targets.filter(predicate).map((target) => target.label).join("、");
  const targetNames = targets.map((target) => target.label).join("、") || skill.targetLabel;
  const weakpointNames = namesOf((target) => target.weakpoint && target.armorState !== "armored" && !target.broken);
  const openedNames = namesOf((target) => !target.weakpoint && target.armorState === "exposed" && !target.broken);
  const brokenNames = namesOf((target) => target.broken);
  const armoredNames = namesOf((target) => target.armorState === "armored" && !target.broken);
  const hitsArmInterrupt = targets.some((target) => target.id === "arms")
    && currentPendingEnemyAttack()?.interruptPart === "arms"
    && !state.enemy.pendingAttack?.interrupted;
  const targetStateText = (() => {
    if (weakpointNames) return `打对部位：${weakpointNames}已暴露，伤害 +8%`;
    if (brokenNames) return `追击破坏部位：${brokenNames}伤害 +8%`;
    if (openedNames) return `打对部位：${openedNames}已破甲，伤害 +8%`;
    if (hitsArmInterrupt) return "打断机会：手部正在准备投石，手部压制 +10%";
    if (armoredNames && !skill.armorBreaker) return `${armoredNames}仍有硬甲，先用破甲技能更划算`;
    return "";
  })();
  if (profile.primaryTypeId === "weapon") {
    if (skill.armorBreaker) return "生效：武装破阵，破甲值 +15%。";
    if (["fists", "greatsword"].includes(skill.weaponId)) return "生效：武装压制，裸露部位伤害 +8%。";
    return "生效：武装强化，衔接破甲后的输出更高。";
  }
  if (profile.primaryTypeId === "assist") {
    const effects = [];
    if (targetStateText) effects.push(targetStateText);
    if (skill.accessoryFlow) effects.push("挂件协同：挂件介入伤害 +10%");
    if (skill.comboChance) effects.push("挂件协同：连击率 +15%");
    if (!effects.length) effects.push("挂件协同：更适合衔接追击");
    return `生效：${effects.join("；")}。`;
  }
  if (profile.primaryTypeId === "survival") {
    if (skill.stance) return "生效：续战守势，防御姿态反击率 +10%。";
    if ((skill.actionCost || 0) === 0) return "生效：稳态回合，低耗技能额外蓄魂 +2。";
    return "生效：续战守势，首次受击获得 15% 减伤。";
  }
  if (skill.ammoCost) return "生效：高承载驱动，远程技能伤害 +8%，蓄魂 +2。";
  if (skill.accessoryFlow) return "生效：高承载驱动，挂件介入伤害 +12%。";
  if (skill.soulCost || skill.maxDots) return "生效：高承载驱动，战甲技能蓄魂更快。";
  return "生效：高承载驱动，技能额外蓄魂 +3。";
}

function logCombatAvatarSkillContext(skill) {
  const hint = combatAvatarSkillHint(skill);
  if (!hint) return;
  log(`战斗化身生效：${hint.replace(/^生效：/, "")}`);
}

function combatAvatarSkillEffect(skill, target = null, context = {}) {
  if (!skill) return {};
  const profile = armorCombatAvatarProfile();
  if (profile.primaryTypeId === "weapon") {
    if (skill.armorBreaker) return { armorDamageMultiplier: 1.15 };
    if (["fists", "greatsword"].includes(skill.weaponId) && skill.damage > 0 && target?.armorState !== "armored") {
      return { damageMultiplier: 1.08 };
    }
    return {};
  }
  if (profile.primaryTypeId === "assist") {
    const effect = {};
    if (context.accessoryEffect || skill.accessoryFlow) {
      effect.damageMultiplier = (effect.damageMultiplier || 1) * 1.1;
    }
    if (skill.comboChance) {
      effect.comboChanceBonus = (effect.comboChanceBonus || 0) + 0.15;
    }
    if (target?.weakpoint || target?.armorState === "exposed" || target?.broken) {
      effect.damageMultiplier = (effect.damageMultiplier || 1) * 1.08;
    }
    const handInterruptOpportunity = (target?.id === "arms" || skill.targetParts?.includes("arms"))
      && currentPendingEnemyAttack()?.interruptPart === "arms"
      && !state.enemy.pendingAttack?.interrupted;
    if (handInterruptOpportunity) {
      effect.armorDamageMultiplier = (effect.armorDamageMultiplier || 1) * 1.1;
    }
    return effect;
  }
  if (profile.primaryTypeId === "survival") {
    if (skill.stance) return { stanceCounterBonus: 0.1 };
    if ((skill.actionCost || 0) === 0) return { soulGainBonus: 2 };
    return {};
  }
  if (skill.ammoCost) return { damageMultiplier: 1.08, soulGainBonus: 2 };
  if (context.accessoryEffect || skill.accessoryFlow) return { damageMultiplier: 1.12 };
  return { soulGainBonus: 3 };
}

function combatAvatarDamageMultiplier(skill, target, context = {}) {
  return combatAvatarSkillEffect(skill, target, context).damageMultiplier || 1;
}

function combatAvatarArmorDamageMultiplier(skill, target = null) {
  return combatAvatarSkillEffect(skill, target).armorDamageMultiplier || 1;
}

function combatAvatarSoulGainBonus(skill, target = null, context = {}) {
  return combatAvatarSkillEffect(skill, target, context).soulGainBonus || 0;
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
  const slotCapacity = armorFactorSlotCapacity(slotIndex);
  const usedWithoutCurrent = armorFactorCostUsed(slotIndex);
  const remaining = Math.max(0, board.capacityTotal - usedWithoutCurrent);
  return `
    <div class="armor-factor-modal-layer" role="presentation">
      <div class="armor-factor-modal-backdrop" data-close-factor-picker aria-label="关闭灵媒器列表"></div>
      <section class="armor-factor-picker-panel" role="dialog" aria-modal="true" aria-label="选择灵媒器">
        <div class="armor-factor-picker-head">
          <span>
            <b>选择灵媒器</b>
            <small>槽位承载 ${slotCapacity} · 剩余战甲承载 ${remaining} / ${board.capacityTotal}${current ? ` · 当前 ${current.factorName}` : ""}</small>
          </span>
          <button type="button" data-close-factor-picker aria-label="关闭灵媒器列表">×</button>
        </div>
        <div class="armor-factor-choice-list">
          ${armorFactorCatalog.map((factor) => {
            const type = armorFactorTypes[factor.type] || armorFactorTypes.resource;
            const disabledBySlot = factor.cost > slotCapacity;
            const disabledByTotal = usedWithoutCurrent + factor.cost > board.capacityTotal;
            const disabled = disabledBySlot || disabledByTotal;
            const active = current?.factorId === factor.id;
            return `
              <button class="armor-factor-choice factor-${type.tone}${active ? " active" : ""}" type="button" data-factor-slot="${slotIndex}" data-factor-id="${factor.id}" ${disabled ? "disabled" : ""} title="${disabledBySlot ? "该槽位承载不足" : disabledByTotal ? "战甲总承载不足" : ""}">
                <i>${type.short}</i>
                <span>
                <strong>${factor.name}</strong>
                <small>${type.label}灵媒器 · ${factor.tier}</small>
              </span>
              <span class="factor-choice-energy">
                ${renderFactorCostBadge(factor.cost)}
              </span>
            </button>
          `;
          }).join("")}
        </div>
        <button class="armor-factor-clear" type="button" data-clear-factor-slot="${slotIndex}" ${current ? "" : "disabled"}>卸下灵媒器</button>
      </section>
    </div>
  `;
}

function renderArmorCarryPartRows(board) {
  return loadoutParts.map((part) => {
    const slotIndex = armorFactorSlots[part.id];
    const cell = board.cells[slotIndex];
    const item = equippedArmorItemForPart(part);
    const factorText = cell && !cell.empty ? `${cell.factorName} · 占用 ${cell.cost}` : "未接入灵媒器";
    const overloaded = cell && !cell.empty && cell.overloaded;
    return `
      <span class="${overloaded ? "overloaded" : ""}">
        <b>${part.label}</b>
        <em>承载 ${armorEnergyCapacityForPart(part)}</em>
        <small>${item?.name || "未装配战甲"} / ${factorText}</small>
      </span>
    `;
  }).join("");
}

function renderArmorFactorContent() {
  const board = buildArmorFactorBoard();
  const identity = armorBuildIdentity(board);
  const resonanceText = board.activeLines.length
    ? `已形成 ${board.activeLines.length} 条战灵共鸣，后续会继续验证具体奖励。`
    : "尚未形成稳定战灵共鸣，当前先验证承载和身体接入关系。";
  return `
    <span>战甲承载</span>
    <strong>${identity.title}</strong>
    <div class="armor-factor-capacity-summary">
      ${renderMeter("战甲承载", board.capacityUsed, board.capacityTotal, "factor-energy-meter")}
      <span class="factor-carry-count">
        <b>剩余</b>
        <em>${board.capacityRemaining}</em>
      </span>
    </div>
    <div class="armor-factor-board">
      ${board.cells.map((cell) => {
        if (cell.empty) {
          return `
            <button class="armor-factor-cell empty" type="button" data-open-factor-picker="${cell.index}" data-factor-drop="${cell.index}" aria-label="接入灵媒器槽位${cell.index + 1}">
              <i>+</i>
              <b>空槽</b>
              <em class="factor-cost-badge muted">承载 ${cell.capacity}</em>
            </button>
          `;
        }
        return `
          <button class="armor-factor-cell factor-${cell.tone}${board.activeIndices.has(cell.index) ? " linked" : ""}${cell.overloaded ? " overloaded" : ""}" type="button" draggable="true" data-factor-drag="${cell.index}" data-factor-drop="${cell.index}" data-open-factor-picker="${cell.index}" aria-label="替换${cell.factorName}，占用${cell.cost}，槽位承载${cell.capacity}">
            <i>${cell.short}</i>
            <b>${cell.factorName}</b>
            ${renderFactorCostBadge(cell.cost)}
          </button>
        `;
      }).join("")}
    </div>
    ${renderArmorFactorPicker()}
    <div class="armor-carry-insight">
      <div class="armor-carry-profile">
        <span>${identity.tags.map((tag) => `<i>${tag}</i>`).join("")}</span>
        <p>${identity.summary}</p>
      </div>
      <div class="armor-carry-flow">
        ${renderArmorCarryPartRows(board)}
      </div>
      <div class="armor-resonance-tease">
        <b>战灵共鸣</b>
        <em>${resonanceText}</em>
      </div>
    </div>
    <small>点击槽位可接入灵媒器。灵媒器占用不能超过对应槽位承载，也不能超过战甲总承载。</small>
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
      <span>战甲承载结构</span>
      <strong>部位提供承载，灵媒器接入后塑造战斗化身。</strong>
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
            <em>承载 ${capacity}</em>
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
  const identity = armorBuildIdentity(board);
  ui.armorBoardParts.innerHTML = renderArmorBodyMap(activePart);
  ui.armorBoardConfig.innerHTML = `
    <div class="armor-board-config-head">
      <span>${activePart.label} / ${equippedArmorItemForPart(activePart)?.name || "未装配战甲"}</span>
      <strong>${identity.title} · 承载 ${board.capacityUsed} / ${board.capacityTotal}</strong>
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
  const hasArcReactor = isLoadoutItemEquipped("方舟反应炉");
  const hasJet = isLoadoutItemEquipped("喷气式装置");
  const hasShoulderCannon = isLoadoutItemEquipped("肩炮");
  const hasGourd = isLoadoutItemEquipped("酒葫芦");
  const hasQuiver = isLoadoutItemEquipped("箭袋");
  const fistCore = isConfiguredSkillActive("fist_arm_rush");
  const bowPierce = isConfiguredSkillActive("bow_arm_pierce");
  const greatswordStance = isConfiguredSkillActive("gs_guard_stance");

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
      id: "arc_fire_support",
      title: "方舟供能回路",
      tone: "blue",
      civilization: "能源铠装",
      energy: "前胸反应炉",
      fit: "挂件增幅",
      requirements: [
        { ok: hasArcReactor, gap: "前胸未装配方舟反应炉" },
        { ok: hasJet || hasShoulderCannon, gap: "肩部未装配喷气式装置或肩炮" },
      ],
      nodes: [
        { title: "能源来源", text: "方舟反应炉", iconSrc: "./assets/loadout-arc-reactor.jpeg" },
        { title: "转化器", text: "肩部挂件接口", iconText: "肩" },
        { title: "释放端", text: hasShoulderCannon ? "肩炮轰击" : "喷气跃升", iconSrc: hasShoulderCannon ? "./assets/loadout-shoulder-cannon.jpeg" : "./assets/loadout-jet.png" },
        { title: "战斗结果", text: "挂件介入威力提高", iconText: "增" },
      ],
      payoff: "方舟反应炉不是直接攻击，而是把前胸能源输送给肩部武装，让喷气式装置和肩炮的介入更有价值。",
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
        { ok: greatswordStance, gap: "大剑未装配防御姿态" },
      ],
      nodes: [
        { title: "能源来源", text: "大剑架势", iconSrc: "./assets/weapon-greatsword.png" },
        { title: "转化器", text: "承压防御姿态", iconText: "守" },
        { title: "释放端", text: "受击反击", iconText: "反" },
        { title: "战斗结果", text: "弹反并立即反击", iconText: "反" },
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
  const accessoryNames = ["无人机", "方舟反应炉", "喷气式装置", "肩炮", "酒葫芦", "箭袋"].filter(isLoadoutItemEquipped);
  const content = {
    skills: {
      title: "技能流派",
      eyebrow: "战斗定位",
      summary: "通过近战压制与重型破甲打开 Boss 部位，再用灵魂战甲完成爆发。",
      points: [
        "拳套负责贴身连击和弱点爆发。",
        "大剑负责破甲、防御姿态和反击窗口。",
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
    accessory_arc_reactor: ["方舟供能", "前胸反应炉为喷气式装置和肩炮提高介入威力。"],
    accessory_jet: ["垂直轰击", "喷气装置改变攻击轨迹，形成跃升重击。"],
    accessory_shoulder_cannon: ["肩炮轰击", "肩部火力在近战命中窗口追加远程炮击。"],
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
    const armorSkills = profile ? [{ ...profile, id: `armor_${part.id}_${profile.kind}` }] : [];
    if (part.id === "torso") armorSkills.push(...configuredUpperArmorPassiveSkills());
    const combatEffect = equippedArmorPartCombatEffect(part.id);
    if (combatEffect) {
      armorSkills.push({
        ...combatEffect,
        id: combatEffect.id,
        targetParts: ["core"],
        targetLabel: "胸部",
        activation: "passive",
        kind: "passive",
        kindLabel: "战甲效果",
        armorDamage: 0,
        actionCost: 0,
      });
    }
    return {
      id: `armor_${part.id}`,
      type: "armor",
      group: "armor",
      name: part.label,
      role: equippedItem?.name || "战甲部位",
      icon: equippedItem?.image || "",
      short: part.icon,
      skills: armorSkills,
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
  const activeArmorIdentity = activeArmorBoard ? armorBuildIdentity(activeArmorBoard) : null;
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
      <strong>${activeArmorBoard ? "战甲承载" : activeSource.name}</strong>
      <small>${activeArmorBoard ? "五个战甲部位提供承载，灵媒器接入后决定战斗化身倾向" : activeSource.role}</small>
    </span>
    <em>${activeArmorBoard ? activeArmorIdentity.title : `${unlockedSkillCount}/${activeSourceSkills.length} 可用`}</em>
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
  if (isPassiveSkill(skill)) {
    const meta = ["被动"];
    if (skill.passiveEffect === "counter_transfer") meta.push(`传导 ${Math.round((skill.transferDamageRatio || 0) * 100)}%`);
    if (skill.passiveEffect === "damage_chain") meta.push(`${skill.triggerHitCount || 3} 次触发`, `追斩 ${Math.round((skill.followUpDamageRatio || 0) * 100)}%`);
    if (skill.passiveEffect === "bleed_hunger") meta.push(`流血 ${Math.round((skill.bleedChance || 0) * 100)}%`, `吸血 ${Math.round((skill.healRatio || 0) * 100)}%`);
    return meta;
  }
  if (skill.stance === "greatsword_counter") {
    return [
      "主动姿态",
      `反击 ${Math.round((skill.counterChance || 0) * 100)}%`,
      `反击伤害 ${skill.counterDamage || 0}`,
      "仅近战",
    ];
  }
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
  const iconMarkup = isPassiveSkill(skill) || skill.stance
    ? renderWeaponSkillTarget(skill)
    : skill.noEffect || skill.statBonus || skill.sourcePreview
      ? renderSkillSourceIcon(source)
      : renderPartIconGroup(partIds, "badge");
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
  if (!skill.locked) tags.push(isPassiveSkill(skill) ? "被动" : "主动");
  if (skill.armorBreaker) tags.push("破甲");
  if (skill.comboChance) tags.push("连击");
  (skill.tags || []).forEach((tag) => tags.push(tag));
  return [...new Set(tags)].map((tag) => `<i class="${skillTagClass(tag)}">${tag}</i>`).join("");
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
  if (isPassiveSkill(skill)) {
    const fields = [];
    if (skill.passiveEffect === "counter_transfer") {
      fields.push(
        ["触发时机", "防御姿态反击命中后"],
        ["传导伤害", `${Math.round((skill.transferDamageRatio || 0) * 100)}%`],
        ["力量压制", `力量高于 Boss 时反击伤害 +${Math.round((skill.strengthDamageBonus || 0) * 100)}%`]
      );
    } else if (skill.passiveEffect === "damage_chain") {
      fields.push(
        ["触发门槛", `每造成 ${skill.triggerHitCount || 3} 次有效伤害`],
        ["追加斩击", `${Math.round((skill.followUpDamageRatio || 0) * 100)}% 伤害`],
        ["力量成长", `每次有效伤害 +${skill.strengthPerHit || 1} 力量`]
      );
    } else if (skill.passiveEffect === "bleed_hunger") {
      fields.push(
        ["流血概率", `${Math.round((skill.bleedChance || 0) * 100)}%`],
        ["流血上限", `${skill.bleedMaxStacks || 5} 层 / 持续 ${skill.bleedDuration || 2} 回合`],
        ["治疗比例", `本次伤害的 ${Math.round((skill.healRatio || 0) * 100)}%`],
        ["嗜血上限", `${skill.bloodlustMax || 15} 层`]
      );
    }
    ui.skillEditor.innerHTML = `
      <div class="skill-editor-head">
        <span class="skill-editor-source">${source.name} · 被动</span>
        <h2>${skill.name}</h2>
        <p>${skill.desc}</p>
      </div>
      <dl class="skill-editor-fields">
        <div><dt>附着来源</dt><dd>${source.name}</dd></div>
        <div><dt>生效方式</dt><dd>装配后自动参与战斗结算</dd></div>
        ${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}
      </dl>
      <button class="skill-editor-apply" type="button">已装配，战斗中自动生效</button>
    `;
    return;
  }
  const targetNames = skill.stance
    ? "自身"
    : (skill.targetParts || []).map(partLabelForConfig).join(" / ") || skill.targetLabel || "自身";
  const armorDamage = effectiveArmorDamage(skill);
  const activeCombatFields = skill.stance === "greatsword_counter"
    ? `
      <div><dt>反击概率</dt><dd>${Math.round((skill.counterChance || 0) * 100)}%</dd></div>
      <div><dt>反击伤害</dt><dd>${skill.counterDamage || 0}</dd></div>
      <div><dt>反击范围</dt><dd>仅近战攻击</dd></div>
      <div><dt>姿态限制</dt><dd>本轮无法闪避；远程攻击不可反击</dd></div>
    `
    : `
      <div><dt>伤害</dt><dd>${skill.maxDots ? `每档 ${skill.damage}` : skill.damage}</dd></div>
      <div><dt>护甲损坏</dt><dd>${armorDamage || 0}</dd></div>
      ${skill.ammoCost ? `<div><dt>弹药消耗</dt><dd>${skill.ammoCost}</dd></div>` : ""}
      ${skill.comboChance ? `<div><dt>连击</dt><dd>${Math.round(skill.comboChance * 100)}% 概率追加普攻</dd></div>` : ""}
      ${skill.bloodReap ? `<div><dt>流血结算</dt><dd>嗜血达到 9 / 15 层时触发</dd></div>` : ""}
    `;
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
      ${activeCombatFields}
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
  if (ui.enterBattleFromPresetsBtn) {
    ui.enterBattleFromPresetsBtn.disabled = !ready;
    ui.enterBattleFromPresetsBtn.title = ready ? "进入挑战" : "请选择 Boss，并携带 2 件武器";
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
  } else if (step === "presets") {
    loadoutState.prebattleStep = "presets";
    renderLoadoutPresetPage();
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
  if (tabId === "presets") {
    setPrebattleStep("presets");
    return;
  }
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
    return activePart.slots.includes(slot) && item.slots.includes(slot);
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
  return configuredWeaponSkills(state.selectedWeaponId).filter((skill) => !isPassiveSkill(skill));
}

function isLoadoutItemEquipped(itemName) {
  return Object.values(loadoutState.equipped).some((item) => item?.name === itemName);
}

function equippedArmorPartCombatEffect(partId) {
  if (!loadoutState.equipped[`${partId}:base`]) return null;
  return armorPartCombatEffects[partId] || null;
}

function counterChainDamageMultiplier() {
  return isLoadoutItemEquipped("尖刺肩甲") ? 1.1 : 1;
}

function hasArcReactorSupport() {
  return isLoadoutItemEquipped("方舟反应炉");
}

function boostedAccessoryEffect(effect) {
  if (!effect) return effect;
  if (!effect.reactorBoostable || !hasArcReactorSupport()) return { ...effect };
  const boostedMultiplier = (effect.damageMultiplier || 1) * (effect.reactorBonus || 1.2);
  return {
    ...effect,
    label: `${effect.label}（方舟增幅）`,
    damageMultiplier: Math.round(boostedMultiplier * 100) / 100,
    arcBoosted: true,
  };
}

function availableAccessoryEffects(skill) {
  return Object.entries(skill.accessoryFlow?.effects || {}).filter(([, effect]) => {
    return !effect.requiredItemName || isLoadoutItemEquipped(effect.requiredItemName);
  });
}

function renderAccessoryChoices(skill) {
  if (!ui.accessoryChoice) return false;
  const entries = availableAccessoryEffects(skill);
  ui.accessoryChoice.innerHTML = "";
  entries.forEach(([id, rawEffect], index) => {
    const effect = boostedAccessoryEffect(rawEffect);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "accessory-choice-zone";
    button.dataset.accessory = id;
    button.style.setProperty("--choice-index", String(index));
    button.innerHTML = `
      <span>${effect.label}</span>
      <small>伤害 x${effect.damageMultiplier || 1}${effect.arcBoosted ? " / 方舟反应炉供能" : ""}</small>
    `;
    button.addEventListener("click", () => chooseAccessory(id));
    ui.accessoryChoice.appendChild(button);
  });
  ui.accessoryChoice.style.setProperty("--choice-count", String(Math.max(entries.length, 1)));
  return entries.length > 0;
}

function buildWeaponControls() {
  ui.weaponButtons.innerHTML = "";
  const equippedWeapons = carriedWeapons();
  ui.weaponOverlay?.style.setProperty("--weapon-count", String(equippedWeapons.length));
  equippedWeapons.forEach((weapon, index) => {
    const angle = equippedWeapons.length <= 1
      ? 34
      : 14 + (index / (equippedWeapons.length - 1)) * 48;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weapon-card";
    button.dataset.weapon = weapon.id;
    button.style.setProperty("--weapon-order", String(index));
    button.style.setProperty("--weapon-angle", `${angle}deg`);
    button.style.setProperty("--weapon-counter-angle", `${-angle}deg`);
    button.setAttribute("aria-label", `${weapon.name} ${weapon.role}`);
    button.title = `${weapon.name} · ${weapon.role}`;
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
  const changedWeapon = state.selectedWeaponId !== weaponId;
  window.clearTimeout(battleSkillPageTransitionTimer);
  battleSkillPageTransitionTimer = null;
  clearBattleSkillPageAnimation();
  if (changedWeapon) {
    clearGreatswordCounterStance("切换武器");
    state.selectedWeaponId = weaponId;
    const weapon = currentWeapon();
    updatePlayerSpriteForWeapon();
    log(`切换武器：${weapon.name}，技能列表已更新。`);
    buildSkillControls();
    renderWeaponToggle();
  }
  combatDockMode = "weapon-confirm";
  ui.weaponButtons.querySelector(`[data-weapon="${weaponId}"]`)?.classList.add("confirming");
  updateUi();
  window.clearTimeout(weaponOverlayTransitionTimer);
  weaponOverlayTransitionTimer = window.setTimeout(() => {
    weaponOverlayTransitionTimer = null;
    collapseWeaponOverlayAnimated();
  }, 130);
}

function buildSkillControls() {
  ui.skillButtons.innerHTML = "";
  currentSkills().forEach((skill) => {
    ui.skillButtons.appendChild(createSkillButton(skill, false));
  });
  renderBattleSkillPage();
}

function battleSkillPageInfo() {
  const weaponId = state?.selectedWeaponId || "";
  const allSkills = currentSkills();
  const pageCount = Math.max(1, Math.ceil(allSkills.length / BATTLE_SKILLS_PER_PAGE));
  const requestedPage = Number(battleSkillPageByWeapon[weaponId]) || 0;
  const page = Math.max(0, Math.min(pageCount - 1, requestedPage));
  battleSkillPageByWeapon[weaponId] = page;
  return {
    page,
    pageCount,
    skills: allSkills.slice(page * BATTLE_SKILLS_PER_PAGE, (page + 1) * BATTLE_SKILLS_PER_PAGE),
  };
}

function renderBattleSkillPage() {
  const { page, pageCount, skills: visibleSkills } = battleSkillPageInfo();
  ui.battleSkillButtons.innerHTML = "";
  let selectedSkillId = selectedBattleSkillByWeapon[state.selectedWeaponId];
  if (!visibleSkills.some((skill) => skill.id === selectedSkillId)) {
    selectedSkillId = visibleSkills[0]?.id || "";
    selectedBattleSkillByWeapon[state.selectedWeaponId] = selectedSkillId;
  }
  visibleSkills.forEach((skill, index) => {
    const button = createSkillButton(skill, true);
    button.style.setProperty("--wheel-slot", String(index));
    button.classList.toggle("wheel-selected", skill.id === selectedSkillId);
    button.addEventListener("pointerenter", () => selectBattleSkillOnWheel(skill.id));
    button.addEventListener("pointerdown", () => selectBattleSkillOnWheel(skill.id));
    button.addEventListener("focus", () => selectBattleSkillOnWheel(skill.id));
    ui.battleSkillButtons.appendChild(button);
  });
  const hasMultipleGroups = pageCount > 1;
  ui.battleSkillPageToggle?.classList.toggle("hidden", !hasMultipleGroups);
  ui.battleSkillOverlay?.classList.toggle("has-multiple-groups", hasMultipleGroups);
  if (ui.battleSkillPageIndex) ui.battleSkillPageIndex.textContent = `${page + 1}/${pageCount}`;
  ui.battleSkillPageToggle?.setAttribute("aria-label", `切换技能组，当前第 ${page + 1} 组，共 ${pageCount} 组`);
  if (hasMultipleGroups && updateSkillWheelGuideGeometry()) {
    renderSkillWheelPageDots(page, pageCount);
  } else {
    ui.skillWheelPageDots?.replaceChildren();
  }
  if (hasMultipleGroups) queueSkillWheelGeometryUpdate();
}

function measureSkillWheelSlotRects(sourceButton) {
  const overlay = ui.battleSkillOverlay;
  if (!overlay || !sourceButton) return [];

  const probeList = document.createElement("div");
  probeList.className = "battle-skill-list";
  probeList.setAttribute("aria-hidden", "true");
  probeList.style.visibility = "hidden";
  probeList.style.pointerEvents = "none";
  for (let index = 0; index < BATTLE_SKILLS_PER_PAGE; index += 1) {
    const probeButton = document.createElement("span");
    probeButton.className = "skill-card battle-skill-card";
    probeButton.style.animation = "none";
    probeButton.style.transform = "none";
    probeButton.style.opacity = "1";
    probeList.appendChild(probeButton);
  }
  overlay.appendChild(probeList);
  const rects = [...probeList.children].map((button) => button.getBoundingClientRect());
  probeList.remove();
  return rects;
}

function updateSkillWheelGuideGeometry() {
  const guide = ui.battleSkillPageToggle;
  const toggle = ui.weaponToggle;
  const buttons = [...ui.battleSkillButtons.children].filter((button) => !button.hidden);
  if (!guide || !toggle || guide.classList.contains("hidden") || buttons.length === 0) return false;

  const guideRect = guide.getBoundingClientRect();
  const toggleRect = toggle.getBoundingClientRect();
  if (guideRect.width <= 0 || guideRect.height <= 0 || toggleRect.width <= 0) return false;

  const centerX = toggleRect.left + toggleRect.width / 2;
  const centerY = toggleRect.top + toggleRect.height / 2;
  // Measure all three fixed slots so pages with fewer skills keep the same arc.
  const buttonRects = measureSkillWheelSlotRects(buttons[0]);
  if (buttonRects.length === 0) return false;
  const skillRadius = Math.max(...buttonRects.map((rect) => Math.hypot(
    rect.left + rect.width / 2 - centerX,
    rect.top + rect.height / 2 - centerY,
  )));
  const buttonRadius = Math.max(...buttonRects.map((rect) => Math.max(rect.width, rect.height))) / 2;
  const cx = centerX - guideRect.left;
  const cy = centerY - guideRect.top;
  const unclampedRadius = skillRadius + buttonRadius + 9;
  const radius = Math.max(1, Math.min(unclampedRadius, cx - 4, cy - 4));
  const startAngle = -Math.PI / 2;
  const endAngle = -Math.PI;
  const startX = cx;
  const startY = cy - radius;
  const endX = cx - radius;
  const endY = cy;
  const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 0 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  const svg = ui.skillWheelGesturePath?.closest("svg");
  svg?.setAttribute("viewBox", `0 0 ${guideRect.width.toFixed(2)} ${guideRect.height.toFixed(2)}`);
  svg?.querySelectorAll("path").forEach((path) => path.setAttribute("d", pathData));

  skillWheelGeometry = {
    cx,
    cy,
    radius,
    width: guideRect.width,
    height: guideRect.height,
    startAngle,
    endAngle,
  };
  if (ui.battleSkillPageIndex) {
    ui.battleSkillPageIndex.style.left = `${((cx + 7) / guideRect.width) * 100}%`;
    ui.battleSkillPageIndex.style.right = "auto";
    ui.battleSkillPageIndex.style.top = `${((startY - 23) / guideRect.height) * 100}%`;
  }
  return true;
}

function skillWheelPointAt(t) {
  const geometry = skillWheelGeometry;
  if (!geometry) return { x: 50, y: 50 };
  const angle = geometry.startAngle + (geometry.endAngle - geometry.startAngle) * t;
  return {
    x: ((geometry.cx + Math.cos(angle) * geometry.radius) / geometry.width) * 100,
    y: ((geometry.cy + Math.sin(angle) * geometry.radius) / geometry.height) * 100,
  };
}

function queueSkillWheelGeometryUpdate() {
  window.cancelAnimationFrame(skillWheelGeometryFrame);
  skillWheelGeometryFrame = window.requestAnimationFrame(() => {
    skillWheelGeometryFrame = null;
    if (!state || battleSkillPageInfo().pageCount <= 1 || !updateSkillWheelGuideGeometry()) return;
    const { page, pageCount } = battleSkillPageInfo();
    renderSkillWheelPageDots(page, pageCount);
  });
}

function renderSkillWheelPageDots(page, pageCount) {
  if (!ui.skillWheelPageDots) return;
  ui.skillWheelPageDots.innerHTML = "";
  Array.from({ length: pageCount }, (_, index) => {
    const button = document.createElement("button");
    const t = pageCount <= 1 ? 0.5 : 0.18 + (index / (pageCount - 1)) * 0.64;
    const point = skillWheelPointAt(t);
    button.type = "button";
    button.className = `skill-wheel-page-dot${index === page ? " active" : ""}`;
    button.style.left = `${point.x}%`;
    button.style.top = `${point.y}%`;
    button.dataset.page = String(index);
    button.setAttribute("aria-label", `切换到第 ${index + 1} 组技能`);
    button.setAttribute("aria-current", index === page ? "page" : "false");
    button.innerHTML = `<span>${index + 1}</span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setBattleSkillPage(index);
    });
    ui.skillWheelPageDots.appendChild(button);
  });
}

function selectBattleSkillOnWheel(skillId) {
  if (!state || !skillId) return;
  selectedBattleSkillByWeapon[state.selectedWeaponId] = skillId;
  [...ui.battleSkillButtons.children].forEach((button) => {
    button.classList.toggle("wheel-selected", button.dataset.skill === skillId);
  });
}

function clearBattleSkillPageAnimation() {
  ui.battleSkillButtons?.classList.remove(
    "page-leave-next",
    "page-leave-prev",
    "page-enter-next",
    "page-enter-prev",
  );
  ui.battleSkillPageToggle?.classList.remove("switching-next", "switching-prev");
}

function setBattleSkillPage(targetPage, preferredDirection = 0) {
  if (!state || state.soulTargetSelection) return;
  const { page, pageCount } = battleSkillPageInfo();
  if (pageCount <= 1) return;
  const weaponId = state.selectedWeaponId;
  const nextPage = (Number(targetPage) + pageCount) % pageCount;
  if (nextPage === page) return;
  const direction = preferredDirection || (nextPage > page ? 1 : -1);
  window.clearTimeout(battleSkillPageTransitionTimer);
  clearBattleSkillPageAnimation();
  ui.battleSkillButtons.classList.add(direction > 0 ? "page-leave-next" : "page-leave-prev");
  ui.battleSkillPageToggle?.classList.add(direction > 0 ? "switching-next" : "switching-prev");
  battleSkillPageTransitionTimer = window.setTimeout(() => {
    if (!state || state.selectedWeaponId !== weaponId) {
      clearBattleSkillPageAnimation();
      battleSkillPageTransitionTimer = null;
      return;
    }
    battleSkillPageByWeapon[weaponId] = nextPage;
    renderBattleSkillPage();
    clearBattleSkillPageAnimation();
    ui.battleSkillButtons.classList.add(direction > 0 ? "page-enter-next" : "page-enter-prev");
    ui.battleSkillPageToggle?.classList.add(direction > 0 ? "switching-next" : "switching-prev");
    updateUi();
    battleSkillPageTransitionTimer = window.setTimeout(() => {
      clearBattleSkillPageAnimation();
      battleSkillPageTransitionTimer = null;
    }, 280);
  }, 130);
}

function cycleBattleSkillPage(direction = 1) {
  const { page, pageCount } = battleSkillPageInfo();
  if (pageCount <= 1) return;
  setBattleSkillPage(page + direction, direction);
}

function bindSkillWheelGesture() {
  const gesturePath = ui.skillWheelGesturePath;
  const skillList = ui.battleSkillButtons;
  const guide = ui.battleSkillPageToggle;
  if (!gesturePath || !skillList || !guide) return;
  let gesture = null;

  const resetGesture = ({ preserveSwipeFlag = false } = {}) => {
    const sourceButton = gesture?.sourceButton;
    sourceButton?.classList.remove("wheel-drag-source");
    if (sourceButton && !preserveSwipeFlag) sourceButton._skillWheelSwipeTriggered = false;
    gesture = null;
    guide.classList.remove("is-dragging", "drag-next", "drag-prev");
    guide.style.removeProperty("--wheel-drag-progress");
    if (sourceButton && preserveSwipeFlag) {
      window.setTimeout(() => {
        sourceButton._skillWheelSwipeTriggered = false;
      }, 120);
    }
  };

  const beginGesture = (event, sourceButton, captureTarget) => {
    if (!event.isPrimary || event.button !== 0 || battleSkillPageInfo().pageCount <= 1) return;
    if (sourceButton?.disabled) return;
    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      travel: 0,
      sourceButton,
      captureTarget,
    };
    guide.classList.add("is-dragging");
    captureTarget.setPointerCapture?.(event.pointerId);
    if (!sourceButton) event.preventDefault();
  };

  const moveGesture = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    gesture.travel = (dy - dx) / Math.SQRT2;
    if (gesture.sourceButton && Math.hypot(dx, dy) > 10) {
      gesture.sourceButton._skillWheelSwipeTriggered = true;
      gesture.sourceButton.classList.add("wheel-drag-source");
      window.clearTimeout(skillDescriptionHoldTimer);
      skillDescriptionHoldTimer = null;
      gesture.sourceButton.classList.remove("holding");
    }
    guide.classList.toggle("drag-next", gesture.travel > 8);
    guide.classList.toggle("drag-prev", gesture.travel < -8);
    guide.style.setProperty("--wheel-drag-progress", String(Math.min(1, Math.abs(gesture.travel) / 70)));
    if (gesture.sourceButton?._skillWheelSwipeTriggered || !gesture.sourceButton) event.preventDefault();
  };

  const finishGesture = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const { travel, sourceButton, captureTarget } = gesture;
    const draggedFromSkill = Boolean(sourceButton?._skillWheelSwipeTriggered);
    if (Math.abs(travel) >= 34) cycleBattleSkillPage(travel > 0 ? 1 : -1);
    captureTarget.releasePointerCapture?.(event.pointerId);
    resetGesture({ preserveSwipeFlag: draggedFromSkill });
  };

  const cancelGesture = (event) => {
    if (!gesture || (event.pointerId != null && event.pointerId !== gesture.pointerId)) return;
    gesture.captureTarget.releasePointerCapture?.(gesture.pointerId);
    resetGesture();
  };

  gesturePath.addEventListener("pointerdown", (event) => {
    beginGesture(event, null, gesturePath);
  });
  skillList.addEventListener("pointerdown", (event) => {
    const sourceButton = event.target.closest(".battle-skill-card");
    if (!sourceButton || !skillList.contains(sourceButton)) return;
    beginGesture(event, sourceButton, sourceButton);
  });

  gesturePath.addEventListener("pointermove", moveGesture);
  skillList.addEventListener("pointermove", moveGesture);
  gesturePath.addEventListener("pointerup", finishGesture);
  skillList.addEventListener("pointerup", finishGesture);
  gesturePath.addEventListener("pointercancel", cancelGesture);
  skillList.addEventListener("pointercancel", cancelGesture);
  gesturePath.addEventListener("lostpointercapture", () => {
    if (gesture) resetGesture();
  });
  gesturePath.addEventListener("wheel", (event) => {
    if (battleSkillPageInfo().pageCount <= 1) return;
    event.preventDefault();
    cycleBattleSkillPage(event.deltaY + event.deltaX >= 0 ? 1 : -1);
  }, { passive: false });
}

function skillCategoryLabel(skill) {
  const isStatusSkill =
    skill.kind === "stance" ||
    skill.kind === "passive" ||
    skill.kind === "status" ||
    skill.kind === "buff" ||
    skill.stance ||
    skill.damage <= 0;
  if (isStatusSkill) return { key: "status", label: "状态" };

  const isGroupSkill =
    skill.kind === "aoe" ||
    skill.kind === "group" ||
    (skill.targetParts || []).length > 1 ||
    /AOE|群体/.test(skill.kindLabel || "");
  if (isGroupSkill) return { key: "group", label: "群体" };

  return { key: "single", label: "单体" };
}

function createSkillButton(skill, compact) {
  const targetParts = skill.targetParts || [];
  const skillCategory = compact ? skillCategoryLabel(skill) : null;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `skill-card${skill.actionCost > 0 ? " has-action-cost" : ""}${compact ? " battle-skill-card" : ""}`;
  button.dataset.skill = skill.id;
  button.dataset.targetParts = targetParts.join(",");
  button.style.setProperty("--skill-color", skill.color);
  button.setAttribute("aria-label", `${skill.name}，长按查看技能说明`);
  button.innerHTML = compact
    ? `
      <span class="battle-skill-icon">
        ${skill.icon ? `<img src="${skill.icon}" alt="" draggable="false" />` : renderWeaponSkillTarget(skill)}
      </span>
      <strong class="battle-skill-name battle-skill-type is-${skillCategory.key}">${skillCategory.label}</strong>
      ${skill.actionCost > 0 ? `<span class="battle-skill-cost"><b>${skill.actionCost}</b></span>` : ""}
    `
    : `
      ${skill.actionCost > 0 ? `<span class="action-cost-corner" style="--skill-color:${skill.color}"><b>${skill.actionCost}</b></span>` : ""}
      <span class="part-badge${targetParts.length > 1 ? " part-badge-ring" : ""}${skill.stance ? " self-target" : ""}${skillTargetClass(skill)}${skillTargetCountClass(skill)}" style="--skill-color:${skill.color}">${skill.stance ? renderWeaponSkillTarget(skill) : renderPartIconGroup(targetParts, "badge")}</span>
      <span class="skill-copy">
        <strong>${skill.name}</strong>
        ${renderSkillTags(skill)}
        <small>${skill.desc} ${skillSummaryText(skill)}</small>
        <small class="avatar-skill-hint">${combatAvatarSkillHint(skill)}</small>
      </span>
    `;
  button.addEventListener("pointerenter", () => setHoveredTargetParts(targetParts));
  button.addEventListener("pointerleave", () => clearHoveredTargetParts());
  button.addEventListener("focus", () => setHoveredTargetParts(targetParts));
  button.addEventListener("blur", () => clearHoveredTargetParts());
  button.querySelectorAll("[data-skill-tag]").forEach((tagButton) => {
    tagButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showSkillTagBubble(tagButton, skill, tagButton.dataset.skillTag);
    });
  });
  if (compact) bindSkillDescriptionHold(button, skill);
  button.addEventListener("click", (event) => {
    if (button._skillLongPressTriggered || button._skillWheelSwipeTriggered) {
      event.preventDefault();
      button._skillLongPressTriggered = false;
      button._skillWheelSwipeTriggered = false;
      return;
    }
    useSkill(skill.id);
  });
  return button;
}

function bindSkillDescriptionHold(button, skill) {
  const cancelHold = () => {
    window.clearTimeout(skillDescriptionHoldTimer);
    skillDescriptionHoldTimer = null;
    button.classList.remove("holding");
  };

  button.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || button.disabled) return;
    cancelHold();
    button._skillLongPressTriggered = false;
    button.classList.add("holding");
    button.setPointerCapture?.(event.pointerId);
    skillDescriptionHoldTimer = window.setTimeout(() => {
      button._skillLongPressTriggered = true;
      button.classList.remove("holding");
      showSkillDescription(skill);
    }, 520);
  });
  button.addEventListener("pointerup", cancelHold);
  button.addEventListener("pointercancel", cancelHold);
  button.addEventListener("lostpointercapture", cancelHold);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

function showSkillDescription(skill) {
  if (!ui.skillDescriptionOverlay || !ui.skillDescriptionPanel) return;
  const targetText = skill.targetLabel || (skill.targetParts?.length ? skill.targetParts.join("、") : "自身");
  const tags = [
    skill.kindLabel,
    skill.damage > 0 ? "伤害" : null,
    skill.armorBreaker ? "破甲" : null,
    ...(skill.tags || []),
  ].filter(Boolean);
  const effectText = skillDescriptionEffectText(skill, targetText);
  ui.skillDescriptionPanel.innerHTML = `
    <header>
      <span class="skill-description-icon" style="--skill-color:${skill.color}">
        ${skill.icon ? `<img src="${skill.icon}" alt="" />` : renderWeaponSkillTarget(skill)}
      </span>
      <span class="skill-description-content">
        <small>${currentWeapon().name}</small>
        <span class="skill-description-title-line">
          <strong id="skillDescriptionName">${skill.name}</strong>
          <span class="skill-description-tags">${[...new Set(tags)]
            .map((tag) => `<i class="${skillDescriptionTagClass(tag)}">${tag}</i>`)
            .join("")}</span>
        </span>
        <p class="skill-description-effect">${renderSkillRichText(effectText)}</p>
        <p class="skill-description-note">${renderSkillRichText(skill.desc)}</p>
      </span>
    </header>
    <footer class="skill-description-meta">
      <span><small>目标</small><b>${targetText}</b></span>
      <span><small>消耗</small><b>${skill.actionCost || 0} 行动力${skill.ammoCost ? ` · ${skill.ammoCost} 弹药` : ""}</b></span>
    </footer>
  `;
  ui.skillDescriptionOverlay.classList.remove("hidden");
  ui.skillDescriptionOverlay.classList.add("active");
}

function skillDescriptionEffectText(skill, targetText) {
  if (skill.stance === "greatsword_counter") {
    return `本回合进入【防御姿态】，获得 ${Math.round((skill.counterChance || 0) * 100)}% 反击率；反击造成 ${skill.counterDamage || 0} 点伤害，但【无法闪避】。`;
  }

  if (isPassiveSkill(skill)) {
    return skill.summaryOverride || skill.desc;
  }

  const clauses = [];
  if (skill.damage > 0) clauses.push(`对敌方${targetText}造成 ${skill.damage} 点伤害`);
  const armorDamage = effectiveArmorDamage(skill);
  if (skill.armorBreaker && armorDamage > 0) {
    clauses.push(`造成 ${armorDamage} 点护甲伤害，并优先打破【硬甲】`);
  }
  if (skill.exposedBonus > 1) {
    clauses.push(`命中【裸露】部位时，伤害提高 ${Math.round((skill.exposedBonus - 1) * 100)}%`);
  }
  if (skill.comboChance) {
    clauses.push(`${Math.round(skill.comboChance * 100)}% 概率触发【连击】，追加 1 次普通攻击`);
  }
  if (skill.bloodReap) {
    clauses.push(`嗜血达到 9、15 层时，提前结算全部【流血】`);
  }
  return `${clauses.join("；")}。`;
}

function renderSkillRichText(text) {
  const tokenPattern = /(【[^】]+】|\[[^\]]+\]|\d+(?:、\d+)+\s*层|\d+(?:\.\d+)?\s*(?:%|点|层|回合|次|发)|弱点|破甲|硬甲|裸露|流血|嗜血|反击|连击|弹反|无法闪避)/g;
  return String(text || "")
    .split(tokenPattern)
    .filter((part) => part !== "")
    .map((part) => {
      const escaped = escapeSkillDescriptionHtml(part);
      if (/^【|^\[/.test(part)) return `<strong class="skill-rich-state">${escaped}</strong>`;
      if (/\d/.test(part) && /%|点|层|回合|次|发/.test(part)) return `<strong class="skill-rich-number">${escaped}</strong>`;
      if (/弱点|破甲|硬甲|裸露/.test(part)) return `<strong class="skill-rich-keyword">${escaped}</strong>`;
      if (/流血|嗜血|反击|连击|弹反|无法闪避/.test(part)) return `<strong class="skill-rich-state">${escaped}</strong>`;
      return escaped;
    })
    .join("");
}

function escapeSkillDescriptionHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function skillDescriptionTagClass(tag) {
  if (tag === "伤害") return "tag-damage";
  if (tag === "破甲") return "tag-break";
  if (tag === "流血") return "tag-bleed";
  if (tag === "反击") return "tag-counter";
  if (tag === "连击") return "tag-combo";
  return "tag-type";
}

function hideSkillDescription() {
  if (!ui.skillDescriptionOverlay) return;
  ui.skillDescriptionOverlay.classList.remove("active");
  ui.skillDescriptionOverlay.classList.add("hidden");
}

function showSkillTagBubble(anchor, skill, tag) {
  let bubble = document.getElementById("skillTagBubble");
  if (!bubble) {
    bubble = document.createElement("aside");
    bubble.id = "skillTagBubble";
    bubble.className = "skill-tag-bubble";
    document.querySelector(".battle-frame")?.appendChild(bubble);
  }
  const copy = (() => {
    if (tag === "连击" && skill.comboChance) {
      return `连击率 ${Math.round(skill.comboChance * 100)}%，技能命中后有概率追加一次普通攻击。`;
    }
    if (tag === "反击" && skill.counterChance) {
      return `近战来袭时有 ${Math.round(skill.counterChance * 100)}% 概率弹反，并造成 ${skill.counterDamage || 32} 点反击伤害。`;
    }
    if (tag === "流血") {
      return skill.bloodReap ? "嗜血达到 9、15 层时，可提前结算当前流血伤害。" : "命中后可积累流血与嗜血。";
    }
    return `${tag}效果已生效。`;
  })();
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
  ui.battleSkillPageToggle?.classList.add("hidden");
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
  button.style.setProperty("--skill-color", skill.color);
  button.innerHTML = `
    <span class="battle-skill-icon soul-target-icon">${renderPartIconGroup([part.id], "badge")}</span>
    <strong class="battle-skill-name">${part.label}</strong>
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
  (skill.tags || []).forEach((tag) => tags.push(tag));
  if (!tags.length) return "";
  return `<span class="skill-tags skill-tags-visible">${[...new Set(tags)]
    .map((tag) => `<button class="skill-tag ${skillTagClass(tag)}" type="button" data-skill-tag="${tag}">${tag}</button>`)
    .join("")}</span>`;
}

function skillTagClass(tag) {
  if (tag === "未解锁") return "skill-tag-locked";
  if (tag === "主动") return "skill-tag-active";
  if (tag === "被动") return "skill-tag-passive";
  if (tag === "反击") return "skill-tag-counter";
  if (tag === "流血") return "skill-tag-bleed";
  if (tag === "连击") return "skill-tag-combo";
  if (tag.includes("破甲")) return "skill-tag-break";
  return "skill-tag-generic";
}

function hasQuiverPierceBuff(skill) {
  return skill.id === "bow_arm_pierce" && isLoadoutItemEquipped("箭袋");
}

function effectiveArmorDamage(skill) {
  const baseArmorDamage = hasQuiverPierceBuff(skill) ? 120 : skill.armorDamage;
  return Math.round(baseArmorDamage * combatAvatarArmorDamageMultiplier(skill));
}

function toggleWeaponOverlay() {
  if (!state || state.result || state.turn !== "player" || state.enemy.intent) return;
  if (combatDockMode === "weapon-confirm" || combatDockMode === "weapons-leaving") return;
  if (combatDockMode === "weapons" || combatDockMode === "skills-leaving") {
    collapseWeaponOverlayAnimated();
    return;
  }

  window.clearTimeout(weaponOverlayTransitionTimer);
  combatDockMode = "skills-leaving";
  ui.combatActionDock?.classList.remove("weapon-mode", "weapons-leaving", "skills-entering");
  ui.combatActionDock?.classList.add("skills-leaving");
  ui.weaponToggle.setAttribute("aria-expanded", "true");
  updateBattleSkillOverlay();
  weaponOverlayTransitionTimer = window.setTimeout(() => {
    if (combatDockMode !== "skills-leaving") return;
    combatDockMode = "weapons";
    ui.combatActionDock?.classList.remove("skills-leaving");
    ui.combatActionDock?.classList.add("weapon-mode");
    ui.weaponOverlay.classList.add("expanded");
    weaponOverlayTransitionTimer = null;
  }, 180);
}

function closeWeaponOverlay() {
  window.clearTimeout(weaponOverlayTransitionTimer);
  weaponOverlayTransitionTimer = null;
  combatDockMode = "skills";
  ui.weaponOverlay.classList.remove("expanded");
  ui.weaponButtons.querySelectorAll(".confirming").forEach((button) => button.classList.remove("confirming"));
  ui.combatActionDock?.classList.remove(
    "skills-leaving",
    "weapon-mode",
    "weapon-confirm",
    "weapons-leaving",
    "skills-entering",
  );
  ui.weaponToggle.setAttribute("aria-expanded", "false");
}

function collapseWeaponOverlayAnimated() {
  window.clearTimeout(weaponOverlayTransitionTimer);
  combatDockMode = "weapons-leaving";
  ui.combatActionDock?.classList.remove("skills-leaving", "skills-entering");
  ui.combatActionDock?.classList.add("weapon-mode", "weapons-leaving");
  ui.weaponOverlay.classList.remove("expanded");
  ui.weaponToggle.setAttribute("aria-expanded", "false");
  weaponOverlayTransitionTimer = window.setTimeout(() => {
    if (combatDockMode !== "weapons-leaving") return;
    combatDockMode = "skills";
    ui.weaponButtons.querySelectorAll(".confirming").forEach((button) => button.classList.remove("confirming"));
    ui.combatActionDock?.classList.remove("weapon-mode", "weapons-leaving");
    ui.combatActionDock?.classList.add("skills-entering");
    updateBattleSkillOverlay();
    weaponOverlayTransitionTimer = window.setTimeout(() => {
      ui.combatActionDock?.classList.remove("skills-entering");
      weaponOverlayTransitionTimer = null;
    }, 300);
  }, 210);
}

function updateBattleSkillOverlay() {
  const visible = combatDockMode === "skills"
    && state
    && state.turn === "player"
    && !state.enemy.intent
    && !state.result
    && !state.skillCinematic;
  ui.battleSkillOverlay.classList.toggle("active", Boolean(visible));
  window.clearTimeout(skillWheelGeometrySettleTimer);
  skillWheelGeometrySettleTimer = null;
  if (visible) {
    queueSkillWheelGeometryUpdate();
    skillWheelGeometrySettleTimer = window.setTimeout(() => {
      skillWheelGeometrySettleTimer = null;
      queueSkillWheelGeometryUpdate();
    }, 190);
  }
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
  if (isPassiveSkill(skill)) return false;
  if (skill.actionCost && state.player.action < skill.actionCost) return false;
  if (skill.ammoCost && state.player.ammo < skill.ammoCost) return false;
  if (skill.stance) return true;
  return (skill.targetParts || []).some((partId) => {
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
  if (state.player.greatswordStanceActive && skill.stance !== "greatsword_counter") {
    clearGreatswordCounterStance("使用其他技能");
  }
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
  logCombatAvatarSkillContext(skill);

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

  if (skill.frameSequence) {
    startFrameSequenceSkillFlow(skill, targets);
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
  const avatarEffect = combatAvatarSkillEffect(skill);
  state.player.guardCounterChance = Math.min(0.95, (skill.counterChance || 0.7) + (avatarEffect.stanceCounterBonus || 0));
  state.player.guardCounterDamage = skill.counterDamage || 32;
  state.player.greatswordStanceActive = true;
  state.activeTarget = null;
  state.actionAnimTimer = 0.45;
  state.skillCinematic = {
    skill,
    stage: "greatsword_stance",
    elapsed: 0,
    duration: 0.86,
    settled: false,
  };
  log(`${skill.name}：进入防御姿态，本轮无法闪避；近战来袭时有 ${Math.round(state.player.guardCounterChance * 100)}% 概率弹反并造成 ${state.player.guardCounterDamage} 点反击伤害。`);
}

function clearGreatswordCounterStance(reason = "") {
  if (!state?.player?.greatswordStanceActive && !(state?.player?.guardCounterChance > 0)) return;
  state.player.greatswordStanceActive = false;
  state.player.guardCounterChance = 0;
  state.player.guardCounterDamage = 0;
  if (reason) log(`防御姿态解除：${reason}。`);
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

function startFrameSequenceSkillFlow(skill, targets) {
  state.skillCinematic = { skill, targets, stage: "frame_sequence" };
  log(`${skill.name}发动：播放动作表现。`);
  if (!playSkillFrameSequence(skill, finishFrameSequenceSkillFlow)) {
    finishFrameSequenceSkillFlow();
  }
}

function finishFrameSequenceSkillFlow() {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "frame_sequence") return;
  hideVideoOverlay();
  state.skillCinematic = null;
  settlePlayerSkill(cinematic.skill, cinematic.targets);
}

function settlePlayerSkill(skill, targets, context = {}) {
  const summary = targets.map((target) => applySkillToPart(target, skill, context));
  normalizeAoeBossHpDamage(skill, summary);
  applyGreatswordBleedPassive(skill, summary);
  resolveGreatswordBloodReap(skill);
  const greatswordDamageEvents = skill.weaponId === "greatsword" && skill.damage > 0
    ? summary.filter((result) => (result.damage || 0) + (result.globalChipDamage || 0) + (result.armorDamage || 0) > 0).length
    : 0;
  const greatswordFollowUp = greatswordDamageEvents > 0
    ? registerGreatswordDamageEvents(greatswordDamageEvents, skill, targets[0])
    : null;
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
    if (greatswordFollowUp?.triggered) {
      startComboFollowUpFlow(greatswordFollowUp.skill, greatswordFollowUp.target);
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

function applyGreatswordBleedPassive(skill, results) {
  if (skill.weaponId !== "greatsword" || skill.damage <= 0) return;
  const passive = configuredUpperArmorPassiveByEffect("bleed_hunger");
  if (!passive) return;
  const validResults = results.filter((result) => (result.damage || 0) + (result.globalChipDamage || 0) > 0);
  let appliedStacks = 0;
  let healed = 0;
  validResults.forEach((result) => {
    if (Math.random() > (passive.bleedChance || 0.35)) return;
    if (state.enemy.bleedStacks < (passive.bleedMaxStacks || 5)) {
      state.enemy.bleedStacks += 1;
      appliedStacks += 1;
    }
    state.enemy.bleedTurns = passive.bleedDuration || 2;
    state.player.bloodlust = Math.min(passive.bloodlustMax || 15, state.player.bloodlust + 1);
    const damageDone = (result.damage || 0) + (result.globalChipDamage || 0);
    healed += Math.max(1, Math.round(damageDone * (passive.healRatio || 0.03)));
  });
  if (appliedStacks <= 0) {
    log(`流血汲取未触发：本次 ${Math.round((passive.bleedChance || 0.35) * 100)}% 判定失败。`);
    return;
  }
  const beforeHp = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + healed);
  const actualHeal = state.player.hp - beforeHp;
  if (actualHeal > 0) addPlayerHealFloater(actualHeal, "流血汲取恢复");
  addSkillResultFloater(
    { name: passive.name, color: passive.color },
    appliedStacks,
    "bleed",
    partPosition("core"),
    passive.color
  );
  log(`流血汲取：附加 ${appliedStacks} 层流血（当前 ${state.enemy.bleedStacks}/5），嗜血 ${state.player.bloodlust}/15${actualHeal > 0 ? `，恢复 ${actualHeal} 生命` : ""}。`);
}

function resolveGreatswordBloodReap(skill) {
  if (!skill.bloodReap || state.enemy.bleedStacks <= 0) return;
  const thresholds = [9, 15].filter((threshold) => (
    state.player.bloodlust >= threshold
    && !state.player.bloodlustThresholdsResolved.includes(threshold)
  ));
  thresholds.forEach((threshold) => {
    state.player.bloodlustThresholdsResolved.push(threshold);
    const bleedDamage = state.enemy.bleedStacks * 8;
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + bleedDamage;
    const armoredParts = state.enemy.parts.filter((part) => part.armorState === "armored" && !part.broken);
    const postureDamage = state.enemy.bleedStacks * 20;
    const perPartPosture = armoredParts.length ? Math.max(1, Math.round(postureDamage / armoredParts.length)) : 0;
    armoredParts.forEach((part) => {
      const armorDamageDone = Math.min(part.armorValue, perPartPosture);
      part.armorValue = Math.max(0, part.armorValue - perPartPosture);
      if (part.armorValue <= 0) exposePart(part);
      if (armorDamageDone > 0) {
        addSkillResultFloater(skill, armorDamageDone, "armor", partPosition(part.id), "#f1c6b8");
      }
    });
    state.enemy.hp = totalEnemyHp();
    addSkillResultFloater(skill, bleedDamage, "bleed", partPosition("core"), skill.color);
    log(`嗜血 ${threshold} 层兑现：提前结算全部流血，造成 ${bleedDamage} 伤害与 ${postureDamage} 点范围破韧；流血层数保留。`);
  });
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
  const avatarEffect = combatAvatarSkillEffect(skill, target);
  const comboChance = Math.min(0.95, skill.comboChance + (avatarEffect.comboChanceBonus || 0));
  if (Math.random() > comboChance) {
    return { triggered: false, damage: 0 };
  }
  return { triggered: true, target };
}

function startComboFollowUpFlow(skill, target) {
  const followUpName = skill.comboFollowUpName || "连击追打";
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
  log(`${followUpName}触发：向${target.label}追加一次攻击。`);
}

function applyComboFollowUpDamage(skill, target) {
  const followUpName = skill.comboFollowUpName || "连击追打";
  const comboSkill = { name: followUpName, color: skill.color };
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
  log(`${followUpName}：造成 ${damage} 点追加伤害。`);
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
  if (!renderAccessoryChoices(skill)) {
    log("当前没有可介入的挂件，直接结算技能。");
    hideVideoOverlay();
    state.skillCinematic = null;
    settlePlayerSkill(skill, targets);
    return;
  }
  ui.accessoryChoice.classList.remove("hidden");
  playCinematicVideo(skill.accessoryFlow.selectLoopVideo, true);
}

function chooseAccessory(accessoryId) {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "select") return;
  const rawEffect = cinematic.skill.accessoryFlow.effects[accessoryId];
  if (!rawEffect) return;
  if (rawEffect.requiredItemName && !isLoadoutItemEquipped(rawEffect.requiredItemName)) return;
  const effect = boostedAccessoryEffect(rawEffect);
  cinematic.stage = "effect";
  cinematic.selectedAccessory = accessoryId;
  ui.accessoryChoice.classList.add("hidden");
  log(`挂件选择：${effect.label}。`);
  if (effect.arcBoosted) {
    log("方舟反应炉供能：本次挂件介入威力提高。");
  }
  playCinematicVideo(effect.video || "./assets/videos/drone-accessory-effect-web.mp4", false, () => {
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

  if (skill.frameSequence) {
    state.skillCinematic = {
      skill,
      targets,
      spendDots,
      stage: "soul_frame_sequence",
    };
    if (!playSkillFrameSequence(skill, finishSoulArmorFrameSequence)) {
      finishSoulArmorFrameSequence();
    }
    updateUi();
    return;
  }

  settleSoulArmorSkill(skill, targets, spendDots);
}

function finishSoulArmorFrameSequence() {
  const cinematic = state?.skillCinematic;
  if (!cinematic || cinematic.stage !== "soul_frame_sequence") return;
  hideVideoOverlay();
  state.skillCinematic = null;
  settleSoulArmorSkill(cinematic.skill, cinematic.targets, cinematic.spendDots);
}

function settleSoulArmorSkill(skill, targets, spendDots) {
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
  const avatarMultiplier = combatAvatarDamageMultiplier(skill, target, context);
  const damageMultiplier = accessoryMultiplier * (context.nextDamageMultiplier || 1) * avatarMultiplier;
  const soulGainBonus = combatAvatarSoulGainBonus(skill, target, context);

  if (target.broken) {
    damage = Math.round(damage * damageMultiplier * 1.2 * (target.weakpoint ? skill.exposedBonus : Math.max(1, skill.exposedBonus)));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
    state.player.soul = Math.min(100, state.player.soul + skill.soulGain + soulGainBonus + 4);
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
  state.player.soul = Math.min(100, state.player.soul + skill.soulGain + soulGainBonus + (bounced ? 0 : 4));
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
  if (resolveEnemyBleedTurn()) {
    updateUi();
    return;
  }
  state.turn = "enemy";
  state.phase = "敌方回合";
  window.setTimeout(() => {
    if (!state || state.result || state.turn !== "enemy") return;
    createEnemyThreat();
  }, 450);
}

function resolveEnemyBleedTurn() {
  if (state.enemy.bleedStacks <= 0 || state.enemy.bleedTurns <= 0) return false;
  const bleedDamage = state.enemy.bleedStacks * 4;
  state.enemy.extraDamage = (state.enemy.extraDamage || 0) + bleedDamage;
  state.enemy.hp = totalEnemyHp();
  state.enemy.bleedTurns = Math.max(0, state.enemy.bleedTurns - 1);
  addSkillResultFloater(
    { name: "流血", color: "#d95d4f" },
    bleedDamage,
    "bleed",
    partPosition("core"),
    "#d95d4f"
  );
  log(`流血结算：${state.enemy.bleedStacks} 层造成 ${bleedDamage} 点伤害，剩余 ${state.enemy.bleedTurns} 回合。`);
  if (state.enemy.bleedTurns <= 0) {
    state.enemy.bleedStacks = 0;
    log("流血状态结束。");
  }
  if (state.enemy.hp > 0) return false;
  state.result = "victory";
  state.phase = "胜利";
  state.turn = "ended";
  log("Boss 因流血伤害倒下，战斗胜利。");
  return true;
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
  buildSkillControls();
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
  if (attack.type === "staged_block_qte") {
    state.videoAttack = { attack, stage: "prepare", qteResolved: false, result: null };
    state.phase = "敌方普攻准备";
    playCinematicVideo(attack.prepareVideo, false, () => {
      startStagedBlockQte(attack);
    });
  } else if (attack.type === "video_qte") {
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
  if (damage <= 0) return false;
  if (options.allowCounter !== false && resolveGreatswordCounterAfterHit(attack)) {
    return true;
  }
  let incomingDamage = damage;
  const avatarProfile = armorCombatAvatarProfile();
  if (avatarProfile.primaryTypeId === "survival" && !state.player.avatarSurvivalGuardUsed) {
    const reduced = Math.max(1, Math.round(incomingDamage * 0.15));
    incomingDamage = Math.max(1, incomingDamage - reduced);
    state.player.avatarSurvivalGuardUsed = true;
    log(`续战守势生效：首次受击减免 ${reduced} 点伤害。`);
  }
  const mitigatedDamage = Math.max(1, incomingDamage - (state.player.defense || 0));
  state.player.hp = Math.max(0, state.player.hp - mitigatedDamage);
  state.playerHitFlashTimer = 0.42;
  playerHitFloaters.push({
    text: `受到${attack.label}攻击，损失${mitigatedDamage}点血量`,
    x: canvas.width / 2,
    y: canvas.height * 0.38,
    life: 1.25,
  });
  log(`受到${attack.label}攻击，防御抵消 ${incomingDamage - mitigatedDamage} 点，损失${mitigatedDamage}点血量。`);
  return false;
}

function resolveGreatswordCounterAfterHit(attack) {
  if (!state.player.greatswordStanceActive) return false;
  const chance = state.player.guardCounterChance || 0;
  const counterDamage = state.player.guardCounterDamage || 32;
  clearGreatswordCounterStance();
  if (chance <= 0 || state.result) return false;
  if (attack.counterableByGreatsword === false || attack.range === "ranged") {
    log(`防御姿态未能反击：${attack.label}属于远程或不可反击攻击。`);
    return false;
  }
  if (Math.random() <= chance) {
    applyGuardCounterDamage(attack, counterDamage, "大剑姿态反击", { greatswordCounter: true });
    log(`弹反成功：${attack.label}被打断，玩家未受到伤害。`);
    return true;
  }
  log(`防御姿态反击未触发：本次 ${Math.round(chance * 100)}% 判定失败。`);
  return false;
}

function applyGuardCounterDamage(attack, damage = 10, counterName = "格挡反击", options = {}) {
  const target = partById("core") || livingParts()[0];
  if (!target) return;
  const transferPassive = options.greatswordCounter
    ? configuredUpperArmorPassiveByEffect("counter_transfer")
    : null;
  const strengthAdvantage = transferPassive && state.player.greatswordStrength > (state.enemy.strength || 0);
  const strengthMultiplier = strengthAdvantage
    ? 1 + (transferPassive.strengthDamageBonus || 0)
    : 1;
  const shoulderMultiplier = counterChainDamageMultiplier();
  const resolvedDamage = Math.max(1, Math.round(damage * strengthMultiplier * shoulderMultiplier));
  const bonusLabels = [];
  if (strengthAdvantage) bonusLabels.push("力量压制 +50%");
  if (shoulderMultiplier > 1) bonusLabels.push("尖刺肩甲 +10%");
  const bonusText = bonusLabels.length ? `（${bonusLabels.join(" / ")}）` : "";
  const counterSkill = { name: counterName, color: "#ffe08a" };
  dealDirectPartDamage(target, resolvedDamage, counterSkill);
  if (counterName === "格挡反击") {
    log(`格挡反击：化解${attack.label}后，对${target.label}造成 ${resolvedDamage} 点伤害${bonusText}。`);
  } else {
    log(`${counterName}：化解${attack.label}后，对${target.label}造成 ${resolvedDamage} 点伤害${bonusText}。`);
  }
  let damageEventCount = options.greatswordCounter ? 1 : 0;
  if (transferPassive) {
    const transferTarget = randomGreatswordTarget(target.id);
    if (transferTarget) {
      const transferDamage = Math.max(1, Math.round(resolvedDamage * (transferPassive.transferDamageRatio || 0.5)));
      dealDirectPartDamage(transferTarget, transferDamage, { name: "反击传导", color: transferPassive.color });
      damageEventCount += 1;
      log(`反击传导：${transferTarget.label}受到 ${transferDamage} 点传导伤害。`);
    }
  }
  if (damageEventCount > 0) {
    const followUp = registerGreatswordDamageEvents(damageEventCount, counterSkill, target);
    if (followUp?.triggered) {
      applyComboFollowUpDamage(followUp.skill, followUp.target);
    }
  }
  queueCounterArmorFollowUp(attack, target, counterName);
  updateStage();
}

function queueCounterArmorFollowUp(attack, target, counterName) {
  const effect = equippedArmorPartCombatEffect("bracer");
  if (!effect || effect.trigger !== "counter_success") return false;
  const shoulderMultiplier = counterChainDamageMultiplier();
  state.pendingCounterFollowUp = {
    attack,
    counterName,
    targetId: target?.id || "core",
    effect,
    damage: Math.max(1, Math.round(effect.damage * shoulderMultiplier)),
    shoulderBoosted: shoulderMultiplier > 1,
  };
  return true;
}

function settlePendingCounterFollowUp(followUp, onComplete) {
  if (!state || state.result) {
    if (onComplete) onComplete();
    return;
  }
  const target = partById(followUp.targetId) || livingParts()[0];
  if (target) {
    const skill = { name: followUp.effect.name, color: followUp.effect.color };
    const appliedDamage = dealDirectPartDamage(target, followUp.damage, skill);
    log(`${followUp.effect.name}：对${target.label}追加 ${appliedDamage} 点伤害${followUp.shoulderBoosted ? "（尖刺肩甲 +10%）" : ""}。`);
    updateStage();
  }
  if (onComplete) onComplete();
}

function playPendingCounterFollowUp(onComplete) {
  const followUp = state.pendingCounterFollowUp;
  if (!followUp) return false;
  state.pendingCounterFollowUp = null;
  state.phase = followUp.effect.name;
  log(`手部铠甲触发：${followUp.counterName}成功后追加${followUp.effect.name}。`);

  if (state.videoAttack?.counterEffectVideoUsed) {
    settlePendingCounterFollowUp(followUp, onComplete);
    return true;
  }

  playCinematicVideo(followUp.effect.video, false, () => {
    hideVideoOverlay();
    settlePendingCounterFollowUp(followUp, onComplete);
  });
  updateUi();
  return true;
}

function dealDirectPartDamage(target, damage, skill) {
  let appliedDamage = Math.max(0, Math.round(damage));
  if (target.broken) {
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + appliedDamage;
  } else if (target.armorState === "armored") {
    appliedDamage = Math.max(1, Math.round(appliedDamage * 0.2));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + appliedDamage;
  } else {
    target.hp = Math.max(0, target.hp - appliedDamage);
  }
  state.enemy.hp = totalEnemyHp();
  addSkillResultFloater(skill, appliedDamage, "damage", partPosition(target.id), skill.color);
  if (!target.broken && target.hp <= 0) {
    breakPart(target);
  }
  return appliedDamage;
}

function randomGreatswordTarget(excludedPartId = "") {
  const candidates = state.enemy.parts.filter((part) => part.id !== excludedPartId);
  if (!candidates.length) return partById(excludedPartId) || null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function registerGreatswordDamageEvents(count, sourceSkill, preferredTarget = null) {
  const passive = configuredUpperArmorPassiveByEffect("damage_chain");
  if (!passive || count <= 0) return null;
  state.player.greatswordDamageEvents += count;
  state.player.greatswordStrength += count * (passive.strengthPerHit || 1);
  const threshold = passive.triggerHitCount || 3;
  log(`战意连斩：有效伤害 ${Math.min(state.player.greatswordDamageEvents, threshold)}/${threshold}，力量 ${state.player.greatswordStrength}。`);
  if (state.player.greatswordDamageEvents < threshold) return { triggered: false };
  state.player.greatswordDamageEvents -= threshold;
  const target = randomGreatswordTarget(preferredTarget?.id) || preferredTarget || livingParts()[0];
  if (!target) return { triggered: false };
  const baseDamage = Math.max(NORMAL_ATTACK_DAMAGE, sourceSkill?.damage || sourceSkill?.counterDamage || NORMAL_ATTACK_DAMAGE);
  return {
    triggered: true,
    target,
    skill: {
      ...sourceSkill,
      name: passive.name,
      color: passive.color,
      comboFollowUpName: passive.name,
      comboDamage: Math.max(1, Math.round(baseDamage * (passive.followUpDamageRatio || 0.7))),
    },
  };
}

function finishDelayedEnemyAttack(attack) {
  hideVideoOverlay();
  const damage = attack.damageOnRelease;
  state.qte = null;
  applyPlayerDamage(attack, damage);
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
  if (state.player.greatswordStanceActive && (type === "left" || type === "right")) {
    log(`防御姿态中无法${reactionLabel(type)}，可在近战攻击窗口使用 W 格挡。`);
    return;
  }
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
  const playbackId = ++activeVideoPlaybackId;
  clearActiveFrameSequenceTimer();
  resetFrameSequenceDisplay();
  ui.videoOverlay.classList.remove("hidden");
  ui.qteOverlay.classList.add("hidden");
  ui.accessoryChoice.classList.add("hidden");
  ui.skillVideo.loop = false;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.src = src;
  ui.skillVideo.currentTime = 0;
  const finish = () => finishActiveVideo(onEnded, playbackId);
  activeVideoSkipHandler = finish;
  ui.skillVideo.onended = finish;
  ui.skillVideo.onerror = () => {
    if (playbackId !== activeVideoPlaybackId) return;
    log("视频播放失败，跳过当前片段。");
    finish();
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch((error) => {
      if (playbackId !== activeVideoPlaybackId || error?.name === "AbortError") return;
      log("浏览器阻止了视频自动播放，跳过当前片段。");
      finish();
    });
  }
}

function playCinematicVideo(src, loop = false, onEnded = null) {
  const playbackId = ++activeVideoPlaybackId;
  clearActiveFrameSequenceTimer();
  resetFrameSequenceDisplay();
  ui.videoOverlay.classList.remove("hidden");
  ui.qteOverlay.classList.add("hidden");
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.loop = loop;
  ui.skillVideo.src = src;
  ui.skillVideo.currentTime = 0;
  const finish = () => finishActiveVideo(onEnded, playbackId);
  activeVideoSkipHandler = loop || !onEnded ? null : finish;
  ui.skillVideo.onended = loop ? null : finish;
  ui.skillVideo.onerror = () => {
    if (playbackId !== activeVideoPlaybackId) return;
    log("技能表现视频播放失败，跳过当前表现。");
    finish();
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch((error) => {
      if (playbackId !== activeVideoPlaybackId || error?.name === "AbortError") return;
      log("浏览器阻止了技能表现视频自动播放，跳过当前表现。");
      finish();
    });
  }
}

function finishActiveVideo(onEnded, playbackId = activeVideoPlaybackId) {
  if (playbackId !== activeVideoPlaybackId) return;
  activeVideoPlaybackId += 1;
  clearActiveFrameSequenceTimer();
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  if (onEnded) onEnded();
}

function frameSequenceForSkill(skill) {
  return skillFrameSequences[skill?.frameSequence] || null;
}

function frameSequenceFrameUrl(sequence, frameIndex) {
  const fileNumber = String(frameIndex + 1).padStart(3, "0");
  return `${sequence.basePath}/frame_${fileNumber}.webp`;
}

function clearActiveFrameSequenceTimer() {
  if (activeFrameSequenceTimer === null) return;
  window.clearTimeout(activeFrameSequenceTimer);
  activeFrameSequenceTimer = null;
}

function resetFrameSequenceDisplay() {
  if (!ui.skillFrameSequence) return;
  ui.skillFrameSequence.onerror = null;
  ui.skillFrameSequence.classList.add("hidden");
  ui.skillFrameSequence.removeAttribute("src");
  ui.skillVideo.classList.remove("hidden");
}

function playSkillFrameSequence(skill, onEnded) {
  const sequence = frameSequenceForSkill(skill);
  if (!sequence || !ui.skillFrameSequence) return false;

  const playbackId = ++activeVideoPlaybackId;
  const frameDuration = 1000 / Math.max(1, sequence.fps || 4);
  let frameIndex = 0;
  let finished = false;

  clearActiveFrameSequenceTimer();
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.loop = false;
  ui.skillVideo.pause();
  ui.skillVideo.classList.add("hidden");
  ui.skillFrameSequence.classList.remove("hidden");
  ui.skillFrameSequence.alt = `${skill.name}动作表现`;
  ui.videoOverlay.classList.remove("hidden");
  ui.qteOverlay.classList.add("hidden");
  ui.accessoryChoice.classList.add("hidden");

  const finish = () => {
    if (finished || playbackId !== activeVideoPlaybackId) return;
    finished = true;
    finishActiveVideo(onEnded, playbackId);
  };

  const showNextFrame = () => {
    if (finished || playbackId !== activeVideoPlaybackId) return;
    ui.skillFrameSequence.src = frameSequenceFrameUrl(sequence, frameIndex);
    frameIndex += 1;
    activeFrameSequenceTimer = window.setTimeout(
      frameIndex >= sequence.frameCount ? finish : showNextFrame,
      frameDuration,
    );
  };

  ui.skillFrameSequence.onerror = () => {
    if (playbackId !== activeVideoPlaybackId) return;
    log("动作帧加载失败，跳过当前表现。");
    finish();
  };
  activeVideoSkipHandler = finish;
  showNextFrame();
  return true;
}

function preloadSkillFrameSequences() {
  Object.values(skillFrameSequences).forEach((sequence) => {
    for (let frameIndex = 0; frameIndex < sequence.frameCount; frameIndex += 1) {
      const src = frameSequenceFrameUrl(sequence, frameIndex);
      if (preloadedFrameSequenceImages.has(src)) continue;
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      preloadedFrameSequenceImages.set(src, image);
    }
  });
}

function skipCurrentVideo() {
  if (!activeVideoSkipHandler || ui.videoOverlay.classList.contains("hidden")) return false;
  const finish = activeVideoSkipHandler;
  const videoStage = state?.videoAttack?.stage;
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.pause();
  if (videoStage === "prepare") {
    log("已跳过准备片段，进入格挡判定。");
  } else if (videoStage === "loading") {
    log("已跳过格挡判定，按失败处理。");
  } else {
    log("已跳过当前表现，进入结算。");
  }
  finish();
  return true;
}

function startStagedBlockQte(attack) {
  if (!state || state.result || !state.videoAttack || state.videoAttack.attack !== attack) return;
  state.videoAttack.stage = "loading";
  state.videoAttack.qteResolved = false;
  state.phase = "格挡判定";
  state.qte = {
    active: true,
    start: 0,
    end: attack.qteDuration,
    duration: attack.qteDuration,
    remaining: attack.qteDuration,
    validResponses: attack.validResponses,
  };
  log("格挡窗口开启：按 W 进行格挡。");
  playCinematicVideo(attack.loadingVideo, false, () => {
    if (!state?.videoAttack || state.videoAttack.qteResolved) return;
    resolveVideoQte("fail");
  });
  ui.qteTitle.textContent = "格挡时机";
  ui.qteCopy.textContent = "W 格挡";
  ui.qteGauge.style.width = "100%";
  ui.qteOverlay.classList.remove("hidden");
  updateUi();
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

function updateVideoQteUi(delta = 0) {
  if (!state.qte?.active) return;
  if (state.videoAttack?.attack?.type === "staged_block_qte") {
    state.qte.remaining = Math.max(0, (state.qte.remaining ?? state.qte.duration) - delta);
    const duration = Math.max(0.01, state.qte.duration || state.qte.end);
    ui.qteGauge.style.width = `${Math.min(100, (state.qte.remaining / duration) * 100)}%`;
    if (state.qte.remaining <= 0) {
      resolveVideoQte("fail");
    }
    return;
  }
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
  state.phase = success ? "格挡成功" : "格挡失败";
  log(success ? "格挡成功：化解怪物普攻。" : "格挡失败：怪物普攻即将命中。");
  let resultVideo = success ? attack.successVideo : attack.failVideo;
  const counterEffect = success ? equippedArmorPartCombatEffect("bracer") : null;
  if (counterEffect?.trigger === "counter_success" && counterEffect.video) {
    resultVideo = counterEffect.video;
    state.videoAttack.counterEffectVideoUsed = true;
    log(`${counterEffect.name}已接管格挡成功表现。`);
  }
  playVideo(resultVideo, () => finishVideoEnemyAttack(success));
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
    const countered = applyPlayerDamage(attack, damage);
    if (!countered) log("格挡失败：玩家受到伤害。");
  } else {
    if (success && responseType === "block") {
      const stanceCountered = resolveGreatswordCounterAfterHit(attack);
      if (!stanceCountered) {
        applyGuardCounterDamage(attack);
        log("格挡成功：玩家没有受到伤害，并造成少量反击。");
      }
    } else {
      log("闪避成功：玩家没有受到伤害。");
    }
  }
  hideVideoOverlay();
  if (playPendingCounterFollowUp(finalizeVideoEnemyAttack)) return;
  finalizeVideoEnemyAttack();
}

function finalizeVideoEnemyAttack() {
  if (!state.videoAttack) return;
  state.videoAttack = null;
  state.qte = null;
  state.pendingCounterFollowUp = null;
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
  activeVideoPlaybackId += 1;
  clearActiveFrameSequenceTimer();
  activeVideoSkipHandler = null;
  ui.skillVideo.onended = null;
  ui.skillVideo.onerror = null;
  ui.skillVideo.loop = false;
  ui.skillVideo.pause();
  ui.skillVideo.removeAttribute("src");
  ui.skillVideo.load();
  resetFrameSequenceDisplay();
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
    updateVideoQteUi(delta);
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
  drawGreatswordStanceEffects();
  drawDefaultMeleeCinematicEffects();
  if (!battleUiHidden) {
    drawWeakpointEffects();
    drawFloaters();
    drawThreatOverlay();
    drawPlayerDamageFeedback();
    drawHoveredTargetHighlights();
  }
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
  if (!battleUiHidden) {
    const bossHpW = Math.min(360, canvas.width * 0.34);
    const bossHpX = canvas.width / 2 - bossHpW / 2;
    const bossHpY = 18;
    drawHealthBar(bossHpX, bossHpY, bossHpW, state.enemy.hp / state.enemy.maxHp, "#e86c62");
    drawBarText(bossHpX, bossHpY, bossHpW, 7, `${state.enemy.hp}/${state.enemy.maxHp}`);
  }
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
  const isActivation = cinematic?.stage === "greatsword_stance";
  if (!isActivation && !state?.player?.greatswordStanceActive) return;
  const progress = isActivation ? Math.max(0, Math.min(1, cinematic.elapsed / cinematic.duration)) : 1;
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
  ctx.strokeText("防御姿态", x, bodyY - 178);
  ctx.fillText("防御姿态", x, bodyY - 178);
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

function addPlayerHealFloater(amount, label = "酒葫芦恢复") {
  playerHitFloaters.push({
    type: "heal",
    text: `${label} +${amount}`,
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
  ui.playerHudHp.textContent = `${state.player.hp} / ${state.player.maxHp}`;
  ui.playerHudHpFill.style.width = `${Math.max(0, Math.min(100, (state.player.hp / state.player.maxHp) * 100))}%`;
  ui.playerMana.textContent = `${state.player.action} / ${state.player.maxAction}`;
  ui.playerManaCells.style.setProperty("--mana-cell-count", String(state.player.maxAction));
  if (ui.playerManaCells.children.length !== state.player.maxAction) {
    ui.playerManaCells.replaceChildren(
      ...Array.from({ length: state.player.maxAction }, () => document.createElement("i")),
    );
  }
  [...ui.playerManaCells.children].forEach((cell, index) => {
    cell.classList.toggle("filled", index < state.player.action);
  });
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

function setBattleUiHidden(hidden) {
  battleUiHidden = Boolean(hidden);
  ui.battleApp?.classList.toggle("gm-ui-hidden", battleUiHidden);
  document.body.classList.toggle("gm-battle-ui-hidden", battleUiHidden);
  ui.gmHideBattleUi?.setAttribute("aria-pressed", String(battleUiHidden));
  ui.gmShowBattleUi?.setAttribute("aria-hidden", String(!battleUiHidden));
  draw();
}

function loop(now) {
  const delta = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

ui.resetBtn.addEventListener("click", resetGame);
ui.gmHideBattleUi?.addEventListener("click", () => setBattleUiHidden(true));
ui.gmShowBattleUi?.addEventListener("click", () => setBattleUiHidden(false));
document.getElementById("enterBattleBtn")?.addEventListener("click", enterBattleFromLoadout);
ui.nextLoadoutBtn?.addEventListener("click", () => setPrebattleStep("presets"));
ui.nextLoadoutFromCharacterBtn?.addEventListener("click", () => setPrebattleStep("battle"));
ui.nextSkillBtn?.addEventListener("click", () => setPrebattleStep("skills"));
ui.skillDescriptionOverlay?.addEventListener("click", hideSkillDescription);
ui.skillDescriptionPanel?.addEventListener("click", (event) => event.stopPropagation());
bindSkillWheelGesture();
ui.nextSkillFromWeaponBtn?.addEventListener("click", () => setPrebattleStep("skills"));
ui.backToBossBtn?.addEventListener("click", () => setPrebattleStep("presets"));
ui.backToBossFromCharacterBtn?.addEventListener("click", () => setPrebattleStep("boss"));
ui.backToCharacterFromWeaponBtn?.addEventListener("click", () => setPrebattleStep("presets"));
ui.backToLoadoutBtn?.addEventListener("click", () => setPrebattleStep("presets"));
ui.backToCharacterFromLinksBtn?.addEventListener("click", () => setPrebattleStep("character"));
ui.backToLoadoutFromArmorBoardBtn?.addEventListener("click", () => setPrebattleStep("loadout"));
ui.enterBattleFromLinksBtn?.addEventListener("click", enterBattleFromLoadout);
ui.backToBossFromPresetsBtn?.addEventListener("click", () => {
  if (loadoutState.portraitLoadoutView === "weapon") {
    loadoutState.portraitLoadoutView = "armor";
    loadoutState.activePortraitWeaponId = "";
    loadoutState.activePortraitSkillId = "";
    loadoutState.portraitSkillPopupOpen = false;
    renderLoadoutPresetPage();
    return;
  }
  setPrebattleStep("boss");
});
ui.enterBattleFromPresetsBtn?.addEventListener("click", enterBattleFromLoadout);
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
  const clickPath = event.composedPath?.() || [];
  const pathMatches = (selector) => clickPath.some((node) => node?.matches?.(selector));
  const weaponPage = ui.prebattleScreen.querySelector('[data-prebattle-page="weapons"]');
  const detailRect = ui.weaponDetailPanel?.getBoundingClientRect();
  const clickedWeaponPage = clickPath.includes(weaponPage);
  const clickedInteractive = pathMatches(
    ".weapon-detail-panel, .weapon-gallery-card, .weapon-carry-card, button, a, input, select, textarea"
  );
  const clickedLeftOfPanel = detailRect ? event.clientX < detailRect.left : false;
  if (!clickedWeaponPage || clickedInteractive || !clickedLeftOfPanel) return;

  loadoutState.weaponDetailOpen = false;
  loadoutState.weaponSkillPickerOpen = false;
  renderPrebattleWeapons();
});
ui.weaponToggle.addEventListener("click", toggleWeaponOverlay);
window.addEventListener("resize", queueSkillWheelGeometryUpdate);
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
    label.textContent = `策略版 · Demo ${DEMO_VERSION}`;
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
applyLoadoutPreset(loadoutState.activeLoadoutPresetId, { render: false });
renderPrebattleLoadout();
resetGame();
if ("requestIdleCallback" in window) {
  window.requestIdleCallback(preloadSkillFrameSequences, { timeout: 1800 });
} else {
  window.setTimeout(preloadSkillFrameSequences, 600);
}
requestAnimationFrame(loop);
