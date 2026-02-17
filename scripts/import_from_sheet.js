import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const KEY_PATH = path.join(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

const FETCHED_DATA_PATH = path.join(__dirname, 'fetched_data.json');
let fetchedData = [];
try {
    const rawData = fs.readFileSync(FETCHED_DATA_PATH, 'utf8');
    fetchedData = JSON.parse(rawData);
} catch (e) {
    console.warn('Warning: Could not load fetched_data.json. Coordinates might be missing.');
}

function findCoordinates(name) {
    const normalize = (str) => str.replace(/[\s　]/g, '');
    const target = normalize(name);

    let found = fetchedData.find(d => normalize(d.name) === target);

    if (!found && target.length > 2) {
        found = fetchedData.find(d => {
            const dName = normalize(d.name);
            return (dName.includes(target) || target.includes(dName)) && dName.length > 2;
        });
    }

    if (found && found.coordinates) {
        return found.coordinates;
    }
    return null;
}

async function importData() {
    console.log('🚀 Starting Data Import...');

    try {
        const { error: updateError } = await supabase
            .from('saunas')
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (updateError) {
            console.error('Error deactivating existing saunas:', updateError);
        } else {
            console.log('✅ Deactivated all existing saunas.');
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const mainSheetName = 'サウナ施設データベース更新';

        // 1. Fetch Main Data (Values)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${mainSheetName}!A2:AH1000`,
        });
        const mainRows = response.data.values;

        if (!mainRows || mainRows.length === 0) {
            console.log('No data found in main sheet.');
            return;
        }

        console.log(`Found ${mainRows.length} rows in master sheet.`);

        // 2. Fetch Hyperlinks for "Official Homepage" (Col AF / Index 31)
        // We use spreadsheets.get to access the 'hyperlink' field in CellData
        // Range must match the rows fetched above (A2:AH...), here we fetch AF2:AF(2+rows-1)
        const rowCount = mainRows.length;
        const hyperlinkResponse = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
            ranges: [`${mainSheetName}!AF2:AF${2 + rowCount - 1}`],
            fields: 'sheets(data(rowData(values(hyperlink))))',
        });

        const hyperlinkRows = hyperlinkResponse.data.sheets[0].data[0].rowData;
        console.log(`Fetched ${hyperlinkRows ? hyperlinkRows.length : 0} hyperlink rows.`);

        let upsertedCount = 0;
        let coordsFoundCount = 0;

        for (let i = 0; i < mainRows.length; i++) {
            const row = mainRows[i];

            // Get hyperlink if exists
            let officialUrl = null;
            if (hyperlinkRows && hyperlinkRows[i] && hyperlinkRows[i].values && hyperlinkRows[i].values[0]) {
                officialUrl = hyperlinkRows[i].values[0].hyperlink || null;
            }
            // Fallback: if no hyperlink, check if the raw text looks like a URL (rare but possible)
            if (!officialUrl && row[31] && row[31].startsWith('http')) {
                officialUrl = row[31];
            }

            const categoryRaw = row[0] || '';
            const prefecture = row[1] || '';
            const name = row[2] || '';

            const facilityType = row[3] || null;
            const description = row[4] || null;

            if (!name) continue;

            let tier = 'normal';
            if (categoryRaw.includes('伝')) tier = 'legendary';
            if (categoryRaw.includes('幻')) tier = 'phantom';

            let lat = parseFloat(row[29]);
            let lng = parseFloat(row[30]);

            if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
                const coords = findCoordinates(name);
                if (coords) {
                    lat = coords.lat;
                    lng = coords.lng;
                    coordsFoundCount++;
                } else {
                    lat = 0;
                    lng = 0;
                    console.warn(`⚠️ No coordinates found for: ${name}`);
                }
            } else {
                coordsFoundCount++;
            }

            const parseNum = (val) => {
                if (!val) return null;
                const cleaned = val.toString().replace(/,/g, '');
                const match = cleaned.match(/[\d\.]+/);
                return match ? parseFloat(match[0]) : null;
            };

            const temp = parseNum(row[5]);
            const perceived_temp = parseNum(row[6]);

            let stoveType = null;
            let stoneType = null;
            const stoveStoneRaw = row[7] || '';
            if (stoveStoneRaw.includes('/')) {
                const parts = stoveStoneRaw.split('/');
                stoveType = parts[0].trim();
                stoneType = parts[1].trim();
            } else {
                stoveType = stoveStoneRaw;
            }

            const humidityEval = row[8] || null;
            const waterTemp = parseNum(row[9]);
            const depth = parseNum(row[10]);

            const waterQuality = row[11] || null;
            const waterHardness = row[12] || null;

            const chairType = row[14] || null;

            const foodRaw = row[16] || '';
            let hasRestaurant = false;
            let specialMenu = null;
            if (foodRaw && !foodRaw.includes('なし')) {
                hasRestaurant = true;
                specialMenu = foodRaw;
            }

            const saunaType = row[17] || null;
            const heatQuality = row[18] || null;
            const waterQuality2 = row[19] || null;
            const waterDesc = row[20] || null;

            const outdoorRaw = row[21] || '';
            const hasOutdoorSpace = outdoorRaw.includes('有') || outdoorRaw.includes('あり') || outdoorRaw.includes('〇') || outdoorRaw.includes('○');

            const viewDesc = row[22] || null;

            const openingHours = row[24] || null;
            const baseFee = parseNum(row[25]);

            const ldRaw = row[26] || '';
            const hasLadiesDay = ldRaw.includes('有') || ldRaw.includes('あり') || ldRaw.includes('○');

            const access = row[27] || null;
            const address = row[28] || null;

            // officialUrl is already set above
            const aufgussSchedule = row[32] || null;

            const saunaData = {
                name: name,
                prefecture: prefecture,
                sauna_tier: tier,

                facility_type: facilityType,
                description: description,

                lat: lat,
                lng: lng,
                address: address,
                access: access,
                opening_hours: openingHours,
                base_fee: baseFee,
                has_ladies_day: hasLadiesDay,
                official_url: officialUrl,

                temp: temp,
                perceived_temp: perceived_temp,
                stove_type: stoveType,
                stone_type: stoneType,
                humidity_eval: humidityEval,
                sauna_type: saunaType,
                heat_quality: heatQuality,
                aufguss_schedule: aufgussSchedule,

                water_temp: waterTemp,
                depth: depth,
                water_quality: waterQuality,
                water_hardness: waterHardness,
                water_quality_2: waterQuality2,
                water_desc: waterDesc,

                chair_type: chairType,
                has_outdoor_space: hasOutdoorSpace,
                view_desc: viewDesc,

                has_restaurant: hasRestaurant,
                special_menu: specialMenu,

                category: categoryRaw,
                source_id: `sheet_${name}`,
                is_active: true,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('saunas')
                .upsert(saunaData, { onConflict: 'source_id' });

            if (error) {
                console.error(`Error upserting ${name}:`, error);
            } else {
                upsertedCount++;
            }
        }

        console.log(`\n🎉 Import Complete!`);
        console.log(`Processed: ${mainRows.length}`);
        console.log(`Upserted: ${upsertedCount}`);
        console.log(`Coordinates Found: ${coordsFoundCount}`);

    } catch (error) {
        console.error('Import Failed:', error);
    }
}

importData();
