import { useTranslation } from 'react-i18next';
import { newsFeed } from '../lib/news-data';

function formatPublishedAt(iso: string | null, raw: string | undefined, locale: string): string {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      if (locale.startsWith('ja')) {
        const yyyy = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mo}-${da}`;
      }
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Tokyo',
      }).format(d);
    }
  }
  return raw ?? '';
}

export default function NewsSection() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ja';
  const items = newsFeed.items;

  return (
    <section className="news-section" aria-labelledby="news-section-title">
      <div className="news-section-header">
        <h2 id="news-section-title" className="news-section-title">
          {t('home.newsSectionTitle')}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="news-empty" role="status">
          {t('home.newsEmpty')}
        </p>
      ) : (
        <ul className="news-list">
          {items.map((item) => {
                      const dateLabel = formatPublishedAt(item.publishedAt, item.publishedAtRaw, locale);
                      return (
                        <li key={item.id} className="news-item">
                          <a
                            className="news-item-link"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="news-item-date">{dateLabel}</span>
                            <span className="news-item-title">{item.title}</span>
                            <span className="news-item-source">{item.sourceLabel}</span>
                          </a>
                        </li>
                      );
                    })}
        </ul>
      )}
    </section>
  );
}