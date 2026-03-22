// ============================================
// ChronoQuest — Game Data Layer
// ============================================

const CQ = {};

// --- Stat-to-Class Mapping ---
CQ.statClassMap = {
  STR: { primary: "鬥劍士", desc: "力量型 — 物理系前鋒", icon: "⚔", branch: "physical", gender: "male", path: "蠻族戰士 → 狂戰士 or 大劍師" },
  INT: { primary: "煉金術士", desc: "智力型 — 法術系核心", icon: "⚗", branch: "magic", gender: "male", path: "巫師 → 降術師 / 邪術師" },
  AGI: { primary: "女戰士", desc: "敏捷型 — 物理系刺客", icon: "🗡", branch: "physical", gender: "female", path: "射手 → 小偷 → 殺手" },
  WIS: { primary: "魔術士", desc: "感知型 — 法術系輔助", icon: "✨", branch: "magic", gender: "female", path: "修女 → 精靈使 → 元素使" },
  CHA: { primary: "女戰士", desc: "魅力型 — 全能指揮官", icon: "👑", branch: "physical", gender: "female", path: "亞馬遜戰士 → 拳法家 or 玫瑰騎士" }
};

// --- Heroes (角色詳情) ---
CQ.heroes = [
  {
    name: "克荷林", badge: "劍系", icon: "⚔", gender: "male",
    desc: "故事的主人公，年輕而充滿正義感的劍士。初始能力由前導問答決定，擁有最自由的轉職路線。",
    basePath: "鬥劍士 → 劍客 → 大劍師",
    hidden: [
      { name: "劍聖", req: "大劍師10 + 德魯依2", rec: true, desc: "將劍技與自然之力融合，攻守兼備的究極劍士。" },
      { name: "劍邪", req: "大劍師8 + 降術師3", rec: false, desc: "以黑暗力量強化劍技，犧牲防禦換取毀滅性攻擊。" }
    ],
    stats: { STR: 8, INT: 5, AGI: 7, WIS: 4, CHA: 6 }
  },
  {
    name: "麥斯", badge: "弓系", icon: "🏹", gender: "male",
    desc: "沉默寡言的弓箭手，擁有超人的遠距攻擊天賦。是隊伍中最可靠的遠程輸出。",
    basePath: "鬥劍士 → 長弓手 → 長戟士",
    hidden: [
      { name: "弓王", req: "長弓手10 + 長戟士5", rec: false, desc: "純粹的弓道大師，以極遠距離和高爆擊率見長。" },
      { name: "暗影狙擊手", req: "長弓手9 + 盜賊6", rec: true, desc: "結合暗殺技巧的弓手，兼具隱形與先制能力。" }
    ],
    stats: { STR: 5, INT: 4, AGI: 9, WIS: 3, CHA: 4 }
  },
  {
    name: "波比", badge: "斧系", icon: "🪓", gender: "male",
    desc: "豪邁的蠻族戰士，擁有驚人的體力和防禦力。是隊伍的鋼鐵前線。",
    basePath: "鬥劍士 → 蠻族戰士 → 狂戰士",
    hidden: [
      { name: "幽冥斧王", req: "狂戰士6 + 武鬥僧4 + 降術師2", rec: true, desc: "將狂暴之力與格鬥技巧結合，近戰無敵的存在。" },
      { name: "雷風斧王", req: "狂戰士6 + 武鬥僧6 + 飆風騎士2", rec: false, desc: "以雷電之力強化斧擊，範圍攻擊的專家。" }
    ],
    stats: { STR: 9, INT: 2, AGI: 4, WIS: 3, CHA: 5 }
  },
  {
    name: "努薩伊", badge: "騎士系", icon: "🐴", gender: "male",
    desc: "騎士之家的後裔，精通馬術和長兵器。是最具機動力的戰士。",
    basePath: "鬥劍士 → 長弓手 → 長戟士 → 游擊騎士",
    hidden: [
      { name: "黑騎士", req: "游擊騎士5 + 巫師5", rec: false, desc: "融合自然與騎術的暗影騎士。" },
      { name: "光明騎士", req: "游擊騎士5 + 德魯依3", rec: false, desc: "以聖光加持的守護騎士。" },
      { name: "聖騎士", req: "光明騎士2 + 降術師2", rec: true, desc: "掌握光明與黑暗雙重力量的究極騎士。" }
    ],
    stats: { STR: 7, INT: 4, AGI: 6, WIS: 5, CHA: 7 }
  },
  {
    name: "寇琪", badge: "魔劍系", icon: "🗡", gender: "female",
    desc: "天資聰穎的少女劍士，同時擁有物理和魔法的天賦，是最多才多藝的角色。",
    basePath: "女戰士 → 劍士",
    hidden: [
      { name: "魔劍使", req: "劍士9 + 拳法家8", rec: false, desc: "以體術強化劍技的近戰達人。" },
      { name: "魔法劍士", req: "劍士9 + 女巫7", rec: true, desc: "融合魔法與劍術，攻擊附帶元素傷害。" }
    ],
    stats: { STR: 6, INT: 7, AGI: 8, WIS: 5, CHA: 6 }
  },
  {
    name: "貝裏奇娜", badge: "神聖系", icon: "✝", gender: "female",
    desc: "虔誠的修女，擁有強大的治療和輔助能力。是隊伍不可或缺的後援。",
    basePath: "魔術士 → 修女 → 精靈使/主教",
    hidden: [
      { name: "光之聖女", req: "拳法家3 + 召喚士2", rec: false, desc: "以神聖之力召喚光明使者。" },
      { name: "超靈體", req: "主教2 + 光之聖女2", rec: false, desc: "超越肉體的靈魂存在，全能的輔助者。" },
      { name: "夜之王女", req: "幻術師2 + 元素使2", rec: true, desc: "支配幻象與元素的暗夜統治者。" },
      { name: "星靈大審判者", req: "夜之王女2 + 超靈體2 + 聖魔使2", rec: true, desc: "以星辰與靈魂裁決一切的究極法官，其審判無人能逃脫。" }
    ],
    stats: { STR: 3, INT: 7, AGI: 4, WIS: 9, CHA: 7 }
  },
  {
    name: "普魯絲", badge: "幻術系", icon: "👁", gender: "female",
    desc: "神秘的幻術師，擅長操控精神和幻象。是戰場上的混亂製造者。",
    basePath: "魔術士 → 女巫 → 幻術師",
    hidden: [
      { name: "閻魔使", req: "幻術師7", rec: true, desc: "掌控生死界限的幻術大師。" },
      { name: "聖魔使", req: "幻術師4 + 主教3", rec: false, desc: "同時掌握幻術與聖光的雙修者。" }
    ],
    stats: { STR: 2, INT: 9, AGI: 5, WIS: 6, CHA: 5 }
  },
  {
    name: "百合", badge: "暗殺系", icon: "🌙", gender: "female",
    desc: "冷酷的女殺手，速度與暗殺技巧無人能出其右。沉默是她最好的武器。",
    basePath: "女戰士 → 射手 → 小偷 → 殺手",
    hidden: [
      { name: "特攻", req: "殺手10", rec: false, desc: "將暗殺技巧修煉至極致的特攻隊員。" },
      { name: "影忍", req: "殺手6 + 拳法家4", rec: true, desc: "融合格鬥與暗殺的忍者，攻守兼備。" },
      { name: "影帝刺王", req: "殺手10 + 影忍5 + 玫瑰騎士3", rec: true, desc: "統御暗影與狙擊之道的暗殺王者，一擊足以改寫戰局。" }
    ],
    stats: { STR: 5, INT: 4, AGI: 9, WIS: 3, CHA: 3 }
  },
  {
    name: "咕魯魯", badge: "龍系", icon: "🐉", gender: "other",
    desc: "神秘的幼龍，擁有獨特的龍族進化路線。可根據屬性進化為不同類型的成龍。",
    basePath: "幼龍 → 地龍/風龍/冰龍/炎龍",
    hidden: [
      { name: "白龍", req: "地龍3 + 冰龍3", rec: false, desc: "冰與大地之力結合的白銀之龍。" },
      { name: "黑龍", req: "風龍3 + 炎龍3", rec: false, desc: "風與火交織的黑暗之龍。" },
      { name: "邪龍 → 聖龍", req: "黑龍3+白龍2 / 白龍3+黑龍2", rec: true, desc: "超越善惡的究極龍形態。" }
    ],
    stats: { STR: 7, INT: 6, AGI: 6, WIS: 6, CHA: 3 }
  }
];

