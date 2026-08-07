"use strict";

const DEMO_VERSION = "卡牌版 v0.5.1-stun-card-cooldown · 2026.08.07";
const MAX_PLAYER_HP = 220;
const MAX_BOSS_HP = 420;
const MAX_ENERGY = 10;
const MAX_SOUL_ENERGY = 100;
const SOUL_TIER_COST = 25;
const SOUL_GAIN_PER_SPENT_ENERGY = 4;
const SOUL_QTE_GAIN = 4;
const ULTIMATE_MIN_HOLD_MS = 300;
const ULTIMATE_TIER_HOLD_MS = 400;
const ULTIMATE_CAST_DURATION = 1120;
const BOSS_TURN_INTERVAL = 3400;
const FIRST_TURN_DELAY = 1500;
const BOSS_IMPACT_DELAY = 2400;
const BOSS_LUNGE_DURATION = 1320;
const BOSS_LUNGE_CONTACT_PROGRESS = 0.42;
const BOSS_LUNGE_CONTACT_OFFSET = Math.round(
  BOSS_LUNGE_DURATION * BOSS_LUNGE_CONTACT_PROGRESS,
);
const BOSS_LUNGE_START_DELAY = Math.max(0, BOSS_IMPACT_DELAY - BOSS_LUNGE_CONTACT_OFFSET);
const ATTACK_RECOVER_DELAY = BOSS_LUNGE_START_DELAY + BOSS_LUNGE_DURATION + 100;
const ENERGY_INTERVAL = 4000;
const BASE_CHAIN_WINDOW = 2700;
const MAX_HAND_SIZE = 4;
const INTERVENTION_TRIGGER_MS = 900;
const INTERVENTION_WINDOW_MS = 1400;
const INTERVENTION_TIME_SCALE = 0.3;
const INTERVENTION_RELEASE_DELAY = 900;
const MODULE_FRAME_DURATION = 900;
const MODULE_VIDEO_TIMEOUT = 12000;
const FIST_FRAME_INTERVAL = 250;
const FIST_CHAIN_WINDOW = 30000;
const MIN_TURN_GAP = 600;
const BOSS_STUN_DURATION = 5000;
const CARD_TO_BOSS_DELAY = 680;
const AUTO_MODE_RESUME_DELAY = 420;
const AUTO_CHAIN_CONTINUE_WINDOW = 8200;
const STUN_AUTO_CARD_GAP = 500;

const deckRecipe = [
  "armor",
  "reactor",
  "jet",
  "cannon",
  "drone",
  "gourd",
  "fist_arm_rush",
  "fist_leg_drive",
  "fist_flurry",
  "reactor",
  "cannon",
];
const openingHandRecipe = ["reactor", "fist_arm_rush", "fist_leg_drive", "fist_flurry"];

const weaponModes = [
  {
    id: "fists",
    name: "拳套",
    style: "近身压制",
    summary: "自动贴近Boss，以连续拳脚轮流压制手部、胸口与脚部。",
    icon: "./assets/weapon-fists.png",
    playerSprite: "./assets/player-fists.png",
    color: "#ef873f",
    attackInterval: 3000,
    impactDelay: 620,
    recoverDelay: 1400,
    cadence: "稳定连击",
    synergyCards: ["reactor", "jet", "drone", "fist_arm_rush", "fist_leg_drive", "fist_flurry"],
    neutralCards: ["gourd"],
    sound: { wave: "square", start: 230, end: 360, duration: 0.11 },
    actions: [
      { id: "rush_punch", name: "碎臂重拳", target: "arms", targetLabel: "手部", damage: 7, armorDamage: 12, pressure: 8 },
      { id: "core_combo", name: "核心连打", target: "core", targetLabel: "胸口", damage: 9, armorDamage: 0, pressure: 10 },
      { id: "ground_kick", name: "贴地踢击", target: "legs", targetLabel: "脚部", damage: 8, armorDamage: 10, pressure: 8 },
    ],
  },
  {
    id: "greatsword",
    name: "大剑",
    style: "守势破甲",
    summary: "用沉重斩击处理硬甲，并以稳定架势承接Boss反击。",
    icon: "./assets/weapon-greatsword.png",
    playerSprite: "./assets/player-greatsword.png",
    color: "#e45f48",
    attackInterval: 4600,
    impactDelay: 900,
    recoverDelay: 1950,
    cadence: "慢速重击",
    synergyCards: ["armor", "reactor", "cannon"],
    neutralCards: ["gourd"],
    sound: { wave: "sawtooth", start: 105, end: 58, duration: 0.32 },
    actions: [
      { id: "armor_cleave", name: "破岩重斩", target: "arms", targetLabel: "手部", damage: 8, armorDamage: 20, pressure: 14 },
      { id: "guard_counter", name: "守势反击", target: "core", targetLabel: "胸口", damage: 12, armorDamage: 0, pressure: 12 },
      { id: "low_sweep", name: "横扫断足", target: "legs", targetLabel: "脚部", damage: 9, armorDamage: 18, pressure: 13 },
    ],
  },
  {
    id: "bow",
    name: "弓弩",
    style: "远程点破",
    summary: "保持距离，以穿甲箭和核心爆射精确处理Boss部位。",
    icon: "./assets/weapon-bow.png",
    playerSprite: "./assets/player-bow.png",
    color: "#62bfe8",
    attackInterval: 3600,
    impactDelay: 640,
    recoverDelay: 1500,
    cadence: "中速点射",
    synergyCards: ["reactor", "cannon", "drone"],
    neutralCards: ["gourd"],
    sound: { wave: "triangle", start: 540, end: 260, duration: 0.18 },
    actions: [
      { id: "piercing_arm", name: "穿臂箭", target: "arms", targetLabel: "手部", damage: 7, armorDamage: 17, pressure: 11 },
      { id: "core_burst", name: "核心爆射", target: "core", targetLabel: "胸口", damage: 14, armorDamage: 0, pressure: 14 },
      { id: "pinning_shot", name: "束足贯射", target: "legs", targetLabel: "脚部", damage: 7, armorDamage: 13, pressure: 10 },
    ],
  },
];

const availableStyleIds = new Set(["fists"]);

const cards = [
  {
    id: "fist_arm_rush",
    weaponId: "fists",
    name: "核心连打",
    type: "拳套技能",
    role: "追击",
    icon: "./assets/fist-skill-preview.jpg",
    cost: 4,
    color: "#ef873f",
    summary: "贴身连拳直击胸口；裸露时伤害提高，并有50%概率追加一记追拳。",
    usage: "胸口单体 · 裸露追击",
    effectTags: ["胸口单体", "50%追击"],
    targetParts: ["core"],
    damage: 24,
    armorDamage: 8,
    exposedBonus: 1.65,
    pressure: 22,
    followUpChance: 0.5,
    followUpDamage: 22,
    video: "./assets/fist-skill.mp4",
  },
  {
    id: "fist_leg_drive",
    weaponId: "fists",
    name: "贴地踢击",
    type: "拳套技能",
    role: "破绽",
    icon: "./assets/skill-frames/fist-close-flurry/frame_005.webp",
    cost: 5,
    color: "#f09a48",
    summary: "低身突进踢击脚部；对裸露脚部造成高额伤害，并有50%概率追击。",
    usage: "脚部单体 · 裸露追击",
    effectTags: ["脚部单体", "50%追击"],
    targetParts: ["legs"],
    damage: 44,
    armorDamage: 8,
    exposedBonus: 1.6,
    pressure: 28,
    followUpChance: 0.5,
    followUpDamage: 22,
    video: "./assets/videos/fist-leg-drive.mp4",
  },
  {
    id: "fist_flurry",
    weaponId: "fists",
    name: "近身乱舞",
    type: "拳套技能",
    role: "全压制",
    icon: "./assets/skill-frames/fist-close-flurry/frame_007.webp",
    cost: 6,
    color: "#ffb15a",
    summary: "从多个角度连续攻击胸口、手部与脚部；总伤害按一次技能结算。",
    usage: "全部位 · 连续压制",
    effectTags: ["三部位", "总伤害归一"],
    targetParts: ["core", "arms", "legs"],
    damage: 56,
    armorDamage: 6,
    exposedBonus: 1.35,
    pressure: 34,
    frames: [
      "./assets/skill-frames/fist-close-flurry/frame_001.webp",
      "./assets/skill-frames/fist-close-flurry/frame_002.webp",
      "./assets/skill-frames/fist-close-flurry/frame_003.webp",
      "./assets/skill-frames/fist-close-flurry/frame_004.webp",
      "./assets/skill-frames/fist-close-flurry/frame_005.webp",
      "./assets/skill-frames/fist-close-flurry/frame_006.webp",
      "./assets/skill-frames/fist-close-flurry/frame_007.webp",
      "./assets/skill-frames/fist-close-flurry/frame_008.webp",
    ],
  },
  {
    id: "armor",
    name: "战甲承压",
    type: "战甲技能",
    role: "稳定",
    icon: "./assets/armor-overdrive.jpeg",
    cost: 2,
    color: "#e0ae4f",
    summary: "唤醒战甲承压结构，强化形态期间的格挡稳定性。",
    usage: "形态技能 · 强化防御",
    effectTags: ["受击减伤", "稳定架势"],
  },
  {
    id: "reactor",
    name: "方舟反应炉",
    type: "前胸挂件",
    role: "供能",
    icon: "./assets/arc-reactor.jpeg",
    cost: 1,
    color: "#f08a45",
    summary: "反应炉脉冲恢复3点战术能量，并强化后续两个模块。",
    usage: "连携起手 · 回能并强化后续",
    effectTags: ["恢复3战术能量", "强化后续×2"],
  },
  {
    id: "jet",
    name: "喷气背包",
    type: "肩部挂件",
    role: "变轨",
    icon: "./assets/jet.png",
    cost: 4,
    color: "#55bfe7",
    summary: "喷气推进强化下一次自动攻击，并减轻下一次Boss反击。",
    usage: "攻击前使用 · 强化下次攻击",
    effectTags: ["下次攻击增伤", "减轻反击"],
    video: "./assets/videos/jet-accessory-effect-web.mp4",
  },
  {
    id: "cannon",
    name: "肩炮",
    type: "肩部挂件",
    role: "破甲",
    icon: "./assets/shoulder-cannon.jpeg",
    cost: 4,
    color: "#e75f45",
    summary: "立即轰击Boss正在蓄力的部位，造成高额破甲与打断值。",
    usage: "Boss蓄力时 · 破甲并打断",
    effectTags: ["高额破甲", "打断蓄力"],
    targetsIntentPart: true,
  },
  {
    id: "drone",
    name: "无人机",
    type: "上臂挂件",
    role: "追击",
    icon: "./assets/drone.png",
    cost: 2,
    color: "#66cf8a",
    summary: "立即从侧翼补射，接在其他模块之后收益更高。",
    usage: "连携后段 · 触发侧翼追击",
    effectTags: ["侧翼追击", "连携增伤"],
    targetsIntentPart: true,
    video: "./assets/videos/drone-accessory-effect-web.mp4",
  },
  {
    id: "gourd",
    name: "酒葫芦",
    type: "前腰挂件",
    role: "治疗",
    icon: "./assets/gourd.jpeg",
    cost: 1,
    color: "#73d98b",
    summary: "饮下一口战酒，立即恢复生命；连携越长，治疗效果越高。",
    usage: "受伤后使用 · 立即恢复生命",
    effectTags: ["恢复生命", "连携治疗"],
    video: "./assets/videos/gourd-heal.mp4",
  },
];

const intentBlueprints = [
  {
    id: "rock_throw",
    name: "巨石投掷",
    part: "arms",
    cue: "手臂聚力",
    title: "Boss正在准备巨石投掷",
    counter: "压制手部",
    icon: "./assets/part-arms.png",
    damage: 42,
    threshold: 72,
    responses: ["right", "block"],
    responseHint: "右侧重击：D右闪或W格挡",
  },
  {
    id: "lava_burst",
    name: "熔岩喷发",
    part: "core",
    cue: "核心升温",
    title: "Boss胸口正在积蓄熔岩",
    counter: "压制核心",
    icon: "./assets/part-core.png",
    damage: 48,
    threshold: 78,
    responses: ["left", "right"],
    responseHint: "熔岩喷发：向任一侧闪避",
  },
  {
    id: "ground_crush",
    name: "重压踏击",
    part: "legs",
    cue: "下盘下沉",
    title: "Boss准备震碎地面",
    counter: "破坏脚部",
    icon: "./assets/part-feet.png",
    damage: 35,
    threshold: 66,
    responses: ["left", "block"],
    responseHint: "地面震击：A左闪或W格挡",
  },
];

const partBlueprints = {
  arms: { id: "arms", name: "手部", icon: "./assets/part-arms.png", maxArmor: 75, maxHp: 90 },
  core: { id: "core", name: "胸口", icon: "./assets/part-core.png", maxArmor: 0, maxHp: 145 },
  legs: { id: "legs", name: "脚部", icon: "./assets/part-feet.png", maxArmor: 68, maxHp: 88 },
};

const linkRules = {
  "armor>reactor": { name: "稳定供能", bonus: 0.15 },
  "reactor>jet": { name: "推进过载", bonus: 0.2 },
  "reactor>cannon": { name: "高能炮击", bonus: 0.22 },
  "jet>cannon": { name: "空中火力", bonus: 0.2 },
  "cannon>drone": { name: "交叉追击", bonus: 0.18 },
  "reactor>fist_arm_rush": { name: "超载起式", bonus: 0.12 },
  "fist_arm_rush>fist_leg_drive": { name: "拳势追击", bonus: 0.16 },
  "fist_leg_drive>fist_flurry": { name: "三段压制", bonus: 0.2 },
};

const chainTiers = [
  "常态战斗",
  "局部唤醒",
  "双部件协同",
  "核心形态联动",
  "过载协同",
  "全武装齐射",
];

const ultimateTiers = [
  {
    tier: 1,
    roman: "I",
    cost: 25,
    name: "修罗一式 · 截势重拳",
    effect: "轰击Boss当前蓄力部位，低成本截断攻势",
    damage: 24,
    armorDamage: 28,
    pressure: 48,
    color: "#efb761",
  },
  {
    tier: 2,
    roman: "II",
    cost: 50,
    name: "修罗二式 · 裂甲连破",
    effect: "连续轰击Boss当前蓄力部位，集中打开硬甲",
    damage: 48,
    armorDamage: 68,
    pressure: 64,
    color: "#ff9552",
  },
  {
    tier: 3,
    roman: "III",
    cost: 75,
    name: "修罗三式 · 镇岳百裂",
    effect: "必破当前硬甲，并强制击溃Boss当前攻势",
    damage: 78,
    armorDamage: 100,
    pressure: 84,
    color: "#ff714b",
  },
  {
    tier: 4,
    roman: "IV",
    cost: 100,
    name: "修罗奥义 · 百炼归一",
    effect: "修罗全功率集中一点，处决Boss当前蓄力部位",
    damage: 120,
    armorDamage: 150,
    pressure: 120,
    color: "#fff0a0",
  },
];

const ui = {
  gameShell: document.getElementById("gameShell"),
  battlePreparation: document.getElementById("battlePreparation"),
  preparationEyebrow: document.getElementById("preparationEyebrow"),
  preparationTitle: document.getElementById("preparationTitle"),
  preparationDescription: document.getElementById("preparationDescription"),
  preparationMonsterStage: document.getElementById("preparationMonsterStage"),
  preparationLoadoutStage: document.getElementById("preparationLoadoutStage"),
  preparationMonsterNext: document.getElementById("preparationMonsterNext"),
  preparationBackToMonster: document.getElementById("preparationBackToMonster"),
  preparationProgressItems: document.querySelectorAll("[data-preparation-progress]"),
  preparationPreviewImage: document.getElementById("preparationPreviewImage"),
  preparationStyleName: document.getElementById("preparationStyleName"),
  preparationStyleMeta: document.getElementById("preparationStyleMeta"),
  preparationSelectionName: document.getElementById("preparationSelectionName"),
  preparationConfirm: document.getElementById("preparationConfirm"),
  preparationStyleOptions: document.querySelectorAll(".style-option[data-style-id]"),
  turnLabel: document.getElementById("turnLabel"),
  playerHpBar: document.getElementById("playerHpBar"),
  playerHpText: document.getElementById("playerHpText"),
  energyCells: document.getElementById("energyCells"),
  energyText: document.getElementById("energyText"),
  playerStatusStrip: document.getElementById("playerStatusStrip"),
  bossHpBar: document.getElementById("bossHpBar"),
  bossHpText: document.getElementById("bossHpText"),
  bossHudAvatar: document.getElementById("bossHudAvatar"),
  intentChip: document.getElementById("intentChip"),
  intentName: document.getElementById("intentName"),
  partBars: document.getElementById("partBars"),
  resetButton: document.getElementById("resetButton"),
  battlefield: document.getElementById("battlefield"),
  autoActionText: document.getElementById("autoActionText"),
  autoActionBar: document.getElementById("autoActionBar"),
  battleWeaponIcon: document.getElementById("battleWeaponIcon"),
  battleWeaponName: document.getElementById("battleWeaponName"),
  intentBanner: document.getElementById("intentBanner"),
  intentPartIcon: document.getElementById("intentPartIcon"),
  intentCue: document.getElementById("intentCue"),
  intentTitle: document.getElementById("intentTitle"),
  intentCounter: document.getElementById("intentCounter"),
  reactionControls: document.getElementById("reactionControls"),
  reactionHint: document.getElementById("reactionHint"),
  playerUnit: document.getElementById("playerUnit"),
  playerImage: document.getElementById("playerImage"),
  bossUnit: document.getElementById("bossUnit"),
  bossImage: document.getElementById("bossImage"),
  droneUnit: document.getElementById("droneUnit"),
  battleMessage: document.getElementById("battleMessage"),
  floatingLayer: document.getElementById("floatingLayer"),
  effectLayer: document.getElementById("effectLayer"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultEyebrow: document.getElementById("resultEyebrow"),
  resultTitle: document.getElementById("resultTitle"),
  resultCopy: document.getElementById("resultCopy"),
  resultRestart: document.getElementById("resultRestart"),
  commandDeck: document.getElementById("commandDeck"),
  liveHint: document.getElementById("liveHint"),
  cardEnergyValue: document.getElementById("cardEnergyValue"),
  cardEnergyCurrent: document.getElementById("cardEnergyCurrent"),
  cardEnergyMax: document.getElementById("cardEnergyMax"),
  energyRate: document.getElementById("energyRate"),
  cardEnergyPips: document.getElementById("cardEnergyPips"),
  cardHand: document.getElementById("cardHand"),
  cardModeSwitch: document.getElementById("cardModeSwitch"),
  cardModeButtons: document.querySelectorAll("[data-card-play-mode]"),
  cardOrderStatus: document.getElementById("cardOrderStatus"),
  nextCardPreview: document.getElementById("nextCardPreview"),
  nextCardImage: document.getElementById("nextCardImage"),
  nextCardCost: document.getElementById("nextCardCost"),
  nextCardName: document.getElementById("nextCardName"),
  compactLog: document.getElementById("compactLog"),
  gmTools: document.getElementById("gmTools"),
  gmToggle: document.getElementById("gmToggle"),
  gmPanel: document.getElementById("gmPanel"),
  gmClose: document.getElementById("gmClose"),
  gmStatus: document.getElementById("gmStatus"),
  gmUiToggle: document.getElementById("gmUiToggle"),
  gmActions: document.querySelectorAll("[data-gm-action]"),
  combatStyleSummary: document.getElementById("combatStyleSummary"),
  weaponAttackRing: document.getElementById("weaponAttackRing"),
  autoWeaponIcon: document.getElementById("autoWeaponIcon"),
  autoWeaponName: document.getElementById("autoWeaponName"),
  weaponCadenceText: document.getElementById("weaponCadenceText"),
  moduleCinematic: document.getElementById("moduleCinematic"),
  moduleVideo: document.getElementById("moduleVideo"),
  moduleFrameStage: document.getElementById("moduleFrameStage"),
  moduleFrameIcon: document.getElementById("moduleFrameIcon"),
  moduleFrameName: document.getElementById("moduleFrameName"),
  moduleVideoType: document.getElementById("moduleVideoType"),
  moduleVideoTitle: document.getElementById("moduleVideoTitle"),
  moduleVideoIcons: document.getElementById("moduleVideoIcons"),
  moduleVideoComboName: document.getElementById("moduleVideoComboName"),
  moduleVideoComboEffect: document.getElementById("moduleVideoComboEffect"),
  moduleVideoSkip: document.getElementById("moduleVideoSkip"),
  soulUltimateButton: document.getElementById("soulUltimateButton"),
  soulCancelTarget: document.getElementById("soulCancelTarget"),
  ultimateButtonLabel: document.getElementById("ultimateButtonLabel"),
  ultimateControlHint: document.getElementById("ultimateControlHint"),
  soulTierMarks: document.querySelectorAll(".soul-stage-pips b"),
  ultimateCinematic: document.getElementById("ultimateCinematic"),
  ultimateCinematicTier: document.getElementById("ultimateCinematicTier"),
  ultimateCinematicCost: document.getElementById("ultimateCinematicCost"),
  ultimateCinematicName: document.getElementById("ultimateCinematicName"),
  ultimateCinematicEffect: document.getElementById("ultimateCinematicEffect"),
  awakeningConsole: document.getElementById("awakeningConsole"),
  awakeningPreviewTitle: document.getElementById("awakeningPreviewTitle"),
  awakeningPreviewEffect: document.getElementById("awakeningPreviewEffect"),
  awakeningSelection: document.getElementById("awakeningSelection"),
  awakeningSelectionCount: document.getElementById("awakeningSelectionCount"),
  awakeningSelectionCost: document.getElementById("awakeningSelectionCost"),
  awakeningCancel: document.getElementById("awakeningCancel"),
  awakeningConfirm: document.getElementById("awakeningConfirm"),
  armorTransformCinematic: document.getElementById("armorTransformCinematic"),
  transformModules: document.getElementById("transformModules"),
  awakenedStatus: document.getElementById("awakenedStatus"),
  awakenedStatusName: document.getElementById("awakenedStatusName"),
  awakenedStatusModules: document.getElementById("awakenedStatusModules"),
  awakenedTurns: document.getElementById("awakenedTurns"),
};

let state;
let battleTimer = 0;
let messageTimer = 0;
let logTimer = 0;
let resolvedChainTimer = 0;
let modulePresentationTimer = 0;
let modulePresentationWatchdog = 0;
let moduleFrameSequenceTimer = 0;
let modulePresentationSerial = 0;
let audioContext = null;
let runToken = 0;
let preparedStyleId = "fists";
let preparationStep = "monster";
let draggedCardUid = null;
let suppressCardClickUntil = 0;
let pointerCardDrag = null;
let nativeCardDragActive = false;
let mouseCardDrag = null;

function createParts() {
  const output = {};
  Object.keys(partBlueprints).forEach(function (id) {
    const item = partBlueprints[id];
    output[id] = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      maxArmor: item.maxArmor,
      armor: item.maxArmor,
      maxHp: item.maxHp,
      hp: item.maxHp,
    };
  });
  return output;
}

