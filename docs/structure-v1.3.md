# AI動画事業OS — AIエージェント実装手順書 兼 構造設計書 v1.3

**作成日：** 2026年5月8日  
**バージョン：** v1.3（v1.2からの差分：命名規則・関数設計・デバッグ・CSS原則・AIレビュー手順を追加）  
**対象：** Phase 1 実装（config.js / admin.html / index.html / wizard.html / log.html）  
**前提ドキュメント：** 思想書 兼 要件定義書 v1.2

---

> **実装方針：** 一気に完成を狙わない。MVP → 修正 → 再生成 のサイクルで進める。

---

## 0. AIエージェントへの大原則（最初に必ず読ませること）

### 0.1 実装禁止事項（絶対厳守）

| 禁止事項 | 理由 |
|---------|------|
| React / Vue / Svelte などのフレームワーク使用 | Phase 1はVanilla JSのみ |
| npm / yarn / pnpm などのパッケージマネージャー使用 | ビルド環境不要 |
| Webpack / Vite / Rollup などのビルドツール使用 | 単一HTMLで動くこと |
| TypeScript の使用 | Phase 1スコープ外 |
| Firebase / Supabase などの外部DB追加 | localStorage以外禁止 |
| localStorage 以外での状態永続化 | sessionStorage含む |
| バックエンド（Node.js / Python等）の追加 | 静的ファイルのみ |
| 指定されていない機能の追加 | スコープ厳守 |
| 既存の動作コードの全置換 | 部分修正のみ |
| デザインの大幅変更 | 指定がなければ維持 |
| 責務をまたいだ処理の記述 | 各ファイルの責務を守る |
| Tailwind / Bootstrap などのCSSフレームワーク | CSS原則参照 |
| utility classの多用 | CSS原則参照 |

### 0.2 エージェント暴走対策ルール

```
✅ まず最小構成で動作確認する（動いてから機能追加）
✅ 指定された機能のみ実装する（追加機能は禁止）
✅ 各STEP完了後に「何を作ったか」をリストで報告させる
✅ 修正依頼は部分修正として指示する（全体再生成しない）
✅ 既存コードへの変更は差分（追加・変更・削除）として明示させる
```

### 0.3 UI優先順位（Phase 1）

| 順位 | 優先項目 | 意味 |
|------|---------|------|
| 1位 | **迷わない** | 次に何をすべきか、0.5秒で分かる |
| 2位 | **モバイル対応** | 375px幅で全機能が使える |
| 3位 | **軽い** | CDN以外の依存なし・即時ロード |
| 4位 | **高級感** | ダークモード・整ったタイポグラフィ |
| 5位 | **アニメーション** | 完了演出のみ・過剰演出禁止 |

> AIが派手なUIに走りそうな場合は「優先順位1〜3を守ること」と再指示する。

### 0.4 状態管理原則

| 原則 | 内容 |
|------|------|
| **単一source of truth** | `session` オブジェクトを唯一の状態源とする |
| **STEP管理の一元化** | `currentStepIndex` 1つでSTEPを管理する（複数変数で持たない） |
| **localStorageは永続化のみ** | UIの一時状態をlocalStorageに入れない |
| **UI状態の分散禁止** | 同じ状態を複数箇所で持たない（二重管理しない） |
| **読み込みは起動時1回** | localStorageからの読み込みはページロード時のみ |

---

## 0.5 命名規則（全ファイル共通）

AIは放置すると命名が崩れる。以下を全ファイルに統一適用すること。

| 対象 | ルール | 例 |
|------|--------|-----|
| 定数（変更しない値） | `UPPER_SNAKE_CASE` | `ADMIN_PASSWORD`, `STORAGE_KEYS` |
| 状態・変数 | `camelCase` | `currentStepIndex`, `stepStartedAt` |
| 関数名 | `camelCase`（動詞始まり） | `loadToolLinks()`, `renderPhaseB()` |
| DOM の id属性 | `kebab-case` | `step-title`, `tool-list`, `complete-btn` |
| DOM の class属性 | `kebab-case` | `phase-a`, `tool-link-item`, `progress-bar` |
| localStorage のキー | `snake_case` | `os_tool_links`, `os_session` |
| Boolean変数 | `is` / `has` プレフィックス | `isCompleted`, `hasTools`, `isSkippable` |
| イベントハンドラ | `on` + 動詞 | `onStartClick()`, `onCompleteClick()` |

