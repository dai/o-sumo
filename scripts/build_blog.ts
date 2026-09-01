import { resolve } from 'node:path'
import { buildBlogSite } from '../app/lib/blog-build'

const root = resolve(import.meta.dirname, '..')

buildBlogSite({
  postsDirectory: resolve(root, 'blog/posts'),
  outputDirectory: resolve(root, 'dist-blog'),
  feedJsonPath: resolve(root, 'public/api/v1/blog.json'),
  ogImagePath: resolve(root, 'public/og-default.jpg'),
})
