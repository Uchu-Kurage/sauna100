import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Trophy, Star, TrendingUp, Calendar, Zap, Thermometer, Droplet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConquestReport } from '../utils/analysis';

const ConquestRewardModal = ({ saunas, onClose }) => {
    const [activeTab, setActiveTab] = React.useState('certificate');
    const report = getConquestReport(saunas);

    React.useEffect(() => {
        // モーダル表示時に一度だけ豪華な紙吹雪
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    if (!report) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="reward-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="reward-modal"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    onClick={e => e.stopPropagation()}
                >
                    <header className="reward-header">
                        <div className="reward-tabs">
                            <button
                                className={`reward-tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
                                onClick={() => setActiveTab('certificate')}
                            >
                                <Award size={18} />
                                表彰状
                            </button>
                            <button
                                className={`reward-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                                onClick={() => setActiveTab('report')}
                            >
                                <TrendingUp size={18} />
                                完遂レポート
                            </button>
                        </div>
                        <button className="reward-close" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="reward-body scrollable">
                        {activeTab === 'certificate' ? (
                            <motion.div
                                className="certificate-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="certificate"
                            >
                                <div className="cert-border">
                                    <div className="cert-inner">
                                        <div className="cert-top-icon">
                                            <Trophy size={64} color="#f59e0b" />
                                        </div>
                                        <h1 className="cert-title">認定証</h1>
                                        <h2 className="cert-subtitle">伝説の100サウナ 制覇</h2>

                                        <div className="cert-content">
                                            <p className="cert-main-text">
                                                あなたは「人生が整うまでに行きたい100のサウナ」に選定された
                                                すべての伝説的施設を巡り、そのすべてにおいて「整い」を記録しました。
                                            </p>
                                            <p className="cert-honor-text">
                                                この不屈の精神とサウナへの深い愛を、ここに称えます。
                                            </p>
                                        </div>

                                        <div className="cert-rank-box">
                                            <span className="rank-label">称号</span>
                                            <div className="rank-value">{report.title}</div>
                                            <p className="rank-desc">{report.message}</p>
                                        </div>

                                        <div className="unlock-notification">
                                            <div className="unlock-icon">🔓</div>
                                            <div className="unlock-text">
                                                <strong>幻のサウナ 解放</strong>
                                                <p>地図上に隠されていた51の秘湯が出現しました。</p>
                                            </div>
                                        </div>

                                        <div className="cert-footer">
                                            <div className="cert-date">
                                                <Calendar size={14} />
                                                達成日: {report.achievedAt}
                                            </div>
                                            <div className="cert-stamp-group">
                                                <div className="cert-stamp">TO-TO-NOI</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="report-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key="report"
                            >
                                <div className="report-container">
                                    {/* 1. ARCHETYPE CARD */}
                                    <div className="archetype-card" style={{ borderColor: report.archetype.color, background: `${report.archetype.color}10` }}>
                                        <div className="archetype-icon">{report.archetype.icon}</div>
                                        <div className="archetype-info">
                                            <div className="archetype-label">あなたのサウナ人格</div>
                                            <h3 className="archetype-title" style={{ color: report.archetype.color }}>{report.archetype.label}</h3>
                                            <p className="archetype-desc">{report.archetype.description}</p>
                                        </div>
                                    </div>

                                    {/* 2. PREFERENCE PROFILE */}
                                    <section className="report-section">
                                        <h4 className="section-title">
                                            <Zap size={18} /> こだわり分析
                                        </h4>
                                        <div className="pref-grid">
                                            <div className="pref-item">
                                                <span className="pref-label">好きな施設</span>
                                                <span className="pref-value">{report.summary.favFacility || '判別不能'}</span>
                                            </div>
                                            <div className="pref-item">
                                                <span className="pref-label">好きなストーブ</span>
                                                <span className="pref-value">{report.summary.favStove || '判別不能'}</span>
                                            </div>
                                            <div className="pref-item">
                                                <span className="pref-label">好きな水質</span>
                                                <span className="pref-value">{report.summary.favWaterQuality || '判別不能'}</span>
                                            </div>
                                            <div className="pref-item">
                                                <span className="pref-label">好きな熱さ</span>
                                                <span className="pref-value">{report.summary.favPerceivedTemp || '判別不能'}</span>
                                            </div>
                                            <div className="pref-item">
                                                <span className="pref-label">好きな椅子</span>
                                                <span className="pref-value">{report.summary.favChair || '判別不能'}</span>
                                            </div>
                                            <div className="pref-item">
                                                <span className="pref-label">外気浴</span>
                                                <span className="pref-value">{report.summary.outdoorPreference}</span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 3. GOLDEN RATIO */}
                                    <section className="report-section">
                                        <h4 className="section-title">
                                            <TrendingUp size={18} /> 黄金の整い比率
                                        </h4>
                                        <div className="golden-ratio-box">
                                            <div className="ratio-item hot">
                                                <span className="ratio-label">サウナ室</span>
                                                <span className="ratio-value">{report.goldenRatio.saunaTemp}℃</span>
                                            </div>
                                            <div className="ratio-divider">×</div>
                                            <div className="ratio-item cold">
                                                <span className="ratio-label">水風呂</span>
                                                <span className="ratio-value">{report.goldenRatio.waterTemp}℃</span>
                                            </div>
                                        </div>
                                        <p className="ratio-caption">
                                            あなたの整いスコアが最も高まる「黄金の温度バランス」です。<br />
                                            温度差 <strong>{(report.goldenRatio.saunaTemp - report.goldenRatio.waterTemp).toFixed(1)}℃</strong> の落差が、最高のトランス状態を生み出します。
                                        </p>
                                    </section>

                                    {/* 3. MY BEST 3 */}
                                    <section className="report-section">
                                        <h4 className="section-title">
                                            <Star size={18} /> MY BEST 3
                                        </h4>
                                        <div className="best-ranking">
                                            {report.topRanking.map((item, index) => (
                                                <div className="ranking-item" key={index}>
                                                    <div className={`rank-badge rank-${index + 1}`}>{index + 1}</div>
                                                    <div className="rank-content">
                                                        <div className="rank-header">
                                                            <span className="rank-name">{item.name}</span>
                                                            <span className="rank-score">{item.score}点</span>
                                                        </div>
                                                        <div className="rank-meta">
                                                            <span className="rank-pref">{item.prefecture}</span>
                                                            <span className="rank-date">{item.date}</span>
                                                        </div>
                                                        <div className="rank-memo">"{item.memo}"</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <style jsx>{`
                    .reward-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
                    .reward-modal { width: 95%; max-width: 800px; height: 85vh; background: #fff; border-radius: 32px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5); }
                    
                    .reward-header { padding: 20px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                    .reward-tabs { display: flex; gap: 8px; }
                    .reward-tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; border: none; background: #f8fafc; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                    .reward-tab-btn.active { background: #f59e0b; color: #fff; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
                    .reward-close { background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
                    .reward-close:hover { color: #1e293b; }

                    .reward-body { flex: 1; overflow-y: auto; padding: 40px; background: #fdfcf7; }
                    
                    /* Certificate Style */
                    .certificate-view { height: 100%; display: flex; align-items: center; justify-content: center; }
                    .cert-border { width: 100%; max-width: 600px; padding: 8px; background: linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b); border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
                    .cert-inner { background: #fff; padding: 48px; border: 2px solid #fef3c7; position: relative; text-align: center; }
                    .cert-inner::before { content: ''; position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1px solid #fde68a; pointer-events: none; }
                    
                    .cert-top-icon { margin-bottom: 24px; filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.2)); }
                    .cert-title { font-size: 3.5rem; font-family: "Sawarabi Mincho", serif; color: #1e293b; margin: 0; letter-spacing: 0.2em; font-weight: 900; }
                    .cert-subtitle { font-size: 1.25rem; color: #b45309; margin: 12px 0 32px; font-weight: 700; letter-spacing: 0.1em; }
                    
                    .cert-main-text { font-size: 1.1rem; line-height: 2; color: #475569; margin-bottom: 24px; text-align: justify; }
                    .cert-honor-text { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 40px; }
                    
                    .cert-rank-box { background: #fffef3; border: 1px solid #fef3c7; padding: 24px; border-radius: 16px; margin: 32px 0; position: relative; overflow: hidden; }
                    .rank-label { font-size: 0.75rem; color: #b45309; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
                    .rank-value { font-size: 2rem; font-weight: 900; color: #1e293b; margin: 8px 0; }
                    .rank-desc { font-size: 0.9rem; color: #64748b; margin: 0; }
                    
                    .unlock-notification { background: #f0fdf4; border: 1px dashed #4ade80; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 16px; margin-top: 24px; text-align: left; }
                    .unlock-icon { font-size: 24px; background: #fff; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .unlock-text strong { color: #15803d; display: block; margin-bottom: 4px; }
                    .unlock-text p { margin: 0; font-size: 0.9rem; color: #166534; }
                    
                    .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; }
                    .cert-date { font-size: 0.9rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
                    .cert-stamp { width: 80px; height: 80px; border: 4px double #ef4444; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.7rem; transform: rotate(-15deg); opacity: 0.6; }

                    /* Report Style */
                    .report-container { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
                    
                    /* Archetype Card */
                    .archetype-card { display: flex; align-items: flex-start; gap: 24px; padding: 32px; border-radius: 24px; border: 2px solid #e2e8f0; position: relative; overflow: hidden; }
                    .archetype-icon { font-size: 4rem; line-height: 1; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); }
                    .archetype-info { flex: 1; }
                    .archetype-label { font-size: 0.8rem; font-weight: 800; color: #64748b; letter-spacing: 0.1em; margin-bottom: 8px; }
                    .archetype-title { font-size: 2rem; font-weight: 900; margin: 0 0 16px 0; line-height: 1.1; }
                    .archetype-desc { font-size: 1rem; color: #475569; line-height: 1.6; margin: 0; }

                    /* Section Common */
                    .report-section { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
                    .section-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; }
                    
                    /* Golden Ratio */
                    .golden-ratio-box { display: flex; align-items: center; justify-content: center; gap: 24px; margin: 24px 0; }
                    .ratio-item { display: flex; flex-direction: column; align-items: center; }
                    .ratio-label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; margin-bottom: 4px; }
                    .ratio-value { font-size: 2.5rem; font-weight: 900; line-height: 1; }
                    .ratio-item.hot .ratio-value { color: #ef4444; }
                    .ratio-item.cold .ratio-value { color: #06b6d4; }
                    .ratio-divider { font-size: 1.5rem; color: #cbd5e1; font-weight: 300; margin-top: 10px; }
                    .ratio-caption { text-align: center; font-size: 0.9rem; color: #64748b; line-height: 1.6; margin: 0; }
                    
                    /* Preference Grid */
                    .pref-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; }
                    .pref-item { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #f8fafc; border-radius: 12px; }
                    .pref-label { font-size: 0.75rem; color: #64748b; font-weight: 700; }
                    .pref-value { font-size: 1rem; color: #1e293b; font-weight: 900; }

                    /* Best 3 Ranking */
                    .best-ranking { display: flex; flex-direction: column; gap: 16px; }
                    .ranking-item { display: flex; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
                    .ranking-item:last-child { border-bottom: none; padding-bottom: 0; }
                    
                    .rank-badge { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; color: white; flex-shrink: 0; margin-top: 2px; }
                    .rank-1 { background: linear-gradient(135deg, #fbbf24, #d97706); box-shadow: 0 4px 8px rgba(251, 191, 36, 0.4); }
                    .rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); }
                    .rank-3 { background: linear-gradient(135deg, #b45309, #78350f); }
                    
                    .rank-content { flex: 1; }
                    .rank-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; }
                    .rank-name { font-weight: 800; color: #1e293b; font-size: 1.1rem; }
                    .rank-score { font-weight: 700; color: #f59e0b; font-size: 1.1rem; }
                    .rank-meta { display: flex; gap: 12px; font-size: 0.8rem; color: #94a3b8; margin-bottom: 8px; }
                    .rank-memo { font-size: 0.9rem; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 8px; font-style: italic; }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConquestRewardModal;
