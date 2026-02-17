/**
 * Ethical Sauna Data Importer (OpenStreetMap / Overpass API)
 * 
 * 外部の利用規約を遵守し、商用利用・再配布が認められている OpenStreetMap (OSM) から
 * 関東圏のサウナ施設情報を取得して Supabase へ登録します。
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 地域ごとのバウンディングボックス (南から北へ)
const regions = [
    { name: "九州・沖縄", bbox: "24.0,122.0,34.0,132.0" },
    { name: "中国・四国・近畿", bbox: "33.0,130.0,36.0,137.0" },
    { name: "中部・関東", bbox: "34.0,136.0,38.0,141.0" },
    { name: "東北・北海道", bbox: "37.0,138.0,46.0,146.0" }
];

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

async function importFromOSM() {
    console.log("🌐 OpenStreetMap (Overpass API) から日本全国のサウナ情報を地域別に取得中...");

    let totalElements = 0;

    for (const region of regions) {
        console.log(`📍 ${region.name} エリアを取得中...`);
        const query = `
    [out:json][timeout:60];
    (
      node["leisure"="sauna"](${region.bbox});
      way["leisure"="sauna"](${region.bbox});
      node["amenity"="public_bath"]["sauna"="yes"](${region.bbox});
      way["amenity"="public_bath"]["sauna"="yes"](${region.bbox});
    );
    out center;
    `;

        try {
            const response = await fetch(OVERPASS_URL, {
                method: "POST",
                body: `data=${encodeURIComponent(query)}`,
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const elements = data.elements || [];
            totalElements += elements.length;

            console.log(`✅ ${region.name} で ${elements.length} 件検出しました。Supabase へ同期中...`);

            const saunasToInsert = elements.map(el => {
                const tags = el.tags || {};
                const lat = el.lat || (el.center && el.center.lat);
                const lng = el.lon || (el.center && el.center.lon);

                let category = "サウナ/公衆浴場";
                if (tags.amenity === "public_bath") category = "銭湯サウナ";

                return {
                    name: tags.name || tags["name:ja"] || "名称不明の施設",
                    address: tags["addr:full"] || tags["addr:province"] || tags["addr:city"] || "住所不明",
                    lat: lat,
                    lng: lng,
                    source_id: `osm-${el.id}`,
                    category: category,
                    temp: 90,
                    water_temp: 17,
                    official_url: tags.website || null,
                    description: `Nationwide Import (${region.name})`
                };
            }).filter(s => s.lat && s.lng);

            const { error } = await supabase.from('saunas').upsert(saunasToInsert, { onConflict: 'source_id' });
            if (error) console.error(`❌ DB保存エラー:`, error.message);

        } catch (err) {
            console.error(`❌ ${region.name} の取得に失敗しました:`, err.message);
        }

        // API への負荷軽減のため少し待機
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 全地域の同期が完了しました。合計 ${totalElements} 件（重複含む可能性あり）`);
}

importFromOSM();
