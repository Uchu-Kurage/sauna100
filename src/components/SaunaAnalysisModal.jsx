import React from 'react';
import { X, BarChart3, Thermometer, Droplet, Zap, Award, Info, TrendingUp, Sparkles, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePreferences, getRecommendations } from '../utils/analysis';

const StatCard = ({ title, value, label, icon: Icon, color }) => (
    <div className="analysis-stat-card">
        <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
            <Icon size={20} />
        </div>
        <div className="stat-content">
            <span className="stat-title">{title}</span>
            <div className="stat-value-row">
                <span className="stat-value">{value}</span>
                <span className="stat-unit">{label}</span>
            </div>
        </div>
    </div>
);

const ScoreBar = ({ label, score, color, count }) => (
    <div className="analysis-bar-item">
        <div className="bar-info">
            <span className="bar-label">{label}</span>
            <span className="bar-score">{score}点 <small>({count}件)</small></span>
        </div>
        <div className="bar-track">
            <motion.div
                className="bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                style={{ background: color }}
            />
        </div>
    </div>
);

const RecommendationCard = ({ sauna, onSelect }) => (
    <div className="recommendation-card" onClick={() => onSelect(sauna)}>
        <div className="rec-info">
            <div className="rec-header">
                <span className="rec-score">マッチ度 {sauna.recommendationScore}%</span>

            </div>
            <h4>{sauna.name}</h4>
            <div className="rec-address">
                <MapPin size={12} />
                <span>{sauna.prefecture}</span>
                {!['伝', '幻'].includes(sauna.category) && <span className="rec-cat">{sauna.category}</span>}
            </div>
            <div className="rec-features">
                <span>{sauna.temp}℃</span>
                <span>/</span>
                <span>{sauna.water_temp}℃</span>
            </div>
        </div>
        <div className="rec-action">
            <Navigation size={18} />
            <span>Map</span>
        </div>
    </div>
);

