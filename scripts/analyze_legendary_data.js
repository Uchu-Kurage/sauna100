
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const analyze = async () => {
    console.log('--- Analyzing Legendary Data ---');

    // 1. Count is_legendary = true
    const { count: countFlag, error: errorFlag } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .eq('is_legendary', true);

    console.log(`is_legendary = true: ${countFlag} (Error: ${errorFlag?.message})`);

    // 2. Count sauna_tier = 'legendary'
    const { count: countTier, error: errorTier } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .eq('sauna_tier', 'legendary');

    console.log(`sauna_tier = 'legendary': ${countTier} (Error: ${errorTier?.message})`);

    // 3. Count BOTH
    const { count: countBoth, error: errorBoth } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .eq('is_legendary', true)
        .eq('sauna_tier', 'legendary');

    console.log(`BOTH true: ${countBoth}`);

    // 4. Count OR
    const { count: countOr, error: errorOr } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .or('sauna_tier.eq.legendary,is_legendary.eq.true');

    console.log(`EITHER true (OR condition): ${countOr}`);
};

analyze();
