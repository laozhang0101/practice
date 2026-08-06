"use strict";

const MAX_PLAYER_HP = 220;
const MAX_BOSS_HP = 420;
const MAX_ACTION_POINTS = 7;
const INITIAL_ACTION_POINTS = 4;
const TURN_RECOVERY = 2;
const PLAYER_HIT_DELAY = 280;
const PLAYER_ACTION_DURATION = 820;
const REACTION_WINDOW_DURATION = 500;
const ENEMY_ACTION_DURATION = 820;
const NORMAL_ATTACK_DAMAGE = 22;
const MAX_AMMO = 10;

const ACCESSORY_SLOTS = [
  { id: "shoulder", label: "肩膀" },
  { id: "chest", label: "前胸" },
  { id: "upperArm", label: "上臂" },
  { id: "back", label: "后背" },
  { id: "bracer", label: "护腕" },
  { id: "waist", label: "前腰" },
];

const SKILL_FRAME_SEQUENCES = {
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
};

const ACCESSORIES = {
  drone: {
    name: "无人机",
    role: "远程协同",
    summary: "核心连打时可选择无人机协同，伤害倍率提高至 1.18。",
    slot: "upperArm",
    icon: "./assets/loadout-drone.png",
    video: "./assets/videos/drone-accessory-effect-web.mp4",
    trigger: "核心连打进入挂件协同时可选择。",
    effect: "无人机从侧翼协同射击，本次技能伤害倍率提高至 1.18。",
  },
  jet: {
    name: "喷气式装置",
    role: "近战增幅",
    summary: "核心连打时可选择喷气装置介入，伤害倍率提高至 1.50。",
    slot: "shoulder",
    icon: "./assets/loadout-jet.png",
    video: "./assets/videos/jet-accessory-effect-web.mp4",
    trigger: "核心连打进入挂件协同时可选择。",
    effect: "喷气装置强化近战冲击，本次技能伤害倍率提高至 1.50。",
  },
  reactor: {
    name: "方舟反应炉",
    role: "能源支持",
    summary: "使喷气式装置和肩炮的增幅效果提高 20%。",
    slot: "chest",
    icon: "./assets/loadout-arc-reactor.jpeg",
    supportBonus: 0.2,
    trigger: "装配后常驻生效。",
    effect: "为喷气式装置和肩炮供能，使它们的介入倍率额外提高 20%。",
  },
  shoulderCannon: {
    name: "肩炮",
    role: "远程轰击",
    summary: "核心连打时可选择肩炮协同，伤害倍率提高至 1.35。",
    slot: "shoulder",
    icon: "./assets/loadout-shoulder-cannon.jpeg",
    video: "./assets/videos/drone-accessory-effect-web.mp4",
    trigger: "核心连打进入挂件协同时可选择。",
    effect: "肩炮追加远程轰击，本次技能伤害倍率提高至 1.35。",
  },
  spikedPauldron: {
    name: "尖刺肩甲",
    role: "反击增幅",
    summary: "反击与反击触发的追加攻击伤害提高 10%。",
    slot: "shoulder",
    iconText: "刺",
    counterMultiplier: 1.1,
    trigger: "任意格挡反击成功时自动生效。",
    effect: "基础反击和护腕十字斩追击伤害均提高 10%。",
  },
  counterBracer: {
    name: "反击护腕",
    role: "十字斩追击",
    summary: "格挡成功后由十字斩接管成功表现，并追加 24 点反击伤害。",
    slot: "bracer",
    icon: "./assets/loadout-shura-bracer.jpeg",
    counterVideo: "./assets/videos/counter-cross-slash-web.mp4?v=20260805-counter-01",
    counterDamage: 24,
    trigger: "格挡成功时自动生效。",
    effect: "直接播放十字斩追击表现，并在基础反击后追加 24 点伤害。",
  },
  quiver: {
    name: "箭袋",
    role: "穿甲箭备装",
    summary: "使穿臂箭获得强化破甲收益。",
    slot: "back",
    icon: "./assets/loadout-quiver.jpeg",
    pierceDamageMultiplier: 1.2,
    trigger: "使用弓弩的穿臂箭时自动生效。",
    effect: "原策略版提高破甲收益；简化版折算为穿臂箭伤害提高 20%。",
  },
  gourd: {
    name: "酒葫芦",
    role: "回合恢复",
    summary: "回合开始时有 50% 概率恢复 10 点生命，最多三次。",
    slot: "waist",
    icon: "./assets/loadout-gourd.jpeg",
    video: "./assets/videos/gourd-heal.mp4",
    triggerChance: 0.5,
    heal: 10,
    maxUses: 3,
    trigger: "玩家回合开始、生命未满时自动进行 50% 概率判定。",
    effect: "触发后播放饮酒表现并恢复 10 点生命，整场最多触发 3 次。",
  },
};

const WEAPONS = {
  fists: {
    name: "拳套",
    style: "近身压制",
    summary: "高速连击、行动灵活，用连续出手压缩怪物行动空间。",
    icon: "./assets/weapon-fists.png",
    player: "./assets/player-fists.png",
    skills: [
      {
        id: "fist_arm_rush",
        name: "核心连打",
        cost: 0,
        damage: 24,
        summary: "近战爆发，直击怪物核心。",
        cinematicVideo: "./assets/videos/fist-skill-1-attack-web.mp4",
        comboChance: 0.5,
        comboDamage: NORMAL_ATTACK_DAMAGE,
        accessoryFlow: {
          introVideo: "./assets/videos/fist-skill-1-attack-web.mp4",
          selectLoopVideo: "./assets/videos/accessory-select-loop-web.mp4",
          effects: {
            jet: {
              label: "喷气挂件",
              requiredAccessoryId: "jet",
              video: "./assets/videos/jet-accessory-effect-web.mp4",
              damageMultiplier: 1.5,
              reactorBoostable: true,
            },
            drone: {
              label: "无人机挂件",
              requiredAccessoryId: "drone",
              video: "./assets/videos/drone-accessory-effect-web.mp4",
              damageMultiplier: 1.18,
            },
            shoulderCannon: {
              label: "肩炮挂件",
              requiredAccessoryId: "shoulderCannon",
              video: "./assets/videos/drone-accessory-effect-web.mp4",
              damageMultiplier: 1.35,
              reactorBoostable: true,
            },
          },
        },
      },
      {
        id: "fist_leg_drive",
        name: "贴地踢击",
        cost: 1,
        damage: 44,
        summary: "低身突进，以贴地踢击制造破绽。",
        cinematicVideo: "./assets/videos/fist-leg-drive.mp4",
        comboChance: 0.5,
        comboDamage: NORMAL_ATTACK_DAMAGE,
      },
      {
        id: "fist_flurry",
        name: "近身乱舞",
        cost: 3,
        damage: 56,
        summary: "近身连续攻击，形成多方向压制。",
        frameSequence: "fist-close-flurry",
      },
    ],
  },
  greatsword: {
    name: "大剑",
    style: "重势破阵",
    summary: "用稳重而有力的斩击换取更高伤害，出手少，但每次都更有分量。",
    icon: "./assets/weapon-greatsword.png",
    player: "./assets/player-greatsword.png",
    skills: [
      {
        id: "gs_guard_stance",
        name: "防御姿态",
        cost: 0,
        damage: 0,
        summary: "进入防御姿态，近战来袭时有 70% 概率弹反。",
        stance: "greatsword_counter",
        counterChance: 0.7,
        counterDamage: 32,
      },
      {
        id: "gs_arm_sunder",
        name: "碎臂重斩",
        cost: 3,
        damage: 68,
        summary: "重型斩击，用大幅挥砍制造压迫。",
        frameSequence: "gs-arm-sunder",
      },
      {
        id: "gs_blood_reap",
        name: "嗜血断流",
        cost: 3,
        damage: 136,
        summary: "集中力量完成一次高伤害终结斩。",
        frameSequence: "gs-blood-reap",
      },
    ],
  },
  bow: {
    name: "弓弩",
    style: "远程点杀",
    summary: "保持安全距离，以精准射击和集中齐射制造稳定的远程压力。",
    icon: "./assets/weapon-bow.png",
    player: "./assets/player-bow.png",
    skills: [
      {
        id: "bow_arm_pierce",
        name: "穿臂箭",
        cost: 1,
        damage: 38,
        ammoCost: 1,
        summary: "远程穿透，精准射出穿甲箭。",
        frameSequence: "bow-arm-pierce",
      },
      {
        id: "bow_core_burst",
        name: "核心爆射",
        cost: 2,
        damage: 76,
        ammoCost: 2,
        summary: "消耗弹药，完成高伤害单点爆射。",
        frameSequence: "bow-core-burst",
      },
      {
        id: "bow_volley",
        name: "压制箭雨",
        cost: 3,
        damage: 84,
        ammoCost: 2,
        summary: "集中倾泻箭雨，形成远程压制。",
        frameSequence: "bow-leg-rain",
      },
    ],
  },
};

