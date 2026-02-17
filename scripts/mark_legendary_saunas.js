/**
 * Legendary 100 Sauna Marker
 * 
 * 日本全国のサウナ施設から、特に有名・伝説的な100施設を選定し、
 * DBの is_legendary フラグを TRUE に設定します。
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 伝説のサウナ施設キーワード（部分一致で検索）
const legendaryNames = [
    "サウナしきじ", "かるまる", "北欧", "スカイスパYOKOHAMA", "黄金湯",
    "草加健康センター", "湯らっくす", "らかんの湯", "The Sauna", "白銀荘",
    "松本湯", "改良湯", "サウナセンター", "マルシンスパ", "タイムズ スパ・レスタ",
    "ウェルビー栄", "ウェルビー福岡", "ウェルビー今池", "神戸サウナ", "ニュージャパン梅田",
    "スパ ラクーア", "堀田湯", "渋谷SAUNAS", "サウナ東京", "ROOFTOP",
    "湯乃泉", "厚木健康センター", "満天の湯", "ゆいる", "大磯プリンスホテル",
    "サウナラボ", "御船山", "らかんの湯", "らかん", "ドーミーイン", // 代表的なビジホサウナも一部
    "カプセルプラス", "アダムアンドイブ", "サウナリゾートオリエンタル", "レインボー本八幡",
    "船橋グランドサウナ", "ジートピア", "スパメッツァ", "竜泉寺の湯",
    "神戸クアハウス", "なにわ健康ランド", "大東洋", "アムザ",
    "キャビナス", "グリーンランド", "サウナサン", "富山 伏見", "スパ・アルプス",
    "白山湯", "サウナの梅湯", "五香湯", "都湯", "サウナの聖地",
    "駒込 鶴の湯", "富士見湯", "十條湯", "妙法湯", "巣鴨湯",
    "パラダイス", "PARADISE", "サウナタウン", "朝日湯源泉",
    "クアパレス", "庭の湯", "染井吉野", "萩の湯", "寿湯",
    "えんび", "らかん", "サタデイズ", "サウナの鳥", "スカイスパ",
    "なにけん", "ヘルシー温泉タテバ", "白玉温泉", "延羽の湯",
    "ニュージャパン", "大垣サウナ", "田迎サウナ", "パブリックサウナ",
    "おふろcafe", "utatane", "スカイスパ", "スパラクーア",
    "ユーラシア", "舞浜ユーラシア", "アーバンクア", "龍の湯",
    "キャナルリゾート", "湯楽の里", "喜楽里", "極楽湯", "RAKU SPA",
    "サウナイーグル", "森のサウナ", "サウナピア", "フィンランドサウナ"
];

async function markLegendary() {
    console.log("🏆 伝説の100施設をマーク中...");
    let count = 0;

    // 全施設のフラグを一旦リセット（非伝説、非アクティブに）
    await supabase.from('saunas').update({ is_legendary: false, is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    for (const name of legendaryNames) {
        const { data, error } = await supabase
            .from('saunas')
            .update({ is_legendary: true, is_active: true })
            .ilike('name', `%${name}%`)
            .select();

        if (error) {
            console.error(`❌ エラー (${name}):`, error.message);
        } else if (data && data.length > 0) {
            count += data.length;
            console.log(`✨ ${name} 関連施設を ${data.length} 件マーク & 有効化しました (例: ${data[0].name})`);
        }
    }

    const { data: finalData } = await supabase.from('saunas').select('id').eq('is_legendary', true);
    console.log(`\n🎉 完了! 伝説の施設数: ${finalData?.length || 0} 件`);
}

markLegendary();
