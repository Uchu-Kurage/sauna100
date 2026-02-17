
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const checkCount = async () => {
    const { count, error } = await supabase
        .from('saunas')
        .select('*', { count: 'exact', head: true })
        .or('sauna_tier.eq.legendary,is_legendary.eq.true');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Number of Legendary Saunas in DB: ${count}`);
        if (count < 99) {
            console.warn('WARNING: Not enough legendary saunas to visit 99!');
        } else {
            console.log('OK: Sufficient legendary saunas exist.');
        }
    }
};

checkCount();
