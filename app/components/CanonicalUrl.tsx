import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolvePageMeta } from '../lib/page-meta';

export default function CanonicalUrl() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalLinks = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
    );
    const canonicalLink = canonicalLinks[0] ?? document.createElement('link');

    canonicalLink.rel = 'canonical';
    canonicalLink.href = resolvePageMeta(pathname).canonicalUrl;
    if (!canonicalLink.isConnected) {
      document.head.append(canonicalLink);
    }
    canonicalLinks.slice(1).forEach((link) => link.remove());
  }, [pathname]);

  return null;
}
