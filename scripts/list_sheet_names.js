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

async function listSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheetsList = response.data.sheets;
        if (sheetsList.length) {
            console.log('Available Sheets:');
            sheetsList.forEach((sheet) => {
                console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
            });
        } else {
            console.log('No sheets found.');
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
    }
}

listSheets();