// --- XP System ---
CQ.xpLevels = [
  { level: 1, title: "冒險者", xpReq: 0, icon: "🌱" },
  { level: 2, title: "見習生", xpReq: 100, icon: "⚔" },
  { level: 3, title: "戰士", xpReq: 300, icon: "🛡" },
  { level: 4, title: "精英", xpReq: 600, icon: "⭐" },
  { level: 5, title: "勇者", xpReq: 1000, icon: "🔥" },
  { level: 6, title: "英雄", xpReq: 1500, icon: "👑" },
  { level: 7, title: "傳說", xpReq: 2100, icon: "💎" },
  { level: 8, title: "神話", xpReq: 2800, icon: "🌟" },
  { level: 9, title: "不朽", xpReq: 3600, icon: "🐉" },
  { level: 10, title: "超時空", xpReq: 4500, icon: "✦" }
];

CQ.dailyQuests = [
  { id: "q1", name: "完成每日簽到", xp: 20, icon: "📋", done: false },
  { id: "q2", name: "瀏覽3個職業介紹", xp: 15, icon: "📖", done: false },
  { id: "q4", name: "模擬一條轉職路線", xp: 30, icon: "🔄", done: false },
  { id: "q5", name: "分享給一位好友", xp: 40, icon: "💬", done: false }
];

