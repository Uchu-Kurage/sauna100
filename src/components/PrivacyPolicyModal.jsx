import React from 'react';
import { X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyPolicyModal = ({ onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ zIndex: 4000 }}
            >
                <motion.div
                    className="modal-content glass privacy-modal"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <header className="modal-header">
                        <div className="title-group">
                            <Shield size={20} color="var(--primary)" />
                            <h2>プライバシーポリシー</h2>
                        </div>
                        <button className="btn-close" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="modal-body scrollable">
                        <section>
                            <h3>1. 収集する情報</h3>
                            <p>本アプリケーション（以下「本アプリ」）は、以下の情報を収集します：</p>
                            <ul>
                                <li><strong>アカウント情報:</strong> メールアドレス、ユーザーID（本人確認およびデータ同期のため）</li>
                                <li><strong>利用データ:</strong> サウナの訪問記録、スコア、コメント、アップロードされた写真</li>
                                <li><strong>端末情報:</strong> ブラウザの種類、OS、アクセス日時（動作安定化および分析のため）</li>
                            </ul>
                        </section>

                        <section>
                            <h3>2. 情報の利用目的</h3>
                            <p>収集した情報は、以下の目的で利用されます：</p>
                            <ul>
                                <li>ユーザー本人の訪問記録の管理および図鑑機能の提供</li>
                                <li>「サウナ嗜好分析」機能による個別最適化された推薦の提供</li>
                                <li>サービス改善のための統計データの作成</li>
                            </ul>
                        </section>

                        <section>
                            <h3>3. データの管理と保存</h3>
                            <p>本アプリは、バックエンドサービスとして Supabase を利用しています。データは Supabase のセキュアなサーバーに保存され、適切なアクセス制御（RLS）によって保護されています。アップロードされた写真はユーザー個別のパスに保存され、第三者が不当にアクセスすることはできません。</p>
                        </section>

                        <section>
                            <h3>4. 第三者への提供</h3>
                            <p>法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。</p>
                        </section>

                        <section>
                            <h3>5. お問い合わせ</h3>
                            <p>本ポリシーに関するご質問は、開発者までお問い合わせください。</p>
                        </section>

                        <div className="privacy-footer">
                            <p>最終更新日: 2026年2月17日</p>
                        </div>
                    </div>
                </motion.div>

                <style jsx>{`
          .privacy-modal {
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
          }
          .modal-body section {
            margin-bottom: 24px;
          }
          .modal-body h3 {
            font-size: 1.1rem;
            color: #0f172a;
            margin-bottom: 12px;
            font-weight: 700;
          }
          .modal-body p, .modal-body li {
            font-size: 0.9rem;
            color: #475569;
            line-height: 1.6;
          }
          .modal-body ul {
            padding-left: 20px;
            margin-top: 8px;
          }
          .privacy-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: right;
          }
          .privacy-footer p {
            font-size: 0.8rem;
            color: #94a3b8;
          }
        `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default PrivacyPolicyModal;
