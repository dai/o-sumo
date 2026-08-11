import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function sitemapPlugin(): Plugin {
  let outDir = 'dist'
  let rikishiIndexPath = ''
  let gyojiIndexPath = ''
  let yobidashiIndexPath = ''
  let rikishiItems: unknown = []
  let gyojiItems: unknown = []
  let yobidashiItems: unknown = []

  return {
    name: 'generate-sitemap',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      rikishiIndexPath = resolve(config.root, 'public/api/v1/rikishi.json')
      gyojiIndexPath = resolve(config.root, 'public/api/v1/gyoji.json')
      yobidashiIndexPath = resolve(config.root, 'public/api/v1/yobidashi.json')
    },
    async buildStart() {
      const rikishiIndex = JSON.parse(readFileSync(rikishiIndexPath, 'utf8')) as { rikishi?: unknown }
      const { validateRikishiSitemapItems } = await import('./app/lib/sitemap')
      rikishiItems = validateRikishiSitemapItems(rikishiIndex.rikishi)
      gyojiItems = (JSON.parse(readFileSync(gyojiIndexPath, 'utf8')) as { officials?: unknown }).officials
      yobidashiItems = (JSON.parse(readFileSync(yobidashiIndexPath, 'utf8')) as { officials?: unknown }).officials
    },
    async closeBundle() {
      const { renderSitemapXml } = await import('./app/lib/sitemap')
      mkdirSync(outDir, { recursive: true })
      writeFileSync(resolve(outDir, 'sitemap.xml'), renderSitemapXml(undefined, rikishiItems, gyojiItems, yobidashiItems), 'utf8')
    },
  }
}

function agentSkillsPlugin(): Plugin {
  let outDir = 'dist'
  let publicDir = 'public'

  return {
    name: 'generate-agent-skills-index',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      publicDir = resolve(config.root, 'public')
    },
    async closeBundle() {
      const { buildAgentSkillsIndex } = await import('./app/lib/agent-skills')
      mkdirSync(outDir, { recursive: true })
      const index = buildAgentSkillsIndex(publicDir)
      writeFileSync(
        resolve(outDir, '.well-known/agent-skills/index.json'),
        `${JSON.stringify(index, null, 2)}\n`,
        'utf8',
      )
    },
  }
}

function mcpServerCardPlugin(): Plugin {
  let outDir = 'dist'
  let publicDir = 'public'

  return {
    name: 'generate-mcp-server-card',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      publicDir = resolve(config.root, 'public')
    },
    async closeBundle() {
      const { buildMcpServerCard } = await import('./app/lib/mcp-server-card')
      buildMcpServerCard(publicDir, outDir)
    },
  }
}

function a2aAgentCardPlugin(): Plugin {
  let outDir = 'dist'
  let publicDir = 'public'

  return {
    name: 'generate-a2a-agent-card',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      publicDir = resolve(config.root, 'public')
    },
    async closeBundle() {
      const { buildA2aAgentCard } = await import('./app/lib/a2a-agent-card')
      buildA2aAgentCard(publicDir, outDir)
    },
  }
}

function markdownViewsPlugin(): Plugin {
  let outDir = 'dist'
  let publicDir = 'public'

  return {
    name: 'generate-markdown-views',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      publicDir = resolve(config.root, 'public')
    },
    async closeBundle() {
      const { writeMarkdownViews } = await import('./scripts/build_markdown_views')
      writeMarkdownViews(publicDir, outDir)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    sitemapPlugin(),
    agentSkillsPlugin(),
    mcpServerCardPlugin(),
    a2aAgentCardPlugin(),
    markdownViewsPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: 'o-sumo | 大相撲 番付・星取表',
        short_name: 'o-sumo',
        theme_color: '#1a3a52',
        background_color: '#faf8f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 900,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './app/test/setup.ts',
    globals: true,
    // 番付などの大きなデータを扱う jsdom テストを同時に走らせると、CI の負荷次第で
    // タイムアウトする。ファイル単位の並列化だけを止め、テストを安定させる。
    fileParallelism: false,
    // CI で並列実行が重なると重いデータロードを行うテストが 5s を超えることがある。
    // 個別テストの it(..., fn, timeout?) で上書きするのが基本だが、既知の重いテスト
    // にも適用されるようプロジェクト既定も広めにとる。
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
