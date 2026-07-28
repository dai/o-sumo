import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function TrailingSlashRoute({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation();

  if (!pathname.endsWith('/')) {
    return <Navigate to={`${pathname}/${search}${hash}`} replace />;
  }

  return children;
}
