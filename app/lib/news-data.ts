import newsJson from '../../public/api/v1/news.json';

export interface NewsSourceStatus {
  id: string;
  label: string;
  ok: boolean;
  count?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  publishedAtRaw?: string;
  sourceId: string;
  sourceLabel: string;
}

export interface NewsFeed {
  updatedAt: string;
  sources: NewsSourceStatus[];
  items: NewsItem[];
  /**
   * Number of consecutive runs in which every upstream source failed and
   * `update_news_feed.py --allow-stale-on-failure` kept the previous items.
   * `0` when at least one source succeeded in the most recent run. Consumers
   * may surface this to the user when it is greater than 0 to signal that the
   * displayed feed is no longer freshly fetched.
   */
  lastFailureStreak?: number;
}

export const newsFeed: NewsFeed = newsJson as NewsFeed;