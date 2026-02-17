import React from 'react';
import { X, Trophy, CheckCircle, Lock, ExternalLink, Flame, Sparkles } from 'lucide-react';

const SaunaZukanModal = ({ saunas, isLegendaryComplete, onClose, onSelect }) => {
  const [activeTab, setActiveTab] = React.useState('legendary');

  const legendarySaunas = saunas.filter(s => s.sauna_tier === 'legendary' || s.is_legendary);
  const phantomSaunas = saunas.filter(s => s.sauna_tier === 'phantom');

  const currentSaunas = activeTab === 'legendary' ? legendarySaunas : phantomSaunas;
  const totalCount = currentSaunas.length;
  const visitedCount = currentSaunas.filter(s => s.visited).length;
  const progressPercent = totalCount > 0 ? (visitedCount / totalCount) * 100 : 0;

  return (
    <div className="zukan-overlay">
      <div className={`zukan-modal glass ${activeTab}-theme`}>
        <header className="zukan-header">
          <div className="zukan-title-group">
            <Trophy size={24} color={activeTab === 'phantom' ? '#a855f7' : '#f59e0b'} />
            <h2>{activeTab === 'phantom' ? '幻のサウナ図鑑' : '伝説のサウナ図鑑'}</h2>
          </div>

          {isLegendaryComplete && (
            <div className="zukan-tabs">
              <button
                className={`zukan-tab-btn ${activeTab === 'legendary' ? 'active' : ''}`}
                onClick={() => setActiveTab('legendary')}
              >
                伝説 100
              </button>
              <button
                className={`zukan-tab-btn phantom ${activeTab === 'phantom' ? 'active' : ''}`}
                onClick={() => setActiveTab('phantom')}
              >
                幻 51
              </button>
            </div>
          )}

          <div className="zukan-progress-section">
            <div className="zukan-stats">
              <span>収集状況: {visitedCount} / {totalCount}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="zukan-progress-bar">
              <div className="zukan-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          <button className="zukan-close" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="zukan-grid">
          {currentSaunas.map((sauna, index) => {
            const num = (index + 1).toString().padStart(3, '0');
            const isVisited = sauna.visited;

            return (
              <div
                key={sauna.id}
                className={`zukan-card ${isVisited ? 'unlocked' : 'locked'} tier-${activeTab}`}
                onClick={() => isVisited && onSelect(sauna)}
              >
                <div className="zukan-card-num">No.{num}</div>
                <div className="zukan-card-image-box">
                  {isVisited ? (
                    sauna.image_url ? (
                      <img src={sauna.image_url} alt={sauna.name} className="zukan-photo" />
                    ) : (
                      <div className="zukan-inner-image" style={{
                        background: activeTab === 'phantom' ? 'linear-gradient(135deg, #7e22ce, #a855f7)' : `linear-gradient(135deg, #f59e0b, #fbbf24)`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                        borderRadius: '8px',
                        color: 'white',
                        gap: '4px'
                      }}>
                        {activeTab === 'phantom' ? (
                          <>
                            <Sparkles size={32} className="sparkle-animate" />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.9 }}>PHANTOM</span>
                          </>
                        ) : (
                          <>
                            <Flame size={32} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.9 }}>LEGENDARY</span>
                          </>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="zukan-silhouette">
                      <Lock size={32} color="#94a3b8" />
                    </div>
                  )}
                </div>
                <div className="zukan-card-info">
                  <div className="zukan-name">
                    {isVisited ? sauna.name : '??????'}
                  </div>
                  <div className="zukan-pref">
                    {isVisited ? `[${sauna.prefecture}]` : '---'}
                  </div>
                </div>
                {isVisited && <div className="zukan-stamp">COLLECTED</div>}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .zukan-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .zukan-modal {
          width: 100%;
          max-width: 1100px;
          height: 90vh;
          background: #f8fafc;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .zukan-modal.phantom-theme {
          background: #0f172a;
          border-color: rgba(168, 85, 247, 0.4);
        }

        .zukan-header {
          padding: 24px 32px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .phantom-theme .zukan-header {
          background: #1e293b;
          border-bottom-color: #334155;
        }

        .phantom-theme .zukan-title-group h2 {
          color: #f8fafc;
        }

        .zukan-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
          gap: 4px;
        }

        .phantom-theme .zukan-tabs {
          background: #334155;
        }

        .zukan-tab-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .zukan-tab-btn.active {
          background: white;
          color: #f59e0b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .phantom-theme .zukan-tab-btn {
          color: #94a3b8;
        }

        .phantom-theme .zukan-tab-btn.active {
          background: #475569;
          color: #a855f7;
        }

        .zukan-tab-btn.phantom.active {
          color: #a855f7;
        }

        .zukan-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .zukan-title-group h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 900;
          color: #1e293b;
          letter-spacing: -0.02em;
        }

        .zukan-progress-section {
          flex: 1;
          max-width: 300px;
        }

        .zukan-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 6px;
        }

        .phantom-theme .zukan-stats {
          color: #94a3b8;
        }

        .zukan-progress-bar {
          height: 10px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
        }

        .phantom-theme .zukan-progress-bar {
          background: #334155;
        }

        .zukan-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #facc15);
          border-radius: 10px;
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .phantom-theme .zukan-progress-fill {
          background: linear-gradient(90deg, #7e22ce, #a855f7);
        }

        .zukan-close {
          background: #f1f5f9;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .phantom-theme .zukan-close {
          background: #334155;
          color: #94a3b8;
        }

        .zukan-close:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .phantom-theme .zukan-close:hover {
          background: #475569;
          color: #f8fafc;
        }

        .zukan-grid {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 20px;
          background: #f1f5f9;
        }

        .phantom-theme .zukan-grid {
          background: #0f172a;
        }

        .zukan-grid::-webkit-scrollbar { width: 8px; }
        .zukan-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .phantom-theme .zukan-grid::-webkit-scrollbar-thumb { background: #334155; }

        .zukan-card {
          background: white;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }

        .phantom-theme .zukan-card {
          background: #1e293b;
        }

        .zukan-card.unlocked {
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .zukan-card.unlocked:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: #f59e0b;
        }

        .phantom-theme .zukan-card.unlocked:hover {
          border-color: #a855f7;
        }

        .zukan-card.locked {
          opacity: 0.7;
          background: #e2e8f0;
        }

        .phantom-theme .zukan-card.locked {
          background: #0f172a;
          border: 1px dashed #334155;
        }

        .zukan-card-num {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          font-family: monospace;
        }

        .zukan-card-image-box {
          aspect-ratio: 1;
          background: #f8fafc;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .phantom-theme .zukan-card-image-box {
          background: #0f172a;
        }

        .zukan-silhouette {
          filter: brightness(0) opacity(0.2);
        }

        .phantom-theme .zukan-silhouette {
          filter: brightness(0) invert(1) opacity(0.2);
        }

        .zukan-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .zukan-card-info {
          text-align: center;
        }

        .zukan-name {
          font-size: 0.85rem;
          font-weight: 800;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .phantom-theme .zukan-name {
          color: #f8fafc;
        }

        .zukan-pref {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 2px;
        }

        .zukan-stamp {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-20deg);
          border: 3px solid rgba(16, 185, 129, 0.4);
          color: rgba(16, 185, 129, 0.4);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 900;
          font-size: 0.8rem;
          pointer-events: none;
          letter-spacing: 0.1em;
        }

        .tier-phantom .zukan-stamp {
          border-color: rgba(168, 85, 247, 0.4);
          color: rgba(168, 85, 247, 0.4);
        }

        .sparkle-animate {
          animation: sparkle 2s infinite ease-in-out;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 0px white); }
          50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 8px white); }
        }
      `}</style>
    </div>
  );
};

export default SaunaZukanModal;