function shuffleItems(items) {
  const output = items.slice();
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    const current = output[index];
    output[index] = output[target];
    output[target] = current;
  }
  return output;
}

function findUniqueCardIndex(drawPile, hand) {
  const handNames = new Set(
    hand.map(function (instance) {
      return instance.cardId;
    }),
  );
  const candidateIndex = drawPile.findIndex(function (instance) {
    return !handNames.has(instance.cardId);
  });
  return candidateIndex;
}

function takeUniqueCard(drawPile, hand) {
  const candidateIndex = findUniqueCardIndex(drawPile, hand);
  if (candidateIndex < 0) {
    return null;
  }
  return drawPile.splice(candidateIndex, 1)[0];
}

function createDeckState() {
  const drawPile = shuffleItems(
    deckRecipe.map(function (cardId, index) {
      return { uid: runToken + "-" + index + "-" + cardId, cardId: cardId };
    }),
  );
  const hand = [];
  openingHandRecipe.forEach(function (cardId) {
    const openingIndex = drawPile.findIndex(function (instance) {
      return instance.cardId === cardId;
    });
    if (openingIndex >= 0) {
      hand.push(drawPile.splice(openingIndex, 1)[0]);
    }
  });
  while (hand.length < MAX_HAND_SIZE && drawPile.length) {
    const nextCard = takeUniqueCard(drawPile, hand);
    if (!nextCard) {
      break;
    }
    hand.push(nextCard);
  }
  const nextDrawIndex = findUniqueCardIndex(drawPile, hand);
  return {
    drawPile: drawPile,
    hand: hand,
    discardPile: [],
    nextDrawUid: nextDrawIndex >= 0 ? drawPile[nextDrawIndex].uid : null,
  };
}

function createInitialState(selectedStyleId, phase) {
  const now = performance.now();
  const deckState = createDeckState();
  return {
    runId: runToken,
    playerHp: MAX_PLAYER_HP,
    bossHp: MAX_BOSS_HP,
    energy: 1,
    parts: createParts(),
    intentIndex: 0,
    intentPressure: 0,
    intentInterrupted: false,
    turnActor: "player",
    actionActor: null,
    actionSerial: 0,
    activeActionId: 0,
    lastAutoActor: null,
    nextTurnAt: now + FIRST_TURN_DELAY,
    lastPlayerActionAt: now,
    nextPlayerAt: now + FIRST_TURN_DELAY,
    playerCycleDuration: FIRST_TURN_DELAY,
    lastFrameAt: now,
    playerAttackSerial: 0,
    interventionActive: false,
    interventionEndsAt: 0,
    interventionShownForAttack: -1,
    soulEnergy: 0,
    ultimateHolding: false,
    ultimateHoldStartedAt: 0,
    ultimateHoldTier: 0,
    ultimateHoldAvailableTier: 0,
    ultimateCancelHovered: false,
    ultimatePointerId: null,
    ultimateInputKey: null,
    ultimateCasting: false,
    ultimateCastStartedAt: 0,
    ultimateCastPauseApplied: 0,
    awakeningActivationPending: false,
    awakeningSelecting: false,
    awakeningSelectedUids: [],
    transforming: false,
    transformStartedAt: 0,
    awakened: false,
    awakenedModules: [],
    awakenedAttacksRemaining: 0,
    awakenedVolleyReleased: false,
    awakenedVideoShown: false,
    bossImpactAt: 0,
    bossStunned: false,
    bossStunStartedAt: 0,
    bossStunEndsAt: 0,
    bossStunPartId: null,
    bossStunAdvanceIntent: false,
    bossStunPausedRemaining: null,
    bossStunResumeActor: "boss",
    actionIndex: 0,
    selectedWeaponId: selectedStyleId || "fists",
    nextEnergyAt: now + ENERGY_INTERVAL,
    nextAutoBonus: 0,
    reactionActive: false,
    reactionChoice: null,
    cardPlayMode: "auto",
    cardTurnResolving: false,
    cardPlayCooldownStartedAt: 0,
    cardPlayCooldownEndsAt: 0,
    cardDragActive: false,
    autoResumeAt: now + FIRST_TURN_DELAY,
    drawPile: deckState.drawPile,
    hand: deckState.hand,
    discardPile: deckState.discardPile,
    nextDrawUid: deckState.nextDrawUid,
    chain: [],
    chainDeadline: 0,
    chainWindow: BASE_CHAIN_WINDOW,
    lastResolvedChain: [],
    lastChainTitle: "",
    armorGuard: 0,
    jetGuard: false,
    moduleBoost: 0,
    videoPending: null,
    videoPlaying: false,
    videoStartedAt: 0,
    activeVideoEffect: null,
    battleUiHidden: false,
    ended: false,
    phase: phase || "preparation",
  };
}

function getIntent() {
  return intentBlueprints[state.intentIndex % intentBlueprints.length];
}

function getCard(cardId) {
  return cards.find(function (card) {
    return card.id === cardId;
  });
}

function reserveNextDraw(announceShuffle) {
  if (!state) {
    return null;
  }

  if (state.nextDrawUid) {
    const reservedCard = state.drawPile.find(function (instance) {
      return instance.uid === state.nextDrawUid;
    });
    if (reservedCard) {
      return reservedCard;
    }
    state.nextDrawUid = null;
  }

  let candidateIndex = findUniqueCardIndex(state.drawPile, state.hand);
  if (candidateIndex < 0 && state.discardPile.length) {
    state.drawPile = shuffleItems(state.drawPile.concat(state.discardPile));
    state.discardPile = [];
    if (announceShuffle) {
      showLog("弃牌重新洗入牌库，下一张补充卡已预载");
    }
    candidateIndex = findUniqueCardIndex(state.drawPile, state.hand);
  }

  if (candidateIndex < 0) {
    return null;
  }
  state.nextDrawUid = state.drawPile[candidateIndex].uid;
  return state.drawPile[candidateIndex];
}

function takeReservedNextDraw(announceShuffle) {
  const reservedCard = reserveNextDraw(announceShuffle);
  if (!reservedCard) {
    return null;
  }
  const reservedIndex = state.drawPile.findIndex(function (instance) {
    return instance.uid === reservedCard.uid;
  });
  if (reservedIndex < 0) {
    state.nextDrawUid = null;
    return null;
  }
  state.nextDrawUid = null;
  return state.drawPile.splice(reservedIndex, 1)[0];
}

function drawOneCardIntoHand(announceShuffle) {
  const nextCard = takeReservedNextDraw(announceShuffle);
  if (!nextCard) {
    return null;
  }
  state.hand.push(nextCard);
  reserveNextDraw(announceShuffle);
  return nextCard;
}

function currentWeaponMode() {
  return weaponModes.find(function (weapon) {
    return weapon.id === state.selectedWeaponId;
  }) || weaponModes[0];
}

function getWeaponCardAffinity(card, weapon) {
  const activeWeapon = weapon || currentWeaponMode();
  if (card.weaponId && card.weaponId === activeWeapon.id) {
    return "linked";
  }
  if (activeWeapon.synergyCards.includes(card.id)) {
    return "linked";
  }
  if (activeWeapon.neutralCards.includes(card.id)) {
    return "neutral";
  }
  return "unlinked";
}

function getWeaponCardLink(card) {
  const weapon = currentWeaponMode();
  const affinity = getWeaponCardAffinity(card, weapon);
  if (affinity === "linked") {
    return { name: weapon.name + "协同", bonus: 0.08 };
  }
  if (affinity === "neutral") {
    return { name: "通用接入", bonus: 0.03 };
  }
  return { name: "独立启动", bonus: 0 };
}

function resetGame(mode) {
  const shouldStartBattle = mode === "battle";
  draggedCardUid = null;
  suppressCardClickUntil = 0;
  pointerCardDrag = null;
  nativeCardDragActive = false;
  mouseCardDrag = null;
  setGmPanelOpen(false, false);
  preparationStep = shouldStartBattle ? "battle" : "monster";
  clearInterval(battleTimer);
  battleTimer = 0;
  clearTimeout(messageTimer);
  clearTimeout(logTimer);
  clearTimeout(resolvedChainTimer);
  if (state && state.ultimateHolding) {
    clearSoulUltimateHoldState();
  }
  hideModuleVideo();
  hideUltimateCinematic();
  runToken += 1;
  state = createInitialState(preparedStyleId, shouldStartBattle ? "battle" : "preparation");
  setBattleUiHidden(false, false);
  ui.gmTools.hidden = !shouldStartBattle;
  ui.resultOverlay.classList.add("hidden");
  ui.battlePreparation.classList.toggle("hidden", shouldStartBattle);
  ui.battlePreparation.setAttribute("aria-hidden", String(shouldStartBattle));
  ui.gameShell.classList.toggle("preparing", !shouldStartBattle);
  ui.commandDeck.classList.remove(
    "locked",
    "intervention-window",
    "intervention-release",
    "ultimate-holding",
    "ultimate-casting",
  );
  ui.gameShell.classList.remove("auto-card-mode", "manual-card-mode");
  ui.battlefield.className = "battlefield";
  ui.effectLayer.innerHTML = "";
  ui.floatingLayer.innerHTML = "";
  ui.battleMessage.classList.remove("visible");
  ui.compactLog.classList.remove("visible");
  renderAll();
  updateCombatStance();
  renderPreparationSelection();
  renderPreparationFlow();
  if (!shouldStartBattle) {
    ui.commandDeck.classList.add("locked");
    ui.autoActionText.textContent = "等待确认拳套流派";
    ui.autoActionBar.style.width = "0%";
    window.requestAnimationFrame(function () {
      ui.preparationMonsterNext.focus({ preventScroll: true });
    });
    return;
  }
  showMessage("自动模式启动：从左到右出牌，技能结算后Boss反击");
  showLog("拖动卡牌可调整自动执行顺序；Boss攻击时只能进行QTE");
  battleTimer = window.setInterval(tickBattle, 80);
}

