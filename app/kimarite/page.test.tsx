import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import KimaritePage from './page';

describe('KimaritePage', () => {
  it('renders the page header with title and description', () => {
    render(
      <MemoryRouter>
        <KimaritePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/全82手の決まり手/)).toBeInTheDocument();
  });

  it('renders all six category headings', () => {
    render(
      <MemoryRouter>
        <KimaritePage />
      </MemoryRouter>,
    );

    const expectedCategories = [
      '基本技',
      '投げ手',
      '掛け手',
      '捻り手',
      '反り手',
      '特殊技',
    ];

    for (const cat of expectedCategories) {
      expect(screen.getAllByText(cat).length).toBeGreaterThan(0);
    }
  });

  it('renders a link to the JSA official kimarite page', () => {
    render(
      <MemoryRouter>
        <KimaritePage />
      </MemoryRouter>,
    );

    const jsaLink = screen.getByRole('link', { name: '日本相撲協会の解説を見る' });
    expect(jsaLink).toHaveAttribute('href', 'https://www.sumo.or.jp/IrohaKyokai/Kimarite/');
    expect(jsaLink).toHaveAttribute('target', '_blank');
    expect(jsaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a link to the ABEMA kimarite reference', () => {
    render(
      <MemoryRouter>
        <KimaritePage />
      </MemoryRouter>,
    );

    const abemaLink = screen.getByRole('link', { name: 'ABEMA の解説を見る' });
    expect(abemaLink).toHaveAttribute('href', 'https://abema.tv/lp/sumo-winning-technique');
  });
});