// --- Classes (職業詳情) ---
CQ.classes = [
  // Physical Male
  { name: "鬥劍士", icon: "⚔", weapon: "武器：劍 ｜ 步行", desc: "所有物理系職業的基礎。各項物理參數平均成長，可培育為泛用型夥伴。", tag: "基礎職業", branch: "physical", gender: "male" },
  { name: "長弓手", icon: "🏹", weapon: "武器：弓 ｜ 步行", desc: "遠距先制、飛行箝制。擅長在遠處壓制敵人，是戰場上的狙擊者。", tag: "鬥劍士 Lv.2", branch: "physical", gender: "male" },
  { name: "蠻族戰士", icon: "🪓", weapon: "武器：斧 ｜ 水陸兩棲", desc: "憑依強韌肉體的戰鬥者。持續鍛鍊體魄，學習野獸的生存技巧，對中毒具有抗性。", tag: "鬥劍士 Lv.3", branch: "physical", gender: "male" },
  { name: "劍客", icon: "🗡", weapon: "武器：劍 ｜ 步行", desc: "劍光軌跡劃過虛空。將劍技修練至極致，以精湛的劍術在戰場上制敵。", tag: "鬥劍士 Lv.4", branch: "physical", gender: "male" },
  { name: "大劍師", icon: "⚔", weapon: "武器：大劍 ｜ 步行", desc: "極致的劍術境界。力量與技巧的完美結合，揮動巨劍橫掃戰場。", tag: "鬥劍士 Lv.10", branch: "physical", gender: "male" },
  { name: "盜賊", icon: "🗝", weapon: "武器：短刀 ｜ 步行", desc: "偵測隱藏事物的第三隻眼。擁有開鎖技能，能發現他人無法察覺之物。", tag: "長弓手 Lv.4", branch: "physical", gender: "male" },
  { name: "長戟士", icon: "🔱", weapon: "武器：長戟 ｜ 步行", desc: "長兵器的大師。利用長度優勢控制戰場，是騎士的前身。", tag: "長弓手 Lv.5", branch: "physical", gender: "male" },
  { name: "游擊騎士", icon: "🐴", weapon: "武器：長戟 ｜ 騎乘", desc: "騎士的巔峰。馬術與長兵器的結合，機動性與破壞力的極致。", tag: "長戟士 Lv.5", branch: "physical", gender: "male" },
  { name: "狂戰士", icon: "💢", weapon: "武器：斧 ｜ 水陸兩棲", desc: "狂暴的化身。犧牲防禦換取毀滅性攻擊，是蠻族的進化。", tag: "蠻族戰士 Lv.5", branch: "physical", gender: "male" },
  { name: "武鬥僧", icon: "🥋", weapon: "武器：拳套 ｜ 步行", desc: "格鬥的極致。將拳法修練至藝術境界，肉體即武器。", tag: "鬥劍士 Lv.7", branch: "physical", gender: "male" },
  { name: "水蛇騎士", icon: "🐍", weapon: "武器：長矛 ｜ 水陸兩棲", desc: "擅長在水域中游走的騎士。水下機動與閃避能力優秀。", tag: "游擊騎士 Lv.4", branch: "physical", gender: "male" },
  { name: "飆風騎士", icon: "💨", weapon: "武器：長矛 ｜ 騎乘", desc: "迅捷的衝刺者，能迅速突進和撤離。擅長打擊脆皮目標。", tag: "游擊騎士 Lv.4", branch: "physical", gender: "male" },

  // Physical Female
  { name: "女戰士", icon: "⚔", weapon: "武器：劍 ｜ 步行", desc: "女性物理系的基石。全面而均衡的成長路線，是所有女性戰鬥職業的起點。", tag: "基礎職業", branch: "physical", gender: "female" },
  { name: "射手", icon: "🎯", weapon: "武器：弓 ｜ 步行", desc: "精準的遠距射擊專家。以敏捷的身手和銳利的箭矢控制戰場距離。", tag: "女戰士 Lv.2", branch: "physical", gender: "female" },
  { name: "亞馬遜戰士", icon: "🛡", weapon: "武器：斧 ｜ 步行", desc: "誇耀的物理防禦力。強韌的體魄配合反擊技能，是前線最可靠的盾牌。", tag: "女戰士 Lv.3", branch: "physical", gender: "female" },
  { name: "劍士", icon: "🗡", weapon: "武器：劍 ｜ 步行", desc: "以敏捷劍技著稱的女性劍客。速度與精準的完美結合。", tag: "女戰士 Lv.4", branch: "physical", gender: "female" },
  { name: "小偷", icon: "🗝", weapon: "武器：短刀 ｜ 步行", desc: "令敵人痛恨的刺腳釘。擅長開鎖與潛行，是暗處最危險的存在。", tag: "射手 Lv.4", branch: "physical", gender: "female" },
  { name: "拳法家", icon: "👊", weapon: "武器：拳套 ｜ 步行", desc: "精氣神三元合一的修行者。以格鬥技能近身作戰，每一拳都蘊含深厚內功。", tag: "亞馬遜戰士 Lv.4", branch: "physical", gender: "female" },
  { name: "玫瑰騎士", icon: "🌹", weapon: "武器：長矛 ｜ 騎乘", desc: "優雅的騎士。將劍術與馬術融合，展現華麗的戰鬥風格。", tag: "劍士 Lv.5", branch: "physical", gender: "female" },
  { name: "殺手", icon: "🌙", weapon: "武器：短刀 ｜ 步行", desc: "暗殺的極致。速度與隱匿的完美結合，一擊致命。", tag: "小偷 Lv.5", branch: "physical", gender: "female" },
  
  // Magic Male
  { name: "煉金術士", icon: "⚗", weapon: "武器：杖 ｜ 步行", desc: "道具使用與魔力累積的根基。煉金技能是所有法術施展時魔力的來源。", tag: "基礎職業", branch: "magic", gender: "male" },
  { name: "修士", icon: "📿", weapon: "武器：杖 ｜ 步行", desc: "以神聖之力守護弱者。修練回復與輔助法術，是隊伍中不可或缺的後盾。", tag: "煉金術士 Lv.3", branch: "magic", gender: "male" },
  { name: "巫師", icon: "🔮", weapon: "武器：杖 ｜ 步行", desc: "魔法潛能之激發者。深入研究黑暗與元素法術，釋放毀滅性的魔法攻擊。", tag: "煉金術士 Lv.3", branch: "magic", gender: "male" },
  { name: "德魯依", icon: "🌿", weapon: "武器：杖 ｜ 步行", desc: "與自然共鳴的賢者。掌控大地之力，是回復與自然魔法的大師。", tag: "修士 Lv.4", branch: "magic", gender: "male" },
  { name: "降術師", icon: "💀", weapon: "武器：杖 ｜ 步行", desc: "操控死亡與黑暗的法師。召喚亡靈之力，以詛咒削弱敵人。", tag: "巫師 Lv.4", branch: "magic", gender: "male" },
  { name: "工匠", icon: "🔧", weapon: "武器：鋤 ｜ 步行", desc: "精通機械與道具製作。將煉金知識轉化為實用的戰鬥器械與輔助道具。", tag: "煉金術士 Lv.7", branch: "magic", gender: "male" },

  // Magic Female
  { name: "魔術士", icon: "✨", weapon: "武器：杖 ｜ 步行", desc: "女性法術系的基礎職業。擁有全面的魔法潛能，是所有女性法術職業的起點。", tag: "基礎職業", branch: "magic", gender: "female" },
  { name: "修女", icon: "✝", weapon: "武器：杖 ｜ 步行", desc: "以信仰之力治癒傷痛。精通回復魔法，是隊伍的守護天使。", tag: "魔術士 Lv.3", branch: "magic", gender: "female" },
  { name: "女巫", icon: "🌙", weapon: "武器：杖 ｜ 步行", desc: "臣服於四大元素均衡之力。操控自然元素，以強大的魔法攻擊制敵。", tag: "魔術士 Lv.3", branch: "magic", gender: "female" },
  { name: "精靈使", icon: "🧚", weapon: "武器：杖 ｜ 步行", desc: "與精靈締結契約。借助精靈之力施展獨特的元素魔法。", tag: "修女 Lv.4", branch: "magic", gender: "female" },
  { name: "召喚士", icon: "🐉", weapon: "武器：杖 ｜ 步行", desc: "以血之盟約喚出強力戰友。召喚各種魔物並肩作戰。", tag: "女巫 Lv.4", branch: "magic", gender: "female" },
  { name: "幻術師", icon: "👁", weapon: "武器：杖 ｜ 步行", desc: "操控精神與幻象的專家。製造幻覺干擾敵人，是戰場上的混亂製造者。", tag: "魔術士 Lv.5", branch: "magic", gender: "female" },
  { name: "主教", icon: "⛪", weapon: "武器：杖 ｜ 步行", desc: "神聖的守護者。精通回復與祝福，是隊伍的靈魂人物。", tag: "修女 Lv.5", branch: "magic", gender: "female" },
  { name: "元素使", icon: "🌪", weapon: "武器：杖 ｜ 飛行", desc: "元素之力的極致。精通四大元素的操控，是魔法攻擊的巔峰。", tag: "精靈使 Lv.2", branch: "magic", gender: "female" },
 
  // Dragon (咕魯魯 — gender: other)
  { name: "幼龍", icon: "🐣", weapon: "武器：爪 ｜ 步行", desc: "咕魯魯的初始形態。蘊藏著龍族的無限潛能，等待覺醒的那一刻。", tag: "基礎職業", branch: "dragon", gender: "other" },
  { name: "地龍", icon: "🟤", weapon: "武器：爪 ｜ 步行", desc: "大地之力的化身。防禦力極高，以強韌的鱗甲和震地攻擊制敵。", tag: "幼龍 Lv.3", branch: "dragon", gender: "other" },
  { name: "風龍", icon: "🌀", weapon: "武器：爪 ｜ 飛行", desc: "疾風的化身。速度極快，以迅捷的飛行機動和龍捲風攻擊為主。", tag: "幼龍 Lv.3", branch: "dragon", gender: "other" },
  { name: "冰龍", icon: "❄️", weapon: "武器：爪 ｜ 飛行", desc: "寒冰之力的化身。以冰霜吐息封凍敵人，控制戰場節奏。", tag: "幼龍 Lv.3", branch: "dragon", gender: "other" },
  { name: "炎龍", icon: "🔥", weapon: "武器：爪 ｜ 飛行", desc: "熾焰之力的化身。以噴火和爆炎橫掃戰場，爆發傷害最強。", tag: "幼龍 Lv.3", branch: "dragon", gender: "other" },
];

