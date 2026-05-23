import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MARCH2026_BANDUKE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MAY2026_BANDUKE_PATH,
  getDayPath,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';
import { MAY2026_TORIKUMI_DATA } from './lib/may2026-data';
import { MARCH2026_TORIKUMI_DATA } from './lib/march2026-torikumi-data';
import { canonicalShikona, divisionAnchorId } from './lib/rikishi-display';
import { type TorikumiArchiveDay } from './lib/torikumi-data';
import HomeLink from './components/HomeLink';
import './index.css';

interface ChampionshipCandidate {
  profileUrl: string;
  name: string;
  wins: number;
  losses: number;
  bouts: number;
}

interface ChampionshipLeader {
  profileUrl: string;
  name: string;
  href: string | null;
}

interface ChampionshipGroup {
  losses: number;
  rikishi: ChampionshipLeader[];
}

function getLatestResultHref(profileUrl: string, currentDay: number, resultDays: TorikumiArchiveDay[]): string | null {
  for (let day = currentDay; day >= 1; day -= 1) {
    const archiveDay = resultDays.find((candidate) => candidate.day === day);
    if (!archiveDay) continue;
    for (const divisionDay of [archiveDay.data.makuuchi, archiveDay.data.juryo]) {
      for (const match of divisionDay.matches) {
        if (match.eastProfileUrl === profileUrl || match.westProfileUrl === profileUrl) {
          return `${getDayPath(archiveDay, 'result')}#${divisionAnchorId(divisionDay.division, match.boutNo)}`;
        }
      }
    }
  }
  return null;
}

function buildChampionshipLeaders(currentDay: number): ChampionshipGroup[] {
  const resultDays = MAY2026_TORIKUMI_DATA.resultDays ?? [];
  const stats = new Map<string, ChampionshipCandidate>();

  resultDays
    .filter((day) => day.status === 'published' && day.day <= currentDay)
    .forEach((day) => {
      day.data.makuuchi.matches.forEach((match) => {
        const east = stats.get(match.eastProfileUrl) ?? {
          profileUrl: match.eastProfileUrl,
          name: canonicalShikona(match.eastProfileUrl, match.eastName),
          wins: 0,
          losses: 0,
          bouts: 0,
        };
        const west = stats.get(match.westProfileUrl) ?? {
          profileUrl: match.westProfileUrl,
          name: canonicalShikona(match.westProfileUrl, match.westName),
          wins: 0,
          losses: 0,
          bouts: 0,
        };

        if (match.winner === 'east') {
          east.wins += 1;
          west.losses += 1;
        } else if (match.winner === 'west') {
          west.wins += 1;
          east.losses += 1;
        }

        east.bouts += 1;
        west.bouts += 1;
        stats.set(match.eastProfileUrl, east);
        stats.set(match.westProfileUrl, west);
      });
    });

  const minimumBouts = Math.max(1, currentDay - 2);
  const activeCandidates = [...stats.values()].filter((candidate) => candidate.bouts >= minimumBouts);
  const fallbackCandidates = activeCandidates.length > 0
    ? activeCandidates
    : [...stats.values()].filter((candidate) => candidate.bouts > 0);
  if (fallbackCandidates.length === 0) return [];

  const minLosses = Math.min(...fallbackCandidates.map((candidate) => candidate.losses));
  const contenders = fallbackCandidates.filter((candidate) => candidate.losses <= minLosses + 1);
  const grouped = new Map<number, ChampionshipLeader[]>();

  contenders
    .sort((a, b) => a.losses - b.losses || b.wins - a.wins || a.name.localeCompare(b.name, 'ja'))
    .forEach((candidate) => {
      const group = grouped.get(candidate.losses) ?? [];
      group.push({
        profileUrl: candidate.profileUrl,
        name: candidate.name,
        href: getLatestResultHref(candidate.profileUrl, currentDay, resultDays),
      });
      grouped.set(candidate.losses, group);
    });

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([losses, rikishi]) => ({ losses, rikishi }));
}

