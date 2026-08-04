"use strict";

const DEMO_VERSION = "卡牌版-2026.08.04-自动充能手动唤醒";
const MAX_PLAYER_HP = 220;
const MAX_BOSS_HP = 420;
const MAX_ENERGY = 10;
const MAX_AWAKENING = 100;
const MAX_AWAKENING_SELECTION = 3;
const AWAKENED_PLAYER_TURNS = 2;
const ARMOR_TRANSFORM_DURATION = 1280;
const AWAKENING_CHARGE_DURATION = 12000;
const BOSS_TURN_INTERVAL = 2400;
const FIRST_TURN_DELAY = 900;
const BOSS_IMPACT_DELAY = 980;
const ATTACK_RECOVER_DELAY = 1320;
const ENERGY_INTERVAL = 3000;
const BASE_CHAIN_WINDOW = 2700;
const MAX_HAND_SIZE = 4;
const INTERVENTION_TRIGGER_MS = 900;
const INTERVENTION_WINDOW_MS = 1400;
const INTERVENTION_TIME_SCALE = 0.3;
const INTERVENTION_RELEASE_DELAY = 460;

const deckRecipe = ["armor", "reactor", "jet", "cannon", "drone", "gourd", "reactor", "cannon"];
const openingHandRecipe = ["reactor", "jet", "cannon", "gourd"];

