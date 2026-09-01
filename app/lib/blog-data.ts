import blogJson from '../../public/api/v1/blog.json';

export interface BlogFeedItem {
  slug: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  author: 'dai';
}

export interface BlogFeed {
  updatedAt: string;
  items: BlogFeedItem[];
}

export const blogFeed: BlogFeed = blogJson as BlogFeed;
