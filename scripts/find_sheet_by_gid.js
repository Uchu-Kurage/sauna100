import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_PATH = path.resolve(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';
const TARGET_GID = 1084303884;

async function findSheetByGid() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const meta = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log(`Looking for GID: ${TARGET_GID}`);

        const targetSheet = meta.data.sheets.find(s => s.properties.sheetId === TARGET_GID);

        if (targetSheet) {
            const sheetName = targetSheet.properties.title;
            console.log(`✅ Found Sheet: "${sheetName}"`);

            // Also fetch headers for this sheet to be sure
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1:AZ1`,
            });
            console.log('Headers:', response.data.values[0]);

        } else {
            console.log('❌ Sheet with this GID not found.');
            console.log('Available Sheets:');
            meta.data.sheets.forEach(s => {
                console.log(`- ${s.properties.title} (ID: ${s.properties.sheetId})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

findSheetByGid();
