/**
 * 分析用ユーティリティ
 */

// Normalization Helpers
const normalizeStoveType = (raw) => {
    if (!raw) return '不明';
    if (raw.includes('電気') || raw.includes('エレメント')) return '電気ストーブ';
    if (raw.includes('薪')) return '薪ストーブ';
    if (raw.includes('遠赤') || raw.includes('ガス')) return '遠赤外線/ガス';
    if (raw.includes('iki') || raw.includes('Iki')) return 'ikiストーブ';
    if (raw.includes('ボナ')) return 'ボナサウナ';
    if (raw.includes('ロッキー')) return 'ロッキーサウナ';
    if (raw.includes('フィンランド')) return 'フィンランド式';
    return 'その他';
};

const normalizeWaterQuality = (raw) => {
    if (!raw) return '不明';
    if (raw.includes('地下')) return '地下水';
    if (raw.includes('水道')) return '水道水';
    if (raw.includes('軟水')) return '軟水';
    if (raw.includes('湧水') || raw.includes('天然')) return '天然水/湧水';
    if (raw.includes('井戸')) return '井戸水';
    return 'その他';
};

const normalizeChairType = (raw) => {
    if (!raw) return '不明';
    if (raw.includes('Inf') || raw.includes('インフィニティ')) return 'インフィニティ';
    if (raw.includes('Deck') || raw.includes('デッキ')) return 'デッキチェア';
    if (raw.includes('Adir') || raw.includes('アディロン')) return 'アディロンダック';
    if (raw.includes('ベンチ')) return 'ベンチ';
    if (raw.includes('椅') || raw.includes('プラ')) return '通常イス';
    return 'その他';
};

const normalizeFacilityType = (raw) => {
    if (!raw) return 'その他';
    // The raw data from sheet is already somewhat categorized, but let's group if needed
    if (raw.includes('ホテル') || raw.includes('旅館')) return 'ホテル/旅館';
    if (raw.includes('銭湯') || raw.includes('スーパー銭湯')) return '銭湯/スパ銭';
    if (raw.includes('カプセル')) return 'カプセルホテル';
    if (raw.includes('アウトドア') || raw.includes('テント')) return 'アウトドア';
    if (raw.includes('サウナ専用') || raw.includes('プライベート')) return 'サウナ専門店';
    return raw;
};

