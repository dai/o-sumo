import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from '../lib/rikishi-profile';
import { toRomaji } from '../lib/romaji';
import { matchesSearch, normalizeSearchText } from '../lib/search';

const RESULT_LIMIT = 8;

function searchRikishiByName(rikishi: readonly RikishiIndexItem[], query: string): RikishiIndexItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalizedQuery = normalizeSearchText(trimmed);
  const rank = (item: RikishiIndexItem) => {
    const name = normalizeSearchText(item.name);
    if (name === normalizedQuery) return 0;
    if (name.startsWith(normalizedQuery)) return 1;
    return 2;
  };
  return rikishi
    .filter((item) => matchesSearch(trimmed, item.name, item.yomi, toRomaji(item.yomi)))
    .sort((left, right) => rank(left) - rank(right) || left.name.localeCompare(right.name, 'ja'))
    .slice(0, RESULT_LIMIT);
}

type RikishiSearchDialogProps = {
  dialogId: string;
  onClose: () => void;
};

export default function RikishiSearchDialog({ dialogId, onClose }: RikishiSearchDialogProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const titleId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rikishi, setRikishi] = useState<RikishiIndexItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchRikishiByName(rikishi, query), [query, rikishi]);

  useEffect(() => {
    let active = true;
    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        setRikishi(data.rikishi);
        setStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const goToFirstResult = () => {
    const first = results[0];
    if (!first) return;
    navigate(rikishiProfilePath(first.id));
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.key === 'Process') return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    goToFirstResult();
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  const trimmedQuery = query.trim();

  return createPortal(
    <div className="rikishi-search-backdrop" onClick={onClose}>
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rikishi-search-dialog"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="rikishi-search-dialog__header">
          <h2 id={titleId}>{t('global.search.title')}</h2>
          <button type="button" className="rikishi-search-dialog__close" onClick={onClose}>
            {t('global.search.close')}
          </button>
        </div>
        <label className="rikishi-search-dialog__field">
          <span className="sr-only">{t('global.search.label')}</span>
          <input
            ref={inputRef}
            type="search"
            role="searchbox"
            value={query}
            placeholder={t('global.search.placeholder')}
            aria-controls={listId}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </label>
        {status === 'loading' ? <p className="rikishi-search-dialog__status" role="status">{t('global.search.loading')}</p> : null}
        {status === 'error' ? (
          <p className="rikishi-search-dialog__status" role="alert">{t('global.search.error')}</p>
        ) : null}
        {status === 'ready' && trimmedQuery && results.length === 0 ? (
          <p className="rikishi-search-dialog__status">{t('global.search.empty')}</p>
        ) : null}
        {results.length > 0 ? (
          <ul id={listId} className="rikishi-search-dialog__results">
            {results.map((item) => (
              <li key={item.id}>
                <Link className="rikishi-search-dialog__result" to={rikishiProfilePath(item.id)}>
                  <span>{item.name}</span>
                  <span className="rikishi-search-dialog__meta">{item.currentRank}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
