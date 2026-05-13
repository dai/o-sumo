import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  MARCH2026_BANDUKE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MAY2026_BANDUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';
import { MAY2026_TORIKUMI_DATA } from './lib/may2026-data';
import { MARCH2026_TORIKUMI_DATA } from './lib/march2026-torikumi-data';
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

    // Current basho links are May 2026.
    const banzukeLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_BANDUKE_PATH}/`);
    const yoteiLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_SCHEDULE_PATH}/`);
    const kekkaLink = allLinks.find((l) => l.getAttribute('href') === `${MAY2026_RESULT_PATH}/`);
    const firstMayDay = MAY2026_TORIKUMI_DATA.resultDays?.[0];
    // 2nd section links are March 2026.
    const marchBanzukeLink = allLinks.find((l) => l.getAttribute('href') === `${MARCH2026_BANDUKE_PATH}/`);
    const marchYoteiLink = allLinks.find((l) => l.getAttribute('href') === `${MARCH2026_SCHEDULE_PATH}/`);
    const marchTorikumiLink = allLinks.find((l) => l.getAttribute('href') === `${MARCH2026_RESULT_PATH}/`);
    const firstMarchDay = MARCH2026_TORIKUMI_DATA.resultDays?.[0];
    const mayHeroTitle = `${MAY2026_TORIKUMI_DATA.year}${MAY2026_TORIKUMI_DATA.bashoName}`;

    expect(screen.getByRole('heading', { level: 2, name: mayHeroTitle })).toBeInTheDocument();
    expect(banzukeLink).toHaveAttribute('href', `${MAY2026_BANDUKE_PATH}/`);
    expect(yoteiLink).toHaveAttribute('href', `${MAY2026_SCHEDULE_PATH}/`);
    expect(kekkaLink).toHaveAttribute('href', `${MAY2026_RESULT_PATH}/`);
    expect(firstMayDay).toBeDefined();
    expect(marchBanzukeLink).toHaveAttribute('href', `${MARCH2026_BANDUKE_PATH}/`);
    expect(marchYoteiLink).toHaveAttribute('href', `${MARCH2026_SCHEDULE_PATH}/`);
    expect(marchTorikumiLink).toHaveAttribute('href', `${MARCH2026_RESULT_PATH}/`);
    expect(firstMarchDay).toBeDefined();
    expect(allLinks.find((l) => l.getAttribute('href') === `/${firstMarchDay!.pathDate}-torikumi/`)).toBeDefined();
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'GitHub' })[0]).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
  });
});
