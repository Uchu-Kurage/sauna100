import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { X, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot' | 'update'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            } else if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('確認メールを送信しました。メールボックスを確認してください。');
            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage('パスワード再設定用のメールを送信しました。');
            } else if (mode === 'update') {
                const { error } = await supabase.auth.updateUser({
                    password: password,
                });
                if (error) throw error;
                setMessage('パスワードを更新しました。新しいパスワードでログインしてください。');
                setTimeout(() => setMode('login'), 2000);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const TITLES = {
        login: 'ログイン',
        signup: '新規登録',
        forgot: 'パスワード再設定',
        update: '新しいパスワードの設定'
    };

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
                    className="modal-content glass auth-modal"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="modal-header">
                        <h2>{TITLES[mode]}</h2>
                        <button className="btn-close" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="modal-body">
                        {message ? (
                            <div className="auth-success-view">
                                <div className="success-icon">✨</div>
                                <p>{message}</p>
                                {mode !== 'update' && (
                                    <button className="btn-primary" onClick={onClose} style={{ marginTop: '20px' }}>
                                        閉じる
                                    </button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleAuth} className="auth-form">
                                {mode !== 'update' && (
                                    <div className="input-group">
                                        <label><Mail size={16} /> メールアドレス</label>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                {mode !== 'forgot' && (
                                    <div className="input-group">
                                        <label><Lock size={16} /> {mode === 'update' ? '新しいパスワード' : 'パスワード'}</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                {mode === 'login' && (
                                    <div className="auth-helper-links">
                                        <button type="button" className="link-btn" onClick={() => setMode('forgot')}>
                                            パスワードを忘れましたか？
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <div className="auth-error">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                                    {loading ? '処理中...' : (
                                        mode === 'login' ? 'ログインする' :
                                            mode === 'signup' ? '登録する' :
                                                mode === 'forgot' ? '再設定メールを送信' : 'パスワードを更新'
                                    )}
                                </button>
                            </form>
                        )}

                        {!message && (
                            <div className="auth-switch">
                                <p>
                                    {mode === 'login' ? 'アカウントをお持ちでないですか？' :
                                        mode === 'signup' ? '既にアカウントをお持ちですか？' : ''}

                                    {mode === 'login' && <button onClick={() => setMode('signup')}>新規登録はこちら</button>}
                                    {mode === 'signup' && <button onClick={() => setMode('login')}>ログインはこちら</button>}
                                    {mode === 'forgot' && <button onClick={() => setMode('login')}>ログインに戻る</button>}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
