# Supabase 導入手順（MVP版）

## 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) でサインイン
2. **New Project** → 名前: `ai-video-os` → Region: **Northeast Asia (Tokyo)**
3. パスワードを設定してプロジェクト作成

---

## 2. テーブル作成（SQL Editor）

1. Supabase ダッシュボード → **SQL Editor**
2. `supabase-setup.sql` の内容を貼り付けて **Run**
3. Table Editor に `projects` テーブルが作成されたことを確認

---

## 3. RLS を OFF にする（MVP）

1. **Table Editor** → `projects` テーブルを選択
2. **RLS** の項目を **Disable** に設定

---

## 4. API キー取得

1. **Settings** → **API**
2. 以下をコピー:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` キー → `SUPABASE_ANON_KEY`

---

## 5. supabase.js を編集

```js
// supabase.js の先頭部分を編集
const SUPABASE_URL      = "https://xxxx.supabase.co";   // ← 実際のURLに変更
const SUPABASE_ANON_KEY = "eyJh....";                   // ← 実際のキーに変更
```

---

## 6. 各 HTML ファイルに統合

### `<head>` 内に追加（config.js より後）

```html
<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- OS 統合モジュール -->
<script src="./supabase.js"></script>
```

### 同期ステータス表示バッジ（任意）

```html
<span id="sync-status" class="sync-status"></span>
```

```css
.sync-status       { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.status-saved      { color: #437a22; background: #d4dfcc; }
.status-saving     { color: #7a7974; background: #f3f0ec; }
.status-error      { color: #a12c7b; background: #e0ced7; }
.status-local      { color: #006494; background: #c6d8e4; }
```

### DOMContentLoaded で初期化

```js
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
  // ... 既存の初期化処理
});
```

### フォーム変更時に autosave

```js
document.querySelectorAll("input, textarea, select").forEach(el => {
  el.addEventListener("change", scheduleSave);
});
```

---

## 7. スマホ対応（viewport 追加）

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

```css
button         { min-height: 48px; }
input,
textarea,
select         { font-size: 16px; }  /* iPhone ズーム防止 */
```

---

## MVP 完成チェックリスト

- [ ] `supabase-setup.sql` を Supabase SQL Editor で実行済み
- [ ] RLS を OFF に設定済み
- [ ] `supabase.js` に URL/KEY を入力済み
- [ ] 各 HTML に Supabase CDN + supabase.js を追加済み
- [ ] `initSupabase()` を DOMContentLoaded で呼び出している
- [ ] スマホで編集できる（viewport + 48px ボタン）
- [ ] 再アクセス時にデータが復元される
- [ ] GitHub Pages で動作確認済み

---

## 将来拡張メモ

| 機能 | 対応方法 |
|---|---|
| ユーザー認証 | Supabase Auth + user_id カラム追加 |
| 複数ワークスペース | workspace カラム追加 |
| テンプレート共有 | marketplace テーブル追加 |
| 共同編集 | Supabase Realtime 購読 |
| FC管理 | fc_members テーブル + RLS |
