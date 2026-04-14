import { Navigate, useParams } from 'react-router-dom';
import TorikumiDayPage from './components/TorikumiDayPage';
import { findArchiveDay, getHubPathForDateKey, parseTopLevelSlug } from './lib/torikumi-routes';

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