**禁止：**
- 略語の乱用（`idx` → `index`, `btn` → `button` ※ただしDOMのidでは`-btn`は許容）
- 意味のない変数名（`data`, `item`, `temp`, `x`）
- 型を名前に入れる（`stepArray` → `steps`, `toolObject` → `tool`）

---

## 0.6 関数設計ルール

保守性を保つための関数粒度ルール。AIは巨大関数を生成しがちなので明示する。

```
原則1：1関数1責務
  ❌ initWizard() の中でDOM操作・状態更新・localStorage読み込みを全部やる
  ✅ loadSession() / renderPhaseA() / bindEvents() に分ける

原則2：50行超えたら分割を検討する
  50行を超えた関数は複数の責務を持っている可能性が高い。
  分割できない場合はコメントでセクションを明示する。

原則3：DOM操作と状態更新を分離する
  ❌ function completeStep() {
       session.logs.push(...);        // 状態更新
       document.querySelector(...);  // DOM操作
       localStorage.setItem(...);    // 永続化
     }
  ✅ function updateSessionLog(logEntry) { ... }   // 状態更新のみ
     function renderPhaseC() { ... }               // DOM操作のみ
     function saveToolLinks(links) { ... }         // localStorage操作のみ

原則4：localStorage操作を専用関数に集約する
  ✅ function getToolLinks() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOOL_LINKS)) || {}; }
  ✅ function setToolLinks(links) { localStorage.setItem(STORAGE_KEYS.TOOL_LINKS, JSON.stringify(links)); }
  直接 localStorage.getItem / setItem を各所に書かない。
```

---

## 0.7 デバッグルール（console.logプレフィックス統一）

AIはconsole.logもバラバラに書く。以下のプレフィックスで統一する。

```javascript
// プレフィックス形式：[ファイル名] イベント/状態
console.log("[config] STEPS loaded:", STEPS.length);
console.log("[admin] tool added:", newTool);
console.log("[admin] localStorage saved");
console.log("[index] URL params generated:", url);
console.log("[wizard] session initialized:", session);
console.log("[wizard] PHASE_A started, stepId:", currentStep.id);
console.log("[wizard] PHASE_A → PHASE_B, startedAt:", session.stepStartedAt);
console.log("[wizard] PHASE_B → PHASE_C, durationMinutes:", log.durationMinutes);
console.log("[wizard] PHASE_C → next step, logs count:", session.logs.length);
console.log("[wizard] all steps complete → log.html");
console.log("[log] session received:", session);
console.log("[log] TSV copied, rows:", session.logs.length);

// エラー系
console.error("[wizard] URL params invalid, redirecting to index.html");
console.error("[wizard] tool links not found for stepId:", stepId);
console.warn("[admin] import failed: invalid JSON format");
```

**ルール：**
- `console.log` は開発時のみ（Phase 2以降で除去する前提）
- `console.error` はユーザーに見えないエラー（バグ調査用）
- `console.warn` は「動くけど想定外」の状態
- 本番環境に向けては `// TODO: remove in production` コメントを付ける

---

## 0.8 CSS原則

後で崩れにくいCSS設計ルール。

```
原則1：utility class禁止
  ❌ <div class="flex items-center gap-4 p-3 bg-gray-800">
  ✅ <div class="tool-link-item">
     .tool-link-item { display:flex; align-items:center; gap:var(--space-4); ... }

原則2：1コンポーネント1クラス群
  コンポーネントに親クラスを1つ付け、子要素は子セレクタで管理する。
  ✅ .phase-b { ... }
     .phase-b .tool-list { ... }
     .phase-b .tool-link-item { ... }
     .phase-b .complete-btn { ... }

原則3：z-index固定表（これを守ること）
```

| レイヤー | z-index値 | 対象要素 |
|---------|----------|---------|
| ベース | 0 | 通常コンテンツ |
| オーバーレイ背景 | 100 | モーダル背景・暗幕 |
| モーダル本体 | 200 | モーダルダイアログ |
| トースト通知 | 300 | 「コピーしました！」等 |
| ローディング | 400 | 全画面ローディング |

