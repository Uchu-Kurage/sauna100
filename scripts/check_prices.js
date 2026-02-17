import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_PATH = path.resolve(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

async function checkPrices() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const basicSheetName = '基本情報';
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${basicSheetName}!A2:D20`, // Fetch name (B) and price (D) for first 20 rows
        });

        const rows = response.data.values;
        console.log('Raw Price Data (First 20 rows):');
        rows.forEach(row => {
            console.log(`Name: ${row[1]}, Raw Price: "${row[3]}"`);
        });

    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

checkPrices();
