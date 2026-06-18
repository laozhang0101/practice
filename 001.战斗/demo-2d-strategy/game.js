const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");
const DEMO_VERSION = "2026.06.18-rock-throw-unavoidable";
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
};

const partBlueprint = [
  { id: "arms", label: "手部", armor: "armored", maxHp: 130, maxArmor: 95, effect: "破坏后削弱 Boss 近战攻击" },
  { id: "core", label: "胸口核心", armor: "exposed", weakpoint: true, maxHp: 170, maxArmor: 0, effect: "裸露弱点，适合爆发输出" },
  { id: "legs", label: "脚部", armor: "armored", maxHp: 120, maxArmor: 85, effect: "破坏后降低 Boss 稳定性" },
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
const bossEdgeMaskCache = new WeakMap();

const loadoutParts = [
  { id: "head", label: "头盔", icon: "♜", slots: ["脸部", "护额"], defaultItem: "修罗头盔" },
  { id: "torso", label: "上衣", icon: "♛", slots: ["肩膀", "前胸", "后背", "上臂", "脖子"], defaultItem: "修罗上衣" },
  { id: "pants", label: "裤子", icon: "♟", slots: ["前腰", "后腰", "左腿", "右腰", "大腿"], defaultItem: "修罗下装" },
  { id: "bracer", label: "护腕", icon: "◒", slots: ["腕部"], defaultItem: "修罗护腕" },
  { id: "shoes", label: "鞋子", icon: "♞", slots: ["小腿前", "小腿后", "小腿侧", "脚部"], defaultItem: "修罗鞋子" },
];

const loadoutState = {
  activePartId: "head",
  activeSlot: "base",
  isFocusing: false,
  equipped: {},
};

const attachmentOptions = [
  { name: "修罗头盔", icon: "♜", trait: "头部基础装饰", category: "base", parts: ["head"], image: "./assets/loadout-shura-head.jpeg" },
  { name: "修罗上衣", icon: "♛", trait: "上身基础装饰", category: "base", parts: ["torso"], image: "./assets/loadout-shura-torso.jpeg" },
  { name: "修罗下装", icon: "♟", trait: "腿部基础装饰", category: "base", parts: ["pants"], image: "./assets/loadout-shura-pants.jpeg" },
  { name: "修罗护腕", icon: "◒", trait: "护腕基础装饰", category: "base", parts: ["bracer"], image: "./assets/loadout-shura-bracer.jpeg" },
  { name: "修罗鞋子", icon: "♞", trait: "鞋子基础装饰", category: "base", parts: ["shoes"], image: "./assets/loadout-shura-shoes.jpeg" },
  {
    name: "无人机",
    icon: "◉",
    trait: "上臂挂件，远程协同",
    category: "drone",
    slots: ["上臂"],
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
    image: "./assets/loadout-gourd.jpeg",
    tacticalInfo: {
      title: "酒葫芦",
      role: "回合恢复",
      trigger: "每回合开始时自动判定。",
      effect: "有 50% 概率饮酒恢复 10 点血量，最多饮用 3 次。",
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

function createState() {
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
    selectedWeaponId: "fists",
    player: {
      hp: 220,
      maxHp: 220,
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
      hp: parts.reduce((sum, part) => sum + part.hp, 0),
      maxHp: parts.reduce((sum, part) => sum + part.maxHp, 0),
      stage: 1,
      intent: null,
      attackIndex: 0,
      pendingAttack: null,
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
  floaters = [];
  playerHitFloaters = [];
  buildWeaponControls();
  buildSkillControls();
  buildSoulSkillControls();
  updatePlayerSpriteForWeapon();
  renderWeaponToggle();
  showWeakpointTip("胸口核心已暴露，优先攻击弱点。", 1.5);
  log("战斗开始：手部、脚部被硬甲覆盖，胸口核心是裸露弱点。");
  beginPlayerTurn({ initial: true });
}

function renderPrebattleLoadout() {
  const partNav = document.getElementById("loadoutParts");
  const slotsEl = document.getElementById("attachmentSlots");
  const itemsEl = document.getElementById("attachmentItems");
  const titleEl = document.getElementById("attachmentTitle");
  if (!partNav || !slotsEl || !itemsEl || !titleEl) return;

  const activePart = loadoutParts.find((part) => part.id === loadoutState.activePartId) || loadoutParts[0];
  if (loadoutState.activeSlot !== "base" && !activePart.slots.includes(loadoutState.activeSlot)) {
    loadoutState.activeSlot = activePart.slots[0];
  }

  partNav.innerHTML = "";
  loadoutParts.forEach((part) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `loadout-part-button${part.id === activePart.id ? " active" : ""}`;
    button.dataset.part = part.id;
    button.innerHTML = `<span class="loadout-part-icon">${part.icon}</span><span>${part.label}</span>`;
    button.addEventListener("click", () => {
      loadoutState.activePartId = part.id;
      loadoutState.activeSlot = "base";
      loadoutState.isFocusing = false;
      renderPrebattleLoadout();
    });
    partNav.appendChild(button);
  });

  slotsEl.innerHTML = "";
  activePart.slots.forEach((slot) => {
    const key = `${activePart.id}:${slot}`;
    const equipped = loadoutState.equipped[key];
    const slotEl = document.createElement("button");
    slotEl.type = "button";
    const isFixedGourdSlot = activePart.id === "pants" && slot === "前腰";
    slotEl.className = `attachment-slot${slot === loadoutState.activeSlot ? " active" : ""}${isFixedGourdSlot ? " fixed-gourd" : ""}`;
    slotEl.dataset.slotKey = key;
    slotEl.innerHTML = `
      <span>${slot}</span>
      <span class="attachment-slot-box${equipped ? " equipped" : ""}">
        ${renderLoadoutItemPreview(equipped, "+")}
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
    const card = document.createElement("button");
    card.type = "button";
    card.className = `attachment-card${active ? " active" : ""}`;
    card.dataset.itemName = item.name;
    card.innerHTML = `
      <span class="attachment-card-preview">${renderLoadoutItemPreview(item, item.icon)}</span>
      <span>${item.name}</span>
      <small>${item.trait}</small>
    `;
    card.addEventListener("click", () => {
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

function getLoadoutOptions(activePart, slot) {
  if (slot === "base") {
    return attachmentOptions.filter((item) => item.category === "base" && item.parts?.includes(activePart.id));
  }
  if (activePart.id === "pants" && slot === "前腰") {
    return attachmentOptions.filter((item) => item.name === "酒葫芦");
  }
  return attachmentOptions.filter((item) => item.slots?.includes(slot));
}

function updateLoadoutFocus(activePart) {
  const screen = document.getElementById("prebattleScreen");
  if (!screen) return;
  screen.dataset.focus = loadoutState.isFocusing ? loadoutFocusMap[loadoutState.activeSlot] || activePart.id : "full";
}

function enterBattleFromLoadout() {
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
  return weapons.find((weapon) => weapon.id === state.selectedWeaponId) || weapons[0];
}

function updatePlayerSpriteForWeapon() {
  const weapon = currentWeapon();
  if (!weapon.playerSprite || sprites.player.src.endsWith(weapon.playerSprite.replace("./", ""))) return;
  sprites.player.src = weapon.playerSprite;
}

function currentSkills() {
  return skills
    .filter((skill) => skill.weaponId === state.selectedWeaponId)
    .sort((a, b) => (a.actionCost || 0) - (b.actionCost || 0) || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function isLoadoutItemEquipped(itemName) {
  return Object.values(loadoutState.equipped).some((item) => item?.name === itemName);
}

function buildWeaponControls() {
  ui.weaponButtons.innerHTML = "";
  weapons.forEach((weapon) => {
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
    <span class="part-badge${skill.targetParts.length > 1 ? " part-badge-ring" : ""}" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
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
      <span class="part-badge${skill.targetParts.length > 1 ? " part-badge-ring" : ""}" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
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
  return partIds
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
    .join("");
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
  const skill = skills.find((item) => item.id === skillId);
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
  let damage = baseDamage;
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
    const damage = Math.round((target.weakpoint ? skill.damage * spendDots * 1.35 : skill.damage * spendDots) * brokenBonus);
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
  let damage = skill.damage;
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
  const nextAttack = enemyAttackSequence[state.enemy.attackIndex % enemyAttackSequence.length];
  state.pendingWeakpointWarning = nextAttack.id === "lava_burst";
  if (state.pendingWeakpointWarning) {
    showWeakpointTip(nextAttack.warningText, 2.4);
  }
}

function createEnemyThreat() {
  const pendingAttack = currentPendingEnemyAttack();
  if (pendingAttack) {
    releaseDelayedEnemyAttack(pendingAttack);
    return;
  }
  const attack = enemyAttackSequence[state.enemy.attackIndex % enemyAttackSequence.length];
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

function advanceEnemyAttack() {
  state.enemy.attackIndex += 1;
}

function startDelayedEnemyAttackPrepare(attack) {
  if (isPartBroken(attack.sourcePart)) {
    log(`Boss 行动：${attack.label}。但手部已被破坏，技能无法释放。`);
    advanceEnemyAttack();
    endEnemyTurn();
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

  if (pending?.interrupted || isPartBroken(attack.sourcePart)) {
    log(`${attack.label}释放失败：手部被破坏或准备动作被打断。`);
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
  state.player.hp = Math.max(0, state.player.hp - damage);
  state.playerHitFlashTimer = 0.42;
  playerHitFloaters.push({
    text: `受到${attack.label}攻击，损失${damage}点血量`,
    x: canvas.width / 2,
    y: canvas.height * 0.38,
    life: 1.25,
  });
  log(`受到${attack.label}攻击，损失${damage}点血量。`);
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
  ui.skillVideo.onended = onEnded;
  ui.skillVideo.onerror = () => {
    log("视频播放失败，使用默认失败结算。");
    if (state?.videoAttack) {
      resolveVideoQte("fail");
    }
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
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
  ui.skillVideo.onended = loop ? null : onEnded;
  ui.skillVideo.onerror = () => {
    log("技能表现视频播放失败，跳过当前表现。");
    if (onEnded) onEnded();
  };
  const playPromise = ui.skillVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      log("浏览器阻止了技能表现视频自动播放，跳过当前表现。");
      if (onEnded) onEnded();
    });
  }
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

  [...ui.skillButtons.children].forEach((button) => {
    const skill = skills.find((item) => item.id === button.dataset.skill);
    button.disabled = !skill || !canUseSkill(skill);
  });

  [...ui.battleSkillButtons.children].forEach((button) => {
    if (button.dataset.soulTarget) {
      button.disabled = !state.soulTargetSelection;
      return;
    }
    const skill = skills.find((item) => item.id === button.dataset.skill);
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