const ENEMY_ATTACKS = [
  {
    name: "怪物普攻",
    cue: "怪物逼近，重击即将命中",
    hint: "W 格挡",
    damage: 38,
    validResponses: ["block"],
    prepareVideo: "./assets/videos/大剑_准备格挡.mp4?v=20260805-210348",
    loadingVideo: "./assets/videos/大剑_格挡loading.mp4",
    successVideo: "./assets/videos/大剑_格挡成功.mp4",
    failVideo: "./assets/videos/大剑_格挡失败.mp4",
  },
];

const DEFENSE_NAMES = {
  left: "左闪",
  block: "格挡",
  right: "右闪",
};

const state = {
  page: "boss",
  selectedWeaponId: "fists",
  equippedAccessories: {
    shoulder: "jet",
    chest: "reactor",
    upperArm: "drone",
    back: "quiver",
    bracer: "counterBracer",
    waist: "gourd",
  },
  activeAccessorySlot: "shoulder",
  skillCinematic: null,
  inBattle: false,
  playerHp: MAX_PLAYER_HP,
  bossHp: MAX_BOSS_HP,
  actionPoints: INITIAL_ACTION_POINTS,
  ammo: MAX_AMMO,
  round: 1,
  phase: "idle",
  enemyAttackIndex: 0,
  activeEnemyAttack: null,
  greatswordStanceActive: false,
  gourdUses: 0,
  visualEffects: {},
};

const timers = new Set();
let reactionTimer = null;
let lifecycle = 0;
let activeFrameTimer = null;
let activePresentationFinish = null;
let presentationSerial = 0;
let battleTipTimer = null;
const preloadedFrames = new Map();

const dom = Object.fromEntries(
  [
    "prebattleShell",
    "bossPage",
    "loadoutPage",
    "flowStep",
    "goLoadoutButton",
    "backToBossButton",
    "loadoutStyleName",
    "loadoutStyleSummary",
    "loadoutPlayerImage",
    "selectedWeaponIcon",
    "selectedWeaponName",
    "weaponOptions",
    "skillPreviewList",
    "accessorySlots",
    "accessoryOptions",
    "accessoryCount",
    "accessorySlotTitle",
    "accessoryDetail",
    "enterBattleButton",
    "battleShell",
    "battleCanvas",
    "battleSkillOverlay",
    "battleWeaponName",
    "playerHpBar",
    "playerHpText",
    "roundText",
    "phaseText",
    "bossHpBar",
    "bossHpText",
    "battlefield",
    "turnBanner",
    "battleEventTip",
    "battleEventTipKicker",
    "battleEventTipTitle",
    "battleEventTipCopy",
    "playerUnit",
    "battlePlayerImage",
    "bossUnit",
    "floatingLayer",
    "cinematicOverlay",
    "cinematicVideo",
    "cinematicFrame",
    "cinematicKicker",
    "cinematicTitle",
    "accessoryChoice",
    "qteOverlay",
    "qteTitle",
    "qteCopy",
    "qteGauge",
    "enemyWarning",
    "enemyCue",
    "enemyAttackName",
    "enemyHint",
    "warningMeter",
    "defenseControls",
    "battleWeaponIcon",
    "battleWeaponStyle",
    "battleAccessories",
    "battleSkills",
    "actionPointText",
    "energyCells",
    "ammoStatus",
    "ammoText",
    "battleLog",
    "returnLoadoutButton",
    "restartBattleButton",
    "resultOverlay",
    "resultTitle",
    "resultCopy",
    "resultRestartButton",
    "resultLoadoutButton",
  ].map((id) => [id, document.getElementById(id)])
);

const battleContext = dom.battleCanvas.getContext("2d");
const battleSprites = {
  background: new Image(),
  player: new Image(),
  playerAvatar: new Image(),
  boss: new Image(),
  gourd: new Image(),
};

battleSprites.background.src = "./assets/arena-bg.jpeg";
battleSprites.player.src = WEAPONS[state.selectedWeaponId].player;
battleSprites.playerAvatar.src = "./assets/player-avatar.png";
battleSprites.boss.src = "./assets/boss.png";
battleSprites.gourd.src = ACCESSORIES.gourd.icon;
Object.values(battleSprites).forEach((sprite) => sprite.addEventListener("load", drawBattleScene));

function schedule(callback, delay) {
  const currentLifecycle = lifecycle;
  const timer = window.setTimeout(() => {
    timers.delete(timer);
    if (currentLifecycle === lifecycle) callback();
  }, delay);
  timers.add(timer);
  return timer;
}

function cancelTimer(timer) {
  if (timer === null) return;
  window.clearTimeout(timer);
  timers.delete(timer);
}

function cancelAllTimers() {
  lifecycle += 1;
  timers.forEach((timer) => window.clearTimeout(timer));
  timers.clear();
  reactionTimer = null;
  battleTipTimer = null;
  cancelSkillPresentation();
}

function clearBattleTip() {
  if (battleTipTimer !== null) cancelTimer(battleTipTimer);
  battleTipTimer = null;
  if (!dom.battleEventTip) return;
  dom.battleEventTip.classList.add("hidden");
  dom.battleEventTip.classList.remove("player", "success", "enemy", "accessory", "system");
}

function showBattleTip(title, copy, tone = "system", duration = 1900) {
  if (!state.inBattle || !dom.battleEventTip) return;
  if (battleTipTimer !== null) cancelTimer(battleTipTimer);
  dom.battleEventTipKicker.textContent = tone === "accessory" ? "挂件触发" : "战斗提示";
  dom.battleEventTipTitle.textContent = title;
  dom.battleEventTipCopy.textContent = copy;
  dom.battleEventTip.classList.remove("hidden", "visible", "player", "success", "enemy", "accessory", "system");
  dom.battleEventTip.classList.add(tone);
  void dom.battleEventTip.offsetWidth;
  dom.battleEventTip.classList.add("visible");
  battleTipTimer = schedule(() => {
    dom.battleEventTip.classList.remove("visible");
    dom.battleEventTip.classList.add("hidden");
    battleTipTimer = null;
  }, duration);
}

function getSelectedWeapon() {
  return WEAPONS[state.selectedWeaponId];
}

function getSelectedAccessories() {
  return ACCESSORY_SLOTS.map((slot) => {
    const accessoryId = state.equippedAccessories[slot.id];
    const accessory = ACCESSORIES[accessoryId];
    return accessory ? { id: accessoryId, slotId: slot.id, slotLabel: slot.label, ...accessory } : null;
  }).filter(Boolean);
}

function hasAccessory(accessoryId) {
  return Object.values(state.equippedAccessories).includes(accessoryId);
}

function accessoryIconMarkup(accessory) {
  if (accessory?.icon) return `<img src="${accessory.icon}" alt="" />`;
  return `<span class="accessory-symbol" aria-hidden="true">${accessory?.iconText || "挂"}</span>`;
}

function renderAccessoryDetail(accessory) {
  if (!dom.accessoryDetail) return;
  if (!accessory) {
    dom.accessoryDetail.innerHTML = "<p>当前部位尚未装配挂件。</p>";
    return;
  }
  dom.accessoryDetail.innerHTML = `
    <header><strong>${accessory.name}</strong><small>${accessory.role}</small></header>
    <div class="accessory-detail-copy">
      <p><b>触发</b>${accessory.trigger || "装配后生效。"}</p>
      <p><b>效果</b>${accessory.effect || accessory.summary}</p>
    </div>
  `;
}

function getCounterAccessory() {
  const accessoryId = state.equippedAccessories.bracer;
  const accessory = ACCESSORIES[accessoryId];
  return accessory?.counterVideo ? { id: accessoryId, ...accessory } : null;
}

function getCounterChainMultiplier() {
  return hasAccessory("spikedPauldron") ? ACCESSORIES.spikedPauldron.counterMultiplier : 1;
}

