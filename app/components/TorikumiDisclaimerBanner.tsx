import { useTranslation } from 'react-i18next';

export interface TorikumiDisclaimerBannerProps {
  mode: 'result' | 'schedule';
  variant?: 'top' | 'below-table';
}

export function TorikumiDisclaimerBanner({
  mode,
  variant = 'top',
}: TorikumiDisclaimerBannerProps) {
  const { t } = useTranslation('common');
  const text = t('torikumi.shared.disclaimer');
  const variantClass = variant === 'below-table'
    ? 'torikumi-disclaimer-banner--below-table'
    : 'torikumi-disclaimer-banner--top';
  return (
    <aside
      className={`torikumi-disclaimer-banner ${variantClass}`}
      role="note"
      aria-label={text}
      data-mode={mode}
    >
      {text}
    </aside>
  );
}

export default TorikumiDisclaimerBanner;