export const analyzePreferences = (saunas) => {
    const visitedSaunas = saunas.filter(s => s.visited && s.totonoi_score !== null);

    if (visitedSaunas.length === 0) return null;

    // Helper to calculate score averages for categorical data
    const calcCategoryScores = (extractor) => {
        const stats = {};
        visitedSaunas.forEach(s => {
            const key = extractor(s);
            if (!stats[key]) stats[key] = { sum: 0, count: 0 };
            stats[key].sum += s.totonoi_score;
            stats[key].count++;
        });
        return Object.entries(stats)
            .map(([key, data]) => ({
                key,
                label: key,
                avg: Math.round(data.sum / data.count),
                count: data.count
            }))
            .sort((a, b) => b.avg - a.avg); // Sort by score descending
    };

    // 1. 温度帯別の平均スコア
    const tempBuckets = {
        'low': { label: '80℃未満', sum: 0, count: 0 },
        'mid': { label: '80-90℃', sum: 0, count: 0 },
        'high': { label: '90-100℃', sum: 0, count: 0 },
        'extreme': { label: '100℃以上', sum: 0, count: 0 }
    };

    // 2. 水温別の平均スコア
    const waterBuckets = {
        'single': { label: '12℃未満', sum: 0, count: 0 },
        'cool': { label: '12-15℃', sum: 0, count: 0 },
        'standard': { label: '15-18℃', sum: 0, count: 0 },
        'mild': { label: '18℃以上', sum: 0, count: 0 }
    };

    // 3. 体感温度別の平均スコア
    const perceivedTempBuckets = {
        'mild': { label: 'マイルド', sum: 0, count: 0 },
        'average': { label: '普通', sum: 0, count: 0 },
        'hot': { label: '熱め', sum: 0, count: 0 },
        'burning': { label: '激熱', sum: 0, count: 0 }
    };

    // 4. 設備・環境別の平均スコア
    const amenityStats = {
        'has_outdoor_space': { label: '外気浴あり', sum: 0, count: 0 },
        'no_outdoor_space': { label: '外気浴なし', sum: 0, count: 0 },
    };

    visitedSaunas.forEach(s => {
        const score = s.totonoi_score;

        // Sauna Temp
        const sTemp = s.temp !== null && s.temp !== undefined ? Number(s.temp) : null;
        if (sTemp !== null && sTemp > 0) {
            if (sTemp < 80) { tempBuckets.low.sum += score; tempBuckets.low.count++; }
            else if (sTemp < 90) { tempBuckets.mid.sum += score; tempBuckets.mid.count++; }
            else if (sTemp < 100) { tempBuckets.high.sum += score; tempBuckets.high.count++; }
            else { tempBuckets.extreme.sum += score; tempBuckets.extreme.count++; }
        }

        // Perceived Temp (Using separate logic if data exists, otherwise fallback to temp?)
        // Assuming perceived_temp is roughly same scale as temp
        const pTemp = s.perceived_temp ? Number(s.perceived_temp) : sTemp;
        if (pTemp !== null && pTemp > 0) {
            if (pTemp < 85) { perceivedTempBuckets.mild.sum += score; perceivedTempBuckets.mild.count++; }
            else if (pTemp < 95) { perceivedTempBuckets.average.sum += score; perceivedTempBuckets.average.count++; }
            else if (pTemp < 105) { perceivedTempBuckets.hot.sum += score; perceivedTempBuckets.hot.count++; }
            else { perceivedTempBuckets.burning.sum += score; perceivedTempBuckets.burning.count++; }
        }

        // Water Temp
        const rawWTemp = s.water_temp !== undefined ? s.water_temp : s.waterTemp;
        const wTemp = rawWTemp !== null && rawWTemp !== undefined ? Number(rawWTemp) : null;
        if (wTemp !== null && wTemp > -10) { // Allow 0 or negative for ice saunas?
            if (wTemp < 12) { waterBuckets.single.sum += score; waterBuckets.single.count++; }
            else if (wTemp < 15) { waterBuckets.cool.sum += score; waterBuckets.cool.count++; }
            else if (wTemp < 18) { waterBuckets.standard.sum += score; waterBuckets.standard.count++; }
            else { waterBuckets.mild.sum += score; waterBuckets.mild.count++; }
        }

        // Amenities
        const hasOutdoor = s.has_outdoor_space === true || s.hasOutdoorSpace === true;
        if (hasOutdoor) {
            amenityStats.has_outdoor_space.sum += score; amenityStats.has_outdoor_space.count++;
        } else {
            amenityStats.no_outdoor_space.sum += score; amenityStats.no_outdoor_space.count++;
        }
    });

    const calculateAverages = (buckets) => {
        return Object.entries(buckets).map(([key, data]) => ({
            key,
            label: data.label,
            avg: data.count > 0 ? Math.round(data.sum / data.count) : 0,
            count: data.count
        })).filter(d => d.count > 0);
    };

    const tempScores = calculateAverages(tempBuckets);
    const waterScores = calculateAverages(waterBuckets);
    const perceivedTempScores = calculateAverages(perceivedTempBuckets);
    const amenityScores = calculateAverages(amenityStats);

    // Categorical Analysis
    const stoveScores = calcCategoryScores(s => normalizeStoveType(s.stove_type));
    const waterQualityScores = calcCategoryScores(s => normalizeWaterQuality(s.water_quality));
    const chairScores = calcCategoryScores(s => normalizeChairType(s.chair_type));
    const facilityScores = calcCategoryScores(s => normalizeFacilityType(s.facility_type));

    // Conclusions
    const topTemp = [...tempScores].sort((a, b) => b.avg - a.avg)[0];
    const topWater = [...waterScores].sort((a, b) => b.avg - a.avg)[0];
    const topStove = stoveScores[0];
    const topFacility = facilityScores[0];

    const topWaterQuality = waterQualityScores[0];
    const topPerceivedTemp = [...perceivedTempScores].sort((a, b) => b.avg - a.avg)[0];
    const topChair = chairScores[0];
    const outdoorStat = amenityScores.find(a => a.key === 'has_outdoor_space');

    return {
        totalVisits: visitedSaunas.length,
        averageTotonoi: Math.round(visitedSaunas.reduce((acc, s) => acc + s.totonoi_score, 0) / visitedSaunas.length),
        tempScores,
        waterScores,
        perceivedTempScores,
        amenityScores,
        stoveScores: stoveScores.filter(s => s.key !== '不明'),
        waterQualityScores: waterQualityScores.filter(s => s.key !== '不明'),
        chairScores: chairScores.filter(s => s.key !== '不明'),
        facilityScores: facilityScores.filter(s => s.key !== 'その他'),
        summary: {
            favTemp: topTemp?.label,
            favWater: topWater?.label,
            favStove: topStove?.label,
            favFacility: topFacility?.label,
            favWaterQuality: topWaterQuality?.label,
            favPerceivedTemp: topPerceivedTemp?.label,
            favChair: topChair?.label,
            outdoorPreference: outdoorStat && outdoorStat.avg >= 85 ? '外気浴は必須' : (outdoorStat && outdoorStat.avg >= 75 ? '外気浴派' : 'こだわらない'),
            favTempKey: topTemp?.key,
            favWaterKey: topWater?.key
        }
    };
};

