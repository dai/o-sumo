#!/usr/bin/env node
/**
 * Guard for the Claude Code plugin and marketplace in this repository.
 *
 * Runs the checks that `claude plugin validate` does not cover locally:
 * marketplace/entry naming, remote MCP server shape, README and license
 * requirements, and the directory listing file limits.
 *
 * Usage: node scripts/check-claude-plugin.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MARKETPLACE_PATH = join(repoRoot, '.claude-plugin', 'marketplace.json')

const errors = []
const warnings = []

const fail = (message) => errors.push(message)
const warn = (message) => warnings.push(message)

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`${relative(repoRoot, path)}: ${error.message}`)
    return null
  }
}

const NAME_PATTERN = /^[A-Za-z0-9._-]+$/
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const REMOTE_TYPES = new Set(['http', 'sse', 'ws'])
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'])
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot'])
const FORBIDDEN_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini'])

const marketplace = readJson(MARKETPLACE_PATH)
if (!marketplace) {
  report()
}

if (!ID_PATTERN.test(marketplace.name ?? '')) {
  fail(`marketplace.json: name "${marketplace.name}" must use letters, digits, ".", "_", "-"`)
}
if (typeof marketplace.description !== 'string' || marketplace.description.trim() === '') {
  warn('marketplace.json: description is missing')
}
if (typeof marketplace.owner?.name !== 'string' || marketplace.owner.name.trim() === '') {
  fail('marketplace.json: owner.name is required')
}
if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
  fail('marketplace.json: plugins must list at least one entry')
  report()
}

const seen = new Set()
for (const [index, entry] of marketplace.plugins.entries()) {
  const label = `marketplace.json: plugins[${index}]`

  if (!ID_PATTERN.test(entry.name ?? '')) {
    fail(`${label}: name "${entry.name}" must use letters, digits, ".", "_", "-"`)
  }
  if (seen.has(entry.name)) {
    fail(`${label}: duplicate plugin name "${entry.name}"`)
  }
  seen.add(entry.name)

  if (typeof entry.source !== 'string' || !entry.source.startsWith('./')) {
    fail(`${label}: source must be a relative path starting with "./"`)
    continue
  }

  const pluginDir = resolve(repoRoot, entry.source)
  if (!pluginDir.startsWith(repoRoot + sep) || !existsSync(pluginDir)) {
    fail(`${label}: source path does not exist inside the repository: ${entry.source}`)
    continue
  }

  const pathSegments = relative(repoRoot, pluginDir).split(sep)
  for (const segment of pathSegments) {
    if (!NAME_PATTERN.test(segment)) {
      fail(`${label}: folder "${segment}" in the plugin path must use letters, digits, ".", "_", "-"`)
    }
  }

  checkPlugin(entry, pluginDir, label)
}

report()

function checkPlugin(entry, pluginDir, label) {
  const manifestPath = join(pluginDir, '.claude-plugin', 'plugin.json')
  if (!existsSync(manifestPath)) {
    fail(`${label}: missing .claude-plugin/plugin.json`)
    return
  }

  const manifest = readJson(manifestPath)
  if (!manifest) return

  if (!ID_PATTERN.test(manifest.name ?? '')) {
    fail(`${label}: plugin.json name "${manifest.name}" is not a valid identifier`)
  }
  if (manifest.name !== entry.name) {
    fail(
      `${label}: entry name "${entry.name}" must equal plugin.json name "${manifest.name}"`,
    )
  }

  for (const field of ['description', 'version']) {
    if (typeof manifest[field] !== 'string' || manifest[field].trim() === '') {
      warn(`${label}: plugin.json should set "${field}"`)
    }
  }
  if (typeof manifest.author?.name !== 'string' || manifest.author.name.trim() === '') {
    warn(`${label}: plugin.json should set "author.name"`)
  }

  for (const field of ['displayName', 'author']) {
    const value = field === 'author' ? manifest.author?.name : manifest[field]
    if (typeof value === 'string' && mixesWritingSystems(value)) {
      fail(`${label}: plugin.json "${field}" mixes writing systems: ${value}`)
    }
  }

  if (!manifest.license && !existsSync(join(pluginDir, 'LICENSE'))) {
    fail(`${label}: plugin.json needs "license" or the plugin folder needs a LICENSE file`)
  }

  const readmePath = ['README.md', 'README'].map((name) => join(pluginDir, name)).find(existsSync)
  if (!readmePath) {
    fail(`${label}: README.md is required in the plugin folder`)
  } else {
    const words = countWords(readFileSync(readmePath, 'utf8'))
    if (words < 40) {
      fail(`${label}: README has ${words} words outside code blocks; the directory requires at least 40`)
    }
  }

  const mcpPath = join(pluginDir, '.mcp.json')
  if (!existsSync(mcpPath)) {
    fail(`${label}: .mcp.json is required to provide the o-sumo MCP server`)
  } else {
    const mcp = readJson(mcpPath)
    const servers = mcp?.mcpServers ?? {}
    if (Object.keys(servers).length === 0) {
      fail(`${label}: .mcp.json declares no servers`)
    }
    for (const [name, server] of Object.entries(servers)) {
      if (typeof server.url === 'string' && server.url !== '') {
        if (!REMOTE_TYPES.has(server.type)) {
          fail(`${label}: .mcp.json server "${name}" has a url but type "${server.type}"; use http, sse, or ws`)
        }
        if (!/^https:\/\//.test(server.url) && !/^wss:\/\//.test(server.url)) {
          fail(`${label}: .mcp.json server "${name}" url must be https:// or wss://`)
        }
      } else if (typeof server.command !== 'string') {
        fail(`${label}: .mcp.json server "${name}" needs either a url or a command`)
      }
    }
  }

  checkPluginFiles(pluginDir, label)
}

function checkPluginFiles(pluginDir, label) {
  let fileCount = 0
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      const stats = statSync(path)
      if (stats.isDirectory()) {
        walk(path)
        continue
      }

      fileCount += 1
      if (FORBIDDEN_FILES.has(name) || name === '__MACOSX') {
        fail(`${label}: remove system file ${relative(pluginDir, path)}`)
      }
      if (stats.size > 5 * 1024 * 1024) {
        fail(`${label}: ${relative(pluginDir, path)} is larger than 5 MiB`)
      }

      const extension = extname(name).toLowerCase()
      const isMedia = IMAGE_EXTENSIONS.has(extension) || FONT_EXTENSIONS.has(extension)
      if (!isMedia && stats.size > 256 * 1024) {
        warn(`${label}: ${relative(pluginDir, path)} is larger than 256 KiB and will be held for review`)
      }
    }
  }

  walk(pluginDir)
  if (fileCount > 512) {
    fail(`${label}: the plugin folder has ${fileCount} files; the directory allows at most 512`)
  }
}

function countWords(markdown) {
  const withoutCode = markdown
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/`[^`]*`/gu, ' ')
  return withoutCode.split(/\s+/u).filter(Boolean).length
}

function mixesWritingSystems(value) {
  return /[A-Za-z]/.test(value) && /[^\x00-\x7F]/.test(value)
}

function report() {
  for (const message of warnings) {
    console.warn(`warning: ${message}`)
  }
  for (const message of errors) {
    console.error(`error: ${message}`)
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
    process.exit(1)
  }

  console.log(`Plugin checks passed (${warnings.length} warning(s))`)
}
