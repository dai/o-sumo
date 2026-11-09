import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from './page';

describe('AboutPage', () => {
  it('renders the page header and all key sections', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/当サイト（o-sumo）について/)).toBeInTheDocument();
    expect(screen.getByText(/データ出典および免責事項/)).toBeInTheDocument();
    expect(screen.getByText(/プライバシーと利用規約/)).toBeInTheDocument();
    expect(screen.getByText(/運営者情報・お問い合わせ/)).toBeInTheDocument();
  });

  it('links to the current bilingual policies without claiming unused ad or analytics services', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'プライバシーポリシー（日本語・英語）' })).toHaveAttribute('href', '/privacy/');
    expect(screen.getByRole('link', { name: '利用規約（日本語・英語）' })).toHaveAttribute('href', '/terms/');
    expect(screen.queryByText(/Google AdSense/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Google Analytics/)).not.toBeInTheDocument();
  });

  it('renders contact links to X and GitHub', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    const xLink = screen.getByRole('link', { name: /Daisuke on X \(@daisuke\)/ });
    expect(xLink).toHaveAttribute('href', 'https://x.com/daisuke');

    const githubLink = screen.getByRole('link', { name: /GitHub リポジトリ \(dai\/o-sumo\)/ });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });
});
