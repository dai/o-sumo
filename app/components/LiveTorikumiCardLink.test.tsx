import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../lib/i18n';
import { torikumiArchive, torikumiData } from '../lib/torikumi-data';
import { SEPTEMBER2026_TORIKUMI_DATA } from '../lib/september2026-data';
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
    vi.setSystemTime(new Date('2026-11-09T07:00:00.000Z')); // JST 16:00

    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202611-torikumi/"
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
    expect(link).toHaveAttribute('href', '/202611-torikumi/');
    expect(screen.getByText('速報')).toHaveClass('quick-nav-card__badge');
    expect(screen.getByText('速報・進行')).toBeInTheDocument();
  });

  it('re-derives the latest bout anchor using the click-time JST', async () => {
    // Date のみ fake する。setTimeout / rAF は実 timer のままにして
    // userEvent の内部 delay や react-router-dom の useNavigate 内部 effect が
    // fake timer で停止して 20 秒 timeout する問題を回避する。
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-09T07:00:00.000Z')); // JST 16:00 (makuuchi window)

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202611-torikumi/"
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
      /\/202611\d+-torikumi\//,
    );
  });

  it('does not hijack modifier-key clicks (cmd/ctrl/shift/middle)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/202611-torikumi/"
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

  it('renders time, imakoko meter, east/west badges, and sr-only text', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-13T07:20:00.000Z')); // JST 16:20 on Day 1

    // 進行中（未完了の取組がある状態）のデータセットを作成
    const inProgressDay = JSON.parse(JSON.stringify(SEPTEMBER2026_TORIKUMI_DATA.scheduleDays![0]));
    // 幕内取組の勝敗をリセットして進行中状態をシミュレート
    inProgressDay.data.makuuchi.matches.forEach((m: any) => {
      m.winner = null;
      m.kimarite = '';
    });
    const liveDataSet = {
      ...SEPTEMBER2026_TORIKUMI_DATA,
      resultDays: [],
      scheduleDays: [inProgressDay],
      today: inProgressDay.data,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <LiveTorikumiCardLink
          to="/20260913-torikumi/"
          primary
          archive={liveDataSet}
          data={liveDataSet}
          label={
            <>
              本日の取組<span className="quick-nav-card__badge">速報</span>
            </>
          }
          sub="速報・進行"
        />
      </MemoryRouter>,
    );

    // ボード本体に live-torikumi-board クラスが付いていること
    const link = screen.getByRole('link', { name: /本日の取組/ });
    expect(link).toHaveClass('live-torikumi-board');

    // 「16:20 現在」が表示されていること
    expect(screen.getByText('16:20 現在')).toHaveClass('live-torikumi-board__time');

    // 東西の絵文字とラベル（🌅 東 / 🌇 西）が含まれること
    expect(screen.getByText('東')).toHaveClass('bout-side-tag');
    expect(screen.getByText('西')).toHaveClass('bout-side-tag');
    expect(screen.getByText('湘南乃海')).toHaveClass('bout-shikona');
    expect(screen.getByText('出羽ノ龍')).toHaveClass('bout-shikona');

    // メーターのタイムライン境界ラベル（十両土俵入り・幕内土俵入り）が表示されていること
    // Day 1（初日）のため早い例外時刻（14:05 / 15:30）が使われる
    expect(screen.getByText('14:05頃 十両土俵入り')).toBeInTheDocument();
    expect(screen.getByText('15:30頃 幕内土俵入り')).toBeInTheDocument();
    expect(screen.getByText('18:00頃')).toBeInTheDocument();

    // スクリーンリーダー用テキストが存在すること
    expect(screen.getByText(/幕内の取組/)).toHaveClass('sr-only');
  });
});
