import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DailyMonomosuBox({
  monthKey,
  day,
  shareTitle,
  customComment,
}: {
  monthKey: string;
  day: number;
  shareTitle: string;
  customComment?: string;
}) {
  const { t, i18n } = useTranslation('common');
  const isEn = i18n.language === 'en';

  const storageKey = `osumo_daily_zabuton_count:${monthKey}:${day}`;
  const [zabutonCount, setZabutonCount] = useState<number>(0);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [userThought, setUserThought] = useState<string>('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied' | 'fallback'>('idle');
  const [manualCopyContent, setManualCopyContent] = useState('');

  useEffect(() => {
    try {
      const parsed = Number.parseInt(localStorage.getItem(storageKey) ?? '', 10);
      setZabutonCount(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
    } catch {
      setZabutonCount(0);
    }
  }, [storageKey]);

  const handleThrowZabuton = () => {
    setIsThrowing(true);
    const newCount = zabutonCount + 1;
    setZabutonCount(newCount);
    try {
      localStorage.setItem(storageKey, newCount.toString());
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsThrowing(false);
    }, 600);
  };

  const handleShare = async () => {
    const textToShare = userThought.trim() || customComment || t('highlights.monomosuDefaultText');
    const url = window.location.href;
    const shareContent = `${shareTitle}\n${textToShare}\n${t('highlights.shareHashtags')}\n${url}`;
    setShareStatus('idle');
    setManualCopyContent('');

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: textToShare, url });
        setShareStatus('shared');
        return;
      } catch (error) {
        if (
          typeof error === 'object'
          && error !== null
          && 'name' in error
          && error.name === 'AbortError'
        ) return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareContent);
      setShareStatus('copied');
    } catch {
      setManualCopyContent(shareContent);
      setShareStatus('fallback');
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
            aria-label={`${t('highlights.zabutonDeviceAction')} (${zabutonCount})`}
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
            aria-label={isFormOpen ? t('highlights.closeForm') : t('highlights.toggleForm')}
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
              aria-label={t('highlights.shareAction')}
            >
              📤 {t('highlights.shareAction')}
            </button>
          </div>
          {shareStatus === 'shared' || shareStatus === 'copied' ? (
            <div className="monomosu-toast" role="status">
              {shareStatus === 'shared' ? t('highlights.sharedToast') : t('highlights.copiedToast')}
            </div>
          ) : null}
          {shareStatus === 'fallback' ? (
            <label className="share-current-link__fallback monomosu-manual-copy">
              <span>{t('highlights.manualCopy')}</span>
              <textarea
                value={manualCopyContent}
                readOnly
                rows={4}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          ) : null}
        </div>
      )}
    </div>
  );
}