const SaunaAnalysisModal = ({ saunas, isLegendaryComplete, onClose, onNavigate }) => {
    const [activeTab, setActiveTab] = React.useState('analysis');
    const analysis = analyzePreferences(saunas);
    const recSaunas = isLegendaryComplete ? saunas : saunas.filter(s => s.sauna_tier !== 'phantom');
    const recommendations = getRecommendations(recSaunas, analysis);

    if (!analysis) {
        return (
            <AnimatePresence>
                <motion.div className="modal-overlay" onClick={onClose}>
                    <motion.div className="modal-content glass analysis-empty" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <h2>サウナ嗜好分析</h2>
                            <button className="btn-close" onClick={onClose}><X size={24} /></button>
                        </header>
                        <div className="modal-body center">
                            <BarChart3 size={48} color="#94a3b8" />
                            <p>分析に十分な訪問データ（整いスコア付き）がありません。<br />サウナを訪れてスコアを記録してみましょう！</p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass analysis-view"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="modal-header">
                        <div className="header-title-group">
                            <div className="analysis-badge">
                                <Sparkles size={14} />
                                <span>AI Analysis</span>
                            </div>
                            <h2>サウナ嗜好分析報告</h2>
                        </div>
                        <button className="btn-close" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="analysis-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analysis')}
                        >
                            <TrendingUp size={16} />
                            分析結果
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recommendations')}
                        >
                            <Sparkles size={16} />
                            おすすめ
                            {recommendations.length > 0 && <span className="tab-count">{recommendations.length}</span>}
                        </button>
                    </div>

                    <div className="modal-body scrollable">
                        <AnimatePresence mode="wait">
                            {activeTab === 'analysis' ? (
                                <motion.div
                                    key="analysis-tab"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="analysis-intro">
                                        <TrendingUp size={24} color="var(--primary)" />
                                        <p>
                                            これまでの <strong>{analysis.totalVisits}回</strong> の訪問データから、
                                            あなたの整い傾向を分析しました。
                                        </p>
                                    </div>

                                    <div className="stats-grid">
                                        <StatCard
                                            title="平均整い度"
                                            value={analysis.averageTotonoi}
                                            label="%"
                                            icon={Zap}
                                            color="#f59e0b"
                                        />
                                        <StatCard
                                            title="好みの温度"
                                            value={analysis.summary.favTemp || '---'}
                                            label=""
                                            icon={Thermometer}
                                            color="#ef4444"
                                        />
                                        <StatCard
                                            title="好みの水温"
                                            value={analysis.summary.favWater || '---'}
                                            label=""
                                            icon={Droplet}
                                            color="#06b6d4"
                                        />
                                    </div>

                                    {/* 温度分析セクション */}
                                    <section className="analysis-section">
                                        <div className="section-header">
                                            <Thermometer size={18} color="#ef4444" />
                                            <h3>温度の好み</h3>
                                        </div>
                                        <div className="sub-section-title">サウナ室温度</div>
                                        <div className="bars-container">
                                            {analysis.tempScores.map(d => (
                                                <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#f87171" />
                                            ))}
                                        </div>
                                    </section>

                                    {/* 水風呂・水質セクション */}
                                    <section className="analysis-section">
                                        <div className="section-header">
                                            <Droplet size={18} color="#06b6d4" />
                                            <h3>水風呂・水質</h3>
                                        </div>
                                        <div className="sub-section-title">水温</div>
                                        <div className="bars-container">
                                            {analysis.waterScores.map(d => (
                                                <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#22d3ee" />
                                            ))}
                                        </div>
                                    </section>

                                    {/* 環境・設備セクション */}
                                    <section className="analysis-section">
                                        <div className="section-header">
                                            <Award size={18} color="#10b981" />
                                            <h3>環境・設備</h3>
                                        </div>

                                        <div className="sub-section-title">外気浴</div>
                                        {analysis.amenityScores.length > 0 && (
                                            <div className="bars-container">
                                                {analysis.amenityScores.map(d => (
                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#34d399" />
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Advanced Analysis - Locked by default */}
                                    {!isLegendaryComplete ? (
                                        <section className="analysis-section locked-content">
                                            <div className="locked-overlay">
                                                <div className="locked-icon-bg">
                                                    <Award size={32} color="#94a3b8" />
                                                </div>
                                                <h4>詳細分析レポートはロックされています</h4>
                                                <p>伝説のサウナ100施設を制覇すると、<br />ストーブ種類、水質、体感温度など、<br />より詳細な分析データが解禁されます。</p>
                                            </div>
                                        </section>
                                    ) : (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <section className="analysis-section">
                                                    <div className="section-header">
                                                        <Sparkles size={18} color="#8b5cf6" />
                                                        <h3>詳細分析レポート</h3>
                                                        <span className="analysis-badge" style={{ marginLeft: 'auto', background: '#f3e8ff', color: '#7c3aed', border: 'none' }}>UNLOCKED</span>
                                                    </div>

                                                    {/* Perceived Temp */}
                                                    {analysis.perceivedTempScores.length > 0 && (
                                                        <>
                                                            <div className="sub-section-title" style={{ marginTop: '16px' }}>体感温度</div>
                                                            <div className="bars-container">
                                                                {analysis.perceivedTempScores.map(d => (
                                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#fb923c" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Stripe Type */}
                                                    {analysis.stoveScores.length > 0 && (
                                                        <>
                                                            <div className="sub-section-title" style={{ marginTop: '16px' }}>ストーブ種類</div>
                                                            <div className="bars-container">
                                                                {analysis.stoveScores.map(d => (
                                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#fca5a5" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Water Quality */}
                                                    {analysis.waterQualityScores.length > 0 && (
                                                        <>
                                                            <div className="sub-section-title" style={{ marginTop: '16px' }}>水質</div>
                                                            <div className="bars-container">
                                                                {analysis.waterQualityScores.map(d => (
                                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#67e8f9" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Chairs */}
                                                    {analysis.chairScores.length > 0 && (
                                                        <>
                                                            <div className="sub-section-title" style={{ marginTop: '16px' }}>ととのい椅子</div>
                                                            <div className="bars-container">
                                                                {analysis.chairScores.map(d => (
                                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#4ade80" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Facility Type */}
                                                    {analysis.facilityScores.length > 0 && (
                                                        <>
                                                            <div className="sub-section-title" style={{ marginTop: '16px' }}>施設タイプ</div>
                                                            <div className="bars-container">
                                                                {analysis.facilityScores.map(d => (
                                                                    <ScoreBar key={d.key} label={d.label} score={d.avg} count={d.count} color="#a78bfa" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </section>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recommendations-tab"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <section className="analysis-section recommendations no-margin">
                                        <div className="section-header">
                                            <Sparkles size={18} color="var(--primary)" />
                                            <h3>あなたへのおすすめ未訪問サウナ</h3>
                                        </div>
                                        <p className="section-desc">あなたの好みに近い未訪問施設をAIがピックアップしました。</p>
                                        <div className="recommendations-list">
                                            {recommendations.length > 0 ? recommendations.map(s => (
                                                <RecommendationCard
                                                    key={s.id}
                                                    sauna={s}
                                                    onSelect={(target) => {
                                                        onNavigate(target);
                                                        onClose();
                                                    }}
                                                />
                                            )) : (
                                                <div className="empty-recommendations">
                                                    現在、条件に合うおすすめ施設が見つかりません。
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <footer className="modal-footer">
                        <p className="analysis-footer-note">
                            ※データが増えるほど、より正確な分析が可能になります。
                        </p>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SaunaAnalysisModal;
