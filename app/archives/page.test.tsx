import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArchivesPage from './page';

describe('ArchivesPage', () => {
  it('lists both May 2026 and March 2026 archive basho entries', () => {
    render(
      <MemoryRouter>
        <ArchivesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: '令和八年 五月場所' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '令和八年 三月場所' })).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links.find((link) => link.getAttribute('href') === '/202605-banduke/')).toBeDefined();
    expect(links.find((link) => link.getAttribute('href') === '/202605-torikumi/')).toBeDefined();
    expect(links.find((link) => link.getAttribute('href') === '/202605-yotei/')).toBeDefined();
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
  });
});
