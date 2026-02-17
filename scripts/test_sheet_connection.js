
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// サービスアカウントキーのパス
const KEY_PATH = path.join(__dirname, '../backend/service-account.json');
// スプレッドシートID
const SPREADSHEET_ID = '1oZM9b5qV_HNR1SsItELHNE4zuJhsNeEHxYNrgiGBI2g';

async function testConnection() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // スプレッドシートのメタデータを取得して接続確認
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        console.log('Connection Successful!');
        console.log('Spreadsheet Title:', response.data.properties.title);

        // シート一覧を表示
        console.log('Sheets:');
        response.data.sheets.forEach(sheet => {
            console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
        });

        // 区分(A列)のユニークな値を取得して確認する
        const firstSheetName = response.data.sheets[0].properties.title;
        const range = `${firstSheetName}!A2:A1000`; // ヘッダー以降のデータを取得

        const dataResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        console.log('\nUnique Categories:');
        if (dataResponse.data.values && dataResponse.data.values.length > 0) {
            const categories = dataResponse.data.values.map(row => row[0]);
            const uniqueCategories = [...new Set(categories)]; // ユニークな値を抽出

            uniqueCategories.forEach(cat => {
                const count = categories.filter(c => c === cat).length;
                console.log(`- ${cat}: ${count}件`);
            });
        } else {
            console.log('No data found in range.');
        }
    } catch (error) {
        console.error('Connection Failed:', error);
    }
}

testConnection();
