# ChronoQuest — Technical Architecture v1.3

## Overview
ChronoQuest is a pure front-end RPG gamification web app with no server or build step required.
All state is persisted in `localStorage`. The app runs by opening `index.html` in a browser.

---

## File Structure

```
project/
├── index.html          # Full UI — all sections, modals, HUD
├── app.js              # Game flow, rendering, UI logic (v1.3)
├── stateManager.js     # All state read/write via localStorage (SM object, v1.3)
├── data.js             # All static game data (CQ object)
├── style.css           # Main styles (Retro Pixel RPG Theme)
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
| `CQ.classes[]` | All playable classes (physical/magic/dragon/hidden): name, icon, weapon, desc, tag, branch, gender |
| `CQ.classTree{}` | Auto-derived promotion requirements per class (req, dual flag) |
| `CQ.xpLevels[]` | 10 hero XP levels with title, xpReq, icon |
| `CQ.heroTasks[]` | 4 hero tasks with id, name, xp, icon |
| `CQ.classTasks[]` | 4 class tasks with id, name, xp, icon |
| `CQ.statClassMap{}` | Stat → starting class mapping |
| `CQ.classImagePath(name)` | Helper returning `images/[className].jpg` |

**Post-load patches (at bottom of data.js):**
- Fixes incorrect class `tag` values to match actual basePaths
- Injects hidden classes from `CQ.heroes[].hidden` into `CQ.classes[]` (deduped)
- Deduplicates `CQ.classes` array (keeps first occurrence)
- Fixes gender mismatches on specific classes
- Auto-derives `CQ.classTree` from final `CQ.classes`

---

## State Layer (`stateManager.js` → `SM` object, v1.3)

### XP Architecture — Dual Pool System
- **Hero XP** (`cq_xp_v1`): Shared globally across all heroes. Drives hero rank (1–10). Completed via `CQ.heroTasks`.
- **Class XP** (inside character state): Per-hero, per-class pool. Drives class level (1–10). Completed via `CQ.classTasks`.
- Class XP thresholds: `[0, 50, 120, 210, 320, 450, 600, 770, 960, 1170, 1400]`

### State Schema
```json
{
  "meta":      { "version", "createdAt", "lastSeen" },
  "hero":      { "heroId", "name", "icon", "badge", "basePath" },
  "character": {
    "currentClass", "classLevel", "classXP",
    "unlockedClasses": { "ClassName": level }
  },
  "progress":  {
    "heroTasksDone": [],
    "classTasksDone": [],
    "lastReset": "YYYY-MM-DD"
  }
}
```
*Note: `state.xp` is injected at runtime from `cq_xp_v1` (not persisted in character state).*

### Storage Keys
| Key | Contents |
|---|---|
| `cq_player_v1` | Active hero's character/class/progress state |
| `cq_heroes_v1` | All hero slots `{ heroId: state }` for multi-hero support |
| `cq_xp_v1` | Shared player hero XP `{ total, level, title }` |

### Public API

| Method | Description |
|---|---|
| `SM.load()` | Load active state from `cq_player_v1`. Returns `null` if none or version mismatch. |
| `SM.loadDefault()` | Fetch `default_save.json`, seed localStorage, return state. Falls back to hero 0 if fetch fails. |
| `SM.save(state)` | Persist active state to `cq_player_v1`. |
| `SM.reset()` | Clear ALL storage keys (active slot + all hero slots + shared XP). |
| `SM.startNewGame(heroIdx)` | Create fresh state for chosen hero, save and return it. |
| `SM.addHeroXP(state, amount)` | Add to shared hero XP pool. Returns `{ state, leveledUp }`. |
| `SM.getHeroXPProgress(state)` | Returns `{ pct, current, next }` for hero XP bar. |
| `SM.addClassXP(state, amount)` | Add to class XP pool. Returns `{ state, leveledUp, newClassLevel }`. |
| `SM.getClassXPProgress(state)` | Returns `{ pct, current, next }` for class XP bar. |
| `SM.completeHeroTask(state, taskId)` | Mark hero task done, award hero XP. Auto-resets pool when all tasks ticked. |
| `SM.getHeroTaskStatus(state)` | Returns all hero tasks with `done` flag. |
| `SM.completeClassTask(state, taskId)` | Mark class task done, award class XP. Auto-resets pool when all tasks ticked. |
| `SM.getClassTaskStatus(state)` | Returns all class tasks with `done` flag. |
| `SM.canPromote(state, targetClass)` | Check if promotion requirements are met (includes gender check). |
| `SM.getAvailablePromotions(state)` | Returns array of class names player can promote to or resume. |
| `SM.promote(state, targetClass)` | Switch `currentClass`; restores saved level if previously unlocked, else resets to Lv.1. |
| `SM.saveToSlot(state)` | Save current state to `cq_heroes_v1` under its heroId. |
| `SM.getHeroSlot(heroId)` | Get saved state for a specific heroId (null if never played). |
| `SM.getAllHeroSlots()` | Returns all 9 hero slot summaries for display. |
| `SM.switchHero(currentState, targetHeroId)` | Save current hero to slot, load target hero slot (or create fresh). |

---

## Task & Reset System

- **Hero tasks** (`CQ.heroTasks`, 4 tasks): Award hero XP. When all 4 are ticked, the pool auto-resets (all tasks become available again).
- **Class tasks** (`CQ.classTasks`, 4 tasks): Award class XP. Same auto-reset mechanic.
- Tasks are **not** date-gated — the cycle resets when all tasks in a pool are completed.

---

## XP & Progression

### Hero Rank (global)
- 10 levels driven by `CQ.xpLevels` thresholds (0 → 4500 XP total)
- Shared across all heroes — switching heroes does not reset hero rank

### Class Level (per hero)
- 10 levels driven by `CLASS_XP` thresholds in `stateManager.js`
- Resets to Lv.1 (classXP = 0) when switching to a **new** class
- Restores saved level when switching back to a **previously unlocked** class

### Class Level-Up Flow
When `completeClassTask` returns `leveledUp: true`:
1. A **promotion modal** appears automatically (`showClassLevelUpModal`)
2. Player chooses:
   - **Stay** — remain in current class at new level
   - **Promote** — any class whose requirements are now met (same branch)
   - **Resume** — previously unlocked classes shown with saved level badge
   - **Branch switch** — switch to the opposite branch's base class (magic ↔ physical), restarting at Lv.1
3. On selection, `SM.promote()` is called (or skipped for "stay"), and UI refreshes

---

## Multi-Hero System

- All 9 heroes can be played independently with separate class/progress state
- **HUD** shows a "轉換英雄" button which opens `showHeroSwitchModal`
- Each hero's state is saved to `cq_heroes_v1[heroId]` when switching
- Hero XP (rank) is **shared** — it does not reset between heroes
- Full reset (`SM.reset()`) clears all slots and shared XP

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

If opened via `file://`, `fetch` is blocked — hardcoded fallback (hero 0, 克荷林) is used.

