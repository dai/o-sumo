import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import TorikumiDayPage from './components/TorikumiDayPage';
import { findArchiveDay, getHubPath, parseTopLevelSlug } from './lib/torikumi-routes';

export default function TopLevelSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? parseTopLevelSlug(slug) : null;

  if (!parsed) {
    return <Navigate to="/" replace />;
  }

  const day = findArchiveDay(parsed.dateKey, parsed.mode);
  if (!day) {
    return <Navigate to={getHubPath(parsed.mode)} replace />;
  }

  return <TorikumiDayPage day={day} mode={parsed.mode} />;
}
