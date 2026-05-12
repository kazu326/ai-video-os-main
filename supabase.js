// ============================================================
// supabase.js — Supabase MVP 統合モジュール
// ============================================================
// 使い方:
//   1. YOUR_SUPABASE_URL / YOUR_SUPABASE_ANON_KEY を設定
//   2. 全HTMLの <head> で config.js より後に読み込む
//      <script src="supabase.js"></script>
//   3. DOMContentLoaded で initSupabase() を呼ぶ
// ============================================================

// ★ここに Supabase の URL と ANON KEY を入力してください★
const SUPABASE_URL      = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// テーブル名・キャッシュキー
const TABLE_NAME = "projects";
const CACHE_KEY = "ai-video-os-cache";
const PROJECT_CONFIG_KEY = "ai-video-os-project-config";

const DEFAULT_PROJECT_CONFIG = {
  os: "ai-video-os",
  team: "internal",
  project: "default",
  role: "owner",
  range: "step-01-14",
  member: "kazu"
};

// ------------------------------------------------------------
// アプリ状態（全ページ共通）
// ------------------------------------------------------------
const appState = {
  tools:     [],   // ツールリンク一覧
  workflows: [],   // ワークフロー進捗
  prompts:   [],   // プロンプト集
  brandDB:   {},   // ブランドDB（BRAND_DB からマージ）
  settings:  {},   // 設定
  logs:      [],   // ログ記録
  meta: {
    version: 1,
    updatedAt: null,
    projectTitle: null
  }
};

// ------------------------------------------------------------
// Supabase クライアント初期化
// ------------------------------------------------------------
let supabaseClient = null;

function normalizeKeyPart(value, fallback = "na") {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_/]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || fallback;
}

function getProjectConfig() {
  try {
    const raw = localStorage.getItem(PROJECT_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_PROJECT_CONFIG };
    return { ...DEFAULT_PROJECT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.warn("[project-config] 読み込み失敗:", e.message);
    return { ...DEFAULT_PROJECT_CONFIG };
  }
}

function saveProjectConfig(config) {
  const merged = { ...DEFAULT_PROJECT_CONFIG, ...config };

  try {
    localStorage.setItem(PROJECT_CONFIG_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("[project-config] 保存失敗:", e.message);
  }

  appState.meta.projectTitle = buildProjectTitle(merged);
  scheduleSave();
  return merged;
}

function buildProjectTitle(config = getProjectConfig()) {
  return [
    normalizeKeyPart(config.os, "ai-video-os"),
    normalizeKeyPart(config.team, "internal"),
    normalizeKeyPart(config.project, "default"),
    normalizeKeyPart(config.role, "owner"),
    normalizeKeyPart(config.range, "step-01-14"),
    normalizeKeyPart(config.member, "kazu")
  ].join("::");
}

function getProjectTitle() {
  return buildProjectTitle(getProjectConfig());
}
function initSupabase() {
  // URL/KEY が未設定なら Supabase を使わず localStorage のみで動作
  if (
    SUPABASE_URL === "YOUR_SUPABASE_URL" ||
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
  ) {
    console.warn("[supabase] URL/KEY が未設定です。ローカルモードで動作します。");
    loadFromCache();
    return;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[supabase] クライアント初期化完了");
    loadProject();
  } catch (e) {
    console.error("[supabase] 初期化失敗:", e);
    loadFromCache();
  }
}

// ------------------------------------------------------------
// キャッシュ（localStorage）
// ※ GitHub Pages + iframe 環境では制限される場合があります
// ------------------------------------------------------------
function saveToCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(appState));
  } catch (e) {
    // localStorage が使えない環境ではメモリのみで動作
    console.warn("[cache] localStorage 書き込み失敗（メモリのみ）:", e.message);
  }
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      Object.assign(appState, JSON.parse(raw));
      console.log("[cache] キャッシュ復元完了");
    }
  } catch (e) {
    console.warn("[cache] キャッシュ読み込み失敗:", e.message);
  }
  // UIが存在すれば再描画
  if (typeof renderUI === "function") renderUI();
}

// ------------------------------------------------------------
// Supabase 保存
// ------------------------------------------------------------
async function saveProject() {
  // 同期時刻を更新
  appState.meta.updatedAt = new Date().toISOString();
  appState.meta.projectTitle = getProjectTitle();
  // まずキャッシュに書く（クラウド失敗時の保険）
  saveToCache();
  
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .upsert(
        {
          title:      appState.meta.projectTitle,
          data:       appState,
          updated_at: appState.meta.updatedAt
        },
        { onConflict: "title" }   // title を一意キーとして upsert
      );

    if (error) throw error;

    console.log("[supabase] 保存完了:", appState.meta.updatedAt);
    showSyncStatus("saved");
  } catch (e) {
    console.error("[supabase] 保存失敗:", e);
    showSyncStatus("error");
  }
}

// ------------------------------------------------------------
// Supabase 読み込み
// ------------------------------------------------------------
async function loadProject() {
  // まずキャッシュで先行表示
  loadFromCache();

  if (!supabaseClient) return;
  
  const projectTitle = getProjectTitle();
  
  try {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("*")
      .eq("title", projectTitle)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data?.data) {
      // クラウドデータがキャッシュより新しければ上書き
      const cloudTime  = new Date(data.data?.meta?.updatedAt ?? 0);
      const cacheTime  = new Date(appState.meta?.updatedAt   ?? 0);

      if (cloudTime >= cacheTime) {
        Object.assign(appState, data.data);
        saveToCache();
        console.log("[supabase] クラウドから最新データを取得");
      } else {
        console.log("[supabase] キャッシュの方が新しいため保持");
      }
    }
  } catch (e) {
    console.error("[supabase] 読み込み失敗（キャッシュで継続）:", e);
  }

  if (typeof renderUI === "function") renderUI();
}

// ------------------------------------------------------------
// Autosave（debounce 3秒）
// ------------------------------------------------------------
let _saveTimer = null;

function scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => saveProject(), 3000);
}

// ------------------------------------------------------------
// 同期ステータス表示（#sync-status 要素があれば更新）
// ------------------------------------------------------------
function showSyncStatus(status) {
  const el = document.getElementById("sync-status");
  if (!el) return;

  const map = {
    saved:  { text: "✓ 保存済み",            cls: "status-saved"  },
    saving: { text: "⟳ 保存中…",            cls: "status-saving" },
    error:  { text: "✕ クラウド同期失敗（ローカル保存中）", cls: "status-error"  },
    local:  { text: "📱 ローカルモード",       cls: "status-local"  }
  };

  const s = map[status] ?? map.local;
  el.textContent  = s.text;
  el.className    = `sync-status ${s.cls}`;
}

// ------------------------------------------------------------
// appState へのヘルパー（各ページから使う）
// ------------------------------------------------------------

/** ツールリンク保存 */
function saveToolLinks(links) {
  appState.tools = links;
  scheduleSave();
}

/** ブランドDB 保存 */
function saveBrandDB(brandData) {
  appState.brandDB = brandData;
  scheduleSave();
}

/** ログ追記 */
function appendLog(entry) {
  appState.logs.unshift({ ...entry, ts: new Date().toISOString() });
  if (appState.logs.length > 500) appState.logs.length = 500; // 上限
  scheduleSave();
}

/** 設定保存 */
function saveSettings(settings) {
  Object.assign(appState.settings, settings);
  scheduleSave();
}

console.log("[supabase.js] モジュール読み込み完了");