function renderPreparationFlow() {
  const copy = {
    monster: {
      eyebrow: "战前准备 · 怪物信息",
      title: "先读懂这头巨兽",
      description: "确认Boss的蓄力部位、攻击方式与反制输入，再进入个人装配。",
    },
    loadout: {
      eyebrow: "战前准备 · 个人装配",
      title: "确认你的战斗解法",
      description: "拳套负责持续压制，挂件负责在正确时机改变结果；确认后直接进入战斗。",
    },
    battle: {
      eyebrow: "战前准备完成",
      title: "正在进入战斗",
      description: "敌情与装配均已确认。",
    },
  }[preparationStep];
  const isMonsterStep = preparationStep === "monster";
  const isLoadoutStep = preparationStep === "loadout";
  const order = ["monster", "loadout", "battle"];
  const activeIndex = Math.max(0, order.indexOf(preparationStep));

  ui.battlePreparation.classList.toggle("monster-step", isMonsterStep);
  ui.battlePreparation.classList.toggle("loadout-step", isLoadoutStep);
  ui.preparationEyebrow.textContent = copy.eyebrow;
  ui.preparationTitle.textContent = copy.title;
  ui.preparationDescription.textContent = copy.description;
  ui.preparationMonsterStage.classList.toggle("hidden", !isMonsterStep);
  ui.preparationMonsterStage.setAttribute("aria-hidden", String(!isMonsterStep));
  ui.preparationLoadoutStage.classList.toggle("hidden", !isLoadoutStep);
  ui.preparationLoadoutStage.setAttribute("aria-hidden", String(!isLoadoutStep));
  ui.preparationProgressItems.forEach(function (item) {
    const itemIndex = order.indexOf(item.dataset.preparationProgress);
    const isActive = itemIndex === activeIndex;
    item.classList.toggle("active", isActive);
    item.classList.toggle("completed", itemIndex < activeIndex);
    if (isActive) {
      item.setAttribute("aria-current", "step");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function setPreparationStep(nextStep, shouldFocus) {
  if (
    !state ||
    state.phase !== "preparation" ||
    (nextStep !== "monster" && nextStep !== "loadout")
  ) {
    return;
  }
  preparationStep = nextStep;
  renderPreparationFlow();
  renderStatus();
  if (shouldFocus !== false) {
    window.requestAnimationFrame(function () {
      const focusTarget = nextStep === "monster" ? ui.preparationMonsterNext : ui.preparationConfirm;
      focusTarget.focus({ preventScroll: true });
    });
  }
}

function renderPreparationSelection() {
  const selected = weaponModes.find(function (weapon) {
    return weapon.id === preparedStyleId;
  }) || weaponModes[0];
  ui.preparationStyleName.textContent = selected.name + " · " + selected.style;
  ui.preparationStyleMeta.textContent =
    (selected.attackInterval / 1000).toFixed(1) + "秒 / 次 · " + selected.cadence;
  ui.preparationSelectionName.textContent = selected.name + "流派 · " + selected.style;
  ui.preparationPreviewImage.src = selected.playerSprite;
  ui.preparationPreviewImage.alt = selected.name + "流派战斗化身";
  ui.preparationConfirm.disabled = !availableStyleIds.has(selected.id);
  ui.preparationStyleOptions.forEach(function (button) {
    const isSelected = button.dataset.styleId === selected.id;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function selectPreparedStyle(styleId) {
  if (
    !state ||
    state.phase !== "preparation" ||
    preparationStep !== "loadout" ||
    !availableStyleIds.has(styleId)
  ) {
    return;
  }
  preparedStyleId = styleId;
  renderPreparationSelection();
}

function startPreparedBattle() {
  if (!state || state.phase !== "preparation" || !availableStyleIds.has(preparedStyleId)) {
    return;
  }
  if (preparationStep !== "loadout") {
    setPreparationStep("loadout");
    return;
  }
  preparationStep = "battle";
  renderPreparationFlow();
  state.phase = "launching";
  getAudioContext();
  resetGame("battle");
}

function renderAll() {
  renderStatus();
  renderCombatStyleSummary();
  renderCards();
  renderChain();
  renderIntentBase();
  renderBossParts();
  renderBossSprite();
  renderReactionControls();
  renderSoulUltimate();
}

function renderStatus() {
  const playerPercent = Math.max(0, state.playerHp / MAX_PLAYER_HP) * 100;
  const bossPercent = Math.max(0, state.bossHp / MAX_BOSS_HP) * 100;
  ui.playerHpBar.style.width = playerPercent + "%";
  ui.playerHpText.textContent = Math.max(0, state.playerHp) + " / " + MAX_PLAYER_HP;
  ui.bossHpBar.style.width = bossPercent + "%";
  ui.bossHpText.textContent = Math.max(0, state.bossHp) + " / " + MAX_BOSS_HP;
  const displayedActor = state.actionActor || state.turnActor;
  ui.turnLabel.textContent = state.phase === "preparation"
    ? "战前准备 · " + (preparationStep === "monster" ? "怪物信息" : "个人装配")
    : state.ended
      ? "战斗结束"
      : state.bossStunned
        ? "部位破坏 · Boss眩晕"
      : state.ultimateCasting
        ? "灵魂终结 · 奥义释放"
        : state.ultimateHolding
          ? "灵魂终结 · 蓄力选档"
      : (state.cardPlayMode === "auto" ? "自动出牌" : "主动出牌") +
        " · " + (displayedActor === "player" ? "玩家行动" : "Boss行动");
  ui.energyCells.innerHTML = "";
  for (let index = 0; index < MAX_ENERGY; index += 1) {
    const cell = document.createElement("i");
    if (index < state.energy) {
      cell.classList.add("filled");
    }
    ui.energyCells.appendChild(cell);
  }
  ui.energyText.textContent = state.energy + " / " + MAX_ENERGY;
  ui.cardEnergyCurrent.textContent = state.energy;
  ui.cardEnergyMax.textContent = MAX_ENERGY;
  renderEnergyRecoveryProgress(performance.now());
  ui.energyRate.setAttribute(
    "aria-label",
    "当前战术能量" + state.energy + "点，上限" + MAX_ENERGY + "点",
  );
  renderPlayerStatuses();
  renderSoulUltimate();
  renderCardPlayMode();
  renderGmStatus();
}

function renderGmStatus() {
  if (!state || !ui.gmStatus) {
    return;
  }
  ui.gmStatus.textContent =
    "灵魂 " + Math.round(state.soulEnergy) + "/" + MAX_SOUL_ENERGY +
    " · 能量 " + state.energy + "/" + MAX_ENERGY +
    "\n生命 " + Math.max(0, state.playerHp) + "/" + MAX_PLAYER_HP;
}

function setGmPanelOpen(isOpen, restoreFocus) {
  if (!ui.gmPanel || !ui.gmToggle) {
    return;
  }
  const wasOpen = !ui.gmPanel.hidden;
  const shouldOpen = Boolean(
    isOpen && state && state.phase === "battle" && !state.ended && !state.battleUiHidden,
  );
  ui.gmPanel.hidden = !shouldOpen;
  ui.gmToggle.setAttribute("aria-expanded", String(shouldOpen));
  ui.gmTools.classList.toggle("open", shouldOpen);
  if (shouldOpen) {
    renderGmStatus();
    ui.gmClose.focus({ preventScroll: true });
  } else if (restoreFocus !== false && wasOpen) {
    ui.gmToggle.focus({ preventScroll: true });
  }
}

function setBattleUiHidden(isHidden, announce) {
  if (!ui.gameShell || !ui.gmToggle) {
    return;
  }
  const shouldHide = Boolean(
    isHidden && state && state.phase === "battle" && !state.ended,
  );
  if (state) {
    state.battleUiHidden = shouldHide;
  }
  ui.gameShell.classList.toggle("battle-ui-hidden", shouldHide);
  ui.gmToggle.textContent = shouldHide ? "UI" : "GM";
  ui.gmToggle.setAttribute(
    "aria-label",
    shouldHide ? "显示战斗UI" : "打开GM调试面板",
  );
  ui.gmToggle.title = shouldHide ? "显示战斗UI" : "GM调试";
  if (ui.gmUiToggle) {
    ui.gmUiToggle.textContent = shouldHide ? "显示UI" : "隐藏UI";
    ui.gmUiToggle.setAttribute("aria-pressed", String(shouldHide));
  }
  if (shouldHide) {
    setGmPanelOpen(false, false);
    ui.gmToggle.focus({ preventScroll: true });
  } else if (announce) {
    showMessage("GM：战斗UI已显示");
    showLog("GM 调试 · 战斗UI恢复显示");
  }
}

function applyGmAction(action) {
  if (!state || state.phase !== "battle" || state.ended) {
    return;
  }
  if (state.ultimateHolding) {
    cancelSoulUltimateHold(true);
  }
  if (action === "ui-toggle") {
    const shouldHide = !state.battleUiHidden;
    setBattleUiHidden(shouldHide, !shouldHide);
    return;
  }
  if (state.ultimateCasting) {
    return;
  }
  if (action === "soul-fill") {
    state.soulEnergy = MAX_SOUL_ENERGY;
    showMessage("GM：灵魂能量已补满");
    showLog("GM 调试 · 灵魂能量补满");
  } else if (action === "soul-empty") {
    state.soulEnergy = 0;
    showMessage("GM：灵魂能量已清空");
    showLog("GM 调试 · 灵魂能量清空");
  } else if (action === "energy-fill") {
    state.energy = MAX_ENERGY;
    state.nextEnergyAt = performance.now() + ENERGY_INTERVAL;
    showMessage("GM：战术能量已补满");
    showLog("GM 调试 · 战术能量补满");
  } else if (action === "heal") {
    state.playerHp = MAX_PLAYER_HP;
    showMessage("GM：生命已恢复");
    showLog("GM 调试 · 生命恢复至上限");
  } else if (action === "part-break") {
    let targetId = null;
    for (let offset = 0; offset < intentBlueprints.length; offset += 1) {
      const candidate = intentBlueprints[(state.intentIndex + offset) % intentBlueprints.length].part;
      if (state.parts[candidate].hp > 0) {
        targetId = candidate;
        break;
      }
    }
    if (!targetId) {
      showMessage("GM：所有部位均已破坏");
      return;
    }
    const part = state.parts[targetId];
    damagePart(targetId, Math.max(1, part.hp), part.armor + part.hp * 2);
    showLog("GM 调试 · 一键破坏" + part.name);
    renderBossParts();
    renderBossSprite();
    checkBattleEnd();
  } else {
    return;
  }
  renderStatus();
  updateCardStates(performance.now());
}

function getEnergyRecoveryProgress(now) {
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    state.energy >= MAX_ENERGY
  ) {
    return 0;
  }
  const remaining = Math.max(0, state.nextEnergyAt - now);
  return Math.max(0, Math.min(1, 1 - remaining / ENERGY_INTERVAL));
}

function renderEnergyRecoveryProgress(now) {
  const progress = getEnergyRecoveryProgress(now);
  const chargingIndex = state && state.energy < MAX_ENERGY ? state.energy : -1;
  Array.from(ui.cardEnergyPips.children).forEach(function (pip, index) {
    pip.classList.toggle("filled", index < state.energy);
    pip.classList.toggle(
      "charging",
      state.phase === "battle" && !state.ended && index === chargingIndex,
    );
    pip.style.setProperty(
      "--pip-charge",
      index === chargingIndex ? (progress * 100).toFixed(2) + "%" : "0%",
    );
  });
  ui.cardEnergyPips.style.setProperty(
    "--energy-flow-progress",
    (progress * 100).toFixed(2) + "%",
  );
}

function renderPlayerStatuses() {
  if (!ui.playerStatusStrip) {
    return;
  }
  const weapon = currentWeaponMode();
  const displayedActor = state.actionActor || state.turnActor;
  const statuses = [
    { label: weapon.name + "流派", icon: weapon.icon, tone: "style" },
    {
      label: displayedActor === "player" ? "玩家行动" : "等待Boss行动",
      glyph: displayedActor === "player" ? "▶" : "Ⅱ",
      tone: displayedActor === "player" ? "turn" : "wait",
    },
  ];
  if (state.armorGuard > 0) {
    statuses.push({ label: "战甲承压 " + state.armorGuard, icon: "./assets/armor-overdrive.jpeg", count: state.armorGuard, tone: "armor" });
  }
  if (state.jetGuard) {
    statuses.push({ label: "喷气闪避待命", icon: "./assets/jet.png", tone: "jet" });
  }
  if (state.moduleBoost > 0) {
    statuses.push({ label: "挂件强化 " + state.moduleBoost, icon: "./assets/arc-reactor.jpeg", count: state.moduleBoost, tone: "boost" });
  }
  if (state.awakenedAttacksRemaining > 0) {
    statuses.push({
      label: "灵魂战甲 " + state.awakenedAttacksRemaining,
      icon: "./assets/soul-armor-skill.jpg",
      count: state.awakenedAttacksRemaining,
      tone: "awakened",
    });
  }
  ui.playerStatusStrip.innerHTML = "";
  statuses.slice(0, 6).forEach(function (status) {
    const item = document.createElement("span");
    item.className = "fighter-status-item " + status.tone;
    item.title = status.label;
    item.setAttribute("aria-label", status.label);
    if (status.icon) {
      const image = document.createElement("img");
      image.src = status.icon;
      image.alt = "";
      item.appendChild(image);
    } else {
      item.textContent = status.glyph;
    }
    if (status.count && status.count > 1) {
      const count = document.createElement("b");
      count.textContent = status.count;
      item.appendChild(count);
    }
    ui.playerStatusStrip.appendChild(item);
  });
  ui.playerStatusStrip.setAttribute(
    "aria-label",
    statuses.map(function (status) { return status.label; }).join("，"),
  );
}

function syncCombatStylePresentation(weapon) {
  ui.autoWeaponIcon.src = weapon.icon;
  ui.autoWeaponName.textContent = weapon.name + " · " + weapon.style;
  ui.combatStyleSummary.title = "当前出战流派：" + weapon.name + " · " + weapon.style;
  ui.combatStyleSummary.setAttribute("aria-label", "当前出战流派：" + weapon.name + "，战前已锁定");
  ui.weaponCadenceText.textContent = weapon.cadence + " · " + (weapon.attackInterval / 1000).toFixed(1) + "秒蓄势";
  ui.weaponAttackRing.style.setProperty("--weapon-color", weapon.color);
  ui.gameShell.style.setProperty("--active-weapon-color", weapon.color);
  ui.battlefield.style.setProperty("--weapon-attack-duration", weapon.recoverDelay + "ms");
  ui.battleWeaponIcon.src = weapon.icon;
  ui.battleWeaponName.textContent = weapon.name + " · " + weapon.style;
  ui.playerImage.src = weapon.playerSprite;
  ui.playerImage.alt = "使用" + weapon.name + "的玩家战斗化身";
  weaponModes.forEach(function (mode) {
    ui.battlefield.classList.remove("weapon-mode-" + mode.id);
  });
  ui.battlefield.classList.add("weapon-mode-" + weapon.id);
}

function renderCombatStyleSummary() {
  syncCombatStylePresentation(currentWeaponMode());
}

function renderNextCardPreview() {
  const nextInstance = reserveNextDraw(false);
  const nextCard = nextInstance ? getCard(nextInstance.cardId) : null;
  const hasNextCard = Boolean(nextCard);
  ui.nextCardPreview.hidden = !hasNextCard;
  ui.nextCardPreview.classList.toggle("empty", !hasNextCard);
  ui.nextCardPreview.setAttribute("aria-hidden", String(!hasNextCard));
  if (!nextCard) {
    ui.nextCardPreview.setAttribute("aria-label", "暂无可补充卡牌");
    return;
  }

  ui.nextCardPreview.style.setProperty("--next-card-color", nextCard.color);
  ui.nextCardImage.src = nextCard.icon;
  ui.nextCardImage.alt = "";
  ui.nextCardCost.textContent = nextCard.cost;
  ui.nextCardName.textContent = nextCard.name;
  ui.nextCardPreview.setAttribute(
    "aria-label",
    "下一张补充卡牌：" + nextCard.name + "，消耗" + nextCard.cost + "点能量",
  );
}

function isBossActionLocked() {
  return Boolean(state && (state.actionActor === "boss" || state.reactionActive));
}

function isCardResolutionLocked() {
  return Boolean(
    state && (
      state.cardTurnResolving ||
      state.videoPlaying ||
      state.videoPending ||
      state.ultimateHolding ||
      state.ultimateCasting ||
      isBossActionLocked()
    )
  );
}

function isCardReorderLocked() {
  return Boolean(
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    state.turnActor !== "player" ||
    isCardResolutionLocked()
  );
}

function isPlayerCardWindowOpen(now) {
  const currentTime = typeof now === "number" ? now : performance.now();
  const stunFree = hasBossStunFreeCards(currentTime);
  if (state && state.bossStunned && !stunFree) {
    return false;
  }
  if (state && state.cardPlayMode === "auto" && isCardPlayCooldownActive(currentTime)) {
    return false;
  }
  return Boolean(
    state &&
    state.phase === "battle" &&
    !state.ended &&
    state.turnActor === "player" &&
    !isCardResolutionLocked() &&
    !state.cardDragActive &&
    (stunFree || currentTime >= state.nextTurnAt)
  );
}

function renderCardPlayMode() {
  if (!state || !ui.cardModeSwitch) {
    return;
  }
  const isAuto = state.cardPlayMode === "auto";
  const modeLocked =
    state.phase !== "battle" ||
    state.ended ||
    isCardResolutionLocked();
  ui.gameShell.classList.toggle("auto-card-mode", isAuto);
  ui.gameShell.classList.toggle("manual-card-mode", !isAuto);
  ui.cardModeSwitch.classList.toggle("locked", modeLocked);
  ui.cardModeSwitch.dataset.mode = state.cardPlayMode;
  ui.cardModeButtons.forEach(function (button) {
    const selected = button.dataset.cardPlayMode === state.cardPlayMode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = modeLocked;
    button.title = modeLocked ? "当前动作结算中，结束后可切换出牌模式" : "切换出牌模式";
  });
}

function setCardPlayMode(mode, announce) {
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    (mode !== "auto" && mode !== "manual") ||
    state.cardPlayMode === mode
  ) {
    return;
  }
  state.cardPlayMode = mode;
  state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
  if (mode === "auto" && state.turnActor === "player" && !state.bossStunned) {
    state.nextTurnAt = Math.max(state.nextTurnAt, state.autoResumeAt);
    state.nextPlayerAt = Math.max(state.nextPlayerAt, state.nextTurnAt);
  }
  renderCardPlayMode();
  updateCardStates(performance.now());
  if (announce !== false) {
    const label = mode === "auto" ? "自动" : "主动";
    showMessage(label + "出牌模式已启用");
    showLog(
      mode === "auto"
        ? "自动模式：严格执行最左侧卡牌，拖动可调整优先级"
        : "主动模式：玩家自主选择卡牌，Boss攻击期间仍会锁牌",
    );
  }
}

function clearCardDragVisuals() {
  ui.cardHand.classList.remove("drag-active");
  ui.cardHand.querySelectorAll(".card-dragging, .drag-before, .drag-after").forEach(function (button) {
    button.classList.remove("card-dragging", "drag-before", "drag-after");
  });
}

function finishCardDrag(cancelled) {
  if (!state) {
    return;
  }
  state.cardDragActive = false;
  state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
  draggedCardUid = null;
  pointerCardDrag = null;
  nativeCardDragActive = false;
  mouseCardDrag = null;
  suppressCardClickUntil = performance.now() + (cancelled ? 180 : 320);
  clearCardDragVisuals();
  updateCardStates(performance.now());
}

function announceCardOrder(uid) {
  if (!ui.cardOrderStatus) {
    return;
  }
  const index = state.hand.findIndex(function (instance) { return instance.uid === uid; });
  const instance = index >= 0 ? state.hand[index] : null;
  const card = instance ? getCard(instance.cardId) : null;
  if (card) {
    ui.cardOrderStatus.textContent = card.name + "已移动到第" + (index + 1) + "位";
  }
}

function moveHandCard(uid, targetUid, placeAfter) {
  if (isCardReorderLocked()) {
    return false;
  }
  const fromIndex = state.hand.findIndex(function (instance) { return instance.uid === uid; });
  if (fromIndex < 0) {
    return false;
  }
  const moved = state.hand.splice(fromIndex, 1)[0];
  let targetIndex = targetUid
    ? state.hand.findIndex(function (instance) { return instance.uid === targetUid; })
    : state.hand.length;
  if (targetIndex < 0) {
    targetIndex = state.hand.length;
  } else if (placeAfter) {
    targetIndex += 1;
  }
  state.hand.splice(targetIndex, 0, moved);
  state.cardDragActive = false;
  draggedCardUid = null;
  pointerCardDrag = null;
  nativeCardDragActive = false;
  mouseCardDrag = null;
  state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
  suppressCardClickUntil = performance.now() + 320;
  renderCards();
  announceCardOrder(uid);
  window.requestAnimationFrame(function () {
    const movedButton = ui.cardHand.querySelector('[data-card-instance="' + uid + '"]');
    if (movedButton) {
      movedButton.focus({ preventScroll: true });
    }
  });
  return true;
}

function moveHandCardByOffset(uid, offset) {
  if (isCardReorderLocked()) {
    return false;
  }
  const fromIndex = state.hand.findIndex(function (instance) { return instance.uid === uid; });
  const targetIndex = Math.max(0, Math.min(state.hand.length - 1, fromIndex + offset));
  if (fromIndex < 0 || targetIndex === fromIndex) {
    return false;
  }
  const targetUid = state.hand[targetIndex].uid;
  return moveHandCard(uid, targetUid, offset > 0);
}

function renderCards() {
  if (state) {
    state.cardDragActive = false;
  }
  if (suppressCardClickUntil === Number.POSITIVE_INFINITY) {
    suppressCardClickUntil = performance.now() + 180;
  }
  draggedCardUid = null;
  pointerCardDrag = null;
  nativeCardDragActive = false;
  mouseCardDrag = null;
  clearCardDragVisuals();
  ui.cardHand.innerHTML = "";
  state.hand.forEach(function (instance, index) {
    const card = getCard(instance.cardId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "module-card live-card" + (card.weaponId ? " weapon-skill-card" : "");
    button.style.setProperty("--card-color", card.color);
    button.dataset.cardId = card.id;
    button.dataset.cardInstance = instance.uid;
    button.draggable = false;
    button.setAttribute("aria-posinset", String(index + 1));
    button.setAttribute("aria-setsize", String(state.hand.length));
    button.setAttribute("aria-keyshortcuts", "Alt+ArrowLeft Alt+ArrowRight");
    button.title = card.summary;
    button.innerHTML =
      '<img src="' +
      card.icon +
      '" alt="" /><div class="card-copy"><strong>' +
      card.name +
      '</strong><span class="card-tags"><b>' +
      card.role +
      '</b><i>' +
      card.type +
      '</i></span></div><span class="weapon-fit"></span><span class="card-cost"><b>' +
      card.cost +
      '</b></span><i class="card-energy-shadow" aria-hidden="true"></i>' +
      '<i class="card-ready-flare" aria-hidden="true"></i>';
    button.addEventListener("click", function () {
      if (performance.now() < suppressCardClickUntil) {
        return;
      }
      if (state.cardPlayMode === "auto") {
        showMessage("自动模式按左起顺序出牌，拖动卡牌可调整优先级");
        return;
      }
      activateCard(instance.uid, button, "manual");
    });
    button.addEventListener("mousedown", function (event) {
      if (
        event.button !== 0 ||
        mouseCardDrag ||
        pointerCardDrag ||
        nativeCardDragActive ||
        isCardReorderLocked()
      ) {
        return;
      }
      state.cardDragActive = true;
      state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
      mouseCardDrag = {
        uid: instance.uid,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
      };
    });
    button.addEventListener("pointerdown", function (event) {
      if (
        event.button !== 0 ||
        event.pointerType === "mouse" ||
        pointerCardDrag ||
        nativeCardDragActive ||
        isCardReorderLocked()
      ) {
        return;
      }
      state.cardDragActive = true;
      state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
      pointerCardDrag = {
        uid: instance.uid,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
      };
      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture is optional; desktop pointer events still provide the drag path.
      }
    });
    button.addEventListener("pointermove", function (event) {
      if (
        !pointerCardDrag ||
        pointerCardDrag.uid !== instance.uid ||
        pointerCardDrag.pointerId !== event.pointerId ||
        isCardReorderLocked()
      ) {
        return;
      }
      const distance = Math.hypot(
        event.clientX - pointerCardDrag.startX,
        event.clientY - pointerCardDrag.startY,
      );
      const dragThreshold = event.pointerType === "touch" ? 16 : 8;
      if (!pointerCardDrag.active && distance < dragThreshold) {
        return;
      }
      pointerCardDrag.active = true;
      draggedCardUid = pointerCardDrag.uid;
      suppressCardClickUntil = Number.POSITIVE_INFINITY;
      button.classList.add("card-dragging");
      ui.cardHand.classList.add("drag-active");
      ui.cardHand.querySelectorAll(".drag-before, .drag-after").forEach(function (candidate) {
        candidate.classList.remove("drag-before", "drag-after");
      });
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const target = hit ? hit.closest(".module-card[data-card-instance]") : null;
      if (target && target.dataset.cardInstance !== pointerCardDrag.uid) {
        const rect = target.getBoundingClientRect();
        const placeAfter = event.clientX > rect.left + rect.width / 2;
        target.classList.toggle("drag-before", !placeAfter);
        target.classList.toggle("drag-after", placeAfter);
      }
      event.preventDefault();
    });
    button.addEventListener("pointerup", function (event) {
      if (
        !pointerCardDrag ||
        pointerCardDrag.uid !== instance.uid ||
        pointerCardDrag.pointerId !== event.pointerId
      ) {
        return;
      }
      const wasActive = pointerCardDrag.active;
      const sourceUid = pointerCardDrag.uid;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const target = hit ? hit.closest(".module-card[data-card-instance]") : null;
      pointerCardDrag = null;
      try {
        if (button.hasPointerCapture(event.pointerId)) {
          button.releasePointerCapture(event.pointerId);
        }
      } catch (error) {
        // The pointer may already have been released by the browser.
      }
      if (!wasActive) {
        state.cardDragActive = false;
        draggedCardUid = null;
        return;
      }
      event.preventDefault();
      if (target && target.dataset.cardInstance !== sourceUid) {
        const rect = target.getBoundingClientRect();
        moveHandCard(sourceUid, target.dataset.cardInstance, event.clientX > rect.left + rect.width / 2);
      } else if (hit && hit.closest(".card-hand")) {
        const handRect = ui.cardHand.getBoundingClientRect();
        const moveToEnd = event.clientX >= handRect.left + handRect.width / 2;
        const edgeInstance = moveToEnd ? state.hand[state.hand.length - 1] : state.hand[0];
        if (edgeInstance && edgeInstance.uid !== sourceUid) {
          moveHandCard(sourceUid, edgeInstance.uid, moveToEnd);
        } else {
          finishCardDrag(true);
        }
      } else {
        finishCardDrag(true);
      }
    });
    button.addEventListener("pointercancel", function (event) {
      if (pointerCardDrag && pointerCardDrag.pointerId === event.pointerId) {
        const wasActive = pointerCardDrag.active;
        pointerCardDrag = null;
        if (nativeCardDragActive) {
          return;
        } else if (wasActive) {
          finishCardDrag(true);
        } else {
          state.cardDragActive = false;
        }
      }
    });
    button.addEventListener("lostpointercapture", function () {
      if (pointerCardDrag && pointerCardDrag.uid === instance.uid) {
        const wasActive = pointerCardDrag.active;
        pointerCardDrag = null;
        if (nativeCardDragActive) {
          return;
        } else if (wasActive) {
          finishCardDrag(true);
        } else {
          state.cardDragActive = false;
        }
      }
    });
    button.addEventListener("dragstart", function (event) {
      if (isCardReorderLocked()) {
        event.preventDefault();
        return;
      }
      nativeCardDragActive = true;
      pointerCardDrag = null;
      draggedCardUid = instance.uid;
      state.cardDragActive = true;
      state.autoResumeAt = performance.now() + AUTO_MODE_RESUME_DELAY;
      suppressCardClickUntil = Number.POSITIVE_INFINITY;
      button.classList.add("card-dragging");
      ui.cardHand.classList.add("drag-active");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", instance.uid);
      }
    });
    button.addEventListener("dragover", function (event) {
      if (!nativeCardDragActive || !draggedCardUid || isCardReorderLocked()) {
        return;
      }
      event.preventDefault();
      ui.cardHand.querySelectorAll(".drag-before, .drag-after").forEach(function (candidate) {
        candidate.classList.remove("drag-before", "drag-after");
      });
      if (draggedCardUid !== instance.uid) {
        const rect = button.getBoundingClientRect();
        const placeAfter = event.clientX > rect.left + rect.width / 2;
        button.classList.toggle("drag-before", !placeAfter);
        button.classList.toggle("drag-after", placeAfter);
      }
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });
    button.addEventListener("drop", function (event) {
      if (!nativeCardDragActive || !draggedCardUid || isCardReorderLocked()) {
        return;
      }
      event.preventDefault();
      const sourceUid = draggedCardUid;
      if (sourceUid === instance.uid) {
        finishCardDrag(true);
        return;
      }
      const rect = button.getBoundingClientRect();
      moveHandCard(sourceUid, instance.uid, event.clientX > rect.left + rect.width / 2);
    });
    button.addEventListener("dragend", function () {
      if (nativeCardDragActive || state.cardDragActive) {
        finishCardDrag(true);
      }
    });
    button.addEventListener("keydown", function (event) {
      if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
        return;
      }
      event.preventDefault();
      moveHandCardByOffset(instance.uid, event.key === "ArrowLeft" ? -1 : 1);
    });
    button.addEventListener("animationend", function (event) {
      if (event.animationName === "card-energy-ready-glow") {
        button.classList.remove("energy-ready-flash");
      }
    });
    ui.cardHand.appendChild(button);
  });
  renderNextCardPreview();
  updateCardStates(performance.now());
}

function selectedAwakeningInstances() {
  return state.awakeningSelectedUids
    .map(function (uid) {
      return state.hand.find(function (instance) {
        return instance.uid === uid;
      });
    })
    .filter(Boolean);
}

function selectedAwakeningCards() {
  return selectedAwakeningInstances().map(function (instance) {
    return getCard(instance.cardId);
  });
}

function selectedAwakeningCost() {
  return selectedAwakeningCards().reduce(function (total, card) {
    return total + card.cost;
  }, 0);
}

function hasBossStunFreeCards(now) {
  const currentTime = typeof now === "number" ? now : performance.now();
  return Boolean(
    state &&
    state.phase === "battle" &&
    !state.ended &&
    state.bossStunned &&
    state.bossStunEndsAt > currentTime
  );
}

function isCardPlayCooldownActive(now) {
  const currentTime = typeof now === "number" ? now : performance.now();
  return Boolean(state && state.cardPlayCooldownEndsAt > currentTime);
}

function getCardPlayCooldownRatio(now) {
  const currentTime = typeof now === "number" ? now : performance.now();
  if (!isCardPlayCooldownActive(currentTime)) {
    return 0;
  }
  const duration = Math.max(1, state.cardPlayCooldownEndsAt - state.cardPlayCooldownStartedAt);
  return Math.max(
    0,
    Math.min(1, (state.cardPlayCooldownEndsAt - currentTime) / duration),
  );
}

function startCardPlayCooldown(now, duration) {
  const currentTime = typeof now === "number" ? now : performance.now();
  const cooldownDuration = Math.max(0, Number(duration) || 0);
  state.cardPlayCooldownStartedAt = currentTime;
  state.cardPlayCooldownEndsAt = currentTime + cooldownDuration;
}

function clearCardPlayCooldown() {
  if (!state) {
    return;
  }
  state.cardPlayCooldownStartedAt = 0;
  state.cardPlayCooldownEndsAt = 0;
}

function updateCardStates(now) {
  const currentTime = typeof now === "number" ? now : performance.now();
  const resolutionLocked = isCardResolutionLocked();
  const bossActionLocked = isBossActionLocked();
  const battleActive = state.phase === "battle" && !state.ended;
  const freeDuringBossStun = hasBossStunFreeCards(currentTime);
  const playCooldownRatio = state.cardPlayMode === "auto"
    ? getCardPlayCooldownRatio(currentTime)
    : 0;
  const playCooldownActive = playCooldownRatio > 0;
  const playerWindowOpen = isPlayerCardWindowOpen(currentTime);
  renderCardPlayMode();
  state.hand.forEach(function (instance, index) {
    const card = getCard(instance.cardId);
    const weapon = currentWeaponMode();
    const affinity = getWeaponCardAffinity(card, weapon);
    const button = ui.cardHand.querySelector('[data-card-instance="' + instance.uid + '"]');
    if (!button) {
      return;
    }
    const lacksEnergy = !freeDuringBossStun && card.cost > state.energy;
    const visualEnergy = Math.min(
      MAX_ENERGY,
      state.energy + getEnergyRecoveryProgress(currentTime),
    );
    const energyRatio = freeDuringBossStun
      ? 1
      : card.cost > 0
        ? Math.min(1, visualEnergy / card.cost)
        : 1;
    const energyAccess = freeDuringBossStun ? "free" : lacksEnergy ? "locked" : "ready";
    const previousEnergyAccess = instance.energyAccessState;
    const fixedTargetParts = Array.isArray(card.targetParts) ? card.targetParts : [];
    const targetPartId = fixedTargetParts.length > 1
      ? "multi"
      : fixedTargetParts.length === 1
        ? fixedTargetParts[0]
        : card.targetsIntentPart
          ? getIntent().part
          : "general";
    const fitLabel = button.querySelector(".weapon-fit");
    const costLabel = button.querySelector(".card-cost b");
    const cardShadowRatio = Math.max(1 - energyRatio, playCooldownRatio);
    button.style.setProperty(
      "--energy-shadow-height",
      (cardShadowRatio * 100).toFixed(2) + "%",
    );
    if (lacksEnergy) {
      button.classList.remove("energy-ready-flash");
    }
    if (
      (previousEnergyAccess === "locked" && energyAccess === "ready") ||
      (previousEnergyAccess !== "free" && energyAccess === "free")
    ) {
      instance.energyReadyFlashPending = true;
    }
    if (
      instance.energyReadyFlashPending &&
      energyAccess !== "locked" &&
      battleActive &&
      !resolutionLocked &&
      !playCooldownActive &&
      playerWindowOpen
    ) {
      button.classList.remove("energy-ready-flash");
      void button.offsetWidth;
      button.classList.add("energy-ready-flash");
      instance.energyReadyFlashPending = false;
    }
    instance.energyAccessState = energyAccess;
    const canPlayNow = playerWindowOpen && !lacksEnergy;
    button.disabled = !battleActive || resolutionLocked || state.turnActor !== "player";
    button.draggable = false;
    button.removeAttribute("aria-disabled");
    button.classList.toggle("energy-locked", lacksEnergy);
    button.classList.toggle("play-cooldown", playCooldownActive);
    button.classList.toggle("stun-free-cast", freeDuringBossStun);
    button.classList.toggle("card-ready", canPlayNow);
    button.classList.toggle("auto-priority", state.cardPlayMode === "auto" && index === 0);
    button.classList.toggle("auto-controlled", state.cardPlayMode === "auto");
    button.classList.toggle("interaction-locked", resolutionLocked);
    button.classList.remove("awakening-selectable", "awakening-selected");
    button.classList.toggle("weapon-linked", affinity === "linked");
    button.classList.toggle("weapon-neutral", affinity === "neutral");
    button.classList.toggle("weapon-unlinked", affinity === "unlinked");
    button.classList.remove("target-arms", "target-core", "target-legs", "target-multi", "target-general");
    button.classList.add("target-" + targetPartId);
    if (fitLabel) {
      fitLabel.textContent = targetPartId === "multi"
        ? "全"
        : targetPartId === "general"
          ? "通用"
          : partBlueprints[targetPartId].name;
    }
    if (costLabel) {
      costLabel.textContent = freeDuringBossStun ? "0" : card.cost;
    }
    const stateDescription = !battleActive
      ? "等待开战"
      : bossActionLocked
        ? "Boss攻击中，仅可进行QTE"
      : state.cardTurnResolving
        ? "技能结算中"
      : playCooldownActive
        ? "出牌冷却中"
      : state.ultimateHolding
        ? "终结技蓄力中"
        : state.ultimateCasting
          ? "终结技释放中"
          : freeDuringBossStun
            ? "Boss倒地，免费释放"
          : lacksEnergy
            ? "能量不足"
          : !playerWindowOpen
            ? "等待玩家出牌阶段"
          : state.cardPlayMode === "auto"
            ? index === 0 ? "自动队列下一张" : "自动队列第" + (index + 1) + "张"
            : "可主动释放";
    button.setAttribute(
      "aria-label",
      card.name + "，" +
        (freeDuringBossStun ? "本次不消耗战术能量，" : "消耗" + card.cost + "点战术能量，") +
        stateDescription,
    );
    button.title = !battleActive
      ? "进入战斗后可使用 · " + card.summary
      : bossActionLocked
        ? "Boss攻击中：只能进行QTE，暂不可出牌或排序"
      : resolutionLocked
        ? "当前动作结算中 · " + card.summary
      : playCooldownActive
        ? "出牌间隔冷却中 · " + card.summary
      : state.cardPlayMode === "auto"
        ? (index === 0 ? "自动队列下一张 · " : "自动队列第" + (index + 1) + "张 · ") + "拖动可调整顺序"
        : freeDuringBossStun
          ? "Boss倒地 · 免费释放 · " + card.summary
        : lacksEnergy
          ? "战术能量不足 · " + card.summary
          : "点击立即激活 · " + card.summary;
  });
}

function drawNextCard() {
  if (state.hand.length >= MAX_HAND_SIZE || state.ended) {
    return false;
  }

  const nextCard = drawOneCardIntoHand(true);
  renderCards();
  return Boolean(nextCard);
}

function sortAwakeningModules(modules) {
  const priority = { reactor: 0, armor: 1, jet: 2, gourd: 3, cannon: 4, drone: 5 };
  return modules.slice().sort(function (left, right) {
    return priority[left.id] - priority[right.id];
  });
}

function moduleSequenceMarkup(modules) {
  return sortAwakeningModules(modules)
    .map(function (card, index) {
      const arrow = index
        ? '<span class="module-sequence-arrow" aria-hidden="true">→</span>'
        : "";
      return arrow + moduleIconMarkup(card);
    })
    .join("");
}

function describeAwakeningSequence(modules) {
  const ordered = sortAwakeningModules(modules);
  if (!ordered.length) {
    return {
      title: "选择本次唤醒部件",
      effect: "选择后将按实际介入顺序预览协同路径",
    };
  }
  if (ordered.length === 1) {
    return {
      title: ordered[0].name + " · 独立接入",
      effect: ordered[0].role + "部件将在首轮攻击中独立生效",
    };
  }
  const relations = ordered.slice(1).map(function (card, index) {
    const previous = ordered[index];
    const rule = linkRules[previous.id + ">" + card.id];
    return rule ? rule.name : previous.role + "接续" + card.role;
  });
  return {
    title: ordered.map(function (card) { return card.name; }).join(" → "),
    effect: relations.join(" · ") + "，将按此路径自动介入",
  };
}

function renderChain() {
  if (!state || !ui.liveHint) {
    return;
  }
  if (state.chain.length) {
    const names = state.chain.map(function (entry) {
      return entry.card.name;
    });
    ui.liveHint.textContent =
      names.join(" → ") + " · " + state.chain.length + "段连携建立中";
  } else if (
    state.phase === "battle" &&
    !state.ended &&
    !state.ultimateHolding &&
    !state.ultimateCasting &&
    !state.cardTurnResolving &&
    !state.lastResolvedChain.length
  ) {
    ui.liveHint.textContent = "挂件卡随时释放 · 长按终结技逐档蓄力";
  }
}

function hasAwakenedModule(cardId) {
  return state.awakenedModules.some(function (card) {
    return card.id === cardId;
  });
}

function canBeginAwakening() {
  return (
    !state.ended &&
    state.awakening >= MAX_AWAKENING &&
    !state.videoPending &&
    !state.videoPlaying &&
    !state.awakeningActivationPending &&
    !state.awakeningSelecting &&
    !state.transforming &&
    !state.awakened
  );
}

function canOpenAwakeningSelection() {
  return (
    !state.ended &&
    state.awakening >= MAX_AWAKENING &&
    !state.actionActor &&
    !state.reactionActive &&
    !state.videoPending &&
    !state.videoPlaying &&
    !state.awakeningSelecting &&
    !state.transforming &&
    !state.awakened
  );
}

function moduleIconMarkup(card, index) {
  return (
    '<span class="awakened-module-icon" style="--module-color:' +
    card.color +
    '"><img src="' +
    card.icon +
    '" alt="" /><b>' +
    (typeof index === "number" ? index + 1 : "") +
    '</b><small>' +
    card.name +
    "</small></span>"
  );
}

function renderAwakening() {
  if (!state || !ui.awakeningButton) {
    return;
  }
  const percent = Math.max(0, Math.min(100, (state.awakening / MAX_AWAKENING) * 100));
  const selectedCards = selectedAwakeningCards();
  const selectedCost = selectedAwakeningCost();
  const ready = state.awakening >= MAX_AWAKENING;
  const tierName =
    state.awakenedModules.length >= 3
      ? "核心形态联动"
      : state.awakenedModules.length === 2
        ? "双部件协同"
        : "局部唤醒";

  ui.awakeningBar.style.width = percent + "%";
  ui.awakeningRing.style.setProperty("--awakening-progress", percent + "%");
  ui.awakeningText.textContent = Math.round(state.awakening) + " / " + MAX_AWAKENING;
  ui.awakeningButton.disabled = !canBeginAwakening();
  ui.awakeningButton.classList.toggle(
    "ready",
    ready && !state.awakeningSelecting && !state.transforming && !state.awakened,
  );
  ui.awakeningButton.classList.toggle("active", state.awakened);
  ui.awakeningButtonLabel.textContent = state.awakeningSelecting
    ? "选择唤醒部件"
    : state.transforming
      ? "核心展开中"
      : state.awakened
        ? tierName
        : state.awakeningActivationPending
          ? "等待动作结束"
        : ready
          ? "手动激活"
          : "自动积累中";
  ui.awakeningButton.setAttribute(
    "aria-label",
    state.awakened
      ? "战甲状态生效，剩余" + state.awakenedAttacksRemaining + "回合"
      : "战甲唤醒进度" + Math.round(percent) + "%",
  );

  ui.awakeningSelectionCount.textContent = selectedCards.length
    ? selectedCards.length + "个部件 · " + (selectedCards.length > 1 ? "协同路径" : "独立接入")
    : "未选择 · 最多" + MAX_AWAKENING_SELECTION + "个";
  ui.awakeningSelectionCost.textContent = "消耗 " + selectedCost + " / " + state.energy;
  ui.awakeningConfirm.disabled = !selectedCards.length || selectedCost > state.energy;

  ui.awakenedStatus.classList.toggle("hidden", !state.awakened);
  if (state.awakened) {
    const orderedModules = sortAwakeningModules(state.awakenedModules);
    ui.awakenedStatusName.textContent =
      orderedModules.length > 1 ? "协同路径已装载" : orderedModules[0].name + "已唤醒";
    ui.awakenedStatusModules.innerHTML = moduleSequenceMarkup(orderedModules);
    ui.awakenedTurns.textContent =
      state.awakenedAttacksRemaining === AWAKENED_PLAYER_TURNS ? "待介入" : "待终结";
  }

  const persistentCards = state.awakeningSelecting ? selectedCards : state.awakenedModules;
  ui.playerUnit.querySelectorAll(".module-socket").forEach(function (socket) {
    const active = persistentCards.some(function (card) {
      return card.id === socket.dataset.socket;
    });
    socket.classList.toggle("selected", active && state.awakeningSelecting);
    socket.classList.toggle("awakened", active && (state.awakened || state.transforming));
  });
  ui.playerUnit.classList.toggle(
    "armor-module-active",
    persistentCards.some(function (card) {
      return card.id === "armor";
    }),
  );
  ui.droneUnit.classList.toggle(
    "selected",
    persistentCards.some(function (card) {
      return card.id === "drone";
    }),
  );
}

function soulTierForEnergy(value) {
  return Math.max(0, Math.min(4, Math.floor(value / SOUL_TIER_COST)));
}

function getUltimateTier(tier) {
  return ultimateTiers[Math.max(0, Math.min(3, tier - 1))] || ultimateTiers[0];
}

function canStartSoulUltimate() {
  return Boolean(
    state &&
    state.phase === "battle" &&
    !state.ended &&
    !state.ultimateHolding &&
    !state.ultimateCasting &&
    !state.cardTurnResolving &&
    !state.actionActor &&
    !state.reactionActive &&
    !state.videoPending &&
    !state.videoPlaying &&
    soulTierForEnergy(state.soulEnergy) > 0
  );
}

function renderSoulUltimate(now) {
  if (!state || !ui.soulUltimateButton) {
    return;
  }
  const currentTime = typeof now === "number" ? now : performance.now();
  const availableTier = soulTierForEnergy(state.soulEnergy);
  const selectedTier = state.ultimateHolding ? state.ultimateHoldTier : availableTier;
  const selectedUltimate = selectedTier > 0 ? getUltimateTier(selectedTier) : null;
  const heldFor = state.ultimateHolding
    ? Math.max(0, currentTime - state.ultimateHoldStartedAt)
    : 0;
  const holdProgress = state.ultimateHolding
    ? Math.min(1, heldFor / (ULTIMATE_MIN_HOLD_MS + ULTIMATE_TIER_HOLD_MS * 3))
    : 0;
  let holdPreviewCost = 0;
  if (state.ultimateHolding) {
    holdPreviewCost = heldFor < ULTIMATE_MIN_HOLD_MS
      ? (heldFor / ULTIMATE_MIN_HOLD_MS) * SOUL_TIER_COST
      : SOUL_TIER_COST +
        ((heldFor - ULTIMATE_MIN_HOLD_MS) / ULTIMATE_TIER_HOLD_MS) * SOUL_TIER_COST;
    holdPreviewCost = Math.min(
      state.ultimateHoldAvailableTier * SOUL_TIER_COST,
      holdPreviewCost,
    );
  }
  const previewSoulEnergy = state.ultimateCancelHovered
    ? state.soulEnergy
    : Math.max(0, state.soulEnergy - holdPreviewCost);

  ui.soulUltimateButton.style.setProperty("--ultimate-hold-progress", holdProgress * 100 + "%");
  ui.soulUltimateButton.style.setProperty(
    "--ultimate-tier-color",
    selectedUltimate ? selectedUltimate.color : "#efb761",
  );
  ui.soulUltimateButton.disabled = !canStartSoulUltimate() && !state.ultimateHolding;
  ui.soulUltimateButton.classList.toggle(
    "ready",
    availableTier > 0 && !state.ultimateHolding && !state.ultimateCasting && state.phase === "battle",
  );
  ui.soulUltimateButton.classList.toggle("holding", state.ultimateHolding);
  ui.soulUltimateButton.classList.toggle(
    "cancel-hover",
    state.ultimateHolding && state.ultimateCancelHovered,
  );
  ui.soulUltimateButton.classList.toggle("casting", state.ultimateCasting);
  ui.soulUltimateButton.classList.toggle("fully-charged", availableTier === 4);
  ui.soulUltimateButton.dataset.tier = String(selectedTier);
  ui.soulTierMarks.forEach(function (mark, index) {
    const tier = index + 1;
    const segmentStart = index * SOUL_TIER_COST;
    const baseFill = Math.max(
      0,
      Math.min(1, (state.soulEnergy - segmentStart) / SOUL_TIER_COST),
    );
    const previewFill = Math.max(
      0,
      Math.min(1, (previewSoulEnergy - segmentStart) / SOUL_TIER_COST),
    );
    mark.style.setProperty("--segment-fill-angle", (previewFill * 82).toFixed(2) + "deg");
    mark.classList.toggle("unlocked", previewFill >= 0.999);
    mark.classList.toggle("partial", previewFill > 0.001 && previewFill < 0.999);
    mark.classList.toggle(
      "draining",
      state.ultimateHolding && previewFill < baseFill && previewFill > 0.001,
    );
    mark.classList.toggle(
      "consumed",
      state.ultimateHolding && baseFill > 0.001 && previewFill <= 0.001,
    );
    mark.classList.toggle("selected", state.ultimateHolding && selectedTier === tier);
    mark.classList.toggle("full", availableTier === 4);
  });

  if (state.phase !== "battle") {
    ui.ultimateButtonLabel.textContent = "造成伤害或QTE成功后积累";
    ui.ultimateControlHint.textContent = "四档终结 · 每满一档点亮一枚";
  } else if (state.ultimateCasting) {
    ui.ultimateButtonLabel.textContent = "终结技释放中";
    ui.ultimateControlHint.textContent = "灵魂铠甲全功率输出";
  } else if (state.ultimateHolding) {
    if (selectedUltimate) {
      ui.ultimateButtonLabel.textContent =
        heldFor >= ULTIMATE_MIN_HOLD_MS
          ? "松手释放 · " + selectedUltimate.name
          : "继续按住 · 锁定一式";
      ui.ultimateControlHint.textContent =
        selectedUltimate.roman + "档 · 消耗" + selectedUltimate.tier + "枚能量豆";
    } else {
      ui.ultimateButtonLabel.textContent = "继续按住 · 正在锁定";
      ui.ultimateControlHint.textContent = "短按不会释放";
    }
  } else if (availableTier > 0) {
    const highest = getUltimateTier(availableTier);
    ui.ultimateButtonLabel.textContent = highest.roman + "档就绪 · " + highest.name;
    ui.ultimateControlHint.textContent = "按住蓄力 · 松手释放低于等于当前档位的终结技";
  } else {
    ui.ultimateButtonLabel.textContent = "终结技蓄能中";
    ui.ultimateControlHint.textContent = "第一枚点亮后可长按释放";
  }

  ui.soulUltimateButton.setAttribute(
    "aria-label",
    state.ultimateHolding && selectedUltimate
      ? "正在蓄力" + selectedUltimate.name + "，松手消耗" + selectedUltimate.tier + "枚阶段能量释放，拖到左上叉号可取消"
      : "当前点亮" + availableTier + "枚阶段能量，可释放" + availableTier + "档终结技",
  );
}

function addSoulEnergy(amount, source) {
  if (!state || state.ended || amount <= 0 || state.soulEnergy >= MAX_SOUL_ENERGY) {
    return 0;
  }
  const before = state.soulEnergy;
  const beforeTier = soulTierForEnergy(before);
  state.soulEnergy = Math.min(MAX_SOUL_ENERGY, state.soulEnergy + amount);
  const gained = state.soulEnergy - before;
  const afterTier = soulTierForEnergy(state.soulEnergy);
  if (source && gained >= 1) {
    showLog(source + "，灵魂能量 +" + Math.round(gained));
  }
  if (afterTier > beforeTier) {
    const unlocked = getUltimateTier(afterTier);
    createFloat(unlocked.roman + "档就绪", true, "awaken");
    showMessage(unlocked.name + "已就绪 · 长按终结技选择释放档位");
    playFrequencySweep(
      { wave: "sine", start: 160 + afterTier * 45, end: 360 + afterTier * 80, duration: 0.28 },
      0,
      0.04,
    );
  }
  renderSoulUltimate();
  return gained;
}

function updateSoulUltimateHold(now) {
  if (!state || !state.ultimateHolding) {
    return;
  }
  const elapsed = Math.max(0, now - state.ultimateHoldStartedAt);
  const previousTier = state.ultimateHoldTier;
  const requestedTier = elapsed < ULTIMATE_MIN_HOLD_MS
    ? 0
    : 1 + Math.floor((elapsed - ULTIMATE_MIN_HOLD_MS) / ULTIMATE_TIER_HOLD_MS);
  state.ultimateHoldTier = Math.min(state.ultimateHoldAvailableTier, requestedTier, 4);
  if (state.ultimateHoldTier > 0 && state.ultimateHoldTier !== previousTier) {
    const selected = getUltimateTier(state.ultimateHoldTier);
    createFloat(selected.roman + "档", true, "awaken");
    playTone(state.ultimateHoldTier - 1, state.ultimateHoldTier >= 3, false);
    showMessage(selected.name + "已锁定 · 松手立即释放，继续按住可升档");
  }
  renderSoulUltimate(now);
}

function beginSoulUltimateHold(options) {
  if (!canStartSoulUltimate()) {
    if (state && state.soulEnergy < SOUL_TIER_COST) {
      showMessage("灵魂能量不足25点，暂时无法释放终结技");
    }
    return false;
  }
  const now = performance.now();
  endIntervention("ultimate", now);
  state.ultimateHolding = true;
  state.ultimateHoldStartedAt = now;
  state.ultimateHoldTier = 0;
  state.ultimateHoldAvailableTier = soulTierForEnergy(state.soulEnergy);
  state.ultimateCancelHovered = false;
  state.ultimatePointerId = options && typeof options.pointerId === "number"
    ? options.pointerId
    : null;
  state.ultimateInputKey = options && options.key ? options.key : null;
  ui.commandDeck.classList.add("ultimate-holding");
  ui.battlefield.classList.add("ultimate-holding");
  ui.liveHint.textContent = "灵魂终结技蓄力中 · 松手释放，继续按住逐档提升";
  showMessage("按住蓄力 · 0.3秒锁定一式，最高可到当前灵魂档位");
  updateCardStates(now);
  renderStatus();
  return true;
}

function clearSoulUltimateHoldState() {
  if (!state) {
    return;
  }
  state.ultimateHolding = false;
  state.ultimateHoldStartedAt = 0;
  state.ultimateHoldTier = 0;
  state.ultimateHoldAvailableTier = 0;
  state.ultimateCancelHovered = false;
  state.ultimatePointerId = null;
  state.ultimateInputKey = null;
  ui.commandDeck.classList.remove("ultimate-holding");
  ui.battlefield.classList.remove("ultimate-holding");
  ui.soulUltimateButton.classList.remove("cancel-hover");
}

function cancelSoulUltimateHold(silent) {
  if (!state || !state.ultimateHolding) {
    return;
  }
  clearSoulUltimateHoldState();
  if (!silent) {
    showMessage("终结技蓄力已取消，灵魂能量未消耗");
  }
  updateCardStates(performance.now());
  renderStatus();
  renderChain();
}

function releaseSoulUltimateHold() {
  if (!state || !state.ultimateHolding) {
    return;
  }
  updateSoulUltimateHold(performance.now());
  const tier = state.ultimateHoldTier;
  clearSoulUltimateHoldState();
  if (tier <= 0) {
    showMessage("按住至少0.3秒后松手，才会释放终结技");
    updateCardStates(performance.now());
    renderStatus();
    renderChain();
    return;
  }
  castSoulUltimate(tier);
}

function castSoulUltimate(tier) {
  const ultimate = getUltimateTier(tier);
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    state.ultimateCasting ||
    state.soulEnergy < ultimate.cost
  ) {
    renderSoulUltimate();
    return;
  }
  const now = performance.now();
  const currentRun = state.runId;
  state.soulEnergy = Math.max(0, state.soulEnergy - ultimate.cost);
  state.ultimateCasting = true;
  state.ultimateCastStartedAt = now;
  state.ultimateCastPauseApplied = 0;
  beginBossStunPresentationPause(now);
  ui.commandDeck.classList.add("ultimate-casting");
  ui.battlefield.classList.add("ultimate-casting", "ultimate-tier-" + tier);
  ui.ultimateCinematic.className = "ultimate-cinematic ultimate-tier-" + tier;
  ui.ultimateCinematic.setAttribute("aria-hidden", "false");
  ui.ultimateCinematic.style.setProperty("--ultimate-color", ultimate.color);
  ui.ultimateCinematicTier.textContent = ultimate.roman;
  ui.ultimateCinematicCost.textContent = ultimate.cost;
  ui.ultimateCinematicName.textContent = ultimate.name;
  ui.ultimateCinematicEffect.textContent = ultimate.effect;
  ui.liveHint.textContent = ultimate.name + " · 灵魂铠甲正在兑现高光";
  ui.autoActionText.textContent = "灵魂终结 · " + ultimate.name;
  showMessage(ultimate.name + "释放 · 锁定Boss当前蓄力部位");
  playFrequencySweep(
    { wave: tier >= 3 ? "sawtooth" : "triangle", start: 92 + tier * 16, end: 430 + tier * 90, duration: 0.62 },
    0,
    0.055,
  );
  updateCardStates(now);
  renderStatus();

  window.setTimeout(function () {
    resolveSoulUltimateImpact(ultimate, currentRun);
  }, 360);
  window.setTimeout(function () {
    finishSoulUltimateCast(currentRun);
  }, ULTIMATE_CAST_DURATION);
}

function applySoulUltimateDamage(ultimate, targetId) {
  if (ultimate.tier < 4) {
    return damagePart(targetId, ultimate.damage, ultimate.armorDamage);
  }
  const part = state.parts[targetId];
  const hadArmor = part.armor > 0;
  const hpBefore = part.hp;
  const armorHit = Math.min(part.armor, ultimate.armorDamage);
  part.armor -= armorHit;
  const lifeDamage = Math.min(part.hp, hadArmor ? ultimate.damage : Math.round(ultimate.damage * 1.25));
  part.hp -= lifeDamage;
  state.bossHp = Math.max(0, state.bossHp - lifeDamage);
  const result = {
    bossDamage: lifeDamage,
    armorHit: armorHit,
    partHit: lifeDamage,
    armorBroken: hadArmor && part.armor <= 0,
    partBroken: hpBefore > 0 && part.hp <= 0,
  };
  if (result.partBroken) {
    beginBossStun(targetId, performance.now());
  }
  return result;
}

function resolveSoulUltimateImpact(ultimate, currentRun) {
  if (!state || state.runId !== currentRun || state.ended || !state.ultimateCasting) {
    return;
  }
  const impactTime = performance.now();
  syncBossStunPresentationPause(impactTime);
  applySoulUltimatePause(impactTime);
  const targetId = getIntent().part;
  const target = state.parts[targetId];
  const result = applySoulUltimateDamage(ultimate, targetId);
  state.intentPressure += ultimate.pressure;
  createFloat("奥义 -" + result.bossDamage, false);
  createUnitBurst(ui.bossUnit, 0.5, 0.42, ultimate.color);
  createUnitBeam(ui.playerUnit, 0.58, 0.34, ui.bossUnit, 0.48, 0.42, ultimate.color);
  if (ultimate.tier >= 2) {
    window.setTimeout(function () {
      if (state && state.runId === currentRun && !state.ended) {
        createUnitBurst(ui.bossUnit, 0.58, 0.5, ultimate.color);
      }
    }, 110);
  }
  if (ultimate.tier >= 3) {
    pulseCombatClass("boss-stagger", 920);
  }
  pulseCombatClass("boss-hit", 520 + ultimate.tier * 90);
  pulseCombatClass("shake", 360 + ultimate.tier * 120);
  showMessage(
    ultimate.name + "命中" + target.name + "，造成" + result.bossDamage + "点伤害" +
      (result.armorHit ? "、" + result.armorHit + "点破甲" : "") +
      (result.partBroken && state.bossHp > 0 ? " · 部位摧毁，Boss眩晕5秒" : ""),
  );
  showLog(ultimate.name + "完成结算，灵魂铠甲消耗" + ultimate.cost + "点灵魂能量");
  renderStatus();
  renderBossParts();
  renderBossSprite();
  checkIntentInterrupted(performance.now());
  checkBattleEnd();
}

function applySoulUltimatePause(now) {
  if (!state || state.ended || !state.ultimateCasting) {
    return;
  }
  const totalElapsed = Math.max(0, now - state.ultimateCastStartedAt);
  const elapsed = Math.max(0, totalElapsed - state.ultimateCastPauseApplied);
  if (elapsed <= 0) {
    return;
  }
  state.nextTurnAt += elapsed;
  state.lastPlayerActionAt += elapsed;
  state.nextPlayerAt += elapsed;
  state.playerCycleDuration += elapsed;
  if (state.chainDeadline) {
    state.chainDeadline += elapsed;
  }
  state.ultimateCastPauseApplied += elapsed;
}

function finishSoulUltimateCast(currentRun) {
  if (!state || state.runId !== currentRun) {
    return;
  }
  const now = performance.now();
  applySoulUltimatePause(now);
  endBossStunPresentationPause(now);
  state.ultimateCasting = false;
  state.ultimateCastStartedAt = 0;
  state.ultimateCastPauseApplied = 0;
  ui.commandDeck.classList.remove("ultimate-casting");
  ui.battlefield.classList.remove(
    "ultimate-casting",
    "ultimate-tier-1",
    "ultimate-tier-2",
    "ultimate-tier-3",
    "ultimate-tier-4",
  );
  hideUltimateCinematic();
  if (!state.ended) {
    ui.liveHint.textContent = "终结技结算完成 · 挂件卡可继续自由释放";
    updateCardStates(now);
    renderStatus();
    renderChain();
  }
}

function hideUltimateCinematic() {
  if (!ui.ultimateCinematic) {
    return;
  }
  ui.ultimateCinematic.className = "ultimate-cinematic hidden";
  ui.ultimateCinematic.setAttribute("aria-hidden", "true");
}

function advanceAwakeningAutomatically(frameDelta) {
  if (
    state.ended ||
    state.awakeningSelecting ||
    state.transforming ||
    state.awakened ||
    state.videoPlaying ||
    state.awakening >= MAX_AWAKENING
  ) {
    return;
  }
  const before = state.awakening;
  state.awakening = Math.min(
    MAX_AWAKENING,
    state.awakening + (frameDelta / AWAKENING_CHARGE_DURATION) * MAX_AWAKENING,
  );
  if (before < MAX_AWAKENING && state.awakening >= MAX_AWAKENING) {
    createFloat("战甲就绪", true, "awaken");
    showMessage("战甲充能完成，可由你选择激活时机与唤醒部件");
    showLog("修罗战甲完成自动充能，核心保持待命");
    playFrequencySweep({ wave: "sine", start: 150, end: 520, duration: 0.34 }, 0, 0.045);
  }
  if (Math.floor(before) !== Math.floor(state.awakening) || state.awakening >= MAX_AWAKENING) {
    renderAwakening();
    renderChain();
  }
}

function beginAwakeningSelection() {
  if (!canBeginAwakening()) {
    if (state.awakening < MAX_AWAKENING) {
      showMessage("战甲正在自动积累唤醒值");
    }
    return;
  }
  if (!canOpenAwakeningSelection()) {
    state.awakeningActivationPending = true;
    ui.liveHint.textContent = "已下达唤醒指令 · 当前动作结束后打开部件选择";
    showMessage("已决定激活核心，等待当前攻防动作结束");
    renderAwakening();
    return;
  }
  openAwakeningSelection();
}

function openAwakeningSelection() {
  state.awakeningActivationPending = false;
  state.awakeningSelecting = true;
  state.awakeningSelectedUids = [];
  ui.battlefield.classList.add("awakening-selecting", "intervention-focus");
  ui.commandDeck.classList.add("awakening-selecting");
  ui.awakeningConsole.classList.remove("hidden");
  ui.awakeningConsole.setAttribute("aria-hidden", "false");
  ui.liveHint.textContent = "时间放缓 · 选择要接入核心形态的部件";
  showMessage("修罗战甲响应，选择本次要唤醒的战甲与挂件能力");
  playFrequencySweep({ wave: "sine", start: 118, end: 54, duration: 0.48 }, 0, 0.034);
  renderStatus();
  renderCards();
  renderChain();
}

function cancelAwakeningSelection() {
  if (!state.awakeningSelecting) {
    return;
  }
  state.awakeningSelecting = false;
  state.awakeningSelectedUids = [];
  state.awakeningActivationPending = false;
  ui.battlefield.classList.remove("awakening-selecting", "intervention-focus");
  ui.commandDeck.classList.remove("awakening-selecting");
  ui.awakeningConsole.classList.add("hidden");
  ui.awakeningConsole.setAttribute("aria-hidden", "true");
  ui.liveHint.textContent = "核心保持待命，你可以稍后再次手动激活";
  renderStatus();
  renderCards();
  renderChain();
}

function toggleAwakeningCard(cardInstanceId) {
  if (!state.awakeningSelecting) {
    showMessage(
      state.awakening >= MAX_AWAKENING
        ? "先点击“唤醒核心”，再选择要激活的部件"
        : "唤醒值会随战斗时间自动积累",
    );
    return;
  }
  const instance = state.hand.find(function (item) {
    return item.uid === cardInstanceId;
  });
  if (!instance) {
    return;
  }
  const selectedIndex = state.awakeningSelectedUids.indexOf(cardInstanceId);
  if (selectedIndex >= 0) {
    state.awakeningSelectedUids.splice(selectedIndex, 1);
  } else {
    const card = getCard(instance.cardId);
    if (state.awakeningSelectedUids.length >= MAX_AWAKENING_SELECTION) {
      showMessage("一次核心形态最多唤醒三个部件");
      return;
    }
    if (selectedAwakeningCost() + card.cost > state.energy) {
      showMessage("战甲能量不足，无法把该部件接入本次形态");
      return;
    }
    state.awakeningSelectedUids.push(cardInstanceId);
    pulseSocket(card.id);
    playTone(state.awakeningSelectedUids.length - 1, state.awakeningSelectedUids.length >= 3, false);
  }
  renderCards();
  renderAwakening();
  renderChain();
}

function consumeAwakeningSelection() {
  const selectedSet = new Set(state.awakeningSelectedUids);
  const consumed = state.hand.filter(function (instance) {
    return selectedSet.has(instance.uid);
  });
  state.hand = state.hand.filter(function (instance) {
    return !selectedSet.has(instance.uid);
  });
  state.discardPile.push.apply(state.discardPile, consumed);
  while (state.hand.length < MAX_HAND_SIZE) {
    const nextCard = drawOneCardIntoHand(false);
    if (!nextCard) {
      break;
    }
  }
}

function confirmAwakeningSelection() {
  if (!state.awakeningSelecting) {
    return;
  }
  const modules = selectedAwakeningCards();
  const totalCost = selectedAwakeningCost();
  if (!modules.length || totalCost > state.energy) {
    return;
  }
  const now = performance.now();
  const currentRun = state.runId;
  state.energy -= totalCost;
  state.awakening = 0;
  state.awakeningActivationPending = false;
  state.awakeningSelecting = false;
  state.transforming = true;
  state.transformStartedAt = now;
  state.awakenedModules = modules.slice();
  state.awakenedAttacksRemaining = AWAKENED_PLAYER_TURNS;
  state.awakenedVolleyReleased = false;
  state.awakenedVideoShown = false;
  consumeAwakeningSelection();
  state.awakeningSelectedUids = [];

  ui.battlefield.classList.remove("awakening-selecting", "intervention-focus");
  ui.battlefield.classList.add("armor-transforming");
  ui.commandDeck.classList.remove("awakening-selecting");
  ui.awakeningConsole.classList.add("hidden");
  ui.awakeningConsole.setAttribute("aria-hidden", "true");
  ui.armorTransformCinematic.classList.remove("hidden");
  ui.armorTransformCinematic.setAttribute("aria-hidden", "false");
  ui.transformModules.innerHTML = moduleSequenceMarkup(modules);
  ui.liveHint.textContent = "核心启动 · 战甲部件正在展开";
  showMessage("修罗战甲唤醒，" + modules.length + "个部件接入核心形态");
  pulseCombatClass("shake", 520);
  playFrequencySweep({ wave: "sawtooth", start: 86, end: 390, duration: 0.52 }, 0, 0.05);
  renderCards();
  renderStatus();
  renderChain();

  window.setTimeout(function () {
    finishArmorTransform(currentRun);
  }, ARMOR_TRANSFORM_DURATION);
}

function finishArmorTransform(currentRun) {
  if (!state || state.runId !== currentRun || !state.transforming || state.ended) {
    return;
  }
  const now = performance.now();
  const elapsed = Math.max(0, now - state.transformStartedAt);
  state.nextTurnAt += elapsed;
  state.lastPlayerActionAt += elapsed;
  state.nextPlayerAt += elapsed;
  state.transforming = false;
  state.transformStartedAt = 0;
  state.awakened = true;
  state.nextTurnAt = Math.max(state.nextTurnAt, now + 360);
  state.nextPlayerAt = Math.max(state.nextPlayerAt, state.nextTurnAt);
  ui.battlefield.classList.remove("armor-transforming");
  ui.battlefield.classList.add("armor-awakened");
  ui.commandDeck.classList.add("armor-awakened");
  ui.armorTransformCinematic.classList.add("hidden");
  ui.armorTransformCinematic.setAttribute("aria-hidden", "true");
  ui.liveHint.textContent = "核心形态生效 · 下一次攻击将由已选部件依次介入";
  showMessage("核心形态完成，部件联动将在接下来的两个玩家回合生效");
  renderStatus();
  renderCards();
  renderChain();
}

function sortedAwakenedModules() {
  return sortAwakeningModules(state.awakenedModules);
}

function applyAwakenedModule(card, index, previous) {
  if (!state || state.ended) {
    return;
  }
  const link = {
    name: previous ? previous.name + "协同" : "核心形态供能",
    bonus: 0.12 + index * 0.04,
  };
  if (card.video && !state.awakenedVideoShown && !state.videoPending && !state.videoPlaying) {
    state.awakenedVideoShown = true;
    state.videoPending = {
      card: card,
      chainIndex: index + 1,
      link: link,
      comboBonus: Math.round((index * 0.13 + link.bonus) * 100),
      previous: previous,
      queuedAt: performance.now(),
      runId: state.runId,
    };
    return;
  }
  applyCardEffect(card, index + 1, link);
}

function triggerAwakenedVolley() {
  const modules = sortedAwakenedModules();
  const currentRun = state.runId;
  modules.forEach(function (card, index) {
    window.setTimeout(function () {
      if (!state || state.runId !== currentRun || state.ended) {
        return;
      }
      applyAwakenedModule(card, index, index > 0 ? modules[index - 1] : null);
    }, 180 + index * 230);
  });
  showMessage(
    (modules.length > 1 ? "协同路径启动：" : "部件介入：") +
      modules.map(function (card) { return card.name; }).join(" → "),
  );
}

function resolveAwakenedFinisher() {
  const count = state.awakenedModules.length;
  const finisherDamage = [0, 10, 22, 38][Math.min(3, count)];
  const targetId = getIntent().part;
  const result = damagePart(targetId, finisherDamage, Math.round(finisherDamage * 1.5));
  state.intentPressure += Math.round(finisherDamage * 0.9);
  createFloat("形态终结 -" + result.bossDamage, false);
  createUnitBurst(ui.bossUnit, 0.5, 0.42, count >= 3 ? "#fff1a0" : "#71dfff");
  if (count >= 2) {
    createUnitBeam(ui.playerUnit, 0.58, 0.32, ui.bossUnit, 0.48, 0.4, "#73dcff");
  }
  if (count >= 3) {
    createUnitBeam(ui.playerUnit, 0.58, 0.48, ui.bossUnit, 0.52, 0.48, "#ffae56");
    pulseCombatClass("boss-stagger", 760);
    pulseCombatClass("shake", 560);
  }
  showMessage(
    chainTiers[Math.min(count, chainTiers.length - 1)] +
      "完成，Boss出现明显失衡，追加 " +
      result.bossDamage +
      " 点伤害",
  );
  renderStatus();
  renderBossParts();
  renderBossSprite();
  checkIntentInterrupted(performance.now());
  checkBattleEnd();
}

function handleAwakenedAttackResolved() {
  if (!state.awakened || state.ended) {
    return;
  }
  const isFirstAttack = state.awakenedAttacksRemaining === AWAKENED_PLAYER_TURNS;
  if (isFirstAttack) {
    state.awakenedVolleyReleased = true;
    triggerAwakenedVolley();
  } else {
    resolveAwakenedFinisher();
  }
  state.awakenedAttacksRemaining = Math.max(0, state.awakenedAttacksRemaining - 1);
  renderAwakening();
  renderChain();
  if (state.awakenedAttacksRemaining <= 0) {
    const currentRun = state.runId;
    window.setTimeout(function () {
      endAwakenedState(currentRun);
    }, 980);
  }
}

function endAwakenedState(currentRun) {
  if (!state || state.runId !== currentRun || !state.awakened) {
    return;
  }
  state.lastResolvedChain = state.awakenedModules.map(function (card) {
    return { card: card };
  });
  state.lastChainTitle = "核心形态解除";
  state.awakened = false;
  state.awakenedModules = [];
  state.awakenedAttacksRemaining = 0;
  state.awakenedVolleyReleased = false;
  state.awakenedVideoShown = false;
  ui.battlefield.classList.remove("armor-awakened");
  ui.commandDeck.classList.remove("armor-awakened");
  ui.liveHint.textContent = "战甲回归常态，下一轮唤醒值开始自动积累";
  showMessage("核心形态解除，战甲进入新一轮充能");
  renderStatus();
  renderCards();
  renderChain();
  window.setTimeout(function () {
    if (!state || state.runId !== currentRun || state.awakened) {
      return;
    }
    state.lastResolvedChain = [];
    state.lastChainTitle = "";
    renderChain();
  }, 1800);
}

function renderIntentBase() {
  const intent = getIntent();
  ui.intentBanner.classList.remove("stunned");
  ui.intentName.textContent = intent.name;
  ui.intentPartIcon.src = intent.icon;
  ui.intentCue.textContent = intent.cue;
  ui.intentTitle.textContent = intent.title;
}

function renderBossStunProgress(now) {
  if (!state || !state.bossStunned) {
    return;
  }
  const remaining = Math.max(0, state.bossStunEndsAt - now);
  const progress = Math.max(0, Math.min(1, remaining / BOSS_STUN_DURATION));
  const part = state.parts[state.bossStunPartId] || state.parts[getIntent().part];
  ui.intentBanner.classList.remove("danger", "interrupted");
  ui.intentBanner.classList.add("stunned");
  ui.intentName.textContent = "眩晕";
  ui.intentPartIcon.src = part.icon;
  ui.intentCue.textContent = "部位破坏";
  ui.intentTitle.textContent = "Boss眩晕";
  ui.intentCounter.textContent = (remaining / 1000).toFixed(1) + "s";
  ui.intentBanner.style.setProperty("--intent-charge", progress * 100 + "%");
  ui.partBars.style.setProperty("--part-intent-charge", "0%");
  ui.autoActionText.textContent = "Boss眩晕 · " + (remaining / 1000).toFixed(1) + "s";
}

function isSkillPresentationPlaying() {
  return Boolean(state && (state.videoPlaying || state.ultimateCasting));
}

function beginBossStunPresentationPause(now) {
  if (!state) {
    return;
  }
  if (!state.bossStunned) {
    state.bossStunPausedRemaining = null;
    return;
  }
  const remaining = Math.max(0, state.bossStunEndsAt - now);
  if (remaining <= 0) {
    finishBossStun(now);
    state.bossStunPausedRemaining = null;
    return;
  }
  state.bossStunPausedRemaining = remaining;
  state.bossStunEndsAt = now + state.bossStunPausedRemaining;
}

function syncBossStunPresentationPause(now) {
  if (
    !state ||
    !state.bossStunned ||
    !isSkillPresentationPlaying() ||
    typeof state.bossStunPausedRemaining !== "number"
  ) {
    return false;
  }
  state.bossStunEndsAt = now + state.bossStunPausedRemaining;
  return true;
}

function endBossStunPresentationPause(now) {
  if (!state) {
    return;
  }
  if (state.bossStunned && typeof state.bossStunPausedRemaining === "number") {
    state.bossStunEndsAt = now + state.bossStunPausedRemaining;
  }
  state.bossStunPausedRemaining = null;
}

function beginBossStun(partId, now) {
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    state.bossHp <= 0
  ) {
    return;
  }
  const currentTime = typeof now === "number" ? now : performance.now();
  syncBossStunPresentationPause(currentTime);
  const bossWasActing = state.actionActor === "boss";
  if (bossWasActing || getIntent().part === partId) {
    state.bossStunAdvanceIntent = true;
  }
  if (bossWasActing) {
    state.actionActor = null;
    state.activeActionId = 0;
    state.bossImpactAt = 0;
    state.reactionActive = false;
    state.reactionChoice = null;
  }
  if (state.bossStunned) {
    startCardPlayCooldown(currentTime, STUN_AUTO_CARD_GAP);
    state.autoResumeAt = state.cardPlayCooldownEndsAt;
    const refreshedEndAt = currentTime + BOSS_STUN_DURATION;
    const extension = Math.max(0, refreshedEndAt - state.bossStunEndsAt);
    state.bossStunStartedAt = currentTime;
    state.bossStunEndsAt = refreshedEndAt;
    state.bossStunPartId = partId;
    if (isSkillPresentationPlaying()) {
      state.bossStunPausedRemaining = BOSS_STUN_DURATION;
    }
    state.nextTurnAt += extension;
    state.nextPlayerAt += extension;
    state.lastPlayerActionAt += extension;
    if (state.chainDeadline) {
      state.chainDeadline += extension;
    }
    if (state.interventionEndsAt) {
      state.interventionEndsAt += extension;
    }
    ui.liveHint.textContent = "再次破坏部位 · 免费输出窗口刷新为5秒";
    createFloat("眩晕 5.0s", false, "stun");
    showMessage(state.parts[partId].name + "被破坏，Boss眩晕重新计时5秒");
    showLog("连续部位破坏刷新Boss眩晕，行动节拍继续暂停");
    renderBossSprite();
    renderBossParts();
    renderBossStunProgress(currentTime);
    renderReactionControls();
    renderStatus();
    updateCardStates(currentTime);
    return true;
  }

  state.bossStunned = true;
  state.bossStunResumeActor = "boss";
  state.turnActor = "player";
  state.lastAutoActor = "boss";
  startCardPlayCooldown(currentTime, STUN_AUTO_CARD_GAP);
  state.autoResumeAt = state.cardPlayCooldownEndsAt;
  state.bossStunStartedAt = currentTime;
  state.bossStunEndsAt = currentTime + BOSS_STUN_DURATION;
  state.bossStunPartId = partId;
  if (isSkillPresentationPlaying()) {
    state.bossStunPausedRemaining = BOSS_STUN_DURATION;
  }
  state.nextTurnAt += BOSS_STUN_DURATION;
  state.nextPlayerAt += BOSS_STUN_DURATION;
  state.lastPlayerActionAt += BOSS_STUN_DURATION;
  if (state.chainDeadline) {
    state.chainDeadline += BOSS_STUN_DURATION;
  }
  if (state.interventionEndsAt) {
    state.interventionEndsAt += BOSS_STUN_DURATION;
  }

  ui.battlefield.classList.remove("boss-turn", "boss-stagger");
  ui.battlefield.classList.add("boss-stunned");
  ui.liveHint.textContent = "部位破坏 · Boss倒地5秒，挂件免费释放";
  createFloat("眩晕 5.0s", false, "stun");
  showMessage(state.parts[partId].name + "被破坏，获得5秒免费输出窗口");
  showLog("Boss倒地5秒：任意挂件可释放且不消耗战术能量");
  playFrequencySweep({ wave: "triangle", start: 190, end: 66, duration: 0.42 }, 0, 0.05);
  renderBossSprite();
  renderBossParts();
  renderBossStunProgress(currentTime);
  renderReactionControls();
  renderStatus();
  updateCardStates(currentTime);
  return true;
}

function finishBossStun(now) {
  if (!state || !state.bossStunned) {
    return;
  }
  const currentTime = typeof now === "number" ? now : performance.now();
  const shouldAdvanceIntent = state.bossStunAdvanceIntent;
  state.bossStunned = false;
  state.bossStunStartedAt = 0;
  state.bossStunEndsAt = 0;
  state.bossStunPartId = null;
  state.bossStunAdvanceIntent = false;
  state.bossStunPausedRemaining = null;
  clearCardPlayCooldown();
  if (state.cardDragActive) {
    finishCardDrag(true);
  }
  state.turnActor = state.bossStunResumeActor || "boss";
  state.bossStunResumeActor = "boss";
  state.lastAutoActor = state.turnActor === "boss" ? "player" : "boss";
  state.nextTurnAt = currentTime + 250;
  state.nextPlayerAt = state.nextTurnAt;
  ui.battlefield.classList.remove("boss-stunned");
  ui.liveHint.textContent = "Boss恢复行动 · 严格交替回合继续";
  ui.autoActionText.textContent = "Boss起身 · 战斗节拍恢复";
  if (shouldAdvanceIntent) {
    advanceIntent();
  } else {
    renderIntentBase();
    checkIntentInterrupted(currentTime);
    renderBossParts();
    renderReactionControls();
  }
  renderBossSprite();
  renderStatus();
  updateCardStates(currentTime);
  if (!state.intentInterrupted) {
    showMessage("Boss眩晕结束，恢复行动");
  }
}

function updateIntentTimer(now) {
  if (state.bossStunned) {
    renderBossStunProgress(now);
    return;
  }
  const isResolvingBossAttack = state.actionActor === "boss" && state.reactionActive;
  const remaining = isResolvingBossAttack
    ? Math.max(0, state.bossImpactAt - now)
    : timeUntilActor("boss", now);
  const duration = isResolvingBossAttack
    ? BOSS_IMPACT_DELAY
    : currentWeaponMode().attackInterval + BOSS_TURN_INTERVAL;
  const percent = Math.max(0, Math.min(1, remaining / duration));
  ui.intentCounter.textContent = state.intentInterrupted ? "已打断" : (remaining / 1000).toFixed(1) + "s";
  ui.intentBanner.style.setProperty("--intent-charge", (1 - percent) * 100 + "%");
  ui.partBars.style.setProperty("--part-intent-charge", (1 - percent) * 100 + "%");
  ui.intentBanner.classList.toggle("danger", !state.intentInterrupted && remaining < 1200);
  ui.intentBanner.classList.toggle("interrupted", state.intentInterrupted);
}

function updateAutoActionMeter(now) {
  const duration = Math.max(1, state.playerCycleDuration);
  const remaining = Math.max(0, state.nextPlayerAt - now);
  const progress = Math.max(0, Math.min(1, 1 - remaining / duration));
  ui.autoActionBar.style.width = progress * 100 + "%";
  ui.weaponAttackRing.style.setProperty("--weapon-progress", progress * 100 + "%");
  ui.weaponAttackRing.classList.toggle("ready", progress >= 0.995);
}

function timeUntilActor(actor, now) {
  const additionalTurn =
    state.turnActor === actor
      ? 0
      : actor === "player"
        ? currentWeaponMode().attackInterval
        : BOSS_TURN_INTERVAL;
  return Math.max(0, state.nextTurnAt - now + additionalTurn);
}

function updateChainTimer(now) {
  if (!state.chain.length || state.videoPending || state.videoPlaying) {
    return;
  }
  const remaining = state.chainDeadline - now;
  if (remaining <= 0) {
    resolveChain();
  }
}

function renderBossParts() {
  ui.partBars.innerHTML = "";
  const activePartId = state.bossStunned ? null : getIntent().part;
  ["arms", "core", "legs"].forEach(function (partId) {
    const part = state.parts[partId];
    const hasArmor = part.armor > 0;
    const broken = part.hp <= 0;
    const hpValue = Math.max(0, Math.ceil(part.hp));
    const armorValue = Math.max(0, Math.ceil(part.armor));
    const hpPercent = part.maxHp ? Math.max(0, Math.min(1, part.hp / part.maxHp)) * 100 : 0;
    const armorPercent = part.maxArmor ? Math.max(0, Math.min(1, part.armor / part.maxArmor)) * 100 : 0;
    const layerPercent = broken ? 0 : hasArmor ? armorPercent : hpPercent;
    const layerState = broken ? "broken" : hasArmor ? "armored" : "exposed";
    const isIntent = partId === activePartId;
    const statusLabel = broken
      ? "已破坏"
      : isIntent && state.intentInterrupted
        ? "已打断"
        : isIntent
          ? "蓄力中"
          : hasArmor
            ? "硬甲"
            : "裸露";
    const item = document.createElement("div");
    item.className =
      "part-state " +
      (broken ? "broken" : hasArmor ? "armored" : "exposed") +
      (isIntent ? " is-intent" : "") +
      (isIntent && state.intentInterrupted ? " interrupted" : "");
    item.dataset.partId = partId;
    item.setAttribute(
      "aria-label",
      part.name + "，" + statusLabel +
        (part.maxArmor ? "，护甲" + armorValue + "/" + part.maxArmor : "，无护甲") +
        "，本体" + hpValue + "/" + part.maxHp,
    );
    item.innerHTML =
      '<span class="part-icon-shell"><img class="part-icon" src="' +
      part.icon +
      '" alt="" /><span class="part-layer-badge ' +
      layerState +
      '" aria-hidden="true"><img src="./assets/armor-shield.png" alt="" /><i></i></span>' +
      '<i class="part-broken-cross" aria-hidden="true"></i></span>' +
      '<span class="part-shared-gauge ' +
      layerState +
      '" aria-hidden="true"><i style="width:' +
      layerPercent +
      '%"></i></span>';
    ui.partBars.appendChild(item);
  });
}

function renderBossSprite() {
  let hudSprite = "./assets/boss.png";
  if (state.parts.arms.hp <= 0) {
    hudSprite = "./assets/boss-arms-broken.png";
  } else if (state.parts.legs.hp <= 0) {
    hudSprite = "./assets/boss-legs-broken.png";
  }
  const battlefieldSprite = state.bossStunned ? "./assets/boss-stunned.png" : hudSprite;
  ui.bossUnit.classList.toggle("is-stunned", state.bossStunned);
  ui.bossImage.src = battlefieldSprite;
  if (ui.bossHudAvatar) {
    ui.bossHudAvatar.src = hudSprite;
  }
}

function hasPlayableInterventionCard() {
  return state.hand.some(function (instance) {
    const card = getCard(instance.cardId);
    return card && card.cost <= state.energy;
  });
}

function maybeStartIntervention(now) {
  if (
    state.interventionActive ||
    state.interventionShownForAttack === state.playerAttackSerial ||
    state.turnActor !== "player" ||
    state.actionActor ||
    state.reactionActive ||
    state.videoPending ||
    state.videoPlaying ||
    state.chain.length ||
    !hasPlayableInterventionCard()
  ) {
    return;
  }

  const remaining = state.nextPlayerAt - now;
  if (remaining <= 0 || remaining > INTERVENTION_TRIGGER_MS) {
    return;
  }

  state.interventionActive = true;
  state.interventionEndsAt = now + INTERVENTION_WINDOW_MS;
  state.interventionShownForAttack = state.playerAttackSerial;
  ui.battlefield.classList.add("intervention-focus");
  ui.commandDeck.classList.add("intervention-window");
  ui.liveHint.textContent = "慢动作介入 · 在下一次武器攻击前接入挂件";
  renderStatus();
  playFrequencySweep({ wave: "sine", start: 118, end: 62, duration: 0.42 }, 0, 0.028);
}

function applyInterventionSlowdown(frameDelta) {
  if (!state.interventionActive) {
    return;
  }
  const delayedTime = Math.max(0, Math.min(160, frameDelta)) * (1 - INTERVENTION_TIME_SCALE);
  state.nextTurnAt += delayedTime;
  state.nextPlayerAt += delayedTime;
  state.playerCycleDuration += delayedTime;
  if (state.chainDeadline) {
    state.chainDeadline += delayedTime;
  }
}

function endIntervention(reason, now) {
  if (!state.interventionActive) {
    return;
  }

  state.interventionActive = false;
  state.interventionEndsAt = 0;
  ui.battlefield.classList.remove("intervention-focus");
  ui.commandDeck.classList.remove("intervention-window");

  if (reason === "card") {
    const releaseAt = now + INTERVENTION_RELEASE_DELAY;
    if (state.turnActor === "player" && state.nextTurnAt > releaseAt) {
      state.nextTurnAt = releaseAt;
      state.nextPlayerAt = releaseAt;
      state.playerCycleDuration = Math.max(1, state.nextPlayerAt - state.lastPlayerActionAt);
    }
    ui.liveHint.textContent = "介入成立 · 挂件将接入下一次武器攻击";
    ui.commandDeck.classList.add("intervention-release");
    pulseCombatClass("intervention-release", 480);
    window.setTimeout(function () {
      ui.commandDeck.classList.remove("intervention-release");
    }, 480);
    playFrequencySweep({ wave: "triangle", start: 180, end: 460, duration: 0.2 }, 0, 0.04);
  } else if (reason === "timeout") {
    ui.liveHint.textContent = "未介入 · 自动攻击继续";
  }

  renderStatus();
}

function updateCombatStance() {
  if (!state || !ui.battlefield) {
    return;
  }
  const neutral = Boolean(
    state.phase === "battle" &&
    !state.ended &&
    !state.bossStunned &&
    !state.actionActor &&
    !state.cardTurnResolving &&
    !state.reactionActive &&
    !state.videoPending &&
    !state.videoPlaying &&
    !state.ultimateHolding &&
    !state.ultimateCasting
  );
  ui.battlefield.classList.toggle("combat-neutral", neutral);
  ui.commandDeck.classList.toggle("boss-action-lock", isBossActionLocked());
}

function updateCardFlowStatus(now) {
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    state.bossStunned ||
    state.actionActor ||
    state.cardTurnResolving ||
    state.videoPending ||
    state.videoPlaying ||
    state.ultimateHolding ||
    state.ultimateCasting ||
    state.turnActor !== "player"
  ) {
    return;
  }
  const firstInstance = state.hand[0];
  const firstCard = firstInstance ? getCard(firstInstance.cardId) : null;
  if (now < state.nextTurnAt) {
    ui.autoActionText.textContent = "对峙游走 · " + Math.max(0, (state.nextTurnAt - now) / 1000).toFixed(1) + "s";
    return;
  }
  if (state.cardPlayMode === "manual") {
    ui.autoActionText.textContent = "主动模式 · 请选择卡牌";
    return;
  }
  if (!firstCard) {
    ui.autoActionText.textContent = "自动队列 · 等待补牌";
    return;
  }
  if (!hasBossStunFreeCards(now) && firstCard.cost > state.energy) {
    ui.autoActionText.textContent = "自动等待 · " + firstCard.name + " " + state.energy + "/" + firstCard.cost;
    return;
  }
  ui.autoActionText.textContent = "自动队列 · " + firstCard.name;
}