/**
 * ユーザーのサウナ属性（アーキタイプ）を診断する
 */
const calculateSaunaArchetype = (analysis) => {
    // 1. Extremist check (High temp & Single water)
    const lovesExtremeHeat = analysis.tempScores.find(t => t.key === 'extreme' && t.avg >= 90);
    const lovesSingleWater = analysis.waterScores.find(w => w.key === 'single' && w.avg >= 90);
    if (lovesExtremeHeat && lovesSingleWater) {
        return {
            type: 'THE_EXTREMIST',
            label: '極限の探求者',
            description: '灼熱のサウナと凍てつく水風呂。常人には耐え難い温度差こそが、あなたを至高の整いへと誘います。',
            color: '#ef4444',
            icon: '🔥'
        };
    }

    // 2. Nature Lover (Outdoor space is crucial)
    const outdoorStat = analysis.amenityScores.find(a => a.key === 'has_outdoor_space');
    if (outdoorStat && outdoorStat.avg >= 90 && outdoorStat.count >= 5) {
        return {
            type: 'THE_NATURE_LOVER',
            label: '森羅万象の旅人',
            description: '風、光、空。自然と一体になる外気浴こそがあなたのサウナの本質。',
            color: '#10b981',
            icon: '🍃'
        };
    }

    // 3. Hydrophile (Water quality focus)
    const softWater = analysis.waterQualityScores.find(w => (w.key === '軟水' || w.key === '天然水/湧水') && w.avg >= 90);
    if (softWater) {
        return {
            type: 'THE_HYDROPHILE',
            label: '水風呂ソムリエ',
            description: '水の肌触り、温度、匂い。水風呂へのこだわりは誰よりも深く、水の恵みに癒やされています。',
            color: '#06b6d4',
            icon: '💧'
        };
    }

    // 4. Traditionalist (Dry/Far Infra)
    const traditionalStove = analysis.stoveScores.find(s => (s.key === '遠赤外線/ガス' || s.key === '薪ストーブ') && s.avg >= 88);
    if (traditionalStove) {
        return {
            type: 'THE_TRADITIONALIST',
            label: '昭和ストロング愛好家',
            description: '飾り気のない、しかし力強い熱。古き良きサウナの熱気こそが、あなたの魂を震わせます。',
            color: '#f97316',
            icon: '🏛️'
        };
    }

    // Default: Balancer
    return {
        type: 'THE_BALANCER',
        label: '調和の賢者',
        description: '極端を求めず、湿度と温度のバランスを愛する。どんなサウナでも自分のペースで整える達人です。',
        color: '#8b5cf6',
        icon: '⚖️'
    };
};

