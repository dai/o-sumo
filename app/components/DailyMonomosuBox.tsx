import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ZABUTON_STORAGE_KEY = 'osumo_daily_zabuton_count';

export default function DailyMonomosuBox({
  customComment,
}: {
  customComment?: string;
}) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language === 'en';

  const [zabutonCount, setZabutonCount] = useState<number>(12);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [userThought, setUserThought] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ZABUTON_STORAGE_KEY);
      if (saved) {
        setZabutonCount(parseInt(saved, 10));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleThrowZabuton = () => {
    setIsThrowing(true);
    const newCount = zabutonCount + 1;
    setZabutonCount(newCount);
    try {
      localStorage.setItem(ZABUTON_STORAGE_KEY, newCount.toString());
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsThrowing(false);
    }, 600);
  };

  const handleShare = async () => {
    const textToShare = userThought.trim() || t('highlights.monomosuDefaultText');
    const shareContent = `【大相撲 九月場所見どころ】\n${textToShare}\n#大相撲 #sumo #osumo\n${window.location.origin}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareContent);
        setToastMessage(t('highlights.copiedToast'));
        setTimeout(() => setToastMessage(null), 2500);
      } catch {
        // ignore
      }
    }
  };

  const commentText = customComment || t('highlights.monomosuDefaultText');

  return (
    <div className="monomosu-box-wrapper">
      <div className="monomosu-box">
        {/* 縦書き和モダンバッジ */}
        <div className="monomosu-vertical-badge" aria-hidden="true">
          <span>{t('highlights.monomosuBadge')}</span>
        </div>

        {/* 1行コメントメインエリア */}
        <div className="monomosu-content">
          <span className="monomosu-title">{t('highlights.monomosuTitle')}</span>
          <p className="monomosu-text">{commentText}</p>
        </div>

        {/* ギミックアクション */}
        <div className="monomosu-actions">
          {/* 座布団リアクションボタン */}
          <button
            type="button"
            className={`monomosu-zabuton-btn ${isThrowing ? 'is-throwing' : ''}`}
            onClick={handleThrowZabuton}
            title={t('highlights.zabutonAction')}
            aria-label={`${t('highlights.zabutonAction')} (${zabutonCount})`}
          >
            <span className="monomosu-zabuton-icon">💺</span>
            <span className="monomosu-zabuton-label">
              {t('highlights.zabutonCount', { count: zabutonCount })}
            </span>
            {isThrowing && <span className="monomosu-zabuton-fly">💺 +1</span>}
          </button>

          {/* フォームトグル */}
          <button
            type="button"
            className={`monomosu-toggle-btn ${isFormOpen ? 'is-active' : ''}`}
            onClick={() => setIsFormOpen(!isFormOpen)}
            aria-expanded={isFormOpen}
          >
            💬 {isFormOpen ? t('highlights.closeForm') : t('highlights.toggleForm')}
          </button>
        </div>
      </div>

      {/* インライン展開フォーム */}
      {isFormOpen && (
        <div className="monomosu-form-drawer">
          <textarea
            className="monomosu-textarea"
            placeholder={t('highlights.formPlaceholder')}
            rows={2}
            value={userThought}
            onChange={(e) => setUserThought(e.target.value)}
          />
          <div className="monomosu-drawer-footer">
            <span className="monomosu-drawer-hint">
              {isEn ? 'Share your thoughts with the sumo community' : 'あなたの注目ポイントをシェアできます'}
            </span>
            <button
              type="button"
              className="cta-button monomosu-share-btn"
              onClick={handleShare}
            >
              📤 {t('highlights.shareAction')}
            </button>
          </div>
          {toastMessage && (
            <div className="monomosu-toast" role="status">
              ✅ {toastMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