```
原則4：color tokenのみ使用（ハードコード禁止）
  ❌ color: #e1306c;
  ✅ color: var(--color-instagram);

  定義するCSS変数（:root）：
  --color-bg: #101011
  --color-surface: #171717
  --color-surface-2: #1f1f20
  --color-border: rgba(255,255,255,0.08)
  --color-text: #f5f5f5
  --color-text-muted: #888888
  --color-primary: #4f98a3
  --color-success: #6daa45
  --color-error: #dd6974
  --color-instagram: #E1306C
  --color-tiktok: #69C9D0
  --color-youtube: #FF0000
  --space-1: 4px  / --space-2: 8px  / --space-3: 12px
  --space-4: 16px / --space-6: 24px / --space-8: 32px
  --radius-sm: 6px / --radius-md: 10px / --radius-lg: 16px
  --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1)

原則5：レスポンシブはmobile-first
  基本スタイルは375px向けに書き、@media(min-width:768px)で上書きする。
```

---

## 0.9 AIレビュー手順（実装 → レビューの2段階）

実装AIとレビューAIを分離することで品質を上げる。

### レビュープロセス

```
STEP 1：実装AIが1画面を完成させる
  ↓
STEP 2：レビューAIに以下を投入する（別チャット or 別セッション）
  ↓
STEP 3：レビュー結果をもとに修正指示を出す
  ↓
STEP 4：DoDチェックリストを通過したら次の画面へ
```

### レビューAIへの指示テンプレート

```
以下のコードをレビューしてください。

【確認してほしいこと】
1. 責務違反している箇所（本来別ファイルに書くべき処理が混入していないか）
2. 命名規則違反（構造設計書 Section 0.5 の規則に従っているか）
3. 状態管理原則違反（session以外の場所で状態を持っていないか）
4. 1関数50行超え・複数責務の関数がないか
5. localStorage への直接アクセスが専用関数を使わずに書かれていないか
6. console.logのプレフィックスが統一されているか
7. ハードコードされたカラーコード・スペースがないか（CSS変数を使うべき箇所）
8. 禁止事項（React・npm・TypeScript等）が混入していないか

【出力形式】
- 問題あり：ファイル名・行番号・問題の内容・修正案
- 問題なし：「OK」と記載
- 最後に「実装禁止事項の違反：あり / なし」を明記すること

【コード】
（ここにコードを貼り付ける）
```

### チェック項目別レビュー指示

```
// 責務チェックのみ
「このコードで、wizard.htmlの責務（状態管理・PHASE遷移・時刻記録）以外の
処理が書かれている箇所を全て列挙してください。」

// 命名規則チェックのみ
「このコードの命名規則違反を全て列挙してください。
ルール：定数=UPPER_SNAKE_CASE, 変数=camelCase, 
DOM id=kebab-case, Boolean=is/hasプレフィックス」

// 状態管理チェックのみ
「session オブジェクト以外で状態を持っている箇所を全て列挙してください。
localStorageへの直接アクセスも指摘してください。」
```

---

## 1. 画面遷移図

### 1.1 全体フロー

```
[admin.html] 管理画面（設計者のみ）
  ツールリンクのCRUD → localStorage に保存
  ↓ 設定済み後

[index.html] スタート画面
  ユーザー名・プロジェクト名・媒体・熟練度・STEP範囲を入力
  ↓ 「開始する」
  wizard.html?user=Aさん&project=instagram&steps=5-9&level=beginner

[wizard.html] 作業ウィザード
  [PHASE A] 工程確認 → 「開始する」→ 開始時刻記録
  [PHASE B] ツールリンク → 「完了」→ 終了時刻記録
  [PHASE C] 振り返り → 「次へ」→ session.logsにpush
  ↓
  次のSTEPがある → wizard.html（次STEP）
  全STEP完了   → log.html

[log.html] ログ確認・TSV出力
  → TSVコピー → スプレッドシートへ貼り付け
  → 新しいセッション → index.html
```

### 1.2 エラー・離脱パターン

