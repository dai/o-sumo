import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { usePageMetaOverride } from '../components/MetaHead';
import ShareCurrentLink from '../components/ShareCurrentLink';
import {
  fetchRikishiIndex,
  fetchRikishiMatchups,
  fetchRikishiProfilesFromIndex,
  findOrderedMatchup,
  rikishiProfilePath,
  type RikishiIndexItem,
  type RikishiIndexResponse,
  type RikishiProfile,
} from '../lib/rikishi-profile';
import { matchesSearch } from '../lib/search';
import { toRomaji } from '../lib/romaji';
import { SITE_ORIGIN } from '../lib/site-url';
import { useMyRikishi } from '../lib/my-rikishi';
import {
  analyzeAikuchi,
  calculateCareerWinRate,
  calculateStatDiff,
  getRikishiCurrentBashoInfo,
  getRikishiKimariteStats,
  FEATURED_MATCHUP_PRESETS,
} from '../lib/rikishi-compare-data';
import { generatedRikishiAvatarDataUrl } from '../lib/rikishi-avatar';
import { StandoffMeter } from './StandoffMeter';
import './page.css';

const MAX_COMPARE_RIKISHI = 2;
const ACTIVE_RANK = /^(?:横綱|大関|関脇|小結|前頭\d+|十両\d+)$/;

type CompareSlots = [number | null, number | null];
type CompareDrafts = [string, string];
type LoadStatus = 'loading' | 'ready' | 'error' | 'missing';

type ComparisonState = {
  key: string;
  profileStatus: LoadStatus;
  matchupStatus: Exclude<LoadStatus, 'missing'>;
  profiles: [RikishiProfile, RikishiProfile] | null;
  matchup: [number, number] | null;
};

type MatchupCardImageData = {
  first: string;
  second: string;
  firstWins: number;
  secondWins: number;
  highlights: string[];
  eyebrow: string;
  highlightTitle: string;
  aikuchiLabel: string;
};

async function createMatchupCardImage(data: MatchupCardImageData): Promise<File | null> {
  if (typeof document === 'undefined') return null;
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, '#241512');
  background.addColorStop(0.55, '#4a211c');
  background.addColorStop(1, '#1d1110');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(242, 216, 153, 0.09)';
  context.lineWidth = 2;
  for (let x = 30; x < canvas.width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  context.fillStyle = '#e8c985';
  context.font = '700 24px serif';
  context.textAlign = 'center';
  context.fillText('大  O-SUMO', 600, 58);
  context.font = '700 26px serif';
  context.fillText(data.eyebrow, 600, 108);

  context.fillStyle = '#fffaf0';
  context.font = '800 54px serif';
  context.fillText(`#${data.first}`, 330, 190);
  context.fillText(`#${data.second}`, 870, 190);
  context.fillStyle = '#e8c985';
  context.font = '900 32px serif';
  context.fillText('VS', 600, 186);

  context.fillStyle = '#fffaf0';
  context.font = '900 92px serif';
  context.fillText(String(data.firstWins), 360, 310);
  context.fillText(String(data.secondWins), 840, 310);
  context.fillStyle = '#f2d899';
  context.beginPath();
  context.roundRect(530, 247, 140, 64, 32);
  context.fill();
  context.fillStyle = '#4a211c';
  context.font = '900 25px serif';
  context.fillText(data.aikuchiLabel, 600, 288);

  context.fillStyle = 'rgba(255, 250, 240, 0.09)';
  context.strokeStyle = 'rgba(232, 201, 133, 0.45)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(90, 350, 1020, 210, 18);
  context.fill();
  context.stroke();
  context.textAlign = 'left';
  context.fillStyle = '#e8c985';
  context.font = '800 25px serif';
  context.fillText(data.highlightTitle, 135, 400);
  context.fillStyle = '#fffaf0';
  context.font = '500 24px sans-serif';
  data.highlights.slice(0, 3).forEach((highlight, index) => {
    const clipped = highlight.length > 42 ? `${highlight.slice(0, 41)}…` : highlight;
    context.fillText(`•  ${clipped}`, 145, 447 + index * 43);
  });

  context.textAlign = 'right';
  context.fillStyle = 'rgba(255, 250, 240, 0.7)';
  context.font = '600 19px sans-serif';
  context.fillText('osada.us/compare/', 1110, 606);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return null;
  return new File([blob], `o-sumo-${data.first}-vs-${data.second}.png`, { type: 'image/png' });
}

export function normalizeCompareIds(serialized: string | null): number[] {
  if (!serialized) return [];
  return [...new Set(serialized.split(',').map((value) => Number(value)).filter((id) => Number.isInteger(id) && id > 0))]
    .slice(0, MAX_COMPARE_RIKISHI);
}

function serializeSlots(slots: CompareSlots): string | null {
  const ids = slots.filter((id): id is number => id !== null);
  return ids.length ? ids.join(',') : null;
}

function slotsFromSerialized(serialized: string | null): CompareSlots {
  const ids = normalizeCompareIds(serialized);
  return [ids[0] ?? null, ids[1] ?? null];
}

function sameSlots(left: CompareSlots, right: CompareSlots): boolean {
  return left[0] === right[0] && left[1] === right[1];
}

function isActiveSekitori(item: RikishiIndexItem): boolean {
  return ACTIVE_RANK.test(item.currentRank);
}

function textOrUnknown(value: string | undefined, unknown: string): string {
  return value?.trim() || unknown;
}

