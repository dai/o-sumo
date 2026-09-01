import { resolve } from 'node:path'
import { buildBlogFeed, writeBlogFeedJson } from '../app/lib/blog-feed'

const root = resolve(import.meta.dirname, '..')
const postsDirectory = resolve(root, 'blog/posts')
const outputPath = resolve(root, 'public/api/v1/blog.json')

writeBlogFeedJson(buildBlogFeed(postsDirectory), outputPath)
