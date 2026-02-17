-- サウナマップ DB スキーマ設計 (PostgreSQL / Supabase 向け)

-- 1. サウナ施設テーブル
CREATE TABLE saunas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  temp INTEGER,              -- 理想のサウナ温度
  water_temp INTEGER,        -- 理想の水風呂温度
  has_air_bath BOOLEAN DEFAULT FALSE,
  has_auto_loyly BOOLEAN DEFAULT FALSE,
  description TEXT,
  official_url TEXT,
  source_id TEXT UNIQUE,     -- 収集元の識別子 (重複防止用)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ユーザー設定テーブル
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  ideal_temp INTEGER DEFAULT 90,
  ideal_water_temp INTEGER DEFAULT 16,
  needs_air_bath BOOLEAN DEFAULT TRUE,
  needs_auto_loyly BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 訪問記録テーブル
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  sauna_id UUID REFERENCES saunas(id),
  visited_at DATE DEFAULT CURRENT_DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  memo TEXT,
  UNIQUE(user_id, sauna_id) -- 同一ユーザーが同じ施設を重複登録しない（多重訪問は履歴で持つ場合別途設計）
);
