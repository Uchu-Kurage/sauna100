import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKagoshima() {
    console.log("Checking Kagoshima saunas...");

    // Fetch ALL Kagoshima candidates
    const { data, error } = await supabase
        .from('saunas')
        .select('*')
        .or('prefecture.eq.鹿児島県,prefecture.eq.鹿児島,name.ilike.%鹿児島%,name.ilike.%屋久島%,name.ilike.%霧島%,name.ilike.%指宿%');

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
        console.log("No Kagoshima saunas found.");
    } else {
        data.forEach(s => {
            console.log(`[ID:${s.id}] Pref:${s.prefecture} | Leg:${s.is_legendary} | Name:${s.name}`);
        });
    }
}

checkKagoshima();
