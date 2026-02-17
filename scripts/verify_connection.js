/**
 * External Site Connection Verification
 * 
 * 実際のウェブサイト（ニフティ温泉のサウナ検索結果ページを例に）への
 * HTTP接続が可能かどうかを検証します。
 * 
 * 注意: このスクリプトは接続の技術的な検証のみを目的としており、
 * 大量のデータ取得や規約に反する行為は行いません。
 */

import fetch from 'node-fetch';

async function verifyConnection() {
    const targetUrl = 'https://onsen.nifty.com/search/?keyword=%E3%82%B5%E3%82%A6%E3%83%8A'; // 「サウナ」の検索結果ページ

    console.log(`🌐 接続検証を開始します: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SaunaMapBot/1.0; +http://localhost:5173/)'
            },
            timeout: 10000
        });

        console.log(`📡 ステータスコード: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const text = await response.text();
            console.log(`✅ 接続成功。受信データサイズ: ${text.length} バイツ`);

            // コンテンツの一部を解析（タイトルなど）
            const titleMatch = text.match(/<title>(.*?)<\/title>/);
            if (titleMatch) {
                console.log(`📄 ページタイトル: ${titleMatch[1]}`);
            }

            // 施設名のパターンが取れるか簡易チェック
            // ニフティ温泉の施設名は通常 h3 タグ内にある場合が多い
            const matches = text.match(/<h3[^>]*>(.*?)<\/h3>/g);
            if (matches) {
                console.log(`📍 施設名らしき要素を ${matches.length} 件検出しました。`);
                console.log(`   例: ${matches[0].replace(/<[^>]*>/g, '').trim()}`);
            }
        } else {
            console.error(`❌ 接続に失敗しました。サイト側で制限されている可能性があります。`);
        }
    } catch (error) {
        console.error(`🚨 エラーが発生しました: ${error.message}`);
    }
}

verifyConnection();
