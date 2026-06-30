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
}

export const newsFeed: NewsFeed = newsJson as NewsFeed;