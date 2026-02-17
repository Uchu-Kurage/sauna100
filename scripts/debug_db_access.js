
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const inspectDB = async () => {
    console.log('--- Inspecting DB Access (E2E Test with Existing User) ---');

    // 1. Log in with existing user
    const email = 'saunamaster99@gmail.com';
    const password = 'password123';

    console.log(`1. Logging in user: ${email}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInError) {
        console.error("Sign In Failed:", signInError);
        return;
    }

    const user = signInData.user;
    console.log(`   User Info: ${user?.id}`);
    console.log(`   Session active: ${!!signInData.session}`);

    if (!signInData.session) {
        console.log("   No session. Exiting.");
        return;
    }

    // 2. Fetch a sauna
    console.log("2. Fetching a sauna...");
    const { data: saunas, error: saunaError } = await supabase.from('saunas').select('id').limit(1);

    if (saunaError) {
        console.error("   Fetch Sauna Failed:", saunaError);
        return;
    }
    const saunaId = saunas[0].id;
    console.log(`   Found sauna: ${saunaId}`);

    // 3. Try Insert
    console.log("3. Attempting Insert as Authenticated User...");
    const { data: insertData, error: insertError } = await supabase.from('visits').upsert({
        user_id: user.id,
        sauna_id: saunaId,
        totonoi_status: 'totonotta',
        totonoi_score: 88,
        visited_at: new Date().toISOString()
    }).select();

    if (insertError) {
        console.error("   INSERT FAILED:", insertError);
        console.error("   Code:", insertError.code);
        console.error("   Details:", insertError.details);
        console.error("   Message:", insertError.message);
    } else {
        console.log("   INSERT SUCCESS:", insertData);

        // Clean up
        console.log("4. Cleaning up test data...");
        const { error: deleteError } = await supabase.from('visits').delete().eq('user_id', user.id).eq('sauna_id', saunaId);
        if (deleteError) console.error("   Cleanup Failed:", deleteError);
        else console.log("   Cleanup Success.");
    }
};

inspectDB();
