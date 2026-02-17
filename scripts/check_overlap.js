import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOverlap() {
    const list = JSON.parse(fs.readFileSync('./scripts/legendary_list.json', 'utf8'));
    console.log(`📋 照合開始: 対象 ${list.length} 件`);

    const missing = [];
    const found = [];

    for (const item of list) {
        const { data, error } = await supabase
            .from('saunas')
            .select('id, name, address')
            .ilike('name', `%${item.name}%`);

        if (data && data.length > 0) {
            found.push({ target: item.name, matched: data[0].name });
        } else {
            missing.push(item);
        }
    }

    console.log(`✅ 発見: ${found.length} 件`);
    console.log(`❌ 未発見: ${missing.length} 件`);

    if (missing.length > 0) {
        console.log("\n--- 未発見リスト ---");
        missing.forEach(m => console.log(`${m.area}: ${m.name}`));
        fs.writeFileSync('./scripts/missing_saunas.json', JSON.stringify(missing, null, 2));
    }
}

checkOverlap();
