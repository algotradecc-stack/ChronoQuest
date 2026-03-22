// ============================================
// ChronoQuest — State Manager v1.3
// Separate XP pools: heroXP (hero rank) + classXP (class level)
// ============================================
const SM = (function () {

const STORAGE_KEY    = 'cq_player_v1';
const HEROES_KEY     = 'cq_heroes_v1';
const PLAYER_XP_KEY  = 'cq_xp_v1';
const VERSION = '1.0';

const CLASS_XP = [0, 50, 120, 210, 320, 450, 600, 770, 960, 1170, 1400];

function createDefaultState(heroIdx) {
  const hero = CQ.heroes[heroIdx];
  const firstClass = hero.basePath.split('→')[0].trim();
  return {
    meta: { version: VERSION, createdAt: new Date().toISOString(), lastSeen: new Date().toISOString() },
    hero: { heroId: heroIdx, name: hero.name, icon: hero.icon, badge: hero.badge, basePath: hero.basePath },
    character: {
      currentClass: firstClass,
      classLevel: 1,
      classXP: 0,
      unlockedClasses: { [firstClass]: 1 }
    },
    progress: {
      heroTasksDone: [],
      classTasksDone: [],
      lastReset: new Date().toISOString().slice(0, 10)
    }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.meta.version !== VERSION) return null;
    if (!state.character.classXP) state.character.classXP = 0;
    if (!state.progress.heroTasksDone) state.progress.heroTasksDone = state.progress.dailyTasksDone || [];
    if (!state.progress.classTasksDone) state.progress.classTasksDone = [];
    if (!state.progress.lastReset) state.progress.lastReset = new Date().toISOString().slice(0, 10);
    state.xp = _loadPlayerXP();
    return state;
  } catch (e) { console.warn('[SM] load error:', e); return null; }
}

function loadDefault() {
  return fetch('default_save.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(state => {
      state.meta.createdAt = new Date().toISOString();
      state.meta.lastSeen  = new Date().toISOString();
      state.progress.lastReset = new Date().toISOString().slice(0, 10);
      if (!state.character.classXP) state.character.classXP = 0;
      if (!state.progress.heroTasksDone) state.progress.heroTasksDone = [];
      if (!state.progress.classTasksDone) state.progress.classTasksDone = [];
      save(state); return state;
    })
    .catch(() => startNewGame(0));
}

