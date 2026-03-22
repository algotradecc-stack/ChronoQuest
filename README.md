# ChronoQuest — Technical Architecture v1.1

## Overview
ChronoQuest is a pure front-end RPG gamification web app with no server or build step required.
All state is persisted in `localStorage`. The app runs by opening `index.html` in a browser.

---

## File Structure

```
project/
├── index.html          # Full UI — all sections, modals, HUD
├── app.js              # Game flow, rendering, UI logic
├── stateManager.js     # All state read/write via localStorage (SM object)
├── data.js             # All static game data (CQ object)
├── style.css           # Main styles
├── base.css            # CSS reset / base tokens
├── default_save.json   # Default hero save (hero 0: 克荷林) for first launch
└── images/
    └── [className].jpg # One image per class, e.g. 鬥劍士.jpg
```

---

## Data Layer (`data.js` → `CQ` object)

| Property | Description |
|---|---|
| `CQ.heroes[]` | 9 hero definitions: name, icon, badge, desc, basePath, hidden classes, stats |
| `CQ.classes[]` | All playable classes: name, icon, weapon, desc, tag, branch, gender |
| `CQ.classTree{}` | Promotion requirements per class (req, dual flag) |
| `CQ.xpLevels[]` | 10 XP levels with title, xpReq, icon |
| `CQ.dailyQuests[]` | 4 daily tasks with id, name, xp, icon |
| `CQ.statClassMap{}` | Stat → starting class mapping |

---

## State Layer (`stateManager.js` → `SM` object)

### State Schema (localStorage key: `cq_player_v1`)
```json
{
  "meta":      { "version", "createdAt", "lastSeen" },
  "hero":      { "heroId", "name", "icon", "badge", "basePath" },
  "character": { "currentClass", "classLevel", "unlockedClasses": { "ClassName": level } },
  "xp":        { "total", "level", "title" },
  "progress":  { "dailyTasksDone": [], "lastDailyReset": "YYYY-MM-DD" }
}
```

### Public API

| Method | Description |
|---|---|
| `SM.load()` | Load state from localStorage. Returns `null` if none. |
| `SM.loadDefault()` | Fetch `default_save.json`, seed localStorage, return state. Falls back to hero 0 if file missing. |
| `SM.save(state)` | Persist state to localStorage. |
| `SM.reset()` | Clear localStorage (triggers hero selection on next load). |
| `SM.startNewGame(heroIdx)` | Create fresh state for chosen hero, save and return it. |
| `SM.addXP(state, amount)` | Add XP. **Both hero rank AND class level advance together (Option A).** Returns `{ state, heroLeveledUp, classLeveledUp, newClassLevel }`. |
| `SM.getXPProgress(state)` | Returns `{ pct, current, next }` for XP bar rendering. |
| `SM.getAvailablePromotions(state)` | Returns array of class names the player can currently promote to based on `unlockedClasses`. |
| `SM.canPromote(state, targetClass)` | Check if promotion requirements are met. |
| `SM.promote(state, targetClass)` | Switch `currentClass` to targetClass, reset `classLevel` to 1, save. |
| `SM.gainClassLevel(state)` | Manually increment classLevel (used internally). |
| `SM.completeTask(state, taskId)` | Mark task done, award XP, return `addXP` result. |
| `SM.getDailyTaskStatus(state)` | Return all tasks with `done` flag. Resets daily if date changed. |

---

## XP & Progression System (Option A — Shared XP)

- Clicking any daily task always awards its XP (tasks are re-clickable every time).
- **One XP pool drives both hero rank and class level simultaneously.**
- Every time the hero rank levels up, `classLevel` also increments by 1.
- `addXP()` returns `classLeveledUp: true` when this happens.

### Class Level-Up Flow
When `classLeveledUp` is `true` after a task click:
1. A **promotion modal** appears automatically.
2. The player chooses one of:
   - **Stay** — remain in current class at the new level (e.g. 鬥劍士 Lv.2)
   - **Change class** — any class whose `classTree` requirements are now met is listed as an option
3. On selection, `SM.promote()` is called (or skipped for "stay"), state is saved, and the Current Status section updates immediately.

---

## Boot Flow

```
DOMContentLoaded
  └─ SM.load()
       ├─ State found → showGame(state)
       └─ No state → SM.loadDefault()
                        ├─ fetch('default_save.json') → showGame(state)
                        └─ fetch fails → SM.startNewGame(0) → showGame(state)
```

If the app is opened via `file://` (no server), `fetch` is blocked by CORS — the hardcoded fallback (hero 0, 克荷林) is used automatically.

---

## UI Sections

| Section | Element ID | Populated by |
|---|---|---|
| Hero selection grid | `hero-select-grid` | `renderHeroSelection()` in app.js |
| Sticky HUD | `player-hud` | `updateHUD(state)` |
| Current status | `current-status` | `updateStatus(state)` |
| Class image | `status-class-image` | `images/[className].jpg` |
| XP bar | `xp-bar-fill`, `xp-bar-text` | `updateStatus(state)` |
| Daily quests | `xp-quests` | `renderDailyQuests(state)` |
| Class promotion modal | dynamically created | `showClassLevelUpModal(state, level)` |

---

## Image Convention
- Folder: `images/`
- Filename: `[exact class name].jpg` e.g. `鬥劍士.jpg`, `劍客.jpg`
- If an image is missing, a fallback emoji (from `CQ.classes[].icon`) is displayed instead.

---

## Future Extensions
- Add more daily tasks or weekly challenges in `CQ.dailyQuests`
- Add a quest log section to track completed promotions
- Persist unlocked class history for a full progression tree view
- Add sound/animation on level-up events
