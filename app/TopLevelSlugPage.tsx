import { Navigate, useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import TorikumiDayPage from './components/TorikumiDayPage';
import {
  findArchiveDay,
  getArchiveRouteConfigByMonthKey,
  getHubPathForDateKey,
  parseTopLevelSlug,
} from './lib/torikumi-routes';
import { ArchivePending, useArchiveDocument } from './lib/use-archive-document';

export default function TopLevelSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? parseTopLevelSlug(slug) : null;
  const monthKey = parsed?.dateKey.slice(0, 6) ?? '';
  const archiveState = useArchiveDocument(monthKey);

  if (!parsed) {
    return <NotFoundPage />;
  }
  if (!getArchiveRouteConfigByMonthKey(monthKey)) {
    return <NotFoundPage />;
  }
  if (archiveState.loading || archiveState.error || !archiveState.document) {
    return <ArchivePending error={archiveState.error} onRetry={archiveState.reload} />;
  }

  const day = findArchiveDay(parsed.dateKey, parsed.mode);
  if (!day) {
    const hubPath = getHubPathForDateKey(parsed.dateKey, parsed.mode);
    if (!hubPath || hubPath === '/') {
      return <NotFoundPage />;
    }
    return <Navigate to={hubPath} replace />;
  }

  return <TorikumiDayPage day={day} mode={parsed.mode} />;
}

