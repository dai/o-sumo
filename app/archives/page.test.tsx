import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArchivesPage from './page';

describe('ArchivesPage', () => {
  it('shows home links in the header and footer', () => {
    render(
      <MemoryRouter>
        <ArchivesPage />
      </MemoryRouter>,
    );

    expect(within(screen.getByRole('navigation', { name: 'サイトナビゲーション' })).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
  });
});
