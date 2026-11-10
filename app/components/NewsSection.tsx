import { useTranslation } from 'react-i18next';
import { newsFeed } from '../lib/news-data';
import type { NewsItem } from '../lib/news-data';

const ASSOCIATION_SOURCE_ID = 'sumo-association';
const SUMO_NEWS_SOURCE_ID = 'dmenu-docomo';
const ASSOCIATION_SEE_ALL_URL = 'https://www.sumo.or.jp/IrohaKyokaiInformation/wrap/';
const SUMO_NEWS_SEE_ALL_URL = 'https://sumo.sports.smt.docomo.ne.jp/news/';

function formatFetchedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Tokyo',
  }).formatToParts(d);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const year = value('year');
  const month = value('month');
  const day = value('day');
  const hour = value('hour');
  const minute = value('minute');
  if (!year || !month || !day || !hour || !minute) return '';
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function externalNewsPausedNote(updatedAt: string, locale: string): string {
  const fetchedAt = formatFetchedAt(updatedAt);
  if (locale.startsWith('ja')) {
    return fetchedAt
      ? `ニュース取得を一時停止中・最終取得 ${fetchedAt}`
      : 'ニュース取得を一時停止中';
  }
  return fetchedAt
    ? `News updates paused · last fetched ${fetchedAt}`
    : 'News updates paused';
}

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

type SubsectionProps = {
  id: string;
  title: string;
  lead: string;
  seeAllLabel: string;
  seeAllHref: string;
  emptyLabel: string;
  items: NewsItem[];
  locale: string;
};

function NewsSubsection({
  id,
  title,
  lead,
  seeAllLabel,
  seeAllHref,
  emptyLabel,
  items,
  locale,
}: SubsectionProps) {
  const titleId = `news-subsection-${id}-title`;
  const hasItems = items.length > 0;
  return (
    <div className="news-subsection" aria-labelledby={titleId}>
          <div className="news-subsection-header">
        <div className="news-subsection-heading">
          <h3 id={titleId} className="news-subsection-title">
            {title}
          </h3>
          <p className="news-subsection-lead">{lead}</p>
        </div>
        {hasItems && (
          <a
            className="news-subsection-see-all"
            href={seeAllHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {seeAllLabel}
          </a>
        )}
          </div>

      {hasItems ? (
              <ul className="news-list" aria-labelledby={titleId}>
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
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="news-empty" role="status">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

export default function NewsSection() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ja';
  const items = newsFeed.items;

  const associationItems = items.filter((item) => item.sourceId === ASSOCIATION_SOURCE_ID);
  const sumoNewsItems = items.filter((item) => item.sourceId === SUMO_NEWS_SOURCE_ID);

  return (
    <section className="news-section" aria-labelledby="news-section-title">
          <div className="news-section-header">
        <h2 id="news-section-title" className="news-section-title">
          {t('home.newsSectionTitle')}
        </h2>
          </div>

      <NewsSubsection
        id="association"
        title={t('home.newsSubsectionAssociationTitle')}
        lead={t('home.newsSubsectionAssociationLead')}
        seeAllLabel={t('home.newsSeeAll')}
        seeAllHref={ASSOCIATION_SEE_ALL_URL}
        emptyLabel={t('home.newsEmpty')}
        items={associationItems}
        locale={locale}
      />

      {sumoNewsItems.length > 0 ? (
        <NewsSubsection
          id="sumo-news"
          title={t('home.newsSubsectionSumoNewsTitle')}
          lead={t('home.newsSubsectionSumoNewsLead')}
          seeAllLabel={t('home.newsSubsectionSumoNewsSeeAll')}
          seeAllHref={SUMO_NEWS_SEE_ALL_URL}
          emptyLabel={t('home.newsEmpty')}
          items={sumoNewsItems}
          locale={locale}
        />
      ) : (
        <p className="news-outage" role="status">
          {externalNewsPausedNote(newsFeed.updatedAt, locale)}
        </p>
      )}
    </section>
  );
}