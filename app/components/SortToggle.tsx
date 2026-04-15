import { useTranslation } from 'react-i18next';
import type { SortOrder } from '../lib/sorting';

interface SortToggleProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  label?: string;
}

export default function SortToggle({ value, onChange, label }: SortToggleProps) {
  const { t } = useTranslation('common');
  const defaultLabel = t('sortToggle.label');

  return (
    <div className="sort-toggle" aria-label={label ?? defaultLabel}>
      <span className="sort-toggle-label">{label ?? defaultLabel}</span>
      <div className="sort-toggle-buttons" role="group" aria-label={`${label ?? defaultLabel}の切り替え`}>
        <button
          type="button"
          className={`sort-toggle-button${value === 'asc' ? ' active' : ''}`}
          aria-pressed={value === 'asc'}
          onClick={() => onChange('asc')}
        >
          {t('sortToggle.asc')}
        </button>
        <button
          type="button"
          className={`sort-toggle-button${value === 'desc' ? ' active' : ''}`}
          aria-pressed={value === 'desc'}
          onClick={() => onChange('desc')}
        >
          {t('sortToggle.desc')}
        </button>
      </div>
    </div>
  );
}