---

## UI Sections

| Section | Element ID | Populated by |
|---|---|---|
| Hero selection grid | `hero-select-grid` | `renderHeroSelection()` |
| Sticky HUD | `player-hud` | `updateHUD(state)` |
| Current status | `current-status` | `updateStatus(state)` |
| Class image | `status-class-image` | `images/[className].jpg` |
| Hero XP bar | `xp-bar-fill`, `xp-bar-text` | `updateStatus(state)` |
| Class XP bar | `class-bar-fill`, `class-bar-text` | `updateStatus(state)` |
| Hero tasks | `hero-tasks` | `renderHeroTasks(state)` |
| Class tasks | `class-tasks` | `renderClassTasks(state)` |
| Player dashboard | `player-dashboard-cards` | `renderPlayerDashboard()` |
| Class tree | `class-tree-container` | `renderClassTree()` |
| Heroes grid | `heroes-grid` | `renderHeroesSection()` |
| Class promotion modal | dynamically created | `showClassLevelUpModal(state, level)` |
| Hero detail modal | dynamically created | `showHeroDetailModal(hero, idx, state)` |
| Hero switch modal | dynamically created | `showHeroSwitchModal()` |
| Class info popup | dynamically created | `showClassInfoPopup(className, state, el)` |

---

## Image Convention
- Folder: `images/`
- Filename: `[exact class name].jpg` e.g. `鬥劍士.jpg`
- Fallback: class `icon` emoji shown if image missing

---

## Known Issues (Pending Fix)
- `showClassLevelUpModal` defined twice in `app.js` — first definition is dead code, remove it
- Second `DOMContentLoaded` at bottom of `app.js` causes redundant render calls
- `_parseReq` regex in `stateManager.js` uses `\\s` / `\\d` in regex literals — should be `\s` / `\d`
- Several `set(id, val)` calls in `updateHUD` / `updateStatus` target IDs absent from `index.html`
- `showGame()` is scoped inside `DOMContentLoaded` — hero selection click handler cannot call it, skipping `renderPlayerDashboard()`

---

## Future Extensions
- Add weekly challenges alongside the task auto-reset cycle
- Quest log section to track completed promotions and class history
- Full progression tree view with visual unlock history
- Sound/animation on level-up and promotion events
- Dragon branch (咕魯魯) class tree rendering (currently filtered out)
