import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Try with ANON key

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql() {
    // 1. Fix Prefectures
    console.log("Fixing Prefectures...");
    const updates = [
        { name: 'ぬかとゆげ', pref: '京都府' },
        { name: '大磯プリンスホテル', pref: '神奈川県', match: '磯町国府' }, // Match by bad pref
        { name: '南大門', pref: '栃木県', match: '木県宇都' },
        { name: 'なんぶの湯', pref: '山梨県', match: '梨県南都' }, // Or generally just update by bad pref
        { name: '別府', pref: '大分県', match: '分県別府' },
    ];

    // Direct updates by strict match on bad prefecture string to be safe
    const badPrefs = {
        '磯町国府': '神奈川県',
        '木県宇都': '栃木県',
        '梨県南都': '山梨県',
        '分県別府': '大分県'
    };

    for (const [bad, good] of Object.entries(badPrefs)) {
        const { error } = await supabase
            .from('saunas')
            .update({ prefecture: good })
            .eq('prefecture', bad);

        if (error) console.error(`Error fixing ${bad}:`, error.message);
        else console.log(`Fixed ${bad} -> ${good}`);
    }

    // Special case for null
    const { error: nullFix } = await supabase
        .from('saunas')
        .update({ prefecture: '京都府' })
        .eq('name', 'ぬかとゆげ');
    if (nullFix) console.error("Error fixing ぬかとゆげ:", nullFix.message);
    else console.log("Fixed ぬかとゆげ -> 京都府");


    // 2. Fix Wakayama
    console.log("\nFixing Wakayama...");
    // Fix prefecture name
    const { error: wUpdate } = await supabase
        .from('saunas')
        .update({ prefecture: '和歌山県' })
        .eq('prefecture', '和歌山');
    if (wUpdate) console.error("Error updating Wakayama pref:", wUpdate.message);
    else console.log("Fixed 和歌山 -> 和歌山県");

    // set Tsuboyu to legendary
    const { error: tsuboyu } = await supabase
        .from('saunas')
        .update({ is_legendary: true })
        .eq('name', '湯の峰温泉 つぼ湯');

    if (tsuboyu) console.error("Error setting Tsuboyu legendary:", tsuboyu.message);
    else console.log("Set Tsuboyu to Legendary");

    // 3. Fix Kagoshima
    console.log("\nFixing Kagoshima...");
    const { error: kUpdate } = await supabase
        .from('saunas')
        .update({ prefecture: '鹿児島県' })
        .eq('prefecture', '鹿児島');
    if (kUpdate) console.error("Error updating Kagoshima pref:", kUpdate.message);
    else console.log("Fixed 鹿児島 -> 鹿児島県");

    // set Hotel New Nishino to legendary
    const { error: nishino } = await supabase
        .from('saunas')
        .update({ is_legendary: true })
        .eq('name', 'ホテルニューニシノ');

    if (nishino) console.error("Error setting Nishino legendary:", nishino.message);
    else console.log("Set Hotel New Nishino to Legendary");
}

executeSql();
