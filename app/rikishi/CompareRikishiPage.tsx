import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeLink from '../components/HomeLink';
import PageBreadcrumb from '../components/PageBreadcrumb';
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
      setActiveIndex((current) => candidates.length ? (current + 1) % candidates.length : -1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => candidates.length ? (current <= 0 ? candidates.length - 1 : current - 1) : -1);
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
        onChange={(event) => {
          setOpen(true);
          onDraftChange(slot, event.target.value, composing.current);
        }}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={(event) => {
          composing.current = false;
          onDraftChange(slot, event.currentTarget.value, false);
        }}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <div id={listboxId} className="compare-combobox__listbox" role="listbox" aria-label={t('comparison.candidateListLabel', { label })}>
          {candidates.length > 0
            ? candidates.map((item, index) => (
                <button
                  id={`${inputId}-option-${item.id}`}
                  key={item.id}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={item.id === selectedId}
                  className={`compare-combobox__option${index === activeIndex ? ' is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCandidate(item)}
                >
                  <span className="compare-combobox__rank">{item.currentRank}</span>
                  <strong>{item.name}</strong>
                  <span>{item.yomi}</span>
                  <span>{toRomaji(item.yomi)}</span>
                </button>
              ))
            : (
                <div className="compare-combobox__empty" role="option" aria-selected="false" aria-disabled="true">
                  {t('comparison.noResults')}
                </div>
              )}
        </div>
      ) : null}
    </div>
  );
}

export default function CompareRikishiPage() {
  const { t } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const rawIds = searchParams.get('ids');
  const [slots, setSlots] = React.useState<CompareSlots>(() => slotsFromSerialized(rawIds));
  const [drafts, setDrafts] = React.useState<CompareDrafts>(['', '']);
  const [indexResponse, setIndexResponse] = React.useState<RikishiIndexResponse | null>(null);
  const [indexStatus, setIndexStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [comparison, setComparison] = React.useState<ComparisonState | null>(null);
  const ownUrlWrite = React.useRef<string | null | undefined>(undefined);
  const locallyRenderedRawIds = React.useRef(rawIds);
  const slotsRef = React.useRef(slots);
  slotsRef.current = slots;

  const activeIndex = React.useMemo(
    () => (indexResponse?.rikishi ?? []).filter(isActiveSekitori),
    [indexResponse],
  );
  const activeById = React.useMemo(() => new Map(activeIndex.map((item) => [item.id, item])), [activeIndex]);
  const hasExternalUrlTransition = ownUrlWrite.current !== rawIds && locallyRenderedRawIds.current !== rawIds;
  const renderedSlots = hasExternalUrlTransition ? slotsFromSerialized(rawIds) : slots;
  const renderedDrafts: CompareDrafts = hasExternalUrlTransition
    ? [
        renderedSlots[0] ? activeById.get(renderedSlots[0])?.name ?? '' : '',
        renderedSlots[1] ? activeById.get(renderedSlots[1])?.name ?? '' : '',
      ]
    : drafts;

  const writeUrl = React.useCallback((nextSlots: CompareSlots, replace: boolean) => {
    const serialized = serializeSlots(nextSlots);
    const nextParams = new URLSearchParams(searchParams);
    if (serialized) nextParams.set('ids', serialized);
    else nextParams.delete('ids');
    ownUrlWrite.current = serialized;
    setSearchParams(nextParams, { replace });
  }, [searchParams, setSearchParams]);

  const applySlots = React.useCallback((nextSlots: CompareSlots, replace = false) => {
    slotsRef.current = nextSlots;
    setSlots(nextSlots);
    setComparison(null);
    writeUrl(nextSlots, replace);
  }, [writeUrl]);

  React.useEffect(() => {
    const normalizedSlots = slotsFromSerialized(rawIds);
    const canonical = serializeSlots(normalizedSlots);
    if (ownUrlWrite.current === rawIds) {
      ownUrlWrite.current = undefined;
      locallyRenderedRawIds.current = rawIds;
      return;
    }
    if (!sameSlots(slotsRef.current, normalizedSlots)) {
      slotsRef.current = normalizedSlots;
      setSlots(normalizedSlots);
      setComparison(null);
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
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    if (!indexResponse) return;
    const validIds = new Set(indexResponse.rikishi.filter(isActiveSekitori).map((item) => item.id));
    const current = slotsRef.current;
    const hasInvalidId = current.some((id) => id !== null && !validIds.has(id));
    const survivingIds = current.filter((id): id is number => id !== null && validIds.has(id));
    const validated: CompareSlots = hasInvalidId
      ? [survivingIds[0] ?? null, survivingIds[1] ?? null]
      : current;
    if (!sameSlots(current, validated)) {
      setDrafts([
        validated[0] ? activeById.get(validated[0])?.name ?? '' : '',
        validated[1] ? activeById.get(validated[1])?.name ?? '' : '',
      ]);
      applySlots(validated, true);
    }
  }, [activeById, applySlots, indexResponse]);

  const hasEditedSelection = renderedSlots.some((id, index) => (
    id !== null && renderedDrafts[index] !== activeById.get(id)?.name
  ));
  const firstSelectedId = hasEditedSelection ? null : renderedSlots[0];
  const secondSelectedId = hasEditedSelection ? null : renderedSlots[1];
  const requestKey = firstSelectedId && secondSelectedId ? `${firstSelectedId},${secondSelectedId}` : null;
  React.useEffect(() => {
    if (!indexResponse || !requestKey || !firstSelectedId || !secondSelectedId) {
      setComparison(null);
      return;
    }
    if (!activeById.has(firstSelectedId) || !activeById.has(secondSelectedId)) return;

    let active = true;
    const ids: [number, number] = [firstSelectedId, secondSelectedId];
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
      const profiles = profileStatus === 'ready' ? loadedProfiles as [RikishiProfile, RikishiProfile] : null;
      const matchupStatus = matchupResult.status === 'fulfilled' ? 'ready' : 'error';
      const matchup = matchupResult.status === 'fulfilled'
        ? findOrderedMatchup(matchupResult.value, ids[0], ids[1])
        : null;
      setComparison({ key: requestKey, profileStatus, matchupStatus, profiles, matchup });
    });
    return () => { active = false; };
  }, [activeById, firstSelectedId, indexResponse, requestKey, secondSelectedId]);

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
        setDrafts((current) => [value, current[1]]);
        applySlots([null, remainingId]);
        return;
      }
      setDrafts((current) => slot === 0 ? [value, current[1]] : [current[0], value]);
      applySlots(next);
      return;
    }
    setDrafts((current) => slot === 0 ? [value, current[1]] : [current[0], value]);
  };

  const onSelect = (slot: 0 | 1, item: RikishiIndexItem) => {
    const next: CompareSlots = [...slotsRef.current] as CompareSlots;
    next[slot] = item.id;
    setDrafts((current) => slot === 0 ? [item.name, current[1]] : [current[0], item.name]);
    applySlots(next);
  };

  const clearAll = () => {
    setDrafts(['', '']);
    setComparison(null);
    applySlots([null, null]);
  };

  const unknown = t('rikishi.unknown');
  const currentComparison = requestKey && comparison?.key === requestKey ? comparison : null;
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
        <nav className="site-header-nav" aria-label={t('global.siteNavigation')}><HomeLink placement="header" /></nav>
        <h1>{t('comparison.title')}</h1>
        <p>{t('comparison.description')}</p>
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
            <section className="compare-selector" aria-labelledby="compare-selector-title">
              <div className="compare-selector__heading">
                <div>
                  <h2 id="compare-selector-title">{t('comparison.selectTitle')}</h2>
                  <p>{t('comparison.selectDescription', { max: MAX_COMPARE_RIKISHI })}</p>
                </div>
                <button type="button" className="compare-selector__clear" onClick={clearAll} disabled={completelyEmpty}>{t('comparison.clear')}</button>
              </div>
              <div className="compare-selector__slots">
                <RikishiCombobox slot={0} items={activeIndex} selectedId={renderedSlots[0]} excludedId={renderedSlots[1]} draft={renderedDrafts[0]} onDraftChange={onDraftChange} onSelect={onSelect} />
                <RikishiCombobox slot={1} items={activeIndex} selectedId={renderedSlots[1]} excludedId={renderedSlots[0]} draft={renderedDrafts[1]} onDraftChange={onDraftChange} onSelect={onSelect} />
              </div>
            </section>

            {!requestKey ? <p className="rikishi-status">{t('comparison.needMore')}</p> : null}
            {requestKey && (!currentComparison || currentComparison.profileStatus === 'loading' || currentComparison.matchupStatus === 'loading') ? <p className="rikishi-status">{t('comparison.loading')}</p> : null}
            {currentComparison?.profileStatus === 'error' ? <p className="rikishi-status warning">{t('comparison.profileError')}</p> : null}
            {currentComparison?.profileStatus === 'missing' ? <p className="rikishi-status warning">{t('comparison.profileMissing')}</p> : null}
            {currentComparison?.matchupStatus === 'error' ? <p className="rikishi-status warning">{t('comparison.matchupError')}</p> : null}
            {tableReady && currentComparison?.profiles ? (
              <section className="comparison-table-wrapper">
                <table className="comparison-table">
                  <caption>{t('comparison.tableLabel')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('comparison.metric')}</th>
                      {currentComparison.profiles.map((profile) => <th key={profile.id} scope="col"><Link to={rikishiProfilePath(profile.id)}>{profile.name}</Link></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {row.values.map((value, index) => <td key={currentComparison.profiles?.[index].id}>{value}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
      <footer className="rikishi-footer">
        <nav aria-label={t('rikishi.footerNavigation')}><HomeLink placement="footer" /> <span> | </span><Link to="/rikishi/">{t('myRikishi.findRikishi')}</Link></nav>
      </footer>
    </div>
  );
}
