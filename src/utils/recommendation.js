export const calculateMatchScore = (sauna, settings) => {
    let score = 100;

    // Temperature matching (lower score for deviation)
    // Only penalize if data exists
    if (sauna.temp) {
        score -= Math.abs(sauna.temp - settings.idealTemp) * 2;
    } else {
        score -= 20; // Default penalty for missing data
    }

    if (sauna.waterTemp) {
        score -= Math.abs(sauna.waterTemp - settings.idealWaterTemp) * 4;
    } else {
        score -= 20; // Default penalty for missing data
    }

    // Equipment matching
    if (settings.needsAirBath && !sauna.hasAirBath) score -= 15;
    if (settings.needsAutoLoyly && !sauna.hasAutoLoyly) score -= 10;

    return Math.max(0, Math.min(100, Math.round(score)));
};

export const getRecommendationBadge = (score) => {
    if (score >= 90) return { label: '超おすすめ', color: '#ef4444' };
    if (score >= 75) return { label: '相性抜群', color: '#f59e0b' };
    return null;
};