function setPrebattlePage(page) {
  state.page = page;
  dom.prebattleShell.dataset.page = page;
  dom.bossPage.classList.toggle("hidden", page !== "boss");
  dom.loadoutPage.classList.toggle("hidden", page !== "loadout");
  dom.flowStep.textContent = page === "boss" ? "选择强敌" : "武器与挂件";
}

function renderWeaponOptions() {
  dom.weaponOptions.replaceChildren();

  Object.entries(WEAPONS).forEach(([weaponId, weapon]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "weapon-option";
    button.dataset.weaponId = weaponId;
    button.setAttribute("aria-pressed", String(weaponId === state.selectedWeaponId));
    button.innerHTML = `
      <img src="${weapon.icon}" alt="" />
      <strong>${weapon.name}</strong>
      <small>${weapon.style}</small>
    `;
    button.classList.toggle("selected", weaponId === state.selectedWeaponId);
    button.addEventListener("click", () => selectWeapon(weaponId));
    dom.weaponOptions.append(button);
  });
}

function renderSkillPreview() {
  const weapon = getSelectedWeapon();
  dom.skillPreviewList.replaceChildren();

  weapon.skills.forEach((skill, index) => {
    const item = document.createElement("article");
    item.className = "skill-preview-item";
    const resourceCost = skill.ammoCost ? ` · 弹药 ${skill.ammoCost}` : "";
    item.innerHTML = `
      <span class="skill-index">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${skill.name}</strong><small>${skill.summary}</small></span>
      <b>${skill.cost === 0 ? `免费${resourceCost}` : `${skill.cost} 点${resourceCost}`}</b>
    `;
    dom.skillPreviewList.append(item);
  });
}

function renderAccessorySlots() {
  dom.accessorySlots.replaceChildren();

  ACCESSORY_SLOTS.forEach((slot) => {
    const accessoryId = state.equippedAccessories[slot.id];
    const accessory = ACCESSORIES[accessoryId];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "accessory-slot";
    button.classList.toggle("active", state.activeAccessorySlot === slot.id);
    button.dataset.accessorySlot = slot.id;
    button.setAttribute("aria-pressed", String(state.activeAccessorySlot === slot.id));
    button.innerHTML = `
      <span class="accessory-slot-head">${slot.label}</span>
      <span class="accessory-slot-box${accessory ? " equipped" : ""}">
        ${accessory ? accessoryIconMarkup(accessory) : "<strong>+</strong>"}
      </span>
    `;
    button.addEventListener("click", () => {
      state.activeAccessorySlot = slot.id;
      renderAccessoryOptions();
    });
    dom.accessorySlots.append(button);
  });
}

function renderAccessoryOptions() {
  const activeSlot = ACCESSORY_SLOTS.find((slot) => slot.id === state.activeAccessorySlot) || ACCESSORY_SLOTS[0];
  const equippedCount = getSelectedAccessories().length;
  dom.accessoryOptions.replaceChildren();
  dom.accessoryCount.textContent = `已装 ${equippedCount} / ${ACCESSORY_SLOTS.length}`;
  dom.accessorySlotTitle.textContent = `装配挂件：${activeSlot.label}`;

  Object.entries(ACCESSORIES)
    .filter(([, accessory]) => accessory.slot === activeSlot.id)
    .forEach(([accessoryId, accessory]) => {
      const selected = state.equippedAccessories[activeSlot.id] === accessoryId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "accessory-option";
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.title = accessory.summary;
      button.innerHTML = `
        <span class="accessory-card-preview">${accessoryIconMarkup(accessory)}</span>
        <span><strong>${accessory.name}</strong><small>${accessory.role}</small></span>
      `;
      button.addEventListener("click", () => equipAccessory(accessoryId));
      dom.accessoryOptions.append(button);
    });

  const selectedAccessoryId = state.equippedAccessories[activeSlot.id];
  renderAccessoryDetail(ACCESSORIES[selectedAccessoryId]);
  renderAccessorySlots();
}

function equipAccessory(accessoryId) {
  const accessory = ACCESSORIES[accessoryId];
  if (!accessory || accessory.slot !== state.activeAccessorySlot) return;
  state.equippedAccessories[state.activeAccessorySlot] = accessoryId;
  renderAccessoryOptions();
}

function renderBattleAccessories() {
  dom.battleAccessories.replaceChildren();
  getSelectedAccessories().forEach((accessory) => {
    const item = document.createElement("span");
    item.className = "battle-accessory-chip";
    item.title = accessory.summary;
    item.innerHTML = `${accessoryIconMarkup(accessory)}<span><small>${accessory.slotLabel}</small>${accessory.name}</span>`;
    dom.battleAccessories.append(item);
  });
}

function selectWeapon(weaponId) {
  if (!WEAPONS[weaponId]) return;
  state.selectedWeaponId = weaponId;
  const weapon = getSelectedWeapon();

  dom.loadoutStyleName.textContent = weapon.style;
  dom.loadoutStyleSummary.textContent = weapon.summary;
  dom.loadoutPlayerImage.src = weapon.player;
  dom.loadoutPlayerImage.alt = `使用${weapon.name}的战斗化身`;
  dom.selectedWeaponIcon.src = weapon.icon;
  dom.selectedWeaponName.textContent = weapon.name;

  renderWeaponOptions();
  renderSkillPreview();
  renderAccessoryOptions();
}

function enterBattle() {
  cancelAllTimers();
  document.body.classList.add("battle-active");
  dom.prebattleShell.classList.add("hidden");
  dom.battleShell.classList.remove("hidden");
  resetBattle();
}

function returnToLoadout() {
  cancelAllTimers();
  clearBattleTip();
  document.body.classList.remove("battle-active");
  state.inBattle = false;
  state.phase = "idle";
  state.skillCinematic = null;
  dom.resultOverlay.classList.add("hidden");
  hideEnemyPrompt();
  clearBattlefieldStates();
  dom.battleShell.classList.add("hidden");
  dom.prebattleShell.classList.remove("hidden");
  setPrebattlePage("loadout");
}

function resetBattle() {
  cancelAllTimers();
  clearBattleTip();
  state.inBattle = true;
  state.playerHp = MAX_PLAYER_HP;
  state.bossHp = MAX_BOSS_HP;
  state.actionPoints = INITIAL_ACTION_POINTS;
  state.ammo = MAX_AMMO;
  state.round = 1;
  state.enemyAttackIndex = 0;
  state.activeEnemyAttack = null;
  state.greatswordStanceActive = false;
  state.gourdUses = 0;
  state.skillCinematic = null;
  state.visualEffects = {};
  dom.resultOverlay.classList.add("hidden");
  dom.battleLog.replaceChildren();
  hideEnemyPrompt();
  clearBattlefieldStates();

  const weapon = getSelectedWeapon();
  dom.battleWeaponName.textContent = weapon.name;
  dom.battleWeaponIcon.src = weapon.icon;
  dom.battleWeaponStyle.textContent = `${weapon.name} · ${weapon.style}`;
  dom.battlePlayerImage.src = weapon.player;
  dom.battlePlayerImage.alt = `使用${weapon.name}的战斗化身`;
  battleSprites.player.src = weapon.player;
  renderBattleAccessories();

  addBattleLog(`携带${weapon.name}进入战斗。`, "system");
  const accessoryNames = getSelectedAccessories().map((accessory) => accessory.name).join("、");
  addBattleLog(
    accessoryNames ? `携带挂件：${accessoryNames}。` : "本场未携带挂件。",
    "system"
  );
  showBattleTip(
    "装配已生效",
    `${weapon.name}与 ${getSelectedAccessories().length} 件挂件进入战斗；触发时会显示具体效果。`,
    "system",
    2600
  );
  startPlayerTurn(true);
}

function clearBattlefieldStates() {
  dom.battlefield.classList.remove(
    "player-attacking",
    "boss-hit",
    "boss-impact",
    "enemy-attacking",
    "player-hit",
    "player-blocking",
    "player-dodge-left",
    "player-dodge-right",
    "enemy-turn"
  );
  state.visualEffects = {};
}

function pulseBattlefield(className, duration) {
  dom.battlefield.classList.remove(className);
  void dom.battlefield.offsetWidth;
  dom.battlefield.classList.add(className);
  state.visualEffects[className] = {
    start: performance.now(),
    duration,
  };
  schedule(() => dom.battlefield.classList.remove(className), duration);
}

