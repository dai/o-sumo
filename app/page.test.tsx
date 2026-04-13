import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { banzukePath, getHubPath } from './lib/torikumi-routes';
import Home from './page';

describe('Home page', () => {
  it('shows the main navigation links and footer-only contact links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // Get all links
    const allLinks = screen.getAllByRole('link');

    // Check the first occurrence of each link type (current basho, not past)
    const banzukeLink = allLinks.find(l => l.getAttribute('href') === banzukePath);
    const yoteiLink = allLinks.find(l => l.getAttribute('href') === getHubPath('schedule'));
    const kekkaLink = allLinks.find(l => l.getAttribute('href') === getHubPath('result'));

    expect(banzukeLink).toHaveAttribute('href', banzukePath);
    expect(yoteiLink).toHaveAttribute('href', getHubPath('schedule'));
    expect(kekkaLink).toHaveAttribute('href', getHubPath('result'));
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });
});
