import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const KEY_PATH = path.join(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

async function checkHeaders() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const sheetName = 'サウナ施設データベース更新';
        console.log(`Checking headers for: ${sheetName}`);

        // Fetch generous range to catch new columns
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:AZ1`,
        });

        const headers = response.data.values[0];
        console.log('--- Headers ---');
        headers.forEach((h, i) => {
            console.log(`[${i}] ${h} (Col ${String.fromCharCode(65 + i)})`);
        });
        console.log('---------------');

    } catch (error) {
        console.error('Error fetching headers:', error.message);
    }
}

checkHeaders();
