import React from 'react';
import { X, Thermometer, Droplet, Wind, Coffee, Award, Zap, Info, MapPin, Clock, ExternalLink, Camera, Upload, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';

const Section = ({ title, icon: Icon, children }) => (
    <div className="detail-section">
        <div className="section-header">
            <Icon size={18} color="var(--primary)" />
            <h4>{title}</h4>
        </div>
        <div className="section-content">
            {children}
        </div>
    </div>
);

const InfoItem = ({ label, value, unit = '' }) => (
    <div className="info-item">
        <span className="info-label">{label}</span>
        <span className="info-value">{value || '不明'}{value && unit}</span>
    </div>
);

const SaunaDetailModal = ({ sauna, user, onClose, onTotonoi }) => {
    const [score, setScore] = React.useState(sauna?.totonoi_score || (sauna.visited ? 80 : 0));
    const [comment, setComment] = React.useState(sauna?.memo || '');
    const [imageFile, setImageFile] = React.useState(null);
    const [imagePreview, setImagePreview] = React.useState(sauna?.image_url || null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const getChairsValue = () => {
        const chairs = new Set();
        if (sauna.infinity_chair_count > 0) chairs.add("インフィニティ");
        if (sauna.adirondack_chair_count > 0) chairs.add("アディロンダック");

        const normalize = (val) => {
            const v = val.toLowerCase();
            if (v.includes('inf') || v.includes('インフィニティ')) return 'インフィニティ';
            if (v.includes('deck') || v.includes('デッキ')) return 'デッキチェア';
            if (v.includes('adir') || v.includes('アディロン')) return 'アディロンダック';
            if (v.includes('ベンチ')) return 'ベンチ';
            if (v.includes('椅') || v.includes('プラ')) return '通常イス';
            return val;
        };

        if (sauna.chair_type) {
            sauna.chair_type.split(/[、,]/).forEach(t => {
                const trimmed = t.trim();
                if (trimmed) chairs.add(normalize(trimmed));
            });
        }
        return Array.from(chairs).join('、') || 'なし';
    };

    if (!sauna) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSave = async () => {
        setIsUploading(true);
        let imageUrl = imagePreview;

        try {
            if (imageFile && user) {
                const fileExt = imageFile.name.split('.').pop();
                const timestamp = Date.now();
                const fileName = `${sauna.id}-${timestamp}.${fileExt}`;
                // Better organization: users/[uuid]/saunas/[sauna_id]/photo.ext
                const filePath = `users/${user.id}/saunas/${sauna.id}/${timestamp}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('sauna-photos')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('sauna-photos')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            await onTotonoi(sauna.id, 'totonotta', score, comment, imageUrl);
            setShowSuccess(true);

            // Auto close after animation
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Error uploading image:', error.message);
            alert('画像のアップロードに失敗しました。');
        } finally {
            setIsUploading(false);
        }
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
                    className="modal-content glass detailed-view"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Success Animation Overlay */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                className="success-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="stamp-container">
                                    <motion.div
                                        className="stamp-graphic"
                                        initial={{ scale: 5, rotate: 0, opacity: 0 }}
                                        animate={{ scale: 1, rotate: -15, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.2
                                        }}
                                    >
                                        STAMPED
                                    </motion.div>
                                    <motion.div
                                        className="stamp-text"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        サウナ図鑑に登録されました！
                                    </motion.div>

                                    {/* Particles */}
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="particle"
                                            style={{
                                                background: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'][i % 4],
                                                left: '50%',
                                                top: '50%'
                                            }}
                                            initial={{ x: 0, y: 0, scale: 0 }}
                                            animate={{
                                                x: (Math.random() - 0.5) * 400,
                                                y: (Math.random() - 0.5) * 400,
                                                scale: [0, 1.5, 0],
                                                rotate: Math.random() * 360
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                delay: 0.5,
                                                ease: "easeOut"
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <header className="modal-header">
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                {sauna.prefecture && <span className="pref-badge">{sauna.prefecture}</span>}
                                {sauna.facility_type && <span className="facility-type-badge">{sauna.facility_type}</span>}
                                {!['伝', '幻'].includes(sauna.category) && <span className="category-tag">{sauna.category}</span>}
                                {sauna.is_legendary && <span className="legendary-badge">🏆 LEGENDARY 100</span>}
                            </div>
                            <h2>{sauna.name}</h2>
                            <div className="address-line">
                                <MapPin size={14} />
                                <span>{sauna.address}</span>
                            </div>
                            {sauna.access && (
                                <div className="address-line" style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                                    <ExternalLink size={14} />
                                    <span>{sauna.access}</span>
                                </div>
                            )}
                        </div>
                        <button className="btn-close" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="totonoi-action-bar-enhanced">


                        <div className="totonoi-inputs-wrapper">
                            <div className="totonoi-input-group">
                                <div className="totonoi-score-slider">
                                    <div className="slider-label">
                                        <span>整い度: <strong>{score}%</strong></span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={score}
                                        onChange={(e) => setScore(parseInt(e.target.value))}
                                        className="score-slider"
                                    />
                                </div>
                            </div>

                            <div className="totonoi-comment-group">
                                <textarea
                                    placeholder="整い体験や感想をメモ..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="totonoi-textarea"
                                />

                                <div className="photo-upload-strip" onClick={() => !imagePreview && user && fileInputRef.current.click()}>
                                    {imagePreview ? (
                                        <div className="preview-strip-content">
                                            <img src={imagePreview} alt="Preview" className="preview-strip-img" />
                                            <button className="btn-remove-photo-strip" onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder-strip" onClick={() => !user && alert('ログインすると写真を保存できます')}>
                                            <Camera size={20} />
                                            <span>写真を追加</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        disabled={!user}
                                    />
                                </div>
                                <button
                                    className={`btn-save-totonoi ${sauna.visited ? 'is-update' : ''}`}
                                    onClick={handleSave}
                                    disabled={isUploading || !user}
                                >
                                    {isUploading ? <Upload className="rotating" size={16} /> : (sauna.visited ? <CheckCircle size={16} /> : <Zap size={16} />)}
                                    {isUploading ? '保存中...' : (sauna.visited ? '記録を更新' : '訪問を記録')}
                                </button>
                                {!user && (
                                    <div className="guest-login-mini-notice">
                                        🔒 ログインが必要です
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-body scrollable">
                        {(imagePreview || sauna.image_url) && (
                            <div className="sauna-hero-container">
                                <img
                                    src={imagePreview || sauna.image_url}
                                    alt={sauna.name}
                                    className="sauna-hero-image"
                                />
                                {imagePreview && (
                                    <div className="hero-badge">PREVIEW</div>
                                )}
                            </div>
                        )}

                        {!sauna.visited && (
                            <div className="unvisited-notice" style={{ marginBottom: '24px', margin: (imagePreview || sauna.image_url) ? '0 0 24px 0' : '0 0 24px 0' }}>
                                💡 この施設はまだ記録されていません。記録を保存すると図鑑がアンロックされます。
                            </div>
                        )}


                        {sauna.description && (
                            <div className="description-view top-description">
                                <p>{sauna.description}</p>
                            </div>
                        )}

                        <div className="grid-layout">
                            {/* Category 2: Sauna Spec (Moved to Top) */}
                            <Section title="サウナ室スペック" icon={Thermometer}>
                                <div className="flex-row">
                                    <InfoItem label="温度" value={sauna.temp} unit="℃" />
                                    <InfoItem label="体感温度" value={sauna.perceived_temp} unit="℃" />
                                </div>


                                <InfoItem label="ストーブ" value={sauna.stove_type} />

                                {sauna.heat_quality && (
                                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', fontSize: '0.9rem', color: '#b45309' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={12} /> サウナメモ
                                        </div>
                                        {sauna.heat_quality}
                                    </div>
                                )}
                            </Section>

                            {/* Category 3: Water Bath (Moved to Top) */}
                            <Section title="水風呂スペック" icon={Droplet}>
                                <div className="flex-row">
                                    <InfoItem label="水温" value={sauna.water_temp} unit="℃" />
                                    <InfoItem label="水深" value={sauna.depth} unit="cm" />
                                </div>
                                <InfoItem label="水質" value={sauna.water_quality} />
                                {sauna.water_quality_2 && (
                                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.9rem', color: '#0369a1' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Info size={12} /> 水質メモ
                                        </div>
                                        {sauna.water_quality_2}
                                    </div>
                                )}
                            </Section>

                            {/* Category 4: Rest Space (Middle - Spans 2 Columns) */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <Section title="外気浴・休憩" icon={Wind}>
                                    <div className="flex-row">
                                        <InfoItem label="外気浴" value={sauna.has_outdoor_space ? 'あり' : 'なし'} />
                                        <InfoItem label="椅子" value={getChairsValue()} />
                                    </div>
                                    {sauna.view_desc && (
                                        <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.9rem', color: '#15803d' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Info size={12} /> 景観メモ
                                            </div>
                                            {sauna.view_desc}
                                        </div>
                                    )}
                                </Section>
                            </div>

                            {/* Category 1 & 5: Basic Info & Amenities (Bottom - Side by Side) */}
                            <Section title="基本情報・追加料金" icon={Info}>
                                <InfoItem label="営業時間" value={sauna.opening_hours} />
                                <div className="flex-row">
                                    <InfoItem label="深夜営業" value={sauna.has_midnight_access ? 'あり' : 'なし'} />
                                    <InfoItem label="レディースデー" value={sauna.has_ladies_day ? 'あり' : 'なし'} />
                                </div>
                                <div className="flex-row">
                                    <InfoItem label="入浴料" value={sauna.base_fee} unit="円" />
                                    <InfoItem label="サウナ加算" value={sauna.sauna_extra_fee} unit="円" />
                                </div>
                            </Section>

                            <Section title="サービス・アメニティ" icon={Coffee}>

                                <div className="flex-row">
                                    <InfoItem label="食事処" value={sauna.has_restaurant ? 'あり' : 'なし'} />
                                    <InfoItem label="ワークスペース" value={sauna.has_workspace ? 'あり' : 'なし'} />
                                </div>
                                {sauna.special_menu && (
                                    <InfoItem
                                        label="おすすめ"
                                        value={sauna.special_menu.includes('/') ? sauna.special_menu.split('/')[0].trim() : sauna.special_menu}
                                    />
                                )}
                            </Section>
                        </div>

                    </div>

                    <footer className="modal-footer">
                        {sauna.official_url && (
                            <a href={sauna.official_url} target="_blank" rel="noopener noreferrer" className="btn-official">
                                公式サイト
                                <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                            </a>
                        )}
                    </footer>
                </motion.div>
            </motion.div >
        </AnimatePresence >
    );
};

export default SaunaDetailModal;
