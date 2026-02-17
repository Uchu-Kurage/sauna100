
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const checkPrefectures = async () => {
    console.log('--- Checking Prefectures ---');

    // 1. Get Distinct Prefectures
    const { data: saunas, error } = await supabase
        .from('saunas')
        .select('prefecture, name, is_legendary, sauna_tier');

    if (error) {
        console.error("Error fetching saunas:", error);
        return;
    }

    const prefs = [...new Set(saunas.map(s => s.prefecture).filter(p => p))];
    console.log("Distinct Prefectures in DB:", prefs);

    // 2. Check Kanagawa Saunas specifically
    const kanagawaSaunas = saunas.filter(s => s.prefecture && s.prefecture.includes('神奈川'));
    console.log("\n--- Kanagawa Saunas ---");
    kanagawaSaunas.forEach(s => {
        console.log(`- [${s.sauna_tier}] ${s.name} (Legendary: ${s.is_legendary})`);
    });
};

checkPrefectures();
