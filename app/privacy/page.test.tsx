import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPage from './page';
import TermsPage from '../terms/page';

describe('PrivacyPage', () => {
  it('describes the actual Japanese and English data flows', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'プライバシーポリシー' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '取り扱う情報と利用目的' })).toBeInTheDocument();
    expect(screen.getByText(/一意のアカウント識別子と表示名/)).toBeInTheDocument();
    expect(screen.getByText(/セッションの既定期間は 30 日/)).toBeInTheDocument();
    expect(screen.getByText(/保持期間を約束しません/)).toBeInTheDocument();
    expect(screen.getByText(/Google Analytics や Google AdSense のスクリプトはサイトに組み込まれていません/)).toBeInTheDocument();

    const english = screen.getByRole('region', { name: 'English' });
    expect(english).toHaveAttribute('lang', 'en');
    expect(english).toHaveTextContent(/read-only/i);
    expect(english).toHaveTextContent(/unique account identifier and display name/i);
    expect(english).toHaveTextContent(/default session duration is 30 days/i);
    expect(english).toHaveTextContent(/does not promise a specific retention period/i);
    expect(english).toHaveTextContent(/Google Analytics and Google AdSense scripts are not currently included/i);
  });

  it('links the terms and private contact route', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/https:\/\/osada\.us\/mcp/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '利用規約 / Terms of Service' })).toHaveAttribute('href', '/terms/');
    expect(screen.getByRole('link', { name: '運営者への連絡' })).toHaveAttribute('href', 'https://x.com/daisuke');
  });
});

describe('TermsPage', () => {
  it('provides Japanese and English terms for the website and read-only MCP server', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
    expect(screen.getByText(/MCP サーバーは読み取り専用/)).toBeInTheDocument();
    expect(screen.getByText(/法令で認められる範囲/)).toBeInTheDocument();
    const english = screen.getByRole('heading', { name: 'English: Terms of Service' }).parentElement;
    expect(english).toHaveAttribute('lang', 'en');
    expect(english).toHaveTextContent(/The MCP server is read-only/i);
    expect(english).toHaveTextContent(/as is/i);
    expect(screen.getByRole('link', { name: 'プライバシーポリシー / Privacy Policy' })).toHaveAttribute('href', '/privacy/');
  });
});

describe('privacy route wiring', () => {
  it('registers /privacy/ before the top-level slug catch-all', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/main.tsx'), 'utf8');
    const privacy = source.indexOf('path="/privacy/"');
    const slug = source.indexOf('path="/:slug"');

    expect(privacy).toBeGreaterThan(-1);
    expect(slug).toBeGreaterThan(privacy);
    expect(source.indexOf('path="/terms/"')).toBeGreaterThan(-1);
  });
});
