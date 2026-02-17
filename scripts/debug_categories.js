import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase
        .from('saunas')
        .select('category, sauna_tier');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    const categories = [...new Set(data.map(d => d.category))];
    const tiers = [...new Set(data.map(d => d.sauna_tier))];

    console.log("Distinct Categories:");
    categories.forEach(c => console.log(`"${c}"`));

    console.log("\nDistinct Tiers:");
    tiers.forEach(t => console.log(`"${t}"`));

    // Check if any category contains '伝' or '幻'
    const suspectSaunas = data.filter(d => d.category && (d.category.includes('伝') || d.category.includes('幻')));
    if (suspectSaunas.length > 0) {
        console.log("\nSaunas with 'Den' or 'Gen' in category:");
        suspectSaunas.slice(0, 5).forEach(s => console.log(`${s.category} (Tier: ${s.sauna_tier})`));
    } else {
        console.log("\nNo categories contain '伝' or '幻'.");
    }
}

checkCategories();