function visualEffectProgress(name, now = performance.now()) {
  const effect = state.visualEffects[name];
  if (!effect) return null;
  const progress = (now - effect.start) / effect.duration;
  if (progress >= 1) {
    delete state.visualEffects[name];
    return null;
  }
  return Math.max(0, progress);
}

function drawBattleScene(now = performance.now()) {
  const ctx = battleContext;
  const canvas = dom.battleCanvas;
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCanvasBackground(ctx, canvas);
  drawCanvasCombatants(ctx, now);
  drawCanvasHud(ctx);
}

function drawCanvasBackground(ctx, canvas) {
  if (battleSprites.background.complete && battleSprites.background.naturalWidth) {
    drawCoverImage(ctx, battleSprites.background, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#101114";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(4, 8, 12, 0.18)");
  gradient.addColorStop(1, "rgba(4, 6, 9, 0.44)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasCombatants(ctx, now) {
  const attackProgress = visualEffectProgress("player-attacking", now);
  const enemyProgress = visualEffectProgress("enemy-attacking", now);
  const playerHitProgress = visualEffectProgress("player-hit", now);
  const blockProgress = visualEffectProgress("player-blocking", now);
  const dodgeLeftProgress = visualEffectProgress("player-dodge-left", now);
  const dodgeRightProgress = visualEffectProgress("player-dodge-right", now);
  const bossHitProgress = visualEffectProgress("boss-hit", now);
  const bossImpactProgress = visualEffectProgress("boss-impact", now);

  let playerX = 365;
  let playerY = 738;
  let bossX = 938;
  let bossY = 560;

  if (attackProgress !== null) {
    const travel = Math.sin(Math.PI * attackProgress);
    playerX += travel * 345;
    playerY -= travel * 14;
  }
  if (enemyProgress !== null) bossX -= Math.sin(Math.PI * enemyProgress) * 210;
  if (playerHitProgress !== null) playerX -= Math.sin(playerHitProgress * Math.PI * 6) * 14 * (1 - playerHitProgress);
  if (blockProgress !== null) playerX -= Math.sin(Math.PI * blockProgress) * 22;
  if (dodgeLeftProgress !== null) playerX -= Math.sin(Math.PI * dodgeLeftProgress) * 105;
  if (dodgeRightProgress !== null) playerX += Math.sin(Math.PI * dodgeRightProgress) * 105;
  if (bossHitProgress !== null) bossX += Math.sin(bossHitProgress * Math.PI * 7) * 12 * (1 - bossHitProgress);

  drawCanvasSprite(ctx, battleSprites.player, playerX, playerY - 455, 455, true);
  drawCanvasGourd(ctx, playerX, playerY, 455);
  drawCanvasSprite(ctx, battleSprites.boss, bossX, bossY - 330, 330, false);

  if (attackProgress !== null && attackProgress > 0.32 && attackProgress < 0.72) {
    const strength = Math.sin(((attackProgress - 0.32) / 0.4) * Math.PI);
    drawCanvasSlash(ctx, 884, 380, strength, "#f0b84f");
  }
  const impactProgress = bossHitProgress ?? bossImpactProgress;
  if (impactProgress !== null) {
    drawCanvasImpact(ctx, 900, 385, Math.sin(Math.PI * impactProgress));
  }
  if (blockProgress !== null) {
    drawCanvasGuard(ctx, playerX + 78, playerY - 260, Math.sin(Math.PI * blockProgress));
  }
}

function drawCanvasGourd(ctx, playerX, footY, playerHeight) {
  if (!hasAccessory("gourd") || !battleSprites.gourd.complete || !battleSprites.gourd.naturalWidth) return;
  const size = Math.max(24, playerHeight * 0.1);
  ctx.save();
  ctx.shadowColor = "rgba(255, 176, 74, 0.48)";
  ctx.shadowBlur = 5;
  ctx.drawImage(battleSprites.gourd, playerX - 6 - size / 2, footY - playerHeight * 0.44 - size / 2, size, size);
  ctx.restore();
}

function drawCanvasSlash(ctx, x, y, strength, color) {
  if (strength <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.52);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.35 + strength * 0.65;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.98)";
  ctx.lineWidth = 4 + strength * 12;
  ctx.beginPath();
  ctx.moveTo(-88, 0);
  ctx.lineTo(88, 0);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 10 + strength * 18;
  ctx.globalAlpha = strength * 0.45;
  ctx.stroke();
  ctx.restore();
}

function drawCanvasImpact(ctx, x, y, strength) {
  if (strength <= 0) return;
  const radius = 28 + strength * 56;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = "lighter";
  const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
  gradient.addColorStop(0, `rgba(255,255,255,${0.9 * strength})`);
  gradient.addColorStop(0.28, `rgba(255,155,66,${0.72 * strength})`);
  gradient.addColorStop(1, "rgba(255,110,32,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCanvasGuard(ctx, x, y, strength) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(112,205,255,${0.36 + strength * 0.6})`;
  ctx.lineWidth = 4 + strength * 5;
  ctx.beginPath();
  ctx.arc(x, y, 50 + strength * 16, -1.22, 1.22);
  ctx.stroke();
  ctx.restore();
}

function drawCanvasHud(ctx) {
  const bossWidth = 360;
  const bossX = (dom.battleCanvas.width - bossWidth) / 2;
  drawCanvasBar(ctx, bossX, 18, bossWidth, state.bossHp / MAX_BOSS_HP, "#e86c62", `${state.bossHp}/${MAX_BOSS_HP}`);

  const panelX = dom.battleCanvas.width - 280;
  const panelY = dom.battleCanvas.height - 94;
  ctx.save();
  ctx.fillStyle = "rgba(3, 5, 8, 0.56)";
  canvasRoundedRect(ctx, panelX - 8, panelY - 8, 252, state.selectedWeaponId === "bow" ? 86 : 68, 8);
  ctx.fill();
  if (battleSprites.playerAvatar.complete && battleSprites.playerAvatar.naturalWidth) {
    ctx.save();
    canvasRoundedRect(ctx, panelX, panelY, 44, 44, 6);
    ctx.clip();
    drawCoverImage(ctx, battleSprites.playerAvatar, panelX, panelY, 44, 44);
    ctx.restore();
  }
  drawCanvasBar(ctx, panelX + 54, panelY + 2, 178, state.playerHp / MAX_PLAYER_HP, "#d9e9ef", `${state.playerHp}/${MAX_PLAYER_HP}`, 18);
  drawCanvasActionCells(ctx, panelX + 54, panelY + 29, 178);
  if (state.selectedWeaponId === "bow") {
    drawCanvasBar(ctx, panelX + 54, panelY + 49, 178, state.ammo / MAX_AMMO, "#d7a94d", `弹药 ${state.ammo}/${MAX_AMMO}`, 12);
  }
  ctx.restore();
}

function drawCanvasActionCells(ctx, x, y, width) {
  const gap = 3;
  const cellWidth = (width - gap * (MAX_ACTION_POINTS - 1)) / MAX_ACTION_POINTS;
  for (let index = 0; index < MAX_ACTION_POINTS; index += 1) {
    const cellX = x + index * (cellWidth + gap);
    ctx.fillStyle = index < state.actionPoints ? "#2f8fff" : "rgba(18, 28, 40, 0.82)";
    ctx.fillRect(cellX, y, cellWidth, 13);
    ctx.strokeStyle = index < state.actionPoints ? "rgba(180, 224, 255, 0.62)" : "rgba(90,119,142,0.44)";
    ctx.strokeRect(cellX + 0.5, y + 0.5, cellWidth - 1, 12);
  }
  drawCanvasText(ctx, x, y, width, 13, `${state.actionPoints}/${MAX_ACTION_POINTS}`);
}

function drawCanvasBar(ctx, x, y, width, ratio, color, text, height = 8) {
  ctx.fillStyle = "rgba(3, 5, 8, 0.78)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * Math.max(0, Math.min(1, ratio)), height);
  ctx.strokeStyle = "rgba(255,255,255,0.52)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  drawCanvasText(ctx, x, y, width, height, text);
}

function drawCanvasText(ctx, x, y, width, height, text) {
  ctx.save();
  ctx.font = "900 10px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.84)";
  ctx.fillStyle = "#f8fbff";
  ctx.strokeText(text, x + width / 2, y + height / 2 + 0.5);
  ctx.fillText(text, x + width / 2, y + height / 2 + 0.5);
  ctx.restore();
}

function drawCanvasSprite(ctx, image, centerX, topY, height, flip) {
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

function drawCoverImage(ctx, image, x, y, width, height) {
  const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / ratio;
  const sourceHeight = height / ratio;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function canvasRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function runBattleRenderLoop(now) {
  if (state.inBattle) drawBattleScene(now);
  window.requestAnimationFrame(runBattleRenderLoop);
}

function setPhase(label, banner = label) {
  dom.phaseText.textContent = label;
  dom.turnBanner.textContent = banner;
  dom.roundText.textContent = `第 ${state.round} 回合`;
}

function startPlayerTurn(isFirstTurn = false) {
  if (!state.inBattle) return;
  state.phase = "player-start";
  state.activeEnemyAttack = null;
  hideEnemyPrompt();
  dom.battlefield.classList.remove("enemy-turn");

  if (!isFirstTurn) {
    const before = state.actionPoints;
    state.actionPoints = Math.min(MAX_ACTION_POINTS, state.actionPoints + TURN_RECOVERY);
    const recovered = state.actionPoints - before;
    addBattleLog(`第 ${state.round} 回合开始，恢复 ${recovered} 点行动力。`, "system");
    showBattleTip(`第 ${state.round} 回合`, `行动力恢复 ${recovered} 点，当前 ${state.actionPoints}/${MAX_ACTION_POINTS}。`, "system");
  } else {
    showBattleTip("玩家先攻", `使用${getSelectedWeapon().name}选择本回合行动。`, "player");
  }

  if (tryTriggerGourd()) return;
  openPlayerCommand();
}

function openPlayerCommand() {
  if (!state.inBattle) return;
  state.phase = "player";
  setPhase("玩家行动", "选择技能");
  updateBattleUI();
}

function tryTriggerGourd() {
  const gourd = ACCESSORIES.gourd;
  const canTrigger =
    hasAccessory("gourd") &&
    state.gourdUses < gourd.maxUses &&
    state.playerHp < MAX_PLAYER_HP &&
    Math.random() < gourd.triggerChance;

  if (!canTrigger) return false;

  state.phase = "accessory-action";
  state.gourdUses += 1;
  setPhase("挂件触发", gourd.name);
  addBattleLog(`酒葫芦触发，开始饮酒恢复。`, "success");
  showBattleTip("酒葫芦触发", `本回合通过 50% 判定，开始饮酒恢复生命。`, "accessory", 2400);
  updateBattleUI();
  playSkillVideo(
    { name: gourd.name, cinematicVideo: gourd.video },
    () => {
      if (!state.inBattle) return;
      const before = state.playerHp;
      state.playerHp = Math.min(MAX_PLAYER_HP, state.playerHp + gourd.heal);
      const recovered = state.playerHp - before;
      showFloatNumber(`+${recovered}`, "player", "success");
      addBattleLog(`酒葫芦恢复 ${recovered} 点生命（${state.gourdUses}/${gourd.maxUses}）。`, "success");
      showBattleTip("饮酒完成", `恢复 ${recovered} 点生命，本场已饮用 ${state.gourdUses}/${gourd.maxUses} 次。`, "accessory");
      updateBattleUI();
      schedule(openPlayerCommand, 320);
    }
  );
  return true;
}

function renderBattleSkills() {
  const weapon = getSelectedWeapon();
  dom.battleSkills.replaceChildren();

  weapon.skills.forEach((skill) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `battle-skill-card${skill.cost > 0 ? " has-action-cost" : ""}`;
    button.style.setProperty("--skill-color", skill.stance ? "#ee9545" : "#58b7ff");
    const lacksAmmo = (skill.ammoCost || 0) > state.ammo;
    const effectText = skill.stance
      ? `弹反率 ${Math.round(skill.counterChance * 100)}% · 反击 ${skill.counterDamage}`
      : `伤害 ${skill.damage}${skill.ammoCost ? ` · 弹药 ${skill.ammoCost}` : ""}`;
    button.disabled = state.phase !== "player" || skill.cost > state.actionPoints || lacksAmmo;
    const tags = [
      skill.comboChance ? '<i class="skill-tag combo">连击</i>' : "",
      skill.stance ? '<i class="skill-tag counter">反击</i>' : '<i class="skill-tag">主动</i>',
    ].join("");
    button.innerHTML = `
      ${skill.cost > 0 ? `<span class="action-cost-corner"><b>${skill.cost}</b></span>` : ""}
      <span class="skill-emblem"><img src="${weapon.icon}" alt="" /></span>
      <span class="skill-copy">
        <strong>${skill.name}</strong>
        <span class="skill-tags">${tags}</span>
        <small>${skill.summary}（${effectText}）</small>
      </span>
    `;
    button.addEventListener("click", () => useSkill(skill.id));
    dom.battleSkills.append(button);
  });
}

function updateBattleUI() {
  const playerRatio = Math.max(0, state.playerHp / MAX_PLAYER_HP);
  const bossRatio = Math.max(0, state.bossHp / MAX_BOSS_HP);
  dom.playerHpBar.style.width = `${playerRatio * 100}%`;
  dom.bossHpBar.style.width = `${bossRatio * 100}%`;
  dom.playerHpText.textContent = `${Math.max(0, state.playerHp)} / ${MAX_PLAYER_HP}`;
  dom.bossHpText.textContent = `${Math.max(0, state.bossHp)} / ${MAX_BOSS_HP}`;
  dom.actionPointText.textContent = `${state.actionPoints} / ${MAX_ACTION_POINTS}`;
  dom.ammoStatus.classList.toggle("hidden", state.selectedWeaponId !== "bow");
  dom.ammoText.textContent = `${state.ammo} / ${MAX_AMMO}`;
  dom.roundText.textContent = `第 ${state.round} 回合`;
  dom.battleSkillOverlay.classList.toggle("active", state.phase === "player");

  dom.energyCells.replaceChildren();
  for (let index = 0; index < MAX_ACTION_POINTS; index += 1) {
    const cell = document.createElement("i");
    cell.classList.toggle("filled", index < state.actionPoints);
    dom.energyCells.append(cell);
  }

  renderBattleSkills();
  drawBattleScene();
}

function findSkill(skillId) {
  return getSelectedWeapon().skills.find((skill) => skill.id === skillId);
}

function useSkill(skillId) {
  if (!state.inBattle || state.phase !== "player") return;
  const skill = findSkill(skillId);
  if (
    !skill ||
    skill.cost > state.actionPoints ||
    (skill.ammoCost || 0) > state.ammo
  ) {
    return;
  }

  state.phase = "player-action";
  state.actionPoints -= skill.cost;
  state.ammo -= skill.ammoCost || 0;
  setPhase("行动结算", skill.name);
  updateBattleUI();

  if (skill.stance === "greatsword_counter") {
    state.greatswordStanceActive = true;
    addBattleLog(
      `进入${skill.name}，下一次受击有 ${Math.round(skill.counterChance * 100)}% 概率弹反。`,
      "player"
    );
    showBattleTip("进入防御姿态", `等待近战攻击；成功格挡后将发动大剑反击。`, "player");
    pulseBattlefield("player-blocking", 560);
    schedule(startEnemyTurn, 640);
    return;
  }

  addBattleLog(`使用${skill.name}，技能表现开始。`, "player");
  showBattleTip(`使用 ${skill.name}`, `消耗 ${skill.cost} 点行动力，进入技能表现。`, "player");
  if (skill.accessoryFlow) {
    startAccessorySkillFlow(skill);
    return;
  }
  playSkillPresentation(skill, () => settlePlayerSkill(skill));
}

function availableAccessoryEffects(skill) {
  return Object.entries(skill.accessoryFlow?.effects || {}).filter(([, effect]) => {
    return !effect.requiredAccessoryId || hasAccessory(effect.requiredAccessoryId);
  });
}

function boostedAccessoryEffect(effect) {
  if (!effect?.reactorBoostable || !hasAccessory("reactor")) return { ...effect };
  const reactorBonus = 1 + ACCESSORIES.reactor.supportBonus;
  return {
    ...effect,
    label: `${effect.label}（方舟增幅）`,
    damageMultiplier: Math.round(effect.damageMultiplier * reactorBonus * 100) / 100,
    arcBoosted: true,
  };
}

function renderAccessoryChoices(skill) {
  const entries = availableAccessoryEffects(skill);
  dom.accessoryChoice.replaceChildren();

  entries.forEach(([accessoryId, rawEffect]) => {
    const effect = boostedAccessoryEffect(rawEffect);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "accessory-choice-zone";
    button.dataset.accessory = accessoryId;
    button.innerHTML = `
      <span>${effect.label}</span>
      <small>伤害 x${effect.damageMultiplier}${effect.arcBoosted ? " / 方舟反应炉供能" : ""}</small>
    `;
    button.addEventListener("click", () => chooseAccessory(accessoryId));
    dom.accessoryChoice.append(button);
  });

  return entries.length > 0;
}

function startAccessorySkillFlow(skill) {
  state.skillCinematic = { skill, stage: "intro", selectedAccessory: null };
  addBattleLog(`${skill.name}发动，进入挂件协同。`, "player");
  playSkillVideo(
    { name: skill.name, cinematicVideo: skill.accessoryFlow.introVideo },
    () => showAccessorySelectionLoop(skill)
  );
}

function showAccessorySelectionLoop(skill) {
  if (!state.inBattle || state.skillCinematic?.skill.id !== skill.id) return;
  state.skillCinematic = { skill, stage: "select", selectedAccessory: null };
  if (!renderAccessoryChoices(skill)) {
    addBattleLog("当前没有可介入的挂件，直接结算技能。", "system");
    state.skillCinematic = null;
    settlePlayerSkill(skill, { presentationMode: "video" });
    return;
  }

  playAccessorySelectionLoop(skill);
  dom.accessoryChoice.classList.remove("hidden");
  addBattleLog("挂件待命：选择本次介入的挂件。", "system");
  showBattleTip("挂件协同窗口", "选择一个已装配挂件介入本次攻击。", "accessory", 2600);
}

function chooseAccessory(accessoryId) {
  const cinematic = state.skillCinematic;
  if (!cinematic || cinematic.stage !== "select") return;
  const rawEffect = cinematic.skill.accessoryFlow.effects[accessoryId];
  if (!rawEffect || (rawEffect.requiredAccessoryId && !hasAccessory(rawEffect.requiredAccessoryId))) return;

  const effect = boostedAccessoryEffect(rawEffect);
  cinematic.stage = "effect";
  cinematic.selectedAccessory = accessoryId;
  dom.accessoryChoice.classList.add("hidden");
  addBattleLog(`挂件选择：${effect.label}。`, "success");
  showBattleTip(effect.label, `协同介入，本次技能伤害倍率 x${effect.damageMultiplier}。`, "accessory", 2400);
  if (effect.arcBoosted) {
    addBattleLog("方舟反应炉供能，本次挂件介入威力提高 20%。", "success");
    showBattleTip("方舟反应炉供能", `${effect.label}获得额外 20% 能源增幅。`, "accessory", 2400);
  }

  playSkillVideo(
    { name: effect.label, cinematicVideo: effect.video },
    () => finishAccessorySkillFlow(effect)
  );
}

function finishAccessorySkillFlow(effect) {
  const cinematic = state.skillCinematic;
  if (!cinematic) return;
  const skill = cinematic.skill;
  state.skillCinematic = null;
  settlePlayerSkill(skill, {
    damageMultiplier: effect.damageMultiplier,
    presentationMode: "video",
  });
}

function getFramePath(sequence, frameIndex) {
  return `${sequence.basePath}/frame_${String(frameIndex).padStart(3, "0")}.webp`;
}

function cleanupSkillPresentation() {
  dom.cinematicVideo.onended = null;
  dom.cinematicVideo.onerror = null;
  dom.cinematicVideo.pause();
  dom.cinematicVideo.loop = false;
  dom.cinematicVideo.removeAttribute("src");
  dom.cinematicVideo.load();
  dom.cinematicFrame.onerror = null;
  dom.cinematicFrame.removeAttribute("src");
  dom.cinematicVideo.classList.remove("hidden");
  dom.cinematicFrame.classList.add("hidden");
  dom.cinematicOverlay.classList.add("hidden");
  dom.accessoryChoice.classList.add("hidden");
  dom.qteOverlay.classList.add("hidden");
  dom.qteGauge.style.transition = "none";
  dom.qteGauge.style.width = "100%";
  dom.cinematicKicker.textContent = "技能表现";
  dom.cinematicTitle.textContent = "";
  if (activeFrameTimer !== null) {
    cancelTimer(activeFrameTimer);
    activeFrameTimer = null;
  }
}

function cancelSkillPresentation() {
  presentationSerial += 1;
  activePresentationFinish = null;
  if (dom.cinematicOverlay) cleanupSkillPresentation();
}

function beginSkillPresentation(skill, onComplete) {
  cancelSkillPresentation();
  const serial = ++presentationSerial;
  let completed = false;

  dom.cinematicKicker.textContent = "技能表现";
  dom.cinematicTitle.textContent = skill.name;
  dom.cinematicOverlay.classList.remove("hidden");

  const finish = () => {
    if (completed || serial !== presentationSerial) return;
    completed = true;
    activePresentationFinish = null;
    cleanupSkillPresentation();
    if (state.inBattle) onComplete();
  };

  activePresentationFinish = finish;
  return { finish, serial };
}

function playSkillVideo(skill, onComplete) {
  const { finish } = beginSkillPresentation(skill, onComplete);
  dom.cinematicVideo.classList.remove("hidden");
  dom.cinematicFrame.classList.add("hidden");
  dom.cinematicVideo.onended = finish;
  dom.cinematicVideo.onerror = () => {
    addBattleLog(`${skill.name}视频加载失败，已直接进入结算。`, "system");
    finish();
  };
  dom.cinematicVideo.src = skill.cinematicVideo;
  dom.cinematicVideo.currentTime = 0;
  const playRequest = dom.cinematicVideo.play();
  if (playRequest) {
    playRequest.catch(() => {
      addBattleLog(`${skill.name}视频无法自动播放，已直接进入结算。`, "system");
      finish();
    });
  }
}

function playAccessorySelectionLoop(skill) {
  cancelSkillPresentation();
  presentationSerial += 1;
  activePresentationFinish = null;
  dom.cinematicKicker.textContent = "挂件协同";
  dom.cinematicTitle.textContent = "选择介入挂件";
  dom.cinematicOverlay.classList.remove("hidden");
  dom.cinematicVideo.classList.remove("hidden");
  dom.cinematicFrame.classList.add("hidden");
  dom.cinematicVideo.loop = true;
  dom.cinematicVideo.onended = null;
  dom.cinematicVideo.onerror = () => {
    addBattleLog("挂件选择视频加载失败，仍可继续选择挂件。", "system");
  };
  dom.cinematicVideo.src = skill.accessoryFlow.selectLoopVideo;
  dom.cinematicVideo.currentTime = 0;
  const playRequest = dom.cinematicVideo.play();
  if (playRequest) {
    playRequest.catch(() => {
      addBattleLog("挂件选择视频无法自动播放，仍可继续选择挂件。", "system");
    });
  }
}

function playSkillFrames(skill, onComplete) {
  const sequence = SKILL_FRAME_SEQUENCES[skill.frameSequence];
  if (!sequence) {
    playFallbackSkillMotion(skill, onComplete);
    return;
  }

  const { finish, serial } = beginSkillPresentation(skill, onComplete);
  const frameDuration = 1000 / sequence.fps;
  let frameIndex = 1;
  dom.cinematicVideo.classList.add("hidden");
  dom.cinematicFrame.classList.remove("hidden");
  dom.cinematicFrame.onerror = () => {
    addBattleLog(`${skill.name}帧动画加载失败，已直接进入结算。`, "system");
    finish();
  };

  const advance = () => {
    if (serial !== presentationSerial) return;
    if (frameIndex > sequence.frameCount) {
      finish();
      return;
    }
    dom.cinematicFrame.src = getFramePath(sequence, frameIndex);
    frameIndex += 1;
    activeFrameTimer = schedule(advance, frameDuration);
  };

  advance();
}

function playFallbackSkillMotion(skill, onComplete) {
  pulseBattlefield("player-attacking", PLAYER_ACTION_DURATION);
  schedule(onComplete, PLAYER_ACTION_DURATION);
}

function playSkillPresentation(skill, onComplete) {
  if (skill.cinematicVideo) {
    playSkillVideo(skill, onComplete);
  } else if (skill.frameSequence) {
    playSkillFrames(skill, onComplete);
  } else {
    playFallbackSkillMotion(skill, onComplete);
  }
}

function presentationModeForSkill(skill) {
  if (skill?.cinematicVideo || skill?.accessoryFlow) return "video";
  if (skill?.frameSequence) return "frames";
  return "fallback";
}

function skipSkillPresentation() {
  if (!activePresentationFinish) return false;
  activePresentationFinish();
  return true;
}

function applyBossDamage(damage, sourceName, { moveCombatants = true } = {}) {
  state.bossHp = Math.max(0, state.bossHp - damage);
  pulseBattlefield(moveCombatants ? "boss-hit" : "boss-impact", 430);
  showFloatNumber(damage, "boss");
  addBattleLog(`${sourceName}命中，熔岩石头人损失 ${damage} 点生命。`, "player");
  showBattleTip(`${sourceName}命中`, `对熔岩石头人造成 ${damage} 点伤害。`, "success");
  updateBattleUI();
}

function continueAfterPlayerAction(delay = 520) {
  schedule(() => {
    if (!state.inBattle) return;
    if (state.bossHp <= 0) {
      finishBattle(true);
      return;
    }
    startEnemyTurn();
  }, delay);
}

function settlePlayerSkill(skill, accessoryContext = {}) {
  if (!state.inBattle) return;
  setPhase("伤害结算", skill.name);
  const presentationMode = accessoryContext.presentationMode || presentationModeForSkill(skill);
  const moveCombatants = presentationMode === "fallback";
  if (moveCombatants) pulseBattlefield("player-attacking", 520);
  let damageMultiplier = accessoryContext.damageMultiplier || 1;
  if (skill.id === "bow_arm_pierce" && hasAccessory("quiver")) {
    damageMultiplier *= ACCESSORIES.quiver.pierceDamageMultiplier;
    addBattleLog("箭袋生效：穿臂箭获得强化破甲，简化版折算为伤害提高 20%。", "success");
    showBattleTip("箭袋·穿甲箭备装", "穿臂箭强化破甲，本次伤害提高 20%。", "accessory");
  }
  const finalDamage = Math.round(skill.damage * damageMultiplier);
  applyBossDamage(finalDamage, skill.name, { moveCombatants });

  settleAccessoryHits(accessoryContext.bonusHits || [], 0, () => resolveSkillCombo(skill));
}

function settleAccessoryHits(hits, index, onComplete) {
  if (!state.inBattle || state.bossHp <= 0 || index >= hits.length) {
    onComplete();
    return;
  }

  const hit = hits[index];
  schedule(() => {
    if (!state.inBattle) return;
    applyBossDamage(hit.damage, hit.name);
    settleAccessoryHits(hits, index + 1, onComplete);
  }, 340);
}

function resolveSkillCombo(skill) {
  if (!state.inBattle) return;

  if (state.bossHp <= 0) {
    continueAfterPlayerAction(420);
    return;
  }

  if (!skill.comboChance || Math.random() >= skill.comboChance) {
    if (skill.comboChance) addBattleLog(`${skill.name}本次未触发连击。`, "system");
    continueAfterPlayerAction();
    return;
  }

  addBattleLog(`连击触发，追加一次普通攻击。`, "success");
  showBattleTip("连击触发", `追加一次普通攻击，造成 ${skill.comboDamage} 点伤害。`, "success");
  schedule(() => pulseBattlefield("player-attacking", 620), 360);
  schedule(() => {
    if (!state.inBattle) return;
    applyBossDamage(skill.comboDamage, `${skill.name}·连击`);
  }, 610);
  continueAfterPlayerAction(1080);
}

function startEnemyTurn() {
  if (!state.inBattle) return;
  state.phase = "enemy-prepare";
  state.activeEnemyAttack = ENEMY_ATTACKS[state.enemyAttackIndex % ENEMY_ATTACKS.length];
  state.enemyAttackIndex += 1;
  const attack = state.activeEnemyAttack;

  dom.battlefield.classList.add("enemy-turn");
  dom.enemyCue.textContent = attack.cue;
  dom.enemyAttackName.textContent = attack.name;
  dom.enemyHint.textContent = attack.hint;
  setPhase("怪物行动", `${attack.name}准备`);
  addBattleLog(`熔岩石头人发动${attack.name}，先播放攻击准备。`, "enemy");
  showBattleTip(`怪物发动${attack.name}`, "观察攻击准备，等待即时防御窗口。", "enemy", 2300);
  updateBattleUI();
  playSkillVideo(
    { name: `${attack.name}·准备`, cinematicVideo: attack.prepareVideo },
    openReactionWindow
  );
}

function openReactionWindow() {
  if (!state.inBattle || state.phase !== "enemy-prepare") return;

  state.phase = "reaction";
  setPhase("即时防御", "W 格挡");
  addBattleLog("攻击准备播放完毕，0.5 秒格挡窗口开启。", "enemy");
  showBattleTip("格挡窗口开启", "在 0.5 秒内按 W 格挡。", "enemy", 900);
  showEnemyReactionClip(state.activeEnemyAttack);
  dom.qteTitle.textContent = "格挡时机";
  dom.qteCopy.textContent = state.activeEnemyAttack.hint;
  dom.qteGauge.style.transition = "none";
  dom.qteGauge.style.width = "100%";
  dom.defenseControls.classList.remove("hidden");
  dom.qteOverlay.classList.remove("hidden");
  window.requestAnimationFrame(() => {
    dom.qteGauge.style.transition = `width ${REACTION_WINDOW_DURATION}ms linear`;
    dom.qteGauge.style.width = "0%";
  });
  updateBattleUI();
  reactionTimer = schedule(() => resolveDefense(null), REACTION_WINDOW_DURATION);
}

function showEnemyReactionClip(attack) {
  cancelSkillPresentation();
  presentationSerial += 1;
  dom.cinematicKicker.textContent = "怪物攻击";
  dom.cinematicTitle.textContent = attack.name;
  dom.cinematicOverlay.classList.remove("hidden");
  dom.cinematicVideo.classList.remove("hidden");
  dom.cinematicFrame.classList.add("hidden");
  dom.cinematicVideo.loop = false;
  dom.cinematicVideo.src = attack.loadingVideo;
  dom.cinematicVideo.currentTime = 0;
  dom.cinematicVideo.onended = () => {
    if (state.phase === "reaction") resolveDefense(null);
  };
  dom.cinematicVideo.onerror = () => {
    if (state.phase === "reaction") resolveDefense(null);
  };
  activePresentationFinish = () => {
    if (state.phase === "reaction") resolveDefense(null);
  };
  const playRequest = dom.cinematicVideo.play();
  if (playRequest) playRequest.catch(() => resolveDefense(null));
}

function resolveGreatswordStance() {
  if (!state.inBattle || state.phase !== "enemy-windup") return;
  const attack = state.activeEnemyAttack;
  const stance = findSkill("gs_guard_stance");
  const countered = Boolean(stance && Math.random() < stance.counterChance);
  state.greatswordStanceActive = false;
  state.phase = "enemy-action";
  dom.defenseControls.classList.add("hidden");
  dom.enemyWarning.classList.add("hidden");
  dom.battlefield.classList.remove("enemy-turn");
  setPhase("弹反判定", attack.name);
  pulseBattlefield("enemy-attacking", ENEMY_ACTION_DURATION);

  if (countered) {
    pulseBattlefield("player-blocking", 560);
    addBattleLog(`防御姿态生效，成功弹反${attack.name}。`, "success");
    schedule(() => {
      if (!state.inBattle) return;
      showFloatNumber("弹反", "player", "success");
      applyBossDamage(stance.counterDamage, "大剑弹反");
    }, 250);
  } else {
    pulseBattlefield("player-hit", 560);
    addBattleLog(`防御姿态未能弹反${attack.name}。`, "enemy");
    schedule(() => {
      if (!state.inBattle) return;
      state.playerHp = Math.max(0, state.playerHp - attack.damage);
      showFloatNumber(attack.damage, "player", "player-damage");
      addBattleLog(`受到${attack.name}，损失 ${attack.damage} 点生命。`, "enemy");
      updateBattleUI();
    }, 250);
  }

  schedule(() => {
    if (!state.inBattle) return;
    if (state.bossHp <= 0) {
      finishBattle(true);
      return;
    }
    if (state.playerHp <= 0) {
      finishBattle(false);
      return;
    }
    state.round += 1;
    startPlayerTurn(false);
  }, ENEMY_ACTION_DURATION);
}

function chooseDefense(choice) {
  if (!state.inBattle || state.phase !== "reaction") return;
  cancelTimer(reactionTimer);
  reactionTimer = null;
  resolveDefense(choice);
}

function resolveDefense(choice) {
  if (!state.inBattle || state.phase !== "reaction") return;
  cancelTimer(reactionTimer);
  reactionTimer = null;
  const attack = state.activeEnemyAttack;
  const success = Boolean(choice && attack.validResponses.includes(choice));
  let outcome = "防御失败";

  if (success && choice === "block") {
    outcome = "格挡成功";
  } else if (success) {
    outcome = `${DEFENSE_NAMES[choice]}成功`;
  } else if (choice) {
    outcome = `${DEFENSE_NAMES[choice]}判断错误`;
  } else {
    outcome = "未及时防御";
  }

  state.phase = "enemy-result";
  cancelSkillPresentation();
  dom.battlefield.classList.remove("enemy-turn");
  setPhase(success ? "格挡成功" : "格挡失败", outcome);
  addBattleLog(`${outcome}，播放对应结果表现。`, success ? "success" : "enemy");
  showBattleTip(outcome, success ? "防御判断成功，开始播放反击结果。" : "防御判断失败，即将承受伤害。", success ? "success" : "enemy");
  const counterAccessory = success && choice === "block" ? getCounterAccessory() : null;
  if (counterAccessory) {
    addBattleLog(`${counterAccessory.name}介入：十字斩接管格挡成功表现。`, "success");
    showBattleTip(`${counterAccessory.name}介入`, `${counterAccessory.role}接管普通格挡成功表现。`, "accessory", 2300);
  }
  playSkillVideo(
    {
      name: counterAccessory ? counterAccessory.role : `${attack.name}·${outcome}`,
      cinematicVideo: counterAccessory?.counterVideo || (success ? attack.successVideo : attack.failVideo),
    },
    () => finishEnemyDefenseResult({ attack, success, choice, outcome, counterAccessory })
  );
}

function finishEnemyDefenseResult({ attack, success, choice, counterAccessory }) {
  if (!state.inBattle) return;

  if (success && choice === "block") {
    pulseBattlefield("player-blocking", 560);
    showFloatNumber("格挡", "player", "success");
    if (state.greatswordStanceActive) {
      const stance = findSkill("gs_guard_stance");
      state.greatswordStanceActive = false;
      const counterMultiplier = getCounterChainMultiplier();
      const counterDamage = Math.round((stance?.counterDamage || 32) * counterMultiplier);
      applyBossDamage(counterDamage, "大剑弹反", { moveCombatants: false });
      addBattleLog(`蓄势生效，格挡后反击造成 ${counterDamage} 点伤害。`, "success");
    } else {
      const counterDamage = Math.round(6 * getCounterChainMultiplier());
      applyBossDamage(counterDamage, "格挡反击", { moveCombatants: false });
      addBattleLog("格挡成功，化解伤害并造成少量反击。", "success");
    }
    if (counterAccessory) {
      const counterMultiplier = getCounterChainMultiplier();
      const followUpDamage = Math.round((counterAccessory.counterDamage || 24) * counterMultiplier);
      applyBossDamage(followUpDamage, counterAccessory.role, { moveCombatants: false });
      addBattleLog(`${counterAccessory.name}触发，追加${counterAccessory.role}，造成 ${followUpDamage} 点伤害。`, "success");
    }
    if (getCounterChainMultiplier() > 1) {
      addBattleLog("尖刺肩甲生效：基础反击与追加攻击伤害提高 10%。", "success");
      showBattleTip("尖刺肩甲增幅", "整条反击链伤害提高 10%。", "accessory");
    }
  } else if (success) {
    pulseBattlefield(choice === "left" ? "player-dodge-left" : "player-dodge-right", 560);
    showFloatNumber("闪避", "player", "success");
    addBattleLog(`完全避开${attack.name}，未受到伤害。`, "success");
  } else {
    state.greatswordStanceActive = false;
    pulseBattlefield("player-hit", 560);
    dom.battleShell.classList.remove("player-hit-flash");
    void dom.battleShell.offsetWidth;
    dom.battleShell.classList.add("player-hit-flash");
    schedule(() => dom.battleShell.classList.remove("player-hit-flash"), 430);
    state.playerHp = Math.max(0, state.playerHp - attack.damage);
    showFloatNumber(attack.damage, "player", "player-damage");
    addBattleLog(`受到${attack.name}，损失 ${attack.damage} 点生命。`, "enemy");
    showBattleTip(`受到${attack.name}`, `损失 ${attack.damage} 点生命。`, "enemy");
  }

  updateBattleUI();
  const defenseResultDelay = counterAccessory ? 1300 : 700;
  schedule(() => {
    if (!state.inBattle) return;
    if (state.bossHp <= 0) {
      finishBattle(true);
      return;
    }
    if (state.playerHp <= 0) {
      finishBattle(false);
      return;
    }
    state.round += 1;
    startPlayerTurn(false);
  }, defenseResultDelay);
}

function hideEnemyPrompt() {
  dom.enemyWarning.classList.add("hidden");
  dom.defenseControls.classList.remove("hidden");
  dom.qteOverlay.classList.add("hidden");
  dom.warningMeter.style.transition = "none";
  dom.warningMeter.style.width = "100%";
}

function showFloatNumber(value, target, className = "") {
  const number = document.createElement("span");
  number.className = `float-number ${className}`.trim();
  number.textContent = typeof value === "number" ? `-${value}` : value;
  number.style.left = target === "boss" ? "72%" : "23%";
  number.style.top = target === "boss" ? "31%" : "49%";
  dom.floatingLayer.append(number);
  schedule(() => number.remove(), 920);
}

function addBattleLog(message, type = "system") {
  const item = document.createElement("li");
  item.className = type;
  item.innerHTML = `<small>R${state.round}</small><span>${message}</span>`;
  dom.battleLog.prepend(item);

  while (dom.battleLog.children.length > 10) {
    dom.battleLog.lastElementChild.remove();
  }
}

function finishBattle(victory) {
  cancelSkillPresentation();
  state.phase = "finished";
  state.inBattle = false;
  hideEnemyPrompt();
  clearBattlefieldStates();
  setPhase(victory ? "挑战完成" : "挑战失败", victory ? "胜利" : "败北");
  updateBattleUI();
  dom.resultTitle.textContent = victory ? "战斗胜利" : "挑战失败";
  dom.resultCopy.textContent = victory
    ? `你用${getSelectedWeapon().name}击败了熔岩石头人。`
    : "防御判断失误过多，调整节奏后再次挑战。";
  dom.resultOverlay.classList.remove("hidden");
}

function handleKeyboard(event) {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "m" && skipSkillPresentation()) {
    event.preventDefault();
    return;
  }
  if (state.phase !== "reaction") return;
  const choice = { a: "left", w: "block", d: "right" }[key];
  if (!choice) return;
  event.preventDefault();
  chooseDefense(choice);
}

function preloadSkillFrames() {
  Object.values(SKILL_FRAME_SEQUENCES).forEach((sequence) => {
    for (let index = 1; index <= sequence.frameCount; index += 1) {
      const path = getFramePath(sequence, index);
      const image = new Image();
      image.src = path;
      preloadedFrames.set(path, image);
    }
  });
}

dom.goLoadoutButton.addEventListener("click", () => setPrebattlePage("loadout"));
dom.backToBossButton.addEventListener("click", () => setPrebattlePage("boss"));
dom.enterBattleButton.addEventListener("click", enterBattle);
dom.returnLoadoutButton.addEventListener("click", returnToLoadout);
dom.restartBattleButton.addEventListener("click", resetBattle);
dom.resultRestartButton.addEventListener("click", resetBattle);
dom.resultLoadoutButton.addEventListener("click", returnToLoadout);
dom.defenseControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-defense]");
  if (button) chooseDefense(button.dataset.defense);
});
document.addEventListener("keydown", handleKeyboard);

renderWeaponOptions();
renderSkillPreview();
renderAccessoryOptions();
setPrebattlePage("boss");
preloadSkillFrames();
window.requestAnimationFrame(runBattleRenderLoop);
