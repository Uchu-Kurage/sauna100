import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_PATH = path.resolve(__dirname, '../backend/service-account.json');
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

async function checkWaterQualityData() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const sheetName = 'サウナ施設データベース更新';
        // Fetch headers (row 1) and first few data rows (2-5)
        // Focus on S (index 18) and T (index 19)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!S1:T5`,
        });

        const rows = response.data.values;
        console.log('Water Quality Columns (S:詳細, T:説明):');
        if (rows && rows.length > 0) {
            rows.forEach((row, index) => {
                console.log(`Row ${index + 1}: [S] ${row[0] || '(empty)'} | [T] ${row[1] || '(empty)'}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkWaterQualityData();
