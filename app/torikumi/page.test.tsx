import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { torikumiArchive } from '../lib/torikumi-data';
import { getDayPath } from '../lib/torikumi-routes';
import TorikumiHubPage from './page';

describe('TorikumiHubPage', () => {
  it('renders all 15 days and allows descending sort', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TorikumiHubPage mode="result" />
      </MemoryRouter>,
    );

    const dayPaths = new Set(torikumiArchive.resultDays.map((day) => getDayPath(day, 'result')));
    const dayLinks = screen.getAllByRole('link').filter((link) => dayPaths.has(link.getAttribute('href') ?? ''));
    expect(dayLinks).toHaveLength(15);
    expect(screen.getByText('初日')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '降順' }));

    const firstCardHeading = screen.getAllByRole('heading', { level: 3 })[0];
    expect(firstCardHeading).toHaveTextContent('千秋楽');
  });

  it('mutes archive cards for elapsed days only', () => {
    render(
      <MemoryRouter>
        <TorikumiHubPage mode="result" />
      </MemoryRouter>,
    );

    const updatedKey = torikumiArchive.updatedAt.replace(/-/g, '');
    const pastDay = torikumiArchive.resultDays.find((day) => day.pathDate < updatedKey);
    const currentOrFutureDay = torikumiArchive.resultDays.find((day) => day.pathDate >= updatedKey);

    expect(pastDay).toBeDefined();
    expect(currentOrFutureDay).toBeDefined();

    const pastLink = screen.getAllByRole('link').find((link) => link.getAttribute('href') === getDayPath(pastDay!, 'result'));
    const currentLink = screen.getAllByRole('link').find((link) => link.getAttribute('href') === getDayPath(currentOrFutureDay!, 'result'));

    expect(pastLink).toHaveClass('archive-card', 'elapsed');
    expect(currentLink).toHaveClass('archive-card');
    expect(currentLink).not.toHaveClass('elapsed');
  });
});