```
URLパラメータ不正    → index.htmlへリダイレクト＋エラーメッセージ
ツールリンク未設定   → 「管理画面でリンクを設定してください」＋admin.htmlリンク
ブラウザ閉じ・離脱  → Phase 1はデータ消滅（Phase 2以降で対応）
```

---

## 2. Definition of Done（完成条件）

**各画面の完成条件を満たして初めて次のSTEPへ進む。**

### config.js

- [ ] `ADMIN_PASSWORD` が定義されている
- [ ] `MEDIA_TYPES`（4媒体）が定義されている
- [ ] `LEVELS`（3段階）が定義されている
- [ ] `STEPS` 配列に STEP 1〜14 が定義されている（toolsプロパティなし）
- [ ] `BRAND_DB` が定義されている
- [ ] `STORAGE_KEYS` 定数が定義されている
- [ ] `<script src="config.js">` で読み込んでコンソールエラーなし
- [ ] 命名規則：全定数が `UPPER_SNAKE_CASE`

### admin.html

- [ ] パスワード認証が動作する
- [ ] STEPドロップダウンが config.js の STEPS から動的生成されている
- [ ] 媒体タブ（Instagram / TikTok / YouTube）が切り替わる
- [ ] ツール追加・編集モーダルが動作する
- [ ] 保存したデータが localStorage の `os_tool_links` に書き込まれている
- [ ] 表示/非表示トグル・上下移動・削除が動作する
- [ ] JSONエクスポート・インポートが動作する
- [ ] 375px幅（モバイル）で全機能が使える
- [ ] localStorage操作が専用関数（`getToolLinks` / `setToolLinks`）経由になっている
- [ ] console.logに `[admin]` プレフィックスが付いている

### index.html

- [ ] 全フォーム入力後「開始する」で正しいURLパラメータが生成される
- [ ] URLコピー用テキストが表示される
- [ ] 管理画面リンクが admin.html に遷移する
- [ ] 375px幅（モバイル）でフォームが崩れない
- [ ] console.logに `[index]` プレフィックスが付いている

### wizard.html

- [ ] URLパラメータが正しく解析されて `session` が初期化される
- [ ] URLパラメータ不正時に index.html へリダイレクトされる
- [ ] PHASE A → B → C の遷移が動作する
- [ ] PHASE A「開始する」→ `session.stepStartedAt` が記録される
- [ ] PHASE B：localStorage から `os_tool_links` 読込・`enabled:true` のみ表示
- [ ] PHASE B：ツールリンクが `target="_blank"` で開く
- [ ] PHASE B：データなし → 「管理画面でリンクを設定してください」
- [ ] PHASE B「完了」→ `session.stepCompletedAt` 記録・`durationMinutes` 算出
- [ ] PHASE C：メモ入力（任意）→ `session.logs.push`
- [ ] 熟練度別UI（beginner/mid/pro）が切り替わる
- [ ] 全STEP完了後 → log.html へ session データが渡される
- [ ] 375px幅（モバイル）で全フェーズが崩れない
- [ ] DOM操作と状態更新が分離されている
- [ ] localStorage操作が専用関数経由になっている
- [ ] console.logに `[wizard]` プレフィックスが付いている

### log.html

- [ ] セッションデータが受け取れる（URLデコード）
- [ ] 全工程のログが一覧表示される
- [ ] 「TSVをコピー」でクリップボードにコピーされる
- [ ] TSV形式が正しい（タブ区切り・1行1工程・ヘッダーなし）
- [ ] コピー成功後に「コピーしました！」フィードバック（2秒後に消える）
- [ ] 「新しいセッションを開始」で index.html に遷移する
- [ ] 375px幅（モバイル）でログ一覧が崩れない
- [ ] console.logに `[log]` プレフィックスが付いている

---

## 3. リンク管理設計

### 3.1 設計方針

```
config.js    → 工程の「型」だけ定義（変わらないもの）
localStorage → ツールリンクを保存（常に変わるもの）
admin.html   → localStorage を管理するUI

理由：
・GEMs / GPTs / プロンプト集のURLは業務改善で常に更新される
・使用ツール自体も次世代ツールに切り替わる
・コード変更ゼロで管理者がリンクを更新できる設計
```

