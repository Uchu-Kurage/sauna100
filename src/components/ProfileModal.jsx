import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ProfileModal = ({ onCancel }) => {
  const [isSeeding, setIsSeeding] = useState(false);

  // Debug function to seed 99 visits (Strictly Legendary)
  const handleSeedVisits = async () => {
    if (!window.confirm('【注意】既存の訪問データを全て削除し、伝説のサウナ（Legendary）を99件訪問した状態にリセットします。\nよろしいですか？')) return;

    setIsSeeding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('ログインしてください');
        return;
      }

      // 0. Reset existing visits
      const { error: deleteError } = await supabase
        .from('visits')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // 1. Get Legendary Saunas
      const { data: saunas, error: saunasError } = await supabase
        .from('saunas')
        .select('id')
        .eq('sauna_tier', 'legendary')
        .order('id', { ascending: true })
        .limit(99);

      if (saunasError) throw saunasError;

      if (saunas.length < 99) {
        console.warn(`Only ${saunas.length} legendary saunas found in DB.`);
        alert(`注意: データベースに伝説のサウナが ${saunas.length} 件しかありません。`);
      }

      // 2. Prepare visits
      const visits = saunas.map(s => ({
        user_id: user.id,
        sauna_id: s.id,
        visited_at: new Date().toISOString(),
        totonoi_score: Math.floor(Math.random() * 30) + 70, // 70-99
        totonoi_status: 'totonotta',
        memo: 'Debug Seed Visit (Legendary)'
      }));

      // 3. Insert
      const { error: insertError } = await supabase
        .from('visits')
        .upsert(visits, { onConflict: 'user_id, sauna_id' });

      if (insertError) throw insertError;

      alert(`完了: 既存データをリセットし、${visits.length}件の訪問データを生成しました。\nページをリロードして反映を確認してください。`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(`エラーが発生しました:\nCode: ${err.code}\nMessage: ${err.message}\nDetails: ${err.details || ''}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-container glass">
        <div className="modal-header">
          <div className="title-group">
            <Settings size={20} color="var(--primary)" />
            <h2>設定・デバッグ</h2>
          </div>
          <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
        </div>

        <div style={{ padding: '0 0 20px' }}>
          <p className="description">開発者用ツール・設定メニューです。</p>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleSeedVisits}
              disabled={isSeeding}
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', background: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
            >
              {isSeeding ? 'データ生成中...' : '🛠️ Debug: 伝説のサウナ訪問履歴を生成 (99件)'}
            </button>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
              ※既存の訪問データは全て削除（リセット）されます。
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.22);
          z-index: 3000;
          padding: 20px;
          backdrop-filter: blur(12px);
        }
        .modal-container {
          width: 100%;
          max-width: 440px;
          padding: 32px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .title-group h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .description {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
