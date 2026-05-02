// お題デッキプール
// date: null → プール（ランダム出題対象）
// date: "2026-04-27" → その日に優先出題
// active: false → 出題対象外

const DECK_POOL = [
  {
    name: "進化ロイジャイ フィッシャーマンサイクル",
    cards: [
      "royale_giant_evo", "barbarian_barrel_hero", "royal_ghost_evo",
      "hunter", "fisherman", "fireball", "skeletons", "electro_spirit"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.0" },
      { type: "spellCount", text: "呪文は1枚" },
      { type: "revealCard", candidates: ["fisherman", "hunter", "royale_giant_evo"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-03"
  },
  {
    name: "進化ロイホグ ゴブリンの小屋",
    cards: [
      "royal_hogs_evo", "magic_archer_hero", "royal_ghost_evo",
      "berserker", "fireball", "goblin_hut", "electro_spirit", "barbarian_barrel"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.1" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["goblin_hut", "royal_hogs_evo", "berserker"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-03"
  },
  {
    name: "巨大スケルトン バンディット マザネク",
    cards: [
      "battle_ram_evo", "magic_archer_hero", "royal_ghost_evo",
      "giant_bomber", "mother_witch", "bandit", "arrows", "zap"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.6" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["giant_bomber", "mother_witch", "bandit"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-03"
  },
  {
    name: "ヒーローゴブリン 枯渇ベイト",
    cards: [
      "skeleton_barrel_evo", "goblin_hero", "royal_ghost_evo",
      "bush", "fireball", "dart_goblin", "rascals", "log"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.0" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["bush", "goblin_hero", "dart_goblin"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-03"
  },
  {
    name: "進化LJ 巨大スケルトン ヒーローウィザード",
    cards: [
      "battle_ram_evo", "wizard_hero", "lumberjack_evo",
      "giant_bomber", "dark_prince", "fireball", "zappies", "barbarian_barrel"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 4.1" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["zappies", "giant_bomber", "lumberjack_evo"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "進化モルタル キャノンカート ベイト",
    cards: [
      "skeleton_barrel_evo", "goblin_hero", "mortar_evo",
      "cannon_cart", "fireball", "minion", "rascals", "barbarian_barrel"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.9" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["mortar_evo", "cannon_cart", "skeleton_barrel_evo"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "2.6ホグサイクル（ヒーローアイゴレ型）",
    cards: [
      "hog_rider", "musketeer_evo", "ice_golem_hero",
      "cannon_evo", "fireball", "log", "ice_spirit", "skeletons"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.6" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["hog_rider", "musketeer_evo", "ice_golem_hero"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "3.0クロス",
    cards: [
      "knight_hero", "archers_evo", "tesla_evo",
      "xbow", "fireball", "skeletons", "electro_spirit", "log"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.0" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["xbow", "tesla_evo", "knight_hero"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "エンプレスラヴァ",
    cards: [
      "valkyrie_evo", "barbarian_barrel_hero", "zap_evo",
      "lava_hound", "spirit_empress", "fireball", "skeleton_dragons", "tombstone"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 4.0" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["lava_hound", "spirit_empress", "tombstone"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "巨スケスケラ",
    cards: [
      "furnace_evo", "barbarian_barrel_hero", "bats_evo",
      "graveyard", "giant_bomber", "berserker", "poison", "goblin_hut"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.6" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["graveyard", "giant_bomber", "goblin_hut"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },

    {
    name: "ペッカ攻城",
    cards: [
      "battle_ram_evo", "magic_archer_hero", "royal_ghost_evo",
      "pekka", "fireball", "electro_wizard", "bandit", "zap"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.9" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["pekka", "battle_ram_evo", "electro_wizard"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "スケフリ",
    cards: [
      "executioner_evo", "golden_knight", "inferno_dragon_evo",
      "graveyard", "bowler", "zappies", "tornado", "freeze"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 4.3" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["freeze", "graveyard", "bowler"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "ファルチェホグ",
    cards: [
      "executioner_evo", "goblin_hero", "valkyrie_evo",
      "hog_rider", "rocket", "tornado", "ice_spirit", "log"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.4" },
      { type: "spellCount", text: "呪文は3枚" },
      { type: "revealCard", candidates: ["executioner_evo", "hog_rider", "rocket"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "2.8ドリル",
    cards: [
      "goblin_drill_evo", "knight_hero", "snowball_evo",
      "berserker", "poison", "bomber", "fire_spirit", "tesla"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.8" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["goblin_drill_evo", "tesla", "poison"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "2.6ドリル",
    cards: [
      "goblin_drill_evo", "knight_hero", "snowball_evo",
      "berserker", "poison", "bomber", "fire_spirit", "cannon"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.6" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["goblin_drill_evo", "cannon", "poison"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "WB枯渇",
    cards: [
      "goblin_barrel_evo", "wall_breakers", "skeleton_army_evo",
      "valkyrie", "princess", "dart_goblin", "ice_spirit", "cannon"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.8" },
      { type: "spellCount", text: "呪文は1枚" },
      { type: "revealCard", candidates: ["wall_breakers", "goblin_barrel_evo", "princess"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "2.6ホグ",
    cards: [
      "cannon_evo", "musketeer_hero", "ice_golem_hero",
      "hog_rider", "fireball", "skeletons", "ice_spirit", "log"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.6" },
      { type: "spellCount", text: "呪文は2枚" },
      { type: "revealCard", candidates: ["hog_rider", "cannon_evo", "musketeer_hero"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "ロイホグ",
    cards: [
      "royal_hogs_evo", "barbarian_barrel_hero", "goblin_cage_evo",
      "cannon_cart", "mother_witch", "fireball", "skeleton_dragons", "spear_goblins"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 3.8" },
      { type: "spellCount", text: "呪文は1枚" },
      { type: "revealCard", candidates: ["royal_hogs_evo", "mother_witch", "cannon_cart"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  },
  {
    name: "アチャクイロイホグ",
    cards: [
      "royal_hogs_evo", "archer_queen", "cannon_evo",
      "earthquake", "skeletons", "ice_spirit", "royal_delivery", "log"
    ],
    hints: [
      { type: "avgElixir", text: "平均コスト: 2.9" },
      { type: "spellCount", text: "呪文は3枚" },
      { type: "revealCard", candidates: ["archer_queen", "royal_hogs_evo", "earthquake"] }
    ],
    date: null,
    active: true,
    addedSeason: "2026-04"
  }

];

export default DECK_POOL;
