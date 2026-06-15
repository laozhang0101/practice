const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");

const sprites = {
  background: new Image(),
  player: new Image(),
  boss: new Image(),
  bossArmsBroken: new Image(),
  bossLegsBroken: new Image(),
  bossArmsLegsBroken: new Image(),
  bossChestBroken: new Image(),
  partArms: new Image(),
  partCore: new Image(),
  partFeet: new Image(),
};

sprites.background.src = "./assets/arena-bg.jpeg";
sprites.player.src = "./assets/player.png";
sprites.boss.src = "./assets/boss.png";
sprites.bossArmsBroken.src = "./assets/boss-arms-broken.png";
sprites.bossLegsBroken.src = "./assets/boss-legs-broken.png";
sprites.bossArmsLegsBroken.src = "./assets/boss-arms-legs-broken.png";
sprites.bossChestBroken.src = "./assets/boss-chest-broken.png";
sprites.partArms.src = "./assets/part-arms.png";
sprites.partCore.src = "./assets/part-core.png";
sprites.partFeet.src = "./assets/part-feet.png";
Object.values(sprites).forEach((image) => {
  image.onload = () => draw();
});

const ui = {
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
    id: "greatsword",
    name: "大剑",
    short: "剑",
    icon: "./assets/weapon-greatsword.png",
    playerSprite: "./assets/player-greatsword.png",
    role: "重型破甲",
  },
  {
    id: "fists",
    name: "拳套",
    short: "拳",
    icon: "./assets/weapon-fists.png",
    playerSprite: "./assets/player-fists.png",
    role: "近战猛攻",
  },
  {
    id: "bow",
    name: "弓箭",
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
    damage: 28,
    armorDamage: 62,
    exposedBonus: 1.18,
    actionCost: 0,
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
    damage: 26,
    armorDamage: 58,
    exposedBonus: 1.2,
    actionCost: 1,
    soulGain: 13,
    color: "#f0b84f",
    desc: "重型破甲，打开脚部硬甲。",
  },
  {
    id: "gs_sweep",
    weaponId: "greatsword",
    name: "横扫碎甲",
    targetParts: ["core", "arms", "legs"],
    targetLabel: "胸部+手部+脚部",
    kind: "aoe",
    kindLabel: "AOE",
    armorBreaker: true,
    damage: 18,
    armorDamage: 36,
    exposedBonus: 1.05,
    actionCost: 3,
    soulGain: 16,
    color: "#f0b84f",
    desc: "范围破甲，同时压制胸部、手部和脚部。",
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
    damage: 48,
    armorDamage: 8,
    exposedBonus: 1.65,
    actionCost: 0,
    soulGain: 15,
    color: "#76d17b",
    desc: "近战爆发，直击胸口核心弱点。",
    accessoryFlow: {
      introVideo: "./assets/videos/fist-skill-1-attack.mp4",
      selectLoopVideo: "./assets/videos/accessory-select-loop.mp4",
      effects: {
        jet: { label: "喷气挂件", video: "./assets/videos/jet-accessory-effect.mp4", damageMultiplier: 1.35 },
        drone: { label: "无人机挂件", video: "./assets/videos/drone-accessory-effect.mp4", damageMultiplier: 1.18 },
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
    desc: "打裸露脚部收益高，硬甲状态收益低。",
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
    damage: 30,
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
    damage: 22,
    armorDamage: 50,
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
    targetParts: ["core", "arms", "legs"],
    targetLabel: "胸部+手部+脚部",
    kind: "aoe",
    kindLabel: "AOE",
    armorBreaker: false,
    damage: 24,
    armorDamage: 0,
    exposedBonus: 1.25,
    actionCost: 3,
    ammoCost: 2,
    soulGain: 13,
    color: "#58b7ff",
    desc: "远程 AOE，同时压制胸部、手部和脚部。",
  },
];

const soulArmorSkills = [
  {
    id: "soul_armor_overdrive",
    name: "灵魂战甲·超载解放",
    kind: "ultimate",
    kindLabel: "大招",
    targetParts: ["core"],
    targetLabel: "胸部",
    damage: 42,
    soulCost: 25,
    maxDots: 4,
    color: "#ff9d42",
    desc: "常驻大招，不随武器切换。需要选择部位，本版锁定胸口核心。",
  },
];
const enemyVideoAttacks = {
  rightThrow: {
    id: "right_throw",
    label: "怪物右侧进攻",
    type: "video_qte",
    introVideo: "./assets/videos/monster-right-attack.mp4",
    successVideo: "./assets/videos/block-success.mp4",
    failVideo: "./assets/videos/block-fail.mp4",
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
};

const enemyAttackSequence = [enemyVideoAttacks.rightThrow, enemyVideoAttacks.lavaBurst];

let state;
let lastTime = performance.now();
let floaters = [];
let soulHoldTimer = null;

function createState() {
  const parts = partBlueprint.map((part) => ({
    ...part,
    hp: part.maxHp,
    armorValue: part.maxArmor,
    armorState: part.armor,
    broken: false,
  }));

  return {
    phase: "玩家回合",
    turn: "player",
    round: 1,
    selectedWeaponId: "greatsword",
    player: { hp: 220, maxHp: 220, soul: 0, ammo: 3, maxAmmo: 3, action: 7, maxAction: 7 },
    enemy: {
      hp: parts.reduce((sum, part) => sum + part.hp, 0),
      maxHp: parts.reduce((sum, part) => sum + part.maxHp, 0),
      stage: 1,
      intent: null,
      attackIndex: 0,
      extraDamage: 0,
      parts,
    },
    activeSkill: null,
    activeTarget: null,
    soulChargeDots: 0,
    reactionTimer: 0,
    reactionDuration: 2.25,
    videoAttack: null,
    skillCinematic: null,
    qte: null,
    pendingWeakpointWarning: false,
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
  buildWeaponControls();
  buildSkillControls();
  buildSoulSkillControls();
  updatePlayerSpriteForWeapon();
  renderWeaponToggle();
  showWeakpointTip("胸口核心已暴露，优先攻击弱点。", 1.5);
  log("战斗开始：手部、脚部被硬甲覆盖，胸口核心是裸露弱点。");
  updateUi();
  draw();
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
  return skills.filter((skill) => skill.weaponId === state.selectedWeaponId);
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
  button.innerHTML = `
    ${skill.actionCost > 0 ? `<span class="action-cost-corner" style="--skill-color:${skill.color}">行动力 ${skill.actionCost}</span>` : ""}
    <span class="part-badge" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
    <span class="skill-copy">
      <strong>${skill.name}</strong>
      <span class="skill-tags">
        <span class="skill-tag" style="--skill-color:${skill.color}">${skill.kindLabel}</span>
        <span class="skill-tag" style="--skill-color:${skill.color}">${skill.armorBreaker ? "破甲" : "输出"}</span>
      </span>
      <small>${skill.desc} ${skillSummaryText(skill)}</small>
    </span>
  `;
  button.addEventListener("click", () => useSkill(skill.id));
  return button;
}

function skillSummaryText(skill) {
  const pieces = [`伤害 ${skill.damage}`];
  if (skill.maxDots) pieces[0] = `每档伤害 ${skill.damage}`;
  if (skill.armorBreaker && skill.armorDamage > 0) pieces.push(`破甲 ${skill.armorDamage}`);
  if (skill.ammoCost) pieces.push(`弹药 ${skill.ammoCost}`);
  return `（${pieces.join(" / ")}）`;
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
      <span class="part-badge" style="--skill-color:${skill.color}">${renderPartIconGroup(skill.targetParts, "badge")}</span>
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
    button.addEventListener("click", () => useSoulArmorSkill(skill.id));
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
      return `<img class="part-icon part-icon-${mode}" src="${info.src}" alt="${info.label}" title="${info.label}" />`;
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
  return Math.max(0, partHp - (state.enemy.extraDamage || 0));
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

  if (skill.accessoryFlow) {
    startAccessorySkillFlow(skill, targets);
    updateUi();
    return;
  }

  settlePlayerSkill(skill, targets);
}

function settlePlayerSkill(skill, targets, context = {}) {
  const summary = targets.map((target) => applySkillToPart(target, skill, context));
  updateStage();
  logSkillSummary(skill, summary);

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

function useSoulArmorSkill(skillId, dots = 1) {
  const skill = soulArmorSkills.find((item) => item.id === skillId);
  if (!skill || !canUseSoulArmorSkill(skill)) return;
  const spendDots = Math.max(1, Math.min(skill.maxDots || 4, availableSoulDots(), dots));
  const soulCost = spendDots * skill.soulCost;

  state.activeSkill = skill;
  state.activeTarget = null;
  state.actionAnimTimer = 0.45;
  state.phase = "玩家行动";
  state.player.soul = Math.max(0, state.player.soul - soulCost);
  state.soulChargeDots = 0;
  ui.soulArmorButton.classList.remove("charging");

  const targets = skill.targetParts.map(partById).filter(Boolean);
  state.activeTarget = targets.length > 1 ? "multi" : targets[0]?.id || null;
  log(`${skill.name}发动：${spendDots} 档释放，目标${skill.targetLabel}。`);
  targets.forEach((target) => {
    const brokenBonus = target.broken ? 1.2 : 1;
    const damage = Math.round((target.weakpoint ? skill.damage * spendDots * 1.35 : skill.damage * spendDots) * brokenBonus);
    if (target.broken) {
      state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
    } else {
      target.hp = Math.max(0, target.hp - damage);
    }
    addFloater(damage, partPosition(target.id), skill.color);
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
  useSoulArmorSkill(skill.id, dots);
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
  let armorDamage = skill.armorDamage;
  let bounced = false;
  let exposedNow = false;
  const accessoryMultiplier = context.accessoryEffect?.damageMultiplier || 1;

  if (target.broken) {
    damage = Math.round(damage * accessoryMultiplier * 1.2 * (target.weakpoint ? skill.exposedBonus : Math.max(1, skill.exposedBonus)));
    state.enemy.extraDamage = (state.enemy.extraDamage || 0) + damage;
    state.player.soul = Math.min(100, state.player.soul + skill.soulGain + 4);
    state.enemy.hp = totalEnemyHp();
    addFloater(damage, partPosition(target.id), skill.color);
    return { target, damage, armorDamage: 0, bounced: false, exposedNow: false, brokenNow: false, brokenTarget: true };
  }

  if (target.armorState === "armored") {
    if (skill.armorBreaker) {
      target.armorValue = Math.max(0, target.armorValue - armorDamage);
      damage = Math.round(damage * 0.45);
      if (target.armorValue <= 0) {
        exposedNow = exposePart(target);
      }
    } else {
      bounced = true;
      armorDamage = armorDamage > 0 ? Math.max(1, Math.round(armorDamage * 0.25)) : 0;
      damage = Math.max(1, Math.round(damage * 0.18));
      target.armorValue = Math.max(0, target.armorValue - armorDamage);
    }
  } else {
    damage = Math.round(damage * (target.weakpoint ? skill.exposedBonus : Math.max(1, skill.exposedBonus)));
  }

  damage = Math.round(damage * accessoryMultiplier);

  target.hp = Math.max(0, target.hp - damage);
  state.player.soul = Math.min(100, state.player.soul + skill.soulGain + (bounced ? 0 : 4));
  state.enemy.hp = totalEnemyHp();
  addFloater(damage, partPosition(target.id), bounced ? "#b8bdc5" : skill.color);

  let brokenNow = false;
  if (!target.broken && target.hp <= 0) {
    brokenNow = true;
    breakPart(target);
  }

  return { target, damage, armorDamage, bounced, exposedNow, brokenNow };
}

function logSkillSummary(skill, results) {
  const targetNames = results.map((item) => item.target.label).join("、");
  const tagText = `${currentWeapon().name}/${skill.kindLabel}/${skill.targetLabel}`;
  log(`${skill.name}发动：${tagText}，命中${targetNames}。`);
  results.forEach((item) => {
    if (item.brokenTarget) {
      log(`${item.target.label}已被破坏，追击该部位获得 20% 增伤，造成 ${item.damage} 伤害。`);
    } else if (item.bounced) {
      log(`${item.target.label}硬甲弹开了攻击，伤害降低并造成 ${item.damage} 伤害。`);
    } else if (item.target.armorState === "armored") {
      log(`${item.target.label}硬甲受到 ${item.armorDamage} 破甲值，承受 ${item.damage} 伤害。`);
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
  state.turn = "player";
  state.phase = "玩家回合";
  state.enemy.intent = null;
  state.reactionTimer = 0;
  state.activeSkill = null;
  state.activeTarget = null;
  state.player.ammo = Math.min(state.player.maxAmmo, state.player.ammo + 1);
  state.player.action = Math.min(state.player.maxAction, state.player.action + 2);
  ui.reactionPanel.classList.add("hidden");
  updatePendingEnemyWarning();
  log(`第 ${state.round} 回合：玩家行动，弹药恢复 1，行动力恢复 2。`);
  updateUi();
}

function updatePendingEnemyWarning() {
  const nextAttack = enemyAttackSequence[state.enemy.attackIndex % enemyAttackSequence.length];
  state.pendingWeakpointWarning = nextAttack.id === "lava_burst";
  if (state.pendingWeakpointWarning) {
    showWeakpointTip(nextAttack.warningText, 2.4);
  }
}

function createEnemyThreat() {
  const attack = enemyAttackSequence[state.enemy.attackIndex % enemyAttackSequence.length];
  state.enemy.intent = attack;
  state.pendingWeakpointWarning = false;
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

function react(type) {
  if (!state.enemy.intent || state.turn !== "enemy" || state.result) return;
  if (state.qte && state.qte.active) {
    const success = state.qte.validResponses.includes(type);
    if (state.videoAttack) {
      resolveVideoQte(success ? "success" : "fail");
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
  state.player.hp = Math.max(0, state.player.hp - damage);
  log(success ? "闪避成功：避开胸口熔岩喷射。" : `闪避失败：胸口熔岩喷射命中，受到 ${damage} 伤害。`);
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

function resolveVideoQte(result) {
  if (!state.videoAttack || state.videoAttack.qteResolved) return;
  const attack = state.videoAttack.attack;
  state.videoAttack.qteResolved = true;
  state.videoAttack.result = result;
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

function finishVideoEnemyAttack(success) {
  if (!state.videoAttack) return;
  const attack = state.videoAttack.attack;
  const damage = success ? attack.damageOnSuccess : attack.damageOnFail;
  state.player.hp = Math.max(0, state.player.hp - damage);
  log(success ? "格挡/闪避成功：玩家没有受到伤害。" : `格挡/闪避失败：玩家受到 ${damage} 伤害。`);
  hideVideoOverlay();
  state.videoAttack = null;
  state.qte = null;
  state.enemy.intent = null;
  state.enemy.attackIndex += 1;

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

function bossSpriteForState() {
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
  floaters = floaters
    .map((floater) => ({ ...floater, y: floater.y - 36 * delta, life: floater.life - delta }))
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawCombatants();
  drawWeakpointEffects();
  drawFloaters();
  drawThreatOverlay();
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
  const player = { x: 365, footY: 738, height: 455 };
  const boss = { x: 938, bottom: 560, height: 330 };
  drawSprite(sprites.player, player.x, player.footY - player.height, player.height, true);
  drawSprite(bossSpriteForState(), boss.x, boss.bottom - boss.height, boss.height, false);
  drawPlayerHud(canvas.width - 172, canvas.height - 42);
  const bossHpW = Math.min(360, canvas.width * 0.34);
  const bossHpX = canvas.width / 2 - bossHpW / 2;
  const bossHpY = 18;
  drawHealthBar(bossHpX, bossHpY, bossHpW, state.enemy.hp / state.enemy.maxHp, "#e86c62");
  drawArmorStatus(bossHpX, bossHpY + 14, bossHpW);
}

function drawPlayerHud(x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(3, 5, 8, 0.46)";
  ctx.fillRect(x - 8, y - 8, 156, 42);
  drawHealthBar(x, y, 140, state.player.hp / state.player.maxHp, "#76d17b", 12);
  drawBarText(x, y, 140, 12, `${state.player.hp}/${state.player.maxHp}`);
  drawHealthBar(x, y + 17, 140, state.player.action / state.player.maxAction, "#58b7ff", 12);
  drawBarText(x, y + 17, 140, 12, `${state.player.action}/${state.player.maxAction}`);
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
  const core = partById("core");
  if (!core || core.broken) return;
  const pos = partPosition("core");
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 5.8);
  const introFocus = state.weakpointTipTimer > 0;
  const redWarning = state.pendingWeakpointWarning || state.enemy.intent?.id === "lava_burst";
  drawCoreWeakpointGlow(pos, 22 + pulse * 4, pulse, introFocus, redWarning);
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
    const ratio = part.maxArmor > 0 ? Math.max(0, part.armorValue) / part.maxArmor : Math.max(0, part.hp) / part.maxHp;
    const percent = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
    const segmentX = x + index * (segmentW + gap);
    const barY = y + 5;
    ctx.fillStyle = "rgba(12, 14, 18, 0.78)";
    ctx.fillRect(segmentX, barY, segmentW, 8);
    ctx.fillStyle = part.broken ? "#3f4650" : part.armorState === "armored" ? "#9aa1ab" : "#6a7380";
    ctx.fillRect(segmentX, barY, segmentW * Math.max(0, Math.min(1, ratio)), 8);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.strokeRect(segmentX, barY, segmentW, 8);
    drawArmorIcon(item.image, segmentX + 5, y - 4, 22);
    ctx.fillStyle = "#dfe7f1";
    ctx.fillText(`${percent}%`, segmentX + 34, y + 8);
  });
  ctx.restore();
}

function drawArmorIcon(image, x, y, size) {
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
    ctx.restore();
    return;
  }
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillRect(x, y, size, size);
  ctx.restore();
}

function drawFloaters() {
  floaters.forEach((floater) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, floater.life);
    const scale = 0.86 + 0.28 * Math.max(0, floater.life);
    ctx.font = `900 ${Math.round(38 * scale)}px Microsoft YaHei, sans-serif`;
    ctx.textAlign = "center";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(6, 8, 12, 0.88)";
    ctx.strokeText(`-${floater.value}`, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(`-${floater.value}`, floater.x, floater.y);
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

function addFloater(value, pos, color) {
  floaters.push({ value, x: pos.x, y: pos.y - 18, life: 0.9, color });
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
  ui.turnInfo.textContent = `第 ${state.round} 回合：${state.turn === "player" ? "玩家行动" : "敌方行动"}`;
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
ui.weaponToggle.addEventListener("click", toggleWeaponOverlay);
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

resetGame();
requestAnimationFrame(loop);
