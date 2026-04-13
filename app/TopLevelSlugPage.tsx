import { Navigate, useParams } from 'react-router-dom';
import TorikumiDayPage from './components/TorikumiDayPage';
import { findArchiveDay, parseTopLevelSlug } from './lib/torikumi-routes';
import {
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
} from './lib/torikumi-routes';

function getHubPathForDateKey(dateKey: string, mode: 'result' | 'schedule'): string {
  if (dateKey.startsWith('202603')) {
    return mode === 'result' ? MARCH2026_RESULT_PATH : MARCH2026_SCHEDULE_PATH;
  }
  // Default: May 2026
  return mode === 'result' ? MAY2026_RESULT_PATH : MAY2026_SCHEDULE_PATH;
}

export default function TopLevelSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? parseTopLevelSlug(slug) : null;

  if (!parsed) {
    return <Navigate to="/" replace />;
  }

  const day = findArchiveDay(parsed.dateKey, parsed.mode);
  if (!day) {
    const hubPath = getHubPathForDateKey(parsed.dateKey, parsed.mode);
    return <Navigate to={hubPath} replace />;
  }

  return <TorikumiDayPage day={day} mode={parsed.mode} />;
}