function save(state) {
  try { state.meta.lastSeen = new Date().toISOString(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('[SM] save error:', e); }
}

function startNewGame(heroIdx) {
  const state = createDefaultState(heroIdx);
  state.xp = _loadPlayerXP();
  save(state); return state;
}

// ── Shared Player XP ──────────────────────────────────────────────────────────
function _loadPlayerXP() {
  try {
    const raw = localStorage.getItem(PLAYER_XP_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { total: 0, level: 1, title: '冒險者' };
}
function _savePlayerXP(xp) {
  try { localStorage.setItem(PLAYER_XP_KEY, JSON.stringify(xp)); }
  catch(e) { console.warn('[SM] xp save error:', e); }
}

function addHeroXP(state, amount) {
  const xp = _loadPlayerXP();
  xp.total += amount;
  const levels = CQ.xpLevels;
  let newLevel = 1;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp.total >= levels[i].xpReq) { newLevel = levels[i].level; break; }
  }
  const leveledUp = newLevel > xp.level;
  xp.level = newLevel;
  xp.title = levels[newLevel - 1].title;
  _savePlayerXP(xp);
  state.xp = xp;
  save(state);
  return { state, leveledUp };
}

function getHeroXPProgress(state) {
  const xp = state.xp || _loadPlayerXP();
  const levels = CQ.xpLevels;
  const cur = xp.level;
  const curReq  = levels[cur - 1].xpReq;
  const nextReq = cur < levels.length ? levels[cur].xpReq : null;
  if (!nextReq) return { pct: 100, current: xp.total, next: null };
  const pct = Math.min(100, Math.round(((xp.total - curReq) / (nextReq - curReq)) * 100));
  return { pct, current: xp.total, next: nextReq };
}

// ── Class XP pool ─────────────────────────────────────────────────────────────
function addClassXP(state, amount) {
  state.character.classXP = (state.character.classXP || 0) + amount;
  const thresholds = CLASS_XP;
  const maxLevel = thresholds.length - 1;
  let newLevel = state.character.classLevel;
  while (newLevel < maxLevel && state.character.classXP >= thresholds[newLevel + 1]) {
    newLevel++;
  }
  const leveledUp = newLevel > state.character.classLevel;
  if (leveledUp) {
    state.character.classLevel = newLevel;
    state.character.unlockedClasses[state.character.currentClass] = newLevel;
  }
  save(state);
  return { state, leveledUp, newClassLevel: state.character.classLevel };
}

function getClassXPProgress(state) {
  const thresholds = CLASS_XP;
  const cur = state.character.classLevel;
  const max = thresholds.length - 1;
  const curReq  = thresholds[cur] || 0;
  const nextReq = cur < max ? thresholds[cur + 1] : null;
  const xp = state.character.classXP || 0;
  if (!nextReq) return { pct: 100, current: xp, next: null };
  const pct = Math.min(100, Math.round(((xp - curReq) / (nextReq - curReq)) * 100));
  return { pct, current: xp, next: nextReq };
}

// ── Task pool auto-reset ───────────────────────────────────────────────────────
function _resetPoolIfAllDone(state, pool, tasks) {
  const allDone = tasks.every(t => state.progress[pool].includes(t.id));
  if (allDone) {
    state.progress[pool] = [];
    save(state);
    return true;
  }
  return false;
}

// ── Hero tasks ────────────────────────────────────────────────────────────────
function completeHeroTask(state, taskId) {
  const task = CQ.heroTasks.find(t => t.id === taskId);
  if (!task) return { notFound: true };
  if (state.progress.heroTasksDone.includes(taskId)) return { alreadyDone: true };
  state.progress.heroTasksDone.push(taskId);
  const result = addHeroXP(state, task.xp);
  _resetPoolIfAllDone(state, 'heroTasksDone', CQ.heroTasks);
  return { ...result, task };
}

function getHeroTaskStatus(state) {
  return CQ.heroTasks.map(t => ({ ...t, done: state.progress.heroTasksDone.includes(t.id) }));
}

// ── Class tasks ───────────────────────────────────────────────────────────────
function completeClassTask(state, taskId) {
  const task = CQ.classTasks.find(t => t.id === taskId);
  if (!task) return { notFound: true };
  if (state.progress.classTasksDone.includes(taskId)) return { alreadyDone: true };
  state.progress.classTasksDone.push(taskId);
  const result = addClassXP(state, task.xp);
  _resetPoolIfAllDone(state, 'classTasksDone', CQ.classTasks);
  return { ...result, task };
}

function getClassTaskStatus(state) {
  return CQ.classTasks.map(t => ({ ...t, done: state.progress.classTasksDone.includes(t.id) }));
}

// ── Promotion logic ───────────────────────────────────────────────────────────
// FIX: corrected regex literals (\s and \d, not \\s and \\d)
function _parseReq(reqStr) {
  if (!reqStr || reqStr === '基礎職業') return [];
  return reqStr.split('+').map(s => s.trim()).map(part => {
    let m = part.match(/^(.+?)\s+Lv\.(\d+)$/);
    if (m) return { cls: m[1].trim(), lvl: parseInt(m[2]) };
    m = part.match(/^(.+?)(\d+)$/);
    if (m) return { cls: m[1].trim(), lvl: parseInt(m[2]) };
    return null;
  }).filter(Boolean);
}

function canPromote(state, targetClass) {
  const classEntry = CQ.classes.find(c => c.name === targetClass);
  if (!classEntry) return false;
  const tag = (classEntry.tag || '').trim();
  if (!tag || tag === '基礎職業') return false;
  const reqs = _parseReq(tag);
  if (reqs.length === 0) return false;

  const hero = CQ.heroes[state.hero.heroId];
  const heroGender = hero ? hero.gender : 'male';
  if (heroGender !== 'other'
      && classEntry.gender !== 'any'
      && classEntry.gender
      && classEntry.gender !== heroGender) {
    return false;
  }

  return reqs.every(({ cls, lvl }) => (state.character.unlockedClasses[cls] || 0) >= lvl);
}

function getAvailablePromotions(state) {
  if (!CQ.classes) return [];
  const unlocked = state.character.unlockedClasses;
  return CQ.classes
    .filter(c => {
      if (c.name === state.character.currentClass) return false;
      return canPromote(state, c.name) || (unlocked[c.name] && unlocked[c.name] > 0);
    })
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    .map(c => c.name);
}

function promote(state, targetClass) {
  const isResume = (state.character.unlockedClasses[targetClass] || 0) > 0;
  if (!isResume && !canPromote(state, targetClass)) return false;
  state.character.currentClass = targetClass;
  if (isResume) {
    const savedLevel = state.character.unlockedClasses[targetClass];
    state.character.classLevel = savedLevel;
    state.character.classXP   = CLASS_XP[savedLevel] || 0;
  } else {
    state.character.classLevel = 1;
    state.character.classXP   = 0;
    state.character.unlockedClasses[targetClass] = 1;
  }
  save(state); return true;
}

// ── Multi-hero slot management ───────────────────────────────────────────────
function _loadAllSlots() {
  try { return JSON.parse(localStorage.getItem(HEROES_KEY) || '{}'); }
  catch(e) { return {}; }
}
function _saveAllSlots(slots) {
  try { localStorage.setItem(HEROES_KEY, JSON.stringify(slots)); }
  catch(e) { console.warn('[SM] slot save error:', e); }
}

function saveToSlot(state) {
  const slots = _loadAllSlots();
  slots[state.hero.heroId] = state;
  _saveAllSlots(slots);
}

function getHeroSlot(heroId) {
  const slots = _loadAllSlots();
  return slots[heroId] || null;
}

function getAllHeroSlots() {
  const slots = _loadAllSlots();
  return CQ.heroes.map((hero, idx) => ({
    heroId:     idx,
    name:       hero.name,
    icon:       hero.icon,
    badge:      hero.badge,
    gender:     hero.gender,
    basePath:   hero.basePath,
    isActive:   false,
    savedState: slots[idx] || null,
  }));
}

function switchHero(currentState, targetHeroId) {
  if (currentState) saveToSlot(currentState);
  const existing = getHeroSlot(targetHeroId);
  let newState;
  if (existing) {
    newState = existing;
    newState.meta.lastSeen = new Date().toISOString();
  } else {
    newState = createDefaultState(targetHeroId);
  }
  newState.xp = _loadPlayerXP();
  save(newState);
  return newState;
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HEROES_KEY);
  localStorage.removeItem(PLAYER_XP_KEY);
}

return {
  load, loadDefault, save, reset: resetAll, startNewGame,
  addHeroXP, getHeroXPProgress,
  addClassXP, getClassXPProgress,
  completeHeroTask, getHeroTaskStatus,
  completeClassTask, getClassTaskStatus,
  canPromote, getAvailablePromotions, promote,
  saveToSlot, getHeroSlot, getAllHeroSlots, switchHero
};
})();