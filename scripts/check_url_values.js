import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_PATH = path.resolve(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

async function checkValues() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const sheetName = 'サウナ施設データベース更新';
        console.log(`Checking values for: ${sheetName} Col 31 (AF)`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!AF2:AF20`, // Check first 20 rows of Col 31
        });

        const rows = response.data.values;
        if (rows) {
            rows.forEach((row, i) => {
                console.log(`Row ${i + 2}: ${row[0]}`);
            });
        } else {
            console.log('No data found in range.');
        }
    } catch (error) {
        console.error('Error fetching values:', error);
    }
}

checkValues();
