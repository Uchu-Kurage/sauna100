-- サウナマップ DB スキーマ拡張 (詳細版)

-- 既存のテーブルをドロップして再作成（開発初期段階につき）
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS saunas;

-- 拡張されたサウナ施設テーブル
CREATE TABLE saunas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  source_id TEXT UNIQUE,     -- 収集元の識別子
  
  -- 1. 基本情報・施設属性
  category TEXT,             -- サウナ専用, スーパー銭湯, 銭湯, プライベート, etc
  opening_hours TEXT,
  regular_holidays TEXT,
  has_midnight_access BOOLEAN DEFAULT FALSE,
  has_ladies_day BOOLEAN DEFAULT FALSE,
  base_fee INTEGER,
  sauna_extra_fee INTEGER,
  towel_fee INTEGER,
  has_time_limit BOOLEAN DEFAULT FALSE,

  -- 2. サウナ室の詳細スペック
  temp REAL,              -- 設定温度
  humidity_eval TEXT,        -- 高い, 普通, カラカラ
  stove_type TEXT,           -- 遠赤外線, ガス, 薪, iki, etc
  stone_type TEXT,           -- 香花石, 溶岩石, etc
  autoloyly_freq TEXT,       -- 15分ごと, 30分ごと, etc
  has_self_loyly BOOLEAN DEFAULT FALSE,
  aufguss_schedule TEXT,
  capacity INTEGER,
  levels INTEGER,
  has_tv BOOLEAN DEFAULT FALSE,
  bgm_type TEXT,
  brightness TEXT,           -- 暗め, 普通, 明るい
  mat_type TEXT,             -- ビート板, 使い捨て, etc
  has_hat_hook BOOLEAN DEFAULT FALSE,

  -- 3. 水風呂の詳細スペック
  water_temp REAL,           -- 水温
  is_single BOOLEAN GENERATED ALWAYS AS (water_temp < 10) STORED, -- 10度未満
  water_quality TEXT,        -- 天然水, 地下水, etc
  water_hardness TEXT,       -- 軟水, 硬水
  chlorine_smell TEXT,       -- 強い, 弱い, なし
  depth INTEGER,             -- 水深 (cm)
  bathtub_capacity INTEGER,
  has_vibra BOOLEAN DEFAULT FALSE,

  -- 4. 外気浴・休憩環境
  has_outdoor_space BOOLEAN DEFAULT FALSE,
  has_indoor_rest_space BOOLEAN DEFAULT FALSE,
  infinity_chair_count INTEGER DEFAULT 0,
  adirondack_chair_count INTEGER DEFAULT 0,
  deck_chair_count INTEGER DEFAULT 0,
  bench_count INTEGER DEFAULT 0,
  flow_line_steps INTEGER,   -- サウナ→水風呂→休憩の歩数

  -- 5. 施設内サービス・運営体制
  crowd_sensor BOOLEAN DEFAULT FALSE,
  crowd_trend TEXT,
  silence_level TEXT,        -- 黙欲徹底, 賑やか
  staff_round_freq TEXT,
  group_tendency TEXT,       -- お一人様, グループ多め
  reservation_type TEXT,     -- 不要, 一部必要, 完全予約
  tattoo_policy TEXT,        -- OK, カバー必須, NG

  -- 6. 付帯設備・アメニティ
  cleanliness_score REAL,    -- 5点満点
  has_restaurant BOOLEAN DEFAULT FALSE,
  special_menu TEXT,
  has_oropo BOOLEAN DEFAULT FALSE,
  has_workspace BOOLEAN DEFAULT FALSE,
  wifi_available BOOLEAN DEFAULT FALSE,
  power_available BOOLEAN DEFAULT FALSE,
  dryer_model TEXT,
  amenity_quality TEXT,

  -- 7. 社会的評価・露出度
  media_mentions TEXT,
  sauna_ikitai_likes INTEGER DEFAULT 0,
  sauna_ikitai_activities INTEGER DEFAULT 0,
  sns_hashtag_count INTEGER DEFAULT 0,

  description TEXT,
  official_url TEXT,
  prefecture TEXT,                -- 都道府県
  is_legendary BOOLEAN DEFAULT FALSE, -- 人生で1度はいきたい100のサウナフラグ
  is_active BOOLEAN DEFAULT TRUE,    -- 論理削除フラグ
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 前回の訪問記録テーブル（再作成）
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT auth.uid(), -- Supabaseの認証ユーザーIDに合わせる
  sauna_id UUID REFERENCES saunas(id),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  totonoi_status TEXT CHECK (totonoi_status IN ('tototta', 'not_tototta')), -- 整ったかどうか
  totonoi_score INTEGER CHECK (totonoi_score >= 0 AND totonoi_score <= 100), -- 整いスコア
  memo TEXT,
  image_url TEXT,
  UNIQUE(sauna_id)
);

-- RLS (Row Level Security) の設定
-- 開発をスムーズにするため、今回は全てのセキュリティを無効化、または全許可設定にします。
ALTER TABLE saunas DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;

-- Storage のバケット作成とポリシー設定
-- ※ すでにコンソールから作成済みの場合は、ポリシー部分のみが適用されます
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sauna-photos', 'sauna-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 写真の閲覧を許可
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'sauna-photos' );

-- 写真のアップロードを許可
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'sauna-photos' );

-- 写真の更新を許可
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'sauna-photos' );