function tryAutoPlayCard(now) {
  if (
    !state ||
    state.cardPlayMode !== "auto" ||
    state.cardDragActive ||
    now < state.autoResumeAt ||
    !isPlayerCardWindowOpen(now)
  ) {
    return false;
  }
  const instance = state.hand[0];
  const card = instance ? getCard(instance.cardId) : null;
  if (!instance || !card) {
    return false;
  }
  if (!hasBossStunFreeCards(now) && card.cost > state.energy) {
    updateCardFlowStatus(now);
    return false;
  }
  const button = ui.cardHand.querySelector('[data-card-instance="' + instance.uid + '"]');
  return activateCard(instance.uid, button, "auto");
}

function finishPlayerCardTurn(payload, now) {
  if (!state || !payload || payload.runId !== state.runId) {
    return;
  }
  state.cardTurnResolving = false;
  if (state.ended) {
    return;
  }
  if (state.chain.length >= 5) {
    resolveChain();
    if (state.ended) {
      return;
    }
  }
  if (state.chain.length) {
    state.chainDeadline = Math.max(state.chainDeadline, now + AUTO_CHAIN_CONTINUE_WINDOW);
  }
  state.lastPlayerActionAt = now;
  state.autoResumeAt = now + AUTO_MODE_RESUME_DELAY;
  if (state.bossStunned) {
    startCardPlayCooldown(now, STUN_AUTO_CARD_GAP);
    state.autoResumeAt = state.cardPlayCooldownEndsAt;
    state.turnActor = "player";
    state.lastAutoActor = "boss";
    state.nextTurnAt = now + STUN_AUTO_CARD_GAP;
    state.nextPlayerAt = state.nextTurnAt;
    state.playerCycleDuration = STUN_AUTO_CARD_GAP;
    ui.autoActionText.textContent = "Boss倒地 · 免费队列继续";
  } else {
    state.lastAutoActor = "player";
    state.turnActor = "boss";
    state.nextTurnAt = now + CARD_TO_BOSS_DELAY;
    state.nextPlayerAt = state.nextTurnAt + currentWeaponMode().attackInterval;
    state.playerCycleDuration = Math.max(1, state.nextPlayerAt - state.lastPlayerActionAt);
    ui.autoActionText.textContent = payload.card.name + "完成 · Boss即将反击";
  }
  updateCombatStance();
  renderStatus();
  renderReactionControls();
  updateCardStates(now);
}

