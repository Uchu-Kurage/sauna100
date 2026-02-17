
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const seedVisits = async (userId) => {
    console.log(`Starting seed for User ID: ${userId}`);

    // 1. Get Legendary Saunas
    const { data: saunas, error: saunasError } = await supabase
        .from('saunas')
        .select('id, name')
        .or('sauna_tier.eq.legendary,is_legendary.eq.true');

    if (saunasError) {
        console.error('Error fetching saunas:', saunasError);
        return;
    }

    console.log(`Found ${saunas.length} legendary saunas.`);

    if (saunas.length < 99) {
        console.warn(`Warning: Only ${saunas.length} legendary saunas found. Cannot seed 99.`);
    }

    // 2. Take 99 saunas
    const targetSaunas = saunas.slice(0, 99);

    // 3. Prepare visits data
    const visits = targetSaunas.map(s => ({
        user_id: userId,
        sauna_id: s.id,
        visited_at: new Date().toISOString(),
        totonoi_score: Math.floor(Math.random() * 41) + 60, // Random score 60-100
        totonoi_status: 'totonotta',
        memo: 'Test visit for unlocking analysis.'
    }));

    console.log(`Preparing to insert ${visits.length} visits...`);

    // 4. Insert visits (upsert to avoid duplicates)
    const { error: insertError } = await supabase
        .from('visits')
        .upsert(visits, { onConflict: 'user_id, sauna_id' });

    if (insertError) {
        console.error('Error inserting visits:', insertError);
    } else {
        console.log('Successfully inserted 99 visits!');
        console.log('You should have 1 more sauna to visit to unlock the feature.');
    }

    process.exit(0);
};

// Main flow
console.log('--- Seed 99 Visits ---');
console.log('This script will add 99 visited records to the specified User ID.');
console.log('Please enter the User ID (UUID) you want to seed:');

rl.question('> ', (userId) => {
    if (!userId) {
        console.error('User ID is required.');
        process.exit(1);
    }
    seedVisits(userId.trim());
    rl.close();
});
