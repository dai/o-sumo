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
 * Returns the newest public blog post.
 *
 * `blogFeed.items` is sorted newest-first at build time (see `app/lib/blog-feed.ts`
 * `buildBlogFeed` plus the slug tie-break), so the first item is the most
 * recent. This helper centralises the contract so callers do not have to
 * rely on the implicit ordering.
 */
export function getLatestBlogPost(): BlogFeedItem | undefined {
  return blogFeed.items[0];
}
