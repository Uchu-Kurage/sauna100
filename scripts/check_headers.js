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

async function checkHeaders() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const meta = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log('Spreadsheet Title:', meta.data.properties.title);

        for (const sheet of meta.data.sheets) {
            const sheetName = sheet.properties.title;
            console.log(`\n--- Sheet: ${sheetName} ---`);

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1:AZ1`, // Fetch first row header extended
            });

            if (response.data.values && response.data.values.length > 0) {
                console.log('Headers:', response.data.values[0]);
            } else {
                console.log('No headers found (empty sheet?)');
            }
        }
    } catch (error) {
        console.error('Error fetching headers:', error);
    }
}

checkHeaders();
