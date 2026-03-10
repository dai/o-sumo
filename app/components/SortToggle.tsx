import React from 'react';
import type { SortOrder } from '../lib/sorting';

interface SortToggleProps {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  label?: string;
}

export default function SortToggle({ value, onChange, label = '並び順' }: SortToggleProps) {
  return (
    <div className="sort-toggle" aria-label={label}>
      <span className="sort-toggle-label">{label}</span>
      <div className="sort-toggle-buttons" role="group" aria-label={`${label}の切り替え`}>
        <button
          type="button"
          className={`sort-toggle-button${value === 'asc' ? ' active' : ''}`}
          aria-pressed={value === 'asc'}
          onClick={() => onChange('asc')}
        >
          昇順
        </button>
        <button
          type="button"
          className={`sort-toggle-button${value === 'desc' ? ' active' : ''}`}
          aria-pressed={value === 'desc'}
          onClick={() => onChange('desc')}
        >
          降順
        </button>
      </div>
    </div>
  );
}
