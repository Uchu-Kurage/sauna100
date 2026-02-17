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

async function analyzeAdditionalColumns() {
    const columns = [
        'perceived_temp',
        'has_outdoor_space',
        'temp',
        'water_temp'
    ];

    console.log('--- Analyzing Additional Metrics ---');

    for (const col of columns) {
        const { data, error } = await supabase
            .from('saunas')
            .select(col);

        if (error) {
            console.error(`Error fetching ${col}:`, error.message);
            continue;
        }

        const counts = {};
        let min = 999;
        let max = -999;
        let sum = 0;
        let countNum = 0;

        data.forEach(row => {
            const val = row[col];
            if (val !== null && val !== undefined) {
                const strFrom = String(val);
                counts[strFrom] = (counts[strFrom] || 0) + 1;

                if (typeof val === 'number') {
                    if (val < min) min = val;
                    if (val > max) max = val;
                    sum += val;
                    countNum++;
                }
            } else {
                counts['(null)'] = (counts['(null)'] || 0) + 1;
            }
        });

        console.log(`\n[${col}]`);
        if (countNum > 0) {
            console.log(`  Type: Number`);
            console.log(`  Min: ${min}, Max: ${max}, Avg: ${(sum / countNum).toFixed(1)}`);
            console.log(`  NotNull Count: ${countNum}`);
        } else {
            console.log(`  Type: Categorical/Boolean`);
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            sorted.slice(0, 10).forEach(([val, c]) => {
                console.log(`  ${val}: ${c}`);
            });
        }
    }
}

analyzeAdditionalColumns();
