-- ============================================================
-- supabase-setup.sql
-- Supabase SQL Editor で実行してください
-- ============================================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS projects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text UNIQUE,           -- MVP: title をキーに upsert
  data       jsonb,                  -- アプリ状態を丸ごと保存
  updated_at timestamptz DEFAULT now()
);

-- updated_at を自動更新するトリガー（オプション）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at ON projects;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- インデックス（将来の拡張用）
CREATE INDEX IF NOT EXISTS idx_projects_title      ON projects (title);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects (updated_at DESC);

-- tool_links table for shared os_tool_links.
-- Do not store tool links in projects.data JSONB.
CREATE TABLE IF NOT EXISTS tool_links (
  id          text PRIMARY KEY,
  project_key text NOT NULL DEFAULT 'default',
  step_id     integer NOT NULL,
  step_title  text,
  media       text NOT NULL,
  name        text NOT NULL,
  url         text NOT NULL,
  category    text DEFAULT '',
  note        text DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  enabled     boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_tool_links_updated_at ON tool_links;
CREATE TRIGGER trg_tool_links_updated_at
  BEFORE UPDATE ON tool_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tool_links_project_step_media
  ON tool_links (project_key, step_id, media, sort_order);

CREATE INDEX IF NOT EXISTS idx_tool_links_updated_at
  ON tool_links (updated_at DESC);

-- production_states table for shared aiVideoOsProductionState.
-- Do not store production state in projects.data JSONB.
CREATE TABLE IF NOT EXISTS production_states (
  project_key text PRIMARY KEY DEFAULT 'default',
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_production_states_updated_at ON production_states;
CREATE TRIGGER trg_production_states_updated_at
  BEFORE UPDATE ON production_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- video_assets table for STEP4 Drive asset metadata.
-- Image binaries are stored in Google Drive; Supabase stores metadata only.
CREATE TABLE IF NOT EXISTS video_assets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_title     text NOT NULL,
  video_id          text NOT NULL,
  lot_id            text,
  sort_order        integer,
  drive_file_id     text,
  drive_url         text,
  image_uploaded_at timestamptz,
  asset_json        jsonb,
  script_raw        text,
  shot_count        integer,
  status            text NOT NULL DEFAULT 'draft',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_title, video_id)
);

DROP TRIGGER IF EXISTS trg_video_assets_updated_at ON video_assets;
CREATE TRIGGER trg_video_assets_updated_at
  BEFORE UPDATE ON video_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_video_assets_project_lot_order
  ON video_assets (project_title, lot_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_video_assets_updated_at
  ON video_assets (updated_at DESC);

-- ============================================================
-- RLS（Row Level Security）
-- MVP では OFF のまま。有効化する場合は以下をコメント解除。
-- ============================================================
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_all" ON projects FOR ALL USING (true);

-- 動作確認用クエリ（実行後に確認）
-- SELECT * FROM projects;
