import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../lib/i18n';
import { torikumiArchive, torikumiData } from '../lib/torikumi-data';
import LiveTorikumiCardLink from './LiveTorikumiCardLink';

function LocationProbe() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.hash}`}</output>;
}

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

afterEach(async () => {
  await i18n.changeLanguage('ja');
  vi.useRealTimers();
});

describe('LiveTorikumiCardLink', () => {
  it('renders as an anchor with the live quick-nav card markup', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-14T07:00:00.000Z')); // JST 16:00

    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202609-torikumi/"
          primary
          archive={torikumiArchive}
          data={torikumiData}
          label={
            <>
              本日の取組<span className="quick-nav-card__badge">速報</span>
            </>
          }
          sub="速報・進行"
        />
        <LocationProbe />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /本日の取組/ });
    expect(link).toHaveClass('quick-nav-card');
    expect(link).toHaveClass('primary');
    expect(link).toHaveAttribute('href', '/202609-torikumi/');
    expect(screen.getByText('速報')).toHaveClass('quick-nav-card__badge');
    expect(screen.getByText('速報・進行')).toBeInTheDocument();
  });

  it('re-derives the latest bout anchor using the click-time JST', async () => {
    // Date のみ fake する。setTimeout / rAF は実 timer のままにして
    // userEvent の内部 delay や react-router-dom の useNavigate 内部 effect が
    // fake timer で停止して 20 秒 timeout する問題を回避する。
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-14T07:00:00.000Z')); // JST 16:00 (makuuchi window)

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202609-torikumi/"
          primary
          archive={torikumiArchive}
          data={torikumiData}
          label={
            <>
              本日の取組<span className="quick-nav-card__badge">速報</span>
            </>
          }
          sub="速報・進行"
        />
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: /本日の取組/ }));

    expect(screen.getByRole('status')).toHaveTextContent(
      /\/202609\d+-torikumi\/#bout-makuuchi-\d+/,
    );
  });

  it('does not hijack modifier-key clicks (cmd/ctrl/shift/middle)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202609-torikumi/"
          primary
          archive={torikumiArchive}
          data={torikumiData}
          label={
            <>
              本日の取組<span className="quick-nav-card__badge">速報</span>
            </>
          }
          sub="速報・進行"
        />
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: /本日の取組/ }), {
      metaKey: true,
    });

    // modifier-key click → preventDefault しないので MemoryRouter 内の location は初期 entry '/' のまま
    expect(screen.getByRole('status')).toHaveTextContent('/');
  });
});
