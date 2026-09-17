import { useTranslation } from 'react-i18next';
import { blogFeed } from '../lib/blog-data';

const BLOG_INDEX_URL = 'https://blog.osada.us/';

export default function GreetingSection() {
  const { t } = useTranslation('common');
  const latest = [...blogFeed.items]
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))[0];

  if (!latest) return null;

  return (
    <section className="greeting-section" aria-labelledby="greeting-title">
      <div className="greeting-header">
        <h2 id="greeting-title" className="greeting-title">
          {t('greeting.title')}
        </h2>
        <a className="greeting-all-link" href={BLOG_INDEX_URL}>
          {t('greeting.viewAll')}
        </a>
      </div>
      <article className="greeting-card">
        <div className="greeting-card-header">
          <span className="greeting-editor">
            {t('greeting.editorLabel', { author: latest.author })}
          </span>
          <time className="greeting-date" dateTime={latest.publishedAt}>
            {t('greeting.publishedOn', { date: latest.publishedAt })}
          </time>
        </div>
        <h3 className="greeting-card-title">
          <a className="greeting-card-link" href={latest.url} lang="ja">
            {latest.title}
          </a>
        </h3>
        <p className="greeting-card-description">{latest.description}</p>
      </article>
    </section>
  );
}
