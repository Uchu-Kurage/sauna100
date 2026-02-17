const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/ryoga/Python/my_sauna_project/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
    const { count, error } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .eq('is_legendary', true)
        .eq('is_active', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Legendary active saunas count:', count);

    // Also check all legendary saunas (including inactive ones)
    const { count: allCount } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .eq('is_legendary', true);

    console.log('All legendary saunas count (incl. inactive):', allCount);
}

checkCount();
