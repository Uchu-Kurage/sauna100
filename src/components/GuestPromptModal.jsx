import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

const GuestPromptModal = ({ onSignUp, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ zIndex: 3000 }}
            >
                <motion.div
                    className="guest-prompt-content glass"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="btn-close prompt-close" onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className="prompt-body">
                        <div className="prompt-icon-group">
                            <motion.div
                                className="main-icon-circle"
                                animate={{
                                    boxShadow: ["0 0 0 0 rgba(245, 158, 11, 0.4)", "0 0 0 20px rgba(245, 158, 11, 0)"]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={40} color="#f59e0b" fill="#fef3c7" />
                            </motion.div>
                        </div>

                        <h2 className="prompt-title">自分だけのサウナログを<br />始めませんか？</h2>
                        <p className="prompt-desc">
                            アカウントを登録すると、訪れたサウナの記録や「整い」の統計が保存され、
                            いつでもどこでも確認できるようになります。
                        </p>

                        <div className="features-list">
                            <div className="feature-item">
                                <MapPin size={18} color="#f59e0b" />
                                <span>100の伝説的施設を地図上に記録</span>
                            </div>
                            <div className="feature-item">
                                <ShieldCheck size={18} color="#10b981" />
                                <span>クラウド保存でデータ紛失の心配なし</span>
                            </div>
                        </div>

                        <div className="prompt-actions">
                            <button className="btn-primary prompt-cta" onClick={onSignUp}>
                                今すぐ無料で登録する
                                <ArrowRight size={18} />
                            </button>
                            <button className="btn-secondary-text" onClick={onClose}>
                                後で（ゲストとして利用する）
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <style jsx>{`
                .guest-prompt-content {
                    width: 90%;
                    max-width: 440px;
                    background: white;
                    border-radius: 32px;
                    padding: 40px;
                    position: relative;
                    text-align: center;
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.25);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                }
                .prompt-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                }
                .prompt-icon-group {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .main-icon-circle {
                    width: 80px;
                    height: 80px;
                    background: #fffbeb;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .prompt-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 16px;
                    line-height: 1.3;
                }
                .prompt-desc {
                    font-size: 0.95rem;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .features-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 32px;
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 20px;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                    text-align: left;
                }
                .prompt-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .prompt-cta {
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 1.1rem;
                    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);
                }
                .btn-secondary-text {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 10px;
                    transition: color 0.2s;
                }
                .btn-secondary-text:hover {
                    color: #64748b;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default GuestPromptModal;
