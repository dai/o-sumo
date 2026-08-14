import { Navigate, useLocation } from 'react-router-dom';

export default function HashPreservingRedirect({ to }: { to: string }) {
  const { hash } = useLocation();
  return <Navigate to={`${to}${hash}`} replace />;
}