// --- Class Image Path Helper ---
CQ.classImagePath = function(className) {
  return 'images/' + className + '.jpg';
};

// ============================================
// PASTE THIS AT THE BOTTOM OF data.js
// Fixes: correct class tags, adds hidden classes, builds classTree
// ============================================

// --- Fix incorrect class tags to match actual basePaths ---
(function() {
  const fixes = {
    '大劍師':   '劍客 Lv.10',   // basePath: 鬥劍士→劍客→大劍師
    '狂戰士':   '蠻族戰士 Lv.5',
    '長戟士':   '長弓手 Lv.5',
  };
  CQ.classes.forEach(c => {
    if (fixes[c.name]) c.tag = fixes[c.name];
  });
})();

// --- Inject hidden classes from CQ.heroes into CQ.classes (if not already present) ---
// Gender is inherited from the hero who owns the hidden class
(function() {
  CQ.heroes.forEach(hero => {
    (hero.hidden || []).forEach(h => {
      if (!CQ.classes.find(c => c.name === h.name)) {
        CQ.classes.push({
          name:   h.name,
          icon:   '🌟',
          weapon: '隱藏職業',
          desc:   h.desc,
          tag:    h.req,
          branch: 'hidden',
          gender: hero.gender || 'any',  // inherits hero gender
          hidden: true
        });
      }
    });
  });
})();