### 3.2 toolLinksSchema（データ構造）

```javascript
// localStorage キー："os_tool_links"（STORAGE_KEYS.TOOL_LINKS）
{
  "5": {
    stepId: 5,
    stepTitle: "台本・フレーム選択",
    tools: {
      instagram: [
        {
          id: "tool-001",
          name: "Gemini GEMs 台本生成",
          url: "https://gemini.google.com/gems/xxxx",
          category: "AI生成",
          note: "Instagramショート用プロンプト",
          order: 1,
          enabled: true
        }
      ],
      tiktok: [],
      youtube: []
    }
  }
}
```

### 3.3 localStorage専用関数（命名規則準拠）

```javascript
// ツールリンクの読み書きは必ずこの関数を経由する
function getToolLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOOL_LINKS)) || {};
  } catch (e) {
    console.error("[admin] getToolLinks failed:", e);
    return {};
  }
}

function setToolLinks(links) {
  localStorage.setItem(STORAGE_KEYS.TOOL_LINKS, JSON.stringify(links));
  console.log("[admin] localStorage saved");
}

// wizard.html 側の読み取り専用関数
function loadToolsForStep(stepId, media) {
  const links = getToolLinks();
  const stepLinks = links[String(stepId)];
  if (!stepLinks || !stepLinks.tools[media]) return [];
  return stepLinks.tools[media]
    .filter(tool => tool.enabled)
    .sort((a, b) => a.order - b.order);
}
```

---

## 4. config.js 構造定義

```javascript
// ============================================================
// config.js — 工程定義・熟練度・ブランドDB
// ツールリンクは localStorage（STORAGE_KEYS.TOOL_LINKS）で管理
// 命名規則：定数 = UPPER_SNAKE_CASE
// ============================================================

const ADMIN_PASSWORD = "os2026";  // TODO: Phase 2でバックエンド認証に移行

const STORAGE_KEYS = {
  TOOL_LINKS: "os_tool_links",
  SESSION:    "os_session"
};

const MEDIA_TYPES = {
  instagram: { label: "Instagram", color: "var(--color-instagram)" },
  tiktok:    { label: "TikTok",    color: "var(--color-tiktok)" },
  youtube:   { label: "YouTube",   color: "var(--color-youtube)" },
  other:     { label: "その他",    color: "var(--color-text-muted)" }
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
  {
    id: 1,
    title: "ジャンル選定",
    description: "市場調査・ニーズ分析・競合リサーチを行い、参入ジャンルを決定する。",
    estimatedMinutes: 60,
    allowedLevels: ["mid", "pro"],
    hasBrandCheck: false,
    skipReason: "ジャンルが既に決定済みの場合はスキップ可"
  },
  {
    id: 5,
    title: "台本・フレーム選択",
    description: "フレームワーク（SWRS / PREP / PASONA）を選択し、GEMsで台本を生成する。フック・本編・CTAの3部構成を必ず含める。",
    estimatedMinutes: 30,
    allowedLevels: ["beginner", "mid", "pro"],
    hasBrandCheck: true,
    skipReason: null
  }
  // 残りのSTEPは同様の構造で定義
];

const BRAND_DB = {
  worldview: "",
  temperature: "",
  tempo: "",
  ngWords: [],
  checkPoints: [
    "色調・キャラクターに統一感があるか",
    "冒頭3秒でターゲットの悩みに刺さっているか",
    "CTAは1つに絞られているか"
  ]
};

console.log("[config] STEPS loaded:", STEPS.length);
```

---

## 5. データ構造定義

### 5.1 セッションオブジェクト

```javascript
const session = {
  // 基本情報（URLパラメータから初期化・以後変更なし）
  id: "uuid-xxxx",
  startedAt: "2026-05-08T14:30:00",
  user: "Aさん",
  project: "instagram運用",
  media: "instagram",
  level: "beginner",
  stepsRange: [5, 6, 7, 8, 9],

  // 可変状態
  currentStepIndex: 0,
  currentPhase: "A",           // "A" | "B" | "C"
  isCompleted: false,

  // 時刻バッファ（STEP完了でlogsにpushされてリセット）
  stepStartedAt: null,
  stepCompletedAt: null,

  // ログ（append only）
  logs: [
    {
      stepId: 5,
      stepTitle: "台本・フレーム選択",
      startedAt: "2026-05-08T14:31:00",
      completedAt: "2026-05-08T14:58:00",
      durationMinutes: 27,
      isSkipped: false,
      memoFeeling: "",
      memoImprovement: "",
      memoBrand: ""
    }
  ]
};
```

