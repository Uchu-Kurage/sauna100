import React, { useState, useEffect, useMemo, memo } from 'react';
import Map from './components/Map';
import ProfileModal from './components/ProfileModal';
import SaunaDetailModal from './components/SaunaDetailModal';
import SaunaZukanModal from './components/SaunaZukanModal';
import SaunaAnalysisModal from './components/SaunaAnalysisModal';
import AuthModal from './components/AuthModal';
import { initialMockData, loadSettings, saveSettings, saveSaunasCache, loadSaunasCache } from './utils/storage';
import { supabase } from './utils/supabase';
import { calculateMatchScore, getRecommendationBadge } from './utils/recommendation';
import { Map as MapIcon, Search, User, Trophy, RefreshCw, BarChart3, BookOpen, LogOut, LogIn, Menu } from 'lucide-react';

import ConquestOverlay from './components/ConquestOverlay';
import ConquestRewardModal from './components/ConquestRewardModal';
import GuestPromptModal from './components/GuestPromptModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';

// Memoized Card Component to prevent flickering
const SaunaCard = memo(({ sauna, isSelected, onClick }) => {
  const badge = getRecommendationBadge(sauna.matchScore);
  return (
    <div
      className={`sauna-card ${isSelected ? 'active' : ''} ${sauna.visited ? 'visited' : ''}`}
      onClick={() => onClick(sauna)}
    >
      <div className="card-top">
        <div className="card-title-group">
          <div className="category-micro">
            {sauna.is_legendary && <span style={{ color: '#f59e0b', marginRight: '4px' }}>👑</span>}
            {sauna.prefecture && <span className="pref-tag">{sauna.prefecture}</span>}
            {sauna.facility_type && <span className="pref-tag" style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }}>{sauna.facility_type}</span>}
            {!['伝', '幻'].includes(sauna.category) && (sauna.category || '施設')}
          </div>
          <h3>{sauna.name}</h3>
          {badge && <span className="badge" style={{ backgroundColor: badge.color }}>{badge.label}</span>}
        </div>
        <div className="visit-action" style={{ pointerEvents: 'none' }}>
          <div className={`visit-check ${sauna.visited ? 'checked' : ''} ${sauna.totonoi_score >= 80 ? 'totonotta' : ''}`}></div>
        </div>
      </div>
      <div className="card-stats">
        <div className="stat-pill">
          <BarChart3 size={12} />
          {sauna.matchScore}%
        </div>
        <div className="stat-text">{sauna.temp}℃ / {sauna.water_temp || sauna.waterTemp}℃</div>
      </div>
      {sauna.description && <p className="card-memo line-clamp">{sauna.description}</p>}
    </div>
  );
});

