# AI Video OS — AGENTS.md
# Last updated: 2026-05-08 v2.0（v1.3設計書対応）

## Project Overview
AI SNS Video Business OS. A web-based operational manual and workflow system for building
reproducible, data-driven AI video businesses on social platforms.

詳細仕様は以下を参照すること：
- 要件定義書：@docs/requirements-v1.2.md
- 構造設計書 兼 実装手順書：@docs/structure-v1.3.md

---

## Tech Stack
- Vanilla HTML / CSS / JavaScript（no build tools, no dependencies, no backend）
- Phosphor Icons（CDN）for icons
- Single HTML file per page（config.js を共通読み込み）

---

## Project Structure
```
ai-video-os/
  AGENTS.md                    <- このファイル：エージェント常時読込
  docs/
    requirements-v1.2.md       <- 思想書 兼 要件定義書
    structure-v1.3.md          <- 構造設計書 兼 実装手順書（DoD・命名規則・手順書）
    LAYOUT-STYLES.md           <- UIスタイル定義（参考）
  config.js                    <- 工程定義・熟練度・ブランドDB（ツールリンク含まない）
  admin.html                   <- ツールリンク管理（設計者専用）
  index.html                   <- セッション開始・URLパラメータ生成
  wizard.html                  <- 作業ウィザード（PHASE A/B/C・時刻記録）
  log.html                     <- 作業ログ確認・TSV出力
```

---

## 実装禁止事項（絶対厳守）
- React / Vue / Svelte などのフレームワーク使用禁止
- npm / yarn / Webpack / Vite などのパッケージ・ビルドツール禁止
- TypeScript 使用禁止
- Firebase / Supabase などの外部DB禁止
- localStorage 以外での状態永続化禁止
- Tailwind / Bootstrap などのCSSフレームワーク禁止（utility class禁止）
- 指定されていない機能の追加禁止
- 既存の動作コードの全置換禁止
- 責務をまたいだ処理の記述禁止

---

## 命名規則（全ファイル統一）
| 対象 | ルール | 例 |
|------|--------|-----|
| 定数 | UPPER_SNAKE_CASE | ADMIN_PASSWORD, STORAGE_KEYS |
| 状態・変数 | camelCase | currentStepIndex, stepStartedAt |
| 関数名 | camelCase（動詞始まり） | loadToolLinks(), renderPhaseB() |
| DOM id | kebab-case | step-title, complete-btn |
| localStorage key | snake_case | os_tool_links, os_session |
| Boolean変数 | is / has プレフィックス | isCompleted, hasTools |
| イベントハンドラ | on + 動詞 | onStartClick(), onCompleteClick() |

---

## 状態管理原則
- `session` オブジェクトを唯一のsource of truthとする
- `currentStepIndex` 1つでSTEP管理（複数変数で持たない）
- localStorage操作は必ず専用関数 `getToolLinks()` / `setToolLinks()` 経由
- UIの一時状態をlocalStorageに入れない
- localStorage読み込みはページロード時1回のみ

---

## 関数設計ルール
- 1関数1責務
- 50行超えたら分割を検討する
- DOM操作と状態更新を分離する
- localStorage操作を専用関数に集約する

---

## CSS原則
- utility class 禁止（Tailwindのクラス直書き禁止）
- 1コンポーネント1クラス群
- color token（CSS変数）のみ使用・ハードコードのカラーコード禁止
- z-index固定：ベース=0 / オーバーレイ=100 / モーダル=200 / トースト=300

---

## デバッグルール（console.logプレフィックス統一）
```
[config] ... / [admin] ... / [index] ... / [wizard] ... / [log] ...
```
- エラー：console.error("[ファイル名] ...")
- 想定外の動作：console.warn("[ファイル名] ...")

---

## UI優先順位（Phase 1）
1. 迷わない（次のアクションが0.5秒で分かる）
2. モバイル対応（375px幅で全機能使える）
3. 軽い（CDN以外の依存なし）
4. 高級感（ダークモード・整ったタイポグラフィ）
5. アニメーション（完了演出のみ・過剰禁止）

---

## エージェント暴走対策
- まず最小構成で動作確認する（動いてから機能追加）
- 各STEP完了後に「何を作ったか」をリストで報告する
- 修正は部分修正のみ（全体再生成しない）
- 既存コードへの変更は差分（追加・変更・削除）として明示する

---

## Color System（カラートークン）
```css
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
```

---

## 詳細仕様の参照先
| 内容 | ファイル |
|------|---------|
| 要件・思想・機能仕様 | @docs/requirements-v1.2.md |
| 構造図・DoD・ワイヤーフレーム・実装手順書 | @docs/structure-v1.3.md |
| AIレビュー手順・レビュー指示テンプレート | @docs/structure-v1.3.md Section 0.9 |
| 各画面の完成条件（DoD） | @docs/structure-v1.3.md Section 2 |
| 実装手順ステップ | @docs/structure-v1.3.md Section 8 |