### 5.2 TSV出力形式

```
// タブ区切り・1行1工程・ヘッダーなし
2026/05/08	Aさん	instagram運用	Instagram	5	台本・フレーム選択	初級者	14:31	14:58	27	フックが決まらなかった	先にフック3案作ってから	世界観は統一できた
```

---

## 6. UIワイヤーフレーム

### 6.1 admin.html

```
┌─────────────────────────────────────────┐
│  ⚙️ AI動画事業OS 管理画面               │
├─────────────────────────────────────────┤
│  パスワード: [__________]  [ログイン]   │
├─────────────────────────────────────────┤
│  [STEP5: 台本・フレーム選択 ▼]          │
│  [Instagram] [TikTok] [YouTube]         │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 1 ■ Gemini GEMs 台本生成          │  │
│  │   https://gemini.google.com/…     │  │
│  │   備考: Instagramショート用        │  │
│  │   [表示中 ▼] [編集] [↑][↓] [削除] │  │
│  ├───────────────────────────────────┤  │
│  │ 2 □ プロンプト集（Notion）（非表示）│  │
│  │   [非表示 ▼] [編集] [↑][↓] [削除] │  │
│  └───────────────────────────────────┘  │
│  [+ ツールを追加する]                   │
├─────────────────────────────────────────┤
│  [📤 エクスポート]  [📥 インポート]      │
│  [← 作業画面に戻る（index.html）]       │
└─────────────────────────────────────────┘
```

### 6.2 wizard.html — PHASE A

```
┌─────────────────────────────────────────┐
│  AI動画OS  Aさん / instagram / 初級      │
│  STEP 1/5  ████░░░░░░░░░░░░  20%        │
├─────────────────────────────────────────┤
│  05  台本・フレーム選択                  │
│  ─────────────────────────────────────  │
│  フレームワークを選択し、GEMsで台本生成  │
│  フック・本編・CTAの3部構成を含める。    │
│                                         │
│  ⏱ 推定時間：30分                       │
│  使用ツール：Gemini GEMs / ChatGPT GPTs │
│                                         │
│        [▶ 作業を開始する]               │
└─────────────────────────────────────────┘
```

### 6.3 wizard.html — PHASE B

```
┌─────────────────────────────────────────┐
│  AI動画OS  Aさん / instagram / 初級      │
│  STEP 1/5  ████░░░░░░░░░░░░  20%        │
│  ⏱ 開始: 14:31  経過: 12分              │
├─────────────────────────────────────────┤
│  05  台本・フレーム選択  作業中...       │
│  ┌───────────────────────────────────┐  │
│  │ 🔗 Gemini GEMs 台本生成      [開く]│  │
│  │    Instagramショート用プロンプト   │  │
│  ├───────────────────────────────────┤  │
│  │ 🔗 ChatGPT GPTs 台本v3       [開く]│  │
│  └───────────────────────────────────┘  │
│              [✅ 完 了]                  │
└─────────────────────────────────────────┘
```

### 6.4 wizard.html — PHASE C

```
┌─────────────────────────────────────────┐
│  STEP 5 完了 ✓   所要時間：27分          │
│  （完了演出）                           │
├─────────────────────────────────────────┤
│  気づいたことを残しておきましょう。（任意）│
│  💭 所感    [_____________________]     │
│  🔧 改善点  [_____________________]     │
│  🎨 ブランド [_____________________]    │
│                                         │
│  [スキップ]         [次のSTEPへ ▶]       │
└─────────────────────────────────────────┘
```

### 6.5 log.html

