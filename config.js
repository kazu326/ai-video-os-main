// ============================================================
// config.js — 工程定義・熟練度・ブランドDB
// ツールリンクは localStorage（STORAGE_KEYS.TOOL_LINKS）で管理
// 命名規則：定数 = UPPER_SNAKE_CASE
// ============================================================

const ADMIN_PASSWORD = "os2026"; // TODO: Phase 2でバックエンド認証に移行

const STORAGE_KEYS = {
  TOOL_LINKS:     "os_tool_links",
  SESSION:        "os_session",
  BRAND_SETTINGS: "os_brand_settings"  // ← 追加
};

const MEDIA_TYPES = {
  instagram: { label: "Instagram", color: "var(--color-instagram)" },
  tiktok:    { label: "TikTok",    color: "var(--color-tiktok)"    },
  youtube:   { label: "YouTube",   color: "var(--color-youtube)"   },
  other:     { label: "その他",    color: "var(--color-text-muted)"}
};

const LEVELS = {
  beginner: {
    label: "初級者",
    isSkipAllowed: false,
    hasFullDetail: false,
    hasProgressBar: true,
    hasNextStepPreview: false
  },
  mid: {
    label: "中級者",
    isSkipAllowed: true,
    hasFullDetail: true,
    hasProgressBar: true,
    hasNextStepPreview: true
  },
  pro: {
    label: "上級者",
    isSkipAllowed: true,
    hasFullDetail: true,
    hasProgressBar: false,
    hasNextStepPreview: true
  }
};

const STEPS = [
  { id: 1,  title: "ジャンル選定",          description: "市場調査・ニーズ分析・競合リサーチを行い、参入ジャンルを決定する。",                              estimatedMinutes: 60, allowedLevels: ["mid","pro"],                  hasBrandCheck: false, skipReason: "ジャンルが既に決定済みの場合はスキップ可" },
  { id: 2,  title: "アカウント設計",         description: "差別化ポイントの整理、全体的なコンセプト・世界観を構築する。",                                   estimatedMinutes: 45, allowedLevels: ["mid","pro"],                  hasBrandCheck: false, skipReason: "アカウント設計が完了している場合はスキップ可" },
  { id: 3,  title: "素材・キャラクター準備", description: "必要な素材やキャラクター設定などの事前準備を行う。",                                              estimatedMinutes: 40, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: true,  skipReason: "必要な素材が全て揃っている場合はスキップ可" },
  { id: 4,  title: "投稿計画・スケジューリング", description: "投稿スケジュールと計画を立てる。",                                                           estimatedMinutes: 30, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: false, skipReason: "投稿スケジュールが確定している場合はスキップ可" },
  { id: 5,  title: "台本・フレーム選択",     description: "フレームワークを選択し、AIで台本を生成する。フック・本編・CTAの3部構成を必ず含める。",             estimatedMinutes: 30, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: true,  skipReason: null },
  { id: 6,  title: "ナレーション・音声生成", description: "台本をもとに、AIを使用してナレーションや音声を生成する。",                                         estimatedMinutes: 20, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: true,  skipReason: null },
  { id: 7,  title: "映像・動画素材生成",     description: "音声や台本に合わせ、映像や動画素材を生成する。",                                                   estimatedMinutes: 45, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: true,  skipReason: null },
  { id: 8,  title: "編集・仕上げ",           description: "すべての素材を組み合わせ、最終的な動画として編集・仕上げる。",                                     estimatedMinutes: 40, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: true,  skipReason: null },
  { id: 9,  title: "投稿・最適化",           description: "プラットフォームごとに最適化を行い、動画を投稿する。",                                             estimatedMinutes: 15, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: false, skipReason: null },
  { id: 10, title: "初動分析（24h）",        description: "投稿から24時間後の初動データを分析する。",                                                         estimatedMinutes: 20, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: false, skipReason: "データが未集計の場合はスキップ可" },
  { id: 11, title: "AI分析・改善案抽出",     description: "AIを使用してデータを分析し、改善案を抽出する。",                                                   estimatedMinutes: 30, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: false, skipReason: "十分なデータがない場合はスキップ可" },
  { id: 12, title: "DBへの記録・CTA最適化", description: "結果やノウハウを蓄積し、次回のCTA最適化に繋げる。",                                               estimatedMinutes: 20, allowedLevels: ["beginner","mid","pro"],       hasBrandCheck: false, skipReason: "記録する内容がない場合はスキップ可" },
  { id: 13, title: "バズ分析・再現研究",     description: "バズったコンテンツの要因を分析し、再現性を高める研究を行う。",                                     estimatedMinutes: 30, allowedLevels: ["mid","pro"],                  hasBrandCheck: false, skipReason: "分析対象がない場合はスキップ可" },
  { id: 14, title: "KPI評価・次サイクル設計", description: "KPIを評価し、次のサイクルの設計を行う。",                                                         estimatedMinutes: 40, allowedLevels: ["mid","pro"],                  hasBrandCheck: false, skipReason: "次サイクル設計が不要な場合はスキップ可" }
];

// ============================================================
// BRAND_DB — デフォルト値（localStorageの値で上書きされる）
// ============================================================
const BRAND_DB_DEFAULT = {
  accountName:   "",
  concept:       "",
  target:        "",
  toneAndManner: "",
  ngWords:       [],
  checkPoints: [
    "色調・キャラクターに統一感があるか",
    "冒頭3秒でターゲットの悩みに刺さっているか",
    "CTAは1つに絞られているか"
  ]
};

// 実行時はlocalStorageから読み込む（admin.htmlとwizard.htmlの両方から参照）
function getBrandSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BRAND_SETTINGS);
    return saved ? { ...BRAND_DB_DEFAULT, ...JSON.parse(saved) } : { ...BRAND_DB_DEFAULT };
  } catch(e) {
    return { ...BRAND_DB_DEFAULT };
  }
}

function setBrandSettings(data) {
  localStorage.setItem(STORAGE_KEYS.BRAND_SETTINGS, JSON.stringify(data));
}

// 後方互換のためBRAND_DBも残す
const BRAND_DB = BRAND_DB_DEFAULT;

console.log("[config] STEPS loaded:", STEPS.length);
