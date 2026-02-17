const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '/Users/ryoga/Python/my_sauna_project/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

async function updatePrefectures() {
    console.log('Fetching saunas...');
    const { data: saunas, error } = await supabase.from('saunas').select('id, address');

    if (error) {
        console.error('Error fetching saunas:', error);
        return;
    }

    console.log(`Processing ${saunas.length} saunas...`);

    for (const sauna of saunas) {
        if (!sauna.address) continue;

        const pref = PREFECTURES.find(p => sauna.address.startsWith(p));
        if (pref) {
            const { error: updateError } = await supabase
                .from('saunas')
                .update({ prefecture: pref })
                .eq('id', sauna.id);

            if (updateError) {
                console.error(`Error updating ${sauna.id}:`, updateError.message);
            } else {
                console.log(`Updated ${sauna.id} with ${pref}`);
            }
        }
    }
    console.log('Migration completed.');
}

updatePrefectures();
