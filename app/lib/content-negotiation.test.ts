import { describe, expect, it } from 'vitest';
import { prefersMarkdown } from './content-negotiation';

describe('prefersMarkdown', () => {
  it('returns true for the plain text/markdown Accept header', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true);
  });

  it('returns false for the plain text/html Accept header', () => {
    expect(prefersMarkdown('text/html')).toBe(false);
  });

  it('returns false for the bare */* wildcard (defaults to HTML)', () => {
    expect(prefersMarkdown('*/*')).toBe(false);
  });

  it('returns false for the bare text/* wildcard without explicit text/markdown', () => {
    expect(prefersMarkdown('text/*')).toBe(false);
  });

  it('returns false for standard browser Accept headers', () => {
    expect(
      prefersMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      ),
    ).toBe(false);
  });

  it('returns true when text/markdown is combined with lower-priority wildcard */*', () => {
    expect(prefersMarkdown('text/markdown, */*;q=0.8')).toBe(true);
  });

  it('returns false when text/markdown and text/html have the same q (defaults to HTML)', () => {
    expect(prefersMarkdown('text/markdown, text/html')).toBe(false);
    expect(prefersMarkdown('text/html, text/markdown')).toBe(false);
  });

  it('returns false when text/markdown is explicitly rejected with q=0', () => {
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false);
  });

  it('returns true when text/markdown is accepted and text/html is explicitly rejected with q=0', () => {
    expect(prefersMarkdown('text/markdown, text/html;q=0')).toBe(true);
  });

  it('returns false when text/html outranks text/markdown', () => {
    expect(prefersMarkdown('text/markdown;q=0.5, text/html;q=0.9')).toBe(false);
  });

  it('returns true when text/markdown outranks text/html', () => {
    expect(prefersMarkdown('text/markdown;q=0.9, text/html;q=0.5')).toBe(true);
  });

  it('returns false for malformed Accept headers (parse failure is safe side)', () => {
    expect(prefersMarkdown('')).toBe(false);
    expect(prefersMarkdown('text/markdown;q=abc')).toBe(false);
    expect(prefersMarkdown('garbage;;;q=,')).toBe(false);
  });
});