// --- Hero Tasks ---
CQ.heroTasks = [
  { id: 'ht1', name: '完成每日簽到',    xp: 20, icon: '📋' },
  { id: 'ht2', name: '瀏覽英雄圖鑑',    xp: 15, icon: '📖' },
  { id: 'ht3', name: '分享給一位好友',   xp: 40, icon: '💬' },
  { id: 'ht4', name: '設定今日目標',     xp: 25, icon: '🎯' },
];

// --- Class Tasks ---
CQ.classTasks = [
  { id: 'ct1', name: '瀏覽 3 個職業介紹',  xp: 20, icon: '⚔' },
  { id: 'ct2', name: '模擬一條轉職路線',    xp: 30, icon: '🔄' },
  { id: 'ct3', name: '查看隱藏職業條件',    xp: 25, icon: '🔍' },
  { id: 'ct4', name: '比較兩個職業分支',    xp: 20, icon: '⚖' },
];


// --- Deduplicate CQ.classes — keep first occurrence of each name only ---
// Removes copy-paste duplicates at the bottom of the original data.js
(function() {
  const seen = new Set();
  CQ.classes = CQ.classes.filter(c => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
})();

// --- Fix incorrect class genders (validated against hero basePaths) ---
(function() {
  const fixes = {
    '殺手': 'female',   // used by 百合 (female) via 小偷→殺手
    '大劍師': 'male',   // tag fix already applied above, gender confirm
  };
  CQ.classes.forEach(c => {
    if (fixes[c.name]) c.gender = fixes[c.name];
  });
})();
// --- Class Tree (auto-derived — run AFTER fixes + hidden injection above) ---
CQ.classTree = (function() {
  const tree = {};
  CQ.classes.forEach(cls => {
    const tag = (cls.tag || '').trim();
    if (!tag || tag === '基礎職業') {
      tree[cls.name] = { req: null, dual: false };
    } else if (tag.includes(' + ') || tag.includes('+')) {
      tree[cls.name] = { req: tag, dual: true };
    } else {
      tree[cls.name] = { req: tag, dual: false };
    }
  });
  return tree;
})();
