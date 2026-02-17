import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const dataPath = '/Users/ryoga/.gemini/antigravity/brain/fa14dfcd-9e50-4077-9c20-19376a0613c9/final_legendary_100.json';
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const saunas = JSON.parse(rawData);

    console.log(`Starting to seed ${saunas.length} saunas...`);

    const formattedSaunas = saunas.map(s => {
        // Extract prefecture from address
        let pref = null;
        if (s.address) {
            if (s.address.startsWith('北海道')) pref = '北海道';
            else if (s.address.includes('都')) pref = s.address.match(/...?[都]/)?.[0] || null;
            else if (s.address.includes('府')) pref = s.address.match(/...?[府]/)?.[0] || null;
            else if (s.address.includes('県')) pref = s.address.match(/...?[県]/)?.[0] || null;
        }

        return {
            name: s.name,
            address: s.address,
            lat: s.coordinates.lat,
            lng: s.coordinates.lng,
            category: s.category,
            temp: s.temp,
            water_temp: s.water_temp,
            description: s.description,
            prefecture: pref,
            is_legendary: true,
            source_id: `legendary_${s.id}`
        };
    });

    // Bulk insert
    const { data, error } = await supabase
        .from('saunas')
        .insert(formattedSaunas);

    if (error) {
        console.error('Error seeding saunas:', error);
    } else {
        console.log('Successfully seeded 100 legendary saunas!');
    }
}

seed();
