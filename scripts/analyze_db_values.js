import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function analyzeColumns() {
    const columns = [
        'humidity_eval',
        'heat_quality',
        'water_quality',
        'water_hardness',
        'stove_type',
        'chair_type',
        'facility_type'
    ];

    console.log('--- Analyzing Distinct Values ---');

    for (const col of columns) {
        const { data, error } = await supabase
            .from('saunas')
            .select(col);

        if (error) {
            console.error(`Error fetching ${col}:`, error.message);
            continue;
        }

        const counts = {};
        data.forEach(row => {
            const val = row[col];
            if (val) {
                // Split standard delimiters if necessary, but for now just raw values
                // Some columns like stove_type might be comma separated or free text
                const normalized = val.trim();
                counts[normalized] = (counts[normalized] || 0) + 1;
            } else {
                counts['(null)'] = (counts['(null)'] || 0) + 1;
            }
        });

        console.log(`\n[${col}]`);
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        sorted.slice(0, 15).forEach(([val, count]) => {
            console.log(`  ${val}: ${count}`);
        });
        if (sorted.length > 15) console.log(`  ... and ${sorted.length - 15} more`);
    }
}

analyzeColumns();
