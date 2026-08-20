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
    expect(screen.getByText(/プライバシーポリシー・広告配信・Cookieについて/)).toBeInTheDocument();
    expect(screen.getByText(/運営者情報・お問い合わせ/)).toBeInTheDocument();
  });

  it('renders AdSense and Analytics disclaimers', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/Google AdSense/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google Analytics/).length).toBeGreaterThan(0);
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
