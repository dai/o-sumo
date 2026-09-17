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

/**
 * Return the newest published blog post, or undefined if the feed is empty.
 * blogFeed.items is sorted at build time in `blog-feed.ts` by publishedAt desc
 * with a slug tie-break, so `items[0]` is the implicit "latest" contract.
 */
export function getLatestBlogPost(): BlogFeedItem | undefined {
  return blogFeed.items[0];
}
