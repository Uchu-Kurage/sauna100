
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('saunas')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching one row:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in saunas table:');
        console.log(Object.keys(data[0]));
    } else {
        console.log('Table is empty, cannot infer columns easily via select *');
    }
}

checkSchema();
