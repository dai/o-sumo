import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MARCH2026_BANZUKE_PATH } from '../lib/torikumi-routes';
import { i18n } from '../lib/i18n';
import PrimaryNavigation from './PrimaryNavigation';

const rikishiIndex = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/api/v1/rikishi.json'), 'utf8'),
) as { rikishi: Array<{ id: number; name: string }> };

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderNavigation(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <PrimaryNavigation />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function primaryNavigation() {
  return screen.getByRole('navigation', { name: '主要ナビゲーション' });
}

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('PrimaryNavigation', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    await i18n.changeLanguage('ja');
  });

  it('lists banzuke, bouts, rikishi, kimarite, analytics, and archives without a home item', () => {
    renderNavigation(MARCH2026_BANZUKE_PATH);

    const navigation = primaryNavigation();
    expect(within(navigation).queryByRole('link', { name: 'ホーム' })).not.toBeInTheDocument();
    expect(within(navigation).getAllByRole('link')).toHaveLength(6);
    expect(within(navigation).getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202603-banzuke/');
    expect(within(navigation).getByRole('link', { name: '番付' })).toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('link', { name: '取組' })).toHaveAttribute('href', '/202603-torikumi/');
    expect(within(navigation).getByRole('link', { name: '力士' })).toHaveAttribute('href', '/rikishi/');
    expect(within(navigation).getByRole('link', { name: '決まり手' })).toHaveAttribute('href', '/kimarite/');
    expect(within(navigation).getByRole('link', { name: '分析' })).toHaveAttribute('href', '/analytics/');
    expect(within(navigation).getByRole('link', { name: 'アーカイブ' })).toHaveAttribute('href', '/archives/');
    expect(screen.getByRole('button', { name: '力士を検索' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['/kimarite/', '決まり手'],
    ['/analytics/', '分析'],
    ['/archives/', 'アーカイブ'],
    ['/rikishi/4227/', '力士'],
  ])('marks %s with the %s item', (pathname, label) => {
    renderNavigation(pathname);

    expect(within(primaryNavigation()).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    ['/20260927-torikumi/', '/202609-torikumi/'],
    ['/20260927-yotei/', '/202609-torikumi/'],
    ['/20260308-torikumi/', '/202603-torikumi/'],
    ['/20260308-yotei/', '/202603-torikumi/'],
  ])('marks 取組 current for the archive day %s', (pathname, href) => {
    renderNavigation(pathname);

    const link = within(primaryNavigation()).getByRole('link', { name: '取組' });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it.each(['/20260999-torikumi/', '/20990927-torikumi/', '/20260927-torikumi-extra/'])(
    'does not mark an unknown archive day %s as current',
    (pathname) => {
      renderNavigation(pathname);

      expect(within(primaryNavigation()).getByRole('link', { name: '取組' })).not.toHaveAttribute('aria-current');
    },
  );

  it('starts the people directory tray collapsed and names its current page', () => {
    renderNavigation('/rikishi/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: '人物名鑑' })).not.toBeInTheDocument();
  });

  it('opens the people directory tray and preserves both parent and child current markers', async () => {
    const user = userEvent.setup();
    renderNavigation('/compare/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*比較/ });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const directoryNavigation = screen.getByRole('navigation', { name: '人物名鑑' });
    expect(within(directoryNavigation).getByRole('link', { name: '力士比較' })).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNavigation()).getByRole('link', { name: '力士' })).toHaveAttribute('aria-current', 'page');
  });

  it('closes the people directory tray with Escape and restores focus to its trigger', async () => {
    const user = userEvent.setup();
    renderNavigation('/rikishi/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    await user.click(trigger);
    const gyojiLink = within(screen.getByRole('navigation', { name: '人物名鑑' })).getByRole('link', { name: '行司' });
    gyojiLink.focus();
    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes the people directory tray after an outside click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/rikishi/']}>
        <button type="button">外側</button>
        <PrimaryNavigation />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: '外側' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: '人物名鑑' })).not.toBeInTheDocument();
  });

  it('closes the people directory tray after navigating to another directory page', async () => {
    const user = userEvent.setup();
    renderNavigation('/rikishi/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    await user.click(trigger);
    await user.click(within(screen.getByRole('navigation', { name: '人物名鑑' })).getByRole('link', { name: '行司' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /人物名鑑.*行司/ })).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not expose the people directory tray for a route-prefix lookalike', () => {
    renderNavigation('/rikishi-not-a-route/');

    expect(screen.queryByRole('button', { name: /人物名鑑/ })).not.toBeInTheDocument();
    expect(within(primaryNavigation()).getByRole('link', { name: '力士' })).not.toHaveAttribute('aria-current');
  });

  it('names the people directory trigger and current page in English', async () => {
    await i18n.changeLanguage('en');
    renderNavigation('/gyoji/');

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(navigation).getByRole('link', { name: 'Bouts' })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Kimarite' })).toHaveAttribute('href', '/kimarite/');
    expect(within(navigation).getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/analytics/');
    expect(within(navigation).getByRole('link', { name: 'Archives' })).toHaveAttribute('href', '/archives/');
    expect(within(navigation).getByRole('link', { name: 'Rikishi' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Search rikishi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /People directory.*Gyoji/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays the saved count in the my-rikishi directory link', async () => {
    const user = userEvent.setup();
    renderNavigation('/rikishi/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    await user.click(trigger);

    expect(within(screen.getByRole('navigation', { name: '人物名鑑' })).getByRole('link', { name: /マイ力士/ })).toHaveAttribute('href', '/my-rikishi/');
  });

  it('renders auth controls across both directory and non-directory pages', async () => {
    // 非名鑑ページ（取組予定）でもログインリンクが表示される
    const { unmount } = renderNavigation('/202603-yotei/');
    expect(await screen.findByRole('link', { name: 'Google でログイン' })).toBeInTheDocument();
    expect(screen.queryByText('ログインしなくても、この端末には保存できます。')).not.toBeInTheDocument();
    expect(screen.queryByText('※ パスワード入力は不要です')).not.toBeInTheDocument();
    unmount();

    // 名鑑ページでもログインリンクが表示される
    renderNavigation('/rikishi/');
    expect(await screen.findByRole('link', { name: 'Google でログイン' })).toBeInTheDocument();
  });

  it('searches 大の里 and navigates to /rikishi/4227/', async () => {
    const onosato = rikishiIndex.rikishi.find((rikishi) => rikishi.name === '大の里');
    expect(onosato?.id).toBe(4227);
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('/api/v1/rikishi.json')) {
        return new Response(JSON.stringify(rikishiIndex), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(null, { status: 404 });
    }));
    const user = userEvent.setup();
    renderNavigation('/');

    await user.click(screen.getByRole('button', { name: '力士を検索' }));
    const dialog = screen.getByRole('dialog', { name: '力士名検索' });
    expect(screen.getByRole('button', { name: '力士を検索' })).toHaveAttribute('aria-expanded', 'true');
    await user.type(within(dialog).getByRole('searchbox', { name: '力士名' }), '大の里');

    const result = await within(dialog).findByRole('link', { name: /大の里/ });
    expect(result).toHaveAttribute('href', '/rikishi/4227/');
    await user.click(result);

    expect(screen.getByTestId('location')).toHaveTextContent('/rikishi/4227/');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
