-- 複数ユーザー対応のための制約修正と RLS 有効化

-- 1. visits テーブルの制約修正
-- 既存の UNIQUE 制約を削除（制約名が不明な場合は drop constraint でエラーになるため、一旦テーブルを整理するのが確実）
-- 注意: 既存のデータがある場合、重複が発生する可能性がありますが、開発初期段階としてリセットを許容します。

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_sauna_id_key') THEN
        ALTER TABLE visits DROP CONSTRAINT visits_sauna_id_key;
    END IF;
END $$;

-- ユーザー ID と サウナ ID の組み合わせでユニークにする
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_user_sauna_unique;
ALTER TABLE visits ADD CONSTRAINT visits_user_sauna_unique UNIQUE(user_id, sauna_id);

-- 2. RLS (Row Level Security) の有効化
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 3. ポリシーの設定 (自分自身のデータのみアクセス可能)
DROP POLICY IF EXISTS "Users can see their own visits" ON visits;
CREATE POLICY "Users can see their own visits"
ON visits FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own visits" ON visits;
CREATE POLICY "Users can insert their own visits"
ON visits FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own visits" ON visits;
CREATE POLICY "Users can update their own visits"
ON visits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own visits" ON visits;
CREATE POLICY "Users can delete their own visits"
ON visits FOR DELETE
USING (auth.uid() = user_id);

-- 4. saunas テーブルは引き続き全ユーザー読み取り専用
ALTER TABLE saunas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public saunas are viewable by everyone" ON saunas;
CREATE POLICY "Public saunas are viewable by everyone"
ON saunas FOR SELECT
USING (true);