function App() {
  const [saunas, setSaunas] = useState([]);
  const [settings, setSettings] = useState(loadSettings());
  const [showProfile, setShowProfile] = useState(false);
  const [showZukan, setShowZukan] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [showDetail, setShowDetail] = useState(null); // 詳細表示用のサウナ
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Default to false if we have cache
  const [newConquest, setNewConquest] = useState(null); // 新規制覇都道府県
  const [showReward, setShowReward] = useState(false); // 制覇ご褒美画面

  const fetchSaunas = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      // 1. アクティブなサウナ施設一覧を取得
      const { data: saunaData, error: saunaError } = await supabase
        .from('saunas')
        .select('*')
        .eq('is_active', true)
        .limit(1000);

      if (saunaError) throw saunaError;

      // 2. 訪問記録（整いステータス）を取得
      const { data: visitData, error: visitError } = await supabase
        .from('visits')
        .select('*');

      if (visitError) {
        console.warn("Visits fetch error:", visitError.message);
      }

      if (saunaData && saunaData.length > 0) {
        const formattedData = saunaData.map(s => {
          const visit = visitData?.find(v => v.sauna_id === s.id);

          // Map tier to is_legendary for backward compatibility (but rely on tier)
          const isLegendary = s.sauna_tier === 'legendary';

          return {
            ...s,
            waterTemp: s.water_temp,
            visited: !!visit,
            totonoi_status: visit?.totonoi_status || null,
            totonoi_score: visit?.totonoi_score || null,
            memo: visit?.memo || null,
            image_url: visit?.image_url || null,
            prefecture: s.prefecture || null,
            is_legendary: isLegendary,
            sauna_tier: s.sauna_tier || (isLegendary ? 'legendary' : 'normal')
          };
        });
        setSaunas(formattedData);
      } else {
        setSaunas(initialMockData);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setSaunas(initialMockData);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    // 初回認証チェック
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 1. まずキャッシュを読み込む
    const cached = loadSaunasCache();
    if (cached && cached.data) {
      setSaunas(cached.data);
      setIsLoading(false);
      // キャッシュが古い（例えば1時間以上）場合や、常に最新を確認したい場合はバックグラウンド更新
      fetchSaunas(true);
    } else {
      fetchSaunas();
    }

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_IN' || _event === 'PASSWORD_RECOVERY') {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('type') === 'recovery') {
          setAuthMode('update');
          setShowAuth(true);
        } else {
          setAuthMode('login');
        }
      }

      fetchSaunas(true); // ユーザーが変わったらデータを再取得
    });

    // ゲストユーザー向けのプロンプト表示
    const hasPrompted = sessionStorage.getItem('guest_prompt_shown');
    if (!user && !hasPrompted) {
      const timer = setTimeout(() => {
        setShowGuestPrompt(true);
        sessionStorage.setItem('guest_prompt_shown', 'true');
      }, 5000); // 5秒後に表示
      return () => clearTimeout(timer);
    }

    return () => subscription.unsubscribe();
  }, [user]);

  // 既存の fetchSaunas を少し修正してキャッシュ保存を組み込む
  useEffect(() => {
    if (saunas.length > 0) {
      saveSaunasCache(saunas);
    }
  }, [saunas]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfile(false);
  };


  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setShowProfile(false);
  };

  const handleTotonoi = async (saunaId, status, score, comment, imageUrl) => {
    const sauna = saunas.find(s => s.id === saunaId);
    const pref = sauna?.prefecture;

    // 1. ローカル状態を更新
    setSaunas(prev => prev.map(s =>
      s.id === saunaId ? { ...s, totonoi_status: status, totonoi_score: score, memo: comment, image_url: imageUrl, visited: true } : s
    ));

    // 2. 詳細表示中のオブジェクトも更新
    if (showDetail && showDetail.id === saunaId) {
      setShowDetail(prev => ({ ...prev, totonoi_status: status, totonoi_score: score, memo: comment, image_url: imageUrl, visited: true }));
    }

    // 3. 制覇チェック (新たにその都道府県を制覇したか)
    if (pref) {
      const prefSaunas = saunas.filter(s => s.prefecture === pref);
      const visitedCount = prefSaunas.filter(s => s.visited).length;
      // 今回の訪問で「全施設訪問」かつ「以前は未制覇」の状態になるか
      if (visitedCount + (sauna.visited ? 0 : 1) === prefSaunas.length && !conqueredPrefectures.includes(pref)) {
        setNewConquest(pref);
      }
    }

    // 100件制覇チェック (初回達成時のみ表示)
    const isNowAllLegendary = saunas.filter(s => s.visited && s.is_legendary).length + (sauna.visited ? 0 : 1) === 100;
    if (isNowAllLegendary && !isLegendaryComplete) {
      setTimeout(() => setShowReward(true), 3000); // 都道府県制覇演出の後に表示
    }

    // 4. Supabase へ保存 (visitsテーブル) - ログインユーザーのみ
    if (!user) {
      console.warn("Guest user: skipping DB save.");
      return;
    }

    const { error } = await supabase.from('visits').upsert({
      user_id: user?.id, // ログインユーザーがあればセット
      sauna_id: saunaId,
      totonoi_status: status,
      totonoi_score: score,
      memo: comment,
      image_url: imageUrl,
      visited_at: new Date().toISOString()
    }, { onConflict: 'user_id, sauna_id' }); // 制約更新に合わせて変更

    if (error) {
      console.error("Save totonoi error:", error.message);
      // カラム未作成の場合はここでエラーになるが、後にスクリプトで修正予定
    }
  };

  // 伝説のサウナ訪問数を計算
  const legendVisitedCount = useMemo(() => saunas.filter(s => s.visited && s.is_legendary).length, [saunas]);
  // 全伝説サウナ数（通常100だがデータ次第で変動する可能性も考慮）
  const totalLegendCount = useMemo(() => saunas.filter(s => s.is_legendary).length || 100, [saunas]);

  // コンプリート判定
  const isLegendaryComplete = legendVisitedCount >= totalLegendCount && totalLegendCount > 0;

  // 全訪問数（幻を含む）
  const totalVisitedCount = useMemo(() => saunas.filter(s => s.visited).length, [saunas]);

  // 表示用のカウント（コンプリート前は伝説のみ、後は全体）
  const displayCurrentCount = isLegendaryComplete ? totalVisitedCount : legendVisitedCount;
  const displayTotalCount = isLegendaryComplete ? saunas.length : totalLegendCount;
  const progressPercent = displayTotalCount > 0 ? (displayCurrentCount / displayTotalCount) * 100 : 0;

  const filteredSaunas = useMemo(() => {
    const enriched = saunas.map(s => ({
      ...s,
      matchScore: calculateMatchScore(s, settings)
    })).sort((a, b) => b.matchScore - a.matchScore);

    return enriched.filter(s => {
      // 幻のサウナはコンプリートするまで非表示
      if (s.sauna_tier === 'phantom' && !isLegendaryComplete) {
        return false;
      }

      return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [saunas, settings, searchTerm, isLegendaryComplete]);

  // 都道府県ごとの制覇状況を計算
  const conqueredPrefectures = useMemo(() => {
    if (saunas.length === 0) return [];

    const prefGroups = {};
    saunas.forEach(s => {
      if (!s.prefecture) return;
      if (!s.is_legendary) return; // Only count legendary saunas for conquest

      if (!prefGroups[s.prefecture]) {
        prefGroups[s.prefecture] = { total: 0, visited: 0 };
      }
      prefGroups[s.prefecture].total++;
      if (s.visited) prefGroups[s.prefecture].visited++;
    });

    return Object.keys(prefGroups).filter(pref =>
      prefGroups[pref].total > 0 && prefGroups[pref].total === prefGroups[pref].visited
    );
  }, [saunas]);



  return (
    <div className="app-container light-theme">
      <div className="app-water-frame" />
      <header className="app-header glass">
        <div className="logo-group">
          <button
            className="btn-icon mobile-only"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ marginRight: '8px' }}
          >
            <Menu size={24} color="var(--primary)" />
          </button>
          <div className="logo-icon desktop-only"><MapIcon size={24} color="#f59e0b" /></div>
          <h1>人生が整うまでに訪れたい100のサウナ</h1>
        </div>
        <div className="nav-actions">
          <div className="search-bar glass">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="施設を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={`btn-icon ${isLoading ? 'rotating' : ''}`} onClick={fetchSaunas} title="同期">
            <RefreshCw size={20} color="#64748b" />
          </button>
          <button className="btn-icon" onClick={() => setShowAnalysis(true)} title="嗜好分析">
            <BarChart3 size={22} color="var(--primary)" />
          </button>
          <button className="btn-icon" onClick={() => setShowZukan(true)} title="サウナ図鑑">
            <BookOpen size={24} color="#f59e0b" />
          </button>

          {legendVisitedCount === 100 && (
            <button className="btn-icon reward-pulse" onClick={() => setShowReward(true)} title="制覇証明書">
              <Trophy size={24} color="#f59e0b" />
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-icon" onClick={() => setShowProfile(true)} title="マイプロフィール">
                <User size={24} color="#f59e0b" />
              </button>
              <button className="btn-icon" onClick={handleLogout} title="ログアウト">
                <LogOut size={20} color="#64748b" />
              </button>
            </div>
          ) : (
            <button className="btn-icon" onClick={() => { setAuthMode('login'); setShowAuth(true); }} title="ログイン/登録">
              <LogIn size={24} color="#f59e0b" />
            </button>
          )}
        </div>
      </header>

      <main>
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>制覇状況</h2>
              <div className="trophy-group">
                <Trophy size={16} color="#f59e0b" />
                <span>{displayCurrentCount} / {displayTotalCount}</span>
              </div>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              厳選された伝説のサウナを巡り、最高の「整い」を記録せよ。
            </p>
          </div>
          <div className="sauna-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="rotating"><RefreshCw size={32} /></div>
                <p>データを同期中...</p>
              </div>
            ) : (
              <div className="sauna-list-container">
                {filteredSaunas.map(sauna => (
                  <SaunaCard
                    key={sauna.id}
                    sauna={sauna}
                    isSelected={selectedSauna?.id === sauna.id}
                    onClick={(s) => {
                      setSelectedSauna(s);
                      setShowDetail(s);
                      if (window.innerWidth <= 768) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <Map
          saunas={filteredSaunas}
          selectedSauna={selectedSauna}
          conqueredPrefectures={conqueredPrefectures}
          onSelectSauna={(sauna) => {
            setSelectedSauna(sauna);
            setShowDetail(sauna);
          }}
        />
      </main>

      {showProfile && (
        <ProfileModal
          onCancel={() => setShowProfile(false)}
          onPrivacyClick={() => {
            setShowProfile(false);
            setShowPrivacy(true);
          }}
        />
      )}

      {showPrivacy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />
      )}

      {showDetail && (
        <SaunaDetailModal
          sauna={showDetail}
          user={user}
          onClose={() => {
            setShowDetail(null);
            setSelectedSauna(null); // Clear map selection too
          }}
          onTotonoi={handleTotonoi}
        />
      )}

      {showZukan && (
        <SaunaZukanModal
          saunas={saunas}
          isLegendaryComplete={isLegendaryComplete}
          onClose={() => setShowZukan(false)}
          onSelect={(sauna) => {
            setShowZukan(false);
            setSelectedSauna(sauna);
            setShowDetail(sauna);
          }}
        />
      )}

      {showAnalysis && (
        <SaunaAnalysisModal
          saunas={saunas}
          isLegendaryComplete={isLegendaryComplete}
          onClose={() => setShowAnalysis(false)}
          onNavigate={(sauna) => {
            setSelectedSauna(sauna);
            setShowDetail(sauna);
          }}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
        />
      )}

      {newConquest && (
        <ConquestOverlay
          prefecture={newConquest}
          onClose={() => setNewConquest(null)}
        />
      )}

      {showReward && (
        <ConquestRewardModal
          saunas={saunas}
          onClose={() => setShowReward(false)}
        />
      )}

      {showGuestPrompt && !user && (
        <GuestPromptModal
          onSignUp={() => {
            setShowGuestPrompt(false);
            setAuthMode('signup');
            setShowAuth(true);
          }}
          onClose={() => setShowGuestPrompt(false)}
        />
      )}
    </div>
  );
}

export default App;
