const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/ryoga/Python/my_sauna_project/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissing() {
    const jsonPath = '/Users/ryoga/.gemini/antigravity/brain/fa14dfcd-9e50-4077-9c20-19376a0613c9/final_legendary_100.json';
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonNames = jsonData.map(s => s.name);

    const { data: dbSaunas, error } = await supabase
        .from('saunas')
        .select('name')
        .eq('is_legendary', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const dbNames = dbSaunas.map(s => s.name);

    const missing = jsonNames.filter(name => !dbNames.includes(name));
    console.log('Missing names in DB:', missing);

    const extras = dbNames.filter(name => !jsonNames.includes(name));
    console.log('Extra names in DB (not in JSON):', extras);
}

findMissing();
