const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/ryoga/Python/my_sauna_project/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reseed() {
    console.log('--- Starting True Legendary 100 Reseed ---');

    // 1. Deactivate all existing saunas
    console.log('1. Deactivating all existing saunas...');
    const { error: deactivateError } = await supabase
        .from('saunas')
        .update({ is_active: false, is_legendary: false })
        .neq('name', '___FORCE_UPDATE_ALL_SAUNAS___'); // Workaround for "update all"

    if (deactivateError) {
        console.error('Error deactivating saunas:', deactivateError);
        return;
    }
    console.log('   Done.');

    // 2. Load the final 100 list
    console.log('2. Loading final_legendary_100.json...');
    const rawData = fs.readFileSync('/Users/ryoga/Python/my_sauna_project/scripts/final_legendary_100.json', 'utf8');
    const legendarySaunas = JSON.parse(rawData);
    console.log(`   Loaded ${legendarySaunas.length} facilities.`);

    // 3. Upsert the legendary 100
    console.log('3. Upserting legendary saunas...');
    for (const sauna of legendarySaunas) {
        // We try to find by name and address to avoid duplicates, or just insert new ones since we deactivated others.
        // Actually, upserting with 'name' as unique (if it is) might be better, but let's just insert as new active items.
        // To keep it clean, we'll try to match by name.

        const { data: existing, error: fetchError } = await supabase
            .from('saunas')
            .select('id')
            .eq('name', sauna.name)
            .limit(1);

        if (fetchError) {
            console.error(`Error fetching ${sauna.name}:`, fetchError);
            continue;
        }

        const payload = {
            name: sauna.name,
            lat: sauna.coordinates.lat,
            lng: sauna.coordinates.lng,
            address: sauna.address,
            temp: sauna.temp ? Math.round(sauna.temp) : null,
            water_temp: sauna.water_temp ? Math.round(sauna.water_temp) : null,
            category: sauna.category,
            description: sauna.description,
            is_legendary: true,
            is_active: true
        };

        if (existing && existing.length > 0) {
            // Update existing
            const { error: updateError } = await supabase
                .from('saunas')
                .update(payload)
                .eq('id', existing[0].id);

            if (updateError) {
                console.error(`Error updating ${sauna.name}:`, updateError);
            } else {
                console.log(`Updated: ${sauna.name}`);
            }
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('saunas')
                .insert([payload]);

            if (insertError) {
                console.error(`Error inserting ${sauna.name}:`, insertError);
            } else {
                console.log(`Inserted: ${sauna.name}`);
            }
        }
    }

    console.log('--- Reseed Completed ---');
}

reseed().catch(err => console.error(err));