function tickBattle() {
  if (!state || state.phase !== "battle" || state.ended) {
    return;
  }
  const now = performance.now();
  const frameDelta = Math.max(0, now - state.lastFrameAt);
  state.lastFrameAt = now;
  updateCombatStance();
  advanceTimedEnergy(now);
  renderEnergyRecoveryProgress(now);
  if (state.bossStunned) {
    const presentationPaused = syncBossStunPresentationPause(now);
    if (!presentationPaused && now >= state.bossStunEndsAt) {
      finishBossStun(now);
    } else {
      renderBossStunProgress(now);
    }
  }
  if (state.ultimateHolding) {
    updateSoulUltimateHold(now);
    state.nextTurnAt += frameDelta;
    state.nextPlayerAt += frameDelta;
    state.playerCycleDuration += frameDelta;
    updateAutoActionMeter(now);
    updateIntentTimer(now);
    updateCardStates(now);
    return;
  }
  if (state.ultimateCasting) {
    return;
  }
  if (state.videoPlaying) {
    return;
  }
  if (state.videoPending && !state.actionActor && !state.reactionActive) {
    startPendingModuleVideo();
    return;
  }
  if (state.bossStunned) {
    if (state.cardPlayMode === "auto") {
      tryAutoPlayCard(now);
    }
    updateCardFlowStatus(now);
    updateCardStates(now);
    return;
  }
  applyInterventionSlowdown(frameDelta);
  if (state.interventionActive && now >= state.interventionEndsAt) {
    endIntervention("timeout", now);
  }
  if (now >= state.nextTurnAt && isAutoTurnIdle()) {
    if (state.turnActor === "player") {
      if (state.cardPlayMode === "auto") {
        tryAutoPlayCard(now);
      }
    } else {
      resolveBossAttack(now);
    }
  }
  updateCardFlowStatus(now);
  updateAutoActionMeter(now);
  updateIntentTimer(now);
  if (state.actionActor === "boss" && state.chain.length) {
    state.chainDeadline += frameDelta;
  }
  updateChainTimer(now);
  updateCardStates(now);
}

