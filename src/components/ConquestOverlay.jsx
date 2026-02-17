import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, X } from 'lucide-react';

const ConquestOverlay = ({ prefecture, onClose }) => {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // Since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className="conquest-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2900,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '20px'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '50%',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <motion.div
                    initial={{ scale: 0.5, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    style={{ maxWidth: '500px' }}
                >
                    <motion.div
                        animate={{
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ marginBottom: '24px', display: 'inline-block' }}
                    >
                        <Trophy size={80} color="#f59e0b" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))' }} />
                    </motion.div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        PREFECTURE<br />
                        CONQUEST!
                    </h1>

                    <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '2px solid #f59e0b', borderRadius: '24px', padding: '24px', marginBottom: '32px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: 'white', padding: '2px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                            称号：伝説のサウナー
                        </div>
                        <p style={{ fontSize: '1.2rem', margin: 0 }}>
                            おめでとうございます！<br />
                            あなたは <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.8rem' }}>{prefecture}</span> の<br />
                            すべての伝説のサウナを制覇しました！
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                            >
                                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '40px',
                            padding: '14px 40px',
                            background: 'white',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                        }}
                    >
                        旅を続ける
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConquestOverlay;
