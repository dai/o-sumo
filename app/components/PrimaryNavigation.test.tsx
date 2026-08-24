import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MARCH2026_BANZUKE_PATH } from '../lib/torikumi-routes';
import { i18n } from '../lib/i18n';
import PrimaryNavigation from './PrimaryNavigation';

function renderNavigation(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <PrimaryNavigation />
    </MemoryRouter>,
  );
}

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('PrimaryNavigation', () => {
  afterEach(async () => {
    await i18n.changeLanguage('ja');
  });

  it('omits the duplicate home item while preserving archive-aware basho links', () => {
    renderNavigation(MARCH2026_BANZUKE_PATH);

    const navigation = screen.getByRole('navigation', { name: '主要ナビゲーション' });
    expect(within(navigation).queryByRole('link', { name: 'ホーム' })).not.toBeInTheDocument();
    expect(within(navigation).getAllByRole('link')).toHaveLength(4);
    expect(within(navigation).getByRole('link', { name: '番付' })).toHaveAttribute('href', '/202603-banzuke/');
    expect(within(navigation).getByRole('link', { name: '取組予定' })).toHaveAttribute('href', '/202603-yotei/');
    expect(within(navigation).getByRole('link', { name: '結果' })).toHaveAttribute('href', '/202603-torikumi/');
  });

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
    expect(screen.getByRole('link', { name: '人物名鑑' })).toHaveAttribute('aria-current', 'page');
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
    expect(screen.getByRole('link', { name: '人物名鑑' })).not.toHaveAttribute('aria-current');
  });

  it('names the people directory trigger and current page in English', async () => {
    await i18n.changeLanguage('en');
    renderNavigation('/gyoji/');

    expect(screen.getByRole('button', { name: /People directory.*Gyoji/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays the saved count in the my-rikishi directory link', async () => {
    const user = userEvent.setup();
    renderNavigation('/rikishi/');

    const trigger = screen.getByRole('button', { name: /人物名鑑.*力士/ });
    await user.click(trigger);

    expect(within(screen.getByRole('navigation', { name: '人物名鑑' })).getByRole('link', { name: /マイ力士/ })).toHaveAttribute('href', '/my-rikishi/');
  });
});