```
┌─────────────────────────────────────────┐
│  作業ログ  Aさん / 2026-05-08           │
│  ✅ 全STEP完了  総所要時間：106分        │
├─────────────────────────────────────────┤
│  STEP  工程名          時間   状態       │
│  05    台本・フレーム  27分   ✅         │
│  06    AI動画生成      42分   ✅         │
├─────────────────────────────────────────┤
│  [📋 TSVをコピー]                        │
│  [🔄 新しいセッションを開始]             │
└─────────────────────────────────────────┘
```

---

## 7. コンポーネント責務定義

| ファイル | 責務 | 禁止事項 | 変更頻度 |
|---------|------|---------|---------|
| `config.js` | 工程定義・熟練度・ブランドDB構造 | UIの状態を持たない | 低 |
| `admin.html` | ツールリンクのCRUD・JSON入出力 | sessionを操作しない | 低 |
| `index.html` | セッション初期化・URLパラメータ生成 | localStorage読み書き禁止 | 低 |
| `wizard.html` | 状態管理・PHASE遷移・時刻記録・ツール読込 | ツールリンクの編集禁止 | 低 |
| `log.html` | ログ一覧表示・TSV生成・コピー | sessionの書き換え禁止（読取専用） | 低 |
| **localStorage** | **ツールリンクデータ管理** | — | **高** |

---

## 8. AIエージェント実装手順書

### 8.1 実装ステップ（推奨順）

| # | ファイル | 実装後の確認 | レビュー |
|---|---------|------------|---------|
| 1 | config.js | コンソールエラーなし | 命名規則チェック |
| 2 | admin.html | ツール追加→localStorage確認 | 責務・localStorage関数チェック |
| 3 | index.html | URLパラメータ生成確認 | 命名規則チェック |
| 4 | wizard.html（A/B） | 遷移・時刻記録確認 | 状態管理・責務チェック |
| 5 | wizard.html（C） | ログpush・遷移確認 | 同上 |
| 6 | log.html | TSV形式確認 | 命名規則チェック |
| 7 | 結合テスト | 全DoDチェック通過 | 全体レビュー |

---

### STEP 1：config.js

```
以下の構造設計書をもとに config.js を作成してください。

【絶対禁止】
- React / npm / TypeScript / ビルドツール 使用禁止
- ツールリンクを config.js に含めない

【命名規則（必ず守ること）】
- 定数：UPPER_SNAKE_CASE
- Boolean値を持つプロパティ：is / has プレフィックス
- 構造設計書 Section 0.5 の命名規則に全て従うこと

【完成条件】Section 2 の config.js DoDを全て満たすこと
【実装後】命名規則レビューを実施すること（Section 0.9参照）
```

---

### STEP 2：admin.html

```
config.js が完成しました（添付）。
次に admin.html を作成してください。

【絶対禁止】
- React / npm / TypeScript / ビルドツール / Tailwind 使用禁止
- localStorage への直接アクセス禁止
  → 必ず getToolLinks() / setToolLinks() 関数を定義して経由すること

【関数設計ルール（必ず守ること）】
- 1関数1責務・50行超えたら分割
- DOM操作と状態更新を分離
- localStorage操作は専用関数（getToolLinks / setToolLinks）のみ

【CSS原則（必ず守ること）】
- utility class禁止・1コンポーネント1クラス群
- color token（CSS変数）のみ使用・ハードコードのカラーコード禁止
- z-index：モーダル=200, トースト=300

【デバッグルール】
- console.logは全て [admin] プレフィックスで統一

【完成条件】Section 2 の admin.html DoDを全て満たすこと
【実装後】責務・localStorage関数・命名規則レビューを実施すること
```

---

### STEP 3：index.html

```
config.js と admin.html が完成しました（添付）。
index.html を作成してください。

【絶対禁止】React / npm / TypeScript / localStorage操作
【デバッグルール】console.logは全て [index] プレフィックス
【完成条件】Section 2 の index.html DoDを全て満たすこと
```

---

### STEP 4：wizard.html

