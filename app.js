// ============================================
// ChronoQuest — App v1.3
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof SM === 'undefined' || typeof CQ === 'undefined') {
    console.warn('SM or CQ not loaded'); return;
  }

  function showGame(state) {
    const s = document.getElementById('game-start-section');
    const m = document.getElementById('main-game-content');
    const h = document.getElementById('player-hud');
    if (s) s.style.display = 'none';
    if (m) m.style.display = 'block';
    if (h) h.classList.remove('hidden');
    updateHUD(state);
    updateStatus(state);
    renderClassTree();
    renderHeroesSection();
    renderPlayerDashboard();
  }

  function showHeroSelection() {
    const s = document.getElementById('game-start-section');
    const m = document.getElementById('main-game-content');
    const h = document.getElementById('player-hud');
    if (s) { s.style.display = 'block'; s.style.opacity = '1'; }
    if (m) m.style.display = 'none';
    if (h) h.classList.add('hidden');
    renderHeroSelection();
  }

  const resetBtn = document.getElementById('hud-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('確定要重新開始嗎？所有英雄的進度將全部清除。')) {
        SM.reset();
        showHeroSelection();
        renderClassTree();
        renderHeroesSection();
        renderPlayerDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const state = SM.load();
  if (state) { showGame(state); }
  else { SM.loadDefault().then(s => showGame(s)); }
});

