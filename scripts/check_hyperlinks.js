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

async function checkHyperlinks() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const sheetName = 'サウナ施設データベース更新';
        console.log(`Checking hyperlinks for: ${sheetName} Col 31 (AF)`);

        // We need to find the sheetId for "サウナ施設データベース更新" first
        // Or we can use range notation with spreadsheets.get if we treat it carefully?
        // Actually spreadsheets.get works with sheetId (gid), not name in the same way as values.get for ranges.
        // But we can filter using `ranges` param in get.

        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
            ranges: [`${sheetName}!AF2:AF20`], // Check first 20 rows of Col AF
            fields: 'sheets(data(rowData(values(hyperlink,userEnteredFormat,formattedValue))))', // Fetch hyperlink field
        });

        const sheetData = response.data.sheets[0];
        const rows = sheetData.data[0].rowData;

        if (rows) {
            rows.forEach((row, i) => {
                const cell = row.values ? row.values[0] : null;
                const val = cell ? cell.formattedValue : 'empty';
                const link = cell ? cell.hyperlink : 'no link';
                console.log(`Row ${i + 2}: Text="${val}", Link="${link}"`);
            });
        } else {
            console.log('No data found.');
        }

    } catch (error) {
        console.error('Error fetching hyperlinks:', error);
    }
}

checkHyperlinks();
