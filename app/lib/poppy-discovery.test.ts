import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  POPPY_ORGANIZATION_DOMAIN,
  POPPY_ORGANIZATION_NAME,
  POPPY_PROTOCOL_VERSION,
  assertPoppyDocument,
  buildPoppyDocument,
} from './poppy-discovery';

const STATIC_PATH = resolve(process.cwd(), 'public/.well-known/poppy.json');

describe('Personal Agent Protocol (Poppy) discovery', () => {
  it('exports a pinned protocol version', () => {
    expect(POPPY_PROTOCOL_VERSION).toBe('0.1');
  });

  it('derives the organization domain from SITE_ORIGIN hostname', () => {
    expect(POPPY_ORGANIZATION_DOMAIN).toBe('osada.us');
    expect(POPPY_ORGANIZATION_DOMAIN).not.toContain('/');
    expect(POPPY_ORGANIZATION_DOMAIN).not.toContain(':');
    expect(POPPY_ORGANIZATION_DOMAIN.startsWith('www.')).toBe(false);
  });

  it('uses a consistent organization name across discovery surfaces', () => {
    // ai-catalog.json uses `host.displayName: "o-sumo"`. Stay aligned.
    expect(POPPY_ORGANIZATION_NAME).toBe('o-sumo');
  });

  describe('buildPoppyDocument', () => {
    it('returns the minimum spec-compliant website-only declaration', () => {
      const doc = buildPoppyDocument();
      expect(doc).toEqual({
        protocol_version: '0.1',
        organization: { name: 'o-sumo', domain: 'osada.us' },
        web: {},
      });
    });

    it('omits auth because no agent/apis/feedback/session is declared', () => {
      const doc = buildPoppyDocument();
      const keys = Object.keys(doc);
      expect(keys).toContain('web');
      // Auth is intentionally absent (spec §3.1 only requires it when
      // agent/apis/feedback/web.browser_session_endpoint is present).
      expect(keys).not.toContain('auth');
      expect(keys).not.toContain('apis');
      expect(keys).not.toContain('agent');
      expect(keys).not.toContain('feedback');
    });
  });

  describe('static file at /.well-known/poppy.json', () => {
    const exists = existsSync(STATIC_PATH);

    it('exists', () => {
      expect(exists).toBe(true);
    });

    it('parses and matches buildPoppyDocument exactly', () => {
      if (!exists) return;
      const onDisk = JSON.parse(readFileSync(STATIC_PATH, 'utf8')) as unknown;
      expect(onDisk).toEqual(buildPoppyDocument());
    });

    it('passes assertPoppyDocument', () => {
      if (!exists) return;
      const onDisk = JSON.parse(readFileSync(STATIC_PATH, 'utf8')) as unknown;
      expect(() => assertPoppyDocument(onDisk)).not.toThrow();
    });
  });

  describe('assertPoppyDocument (negative cases)', () => {
    it('rejects a non-object value', () => {
      expect(() => assertPoppyDocument(null)).toThrow(TypeError);
      expect(() => assertPoppyDocument('poppy')).toThrow(TypeError);
      expect(() => assertPoppyDocument(['poppy'])).toThrow(TypeError);
    });

    it('rejects a `protocol_version` not in major.minor form', () => {
      const doc = { ...buildPoppyDocument(), protocol_version: '0.1.0' };
      expect(() => assertPoppyDocument(doc)).toThrow(/protocol_version/);
    });

    it('rejects a missing organization', () => {
      const doc = { protocol_version: '0.1', web: {} } as unknown;
      expect(() => assertPoppyDocument(doc)).toThrow(/organization/);
    });

    it('rejects an organization.domain that includes scheme/path/port', () => {
      const base = buildPoppyDocument();
      expect(() =>
        assertPoppyDocument({ ...base, organization: { name: 'o-sumo', domain: 'https://osada.us' } }),
      ).toThrow(/hostname/);
      expect(() =>
        assertPoppyDocument({ ...base, organization: { name: 'o-sumo', domain: 'osada.us/path' } }),
      ).toThrow(/hostname/);
      expect(() =>
        assertPoppyDocument({ ...base, organization: { name: 'o-sumo', domain: 'osada.us:443' } }),
      ).toThrow(/hostname/);
    });

    it('rejects an organization.domain that starts with www.', () => {
      const base = buildPoppyDocument();
      expect(() =>
        assertPoppyDocument({ ...base, organization: { name: 'o-sumo', domain: 'www.osada.us' } }),
      ).toThrow(/www\./);
    });

    it('rejects a missing web object', () => {
      const base = buildPoppyDocument();
      expect(() => assertPoppyDocument({ ...base, web: undefined })).toThrow(/web/);
    });

    it('rejects `apis` without `auth` (spec §3.1)', () => {
      const base = buildPoppyDocument();
      expect(() =>
        assertPoppyDocument({ ...base, apis: {} }),
      ).toThrow(/requires `auth`/);
    });

    it('rejects `agent.protocols` without `auth` (spec §3.1)', () => {
      const base = buildPoppyDocument();
      expect(() =>
        assertPoppyDocument({ ...base, agent: { protocols: [] } }),
      ).toThrow(/requires `auth`/);
    });

    it('accepts `apis` with a matching auth block', () => {
      const base = buildPoppyDocument();
      expect(() =>
        assertPoppyDocument({
          ...base,
          apis: {},
          auth: { issuer: 'https://osada.us/' },
        }),
      ).not.toThrow();
    });
  });

  describe('_headers integration', () => {
    it('declares /.well-known/poppy.json Cache-Control and Content-Type', () => {
      const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
      const block = headers.match(
        /\/\.well-known\/poppy\.json\n((?:  .+\n?)+)/,
      )?.[1];
      expect(block).toBeDefined();
      expect(block).toContain('Cache-Control: public, max-age=300');
      expect(block).toContain('Content-Type: application/json; charset=utf-8');
    });

    it('advertises /.well-known/poppy.json from the homepage Link header', () => {
      const headers = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
      // The `Link:` rows live inside the `/` block in `public/_headers`. We only
      // assert that the `poppy` rel-type shows up at least once anywhere in the
      // file (the same link also lives in functions/_middleware.ts).
      expect(headers).toMatch(
        /Link: <\/\.well-known\/poppy\.json>; rel="poppy"; type="application\/json"/,
      );
    });
  });
});
