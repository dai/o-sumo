import React from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToAnchorWithRetry } from '../lib/scroll-to-hash';

export default function ScrollToHash() {
  const { hash, pathname } = useLocation();

  React.useEffect(() => {
    // Suppress scroll resets while use-scroll-restore is restoring position.
    if (Date.now() <= (window.__osumoScrollSuppressUntil ?? 0)) return;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    if (!targetId) return;

    scrollToAnchorWithRetry(targetId);
  }, [hash, pathname]);

  return null;
}
