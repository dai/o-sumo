import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { torikumiArchive } from '../lib/torikumi-data';
import { getArchiveUpdatedAt, getDayPath } from '../lib/torikumi-routes';
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

    const updatedKey = getArchiveUpdatedAt('result').replace(/-/g, '');
    const elapsedDays = torikumiArchive.resultDays.filter((day) => day.pathDate < updatedKey);
    const activeDays = torikumiArchive.resultDays.filter((day) => day.pathDate >= updatedKey);

    expect(elapsedDays.length).toBeGreaterThan(0);

    const allLinks = screen.getAllByRole('link');

    for (const day of elapsedDays) {
      const link = allLinks.find((l) => l.getAttribute('href') === getDayPath(day, 'result'));
      expect(link).toHaveClass('archive-card', 'elapsed');
    }

    for (const day of activeDays) {
      const link = allLinks.find((l) => l.getAttribute('href') === getDayPath(day, 'result'));
      expect(link).toHaveClass('archive-card');
      expect(link).not.toHaveClass('elapsed');
    }
  });

  it('shows mode-specific update cadence text', () => {
    const { rerender } = render(
      <MemoryRouter>
        <TorikumiHubPage mode="result" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/15:00-18:00\(JST\)は30分ごと/)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <TorikumiHubPage mode="schedule" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/10:00 \/ 18:00\(JST\)更新/)).toBeInTheDocument();
  });
});