function advanceTimedEnergy(now) {
  if (!state || state.phase !== "battle" || state.ended || now < state.nextEnergyAt) {
    return;
  }
  const recoveredPoints = Math.floor((now - state.nextEnergyAt) / ENERGY_INTERVAL) + 1;
  state.nextEnergyAt += recoveredPoints * ENERGY_INTERVAL;
  if (state.energy >= MAX_ENERGY) {
    return;
  }
  state.energy = Math.min(MAX_ENERGY, state.energy + recoveredPoints);
  renderStatus();
  updateCardStates(now);
}

function isAutoTurnIdle() {
  return Boolean(
    state &&
    !state.ended &&
    !state.actionActor &&
    !state.cardTurnResolving &&
    (state.turnActor === "boss" || !state.cardDragActive) &&
    !state.reactionActive &&
    !state.videoPending &&
    !state.videoPlaying &&
    !state.ultimateHolding &&
    !state.ultimateCasting &&
    !state.bossStunned &&
    state.lastAutoActor !== state.turnActor
  );
}

function executeAutoAttack(now) {
  if (
    state.ended ||
    state.turnActor !== "player" ||
    state.actionActor ||
    state.reactionActive ||
    state.lastAutoActor === "player"
  ) {
    return;
  }
  const weapon = currentWeaponMode();
  const action = weapon.actions[state.actionIndex % weapon.actions.length];
  const actionId = ++state.actionSerial;
  endIntervention("attack", now);
  state.playerAttackSerial += 1;
  state.actionIndex += 1;
  state.actionActor = "player";
  state.activeActionId = actionId;
  state.lastAutoActor = "player";
  state.turnActor = "boss";
  state.nextTurnAt = now + Math.max(BOSS_TURN_INTERVAL, weapon.recoverDelay + MIN_TURN_GAP);
  state.lastPlayerActionAt = now;
  state.playerCycleDuration = BOSS_TURN_INTERVAL + weapon.attackInterval;
  state.nextPlayerAt = now + state.playerCycleDuration;
  const bonus = state.nextAutoBonus;
  state.nextAutoBonus = 0;
  ui.autoActionText.textContent = "玩家回合 · " + action.name;
  pulseCombatClass("player-turn", weapon.recoverDelay);
  showLog("玩家向前突进，使用“" + action.name + "”");
  renderStatus();

  const currentRun = state.runId;
  window.setTimeout(function () {
    if (
      state &&
      state.runId === currentRun &&
      !state.ended &&
      state.activeActionId === actionId &&
      state.actionActor === "player"
    ) {
      state.actionActor = null;
      state.activeActionId = 0;
      renderStatus();
    }
  }, weapon.recoverDelay);
  window.setTimeout(function () {
    if (
      !state ||
      state.runId !== currentRun ||
      state.ended ||
      state.activeActionId !== actionId ||
      state.actionActor !== "player"
    ) {
      return;
    }
    settlePlayerAttack(action, bonus, now);
  }, weapon.impactDelay);
}

function settlePlayerAttack(action, bonus, now) {
  const result = damagePart(
    action.target,
    action.damage + bonus,
    action.armorDamage + Math.round(bonus * 1.2),
  );
  if (getIntent().part === action.target) {
    state.intentPressure += action.pressure + Math.round(bonus * 0.4);
  }
  ui.autoActionText.textContent = result.partBroken && state.bossHp > 0
    ? action.targetLabel + "破坏 · Boss眩晕"
    : action.name + "命中 · " + action.targetLabel;
  pulseCombatClass("boss-hit", 260);
  createFloat("-" + result.bossDamage, false);
  triggerWeaponAttackFx(currentWeaponMode(), Boolean(bonus));
  playWeaponAttackSound(currentWeaponMode());
  showLog(currentWeaponMode().name + "自动使用“" + action.name + "”，造成 " + result.bossDamage + " 点伤害");
  renderStatus();
  renderBossParts();
  renderBossSprite();
  checkIntentInterrupted(now);
  checkBattleEnd();
}

function activateCard(cardInstanceId, sourceButton, origin) {
  const now = performance.now();
  const playOrigin = origin === "auto" ? "auto" : "manual";
  if (
    !state ||
    state.phase !== "battle" ||
    state.ended ||
    isCardResolutionLocked() ||
    !isPlayerCardWindowOpen(now) ||
    (playOrigin === "auto" && state.cardPlayMode !== "auto") ||
    (playOrigin === "manual" && state.cardPlayMode !== "manual")
  ) {
    return false;
  }
  const handIndex = state.hand.findIndex(function (instance) {
    return instance.uid === cardInstanceId;
  });
  if (handIndex < 0) {
    return false;
  }
  if (playOrigin === "auto" && handIndex !== 0) {
    return false;
  }
  const instance = state.hand[handIndex];
  const card = getCard(instance.cardId);
  if (state.chain.length && now >= state.chainDeadline) {
    resolveChain();
    if (state.ended) {
      return false;
    }
  }
  const freeDuringBossStun = hasBossStunFreeCards(now);
  const energySpent = freeDuringBossStun ? 0 : card.cost;
  if (state.energy < energySpent) {
    showMessage("战术能量不足，无法激活“" + card.name + "”");
    updateCardStates(now);
    return false;
  }
  state.cardTurnResolving = true;
  endIntervention("card", now);

  const previous = state.chain.length ? state.chain[state.chain.length - 1].card : null;
  const link = previous ? getLink(previous, card) : getWeaponCardLink(card);
  const chainIndex = state.chain.length;
  const comboBonus = Math.round((chainIndex * 0.13 + link.bonus) * 100);

  state.energy -= energySpent;
  state.chain.push({ card: card, link: link.name, bonus: link.bonus, comboBonus: comboBonus });
  const fistSequenceActive = card.weaponId === "fists" || (previous && previous.weaponId === "fists");
  state.chainWindow = fistSequenceActive
    ? FIST_CHAIN_WINDOW
    : BASE_CHAIN_WINDOW + (hasCardInChain("armor") ? 650 : 0);
  state.chainDeadline = now + state.chainWindow;
  const presentationPayload = {
    card: card,
    chainIndex: chainIndex,
    link: link,
    comboBonus: comboBonus,
    previous: previous,
    queuedAt: now,
    runId: state.runId,
    presentationId: ++modulePresentationSerial,
    energySpent: energySpent,
    freeDuringBossStun: freeDuringBossStun,
    flowOwned: true,
    playOrigin: playOrigin,
    resolved: false,
  };
  state.videoPending = presentationPayload;
  const resolvedSourceButton = sourceButton || ui.cardHand.querySelector(
    '[data-card-instance="' + cardInstanceId + '"]',
  );
  if (resolvedSourceButton) {
    createCardProjectile(card, resolvedSourceButton);
  }
  state.hand.splice(handIndex, 1);
  state.discardPile.push(instance);
  drawNextCard();
  renderStatus();
  renderChain();
  playTone(state.chain.length - 1, state.chain.length >= 3, false);
  ui.liveHint.textContent = card.name +
    (freeDuringBossStun ? "免费释放" : "已释放") +
    " · 表现完成后结算效果";
  showLog(
    card.name + "卡牌指令已提交" +
      (freeDuringBossStun ? "，Boss倒地期间不消耗战术能量" : "，等待释放表现"),
  );

  if (!state.actionActor && !state.reactionActive) {
    startPendingModuleVideo();
  }
  return true;
}

function scheduleMaxChainResolve(currentRun, delay) {
  window.setTimeout(function () {
    if (
      state &&
      state.runId === currentRun &&
      !state.videoPlaying &&
      !state.videoPending &&
      state.chain.length >= 5
    ) {
      resolveChain();
    }
  }, delay);
}

