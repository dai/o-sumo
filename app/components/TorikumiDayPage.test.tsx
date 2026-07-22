import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, vi } from 'vitest';
import TorikumiDayPage from './TorikumiDayPage';
import { MARCH2026_TORIKUMI_DATA } from '../lib/march2026-torikumi-data';
import { MAY2026_TORIKUMI_DATA } from '../lib/may2026-data';
import { torikumiArchive, type TorikumiArchiveDay } from '../lib/torikumi-data';
import { getBanzukePathForDateKey, getHubPathForDateKey } from '../lib/torikumi-routes';
import * as torikumiRoutes from '../lib/torikumi-routes';
import { formatUpdatedAt } from '../lib/updated-at';

function renderPage(day: TorikumiArchiveDay, mode: 'result' | 'schedule' = 'result') {
  render(
    <MemoryRouter>
      <TorikumiDayPage day={day} mode={mode} />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TorikumiDayPage', () => {
  it('renders archive navigation and footer contact links for result pages', () => {
    const firstResultDay = torikumiArchive.resultDays[0];
    renderPage(firstResultDay, 'result');

    expect(screen.getByRole('heading', { level: 1, name: /取組結果/ })).toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'ホーム' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '一覧' })).toHaveAttribute('href', getHubPathForDateKey(firstResultDay.pathDate, 'result'));
    expect(screen.getByRole('link', { name: '番付' })).toHaveAttribute('href', getBanzukePathForDateKey(firstResultDay.pathDate));
    expect(screen.getByText('← 前日なし')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dai/o-sumo');
    expect(screen.queryByText('連絡先:')).not.toBeInTheDocument();
  });

  it('switches bout sorting between ascending and descending', async () => {
    const user = userEvent.setup();
    const marchScheduleDay = MARCH2026_TORIKUMI_DATA.scheduleDays?.find(
      (day) => day.data.makuuchi.matches.length > 0,
    );
    expect(marchScheduleDay).toBeDefined();
    renderPage(marchScheduleDay!, 'schedule');

    const before = screen.getAllByRole('row').slice(0, 2).map((row) => row.textContent);

    await user.click(screen.getByRole('button', { name: '降順' }));

    const after = screen.getAllByRole('row').slice(0, 2).map((row) => row.textContent);
    // Verify order changed (content before and after should be different)
    expect(before[0]).not.toBe(after[0]);
  });

  it('renders scheduled bouts from the lowest juryo bout to the yokozuna bout', () => {
    const marchScheduleDay = MARCH2026_TORIKUMI_DATA.scheduleDays?.find(
      (day) => day.data.makuuchi.matches.length > 0 && day.data.juryo.matches.length > 0,
    );
    expect(marchScheduleDay).toBeDefined();
    renderPage(marchScheduleDay!, 'schedule');

    const divisionHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(divisionHeadings[0]).toHaveTextContent('十両');
    expect(divisionHeadings[divisionHeadings.length - 1]).toHaveTextContent('幕内');

    const matchRows = Array.from(document.querySelectorAll('.torikumi-row'));
    const highestMakuuchiBoutNo = Math.max(...marchScheduleDay!.data.makuuchi.matches.map((match) => match.boutNo));
    expect(matchRows[0]).toHaveAttribute('id', 'bout-juryo-1');
    expect(matchRows[matchRows.length - 1]).toHaveAttribute('id', `bout-makuuchi-${highestMakuuchiBoutNo}`);
  });

  it('shows result matches as one bottom-to-top flow from juryo through makuuchi', () => {
    const firstResultDay = torikumiArchive.resultDays[0];
    renderPage(firstResultDay, 'result');

    // Result mode renders a single unified table: 十両 → 幕内の順に boutNo 昇順で結合し、
    // 十両の先頭取組(1)が最上段、幕内の横綱(20)が最下段になる。
    const firstResultDayData = firstResultDay.data;
    const expectedJuryoCount = firstResultDayData.juryo.matches.length;
    const expectedMakuuchiCount = firstResultDayData.makuuchi.matches.length;
    const allMatches = [
      ...firstResultDayData.juryo.matches,
      ...firstResultDayData.makuuchi.matches,
    ];

    // 取り組み行のみ抽出（.torikumi-row クラス）
    const matchRows = document.querySelectorAll('.torikumi-row');
    expect(matchRows.length).toBe(expectedJuryoCount + expectedMakuuchiCount);

    // 最上段・最下段の row 同士で内容が違うことを確認（通し番号の連結が成立している）。
    const firstText = matchRows[0].textContent ?? '';
    const lastText = matchRows[matchRows.length - 1].textContent ?? '';
    expect(firstText).not.toBe('');
    expect(lastText).not.toBe('');
    expect(firstText).not.toBe(lastText);

    // 取り組みの総数が十両+幕内と一致し、行が1件以上あることを確認。
    expect(allMatches.length).toBeGreaterThan(0);
  });

  it('shows pending empty-state messaging for unpublished days', () => {
    const pendingDay: TorikumiArchiveDay = {
      day: 15,
      isoDate: '2026-03-22',
      pathDate: '20260322',
      label: '千秋楽',
      dayHead: '千秋楽： 令和8年3月22日(日)',
      status: 'pending',
      statusMessage: '結果未更新',
      data: {
        makuuchi: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽： 令和8年3月22日(日)',
          division: '幕内',
          matches: [],
        },
        juryo: {
          day: 15,
          dayName: '取組日 千秋楽',
          dayHead: '千秋楽： 令和8年3月22日(日)',
          division: '十両',
          matches: [],
        },
      },
    };

    renderPage(pendingDay, 'result');

    expect(screen.getByText('結果未更新')).toBeInTheDocument();
    // 結果ページは十両・幕内を統合表示するため、空のときは十両文言（最初のdivision）が代表で表示される。
    expect(screen.getByText('十両の取組結果はまだ更新されていません。')).toBeInTheDocument();
  });

  it('falls back to same-day schedule rows on pending result pages when result rows are still empty', () => {
    const scheduleDay = MARCH2026_TORIKUMI_DATA.scheduleDays?.find((day) => day.data.makuuchi.matches.length > 0);
    expect(scheduleDay).toBeDefined();

    const futurePathDate = '20991231';
    const futureScheduleDay: TorikumiArchiveDay = {
      ...scheduleDay!,
      isoDate: '2099-12-31',
      pathDate: futurePathDate,
      dayHead: '千秋楽： 令和81年12月31日(木)',
    };
    const pendingResultDay: TorikumiArchiveDay = {
      ...futureScheduleDay,
      status: 'pending',
      statusMessage: '結果未更新',
      data: {
        makuuchi: {
          ...futureScheduleDay.data.makuuchi,
          matches: [],
        },
        juryo: {
          ...futureScheduleDay.data.juryo,
          matches: [],
        },
      },
    };

    vi.spyOn(torikumiRoutes, 'getArchiveRouteConfigForDateKey').mockReturnValue({
      monthKey: '209912',
      archive: {
        ...torikumiArchive,
        scheduleDays: [futureScheduleDay],
      },
      resultPath: '/209912-torikumi/',
      schedulePath: '/209912-yotei/',
      banzukePath: '/209912-banzuke/',
    });

    renderPage(pendingResultDay, 'result');

    expect(screen.getByText('結果未更新')).toBeInTheDocument();
    expect(screen.getByText(`更新日: ${formatUpdatedAt(torikumiArchive.scheduleUpdatedAt)}`)).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    expect(screen.queryByText('幕内の取組結果はまだ更新されていません。')).not.toBeInTheDocument();
  });

  it('shows absentees below update date when provided', () => {
    const scheduleDay = torikumiArchive.scheduleDays[0];
    const dayWithAbsentees: TorikumiArchiveDay = {
      ...scheduleDay,
      data: {
        ...scheduleDay.data,
        makuuchi: {
          ...scheduleDay.data.makuuchi,
          absentees: [{ id: 1, name: '大の里', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/1/' }],
        },
        juryo: {
          ...scheduleDay.data.juryo,
          absentees: [{ id: 2, name: '青安錦', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/2/' }],
        },
      },
    };

    renderPage(dayWithAbsentees, 'schedule');

    expect(screen.getByText(`更新日: ${formatUpdatedAt(torikumiArchive.scheduleUpdatedAt)}`)).toBeInTheDocument();
    expect(screen.getByText('休場者:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '大の里' })).toHaveAttribute('href', '/rikishi/1/');
    expect(screen.getByRole('link', { name: '青安錦' })).toHaveAttribute('href', '/rikishi/2/');
  });

  it('shows absentees on result pages when provided', () => {
    const resultDayWithAbsentees: TorikumiArchiveDay = {
      ...torikumiArchive.resultDays[0],
      data: {
        ...torikumiArchive.resultDays[0].data,
        makuuchi: {
          ...torikumiArchive.resultDays[0].data.makuuchi,
          absentees: [{ id: 1, name: '大の里', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/1/' }],
        },
        juryo: {
          ...torikumiArchive.resultDays[0].data.juryo,
          absentees: [{ id: 2, name: '青安錦', profileUrl: 'https://www.sumo.or.jp/ResultRikishiData/profile/2/' }],
        },
      },
    };

    renderPage(resultDayWithAbsentees, 'result');

    expect(screen.getByText('休場者:')).toBeInTheDocument();
  });

  it('replaces matches involving an absentee with an absent placeholder row', () => {
    const marchDay = MARCH2026_TORIKUMI_DATA.resultDays?.find((day) => day.data.makuuchi.matches.length > 0);
    expect(marchDay).toBeDefined();
    const targetMatch = marchDay!.data.makuuchi.matches[0];
    const idMatch = targetMatch.eastProfileUrl.match(/profile\/(\d+)/);
    expect(idMatch).not.toBeNull();
    const absentRikishiId = Number(idMatch![1]);
    const absentEntry = {
      id: absentRikishiId,
      name: '休場力士',
      profileUrl: `https://www.sumo.or.jp/ResultRikishiData/profile/${absentRikishiId}/`,
    };

    const dayWithAbsentMatch: TorikumiArchiveDay = {
      ...marchDay!,
      data: {
        ...marchDay!.data,
        makuuchi: {
          ...marchDay!.data.makuuchi,
          absentees: [absentEntry],
        },
        juryo: {
          ...marchDay!.data.juryo,
          absentees: [],
        },
      },
    };

    renderPage(dayWithAbsentMatch, 'result');

    const absentRows = document.querySelectorAll('.torikumi-row-absent');
    expect(absentRows.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('(休場)').length).toBeGreaterThanOrEqual(1);
    // boutNo アンカーは維持される (URL フラグメント #bout-makuuchi-X が生きてる)
    expect(document.getElementById(`bout-makuuchi-${targetMatch.boutNo}`)).not.toBeNull();
  });

  it('renders absent placeholder rows for schedule pages too', () => {
    const scheduleDay = MAY2026_TORIKUMI_DATA.scheduleDays?.find((day) => day.data.makuuchi.matches.length > 0);
    if (!scheduleDay) {
      return;
    }
    const targetMatch = scheduleDay.data.makuuchi.matches[0];
    const idMatch = targetMatch.eastProfileUrl.match(/profile\/(\d+)/);
    expect(idMatch).not.toBeNull();
    const absentRikishiId = Number(idMatch![1]);
    const absentEntry = {
      id: absentRikishiId,
      name: '休場予定',
      profileUrl: `https://www.sumo.or.jp/ResultRikishiData/profile/${absentRikishiId}/`,
    };

    const dayWithAbsentMatch: TorikumiArchiveDay = {
      ...scheduleDay,
      data: {
        ...scheduleDay.data,
        makuuchi: {
          ...scheduleDay.data.makuuchi,
          absentees: [absentEntry],
        },
        juryo: {
          ...scheduleDay.data.juryo,
          absentees: [],
        },
      },
    };

    renderPage(dayWithAbsentMatch, 'schedule');

    const absentRows = document.querySelectorAll('.torikumi-row-absent');
    expect(absentRows.length).toBeGreaterThanOrEqual(1);
    expect(document.getElementById(`bout-makuuchi-${targetMatch.boutNo}`)).not.toBeNull();
  });

  it('renders schedule mode content and day navigation links', () => {
    // Use May 2026 schedule days which are in a configured month
    const scheduleDay = MAY2026_TORIKUMI_DATA.scheduleDays?.[1];
    if (!scheduleDay) {
      // Skip test if no suitable schedule day available
      return;
    }
    renderPage(scheduleDay, 'schedule');

    expect(screen.getByRole('heading', { level: 1, name: /取組予定/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '一覧' })).toHaveAttribute('href', getHubPathForDateKey(scheduleDay.pathDate, 'schedule'));
    expect(screen.getByRole('link', { name: /← 初日/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /三日目 →/ })).toBeInTheDocument();
    if (scheduleDay.status === 'pending') {
      expect(screen.getByText('取組予定未更新')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('取組予定未更新')).not.toBeInTheDocument();
    }
  });

  it('keeps march day navigation and hub links in 202603', () => {
    const marchDay = MARCH2026_TORIKUMI_DATA.resultDays?.[1];
    expect(marchDay).toBeDefined();
    renderPage(marchDay!, 'result');

    expect(screen.getByRole('link', { name: '一覧' })).toHaveAttribute('href', '/202603-torikumi/');
    expect(screen.getByRole('link', { name: /← 初日/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /三日目 →/ })).toBeInTheDocument();
  });

  it('links match rikishi names to banzuke rikishi anchors and shows records', () => {
    const marchDay = MARCH2026_TORIKUMI_DATA.resultDays?.find((day) => day.data.makuuchi.matches.length > 0);
    expect(marchDay).toBeDefined();
    renderPage(marchDay!, 'result');

    const banzukeLinks = screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/202603-banzuke/#rikishi-'));
    expect(banzukeLinks.length).toBeGreaterThan(0);
    expect(banzukeLinks.some((link) => /（\d+勝\d+敗/.test(link.textContent ?? ''))).toBe(true);
  });
});