const weaponModes = [
  {
    id: "fists",
    name: "拳套",
    style: "近身压制",
    summary: "自动贴近Boss，以连续拳脚轮流压制手部、胸口与脚部。",
    icon: "./assets/weapon-fists.png",
    playerSprite: "./assets/player-fists.png",
    color: "#ef873f",
    attackInterval: 1700,
    impactDelay: 390,
    recoverDelay: 1050,
    cadence: "高速攻击",
    synergyCards: ["reactor", "jet", "drone"],
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
    attackInterval: 3100,
    impactDelay: 680,
    recoverDelay: 1480,
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
    attackInterval: 2400,
    impactDelay: 330,
    recoverDelay: 980,
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

const cards = [
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
    summary: "反应炉脉冲恢复3点战甲能量，并强化后续两个模块。",
    usage: "连携起手 · 回能并强化后续",
    effectTags: ["恢复3能量", "强化后续×2"],
  },
  {
    id: "jet",
    name: "喷气背包",
    type: "肩部挂件",
    role: "变轨",
    icon: "./assets/jet.png",
    cost: 3,
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
    cost: 3,
    color: "#e75f45",
    summary: "立即轰击Boss正在蓄力的部位，造成高额破甲与打断值。",
    usage: "Boss蓄力时 · 破甲并打断",
    effectTags: ["高额破甲", "打断蓄力"],
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
};

const chainTiers = [
  "常态战斗",
  "局部唤醒",
  "双部件协同",
  "核心形态联动",
  "过载协同",
  "全武装齐射",
];

const ui = {
  gameShell: document.getElementById("gameShell"),
  turnLabel: document.getElementById("turnLabel"),
  playerHpBar: document.getElementById("playerHpBar"),
  playerHpText: document.getElementById("playerHpText"),
  energyCells: document.getElementById("energyCells"),
  energyText: document.getElementById("energyText"),
  bossHpBar: document.getElementById("bossHpBar"),
  bossHpText: document.getElementById("bossHpText"),
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
  energyRate: document.getElementById("energyRate"),
  energyCapText: document.getElementById("energyCapText"),
  energyChargeBar: document.getElementById("energyChargeBar"),
  energyChargeLabel: document.getElementById("energyChargeLabel"),
  cardHand: document.getElementById("cardHand"),
  compactLog: document.getElementById("compactLog"),
  weaponToggle: document.getElementById("weaponToggle"),
  weaponAttackRing: document.getElementById("weaponAttackRing"),
  autoWeaponIcon: document.getElementById("autoWeaponIcon"),
  autoWeaponName: document.getElementById("autoWeaponName"),
  weaponCadenceText: document.getElementById("weaponCadenceText"),
  weaponSwitchMenu: document.getElementById("weaponSwitchMenu"),
  weaponSwitchCinematic: document.getElementById("weaponSwitchCinematic"),
  weaponSwitchIcon: document.getElementById("weaponSwitchIcon"),
  weaponSwitchName: document.getElementById("weaponSwitchName"),
  weaponSwitchStyle: document.getElementById("weaponSwitchStyle"),
  moduleCinematic: document.getElementById("moduleCinematic"),
  moduleVideo: document.getElementById("moduleVideo"),
  moduleVideoType: document.getElementById("moduleVideoType"),
  moduleVideoTitle: document.getElementById("moduleVideoTitle"),
  moduleVideoIcons: document.getElementById("moduleVideoIcons"),
  moduleVideoComboName: document.getElementById("moduleVideoComboName"),
  moduleVideoComboEffect: document.getElementById("moduleVideoComboEffect"),
  moduleVideoSkip: document.getElementById("moduleVideoSkip"),
  awakeningButton: document.getElementById("awakeningButton"),
  awakeningButtonLabel: document.getElementById("awakeningButtonLabel"),
  awakeningBar: document.getElementById("awakeningBar"),
  awakeningRing: document.getElementById("awakeningRing"),
  awakeningText: document.getElementById("awakeningText"),
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
let audioContext = null;
let runToken = 0;

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

function takeUniqueCard(drawPile, hand) {
  const handNames = new Set(
    hand.map(function (instance) {
      return instance.cardId;
    }),
  );
  const candidateIndex = drawPile.findIndex(function (instance) {
    return !handNames.has(instance.cardId);
  });
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
  return { drawPile: drawPile, hand: hand, discardPile: [] };
}

function createInitialState() {
  const now = performance.now();
  const deckState = createDeckState();
  return {
    runId: runToken,
    playerHp: MAX_PLAYER_HP,
    bossHp: MAX_BOSS_HP,
    energy: 6,
    parts: createParts(),
    intentIndex: 0,
    intentPressure: 0,
    intentInterrupted: false,
    turnActor: "player",
    actionActor: null,
    nextTurnAt: now + FIRST_TURN_DELAY,
    lastPlayerActionAt: now,
    nextPlayerAt: now + FIRST_TURN_DELAY,
    playerCycleDuration: FIRST_TURN_DELAY,
    lastFrameAt: now,
    playerAttackSerial: 0,
    interventionActive: false,
    interventionEndsAt: 0,
    interventionShownForAttack: -1,
    awakening: 0,
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
    actionIndex: 0,
    selectedWeaponId: "fists",
    weaponSwitchPending: null,
    weaponSwitching: false,
    weaponSwitchStartedAt: 0,
    weaponSwitchFromId: null,
    nextEnergyAt: now + ENERGY_INTERVAL,
    nextAutoBonus: 0,
    reactionActive: false,
    reactionChoice: null,
    drawPile: deckState.drawPile,
    hand: deckState.hand,
    discardPile: deckState.discardPile,
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
    ended: false,
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

function currentWeaponMode() {
  return weaponModes.find(function (weapon) {
    return weapon.id === state.selectedWeaponId;
  }) || weaponModes[0];
}

function getWeaponCardAffinity(card, weapon) {
  const activeWeapon = weapon || currentWeaponMode();
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

function resetGame() {
  clearInterval(battleTimer);
  clearTimeout(messageTimer);
  clearTimeout(logTimer);
  clearTimeout(resolvedChainTimer);
  hideModuleVideo();
  hideWeaponSwitchFx();
  runToken += 1;
  state = createInitialState();
  ui.resultOverlay.classList.add("hidden");
  ui.commandDeck.classList.remove(
    "locked",
    "intervention-window",
    "intervention-release",
    "awakening-selecting",
    "armor-awakened",
  );
  ui.battlefield.className = "battlefield";
  ui.awakeningConsole.classList.add("hidden");
  ui.awakeningConsole.setAttribute("aria-hidden", "true");
  ui.armorTransformCinematic.classList.add("hidden");
  ui.armorTransformCinematic.setAttribute("aria-hidden", "true");
  ui.awakenedStatus.classList.add("hidden");
  ui.effectLayer.innerHTML = "";
  ui.floatingLayer.innerHTML = "";
  ui.compactLog.classList.remove("visible");
  renderAll();
  showMessage("固定节拍交锋开始：战甲唤醒值将随战斗自动积累");
  battleTimer = window.setInterval(tickBattle, 80);
}

function renderAll() {
  renderStatus();
  renderWeaponControls();
  renderCards();
  renderChain();
  renderIntentBase();
  renderBossParts();
  renderBossSprite();
  renderReactionControls();
  renderAwakening();
}

function renderStatus() {
  const playerPercent = Math.max(0, state.playerHp / MAX_PLAYER_HP) * 100;
  const bossPercent = Math.max(0, state.bossHp / MAX_BOSS_HP) * 100;
  ui.playerHpBar.style.width = playerPercent + "%";
  ui.playerHpText.textContent = Math.max(0, state.playerHp) + " / " + MAX_PLAYER_HP;
  ui.bossHpBar.style.width = bossPercent + "%";
  ui.bossHpText.textContent = Math.max(0, state.bossHp) + " / " + MAX_BOSS_HP;
  const displayedActor = state.actionActor || state.turnActor;
  ui.turnLabel.textContent = state.ended
    ? "战斗结束"
    : state.awakeningSelecting
      ? "唤醒时刻 · 选择部件"
      : state.transforming
        ? "核心形态 · 变身"
        : state.awakened
          ? "战甲状态 · " + state.awakenedAttacksRemaining + "回合"
      : "自动回合 · " + (displayedActor === "player" ? "玩家行动" : "Boss行动");
  ui.energyCells.innerHTML = "";
  for (let index = 0; index < MAX_ENERGY; index += 1) {
    const cell = document.createElement("i");
    if (index < state.energy) {
      cell.classList.add("filled");
    }
    ui.energyCells.appendChild(cell);
  }
  ui.energyText.textContent = state.energy + " / " + MAX_ENERGY;
  ui.cardEnergyValue.textContent = state.energy;
  ui.energyCapText.textContent = "上限 " + MAX_ENERGY;
  ui.cardHand.style.setProperty("--energy-stock", (state.energy / MAX_ENERGY) * 100 + "%");
  ui.energyRate.setAttribute("aria-label", "战甲能量：当前" + state.energy + "，上限" + MAX_ENERGY);
  renderAwakening();
}

function syncWeaponPresentation(weapon) {
  ui.autoWeaponIcon.src = weapon.icon;
  ui.autoWeaponName.textContent = weapon.name + " · " + weapon.style;
  ui.weaponToggle.title = "切换武器 · 当前" + weapon.name;
  ui.weaponToggle.setAttribute("aria-label", "武器切换，当前" + weapon.name + "，" + weapon.cadence);
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

function renderWeaponControls() {
  const current = currentWeaponMode();
  syncWeaponPresentation(current);
  ui.weaponSwitchMenu.innerHTML = "";
  weaponModes.forEach(function (weapon) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weapon-switch-option" + (weapon.id === current.id ? " active" : "");
    button.style.setProperty("--weapon-color", weapon.color);
    button.dataset.weaponId = weapon.id;

    const icon = document.createElement("img");
    icon.src = weapon.icon;
    icon.alt = "";
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    const style = document.createElement("small");
    name.textContent = weapon.name;
    style.textContent = weapon.cadence + " · " + weapon.style;
    copy.appendChild(name);
    copy.appendChild(style);
    button.appendChild(icon);
    button.appendChild(copy);
    button.addEventListener("click", function () {
      selectWeapon(weapon.id);
    });
    ui.weaponSwitchMenu.appendChild(button);
  });
  closeWeaponMenu();
  updateWeaponControlState();
}

function updateWeaponControlState() {
  const locked =
    state.ended ||
    state.videoPlaying ||
    Boolean(state.videoPending) ||
    Boolean(state.weaponSwitchPending) ||
    state.weaponSwitching ||
    state.awakeningSelecting ||
    state.transforming ||
    state.awakened;
  ui.weaponToggle.disabled = locked;
  ui.weaponSwitchMenu.querySelectorAll("button").forEach(function (button) {
    button.disabled = locked || button.dataset.weaponId === state.selectedWeaponId;
  });
  if (locked) {
    closeWeaponMenu();
  }
}

function toggleWeaponMenu() {
  if (ui.weaponToggle.disabled) {
    return;
  }
  const opening = ui.weaponSwitchMenu.classList.contains("hidden");
  ui.weaponSwitchMenu.classList.toggle("hidden", !opening);
  ui.weaponToggle.setAttribute("aria-expanded", String(opening));
}

function closeWeaponMenu() {
  ui.weaponSwitchMenu.classList.add("hidden");
  ui.weaponToggle.setAttribute("aria-expanded", "false");
}

function selectWeapon(weaponId) {
  if (state.selectedWeaponId === weaponId) {
    closeWeaponMenu();
    return;
  }
  const weapon = weaponModes.find(function (item) {
    return item.id === weaponId;
  });
  if (!weapon || ui.weaponToggle.disabled) {
    return;
  }
  state.weaponSwitchPending = weapon;
  closeWeaponMenu();
  updateCardStates(performance.now());
  if (!state.actionActor && !state.reactionActive) {
    startPendingWeaponSwitch();
  } else {
    showLog("已选择“" + weapon.name + "”，当前动作结束后切换");
  }
}

function startPendingWeaponSwitch() {
  if (!state.weaponSwitchPending || state.weaponSwitching || state.ended) {
    return;
  }
  const weapon = state.weaponSwitchPending;
  state.weaponSwitchPending = null;
  startWeaponSwitch(weapon);
}

function startWeaponSwitch(weapon) {
  const now = performance.now();
  const currentRun = state.runId;
  endIntervention("weapon", now);
  state.weaponSwitchFromId = state.selectedWeaponId;
  state.weaponSwitching = true;
  state.weaponSwitchStartedAt = now;
  closeWeaponMenu();
  ui.weaponSwitchCinematic.className = "weapon-switch-cinematic switch-" + weapon.id;
  ui.weaponSwitchCinematic.style.setProperty("--switch-color", weapon.color);
  ui.weaponSwitchCinematic.setAttribute("aria-hidden", "false");
  ui.weaponSwitchIcon.src = weapon.icon;
  ui.weaponSwitchName.textContent = weapon.name;
  ui.weaponSwitchStyle.textContent = weapon.style;
  playWeaponSwitchSound(weapon);
  updateCardStates(now);

  window.setTimeout(function () {
    if (!state || state.runId !== currentRun || !state.weaponSwitching) {
      return;
    }
    state.selectedWeaponId = weapon.id;
    state.actionIndex = 0;
    syncWeaponPresentation(weapon);
  }, 300);

  window.setTimeout(function () {
    finishWeaponSwitch(currentRun, weapon);
  }, 820);
}

function finishWeaponSwitch(currentRun, weapon) {
  if (!state || state.runId !== currentRun || !state.weaponSwitching) {
    return;
  }
  const elapsed = Math.max(0, performance.now() - state.weaponSwitchStartedAt);
  const previousWeapon =
    weaponModes.find(function (item) {
      return item.id === state.weaponSwitchFromId;
    }) || weapon;
  const cadenceDelta = weapon.attackInterval - previousWeapon.attackInterval;
  state.weaponSwitching = false;
  state.weaponSwitchStartedAt = 0;
  state.nextTurnAt +=
    elapsed + (state.turnActor === "player" && !state.actionActor ? cadenceDelta : 0);
  state.nextEnergyAt += elapsed;
  state.lastPlayerActionAt += elapsed;
  state.nextPlayerAt += elapsed + cadenceDelta;
  state.playerCycleDuration = Math.max(600, state.nextPlayerAt - state.lastPlayerActionAt);
  if (state.chainDeadline) {
    state.chainDeadline += elapsed;
  }
  state.weaponSwitchFromId = null;
  hideWeaponSwitchFx();
  renderWeaponControls();
  updateCardStates(performance.now());
  ui.autoActionText.textContent = weapon.name + "已接管 · " + weapon.cadence;
  showMessage("切换为“" + weapon.name + "” · " + weapon.cadence);
  showLog(
    "武器已切换：" + weapon.style + "，每 " + (weapon.attackInterval / 1000).toFixed(1) + " 秒准备一次攻击",
  );
}

function hideWeaponSwitchFx() {
  if (!ui.weaponSwitchCinematic) {
    return;
  }
  ui.weaponSwitchCinematic.className = "weapon-switch-cinematic hidden";
  ui.weaponSwitchCinematic.setAttribute("aria-hidden", "true");
}

function renderCards() {
  ui.cardHand.innerHTML = "";
  state.hand.forEach(function (instance) {
    const card = getCard(instance.cardId);
    const button = document.createElement("button");
    const effectTags = (card.effectTags || [])
      .map(function (tag) {
        return "<span>" + tag + "</span>";
      })
      .join("");
    button.type = "button";
    button.className = "module-card live-card";
    button.style.setProperty("--card-color", card.color);
    button.dataset.cardId = card.id;
    button.dataset.cardInstance = instance.uid;
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
      '</i></span></div><div class="card-effect-tags">' +
      effectTags +
      '</div><span class="weapon-fit"></span><span class="card-cost"><b>' +
      card.cost +
      '</b></span><span class="awakening-card-state">核心充能中</span>';
    button.addEventListener("click", function () {
      activateCard(instance.uid, button);
    });
    ui.cardHand.appendChild(button);
  });
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

function updateCardStates(now) {
  const cinematicLocked =
    state.videoPlaying ||
    Boolean(state.videoPending) ||
    Boolean(state.weaponSwitchPending) ||
    state.weaponSwitching ||
    state.transforming ||
    state.awakened;
  const selectedCost = selectedAwakeningCost();
  state.hand.forEach(function (instance) {
    const card = getCard(instance.cardId);
    const weapon = currentWeaponMode();
    const affinity = getWeaponCardAffinity(card, weapon);
    const button = ui.cardHand.querySelector('[data-card-instance="' + instance.uid + '"]');
    if (!button) {
      return;
    }
    const selected = state.awakeningSelectedUids.includes(instance.uid);
    const selectionFull =
      state.awakeningSelectedUids.length >= MAX_AWAKENING_SELECTION && !selected;
    const lacksEnergy = selected
      ? false
      : selectedCost + card.cost > state.energy;
    const fitLabel = button.querySelector(".weapon-fit");
    const stateLabel = button.querySelector(".awakening-card-state");
    button.disabled =
      state.ended ||
      cinematicLocked ||
      !state.awakeningSelecting ||
      selectionFull ||
      lacksEnergy;
    button.classList.toggle("energy-locked", lacksEnergy);
    button.classList.toggle("awakening-selectable", state.awakeningSelecting && !button.disabled);
    button.classList.toggle("awakening-selected", selected);
    button.classList.toggle("weapon-linked", affinity === "linked");
    button.classList.toggle("weapon-neutral", affinity === "neutral");
    button.classList.toggle("weapon-unlinked", affinity === "unlinked");
    if (fitLabel) {
      fitLabel.textContent =
        selected
          ? "已接入形态"
          : affinity === "linked"
            ? weapon.name + "协同"
            : affinity === "neutral"
              ? "通用"
              : "独立启动";
    }
    if (stateLabel) {
      stateLabel.textContent = selected
        ? "已选择"
        : state.awakeningSelecting
          ? selectionFull
            ? "选择已满"
            : lacksEnergy
              ? "能量不足"
              : "点亮部件"
          : state.awakened
            ? "形态生效中"
            : state.awakening >= MAX_AWAKENING
              ? "先唤醒核心"
              : "核心充能中";
    }
    button.title = state.awakeningSelecting
      ? selected
        ? "点击取消选择 · " + card.summary
        : lacksEnergy
          ? "本次唤醒能量不足 · " + card.summary
          : "点击将“" + card.name + "”接入本次核心形态"
      : cinematicLocked
      ? "当前表现结算中"
      : "战甲唤醒后可选择 · " + card.summary;
  });
  updateWeaponControlState();
}

function drawNextCard() {
  if (state.hand.length >= MAX_HAND_SIZE || state.ended) {
    return false;
  }

  let nextCard = takeUniqueCard(state.drawPile, state.hand);
  if (!nextCard && state.discardPile.length) {
    state.drawPile = shuffleItems(state.drawPile.concat(state.discardPile));
    state.discardPile = [];
    showLog("弃牌重新洗入牌库，卡组开始下一轮循环");
    nextCard = takeUniqueCard(state.drawPile, state.hand);
  }

  if (nextCard) {
    state.hand.push(nextCard);
  }
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
  const selectedCards = selectedAwakeningCards();
  const preview = describeAwakeningSequence(selectedCards);
  ui.awakeningPreviewTitle.textContent = preview.title;
  ui.awakeningPreviewEffect.textContent = preview.effect;
  ui.awakeningSelection.innerHTML = selectedCards.length
    ? moduleSequenceMarkup(selectedCards)
    : '<span class="selection-placeholder">点选下方战甲或挂件能力</span>';
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
    !state.weaponSwitchPending &&
    !state.weaponSwitching &&
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
  closeWeaponMenu();
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
    let nextCard = takeUniqueCard(state.drawPile, state.hand);
    if (!nextCard && state.discardPile.length) {
      state.drawPile = shuffleItems(state.drawPile.concat(state.discardPile));
      state.discardPile = [];
      nextCard = takeUniqueCard(state.drawPile, state.hand);
    }
    if (!nextCard) {
      break;
    }
    state.hand.push(nextCard);
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
  state.nextEnergyAt += elapsed;
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
  ui.intentName.textContent = intent.name;
  ui.intentPartIcon.src = intent.icon;
  ui.intentCue.textContent = intent.cue;
  ui.intentTitle.textContent = intent.title;
}

function updateIntentTimer(now) {
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
  if (!state.chain.length) {
    return;
  }
  const remaining = state.chainDeadline - now;
  if (remaining <= 0) {
    resolveChain();
  }
}

function updateEnergyCharge(now) {
  if (state.energy >= MAX_ENERGY) {
    state.nextEnergyAt = now + ENERGY_INTERVAL;
    ui.energyChargeBar.style.width = "100%";
    ui.energyRate.style.setProperty("--energy-charge-angle", "270deg");
    ui.energyRate.style.setProperty("--energy-charge-mid-angle", "157deg");
    ui.energyRate.style.setProperty("--energy-needle-angle", "120deg");
    ui.energyChargeLabel.textContent = "能量已满";
    return;
  }
  const remaining = Math.max(0, state.nextEnergyAt - now);
  const progress = Math.max(0, Math.min(1, 1 - remaining / ENERGY_INTERVAL));
  ui.energyChargeBar.style.width = progress * 100 + "%";
  ui.energyRate.style.setProperty("--energy-charge-angle", progress * 270 + "deg");
  ui.energyRate.style.setProperty("--energy-charge-mid-angle", progress * 157 + "deg");
  ui.energyRate.style.setProperty("--energy-needle-angle", -120 + progress * 240 + "deg");
  ui.energyChargeLabel.textContent = "恢复 +1 / 3s";
}

function renderBossParts() {
  ui.partBars.innerHTML = "";
  Object.keys(state.parts).forEach(function (partId) {
    const part = state.parts[partId];
    const hasArmor = part.armor > 0;
    const broken = part.hp <= 0;
    const current = hasArmor ? part.armor : part.hp;
    const max = hasArmor ? part.maxArmor : part.maxHp;
    const percent = max ? Math.max(0, current / max) * 100 : 0;
    const item = document.createElement("div");
    item.className = "part-state" + (broken ? " broken" : "");
    item.innerHTML =
      '<img src="' +
      part.icon +
      '" alt="" /><span class="part-meter"><i style="width:' +
      percent +
      '%"></i></span><b>' +
      (broken ? "破坏" : hasArmor ? "甲 " + Math.ceil(percent) + "%" : Math.ceil(percent) + "%") +
      "</b>";
    ui.partBars.appendChild(item);
  });
}

function renderBossSprite() {
  if (state.parts.arms.hp <= 0) {
    ui.bossImage.src = "./assets/boss-arms-broken.png";
  } else if (state.parts.legs.hp <= 0) {
    ui.bossImage.src = "./assets/boss-legs-broken.png";
  } else {
    ui.bossImage.src = "./assets/boss.png";
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
    state.weaponSwitchPending ||
    state.weaponSwitching ||
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
  state.nextEnergyAt += delayedTime;
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

function tickBattle() {
  if (!state || state.ended) {
    return;
  }
  const now = performance.now();
  const frameDelta = Math.max(0, now - state.lastFrameAt);
  state.lastFrameAt = now;
  advanceAwakeningAutomatically(frameDelta);
  if (state.awakeningActivationPending && canOpenAwakeningSelection()) {
    openAwakeningSelection();
    return;
  }
  if (state.awakeningSelecting) {
    state.nextTurnAt += frameDelta;
    state.nextPlayerAt += frameDelta;
    state.nextEnergyAt += frameDelta;
    state.playerCycleDuration += frameDelta;
    updateAutoActionMeter(now);
    updateIntentTimer(now);
    updateEnergyCharge(now);
    return;
  }
  if (state.transforming) {
    return;
  }
  if (state.weaponSwitching) {
    return;
  }
  if (state.videoPlaying) {
    return;
  }
  applyInterventionSlowdown(frameDelta);
  if (state.interventionActive && now >= state.interventionEndsAt) {
    endIntervention("timeout", now);
  }
  if (state.weaponSwitchPending && !state.actionActor && !state.reactionActive) {
    startPendingWeaponSwitch();
    return;
  }
  if (state.videoPending && !state.actionActor && !state.reactionActive) {
    startPendingModuleVideo();
    return;
  }
  if (now >= state.nextEnergyAt) {
    state.nextEnergyAt = now + ENERGY_INTERVAL;
    if (state.energy < MAX_ENERGY) {
      state.energy += 1;
      renderStatus();
    }
  }
  if (now >= state.nextTurnAt) {
    if (state.turnActor === "player") {
      executeAutoAttack(now);
    } else {
      resolveBossAttack(now);
    }
  }
  updateAutoActionMeter(now);
  updateIntentTimer(now);
  updateEnergyCharge(now);
  updateChainTimer(now);
  updateCardStates(now);
}

function executeAutoAttack(now) {
  const weapon = currentWeaponMode();
  const action = weapon.actions[state.actionIndex % weapon.actions.length];
  endIntervention("attack", now);
  state.playerAttackSerial += 1;
  state.actionIndex += 1;
  state.actionActor = "player";
  state.turnActor = "boss";
  state.nextTurnAt = now + BOSS_TURN_INTERVAL;
  state.lastPlayerActionAt = now;
  state.playerCycleDuration = BOSS_TURN_INTERVAL + weapon.attackInterval;
  state.nextPlayerAt = now + state.playerCycleDuration;
  const formBonus = state.awakened ? 5 + state.awakenedModules.length * 3 : 0;
  const bonus = state.nextAutoBonus + formBonus;
  state.nextAutoBonus = 0;
  ui.autoActionText.textContent = "玩家回合 · " + action.name;
  pulseCombatClass("player-turn", weapon.recoverDelay);
  showLog("玩家向前突进，使用“" + action.name + "”");
  renderStatus();

  const currentRun = state.runId;
  window.setTimeout(function () {
    if (state && state.runId === currentRun && !state.ended) {
      state.actionActor = null;
      renderStatus();
    }
  }, weapon.recoverDelay);
  window.setTimeout(function () {
    if (!state || state.runId !== currentRun || state.ended) {
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
  ui.autoActionText.textContent = action.name + "命中 · " + action.targetLabel;
  pulseCombatClass("boss-hit", 260);
  createFloat("-" + result.bossDamage, false);
  triggerWeaponAttackFx(currentWeaponMode(), Boolean(bonus));
  playWeaponAttackSound(currentWeaponMode());
  showLog(currentWeaponMode().name + "自动使用“" + action.name + "”，造成 " + result.bossDamage + " 点伤害");
  if (state.awakened) {
    handleAwakenedAttackResolved();
  }
  renderStatus();
  renderBossParts();
  renderBossSprite();
  checkIntentInterrupted(now);
  checkBattleEnd();
}

function activateCard(cardInstanceId, sourceButton) {
  toggleAwakeningCard(cardInstanceId);
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
  const now = performance.now();
  state.videoPending = null;
  state.activeVideoEffect = payload;
  state.videoPlaying = true;
  state.videoStartedAt = now;
  state.chainDeadline += Math.max(0, now - payload.queuedAt);

  ui.moduleVideoType.textContent = payload.card.type + "介入";
  ui.moduleVideoTitle.textContent = payload.card.name;
  renderModuleVideoCombo(payload);
  ui.moduleCinematic.classList.remove("hidden");
  ui.moduleCinematic.setAttribute("aria-hidden", "false");
  ui.moduleVideo.loop = false;
  ui.moduleVideo.onended = function () {
    finishModuleVideo(false);
  };
  ui.moduleVideo.onerror = function () {
    showLog(payload.card.name + "视频加载失败，直接结算挂件效果");
    finishModuleVideo(false);
  };
  ui.moduleVideo.src = payload.card.video;
  ui.moduleVideo.load();
  updateCardStates(now);

  const playback = ui.moduleVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(function () {
      finishModuleVideo(false);
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
      payload.link.name + " · 前置部件完成后触发当前挂件";
  } else {
    ui.moduleVideoComboName.textContent = "独立启动";
    ui.moduleVideoComboEffect.textContent = "无前置条件，直接结算自身效果";
  }
}

function finishModuleVideo(skipped) {
  if (!state || !state.videoPlaying || !state.activeVideoEffect) {
    return;
  }

  const payload = state.activeVideoEffect;
  const elapsed = Math.max(0, performance.now() - state.videoStartedAt);
  hideModuleVideo();
  state.videoPlaying = false;
  state.activeVideoEffect = null;
  state.videoStartedAt = 0;
  state.nextTurnAt += elapsed;
  state.nextEnergyAt += elapsed;
  state.lastPlayerActionAt += elapsed;
  state.nextPlayerAt += elapsed;
  if (state.chainDeadline) {
    state.chainDeadline += elapsed;
  }
  if (skipped) {
    showLog("已跳过“" + payload.card.name + "”表现，继续结算挂件效果");
  }

  applyCardEffect(payload.card, payload.chainIndex, payload.link);
  updateCardStates(performance.now());
  if (state.chain.length >= 5) {
    scheduleMaxChainResolve(payload.runId, 360);
  }
}

function hideModuleVideo() {
  if (!ui.moduleVideo || !ui.moduleCinematic) {
    return;
  }
  ui.moduleVideo.onended = null;
  ui.moduleVideo.onerror = null;
  ui.moduleVideo.pause();
  ui.moduleVideo.removeAttribute("src");
  ui.moduleVideo.load();
  ui.moduleCinematic.classList.add("hidden");
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

function applyCardEffect(card, chainIndex, link) {
  let multiplier = 1 + chainIndex * 0.13 + link.bonus;
  const boosted = state.moduleBoost > 0 && card.id !== "reactor";
  if (boosted) {
    multiplier += 0.25;
    state.moduleBoost -= 1;
  }
  triggerModuleFx(card, chainIndex);

  if (card.id === "armor") {
    state.armorGuard += 1;
    showMessage("战甲过载接入，下一次受击将被大幅削减");
  } else if (card.id === "reactor") {
    state.energy = Math.min(MAX_ENERGY, state.energy + 3);
    state.moduleBoost = 2;
    createFloat("+3 能量", true);
    showMessage("方舟反应炉脉冲，后续两个挂件获得强化");
  } else if (card.id === "jet") {
    state.jetGuard = true;
    state.nextAutoBonus += Math.round(13 * multiplier);
    showMessage("喷气背包强化下一次自动攻击，并准备规避反击");
  } else if (card.id === "cannon") {
    applyModuleHit(card, Math.round(24 * multiplier), Math.round(48 * multiplier), Math.round(44 * multiplier));
  } else if (card.id === "drone") {
    applyModuleHit(card, Math.round(18 * multiplier), Math.round(20 * multiplier), Math.round(16 * multiplier));
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

function applyModuleHit(card, damage, armorDamage, pressure) {
  const targetId = getIntent().part;
  const target = state.parts[targetId];
  const result = damagePart(targetId, damage, armorDamage);
  state.intentPressure += pressure;
  createFloat("-" + result.bossDamage, false);
  createUnitBurst(ui.bossUnit, 0.5, 0.42, card.color);
  pulseCombatClass("boss-hit", 360);
  pulseCombatClass("shake", 360);
  showMessage(
    card.name + "轰击" + target.name + "，造成 " + result.bossDamage + " 点伤害" +
      (result.armorHit ? "，护甲损坏 " + result.armorHit : ""),
  );
  showLog(card.name + "已真实介入自动战斗");
}

function damagePart(partId, damage, armorDamage) {
  const part = state.parts[partId];
  const armorBefore = part.armor;
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
  return { bossDamage: bossDamage, armorHit: armorHit, partHit: partHit };
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
    showMessage(title + "完成，追加 " + result.bossDamage + " 点连携伤害");
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
  if (state.ended || state.intentInterrupted) {
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
  renderReactionControls();
}

function resolveBossAttack(now) {
  if (state.ended) {
    return;
  }
  const intent = getIntent();
  const currentRun = state.runId;
  state.actionActor = "boss";
  state.bossImpactAt = state.intentInterrupted ? 0 : now + BOSS_IMPACT_DELAY;
  state.turnActor = "player";
  state.nextTurnAt = now + currentWeaponMode().attackInterval;
  state.nextPlayerAt = state.nextTurnAt;
  state.reactionActive = !state.intentInterrupted;
  state.reactionChoice = null;
  ui.autoActionText.textContent = "Boss回合 · " + intent.name;
  pulseCombatClass("boss-turn", ATTACK_RECOVER_DELAY);
  renderStatus();
  renderReactionControls();

  if (state.intentInterrupted) {
    window.setTimeout(function () {
      if (!state || state.runId !== currentRun || state.ended) {
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
      if (!state || state.runId !== currentRun || state.ended) {
        return;
      }
      settleBossAttack(intent);
    }, BOSS_IMPACT_DELAY);
  }

  window.setTimeout(function () {
    if (state && state.runId === currentRun && !state.ended) {
      state.actionActor = null;
      state.reactionActive = false;
      state.bossImpactAt = 0;
      renderStatus();
      renderReactionControls();
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
    if (state.awakened && hasAwakenedModule("jet")) {
      feedback.push("喷气变轨");
      pulseCombatClass("awakened-dodge", 720);
      createUnitBurst(ui.playerUnit, 0.54, 0.48, "#62dfff");
    }
  } else if (validResponse && choice === "block") {
    damage = Math.max(1, Math.round(damage * 0.28));
    feedback.push("格挡成功");
    pulseCombatClass("player-block", 620);
    state.bossHp = Math.max(0, state.bossHp - 4);
    createFloat("弹反 -4", false);
    if (state.awakened && hasAwakenedModule("armor")) {
      damage = Math.max(1, Math.round(damage * 0.45));
      feedback.push("战甲稳固");
    }
  } else if (choice) {
    feedback.push("应对方向错误");
  } else {
    feedback.push("未进行防御");
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
  if (damage > 0 && state.awakened) {
    damage = Math.max(1, Math.round(damage * 0.84));
    feedback.push("核心形态承压");
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
  if (!state || state.ended || state.weaponSwitching || !state.reactionActive || state.reactionChoice) {
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
  if (card.id === "reactor" || card.id === "jet" || card.id === "cannon") {
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

function playWeaponSwitchSound(weapon) {
  try {
    playFrequencySweep(
      { wave: "sine", start: 190, end: 420, duration: 0.16 },
      0,
      0.035,
    );
    playFrequencySweep(
      { wave: weapon.sound.wave, start: weapon.sound.start, end: weapon.sound.end, duration: 0.2 },
      0.13,
      0.04,
    );
  } catch (error) {
    // Weapon switch audio is supplementary feedback.
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
  state.ended = true;
  ui.commandDeck.classList.add("locked");
  ui.resultEyebrow.textContent = victory ? "挑战完成" : "战斗失败";
  ui.resultTitle.textContent = victory ? "巨兽已倒下" : "战斗化身失去行动";
  ui.resultCopy.textContent = copy;
  ui.resultOverlay.classList.remove("hidden");
  renderStatus();
  updateCardStates(performance.now());
  renderReactionControls();
}

ui.resetButton.addEventListener("click", resetGame);
ui.resultRestart.addEventListener("click", resetGame);
ui.weaponToggle.addEventListener("click", toggleWeaponMenu);
ui.awakeningButton.addEventListener("click", beginAwakeningSelection);
ui.awakeningCancel.addEventListener("click", cancelAwakeningSelection);
ui.awakeningConfirm.addEventListener("click", confirmAwakeningSelection);
document.addEventListener("pointerdown", function (event) {
  if (
    !ui.weaponSwitchMenu.classList.contains("hidden") &&
    !ui.weaponSwitchMenu.contains(event.target) &&
    !ui.weaponToggle.contains(event.target)
  ) {
    closeWeaponMenu();
  }
});
ui.reactionControls.querySelectorAll("button[data-defense]").forEach(function (button) {
  button.addEventListener("click", function () {
    handleDefenseInput(button.dataset.defense);
  });
});
ui.moduleVideoSkip.addEventListener("click", function () {
  finishModuleVideo(true);
});
window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  if (key === "m" && state && state.videoPlaying) {
    event.preventDefault();
    finishModuleVideo(true);
    return;
  }
  if (key === "a" || key === "w" || key === "d") {
    handleDefenseInput(key === "a" ? "left" : key === "w" ? "block" : "right");
    return;
  }
  const index = Number(event.key) - 1;
  if (index >= 0 && index < state.hand.length) {
    const instance = state.hand[index];
    const button = ui.cardHand.querySelector('[data-card-instance="' + instance.uid + '"]');
    if (button && !button.disabled) {
      button.click();
    }
  }
});

document.title = "M98 卡牌版战斗 Demo · " + DEMO_VERSION;
resetGame();