/**
 * スコアの高い順にTop 3の訪問を取得
 */
const getTopRatedSaunas = (saunas) => {
    return saunas
        .filter(s => s.visited && s.totonoi_score !== null)
        .sort((a, b) => b.totonoi_score - a.totonoi_score)
        .slice(0, 3)
        .map(s => ({
            name: s.name,
            score: s.totonoi_score,
            date: new Date(s.visited_at || Date.now()).toLocaleDateString(),
            memo: s.memo || '（メモなし）',
            prefecture: s.prefecture
        }));
};

/**
 * 上位10件の平均から「黄金比」を算出
 */
const calculateGoldenRatio = (saunas) => {
    const topVisits = saunas
        .filter(s => s.visited && s.totonoi_score !== null)
        .sort((a, b) => b.totonoi_score - a.totonoi_score)
        .slice(0, 10); // Top 10

    if (topVisits.length === 0) return { saunaTemp: 90, waterTemp: 16 };

    const sumSauna = topVisits.reduce((acc, s) => acc + (Number(s.temp) || 90), 0);
    const sumWater = topVisits.reduce((acc, s) => acc + (Number(s.water_temp || s.waterTemp) || 16), 0);

    return {
        saunaTemp: Math.round(sumSauna / topVisits.length),
        waterTemp: Math.round((sumWater / topVisits.length) * 10) / 10 // 小数点1位
    };
};

/**
 * 100件制覇時専用の称号・詳細統計を生成する
 */
export const getConquestReport = (saunas) => {
    const analysis = analyzePreferences(saunas);
    if (!analysis) return null;

    const archetype = calculateSaunaArchetype(analysis);
    const topRanking = getTopRatedSaunas(saunas);
    const goldenRatio = calculateGoldenRatio(saunas);

    return {
        ...analysis,
        title: archetype.label,
        message: archetype.description,
        archetype,
        topRanking,
        goldenRatio,
        achievedAt: new Date().toLocaleDateString('ja-JP'),
    };
};

/**
 * 分析結果に基づいて未訪問のおすすめサウナを抽出する
 */
export const getRecommendations = (saunas, analysis) => {
    if (!analysis) return [];

    const unvisitedSaunas = saunas.filter(s => !s.visited && s.is_active !== false);

    const recommendations = unvisitedSaunas.map(s => {
        let matchScore = 50; // ベーススコア

        // 1. サウナ温度マッチング
        if (s.temp) {
            const tempKey = s.temp < 80 ? 'low' : (s.temp < 90 ? 'mid' : (s.temp < 100 ? 'high' : 'extreme'));
            const tempStat = analysis.tempScores.find(ts => ts.key === tempKey);
            if (tempStat) {
                matchScore += (tempStat.avg - 70) * 0.5; // 平均スコアが高い温度帯ならプラス
            }
        }

        // 2. 水温マッチング
        const wTemp = s.water_temp || s.waterTemp;
        if (wTemp) {
            const waterKey = wTemp < 12 ? 'single' : (wTemp < 15 ? 'cool' : (wTemp < 18 ? 'standard' : 'mild'));
            const waterStat = analysis.waterScores.find(ws => ws.key === waterKey);
            if (waterStat) {
                matchScore += (waterStat.avg - 70) * 0.5;
            }
        }

        // 3. 設備マッチング (外気浴)
        if (s.has_outdoor_space || s.hasOutdoorSpace) {
            const stat = analysis.amenityScores.find(as => as.key === 'has_outdoor_space');
            if (stat && stat.avg > 80) matchScore += 10;
        }

        // 4. 人気度（サウナイキタイのイキタイ数）も少し加味
        if (s.sauna_ikitai_likes) {
            matchScore += Math.min(10, s.sauna_ikitai_likes / 1000);
        }

        // 5. 伝説の100サウナならボーナス
        if (s.is_legendary) matchScore += 15;

        return { ...s, recommendationScore: Math.round(matchScore) };
    });

    return recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 3); // Top 3
};
