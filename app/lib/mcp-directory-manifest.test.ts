import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mcp/server.json', () => {
  it('matches the public MCP directory listing manifest', () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'mcp/server.json'), 'utf8')) as unknown;

    expect(manifest).toEqual({
      $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
      name: 'us.osada/o-sumo',
      title: '縦綱 Tatezuna — o-sumo',
      description: 'Grand Sumo (大相撲) banzuke, torikumi results, and rikishi profiles from osada.us. Read-only, no auth.',
      version: '1.0.1',
      websiteUrl: 'https://osada.us',
      repository: {
        url: 'https://github.com/dai/o-sumo',
        source: 'github',
        subfolder: 'mcp',
      },
      icons: [
        {
          src: 'https://raw.githubusercontent.com/dai/o-sumo/main/mcp/assets/logo-512.png',
          mimeType: 'image/png',
          sizes: ['512x512'],
        },
        {
          src: 'https://raw.githubusercontent.com/dai/o-sumo/main/mcp/assets/logo-plate.svg',
          mimeType: 'image/svg+xml',
          sizes: ['any'],
        },
      ],
      remotes: [
        {
          type: 'streamable-http',
          url: 'https://osada.us/mcp',
        },
      ],
    });

    const icons = (manifest as { icons: { src: string }[] }).icons;
    for (const icon of icons) {
      const relativePath = new URL(icon.src).pathname.replace(/^\/dai\/o-sumo\/(?:main|HEAD)\//, '');
      expect(existsSync(resolve(process.cwd(), relativePath)), icon.src).toBe(true);
      expect(relativePath.startsWith('mcp/agy/'), icon.src).toBe(false);
      expect(relativePath.startsWith('mcp/muse/'), icon.src).toBe(false);
    }
  });
});