function startPendingModuleVideo() {
  if (!state || !state.videoPending || state.videoPlaying || state.ended) {
    return;
  }

  const payload = state.videoPending;
  if (payload.runId !== state.runId || payload.resolved) {
    state.videoPending = null;
    return;
  }
  const now = performance.now();
  state.videoPending = null;
  state.activeVideoEffect = payload;
  state.videoPlaying = true;
  state.videoStartedAt = now;
  beginBossStunPresentationPause(now);
  state.chainDeadline += Math.max(0, now - payload.queuedAt);

  ui.moduleVideoType.textContent = payload.card.type;
  ui.moduleVideoTitle.textContent = payload.card.name;
  renderModuleVideoCombo(payload);
  const hasFrameSequence = Array.isArray(payload.card.frames) && payload.card.frames.length > 0;
  ui.moduleCinematic.className =
    "cinematic module-cinematic " +
    (payload.card.video
      ? "video-presentation"
      : "frame-presentation " + (hasFrameSequence ? "frame-sequence-presentation " : "") + "frame-" + payload.card.id);
  ui.moduleCinematic.style.setProperty("--module-color", payload.card.color);
  ui.moduleCinematic.setAttribute("aria-hidden", "false");
  updateCardStates(now);

  if (!payload.card.video) {
    ui.moduleVideo.classList.add("hidden");
    ui.moduleFrameStage.classList.remove("hidden");
    ui.moduleFrameStage.setAttribute("aria-hidden", "false");
    ui.moduleFrameIcon.src = hasFrameSequence ? payload.card.frames[0] : payload.card.icon;
    ui.moduleFrameIcon.alt = "";
    ui.moduleFrameName.textContent = payload.card.name;
    if (hasFrameSequence) {
      let frameIndex = 0;
      moduleFrameSequenceTimer = window.setInterval(function () {
        frameIndex = (frameIndex + 1) % payload.card.frames.length;
        ui.moduleFrameIcon.src = payload.card.frames[frameIndex];
      }, FIST_FRAME_INTERVAL);
    }
    modulePresentationTimer = window.setTimeout(function () {
      finishModuleVideo(false, payload);
    }, hasFrameSequence ? payload.card.frames.length * FIST_FRAME_INTERVAL : MODULE_FRAME_DURATION);
    return;
  }

  ui.moduleFrameStage.classList.add("hidden");
  ui.moduleFrameStage.setAttribute("aria-hidden", "true");
  ui.moduleVideo.classList.remove("hidden");
  ui.moduleVideo.loop = false;
  ui.moduleVideo.onended = function () {
    finishModuleVideo(false, payload);
  };
  ui.moduleVideo.onerror = function () {
    showLog(payload.card.name + "视频加载失败，改用即时结算");
    finishModuleVideo(false, payload);
  };
  ui.moduleVideo.src = payload.card.video;
  ui.moduleVideo.load();
  modulePresentationWatchdog = window.setTimeout(function () {
    showLog(payload.card.name + "表现播放超时，自动继续结算");
    finishModuleVideo(false, payload);
  }, MODULE_VIDEO_TIMEOUT);

  const playback = ui.moduleVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () {
      finishModuleVideo(false, payload);
    });
  }
}

function renderModuleVideoCombo(payload) {
  ui.moduleVideoIcons.innerHTML = "";
  const cardsToShow = payload.previous ? [payload.previous, payload.card] : [payload.card];
  cardsToShow.forEach(function (card, index) {
    if (index > 0) {
      const plus = document.createElement("span");
      plus.textContent = "+";
      ui.moduleVideoIcons.appendChild(plus);
    }
    const icon = document.createElement("img");
    icon.src = card.icon;
    icon.alt = "";
    ui.moduleVideoIcons.appendChild(icon);
  });

  if (payload.previous) {
    ui.moduleVideoComboName.textContent = payload.previous.name + " → " + payload.card.name;
    ui.moduleVideoComboEffect.textContent =
      payload.link.name + " · 前一张卡完成后触发当前技能";
  } else {
    ui.moduleVideoComboName.textContent = "独立释放";
    ui.moduleVideoComboEffect.textContent = "释放表现完成后，结算自身效果";
  }
}

function finishModuleVideo(skipped, expectedPayload) {
  const payload = expectedPayload || (state && state.activeVideoEffect);
  if (
    !state ||
    !payload ||
    !state.videoPlaying ||
    state.activeVideoEffect !== payload ||
    payload.resolved ||
    payload.runId !== state.runId ||
    state.ended
  ) {
    return;
  }

  payload.resolved = true;
  const finishedAt = performance.now();
  const elapsed = Math.max(0, finishedAt - state.videoStartedAt);
  endBossStunPresentationPause(finishedAt);
  state.videoPlaying = false;
  state.activeVideoEffect = null;
  state.videoStartedAt = 0;
  hideModuleVideo();
  state.nextTurnAt += elapsed;
  state.lastPlayerActionAt += elapsed;
  state.nextPlayerAt += elapsed;
  if (state.chainDeadline) {
    state.chainDeadline += elapsed;
  }
  if (skipped) {
    showLog("已跳过“" + payload.card.name + "”表现，继续结算卡牌效果");
  }

  const energySpent = typeof payload.energySpent === "number"
    ? payload.energySpent
    : payload.card.cost;
  applyCardEffect(payload.card, payload.chainIndex, payload.link, energySpent);
  if (!state || state.runId !== payload.runId || state.ended) {
    return;
  }
  updateCardStates(performance.now());
  if (payload.flowOwned) {
    finishPlayerCardTurn(payload, performance.now());
    return;
  }
  if (state.chain.length >= 5) {
    scheduleMaxChainResolve(payload.runId, 360);
  }
}

function hideModuleVideo() {
  if (!ui.moduleVideo || !ui.moduleCinematic) {
    return;
  }
  clearTimeout(modulePresentationTimer);
  clearTimeout(modulePresentationWatchdog);
  clearInterval(moduleFrameSequenceTimer);
  modulePresentationTimer = 0;
  modulePresentationWatchdog = 0;
  moduleFrameSequenceTimer = 0;
  ui.moduleVideo.onended = null;
  ui.moduleVideo.onerror = null;
  ui.moduleVideo.pause();
  ui.moduleVideo.removeAttribute("src");
  ui.moduleVideo.load();
  ui.moduleVideo.classList.remove("hidden");
  ui.moduleFrameStage.classList.add("hidden");
  ui.moduleFrameStage.setAttribute("aria-hidden", "true");
  ui.moduleCinematic.className = "cinematic module-cinematic hidden";
  ui.moduleCinematic.style.removeProperty("--module-color");
  ui.moduleCinematic.setAttribute("aria-hidden", "true");
}

function getLink(previous, current) {
  return linkRules[previous.id + ">" + current.id] || { name: "连续接入", bonus: 0.07 };
}

function hasCardInChain(cardId) {
  return state.chain.some(function (entry) {
    return entry.card.id === cardId;
  });
}

function applyCardEffect(card, chainIndex, link, energySpent) {
  const resolvedEnergySpent = typeof energySpent === "number" ? energySpent : card.cost;
  let multiplier = 1 + chainIndex * 0.13 + link.bonus;
  const boosted = state.moduleBoost > 0 && card.id !== "reactor";
  if (boosted) {
    multiplier += 0.25;
    state.moduleBoost -= 1;
  }
  pulseCombatClass("player-skill-action", 720);
  triggerModuleFx(card, chainIndex);

  if (card.weaponId === "fists") {
    applyFistSkillCard(card, multiplier, resolvedEnergySpent);
  } else if (card.id === "armor") {
    state.armorGuard += 1;
    showMessage("战甲过载接入，下一次受击将被大幅削减");
  } else if (card.id === "reactor") {
    state.energy = Math.min(MAX_ENERGY, state.energy + 3);
    state.moduleBoost = 2;
    createFloat("+3 战术能量", true);
    showMessage("方舟反应炉恢复3点战术能量，后续两个挂件获得强化");
  } else if (card.id === "jet") {
    state.jetGuard = true;
    state.nextAutoBonus += Math.round(13 * multiplier);
    showMessage("喷气背包强化下一张伤害挂件，并准备规避反击");
  } else if (card.id === "cannon") {
    applyModuleHit(card, Math.round(24 * multiplier), Math.round(48 * multiplier), Math.round(44 * multiplier), resolvedEnergySpent);
  } else if (card.id === "drone") {
    applyModuleHit(card, Math.round(18 * multiplier), Math.round(20 * multiplier), Math.round(16 * multiplier), resolvedEnergySpent);
  } else if (card.id === "gourd") {
    const healing = Math.min(MAX_PLAYER_HP - state.playerHp, Math.round(24 * multiplier));
    state.playerHp += healing;
    createFloat(healing > 0 ? "+" + healing : "生命已满", true, "heal");
    createUnitBurst(ui.playerUnit, 0.5, 0.52, card.color);
    showMessage(healing > 0 ? "酒葫芦恢复 " + healing + " 点生命" : "生命已满，酒意转化为连携节奏");
    showLog("酒葫芦已接入挂件链条");
  }

  renderStatus();
  renderBossParts();
  renderBossSprite();
  updateCardStates(performance.now());
  checkIntentInterrupted(performance.now());
  checkBattleEnd();
}

function applyFistSkillCard(card, multiplier, energySpent) {
  const targetIds = (card.targetParts || []).filter(function (partId) {
    return Boolean(state.parts[partId]);
  });
  if (!targetIds.length) {
    return;
  }

  const intentPartId = getIntent().part;
  const orderedTargetIds = targetIds.slice().sort(function (left, right) {
    if (left === intentPartId) return -1;
    if (right === intentPartId) return 1;
    return 0;
  });
  const multiTarget = orderedTargetIds.length > 1;
  const bossHpBefore = state.bossHp;
  const queuedBonus = state.nextAutoBonus;
  state.nextAutoBonus = 0;
  let aggregateBossDamage = 0;
  let anyPartBroken = false;
  const brokenPartIds = [];

  orderedTargetIds.forEach(function (targetId, index) {
    const target = state.parts[targetId];
    const exposedMultiplier = target.armor <= 0 ? card.exposedBonus || 1 : 1;
    const bonusDamage = index === 0 ? queuedBonus : 0;
    const damage = Math.round(card.damage * multiplier * exposedMultiplier) + bonusDamage;
    const armorDamage = Math.round(card.armorDamage * multiplier) +
      (index === 0 ? Math.round(queuedBonus * 1.2) : 0);
    const result = damagePart(targetId, damage, armorDamage, { suppressStun: multiTarget });
    aggregateBossDamage += result.bossDamage;
    anyPartBroken = anyPartBroken || result.partBroken;
    if (result.partBroken) {
      brokenPartIds.push(targetId);
    }
    if (!multiTarget) {
      createFloat("-" + result.bossDamage, false);
    }
    const burstPoints = {
      core: [0.5, 0.4],
      arms: [0.36, 0.48],
      legs: [0.54, 0.76],
    };
    const point = burstPoints[targetId] || [0.5, 0.44];
    window.setTimeout(function () {
      createUnitBurst(ui.bossUnit, point[0], point[1], card.color);
    }, index * 90);
    if (multiTarget) {
      state.bossHp = bossHpBefore;
    }
  });

  if (multiTarget) {
    aggregateBossDamage = Math.max(1, Math.round(aggregateBossDamage / orderedTargetIds.length));
    state.bossHp = Math.max(0, bossHpBefore - aggregateBossDamage);
    createFloat("全域 -" + aggregateBossDamage, false);
    if (brokenPartIds.length && state.bossHp > 0) {
      beginBossStun(brokenPartIds[0], performance.now());
    }
  }

  let followUpDamage = 0;
  if (
    !multiTarget &&
    state.bossHp > 0 &&
    card.followUpChance &&
    Math.random() < card.followUpChance
  ) {
    const targetId = orderedTargetIds[0];
    const target = state.parts[targetId];
    const followUpBase = Math.round((card.followUpDamage || 0) * multiplier);
    const followUp = damagePart(targetId, followUpBase, 0);
    followUpDamage = followUp.bossDamage;
    aggregateBossDamage += followUpDamage;
    anyPartBroken = anyPartBroken || followUp.partBroken;
    window.setTimeout(function () {
      createFloat("追击 -" + followUpDamage, false);
      createUnitBurst(ui.bossUnit, targetId === "legs" ? 0.53 : 0.5, targetId === "legs" ? 0.75 : 0.4, "#ffe0a3");
    }, 140);
  }

  if (targetIds.includes(intentPartId)) {
    state.intentPressure += Math.round((card.pressure || 0) * multiplier);
  }
  if (aggregateBossDamage > 0 && energySpent > 0) {
    addSoulEnergy(
      energySpent * SOUL_GAIN_PER_SPENT_ENERGY,
      card.name + "消耗" + energySpent + "点战术能量并造成伤害",
    );
  }

  pulseCombatClass("boss-hit", multiTarget ? 520 : 380);
  pulseCombatClass("shake", multiTarget ? 520 : 360);
  showMessage(
    card.name + "命中" +
      (multiTarget ? "全部位" : state.parts[orderedTargetIds[0]].name) +
      "，造成 " + aggregateBossDamage + " 点伤害" +
      (followUpDamage > 0 ? " · 触发追击" : "") +
      (anyPartBroken && state.bossHp > 0 ? " · 部位破坏，Boss眩晕5秒" : ""),
  );
  showLog(
    "拳套技能“" + card.name + "”已执行" +
      (queuedBonus > 0 ? "，喷气增幅 +" + queuedBonus : ""),
  );
}

function applyModuleHit(card, damage, armorDamage, pressure, energySpent) {
  const queuedBonus = state.nextAutoBonus;
  if (queuedBonus > 0) {
    damage += queuedBonus;
    armorDamage += Math.round(queuedBonus * 1.2);
    pressure += Math.round(queuedBonus * 0.4);
    state.nextAutoBonus = 0;
  }
  const targetId = getIntent().part;
  const target = state.parts[targetId];
  const result = damagePart(targetId, damage, armorDamage);
  state.intentPressure += pressure;
  if (result.bossDamage > 0 && energySpent > 0) {
    addSoulEnergy(
      energySpent * SOUL_GAIN_PER_SPENT_ENERGY,
      card.name + "消耗" + energySpent + "点战术能量并造成伤害",
    );
  }
  createFloat("-" + result.bossDamage, false);
  createUnitBurst(ui.bossUnit, 0.5, 0.42, card.color);
  pulseCombatClass("boss-hit", 360);
  pulseCombatClass("shake", 360);
  showMessage(
    card.name + "轰击" + target.name + "，造成 " + result.bossDamage + " 点伤害" +
      (result.armorHit ? "，护甲损坏 " + result.armorHit : "") +
      (result.partBroken && state.bossHp > 0 ? " · 部位破坏，Boss眩晕5秒" : ""),
  );
  showLog(card.name + "已真实介入自动战斗");
  if (queuedBonus > 0) {
    showLog("喷气背包增幅已接入本次伤害：+" + queuedBonus);
  }
}

function damagePart(partId, damage, armorDamage, options) {
  const resolvedOptions = options || {};
  const part = state.parts[partId];
  const armorBefore = part.armor;
  const hpBefore = part.hp;
  let armorHit = 0;
  let partHit = 0;
  if (part.armor > 0) {
    armorHit = Math.min(part.armor, armorDamage);
    part.armor -= armorHit;
    const overflow = Math.max(0, armorDamage - armorHit);
    if (part.armor <= 0 && overflow > 0) {
      partHit = Math.min(part.hp, Math.round(overflow * 0.5));
      part.hp -= partHit;
    }
  } else {
    partHit = Math.min(part.hp, damage);
    part.hp -= partHit;
  }
  const bossDamage = armorBefore > 0 ? Math.max(2, Math.round(damage * 0.2)) : damage;
  state.bossHp = Math.max(0, state.bossHp - bossDamage);
  const result = {
    bossDamage: bossDamage,
    armorHit: armorHit,
    partHit: partHit,
    armorBroken: armorBefore > 0 && part.armor <= 0,
    partBroken: hpBefore > 0 && part.hp <= 0,
  };
  if (result.partBroken && !resolvedOptions.suppressStun) {
    beginBossStun(partId, performance.now());
  }
  return result;
}

function resolveChain() {
  if (!state.chain.length || state.ended) {
    return;
  }
  const resolved = state.chain.slice();
  const count = resolved.length;
  const title = chainTiers[Math.min(count, chainTiers.length - 1)];
  const finishers = [0, 0, 7, 17, 30, 48];
  const finisher = finishers[Math.min(count, finishers.length - 1)];
  state.chain = [];
  state.chainDeadline = 0;
  state.lastResolvedChain = resolved;
  state.lastChainTitle = title;

  if (finisher > 0) {
    const targetId = getIntent().part;
    const result = damagePart(targetId, finisher, Math.round(finisher * 1.35));
    state.intentPressure += Math.round(finisher * 0.8);
    createFloat("联携 -" + result.bossDamage, false);
    createUnitBurst(ui.bossUnit, 0.5, 0.42, count >= 4 ? "#fff0a7" : "#67d5ff");
    if (count >= 3) {
      createUnitBeam(ui.playerUnit, 0.58, 0.32, ui.bossUnit, 0.48, 0.4, "#71dcff");
    }
    if (count >= 4) {
      createUnitBeam(ui.playerUnit, 0.58, 0.48, ui.bossUnit, 0.52, 0.48, "#ffb25c");
      pulseCombatClass("shake", 520);
    }
    showMessage(
      title + "完成，追加 " + result.bossDamage + " 点连携伤害" +
        (result.partBroken && state.bossHp > 0 ? " · 部位破坏，Boss眩晕5秒" : ""),
    );
  } else {
    showMessage("单模块完成介入，自动战斗继续");
  }
  ui.liveHint.textContent = count >= 3 ? title + "已结算，等待下一次介入" : "战斗持续进行，可重新建立连携";
  renderStatus();
  renderBossParts();
  renderBossSprite();
  renderChain();
  checkIntentInterrupted(performance.now());
  checkBattleEnd();

  clearTimeout(resolvedChainTimer);
  const currentRun = state.runId;
  resolvedChainTimer = window.setTimeout(function () {
    if (!state || state.runId !== currentRun) {
      return;
    }
    state.lastResolvedChain = [];
    state.lastChainTitle = "";
    renderChain();
  }, 1700);
}

function checkIntentInterrupted(now) {
  if (state.ended || state.intentInterrupted || state.bossStunned) {
    return;
  }
  const intent = getIntent();
  const part = state.parts[intent.part];
  if (state.intentPressure < intent.threshold && part.hp > 0) {
    return;
  }
  state.intentInterrupted = true;
  state.bossImpactAt = 0;
  state.reactionActive = false;
  state.reactionChoice = null;
  showMessage(intent.name + "被模块联携打断，Boss失去进攻节奏");
  showLog("玩家的实时介入改变了Boss行动");
  createFloat("打断", false);
  pulseCombatClass("shake", 420);
  pulseCombatClass("boss-stagger", 620);
  renderBossParts();
  renderReactionControls();
}

function resolveBossAttack(now) {
  if (
    state.ended ||
    state.bossStunned ||
    state.cardTurnResolving ||
    state.turnActor !== "boss" ||
    state.actionActor ||
    state.reactionActive ||
    state.lastAutoActor === "boss"
  ) {
    return;
  }
  const intent = getIntent();
  const currentRun = state.runId;
  const actionId = ++state.actionSerial;
  state.actionActor = "boss";
  state.activeActionId = actionId;
  state.lastAutoActor = "boss";
  state.bossImpactAt = state.intentInterrupted ? 0 : now + BOSS_IMPACT_DELAY;
  state.turnActor = "player";
  state.nextTurnAt =
    now + Math.max(currentWeaponMode().attackInterval, ATTACK_RECOVER_DELAY + MIN_TURN_GAP);
  state.nextPlayerAt = state.nextTurnAt;
  state.reactionActive = !state.intentInterrupted;
  state.reactionChoice = null;
  ui.autoActionText.textContent = "Boss回合 · " + intent.name;
  updateCombatStance();
  renderStatus();
  renderReactionControls();
  updateCardStates(now);

  if (state.intentInterrupted) {
    window.setTimeout(function () {
      if (
        !state ||
        state.runId !== currentRun ||
        state.ended ||
        state.activeActionId !== actionId ||
        state.actionActor !== "boss"
      ) {
        return;
      }
      showMessage(intent.name + "已被打断，Boss本回合无法攻击");
      showLog("Boss行动落空，固定回合节拍继续");
      pulseCombatClass("boss-stagger", 620);
      advanceIntent();
    }, 360);
  } else {
    showMessage(intent.responseHint);
    window.setTimeout(function () {
      if (
        !state ||
        state.runId !== currentRun ||
        state.ended ||
        state.activeActionId !== actionId ||
        state.actionActor !== "boss" ||
        state.intentInterrupted ||
        state.bossStunned
      ) {
        return;
      }
      pulseCombatClass("boss-turn", BOSS_LUNGE_DURATION);
    }, BOSS_LUNGE_START_DELAY);
    window.setTimeout(function () {
      if (
        !state ||
        state.runId !== currentRun ||
        state.ended ||
        state.activeActionId !== actionId ||
        state.actionActor !== "boss"
      ) {
        return;
      }
      settleBossAttack(intent);
    }, BOSS_IMPACT_DELAY);
  }

  window.setTimeout(function () {
    if (
      state &&
      state.runId === currentRun &&
      !state.ended &&
      state.activeActionId === actionId &&
      state.actionActor === "boss"
    ) {
      state.actionActor = null;
      state.activeActionId = 0;
      state.reactionActive = false;
      state.bossImpactAt = 0;
      updateCombatStance();
      renderStatus();
      renderReactionControls();
      updateCardStates(performance.now());
    }
  }, ATTACK_RECOVER_DELAY);
}

function settleBossAttack(intent) {
  state.reactionActive = false;
  state.bossImpactAt = 0;
  if (state.intentInterrupted) {
    showMessage(intent.name + "在命中前被打断");
    pulseCombatClass("boss-stagger", 620);
    advanceIntent();
    return;
  }

  let damage = intent.damage;
  const feedback = [];
  const choice = state.reactionChoice;
  const validResponse = choice && intent.responses.includes(choice);

  if (state.bossHp <= MAX_BOSS_HP * 0.5) {
    damage += 5;
  }

  if (validResponse && choice !== "block") {
    damage = 0;
    feedback.push(choice === "left" ? "左闪成功" : "右闪成功");
    pulseCombatClass(choice === "left" ? "player-dodge-left" : "player-dodge-right", 620);
  } else if (validResponse && choice === "block") {
    damage = Math.max(1, Math.round(damage * 0.5));
    feedback.push("格挡成功");
    pulseCombatClass("player-block", 620);
    state.bossHp = Math.max(0, state.bossHp - 4);
    createFloat("弹反 -4", false);
  } else if (choice) {
    feedback.push("应对方向错误");
  } else {
    feedback.push("未进行防御");
  }

  if (validResponse) {
    addSoulEnergy(
      SOUL_QTE_GAIN,
      choice === "block" ? "成功格挡Boss攻击" : "成功闪避Boss攻击",
    );
  }

  if (damage > 0 && state.armorGuard > 0) {
    damage = Math.round(damage * 0.52);
    state.armorGuard -= 1;
    feedback.push("战甲承压");
  }
  if (damage > 0 && state.jetGuard) {
    damage = Math.round(damage * 0.62);
    state.jetGuard = false;
    feedback.push("喷气变轨");
  }
  state.playerHp = Math.max(0, state.playerHp - damage);
  if (damage > 0) {
    pulseCombatClass("shake", 460);
    pulseCombatClass("player-hit", 420);
    createFloat("-" + damage, true);
    createUnitBurst(ui.playerUnit, 0.5, 0.53, "#de554d");
  } else {
    createFloat("闪避", true);
  }
  showMessage(
    (damage > 0 ? "受到“" + intent.name + "”攻击，损失 " + damage + " 点生命" : intent.name + "被完全闪避") +
      (feedback.length ? " · " + feedback.join(" + ") : ""),
  );
  showLog("Boss完成" + intent.name + "，固定回合节拍继续");
  renderStatus();
  checkBattleEnd();
  if (state.ended) {
    return;
  }
  if (state.playerHp <= 0) {
    endBattle(false, "没有及时用战甲与挂件改变Boss的进攻节奏。");
    return;
  }
  advanceIntent();
}