function numberOrUnknown(value: number | undefined, unit: string, unknown: string): string {
  return value && value > 0 ? `${value}${unit}` : unknown;
}

function careerRecord(profile: RikishiProfile, unknown: string): string {
  const { wins, losses, draws } = profile.careerStats;
  return wins || losses || draws ? `${wins}-${losses}-${draws}` : unknown;
}

type RikishiComboboxProps = {
  slot: 0 | 1;
  items: RikishiIndexItem[];
  selectedId: number | null;
  excludedId: number | null;
  draft: string;
  onDraftChange: (slot: 0 | 1, value: string, composing: boolean) => void;
  onSelect: (slot: 0 | 1, item: RikishiIndexItem) => void;
};

function RikishiCombobox({ slot, items, selectedId, excludedId, draft, onDraftChange, onSelect }: RikishiComboboxProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const composing = React.useRef(false);
  const inputId = `compare-rikishi-${slot + 1}`;
  const listboxId = `${inputId}-listbox`;
  const label = t('comparison.slotLabel', { number: slot + 1 });
  const candidates = React.useMemo(() => items.filter((item) => (
    item.id !== excludedId
    && matchesSearch(draft, item.name, item.yomi, toRomaji(item.yomi), item.currentRank)
  )).slice(0, 12), [draft, excludedId, items]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [draft, excludedId]);

  const selectCandidate = (item: RikishiIndexItem) => {
    onSelect(slot, item);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (composing.current || event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (candidates.length ? (current + 1) % candidates.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (candidates.length ? (current <= 0 ? candidates.length - 1 : current - 1) : -1));
    } else if (event.key === 'Enter' && open && activeIndex >= 0 && candidates[activeIndex]) {
      event.preventDefault();
      selectCandidate(candidates[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div
      className="compare-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <label className="compare-combobox__slot-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="directory-search__input compare-combobox__input"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? `${inputId}-option-${candidates[activeIndex]?.id}` : undefined}
        value={draft}
        placeholder={t('rikishi.searchPlaceholder')}
        onFocus={() => setOpen(true)}
        onChange={(event) => onDraftChange(slot, event.target.value, composing.current)}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          onDraftChange(slot, event.currentTarget.value, false);
        }}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul
          id={listboxId}
          className="compare-combobox__listbox"
          role="listbox"
          aria-label={t('comparison.candidateListLabel', { label })}
        >
          {candidates.length === 0 ? (
            <li className="compare-combobox__empty" role="option" aria-selected="false">
              {t('comparison.noResults')}
            </li>
          ) : (
            candidates.map((item, index) => {
              const isSelected = item.id === selectedId;
              const isActive = index === activeIndex;
              return (
                <li
                  key={item.id}
                  id={`${inputId}-option-${item.id}`}
                  className={`compare-combobox__option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectCandidate(item);
                  }}
                >
                  <span className="compare-combobox__option-name">{item.name}</span>
                  <span className="compare-combobox__option-rank">{item.currentRank}</span>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

// -------------------------------------------------------------
// Component: VS Header Card (東 vs 西 対決カード)
// -------------------------------------------------------------
function CompareVsCard({ profiles }: { profiles: [RikishiProfile, RikishiProfile] }) {
  const { t } = useTranslation('common');
  const [profileA, profileB] = profiles;
  const currentBashoA = getRikishiCurrentBashoInfo(profileA.id);
  const currentBashoB = getRikishiCurrentBashoInfo(profileB.id);

  const avatarA = generatedRikishiAvatarDataUrl({ id: profileA.id, name: profileA.name, side: 'east' });
  const avatarB = generatedRikishiAvatarDataUrl({ id: profileB.id, name: profileB.name, side: 'west' });

  return (
    <section className="compare-vs-card" aria-label="力士対戦カード">
      {/* Rikishi A (East) */}
      <div className="compare-vs-card__side compare-vs-card__side--east">
        <img
          src={avatarA}
          alt=""
          className="compare-vs-card__avatar"
          width="88"
          height="88"
        />
        <div className="compare-vs-card__info">
          <span className="compare-vs-card__rank">{profileA.currentRank}</span>
          <h3 className="compare-vs-card__name">
            <Link to={rikishiProfilePath(profileA.id)}>{profileA.name}</Link>
          </h3>
          <span className="compare-vs-card__yomi">{toRomaji(profileA.yomi)}</span>
          <div className="compare-vs-card__meta">
            <span>{profileA.shusshin}</span>
            {currentBashoA ? (
              <span className="compare-vs-card__basho-record">
                {t('comparison.currentBashoRecord')}: <strong>{currentBashoA.wins}勝{currentBashoA.losses}敗</strong>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* VS Badge */}
      <div className="compare-vs-card__divider" aria-hidden="true">
        <span className="compare-vs-card__vs-badge">{t('comparison.vsLabel')}</span>
      </div>

      {/* Rikishi B (West) */}
      <div className="compare-vs-card__side compare-vs-card__side--west">
        <img
          src={avatarB}
          alt=""
          className="compare-vs-card__avatar"
          width="88"
          height="88"
        />
        <div className="compare-vs-card__info">
          <span className="compare-vs-card__rank">{profileB.currentRank}</span>
          <h3 className="compare-vs-card__name">
            <Link to={rikishiProfilePath(profileB.id)}>{profileB.name}</Link>
          </h3>
          <span className="compare-vs-card__yomi">{toRomaji(profileB.yomi)}</span>
          <div className="compare-vs-card__meta">
            <span>{profileB.shusshin}</span>
            {currentBashoB ? (
              <span className="compare-vs-card__basho-record">
                {t('comparison.currentBashoRecord')}: <strong>{currentBashoB.wins}勝{currentBashoB.losses}敗</strong>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: 【Primary】合口（直接対戦成績）スコアボード
// -------------------------------------------------------------
function AikuchiScoreboard({
  profiles,
  matchup,
}: {
  profiles: [RikishiProfile, RikishiProfile];
  matchup: [number, number] | null;
}) {
  const { t } = useTranslation('common');
  const [profileA, profileB] = profiles;
  const winsA = matchup ? matchup[0] : 0;
  const winsB = matchup ? matchup[1] : 0;
  const stats = analyzeAikuchi(winsA, winsB);

  const getBadgeText = () => {
    if (stats.totalBouts === 0) return t('comparison.aikuchiNone');
    if (stats.leader === null) return t('comparison.aikuchiEven');
    const leaderName = stats.leader === 0 ? profileA.name : profileB.name;
    return t('comparison.aikuchiLead', { name: leaderName, diff: stats.diff });
  };

  return (
    <section className="compare-aikuchi" aria-labelledby="aikuchi-title">
      <div className="compare-aikuchi__header">
        <div className="compare-aikuchi__title-wrap">
          <span className="compare-aikuchi__badge-icon" aria-hidden="true">⚔️</span>
          <h2 id="aikuchi-title" className="compare-aikuchi__title">{t('comparison.aikuchiTitle')}</h2>
        </div>
        <p className="compare-aikuchi__subtitle">{t('comparison.aikuchiSubtitle')}</p>
      </div>

      <div className="compare-aikuchi__scoreboard">
        {/* Left Rikishi Score */}
        <div className={`compare-aikuchi__score-side${stats.leader === 0 ? ' is-leader' : ''}`}>
          <span className="compare-aikuchi__rikishi-name">{profileA.name}</span>
          <div className="compare-aikuchi__score-val">{stats.winsA}</div>
          <span className="compare-aikuchi__win-rate">
            {stats.totalBouts > 0 ? t('comparison.aikuchiWinRate', { rate: stats.winRateA }) : '-'}
          </span>
        </div>

        {/* Center Total / Status */}
        <div className="compare-aikuchi__center">
          <div className="compare-aikuchi__total-bouts">
            {stats.totalBouts > 0 ? t('comparison.aikuchiTotal', { total: stats.totalBouts }) : t('comparison.aikuchiTotal', { total: 0 })}
          </div>
          <div className={`compare-aikuchi__status-pill${stats.leader !== null ? ' is-lead' : ' is-even'}`}>
            {getBadgeText()}
          </div>
        </div>

        {/* Right Rikishi Score */}
        <div className={`compare-aikuchi__score-side${stats.leader === 1 ? ' is-leader' : ''}`}>
          <span className="compare-aikuchi__rikishi-name">{profileB.name}</span>
          <div className="compare-aikuchi__score-val">{stats.winsB}</div>
          <span className="compare-aikuchi__win-rate">
            {stats.totalBouts > 0 ? t('comparison.aikuchiWinRate', { rate: stats.winRateB }) : '-'}
          </span>
        </div>
      </div>

      {/* Visual Meter Bar */}
      {stats.totalBouts > 0 ? (
        <div className="compare-aikuchi__meter-container" aria-hidden="true">
          <div
            className="compare-aikuchi__meter-bar compare-aikuchi__meter-bar--a"
            style={{ width: `${stats.winRateA}%` }}
          />
          <div
            className="compare-aikuchi__meter-bar compare-aikuchi__meter-bar--b"
            style={{ width: `${stats.winRateB}%` }}
          />
        </div>
      ) : null}
    </section>
  );
}

function MatchupShareCard({
  profiles,
  matchup,
}: {
  profiles: [RikishiProfile, RikishiProfile];
  matchup: [number, number] | null;
}) {
  const { t } = useTranslation('common');
  const { pathname, search } = useLocation();
  const [profileA, profileB] = profiles;
  const stats = analyzeAikuchi(matchup?.[0] ?? 0, matchup?.[1] ?? 0);
  const weightDiff = calculateStatDiff(profileA.weight || 0, profileB.weight || 0);
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'shared' | 'copied'>('idle');

  const aikuchiHighlight = stats.totalBouts === 0
    ? t('comparison.matchCardFirstMeeting')
    : stats.leader === null
      ? t('comparison.matchCardEven', { total: stats.totalBouts })
      : t('comparison.matchCardLead', {
          name: stats.leader === 0 ? profileA.name : profileB.name,
          diff: stats.diff,
          total: stats.totalBouts,
        });

  const weightHighlight = weightDiff.diff > 0
    ? t('comparison.matchCardWeight', {
        name: weightDiff.advantage === 0 ? profileA.name : profileB.name,
        diff: weightDiff.diff,
      })
    : t('comparison.matchCardWeightEven');

  const recordA = getRikishiCurrentBashoInfo(profileA.id);
  const recordB = getRikishiCurrentBashoInfo(profileB.id);
  const currentBashoHighlight = recordA && recordB
    ? t('comparison.matchCardCurrentBasho', {
        first: profileA.name,
        firstWins: recordA.wins,
        firstLosses: recordA.losses,
        second: profileB.name,
        secondWins: recordB.wins,
        secondLosses: recordB.losses,
      })
    : null;

  const highlights = [aikuchiHighlight, weightHighlight, currentBashoHighlight].filter((value): value is string => Boolean(value));
  const title = t('comparison.matchCardShareTitle', { first: profileA.name, second: profileB.name });
  const score = stats.totalBouts > 0
    ? t('comparison.matchCardShareScore', {
        first: profileA.name,
        firstWins: stats.winsA,
        secondWins: stats.winsB,
        second: profileB.name,
      })
    : t('comparison.matchCardFirstMeeting');
  const text = `${title}\n${score}\n${t('comparison.matchCardShareHighlight', { highlight: highlights.join(' / ') })}\n${t('comparison.shareBannerHashtags')}`;
  const url = typeof window === 'undefined'
    ? `${pathname}${search}`
    : `${window.location.origin}${pathname}${search}`;

  React.useEffect(() => {
    setShareStatus('idle');
  }, [pathname, search]);

  const share = async () => {
    if (navigator.share) {
      try {
        const canShare = (navigator as unknown as { canShare?: Navigator['canShare'] }).canShare;
        const image = canShare ? await createMatchupCardImage({
          first: profileA.name,
          second: profileB.name,
          firstWins: stats.winsA,
          secondWins: stats.winsB,
          highlights,
          eyebrow: t('comparison.matchCardEyebrow'),
          highlightTitle: t('comparison.matchCardHighlights'),
          aikuchiLabel: t('comparison.matchCardAikuchi'),
          }) : null;
        const files = image ? [image] : [];
        const canShareImage = files.length > 0 && canShare?.({ files });
        await navigator.share(canShareImage ? { title, text, url, files } : { title, text, url });
        setShareStatus('shared');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        try {
          await navigator.share({ title, text, url });
          setShareStatus('shared');
          return;
        } catch (fallbackError) {
          if (fallbackError instanceof DOMException && fallbackError.name === 'AbortError') return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareStatus('copied');
    } catch {
      setShareStatus('idle');
    }
  };

  return (
    <section className="matchup-share-card" aria-labelledby="matchup-share-card-title">
      <div className="matchup-share-card__eyebrow">{t('comparison.matchCardEyebrow')}</div>
      <h2 id="matchup-share-card-title" className="matchup-share-card__title">
        <span>#{profileA.name}</span>
        <span className="matchup-share-card__vs">VS</span>
        <span>#{profileB.name}</span>
      </h2>
      <div className="matchup-share-card__score" aria-label={score}>
        <strong>{stats.winsA}</strong>
        <span>{t('comparison.matchCardAikuchi')}</span>
        <strong>{stats.winsB}</strong>
      </div>
      <div className="matchup-share-card__highlights">
        <h3>{t('comparison.matchCardHighlights')}</h3>
        <ul>
          {highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </div>
      <button type="button" className="matchup-share-card__share" onClick={share}>
        {shareStatus === 'shared'
          ? t('comparison.matchCardShared')
          : shareStatus === 'copied'
            ? t('comparison.matchCardCopied')
            : t('comparison.matchCardShareImage')}
      </button>
    </section>
  );
}

// -------------------------------------------------------------
// Component: 体格・スタッツ差 ビジュアル比較バー
// -------------------------------------------------------------
function StatComparisonBars({ profiles }: { profiles: [RikishiProfile, RikishiProfile] }) {
  const { t } = useTranslation('common');
  const [profileA, profileB] = profiles;

  const heightDiff = calculateStatDiff(profileA.height || 0, profileB.height || 0);
  const weightDiff = calculateStatDiff(profileA.weight || 0, profileB.weight || 0);

  const careerA = calculateCareerWinRate(profileA);
  const careerB = calculateCareerWinRate(profileB);
  const careerRateValA = parseFloat(careerA.rate) || 0;
  const careerRateValB = parseFloat(careerB.rate) || 0;
  const winRateDiff = calculateStatDiff(careerRateValA, careerRateValB);

  return (
    <section className="compare-stats-card" aria-labelledby="physical-stats-title">
      <div className="compare-stats-card__header">
        <h2 id="physical-stats-title" className="compare-stats-card__title">{t('comparison.physicalTitle')}</h2>
      </div>

      <div className="compare-stats-list">
        {/* Height */}
        <div className="compare-stat-row">
          <div className="compare-stat-row__top">
            <span className={`compare-stat-val compare-stat-val--left${heightDiff.advantage === 0 ? ' is-better' : ''}`}>
              {profileA.height ? `${profileA.height} cm` : '-'}
            </span>
            <span className="compare-stat-label">{t('comparison.height')}</span>
            <span className={`compare-stat-val compare-stat-val--right${heightDiff.advantage === 1 ? ' is-better' : ''}`}>
              {profileB.height ? `${profileB.height} cm` : '-'}
            </span>
          </div>
          <div className="compare-stat-bars" aria-hidden="true">
            <div className="compare-stat-bar-track compare-stat-bar-track--left">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--left${heightDiff.advantage === 0 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, Math.max(10, ((profileA.height || 0) / 205) * 100))}%` }}
              />
            </div>
            <div className="compare-stat-bar-track compare-stat-bar-track--right">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--right${heightDiff.advantage === 1 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, Math.max(10, ((profileB.height || 0) / 205) * 100))}%` }}
              />
            </div>
          </div>
          {heightDiff.diff > 0 ? (
            <div className="compare-stat-diff">
              {heightDiff.advantage === 0 ? profileA.name : profileB.name} {t('comparison.diffAdvantage', { value: heightDiff.diff, unit: 'cm' })}
            </div>
          ) : null}
        </div>

        {/* Weight */}
        <div className="compare-stat-row">
          <div className="compare-stat-row__top">
            <span className={`compare-stat-val compare-stat-val--left${weightDiff.advantage === 0 ? ' is-better' : ''}`}>
              {profileA.weight ? `${profileA.weight} kg` : '-'}
            </span>
            <span className="compare-stat-label">{t('comparison.weight')}</span>
            <span className={`compare-stat-val compare-stat-val--right${weightDiff.advantage === 1 ? ' is-better' : ''}`}>
              {profileB.weight ? `${profileB.weight} kg` : '-'}
            </span>
          </div>
          <div className="compare-stat-bars" aria-hidden="true">
            <div className="compare-stat-bar-track compare-stat-bar-track--left">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--left${weightDiff.advantage === 0 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, Math.max(10, ((profileA.weight || 0) / 200) * 100))}%` }}
              />
            </div>
            <div className="compare-stat-bar-track compare-stat-bar-track--right">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--right${weightDiff.advantage === 1 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, Math.max(10, ((profileB.weight || 0) / 200) * 100))}%` }}
              />
            </div>
          </div>
          {weightDiff.diff > 0 ? (
            <div className="compare-stat-diff">
              {weightDiff.advantage === 0 ? profileA.name : profileB.name} {t('comparison.diffAdvantage', { value: weightDiff.diff, unit: 'kg' })}
            </div>
          ) : null}
        </div>

        {/* Career Win Rate */}
        <div className="compare-stat-row">
          <div className="compare-stat-row__top">
            <span className={`compare-stat-val compare-stat-val--left${winRateDiff.advantage === 0 ? ' is-better' : ''}`}>
              {careerA.rate}
            </span>
            <span className="compare-stat-label">{t('comparison.careerWinRate')}</span>
            <span className={`compare-stat-val compare-stat-val--right${winRateDiff.advantage === 1 ? ' is-better' : ''}`}>
              {careerB.rate}
            </span>
          </div>
          <div className="compare-stat-bars" aria-hidden="true">
            <div className="compare-stat-bar-track compare-stat-bar-track--left">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--left${winRateDiff.advantage === 0 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, careerRateValA)}%` }}
              />
            </div>
            <div className="compare-stat-bar-track compare-stat-bar-track--right">
              <div
                className={`compare-stat-bar-fill compare-stat-bar-fill--right${winRateDiff.advantage === 1 ? ' is-max' : ''}`}
                style={{ width: `${Math.min(100, careerRateValB)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Component: 得意決まり手比較
// -------------------------------------------------------------
function KimariteComparison({ profiles }: { profiles: [RikishiProfile, RikishiProfile] }) {
  const { t } = useTranslation('common');
  const [profileA, profileB] = profiles;
  const statsA = React.useMemo(() => getRikishiKimariteStats(profileA.name, 4), [profileA.name]);
  const statsB = React.useMemo(() => getRikishiKimariteStats(profileB.name, 4), [profileB.name]);

  return (
    <section className="compare-kimarite-card" aria-labelledby="kimarite-comp-title">
      <div className="compare-kimarite-card__header">
        <h2 id="kimarite-comp-title" className="compare-kimarite-card__title">{t('comparison.kimariteTitle')}</h2>
        <p className="compare-kimarite-card__subtitle">{t('comparison.kimariteSubtitle')}</p>
      </div>

      <div className="compare-kimarite-grid">
        {/* Left Rikishi Kimarite */}
        <div className="compare-kimarite-col compare-kimarite-col--left">
          <h3 className="compare-kimarite-col__name">{profileA.name}</h3>
          {statsA.length === 0 ? (
            <p className="compare-kimarite-empty">{t('comparison.kimariteNone')}</p>
          ) : (
            <ul className="compare-kimarite-list">
              {statsA.map((item, idx) => (
                <li key={item.name} className="compare-kimarite-item">
                  <span className="compare-kimarite-item__rank">{idx + 1}</span>
                  <span className="compare-kimarite-item__name">{item.name}</span>
                  <span className="compare-kimarite-item__count">{item.count}勝</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Rikishi Kimarite */}
        <div className="compare-kimarite-col compare-kimarite-col--right">
          <h3 className="compare-kimarite-col__name">{profileB.name}</h3>
          {statsB.length === 0 ? (
            <p className="compare-kimarite-empty">{t('comparison.kimariteNone')}</p>
          ) : (
            <ul className="compare-kimarite-list">
              {statsB.map((item, idx) => (
                <li key={item.name} className="compare-kimarite-item">
                  <span className="compare-kimarite-item__rank">{idx + 1}</span>
                  <span className="compare-kimarite-item__name">{item.name}</span>
                  <span className="compare-kimarite-item__count">{item.count}勝</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export default function CompareRikishiPage() {
  const { t, i18n } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname, search } = useLocation();
  const rawIds = searchParams.get('ids');
  const [indexResponse, setIndexResponse] = React.useState<RikishiIndexResponse | null>(null);
  const [indexStatus, setIndexStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [comparison, setComparison] = React.useState<ComparisonState | null>(null);

  const { ids: myRikishiIds } = useMyRikishi();

  const activeIndex = React.useMemo(() => (
    indexResponse?.rikishi.filter(isActiveSekitori) ?? []
  ), [indexResponse]);

  const activeById = React.useMemo(() => (
    new Map(activeIndex.map((item) => [item.id, item]))
  ), [activeIndex]);

  const initialSlots = React.useMemo(() => slotsFromSerialized(rawIds), [rawIds]);
  const [drafts, setDrafts] = React.useState<CompareDrafts>(['', '']);
  const slotsRef = React.useRef<CompareSlots>(initialSlots);
  const renderedSlots = slotsRef.current;
  const renderedDrafts = drafts;
  const locallyRenderedRawIds = React.useRef<string | null>(rawIds);
  const ownUrlWrite = React.useRef<string | null>(null);

  const applySlots = React.useCallback((nextSlots: CompareSlots) => {
    slotsRef.current = nextSlots;
    const nextSerialized = serializeSlots(nextSlots);
    if (nextSerialized === rawIds) return;
    const nextParams = new URLSearchParams(searchParams);
    if (nextSerialized) nextParams.set('ids', nextSerialized);
    else nextParams.delete('ids');
    ownUrlWrite.current = nextSerialized;
    setSearchParams(nextParams, { replace: true });
  }, [rawIds, searchParams, setSearchParams]);

  React.useEffect(() => {
    if (rawIds === ownUrlWrite.current) {
      locallyRenderedRawIds.current = rawIds;
      ownUrlWrite.current = null;
      return;
    }
    if (rawIds === locallyRenderedRawIds.current) return;
    const incomingSlots = slotsFromSerialized(rawIds);
    const normalizedSlots: CompareSlots = [
      incomingSlots[0] && activeById.has(incomingSlots[0]) ? incomingSlots[0] : null,
      incomingSlots[1] && activeById.has(incomingSlots[1]) ? incomingSlots[1] : null,
    ];
    const canonical = serializeSlots(normalizedSlots);
    if (!sameSlots(slotsRef.current, normalizedSlots)) {
      slotsRef.current = normalizedSlots;
    }
    setDrafts([
      normalizedSlots[0] ? activeById.get(normalizedSlots[0])?.name ?? '' : '',
      normalizedSlots[1] ? activeById.get(normalizedSlots[1])?.name ?? '' : '',
    ]);
    if (canonical !== rawIds) {
      const nextParams = new URLSearchParams(searchParams);
      if (canonical) nextParams.set('ids', canonical);
      else nextParams.delete('ids');
      ownUrlWrite.current = canonical;
      setSearchParams(nextParams, { replace: true });
    } else {
      locallyRenderedRawIds.current = rawIds;
    }
  }, [activeById, rawIds, searchParams, setSearchParams]);

  React.useEffect(() => {
    let active = true;
    fetchRikishiIndex()
      .then((data) => {
        if (!active) return;
        const activeItemsById = new Map(data.rikishi.filter(isActiveSekitori).map((item) => [item.id, item]));
        const current = slotsRef.current;
        setIndexResponse(data);
        setDrafts([
          current[0] ? activeItemsById.get(current[0])?.name ?? '' : '',
          current[1] ? activeItemsById.get(current[1])?.name ?? '' : '',
        ]);
        setIndexStatus('ready');
      })
      .catch(() => {
        if (!active) return;
        setIndexStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const firstSelectedId = renderedSlots[0];
  const secondSelectedId = renderedSlots[1];
  const requestKey = firstSelectedId && secondSelectedId ? `${firstSelectedId},${secondSelectedId}` : null;

  React.useEffect(() => {
    if (!firstSelectedId || !secondSelectedId || !indexResponse) {
      setComparison(null);
      return undefined;
    }
    if (!activeById.has(firstSelectedId) || !activeById.has(secondSelectedId)) {
      setComparison({ key: `${firstSelectedId},${secondSelectedId}`, profileStatus: 'missing', matchupStatus: 'error', profiles: null, matchup: null });
      return undefined;
    }

    const ids: [number, number] = [firstSelectedId, secondSelectedId];
    const requestKey = `${ids[0]},${ids[1]}`;
    let active = true;

    setComparison({ key: requestKey, profileStatus: 'loading', matchupStatus: 'loading', profiles: null, matchup: null });
    Promise.allSettled([
      fetchRikishiProfilesFromIndex(indexResponse, ids),
      fetchRikishiMatchups(),
    ]).then(([profileResult, matchupResult]) => {
      if (!active) return;
      const loadedProfiles = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const profileStatus: LoadStatus = profileResult.status === 'rejected'
        ? 'error'
        : loadedProfiles?.every(Boolean) ? 'ready' : 'missing';
      const profiles = profileStatus === 'ready' ? (loadedProfiles as [RikishiProfile, RikishiProfile]) : null;
      const matchupStatus = matchupResult.status === 'fulfilled' ? 'ready' : 'error';
      const matchup = matchupResult.status === 'fulfilled'
        ? findOrderedMatchup(matchupResult.value, ids[0], ids[1])
        : null;
      setComparison({ key: requestKey, profileStatus, matchupStatus, profiles, matchup });
    });
    return () => {
      active = false;
    };
  }, [activeById, firstSelectedId, indexResponse, secondSelectedId]);

  const onDraftChange = (slot: 0 | 1, value: string, composing: boolean) => {
    const selectedId = slotsRef.current[slot];
    const selectedName = selectedId ? activeById.get(selectedId)?.name : null;
    if (slot === 0 && !value && !composing && !selectedId && slotsRef.current[1] !== null) {
      const remainingId = slotsRef.current[1];
      setDrafts([activeById.get(remainingId)?.name ?? '', '']);
      applySlots([remainingId, null]);
      return;
    }
    if (selectedId && value !== selectedName && !composing) {
      const next: CompareSlots = [...slotsRef.current] as CompareSlots;
      next[slot] = null;
      if (slot === 0 && next[1] !== null) {
        const remainingId = next[1];
        if (!value) {
          setDrafts([activeById.get(remainingId)?.name ?? '', '']);
          applySlots([remainingId, null]);
          return;
        }
      }
      applySlots(next);
    }
    setDrafts((current) => (slot === 0 ? [value, current[1]] : [current[0], value]));
  };

  const onSelect = (slot: 0 | 1, item: RikishiIndexItem) => {
    const next: CompareSlots = [...slotsRef.current] as CompareSlots;
    next[slot] = item.id;
    setDrafts((current) => (slot === 0 ? [item.name, current[1]] : [current[0], item.name]));
    applySlots(next);
  };

  const selectPair = (idA: number, idB: number) => {
    const nameA = activeById.get(idA)?.name ?? '';
    const nameB = activeById.get(idB)?.name ?? '';
    setDrafts([nameA, nameB]);
    applySlots([idA, idB]);
  };

  const clearAll = () => {
    setDrafts(['', '']);
    setComparison(null);
    applySlots([null, null]);
  };

  const unknown = t('rikishi.unknown');
  const currentComparison = requestKey && comparison?.key === requestKey ? comparison : null;
  const shareMetaOverride = currentComparison?.profiles ? (() => {
    const [first, second] = currentComparison.profiles;
    const stats = analyzeAikuchi(currentComparison.matchup?.[0] ?? 0, currentComparison.matchup?.[1] ?? 0);
    const highlight = stats.totalBouts === 0
      ? t('comparison.matchCardFirstMeeting')
      : stats.leader === null
        ? t('comparison.matchCardEven', { total: stats.totalBouts })
        : t('comparison.matchCardLead', {
            name: stats.leader === 0 ? first.name : second.name,
            diff: stats.diff,
            total: stats.totalBouts,
          });
    return {
      pathname,
      title: stats.totalBouts > 0
        ? t('comparison.shareMetaScoreTitle', { first: first.name, second: second.name, firstWins: stats.winsA, secondWins: stats.winsB })
        : t('comparison.shareMetaFirstTitle', { first: first.name, second: second.name }),
      description: stats.totalBouts > 0
        ? t('comparison.shareMetaScoreDescription', {
            first: first.name,
            second: second.name,
            firstWins: stats.winsA,
            secondWins: stats.winsB,
            highlight,
          })
        : t('comparison.shareMetaFirstDescription', { highlight }),
      socialUrl: new URL(`${pathname}${search}`, SITE_ORIGIN).toString(),
    };
  })() : null;
  usePageMetaOverride(shareMetaOverride);

  const tableReady = Boolean(
    currentComparison?.profileStatus === 'ready'
    && (currentComparison.matchupStatus === 'ready' || currentComparison.matchupStatus === 'error')
    && currentComparison.profiles,
  );
  const completelyEmpty = renderedSlots.every((id) => id === null) && renderedDrafts.every((draft) => !draft);

  const rows = currentComparison?.profiles ? [
    { label: t('comparison.rank'), values: currentComparison.profiles.map((profile) => textOrUnknown(profile.currentRank, unknown)) },
    { label: t('comparison.height'), values: currentComparison.profiles.map((profile) => numberOrUnknown(profile.height, 'cm', unknown)) },
    { label: t('comparison.weight'), values: currentComparison.profiles.map((profile) => numberOrUnknown(profile.weight, 'kg', unknown)) },
    { label: t('comparison.origin'), values: currentComparison.profiles.map((profile) => textOrUnknown(profile.shusshin, unknown)) },
    { label: t('comparison.debut'), values: currentComparison.profiles.map((profile) => textOrUnknown(profile.debut, unknown)) },
    { label: t('comparison.careerRecord'), values: currentComparison.profiles.map((profile) => careerRecord(profile, unknown)) },
    {
      label: t('comparison.headToHead'),
      values: currentComparison.matchup
        ? [`${currentComparison.matchup[0]}-${currentComparison.matchup[1]}`, `${currentComparison.matchup[1]}-${currentComparison.matchup[0]}`]
        : [unknown, unknown],
    },
  ] : [];

  return (
    <div className="rikishi-page">
      <header className="rikishi-header">
        <div className="site-header-top-row">
          <nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
          <h1 className="site-header-title">{t('comparison.title')}</h1>
        </div>
        <div className="site-header-desc-row">
          <p>{t('comparison.description')}</p>
        </div>
      </header>

      <main className="rikishi-main">
        <PageBreadcrumb
          ariaLabel={t('rikishi.breadcrumbLabel')}
          items={[
            { label: t('global.homeLink'), href: '/' },
            { label: t('rikishi.listTitle'), href: '/rikishi/' },
            { label: t('comparison.crumb') },
          ]}
        />

        {indexStatus === 'loading' ? <p className="rikishi-status">{t('rikishi.loading')}</p> : null}
        {indexStatus === 'error' ? <p className="rikishi-status warning">{t('comparison.indexError')}</p> : null}

        {indexStatus === 'ready' ? (
          <>
            {/* Quick Pick Chips (注目対戦 & マイ力士) */}
            <section className="compare-quick-picks" aria-label={t('comparison.quickPicksTitle')}>
              <div className="compare-quick-picks__header">
                <span className="compare-quick-picks__icon" aria-hidden="true">🔥</span>
                <span className="compare-quick-picks__title">{t('comparison.quickPicksTitle')}</span>
              </div>
              <div className="compare-quick-picks__list">
                {FEATURED_MATCHUP_PRESETS.map((preset) => {
                  const isSelected = renderedSlots[0] === preset.ids[0] && renderedSlots[1] === preset.ids[1];
                  const label = i18n.language === 'en' ? preset.labelEn : preset.labelJa;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={`compare-quick-chip${isSelected ? ' is-selected' : ''}`}
                      onClick={() => selectPair(preset.ids[0], preset.ids[1])}
                    >
                      {label}
                    </button>
                  );
                })}

                {/* My Rikishi Pairs */}
                {myRikishiIds.length >= 2 ? (
                  <button
                    type="button"
                    className="compare-quick-chip compare-quick-chip--my"
                    onClick={() => selectPair(myRikishiIds[0], myRikishiIds[1])}
                  >
                    ★ {t('comparison.myRikishiPicksTitle')}
                  </button>
                ) : null}
              </div>
            </section>

            {/* Selection Comboboxes */}
            <section className="compare-selector" aria-labelledby="compare-selector-title">
              <div className="compare-selector__heading">
                <div>
                  <h2 id="compare-selector-title">{t('comparison.selectTitle')}</h2>
                  <p>{t('comparison.selectDescription', { max: MAX_COMPARE_RIKISHI })}</p>
                </div>
                <div className="compare-selector__actions">
                  <ShareCurrentLink idleLabel={t('comparison.copyUrl')} />
                  <button type="button" className="compare-selector__clear" onClick={clearAll} disabled={completelyEmpty}>
                    {t('comparison.clear')}
                  </button>
                </div>
              </div>
              <div className="compare-selector__slots">
                <RikishiCombobox slot={0} items={activeIndex} selectedId={renderedSlots[0]} excludedId={renderedSlots[1]} draft={renderedDrafts[0]} onDraftChange={onDraftChange} onSelect={onSelect} />
                <RikishiCombobox slot={1} items={activeIndex} selectedId={renderedSlots[1]} excludedId={renderedSlots[0]} draft={renderedDrafts[1]} onDraftChange={onDraftChange} onSelect={onSelect} />
              </div>
            </section>

            {/* Status Messages */}
            {!requestKey ? <p className="rikishi-status">{t('comparison.needMore')}</p> : null}
            {requestKey && (!currentComparison || currentComparison.profileStatus === 'loading' || currentComparison.matchupStatus === 'loading') ? <p className="rikishi-status">{t('comparison.loading')}</p> : null}
            {currentComparison?.profileStatus === 'error' ? <p className="rikishi-status warning">{t('comparison.profileError')}</p> : null}
            {currentComparison?.profileStatus === 'missing' ? <p className="rikishi-status warning">{t('comparison.profileMissing')}</p> : null}
            {currentComparison?.matchupStatus === 'error' ? <p className="rikishi-status warning">{t('comparison.matchupError')}</p> : null}

            {/* Compare Content */}
            {tableReady && currentComparison?.profiles ? (
              <div className="compare-content-grid">
                {/* 1. VS Header Card */}
                <CompareVsCard profiles={currentComparison.profiles} />

                <MatchupShareCard
                  profiles={currentComparison.profiles}
                  matchup={currentComparison.matchup}
                />

                {/* 2. 【Primary】合口（直接対戦成績）スコアボード */}
                <AikuchiScoreboard
                  profiles={currentComparison.profiles}
                  matchup={currentComparison.matchup}
                />

                {/* 2.5 立ち合いメーター — Yūgen トーンで直近の白星の流れを対比 */}
                {currentComparison.profiles[0]?.name && currentComparison.profiles[1]?.name ? (
                  <StandoffMeter
                    nameA={currentComparison.profiles[0].name}
                    nameB={currentComparison.profiles[1].name}
                  />
                ) : null}

                {/* 3. 体格・スタッツ比較バー */}
                <StatComparisonBars profiles={currentComparison.profiles} />

                {/* 4. 得意決まり手比較 */}
                <KimariteComparison profiles={currentComparison.profiles} />

                {/* 5. 詳細スペック一覧テーブル */}
                <section className="comparison-table-wrapper">
                  <table className="comparison-table">
                    <caption>{t('comparison.tableLabel')}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{t('comparison.metric')}</th>
                        {currentComparison.profiles.map((profile) => (
                          <th key={profile.id} scope="col">
                            <Link to={rikishiProfilePath(profile.id)}>{profile.name}</Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          {row.values.map((value, index) => (
                            <td key={currentComparison.profiles?.[index].id}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}>
          <HomeLink placement="footer" /> <span> | </span>
          <Link to="/rikishi/">{t('myRikishi.findRikishi')}</Link>
        </nav>
      </footer>
    </div>
  );
}