```
config.js・admin.html・index.html が完成しました（添付）。
wizard.html を作成してください。

【絶対禁止】
- React / npm / TypeScript / Tailwind 使用禁止
- session 以外に状態変数を持たない
- localStorage への直接アクセス禁止（loadToolsForStep関数を使うこと）
- PHASE A/B/C 以外の画面を追加しない

【状態管理原則（必ず守ること）】
- session を唯一の状態源とする
- currentStepIndex 1つでSTEP管理
- DOM操作と状態更新を必ず分離する

【関数命名規則（例）】
- renderPhaseA() / renderPhaseB() / renderPhaseC()  ← DOM操作
- onStartClick() / onCompleteClick()               ← イベントハンドラ
- updateSessionLog(logEntry)                       ← 状態更新
- loadToolsForStep(stepId, media)                  ← localStorage読込

【デバッグルール】console.logは全て [wizard] プレフィックス

【まず PHASE A と B のみ実装。PHASE Cは確認後に追加指示します。】
【完成条件】Section 2 の wizard.html DoDを全て満たすこと
【実装後】状態管理・責務・命名規則の全レビューを実施すること（最重要）
```

---

### STEP 5：log.html

```
wizard.html が完成しました（添付）。
log.html を作成してください。

【絶対禁止】session の書き換え（読み取り専用）
【デバッグルール】console.logは全て [log] プレフィックス
【完成条件】Section 2 の log.html DoDを全て満たすこと
```

---

### STEP 6：結合テスト

```
全画面実装完了後、以下の順で結合テストを実施する。

1. admin.html でSTEP5/instagramに2ツールを追加・保存
2. index.html で「Aさん/test/instagram/beginner/STEP5-6」で開始
3. wizard.html：STEP5確認 → 開始 → ツールリンク表示確認 → 完了
4. PHASE C：メモ入力 → 次へ → STEP6へ遷移確認
5. STEP6完了 → log.html遷移確認
6. log.html：ログ一覧確認 → TSVコピー → スプレッドシート貼り付け確認
7. 375px幅（Chrome DevTools）で全画面確認
8. admin.htmlで1ツールを非表示 → wizard.htmlで反映確認
9. admin.htmlでJSONエクスポート → インポートで復元確認

全テスト完了後、全DoDチェックリストを通過したら Phase 1 完成とする。
```

---

### 8.2 パターン別修正指示テンプレート

**リンクを変更したい場合（コーディング不要）：**
```
admin.html → 該当ツール「編集」→ URL変更 → 保存
```

**機能追加の依頼：**
```
[ファイル名] に [機能名] を追加してください。
他のファイル・既存機能は変更しないでください。
追加箇所：[具体的な場所]
完成条件：[何ができたら完了か]
```

**バグ修正の依頼：**
```
[ファイル名] の [具体的な症状] を修正してください。
修正範囲は [該当の関数名] のみにしてください。
他の機能・デザインは変更しないでください。
```

---

## 9. スプレッドシート「⏱️作業時間ログ」シート

| 列 | カラム名 | 型 |
|----|---------|-----|
| A | 日付 | DATE |
| B | ユーザー名 | TEXT |
| C | プロジェクト名 | TEXT |
| D | 媒体 | TAG |
| E | STEP番号 | NUM |
| F | 工程名 | TEXT |
| G | 熟練度 | TAG |
| H | 開始時刻 | TIME |
| I | 終了時刻 | TIME |
| J | 所要時間（分） | NUM（自動計算） |
| K | 所感メモ | TEXT |
| L | 改善点メモ | TEXT |
| M | ブランドメモ | TEXT |

---

## 付録. バージョン変更履歴

| バージョン | 主な変更内容 |
|-----------|------------|
| v1.0 | 初版。画面遷移・config.js構造・データ構造・ワイヤーフレーム・実装手順書 |
| v1.1 | リンク管理設計を全面改訂。admin.htmlをPhase 1に昇格 |
| v1.2 | DoD追加・実装禁止事項明文化・UI優先順位・状態管理原則・暴走対策追加 |
| v1.3 | **命名規則（0.5）・関数設計ルール（0.6）・デバッグルール（0.7）・CSS原則（0.8）・AIレビュー手順（0.9）を追加。config.jsにis/hasプレフィックス適用。localStorage専用関数のコード例を追加。実装手順書の各STEPに新規ルールを統合** |

---

*本ドキュメントは v1.3 確定版です。AIエージェントへの投入準備完了。*