// ============================================
// Hero Selection
// ============================================
function renderHeroSelection() {
  const grid = document.getElementById('hero-select-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CQ.heroes.forEach((hero, idx) => {
    const card = document.createElement('div');
    card.className = 'hero-card reveal visible';
    card.style.cssText = 'cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;padding:2rem 1rem;';
    card.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:0.5rem">${hero.icon}</div>
      <h3 style="margin:0 0 0.25rem">${hero.name}</h3>
      <span class="badge">${hero.badge}</span>
      <p style="font-size:0.85rem;margin-top:0.5rem;opacity:0.8">${hero.desc}</p>
      <div style="font-size:0.8rem;margin-top:0.5rem;opacity:0.6">${hero.basePath}</div>
    `;
    card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px)'; card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
    card.addEventListener('click', () => {
      const st = SM.startNewGame(idx);
      const s = document.getElementById('game-start-section');
      const m = document.getElementById('main-game-content');
      const h = document.getElementById('player-hud');
      if (s) s.style.display = 'none';
      if (m) m.style.display = 'block';
      if (h) h.classList.remove('hidden');
      updateHUD(st); updateStatus(st);
      renderClassTree();
      renderHeroesSection();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    grid.appendChild(card);
  });
}

// ============================================
// HUD
// ============================================
function updateHUD(state) {
  if (!state) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('hud-hero-name',     state.hero.name);
  set('hud-hero-icon',     state.hero.icon);
  set('hud-hero-badge',    state.hero.badge);
  set('hud-current-class', state.character.currentClass);
  set('hud-class-level',   `Lv.${state.character.classLevel}`);
  set('hud-xp-level',      `Lv.${state.xp.level}`);
  set('hud-xp-title',      state.xp.title);
  set('hud-level',         `Lv.${state.xp.level} ${state.xp.title}`);
  set('hud-xp-label',      `${state.xp.total} XP`);
  const hudClass = document.getElementById('hud-class');
  if (hudClass) hudClass.textContent = `${state.character.currentClass} Lv.${state.character.classLevel}`;
  const prog = SM.getHeroXPProgress(state);
  const xpBar  = document.getElementById('hud-xp-bar');
  const xpText = document.getElementById('hud-xp-text');
  if (xpBar)  xpBar.style.width = `${prog.pct}%`;
  if (xpText) xpText.textContent = prog.next ? `${prog.current} / ${prog.next} XP` : `${prog.current} XP (MAX)`;

  // Inject 轉換英雄 button into HUD if not already there
  if (!document.getElementById('hud-switch-btn')) {
    const resetBtn = document.getElementById('hud-reset-btn');
    if (resetBtn) {
      const switchBtn = document.createElement('button');
      switchBtn.id = 'hud-switch-btn';
      switchBtn.textContent = '轉換英雄';
      switchBtn.style.cssText = 'background:none;border:1px solid var(--color-primary);color:var(--color-primary);padding:0.3rem 0.6rem;cursor:pointer;font-size:0.8rem;margin-right:0.5rem;border-radius:3px';
      switchBtn.addEventListener('click', showHeroSwitchModal);
      resetBtn.parentNode.insertBefore(switchBtn, resetBtn);
    }
  }
}

// ============================================
// Status Section
// ============================================
function updateStatus(state) {
  if (!state) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('status-hero-icon',  state.hero.icon);
  set('status-hero-name',  state.hero.name);
  set('status-hero-badge', state.hero.badge);
  const heroData = CQ.heroes[state.hero.heroId];
  if (heroData) set('status-hero-desc', heroData.desc);

  const classData = CQ.classes ? CQ.classes.find(c => c.name === state.character.currentClass) : null;
  set('status-class-name',  state.character.currentClass);
  set('status-class-level', state.character.classLevel);
  if (classData) {
    set('status-class-weapon', classData.weapon || '');
    set('status-class-desc',   classData.desc   || '');
    set('status-class-tag',    classData.tag    || '');
  }

  // Class image
  const img = document.getElementById('status-class-image');
  const placeholder = document.getElementById('status-image-placeholder');
  if (img) {
    img.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    img.src = 'images/' + state.character.currentClass + '.jpg';
    img.alt = state.character.currentClass;
    img.onerror = function() {
      img.style.display = 'none';
      if (placeholder) {
        placeholder.style.cssText = 'display:flex;font-size:5rem;align-items:center;justify-content:center;';
        placeholder.textContent = (classData && classData.icon) ? classData.icon : state.hero.icon;
      }
    };
  }

  set('status-hero-path', state.hero.basePath);

  // ── Hero XP bar ──
  const heroLevelTitle = document.getElementById('xp-level-title');
  if (heroLevelTitle) heroLevelTitle.textContent = `Lv.${state.xp.level} ${state.xp.title}`;
  const heroLevelIcon = document.getElementById('xp-level-icon');
  if (heroLevelIcon) {
    const ld = CQ.xpLevels.find(l => l.level === state.xp.level);
    if (ld) heroLevelIcon.textContent = ld.icon;
  }
  const heroProg = SM.getHeroXPProgress(state);
  const heroBarFill = document.getElementById('xp-bar-fill');
  const heroBarText = document.getElementById('xp-bar-text');
  if (heroBarFill) heroBarFill.style.width = `${heroProg.pct}%`;
  if (heroBarText) heroBarText.textContent = heroProg.next
    ? `${heroProg.current} / ${heroProg.next} XP` : `${heroProg.current} XP (MAX)`;

  // ── Class XP bar ──
  const classProg = SM.getClassXPProgress(state);
  const classLevelTitle = document.getElementById('class-level-title');
  if (classLevelTitle) classLevelTitle.textContent = `${state.character.currentClass} Lv.${state.character.classLevel}`;
  const classBarFill = document.getElementById('class-bar-fill');
  const classBarText = document.getElementById('class-bar-text');
  if (classBarFill) classBarFill.style.width = `${classProg.pct}%`;
  if (classBarText) classBarText.textContent = classProg.next
    ? `${classProg.current} / ${classProg.next} Class XP` : `${classProg.current} Class XP (MAX)`;

  renderHeroTasks(state);
  renderClassTasks(state);
}

// ============================================
// Task renderer (shared)
// ============================================
function _renderTasks(state, containerId, tasks, onClickFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = 'xp-quest-item';
    item.style.cssText = `
      display:flex;align-items:center;gap:1rem;
      padding:0.75rem 1rem;margin-bottom:0.5rem;
      background:var(--color-surface);
      border:1px solid ${task.done ? 'var(--color-primary)' : 'var(--color-border)'};
      border-radius:4px;cursor:${task.done ? 'default' : 'pointer'};
      opacity:${task.done ? '0.55' : '1'};
      transition:border-color 0.2s,transform 0.1s,opacity 0.2s;
    `;
    item.innerHTML = `
      <span style="font-size:1.4rem">${task.icon}</span>
      <span style="flex:1;font-size:0.9rem">${task.name}</span>
      <span style="font-size:0.8rem;color:var(--color-gold)">+${task.xp} XP</span>
      <span style="font-size:1rem">${task.done ? '✅' : '⬜'}</span>
    `;
    if (!task.done) {
      item.addEventListener('click', () => {
        item.style.transform = 'scale(1.03)';
        setTimeout(() => { item.style.transform = ''; }, 150);
        onClickFn(task.id);
      });
    }
    container.appendChild(item);
  });
}

function renderHeroTasks(state) {
  const tasks = SM.getHeroTaskStatus(state);
  _renderTasks(state, 'hero-tasks', tasks, (taskId) => {
    const st = SM.load(); if (!st) return;
    const result = SM.completeHeroTask(st, taskId);
    if (result.leveledUp) {
      const flash = document.getElementById('xp-levelup-flash');
      if (flash) { flash.style.display = 'block'; setTimeout(() => flash.style.display = 'none', 2000); }
    }
    updateHUD(st); updateStatus(st);
  });
}

function renderClassTasks(state) {
  const tasks = SM.getClassTaskStatus(state);
  _renderTasks(state, 'class-tasks', tasks, (taskId) => {
    const st = SM.load(); if (!st) return;
    const result = SM.completeClassTask(st, taskId);
    if (result.leveledUp) {
      showClassLevelUpModal(st, result.newClassLevel);
    }
    updateHUD(st); updateStatus(st);
  });
}

// ============================================
// Class Level-Up / Promotion Modal
// ============================================
function showClassLevelUpModal(state, newClassLevel) {
  // Remove any existing modal
  const existing = document.getElementById('class-levelup-overlay');
  if (existing) existing.remove();

  const available = SM.getAvailablePromotions(state);
  const currentClass = state.character.currentClass;
  const classData = CQ.classes ? CQ.classes.find(c => c.name === currentClass) : null;
  const classIcon = classData ? classData.icon : '⚔';

  const overlay = document.createElement('div');
  overlay.id = 'class-levelup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';

  // ── Option: Stay ──
  let optionsHTML = `
    <div class="promo-opt" data-choice="stay" style="border:1px solid var(--color-border);border-radius:6px;padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left;">
      <span style="font-size:1.4rem">${classIcon}</span>
      <strong style="margin-left:0.5rem">${currentClass}</strong>
      <span style="font-size:0.8rem;color:var(--color-primary);margin-left:0.5rem">Lv.${newClassLevel} ✔ 繼續深化</span>
      <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.3rem 0 0">留在現有職業，穩紮穩打地提升等級。</p>
    </div>
  `;

  // ── Options: eligible promotions ──
  if (available.length > 0) {
    available.forEach(cls => {
      const cd = CQ.classes ? CQ.classes.find(c => c.name === cls) : null;
      const icon = cd ? cd.icon : '✨';
      const desc = cd ? cd.desc : '';
      const tag  = cd ? cd.tag  : '';
      optionsHTML += `
        <div class="promo-opt" data-choice="${cls}" style="border:1px solid var(--color-border);border-radius:6px;padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left;">
          <span style="font-size:1.4rem">${icon}</span>
          <strong style="margin-left:0.5rem">${cls}</strong>
          <span style="font-size:0.75rem;color:var(--color-gold);margin-left:0.5rem">${tag}</span>
          <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.3rem 0 0">${desc}</p>
        </div>
      `;
    });
  } else {
    optionsHTML += `<p style="font-size:0.85rem;color:var(--color-text-muted);text-align:center;margin-top:0.5rem">尚未達到任何轉職條件，繼續累積等級！</p>`;
  }

  overlay.innerHTML = `
    <div style="background:var(--color-surface);border:2px solid var(--color-primary);border-radius:8px;padding:2rem;max-width:460px;width:100%;font-family:var(--font-body);">
      <div style="text-align:center;margin-bottom:1.25rem">
        <div style="font-size:2.5rem">🎉</div>
        <h2 style="font-family:var(--font-display);color:var(--color-primary);margin:0.25rem 0">職業等級提升！</h2>
        <p style="color:var(--color-text-muted);font-size:0.88rem;margin:0">選擇留在目前職業，或轉換至已解鎖的新職業。</p>
      </div>
      <div id="promo-options">${optionsHTML}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelectorAll('.promo-opt').forEach(opt => {
    opt.addEventListener('mouseenter', () => { opt.style.borderColor = 'var(--color-primary)'; opt.style.background = 'rgba(255,255,255,0.05)'; });
    opt.addEventListener('mouseleave', () => { opt.style.borderColor = 'var(--color-border)'; opt.style.background = ''; });
    opt.addEventListener('click', () => {
      const choice = opt.dataset.choice;
      const fresh = SM.load(); if (!fresh) return;
      if (choice !== 'stay') SM.promote(fresh, choice);
      overlay.remove();
      updateHUD(fresh); updateStatus(fresh);
    });
  });
}

// ============================================
// Class Tree — fully dynamic, replaces static HTML
// ============================================
function renderClassTree() {
  const container = document.getElementById('class-tree-container');
  if (!container || !CQ.classes) return;

  const state    = SM.load();
  const unlocked = state ? state.character.unlockedClasses : {};
  const current  = state ? state.character.currentClass   : null;

  // Safely resolve hero gender — fallback chain: heroId → hero.gender → 'male'
  let heroGender = 'male';
  let heroIdx    = -1;
  if (state && state.hero) {
    heroIdx = typeof state.hero.heroId === 'number' ? state.hero.heroId : -1;
    const hero = heroIdx >= 0 ? CQ.heroes[heroIdx] : null;
    if (hero && hero.gender) heroGender = hero.gender;
  }

  // Hidden classes belonging to THIS hero only
  const heroHiddenNames = new Set();
  if (heroIdx >= 0 && CQ.heroes[heroIdx]) {
    (CQ.heroes[heroIdx].hidden || []).forEach(h => heroHiddenNames.add(h.name));
  }

  const groups = [
    {
      label:  '⚔ 物理系',
      filter: c => c.branch === 'physical' && !c.hidden
                   && (heroGender === 'other' || c.gender === heroGender || c.gender === 'any')
    },
    {
      label:  '✨ 魔法系',
      filter: c => c.branch === 'magic' && !c.hidden
                   && (heroGender === 'other' || c.gender === heroGender || c.gender === 'any')
    },
    {
      label:  '🌟 隱藏職業',
      filter: c => (c.hidden === true || c.branch === 'hidden') && heroHiddenNames.has(c.name)
    },
  ];

  container.innerHTML = '';

  groups.forEach(group => {
    const classes = CQ.classes.filter(group.filter);
    if (!classes.length) return;

    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:2rem';
    section.innerHTML = `<h4 style="font-family:var(--font-display);color:var(--color-primary);margin-bottom:0.75rem;font-size:1rem">${group.label}</h4>`;

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.6rem';

    classes.forEach(cls => {
      const lvl    = unlocked[cls.name] || 0;
      const isCur  = cls.name === current;
      const canPro = state ? SM.canPromote(state, cls.name) : false;
      const isBase = (cls.tag || '') === '基礎職業';

      let borderColor = 'var(--color-border)';
      let bgColor     = 'transparent';
      let badge       = '';
      if (isCur)       { borderColor = 'var(--color-primary)'; bgColor = 'rgba(100,180,255,0.12)'; badge = '▶'; }
      else if (lvl)    { borderColor = 'var(--color-gold)';    badge = `Lv.${lvl}`; }
      else if (canPro) { borderColor = '#4caf50';              badge = '✅'; }
      else if (isBase) { badge = '基礎'; }
      else             { badge = '🔒'; }

      const node = document.createElement('div');
      node.dataset.class = cls.name;
      node.style.cssText = `
        display:inline-flex;flex-direction:column;align-items:center;
        padding:0.5rem 0.75rem;border:1px solid ${borderColor};
        border-radius:6px;background:${bgColor};cursor:pointer;
        transition:transform 0.15s,border-color 0.2s;min-width:72px;
        font-family:var(--font-body);
      `;
      node.innerHTML = `
        <span style="font-size:1.3rem">${cls.icon}</span>
        <span style="font-size:0.78rem;font-weight:600;margin-top:0.2rem;text-align:center">${cls.name}</span>
        <span style="font-size:0.68rem;color:var(--color-text-muted);margin-top:0.1rem">${badge}</span>
      `;
      node.addEventListener('mouseenter', () => node.style.transform = 'translateY(-2px)');
      node.addEventListener('mouseleave', () => node.style.transform = '');
      node.addEventListener('click', e => {
        e.stopPropagation();
        showClassInfoPopup(cls.name, SM.load(), node);
      });
      grid.appendChild(node);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}


// ============================================
// Class Info Popup (on tree node click)
// ============================================
function showClassInfoPopup(className, state, anchorEl) {
  document.querySelectorAll('.class-info-popup').forEach(p => p.remove());

  const classData = CQ.classes.find(c => c.name === className);
  if (!classData) return;

  const unlocked    = state ? (state.character.unlockedClasses[className] || 0) : 0;
  const isCurrent   = state ? state.character.currentClass === className : false;
  const canChange   = state ? SM.canPromote(state, className) : false;
  const tag         = classData.tag || '基礎職業';
  const isBase      = tag === '基礎職業';

  let statusLabel = '', statusColor = 'var(--color-text-muted)';
  if (isCurrent)       { statusLabel = '▶ 目前職業';       statusColor = 'var(--color-primary)'; }
  else if (unlocked)   { statusLabel = `已解鎖 Lv.${unlocked}`; statusColor = 'var(--color-gold)'; }
  else if (canChange)  { statusLabel = '✅ 可立即轉職';     statusColor = '#4caf50'; }
  else if (isBase)     { statusLabel = '基礎職業';          statusColor = 'var(--color-text-muted)'; }
  else                 { statusLabel = `🔒 需要：${tag}`;   statusColor = '#e57373'; }

  const popup = document.createElement('div');
  popup.className = 'class-info-popup';
  popup.style.cssText = `
    position:fixed;z-index:8888;
    background:var(--color-surface);
    border:2px solid var(--color-primary);
    border-radius:8px;padding:1.25rem 1.5rem;
    max-width:300px;min-width:230px;
    box-shadow:0 8px 32px rgba(0,0,0,0.55);
    font-family:var(--font-body);font-size:0.88rem;
  `;

  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem">
      <span style="font-size:2rem">${classData.icon}</span>
      <div>
        <div style="font-weight:700;font-size:1rem">${classData.name}</div>
        <div style="font-size:0.78rem;color:${statusColor}">${statusLabel}</div>
      </div>
    </div>
    <div style="color:var(--color-gold);font-size:0.8rem;margin-bottom:0.4rem">${classData.weapon || ''}</div>
    <div style="line-height:1.6;margin-bottom:0.75rem">${classData.desc || ''}</div>
    ${!isBase ? `<div style="font-size:0.76rem;color:var(--color-text-muted);border-top:1px solid var(--color-border);padding-top:0.5rem">轉職條件：${tag}</div>` : ''}
    ${canChange && !isCurrent ? `<button id="popup-promote-btn" style="
      margin-top:0.75rem;width:100%;padding:0.5rem;
      background:var(--color-primary);color:#000;border:none;
      border-radius:4px;cursor:pointer;font-weight:700;font-size:0.9rem;
    ">立即轉職 →</button>` : ''}
    <button id="popup-close-btn" style="
      margin-top:0.5rem;width:100%;padding:0.4rem;
      background:transparent;color:var(--color-text-muted);
      border:1px solid var(--color-border);border-radius:4px;
      cursor:pointer;font-size:0.82rem;
    ">關閉</button>
  `;

  // Position smartly near anchor
  const rect = anchorEl.getBoundingClientRect();
  let top  = rect.bottom + 8;
  let left = rect.left;
  if (top + 320 > window.innerHeight) top = rect.top - 320;
  if (left + 310 > window.innerWidth) left = window.innerWidth - 320;
  popup.style.top  = `${Math.max(8, top)}px`;
  popup.style.left = `${Math.max(8, left)}px`;
  document.body.appendChild(popup);

  popup.querySelector('#popup-close-btn').addEventListener('click', () => popup.remove());
  const promoteBtn = popup.querySelector('#popup-promote-btn');
  if (promoteBtn) {
    promoteBtn.addEventListener('click', () => {
      const fresh = SM.load(); if (!fresh) return;
      if (SM.promote(fresh, className)) {
        popup.remove();
        updateHUD(fresh); updateStatus(fresh);
        renderClassTree(); // refresh tree lock states
      }
    });
  }
  setTimeout(() => {
    document.addEventListener('click', function dismiss(e) {
      if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', dismiss); }
    });
  }, 50);
}

// ============================================
// Heroes Section — dynamic cards + detail modal
// ============================================
function renderHeroesSection() {
  const grid = document.getElementById('heroes-grid');
  if (!grid || !CQ.heroes) return;

  const state = SM.load();
  grid.innerHTML = '';

  CQ.heroes.forEach((hero, idx) => {
    const isActive = state && state.hero.heroId === idx;
    const card = document.createElement('div');
    card.className = 'hero-card reveal visible';
    card.style.cssText = `
      cursor:pointer;padding:1.25rem 1rem;text-align:center;
      border:2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'};
      border-radius:8px;transition:transform 0.2s,border-color 0.2s;
      background:${isActive ? 'rgba(var(--color-primary-rgb,100,180,255),0.08)' : 'transparent'};
    `;
    card.innerHTML = `
      <div style="font-size:2.2rem">${hero.icon}</div>
      <div style="font-weight:700;margin:0.4rem 0 0.2rem;font-family:var(--font-display)">${hero.name}</div>
      <span class="badge" style="font-size:0.72rem">${hero.badge}</span>
      ${isActive ? '<div style="font-size:0.7rem;color:var(--color-primary);margin-top:0.3rem">▶ 使用中</div>' : ''}
    `;
    card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-3px)'; });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    card.addEventListener('click', () => showHeroDetailModal(hero, idx, state));
    grid.appendChild(card);
  });
}

function showHeroDetailModal(hero, heroIdx, state) {
  document.querySelectorAll('.hero-detail-modal').forEach(m => m.remove());

  // Collect achieved classes: from active state OR saved slot for inactive heroes
  const isActiveHero = state && state.hero.heroId === heroIdx;
  let unlocked = {};
  if (isActiveHero) {
    unlocked = state.character.unlockedClasses;
  } else {
    const slot = SM.getHeroSlot(heroIdx);
    unlocked = slot ? slot.character.unlockedClasses : {};
  }
  const achievedClasses = Object.entries(unlocked).filter(([,lvl]) => lvl > 0);

  // Collect all classes reachable by this hero (basePath + hidden)
  const pathClasses = hero.basePath.split(/[→\/]/).map(s => s.trim()).filter(Boolean);
  const hiddenClasses = hero.hidden || [];

  // Stats bar helper
  const statBar = (label, val) => `
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;font-size:0.82rem">
      <span style="width:3rem;color:var(--color-text-muted)">${label}</span>
      <div style="flex:1;background:var(--color-border);border-radius:3px;height:6px">
        <div style="width:${val*10}%;height:100%;background:var(--color-primary);border-radius:3px"></div>
      </div>
      <span style="width:1.5rem;text-align:right">${val}</span>
    </div>`;

  const overlay = document.createElement('div');
  overlay.className = 'hero-detail-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;overflow-y:auto;';

  const achievedHTML = achievedClasses.length
    ? achievedClasses.map(([cls, lvl]) => {
        const cd = CQ.classes.find(c => c.name === cls);
        return `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.25rem 0.6rem;border:1px solid var(--color-gold);border-radius:4px;font-size:0.78rem;margin:0.2rem">
          ${cd ? cd.icon : '⚔'} ${cls} <span style="color:var(--color-gold)">Lv.${lvl}</span>
        </span>`;
      }).join('')
    : '<span style="color:var(--color-text-muted);font-size:0.82rem">尚未解鎖任何職業</span>';

  const hiddenHTML = hiddenClasses.map(h => `
    <div style="border:1px solid var(--color-border);border-radius:6px;padding:0.6rem 0.75rem;margin-bottom:0.5rem;font-size:0.82rem">
      <div style="font-weight:600;margin-bottom:0.2rem">🌟 ${h.name} ${h.rec ? '<span style="color:var(--color-gold);font-size:0.7rem">推薦</span>' : ''}</div>
      <div style="color:var(--color-text-muted);font-size:0.76rem;margin-bottom:0.2rem">條件：${h.req}</div>
      <div style="line-height:1.5">${h.desc}</div>
    </div>`).join('');

  const stats = hero.stats || {};
  overlay.innerHTML = `
    <div style="background:var(--color-surface);border:2px solid var(--color-primary);border-radius:10px;padding:2rem;max-width:520px;width:100%;font-family:var(--font-body);max-height:90vh;overflow-y:auto">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem">
        <span style="font-size:3rem">${hero.icon}</span>
        <div>
          <h2 style="font-family:var(--font-display);margin:0 0 0.2rem;color:var(--color-primary)">${hero.name}</h2>
          <span class="badge">${hero.badge}</span>
          <span style="font-size:0.75rem;color:var(--color-text-muted);margin-left:0.4rem">${
            hero.gender === 'male' ? '♂ 男性' : hero.gender === 'female' ? '♀ 女性' : '✦ 特殊'
          }</span>
          ${isActiveHero ? '<span style="font-size:0.75rem;color:var(--color-primary);margin-left:0.5rem">▶ 使用中</span>' : ''}
        </div>
      </div>

      <p style="line-height:1.7;margin-bottom:1rem">${hero.desc}</p>

      <div style="margin-bottom:1rem">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.5rem">基本轉職路線</div>
        <div style="font-weight:600;color:var(--color-gold)">${hero.basePath}</div>
      </div>

      ${Object.keys(stats).length ? `
      <div style="margin-bottom:1rem">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.5rem">能力值</div>
        ${statBar('STR', stats.STR||0)}
        ${statBar('INT', stats.INT||0)}
        ${statBar('AGI', stats.AGI||0)}
        ${statBar('WIS', stats.WIS||0)}
        ${statBar('CHA', stats.CHA||0)}
      </div>` : ''}

      <div style="margin-bottom:1rem">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.5rem">已達成職業</div>
        <div>${achievedHTML}</div>
      </div>

      ${hiddenHTML ? `
      <div style="margin-bottom:1rem">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.5rem">隱藏職業</div>
        ${hiddenHTML}
      </div>` : ''}

      <button id="hero-modal-close" style="
        width:100%;padding:0.6rem;margin-top:0.5rem;
        background:transparent;color:var(--color-text-muted);
        border:1px solid var(--color-border);border-radius:4px;
        cursor:pointer;font-size:0.88rem;
      ">關閉</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('#hero-modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ============================================
// Class Level-Up Modal — with magic branch option
// ============================================
function showClassLevelUpModal(state, newClassLevel) {
  document.querySelectorAll('#class-levelup-overlay').forEach(e => e.remove());

  const available   = SM.getAvailablePromotions(state);
  const currentClass = state.character.currentClass;
  const classData   = CQ.classes ? CQ.classes.find(c => c.name === currentClass) : null;
  const classIcon   = classData ? classData.icon : '⚔';

  // Find magic base classes for branch-switch option — filtered by hero gender
  const hero        = CQ.heroes[state.hero.heroId];
  const heroGender  = hero ? hero.gender : 'male';
  const magicBases  = CQ.classes.filter(c => c.tag === '基礎職業' && c.branch === 'magic'
                        && (heroGender === 'other' || c.gender === heroGender || c.gender === 'any'));
  const physBases   = CQ.classes.filter(c => c.tag === '基礎職業' && c.branch === 'physical'
                        && (heroGender === 'other' || c.gender === heroGender || c.gender === 'any'));
  const isPhysical  = classData && classData.branch === 'physical';
  const switchBases = isPhysical ? magicBases : physBases;

  let optionsHTML = `
    <div class="promo-opt" data-choice="stay" style="border:1px solid var(--color-border);border-radius:6px;padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left">
      <span style="font-size:1.4rem">${classIcon}</span>
      <strong style="margin-left:0.5rem">${currentClass}</strong>
      <span style="font-size:0.8rem;color:var(--color-primary);margin-left:0.5rem">Lv.${newClassLevel} ✔ 繼續深化</span>
      <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.3rem 0 0">留在現有職業，穩紮穩打提升等級。</p>
    </div>`;

  // Eligible promotions in same branch
  available.forEach(cls => {
    const cd      = CQ.classes.find(c => c.name === cls);
    const icon    = cd ? cd.icon : '✨';
    const isHid   = cd && (cd.hidden || cd.branch === 'hidden');
    const prevLvl = state.character.unlockedClasses[cls] || 0;
    const isResume = prevLvl > 0;
    const resumeBadge = isResume
      ? `<span style="font-size:0.72rem;background:var(--color-gold);color:#000;padding:0.1rem 0.4rem;border-radius:3px;margin-left:0.4rem">↩ 繼續 Lv.${prevLvl}</span>`
      : '';
    optionsHTML += `
      <div class="promo-opt" data-choice="${cls}" style="border:1px solid ${isResume ? 'var(--color-gold)' : 'var(--color-border)'};border-radius:6px;padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left">
        <span style="font-size:1.4rem">${icon}${isHid ? ' 🌟' : ''}</span>
        <strong style="margin-left:0.5rem">${cls}</strong>
        ${resumeBadge}
        <span style="font-size:0.75rem;color:var(--color-text-muted);margin-left:0.5rem">${cd ? cd.tag : ''}</span>
        <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.3rem 0 0">${isResume ? `將從 Lv.${prevLvl} 繼續成長。` : (cd ? cd.desc : '')}</p>
      </div>`;
  });

  // Branch-switch option (magic ↔ physical)
  if (switchBases.length) {
    optionsHTML += `<div style="font-size:0.78rem;color:var(--color-text-muted);margin:0.5rem 0 0.4rem;border-top:1px solid var(--color-border);padding-top:0.75rem">── 轉換系別 ──</div>`;
    switchBases.forEach(base => {
      optionsHTML += `
        <div class="promo-opt" data-choice="${base.name}" style="border:1px dashed var(--color-border);border-radius:6px;padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:border-color 0.2s,background 0.2s;text-align:left">
          <span style="font-size:1.4rem">${base.icon}</span>
          <strong style="margin-left:0.5rem">${base.name}</strong>
          <span style="font-size:0.75rem;color:var(--color-text-muted);margin-left:0.5rem">基礎職業・Lv.1 重新開始</span>
          <p style="font-size:0.82rem;color:var(--color-text-muted);margin:0.3rem 0 0">${base.desc}</p>
        </div>`;
    });
  }

  if (available.length === 0 && switchBases.length === 0) {
    optionsHTML += `<p style="font-size:0.84rem;color:var(--color-text-muted);text-align:center">尚未達到其他轉職條件，繼續累積等級！</p>`;
  }

  const overlay = document.createElement('div');
  overlay.id = 'class-levelup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;overflow-y:auto';
  overlay.innerHTML = `
    <div style="background:var(--color-surface);border:2px solid var(--color-primary);border-radius:8px;padding:2rem;max-width:480px;width:100%;font-family:var(--font-body);max-height:90vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:1.25rem">
        <div style="font-size:2.5rem">🎉</div>
        <h2 style="font-family:var(--font-display);color:var(--color-primary);margin:0.25rem 0">職業等級提升！</h2>
        <p style="color:var(--color-text-muted);font-size:0.88rem;margin:0">選擇留在目前職業，轉換職業，或改走不同系別。</p>
      </div>
      <div id="promo-options">${optionsHTML}</div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelectorAll('.promo-opt').forEach(opt => {
    opt.addEventListener('mouseenter', () => { opt.style.borderColor = 'var(--color-primary)'; opt.style.background = 'rgba(255,255,255,0.05)'; });
    opt.addEventListener('mouseleave', () => { opt.style.borderColor = opt.style.borderStyle === 'dashed' ? 'var(--color-border)' : 'var(--color-border)'; opt.style.background = ''; });
    opt.addEventListener('click', () => {
      const choice = opt.dataset.choice;
      const fresh  = SM.load(); if (!fresh) return;
      if (choice !== 'stay') {
        // For base class branch switch: force-promote even without canPromote
        const isBase = CQ.classes.find(c => c.name === choice && c.tag === '基礎職業');
        const hero2  = CQ.heroes[fresh.hero.heroId];
        const hGender = hero2 ? hero2.gender : 'male';
        const baseGenderOk = !isBase || isBase.gender === hGender || isBase.gender === 'any' || hGender === 'other';
        if (isBase && baseGenderOk) {
          fresh.character.currentClass = choice;
          fresh.character.classLevel   = 1;
          fresh.character.classXP      = 0;
          if (!fresh.character.unlockedClasses[choice]) fresh.character.unlockedClasses[choice] = 1;
          SM.save(fresh);
        } else if (!isBase) {
          SM.promote(fresh, choice);
        }
      }
      overlay.remove();
      updateHUD(fresh); updateStatus(fresh);
      renderClassTree();
      renderHeroesSection();
    });
  });
}


// ============================================
// Hero Switch Modal
// ============================================
function showHeroSwitchModal() {
  document.querySelectorAll('.hero-switch-modal').forEach(m => m.remove());
  const state   = SM.load();
  const slots   = SM.getAllHeroSlots();
  const activeId = state ? state.hero.heroId : -1;

  const overlay = document.createElement('div');
  overlay.className = 'hero-switch-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;overflow-y:auto';

  const cardsHTML = slots.map(slot => {
    const isActive = slot.heroId === activeId;
    const saved    = slot.heroId === activeId ? state : SM.getHeroSlot(slot.heroId);
    const gIcon    = slot.gender === 'male' ? '♂' : slot.gender === 'female' ? '♀' : '✦';

    // Build unlocked classes list (same as 英雄圖鑑)
    const unlocked = saved ? saved.character.unlockedClasses : {};
    const achievedClasses = Object.entries(unlocked).filter(([,lvl]) => lvl > 0);
    const currentCls = saved ? saved.character.currentClass : null;

    const classListHTML = achievedClasses.length > 0
      ? achievedClasses.map(([cls, lvl]) => {
          const isCurrent = cls === currentCls;
          return `<div style="font-size:0.7rem;margin:0.15rem 0;
            color:${isCurrent ? 'var(--color-gold)' : 'var(--color-text-muted)'};
            font-weight:${isCurrent ? '700' : '400'}">
            ${isCurrent ? '▶ ' : ''}${cls} <span style="color:var(--color-primary)">Lv.${lvl}</span>
          </div>`;
        }).join('')
      : '<div style="font-size:0.7rem;color:var(--color-text-muted);margin-top:0.3rem">首次冒險</div>';

    return `
    <div class="hero-switch-card" data-hero-id="${slot.heroId}" style="
      border:2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'};
      background:${isActive ? 'rgba(100,180,255,0.08)' : 'transparent'};
      border-radius:8px;padding:1rem;cursor:${isActive ? 'default' : 'pointer'};
      transition:border-color 0.2s,background 0.2s;text-align:center;
      opacity:${isActive ? '1' : '0.85'};
    ">
      <div style="font-size:2rem">${slot.icon}</div>
      <div style="font-weight:700;margin:0.3rem 0 0.1rem;font-family:var(--font-display);font-size:0.9rem">${slot.name}</div>
      <div style="font-size:0.72rem;color:var(--color-text-muted);margin-bottom:0.4rem">${gIcon} ${slot.badge}</div>
      ${isActive ? '<div style="font-size:0.7rem;color:var(--color-primary);margin-bottom:0.3rem">▶ 使用中</div>' : ''}
      <div style="text-align:left;border-top:1px solid var(--color-border);padding-top:0.4rem;margin-top:0.2rem">
        ${classListHTML}
      </div>
      ${!isActive && achievedClasses.length > 0 ? '<div style="font-size:0.65rem;color:var(--color-text-muted);margin-top:0.4rem">點擊切換</div>' : ''}
      ${!isActive && achievedClasses.length === 0 ? '<div style="font-size:0.65rem;color:var(--color-text-muted);margin-top:0.4rem">點擊開始冒險</div>' : ''}
    </div>`;
  }).join('');

  overlay.innerHTML = `
    <div style="background:var(--color-surface);border:2px solid var(--color-primary);border-radius:10px;padding:2rem;max-width:680px;width:100%;font-family:var(--font-body)">
      <h2 style="font-family:var(--font-display);color:var(--color-primary);margin:0 0 0.4rem;text-align:center">轉換英雄</h2>
      <p style="color:var(--color-text-muted);font-size:0.84rem;text-align:center;margin-bottom:1.5rem">切換英雄後，各英雄的進度將獨立保存。選擇重新開始才會清除所有紀錄。</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.75rem;margin-bottom:1.5rem">
        ${cardsHTML}
      </div>
      <button id="hero-switch-close" style="width:100%;padding:0.6rem;background:transparent;color:var(--color-text-muted);border:1px solid var(--color-border);border-radius:4px;cursor:pointer;font-size:0.88rem">取消</button>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelectorAll('.hero-switch-card').forEach(card => {
    const heroId = parseInt(card.dataset.heroId);
    if (heroId === activeId) return;
    card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--color-primary)'; card.style.background = 'rgba(100,180,255,0.06)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--color-border)'; card.style.background = 'transparent'; });
    card.addEventListener('click', () => {
      const current = SM.load();
      const newState = SM.switchHero(current, heroId);
      overlay.remove();
      updateHUD(newState);
      updateStatus(newState);
      renderClassTree();
      renderHeroesSection();
      renderPlayerDashboard();
      initXPTracker();
    });
  });

  overlay.querySelector('#hero-switch-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ============================================
// Player Dashboard
// ============================================
function renderPlayerDashboard() {
  const container = document.getElementById('player-dashboard-cards');
  if (!container) return;

  const allSlots  = SM.getAllHeroSlots();
  const allHidden = (CQ.classes || []).filter(c => c.hidden || c.branch === 'hidden');
  const allBasic  = (CQ.classes || []).filter(c => !c.hidden && c.branch !== 'hidden');
  const totalHeroes = CQ.heroes.length;

  // Count heroes played (have a saved slot)
  const heroesPlayed = allSlots.filter(s => s.savedState !== null).length;

  // Aggregate all unlocked classes across ALL hero slots
  const unlockedSet        = new Set();
  const unlockedHiddenSet  = new Set();
  const maxedClassesSet    = new Set();
  const MAX_LEVEL          = 10; // Max class level

  function processClasses(unlockedMap) {
    if (!unlockedMap) return;
    Object.entries(unlockedMap).forEach(([cls, lvl]) => {
      if (lvl > 0) {
        const classData = (CQ.classes || []).find(c => c.name === cls);
        if (classData && (classData.hidden || classData.branch === 'hidden')) {
          unlockedHiddenSet.add(cls);
        } else if (classData) {
          unlockedSet.add(cls);
        }
        if (lvl >= MAX_LEVEL) {
          maxedClassesSet.add(cls);
        }
      }
    });
  }

  // Count from saved slots
  allSlots.forEach(slot => {
    if (slot.savedState) processClasses(slot.savedState.character.unlockedClasses);
  });

  // Count active hero's current state (overrides slot if fresher)
  const activeState = SM.load();
  if (activeState) {
    processClasses(activeState.character.unlockedClasses);
  }

  const cards = [
    {
      icon: '⚔️',
      label: '英雄冒險',
      value: heroesPlayed,
      total: totalHeroes,
      sub: '已展開冒險的英雄',
      color: 'var(--color-primary)'
    },
    {
      icon: '🛡️',
      label: '基本職業',
      value: unlockedSet.size,
      total: allBasic.length,
      sub: '已解鎖職業',
      color: 'var(--color-gold)'
    },
    {
      icon: '✨',
      label: '隱藏職業',
      value: unlockedHiddenSet.size,
      total: allHidden.length,
      sub: '已解鎖隱藏職業',
      color: '#c084fc'
    },
    {
      icon: '👑',
      label: '職業精通',
      value: maxedClassesSet.size,
      total: CQ.classes.length, // total possible classes to max
      sub: `已達滿級 (Lv.${MAX_LEVEL})`,
      color: '#f97316' // Fiery orange
    }
  ];

  container.innerHTML = cards.map(c => {
    const pct = c.total > 0 ? Math.round((c.value / c.total) * 100) : 0;
    return `
    <div style="
      border:1px solid var(--color-border);border-radius:8px;
      padding:1.2rem 1.4rem;background:var(--color-surface);
      display:flex;flex-direction:column;gap:0.5rem;
    ">
      <div style="display:flex;align-items:center;gap:0.6rem">
        <span style="font-size:1.6rem">${c.icon}</span>
        <span style="font-size:0.78rem;color:var(--color-text-muted);font-family:var(--font-body)">${c.label}</span>
      </div>
      <div style="font-size:2rem;font-family:var(--font-display);color:${c.color};line-height:1">
        ${c.value}<span style="font-size:1rem;color:var(--color-text-muted)"> / ${c.total}</span>
      </div>
      <div style="height:4px;background:var(--color-border);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${c.color};border-radius:2px;transition:width 0.6s ease"></div>
      </div>
      <div style="font-size:0.7rem;color:var(--color-text-muted)">${c.sub}</div>
    </div>`;
  }).join('');
}

// ============================================
// Boot hooks — call renderers after game loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderClassTree();
    renderHeroesSection();
    renderPlayerDashboard();
  }, 200);
});
