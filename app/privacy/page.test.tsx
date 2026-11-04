import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPage from './page';

describe('PrivacyPage', () => {
  it('states the Japanese privacy facts and a short English section', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'プライバシーポリシー' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '取り扱う情報' })).toBeInTheDocument();
    expect(screen.getByText(/読み取り専用です。ログインは不要です。個人情報は収集しません。/)).toBeInTheDocument();
    expect(screen.getByText(/Cloudflare）は、運用とセキュリティのため、標準的なアクセスログを保持する場合があります。/)).toBeInTheDocument();
    expect(screen.getByText(/公開されている大相撲の情報です。/)).toBeInTheDocument();

    const english = screen.getByRole('region', { name: 'English' });
    expect(english).toHaveAttribute('lang', 'en');
    expect(english).toHaveTextContent(/read-only/i);
    expect(english).toHaveTextContent(/need no login/i);
    expect(english).toHaveTextContent(/collect no personal information/i);
    expect(english).toHaveTextContent(/standard access logs/i);
    expect(english).toHaveTextContent(/public Grand Sumo/i);
  });

  it('links the MCP server, the site, and GitHub issues', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link', { name: 'https://osada.us/mcp' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'https://osada.us/mcp' })[0]).toHaveAttribute('href', 'https://osada.us/mcp');
    expect(screen.getAllByRole('link', { name: 'https://osada.us' })[0]).toHaveAttribute('href', 'https://osada.us');
    const issues = screen.getAllByRole('link', { name: 'https://github.com/dai/o-sumo/issues' });
    expect(issues.length).toBeGreaterThan(0);
    for (const link of issues) {
      expect(link).toHaveAttribute('href', 'https://github.com/dai/o-sumo/issues');
    }
  });
});

describe('privacy route wiring', () => {
  it('registers /privacy/ before the top-level slug catch-all', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/main.tsx'), 'utf8');
    const privacy = source.indexOf('path="/privacy/"');
    const slug = source.indexOf('path="/:slug"');

    expect(privacy).toBeGreaterThan(-1);
    expect(slug).toBeGreaterThan(privacy);
  });
});
