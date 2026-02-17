
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = `sauna_tester_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

const run = async () => {
    console.log('--- Creating Test User & Seeding Data ---');

    // 1. Create or Get User
    let userId;
    const { data, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });

    if (signUpError) {
        if (signUpError.message.includes('already registered')) {
            console.log(`User ${TEST_EMAIL} already exists. Logging in...`);
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            if (signInError) {
                console.error('Failed to sign in existing user:', signInError);
                process.exit(1);
            }
            userId = signInData.user.id;
            console.log("Logged in existing user. Session:", !!signInData.session);
        } else {
            console.error('Error creating user:', signUpError);
            process.exit(1);
        }
    } else {
        console.log(`User created: ${data.user.id}`);
        userId = data.user.id;
        console.log("Session present:", !!data.session);

        if (!data.session) {
            console.log("No session returned. Attempting sign in...");
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            if (signInError) {
                console.error('Failed to sign in new user (likely email confirmation needed):', signInError);
                console.log('--- ACTION REQUIRED ---');
                console.log('Please confirm the email for ' + TEST_EMAIL + ' or disable email confirmation in Supabase dashboard.');
                process.exit(1);
            }
            console.log("Signed in successfully. Session:", !!signInData.session);
        }
    }

    if (!userId) {
        console.error('Could not determine User ID.');
        process.exit(1);
    }

    // 2. Fetch Saunas
    const { data: saunas, error: saunasError } = await supabase
        .from('saunas')
        .select('id')
        .or('sauna_tier.eq.legendary,is_legendary.eq.true'); // Fetch all legendary saunas

    if (saunasError) {
        console.error('Error fetching saunas:', saunasError);
        process.exit(1);
    }

    console.log(`Found ${saunas.length} legendary saunas.`);
    const targetSaunas = saunas.slice(0, 99); // Take 99

    // 3. Prepare Visits
    const visits = targetSaunas.map(s => ({
        user_id: userId,
        sauna_id: s.id,
        visited_at: new Date().toISOString(),
        totonoi_score: Math.floor(Math.random() * 30) + 70, // 70-99 score
        totonoi_status: 'totonotta',
        memo: 'Auto-generated test visit'
    }));

    // 4. Insert
    console.log(`Inserting ${visits.length} visits for user ${TEST_EMAIL}...`);
    const { error: insertError } = await supabase
        .from('visits')
        .upsert(visits, { onConflict: 'user_id, sauna_id' });

    if (insertError) {
        console.error('Error inserting visits:', insertError);
    } else {
        console.log('--- Success! ---');
        console.log(`User: ${TEST_EMAIL}`);
        console.log(`Pass: ${TEST_PASSWORD}`);
        console.log(`Visits: 99 / ${saunas.length}`);
        console.log('Log in with these credentials to test the 99-visit state.');
    }
};

run();
