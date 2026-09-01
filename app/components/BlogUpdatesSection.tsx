import { useTranslation } from 'react-i18next';
import { blogFeed } from '../lib/blog-data';

const BLOG_INDEX_URL = 'https://blog.osada.us/';
const MAX_VISIBLE_STORIES = 9;

export default function BlogUpdatesSection() {
  const { t } = useTranslation('common');
  const items = [...blogFeed.items]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, MAX_VISIBLE_STORIES);

  if (items.length === 0) return null;

  return (
    <section className="blog-updates-section" aria-labelledby="blog-updates-title">
      <div className="blog-updates-header">
        <h2 id="blog-updates-title" className="blog-updates-title">
          {t('home.blogUpdatesTitle')}
        </h2>
        <a className="blog-updates-all-link" href={BLOG_INDEX_URL}>
          {t('home.blogUpdatesAll')}
        </a>
      </div>
      <ul className="blog-updates-list" aria-labelledby="blog-updates-title">
        {items.map((item) => (
          <li key={item.slug} className="blog-updates-item">
            <time className="blog-updates-date" dateTime={item.publishedAt}>{item.publishedAt}</time>
            <a className="blog-updates-item-link" href={item.url} lang="ja">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