function advanceIntent() {
  let attempts = 0;
  do {
    state.intentIndex = (state.intentIndex + 1) % intentBlueprints.length;
    attempts += 1;
  } while (state.parts[getIntent().part].hp <= 0 && attempts < intentBlueprints.length);
  state.intentPressure = 0;
  state.intentInterrupted = false;
  state.reactionChoice = null;
  state.reactionActive = false;
  renderIntentBase();
  renderBossParts();
  renderReactionControls();
}

function renderReactionControls() {
  const intent = getIntent();
  ui.reactionControls.classList.toggle("active", state.reactionActive);
  ui.reactionControls.classList.toggle("resolved", Boolean(state.reactionChoice));
  ui.reactionHint.textContent = state.reactionActive
    ? intent.responseHint
    : state.intentInterrupted
      ? "该技能已被挂件打断"
      : "Boss出手时输入";
  ui.reactionControls.querySelectorAll("button[data-defense]").forEach(function (button) {
    const selected = button.dataset.defense === state.reactionChoice;
    button.classList.toggle("selected", selected);
    button.disabled = !state.reactionActive || Boolean(state.reactionChoice);
  });
}

function handleDefenseInput(choice) {
  if (!state || state.ended || !state.reactionActive || state.reactionChoice) {
    return;
  }
  state.reactionChoice = choice;
  const labels = { left: "左闪", block: "格挡", right: "右闪" };
  showLog("防御输入：" + labels[choice]);
  renderReactionControls();
}

function createCardProjectile(card, sourceButton) {
  const sourceRect = sourceButton.getBoundingClientRect();
  let target = ui.playerUnit;
  if (card.weaponId) {
    target = ui.bossUnit;
  } else if (card.id === "reactor" || card.id === "jet" || card.id === "cannon") {
    target = ui.playerUnit.querySelector('[data-socket="' + card.id + '"]') || ui.playerUnit;
  } else if (card.id === "drone") {
    target = ui.droneUnit;
  }
  const targetRect = target.getBoundingClientRect();
  const startX = sourceRect.left + sourceRect.width / 2 - 24;
  const startY = sourceRect.top + sourceRect.height / 2 - 24;
  const targetX = targetRect.left + targetRect.width / 2 - 24;
  const targetY = targetRect.top + targetRect.height / 2 - 24;
  const projectile = document.createElement("div");
  projectile.className = "card-projectile";
  projectile.style.setProperty("--card-color", card.color);
  projectile.style.setProperty("--throw-x", targetX - startX + "px");
  projectile.style.setProperty("--throw-y", targetY - startY + "px");
  projectile.style.left = startX + "px";
  projectile.style.top = startY + "px";
  projectile.innerHTML = '<img src="' + card.icon + '" alt="" /><strong>' + card.name + "</strong>";
  document.body.appendChild(projectile);
  projectile.addEventListener("animationend", function () {
    projectile.remove();
  });
}

function triggerModuleFx(card, chainIndex) {
  const fx = document.createElement("i");
  fx.className = "cinematic-fx fx-" + card.id;
  fx.style.setProperty("--fx-color", card.color);
  ui.effectLayer.appendChild(fx);
  window.setTimeout(function () {
    fx.remove();
  }, 780);

  if (card.id === "armor") {
    createUnitBurst(ui.playerUnit, 0.42, 0.48, card.color);
  } else if (card.weaponId === "fists") {
    triggerWeaponAttackFx(currentWeaponMode(), chainIndex >= 1);
    playWeaponAttackSound(currentWeaponMode());
    if (card.id === "fist_leg_drive") {
      createUnitBeam(ui.playerUnit, 0.58, 0.68, ui.bossUnit, 0.52, 0.76, card.color);
      createUnitBurst(ui.bossUnit, 0.52, 0.76, card.color);
    } else if (card.id === "fist_flurry") {
      createUnitBeam(ui.playerUnit, 0.58, 0.34, ui.bossUnit, 0.48, 0.42, card.color);
      window.setTimeout(function () {
        createUnitBurst(ui.bossUnit, 0.36, 0.48, card.color);
        createUnitBurst(ui.bossUnit, 0.54, 0.76, card.color);
      }, 120);
    }
  } else if (card.id === "reactor") {
    pulseSocket("reactor");
  } else if (card.id === "jet") {
    pulseSocket("jet");
    pulseCombatClass("jet-lift", 760);
  } else if (card.id === "cannon") {
    pulseSocket("cannon");
    createUnitBeam(ui.playerUnit, 0.68, 0.28, ui.bossUnit, 0.46, 0.42, card.color);
  } else if (card.id === "drone") {
    ui.droneUnit.classList.add("active");
    createUnitBeam(ui.droneUnit, 0.5, 0.5, ui.bossUnit, 0.45, 0.36, card.color);
    window.setTimeout(function () {
      ui.droneUnit.classList.remove("active");
    }, 720);
  } else if (card.id === "gourd") {
    createUnitBurst(ui.playerUnit, 0.5, 0.51, card.color);
    pulseCombatClass("player-heal", 720);
  }
  if (chainIndex >= 2) {
    pulseCombatClass("shake", 330 + chainIndex * 45);
  }
}

function triggerWeaponAttackFx(weapon, boosted) {
  const hitColor = boosted ? "#79e7ff" : weapon.color;
  if (weapon.id === "fists") {
    createUnitBurst(ui.bossUnit, 0.43, 0.38, hitColor);
    window.setTimeout(function () {
      createUnitBurst(ui.bossUnit, 0.6, 0.48, hitColor);
    }, 115);
    pulseCombatClass("weapon-hit-fists", 360);
  } else if (weapon.id === "greatsword") {
    createUnitBeam(ui.playerUnit, 0.62, 0.34, ui.bossUnit, 0.5, 0.43, hitColor);
    createUnitBurst(ui.bossUnit, 0.5, 0.43, hitColor);
    pulseCombatClass("weapon-hit-greatsword", 520);
    pulseCombatClass("shake", 280);
  } else {
    createUnitBeam(ui.playerUnit, 0.58, 0.42, ui.bossUnit, 0.5, 0.42, hitColor);
    createUnitBurst(ui.bossUnit, 0.5, 0.42, hitColor);
    pulseCombatClass("weapon-hit-bow", 420);
  }
}

function pulseSocket(id) {
  const socket = ui.playerUnit.querySelector('[data-socket="' + id + '"]');
  if (!socket) {
    return;
  }
  socket.classList.remove("active");
  void socket.offsetWidth;
  socket.classList.add("active");
}

function pulseCombatClass(className, duration) {
  ui.battlefield.classList.remove(className);
  void ui.battlefield.offsetWidth;
  ui.battlefield.classList.add(className);
  window.setTimeout(function () {
    ui.battlefield.classList.remove(className);
  }, duration);
}

function createFloat(text, player, kind) {
  const point = getCombatPoint(player ? ui.playerUnit : ui.bossUnit, 0.5, player ? 0.28 : 0.34);
  const item = document.createElement("b");
  item.className = "damage-float" + (player ? " player" : "") + (kind ? " " + kind : "");
  item.style.setProperty("--x", point.x);
  item.style.setProperty("--y", point.y);
  item.textContent = text;
  ui.floatingLayer.appendChild(item);
  window.setTimeout(function () {
    item.remove();
  }, 950);
}

function getCombatPoint(element, xRatio, yRatio) {
  const stageRect = ui.battlefield.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const x = Math.max(0, Math.min(stageRect.width, elementRect.left - stageRect.left + elementRect.width * xRatio));
  const y = Math.max(0, Math.min(stageRect.height, elementRect.top - stageRect.top + elementRect.height * yRatio));
  return {
    x: (x / stageRect.width) * 100 + "%",
    y: (y / stageRect.height) * 100 + "%",
    xPixels: x,
    yPixels: y,
  };
}

function createUnitBurst(element, xRatio, yRatio, color) {
  const point = getCombatPoint(element, xRatio, yRatio);
  createBurst(point.x, point.y, color);
}

function createUnitBeam(fromElement, fromX, fromY, toElement, toX, toY, color) {
  const start = getCombatPoint(fromElement, fromX, fromY);
  const end = getCombatPoint(toElement, toX, toY);
  const deltaX = end.xPixels - start.xPixels;
  const deltaY = end.yPixels - start.yPixels;
  createBeam(
    start.x,
    start.y,
    Math.hypot(deltaX, deltaY) + "px",
    (Math.atan2(deltaY, deltaX) * 180) / Math.PI + "deg",
    color,
  );
}

function createBurst(x, y, color) {
  const item = document.createElement("i");
  item.className = "energy-burst";
  item.style.setProperty("--x", x);
  item.style.setProperty("--y", y);
  item.style.setProperty("--fx", color);
  ui.effectLayer.appendChild(item);
  window.setTimeout(function () {
    item.remove();
  }, 800);
}

function createBeam(x, y, length, angle, color) {
  const item = document.createElement("i");
  item.className = "energy-beam";
  item.style.setProperty("--x", x);
  item.style.setProperty("--y", y);
  item.style.setProperty("--length", length);
  item.style.setProperty("--angle", angle);
  item.style.setProperty("--fx", color);
  ui.effectLayer.appendChild(item);
  window.setTimeout(function () {
    item.remove();
  }, 600);
}

function showMessage(text) {
  clearTimeout(messageTimer);
  ui.battleMessage.textContent = text;
  ui.battleMessage.classList.add("visible");
  messageTimer = window.setTimeout(function () {
    ui.battleMessage.classList.remove("visible");
  }, 1900);
}

function showLog(text) {
  clearTimeout(logTimer);
  ui.compactLog.textContent = text;
  ui.compactLog.classList.add("visible");
  logTimer = window.setTimeout(function () {
    ui.compactLog.classList.remove("visible");
  }, 2400);
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playFrequencySweep(config, delay, volume) {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const startAt = context.currentTime + (delay || 0);
  const duration = config.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = config.wave;
  oscillator.frequency.setValueAtTime(config.start, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, config.end), startAt + duration);
  gain.gain.setValueAtTime(volume || 0.045, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playWeaponAttackSound(weapon) {
  try {
    playFrequencySweep(weapon.sound, 0, weapon.id === "greatsword" ? 0.075 : 0.046);
    if (weapon.id === "fists") {
      playFrequencySweep(weapon.sound, 0.09, 0.036);
    }
  } catch (error) {
    // Weapon audio is supplementary feedback.
  }
}

function playTone(chainIndex, strong, failed) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = failed ? "sawtooth" : chainIndex >= 3 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(failed ? 120 : 330 + chainIndex * 105 + (strong ? 80 : 0), now);
    gain.gain.setValueAtTime(failed ? 0.05 : 0.045 + chainIndex * 0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.38);
  } catch (error) {
    // Audio feedback is optional.
  }
}

function checkBattleEnd() {
  if (state.bossHp <= 0) {
    endBattle(true, "自动战斗与实时模块介入共同击倒了巨兽。");
  }
}

function endBattle(victory, copy) {
  if (!state || state.ended) {
    return;
  }
  setBattleUiHidden(false, false);
  state.ended = true;
  state.phase = "ended";
  setGmPanelOpen(false, false);
  ui.gmTools.hidden = true;
  state.actionActor = null;
  state.activeActionId = 0;
  state.cardTurnResolving = false;
  state.cardDragActive = false;
  draggedCardUid = null;
  suppressCardClickUntil = 0;
  pointerCardDrag = null;
  nativeCardDragActive = false;
  state.reactionActive = false;
  state.bossImpactAt = 0;
  state.bossStunned = false;
  state.bossStunStartedAt = 0;
  state.bossStunEndsAt = 0;
  state.bossStunPartId = null;
  state.bossStunAdvanceIntent = false;
  state.bossStunPausedRemaining = null;
  state.bossStunResumeActor = "boss";
  clearCardPlayCooldown();
  ui.battlefield.classList.remove("boss-stunned");
  ui.bossUnit.classList.remove("is-stunned");
  ui.intentBanner.classList.remove("stunned");
  state.videoPending = null;
  if (state.activeVideoEffect) {
    state.activeVideoEffect.resolved = true;
  }
  state.activeVideoEffect = null;
  state.videoPlaying = false;
  state.videoStartedAt = 0;
  hideModuleVideo();
  if (state.ultimateHolding) {
    clearSoulUltimateHoldState();
  }
  state.ultimateCasting = false;
  state.ultimateCastStartedAt = 0;
  state.ultimateCastPauseApplied = 0;
  hideUltimateCinematic();
  ui.commandDeck.classList.remove("ultimate-holding", "ultimate-casting");
  ui.battlefield.classList.remove(
    "ultimate-holding",
    "ultimate-casting",
    "ultimate-tier-1",
    "ultimate-tier-2",
    "ultimate-tier-3",
    "ultimate-tier-4",
  );
  clearInterval(battleTimer);
  battleTimer = 0;
  updateCombatStance();
  ui.commandDeck.classList.add("locked");
  ui.resultEyebrow.textContent = victory ? "挑战完成" : "战斗失败";
  ui.resultTitle.textContent = victory ? "巨兽已倒下" : "战斗化身失去行动";
  ui.resultCopy.textContent = copy;
  ui.resultOverlay.classList.remove("hidden");
  window.requestAnimationFrame(function () {
    ui.resultRestart.focus({ preventScroll: true });
  });
  renderStatus();
  updateCardStates(performance.now());
  renderReactionControls();
}

ui.resetButton.addEventListener("click", function () {
  resetGame("preparation");
});
ui.resultRestart.addEventListener("click", function () {
  resetGame("preparation");
});
ui.preparationMonsterNext.addEventListener("click", function () {
  setPreparationStep("loadout");
});
ui.preparationBackToMonster.addEventListener("click", function () {
  setPreparationStep("monster");
});
ui.preparationConfirm.addEventListener("click", startPreparedBattle);
ui.preparationStyleOptions.forEach(function (button) {
  button.addEventListener("click", function () {
    selectPreparedStyle(button.dataset.styleId);
  });
});
ui.gmToggle.addEventListener("click", function () {
  if (state && state.battleUiHidden) {
    setBattleUiHidden(false, true);
    return;
  }
  setGmPanelOpen(ui.gmPanel.hidden);
});
ui.gmClose.addEventListener("click", function () {
  setGmPanelOpen(false);
});
ui.gmActions.forEach(function (button) {
  button.addEventListener("click", function () {
    applyGmAction(button.dataset.gmAction);
  });
});
ui.cardModeSwitch.addEventListener("click", function (event) {
  const button = event.target.closest("[data-card-play-mode]");
  if (!button || button.disabled) {
    return;
  }
  setCardPlayMode(button.dataset.cardPlayMode);
});
ui.cardHand.addEventListener("dragover", function (event) {
  if (!draggedCardUid || isCardReorderLocked() || event.target.closest(".module-card")) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
});
ui.cardHand.addEventListener("drop", function (event) {
  if (!draggedCardUid || isCardReorderLocked() || event.target.closest(".module-card")) {
    return;
  }
  event.preventDefault();
  moveHandCard(draggedCardUid, null, true);
});
document.addEventListener("mousemove", function (event) {
  if (!mouseCardDrag) {
    return;
  }
  if (isCardReorderLocked()) {
    finishCardDrag(true);
    return;
  }
  const distance = Math.hypot(
    event.clientX - mouseCardDrag.startX,
    event.clientY - mouseCardDrag.startY,
  );
  if (!mouseCardDrag.active && distance < 8) {
    return;
  }
  mouseCardDrag.active = true;
  draggedCardUid = mouseCardDrag.uid;
  suppressCardClickUntil = Number.POSITIVE_INFINITY;
  const source = ui.cardHand.querySelector(
    '[data-card-instance="' + mouseCardDrag.uid + '"]',
  );
  if (source) {
    source.classList.add("card-dragging");
  }
  ui.cardHand.classList.add("drag-active");
  ui.cardHand.querySelectorAll(".drag-before, .drag-after").forEach(function (candidate) {
    candidate.classList.remove("drag-before", "drag-after");
  });
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const target = hit ? hit.closest(".module-card[data-card-instance]") : null;
  if (target && target.dataset.cardInstance !== mouseCardDrag.uid) {
    const rect = target.getBoundingClientRect();
    const placeAfter = event.clientX > rect.left + rect.width / 2;
    target.classList.toggle("drag-before", !placeAfter);
    target.classList.toggle("drag-after", placeAfter);
  }
  event.preventDefault();
});
document.addEventListener("mouseup", function (event) {
  if (!mouseCardDrag || event.button !== 0) {
    return;
  }
  const drag = mouseCardDrag;
  mouseCardDrag = null;
  if (!drag.active) {
    state.cardDragActive = false;
    return;
  }
  event.preventDefault();
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const target = hit ? hit.closest(".module-card[data-card-instance]") : null;
  if (target && target.dataset.cardInstance !== drag.uid) {
    const rect = target.getBoundingClientRect();
    moveHandCard(drag.uid, target.dataset.cardInstance, event.clientX > rect.left + rect.width / 2);
    return;
  }
  if (hit && hit.closest(".card-hand")) {
    const handRect = ui.cardHand.getBoundingClientRect();
    const moveToEnd = event.clientX >= handRect.left + handRect.width / 2;
    const edgeInstance = moveToEnd ? state.hand[state.hand.length - 1] : state.hand[0];
    if (edgeInstance && edgeInstance.uid !== drag.uid) {
      moveHandCard(drag.uid, edgeInstance.uid, moveToEnd);
      return;
    }
  }
  finishCardDrag(true);
});
document.addEventListener("pointerup", function (event) {
  if (
    pointerCardDrag &&
    pointerCardDrag.pointerId === event.pointerId &&
    !nativeCardDragActive
  ) {
    finishCardDrag(true);
  }
});
document.addEventListener("pointercancel", function (event) {
  if (
    pointerCardDrag &&
    pointerCardDrag.pointerId === event.pointerId &&
    !nativeCardDragActive
  ) {
    finishCardDrag(true);
  }
});
window.addEventListener("blur", function () {
  if (state && state.cardDragActive && !nativeCardDragActive) {
    finishCardDrag(true);
  }
});
ui.soulUltimateButton.addEventListener("pointerdown", function (event) {
  if (event.button !== 0) {
    return;
  }
  if (!beginSoulUltimateHold({ pointerId: event.pointerId })) {
    return;
  }
  event.preventDefault();
  try {
    ui.soulUltimateButton.setPointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture is an enhancement; pointerup still works when the pointer stays on the control.
  }
});
ui.soulUltimateButton.addEventListener("pointerup", function (event) {
  if (!state || !state.ultimateHolding || state.ultimatePointerId !== event.pointerId) {
    return;
  }
  event.preventDefault();
  if (state.ultimateCancelHovered) {
    cancelSoulUltimateHold(false);
  } else {
    releaseSoulUltimateHold();
  }
  try {
    if (ui.soulUltimateButton.hasPointerCapture(event.pointerId)) {
      ui.soulUltimateButton.releasePointerCapture(event.pointerId);
    }
  } catch (error) {
    // Capture may already have been released by the browser.
  }
});
ui.soulUltimateButton.addEventListener("pointermove", function (event) {
  if (
    !state ||
    !state.ultimateHolding ||
    state.ultimatePointerId !== event.pointerId ||
    !ui.soulCancelTarget
  ) {
    return;
  }
  const rect = ui.soulCancelTarget.getBoundingClientRect();
  const padding = 5;
  const isInside =
    event.clientX >= rect.left - padding &&
    event.clientX <= rect.right + padding &&
    event.clientY >= rect.top - padding &&
    event.clientY <= rect.bottom + padding;
  if (state.ultimateCancelHovered === isInside) {
    return;
  }
  state.ultimateCancelHovered = isInside;
  ui.liveHint.textContent = isInside
    ? "松手取消终结技 · 灵魂能量不会消耗"
    : "灵魂终结技蓄力中 · 松手释放，拖至左上叉号取消";
  renderSoulUltimate(performance.now());
});
ui.soulUltimateButton.addEventListener("pointercancel", function (event) {
  if (state && state.ultimateHolding && state.ultimatePointerId === event.pointerId) {
    cancelSoulUltimateHold(true);
  }
});
ui.soulUltimateButton.addEventListener("lostpointercapture", function (event) {
  if (state && state.ultimateHolding && state.ultimatePointerId === event.pointerId) {
    cancelSoulUltimateHold(true);
  }
});
ui.soulUltimateButton.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});
ui.soulUltimateButton.addEventListener("keydown", function (event) {
  if (event.key !== " " && event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (event.repeat) {
    return;
  }
  beginSoulUltimateHold({ key: event.key });
});
ui.soulUltimateButton.addEventListener("keyup", function (event) {
  if (event.key !== " " && event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (state && state.ultimateHolding && state.ultimateInputKey === event.key) {
    releaseSoulUltimateHold();
  }
});
ui.reactionControls.querySelectorAll("button[data-defense]").forEach(function (button) {
  button.addEventListener("click", function () {
    handleDefenseInput(button.dataset.defense);
  });
});
ui.moduleVideoSkip.addEventListener("click", function () {
  finishModuleVideo(true, state && state.activeVideoEffect);
});
window.addEventListener("keydown", function (event) {
  if (!state) {
    return;
  }
  if (event.key === "Escape" && state.battleUiHidden) {
    event.preventDefault();
    setBattleUiHidden(false, true);
    return;
  }
  if (event.key === "Escape" && !ui.gmPanel.hidden) {
    event.preventDefault();
    setGmPanelOpen(false);
    return;
  }
  if (state.phase === "preparation") {
    if (event.isComposing) {
      return;
    }
    if (event.key === "Escape" && preparationStep === "loadout") {
      event.preventDefault();
      setPreparationStep("monster");
      return;
    }
    if (event.key === "Enter") {
      const interactiveTarget = event.target instanceof Element
        ? event.target.closest("button, a, input, select, textarea")
        : null;
      if (event.repeat || interactiveTarget) {
        return;
      }
      event.preventDefault();
      if (preparationStep === "monster") {
        setPreparationStep("loadout");
      } else {
        startPreparedBattle();
      }
    }
    return;
  }
  if (state.phase !== "battle") {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === "m" && state && state.videoPlaying) {
    event.preventDefault();
    finishModuleVideo(true, state.activeVideoEffect);
    return;
  }
  if (key === "a" || key === "w" || key === "d") {
    handleDefenseInput(key === "a" ? "left" : key === "w" ? "block" : "right");
    return;
  }
  const index = Number(event.key) - 1;
  if (!event.repeat && index >= 0 && index < state.hand.length) {
    const instance = state.hand[index];
    const button = ui.cardHand.querySelector('[data-card-instance="' + instance.uid + '"]');
    if (button && !button.disabled) {
      button.click();
    }
  }
});
window.addEventListener("blur", function () {
  cancelSoulUltimateHold(true);
});
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    cancelSoulUltimateHold(true);
  }
});

document.title = "M98 卡牌版战斗 Demo · " + DEMO_VERSION;
resetGame("preparation");
