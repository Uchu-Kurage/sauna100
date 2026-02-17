import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { supabase } from '../utils/supabase';

const ProfileModal = ({ onCancel }) => {
  return (
    <div className="modal-overlay fade-in">
      <div className="modal-container glass">
        <div className="modal-header">
          <div className="title-group">
            <Settings size={20} color="var(--primary)" />
            <h2>ユーザー設定</h2>
          </div>
          <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
        </div>

        <div style={{ padding: '0 0 20px' }}>
          <p className="description">アカウント設定や基本設定の変更が可能です。</p>

          <div className="setting-section" style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, textAlign: 'center' }}>
              現在、高度な設定機能は準備中です。
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