export default function Home() {
  const { t } = useTranslation('common');
  const currentBashoTitle = `${MAY2026_TORIKUMI_DATA.year}${MAY2026_TORIKUMI_DATA.bashoName}`;
  const latestPublishedResultDay = MAY2026_TORIKUMI_DATA.resultDays
    ?.filter((day) => day.status === 'published')
    .reduce((maxDay, day) => Math.max(maxDay, day.day), 0) ?? 0;
  const referenceDate = MAY2026_TORIKUMI_DATA.resultUpdatedAt?.slice(0, 10);
  const latestKnownDay = MAY2026_TORIKUMI_DATA.resultDays
    ?.filter((day) => day.isoDate <= (referenceDate ?? day.isoDate))
    .reduce((maxDay, day) => Math.max(maxDay, day.day), 0) ?? 0;
  const currentDay = Math.max(latestPublishedResultDay, latestKnownDay);
  const showChampionshipRace = currentDay >= 14;
  const championshipLabel = currentDay === 14 ? '十四日目終了時点' : `${currentDay}日目`;
  const championshipLeaders = buildChampionshipLeaders(currentDay);

  return (
    <div className="home-container">
      <header className="home-header">
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}>
          <HomeLink placement="header" />
        </nav>
        <div className="header-content">
          <h1 className="home-title">{t('home.siteTitle')}</h1>
          <p className="home-subtitle">{t('home.siteSubtitle')}</p>
        </div>
      </header>

      <main className="home-main">
        {/* Current Basho - Hero Section */}
        <section className="hero-section">
          <h2>{currentBashoTitle}</h2>
          <p>{t('home.heroDescription')}</p>
          <nav className="hero-actions" aria-label="主要ページへの導線">
            <Link to={`${MAY2026_BANDUKE_PATH}/`} className="cta-button">
              {t('home.heroBanzuke')}
            </Link>
            <Link to={`${MAY2026_SCHEDULE_PATH}/`} className="cta-button secondary">
              {t('home.heroSchedule')}
            </Link>
            <Link to={`${MAY2026_RESULT_PATH}/`} className="cta-button secondary">
              {t('home.heroResult')}
            </Link>
            <Link to="/rikishi/" className="cta-button secondary">
              {t('home.heroRikishi')}
            </Link>
          </nav>
        </section>

        {showChampionshipRace ? (
          <section className="championship-section" aria-label="幕内優勝争い">
            <h2>優勝争い({championshipLabel})</h2>
            <h3>幕内優勝争い({championshipLabel})</h3>
            <div className="championship-table" role="table" aria-label="幕内優勝争い一覧">
              {championshipLeaders.map((group) => (
                <div key={group.losses} className="championship-row" role="row">
                  <p className="championship-losses" role="cell">{group.losses}敗</p>
                  <p className="championship-rikishi" role="cell">
                    {group.rikishi.map((rikishi, index) => (
                      <span key={rikishi.profileUrl}>
                        {rikishi.href ? <Link to={rikishi.href}>{rikishi.name}</Link> : rikishi.name}
                        {index < group.rikishi.length - 1 ? ' ・ ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Past Basho - March 2026 */}
        <section className="past-basho-section">
          <h2 className="past-basho-heading">
            {t('home.pastBashoHeading', {
              year: MARCH2026_TORIKUMI_DATA.year,
              name: MARCH2026_TORIKUMI_DATA.bashoName,
            })}
          </h2>
          <nav className="past-basho-actions" aria-label="三月場所への導線">
            <Link to={`${MARCH2026_BANDUKE_PATH}/`} className="cta-button secondary">
              {t('home.heroBanzuke')}
            </Link>
            <Link to={`${MARCH2026_SCHEDULE_PATH}/`} className="cta-button secondary">
              {t('home.heroSchedule')}
            </Link>
            <Link to={`${MARCH2026_RESULT_PATH}/`} className="cta-button secondary">
              {t('home.heroResult')}
            </Link>
          </nav>
          <div className="past-basho-days">
            <p className="past-basho-days-label">{t('home.pastBashoDays')}</p>
            {MARCH2026_TORIKUMI_DATA.resultDays?.map((day) => (
              <Link
                key={day.pathDate}
                to={`/${day.pathDate}-torikumi/`}
                className="past-basho-day-link"
              >
                {day.day}日
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>{t('home.footerCopyright')}</p>
        <nav aria-label="ホームの外部リンク">
          <HomeLink placement="footer" />
          {' | '}
          <a href="https://x.com/daisuke" target="_blank" rel="noopener noreferrer">{t('home.footerDaisuke')}</a>
          {' | '}
          <a href="https://github.com/dai/o-sumo" target="_blank" rel="noopener noreferrer">{t('home.footerGithub')}</a>
        </nav>
      </footer>
    </div>
  );
}
