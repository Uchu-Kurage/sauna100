
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use Service Role Key if available, otherwise Anon Key (though Anon Key might not have UPDATE permissions depending on RLS)
// Ideally we need Service Role for batch updates if RLS is strict.
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const fixPrefectures = async () => {
    console.log('--- Fixing Prefecture Names ---');

    // 1. Fix Kanagawa
    const { data: kanagawaSaunas, error: fetchError } = await supabase
        .from('saunas')
        .select('id, name, prefecture')
        .eq('prefecture', '神奈川');

    if (fetchError) {
        console.error("Error fetching Kanagawa saunas:", fetchError);
        return;
    }

    console.log(`Found ${kanagawaSaunas.length} saunas with '神奈川'. Updating to '神奈川県'...`);

    if (kanagawaSaunas.length > 0) {
        const { error: updateError } = await supabase
            .from('saunas')
            .update({ prefecture: '神奈川県' })
            .eq('prefecture', '神奈川');

        if (updateError) {
            console.error("Error updating Kanagawa saunas:", updateError);
        } else {
            console.log("Successfully updated Kanagawa saunas.");
        }
    }

    // 2. Check for other potentially missing suffixes
    const { data: allSaunas } = await supabase
        .from('saunas')
        .select('prefecture')
        .not('prefecture', 'is', null);

    const distinctPrefs = [...new Set(allSaunas.map(s => s.prefecture))];
    const suspicious = distinctPrefs.filter(p => {
        const lastChar = p.slice(-1);
        return !['都', '道', '府', '県'].includes(lastChar);
    });

    if (suspicious.length > 0) {
        console.warn("Suspicious prefecture names found (missing suffix?):", suspicious);
    } else {
        console.log("All other prefecture names seem to have valid suffixes.");
    }
};

fixPrefectures();
