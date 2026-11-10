import { useTranslation } from 'react-i18next';
import { newsFeed } from '../lib/news-data';
import type { NewsItem } from '../lib/news-data';
import { formatDisplayTimestamp, formatInstantDate } from '../lib/relative-date';

const ASSOCIATION_SOURCE_ID = 'sumo-association';
const SUMO_NEWS_SOURCE_ID = 'dmenu-docomo';
const ASSOCIATION_SEE_ALL_URL = 'https://www.sumo.or.jp/IrohaKyokaiInformation/wrap/';
const SUMO_NEWS_SEE_ALL_URL = 'https://sumo.sports.smt.docomo.ne.jp/news/';

function formatFetchedAt(iso: string, locale: string): string {
  const formatted = formatDisplayTimestamp(iso, locale);
  return formatted === iso ? '' : formatted;
}

function externalNewsPausedNote(updatedAt: string, locale: string): string {
  const fetchedAt = formatFetchedAt(updatedAt, locale);
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
    const formatted = formatInstantDate(iso, locale);
    if (formatted !== iso) return formatted;
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