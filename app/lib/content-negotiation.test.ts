import { describe, expect, it } from 'vitest';
import { prefersMarkdown } from './content-negotiation';

describe('prefersMarkdown', () => {
  it('returns true for the plain text/markdown Accept header', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
  });

  it('returns false for the plain text/html Accept header', () => {
    expect(prefersMarkdown('text/html')).toBe(false);
  });

  it('returns true for the bare */* wildcard (MfA default)', () => {
    expect(prefersMarkdown('*/*')).toBe(true);
  });

  it('returns false when text/markdown is explicitly rejected with q=0', () => {
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false);
  });

  it('returns false when text/html outranks text/markdown', () => {
    expect(prefersMarkdown('text/markdown;q=0.5, text/html;q=0.9')).toBe(false);
  });

  it('returns true when text/markdown outranks text/html', () => {
    expect(prefersMarkdown('text/markdown;q=0.9, text/html;q=0.5')).toBe(true);
  });

  it('returns false when text/html outranks text/* with markdown inside', () => {
    expect(prefersMarkdown('text/*;q=0.8, text/html;q=0.9')).toBe(false);
  });

  it('returns false for malformed Accept headers (parse failure is safe side)', () => {
    expect(prefersMarkdown('')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=abc')).toBe(false);
    expect(prefersMarkdown('garbage;;;q=,')).toBe(false);
  });
});