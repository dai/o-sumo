'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TorikumiDataSet } from '../lib/torikumi-data';
import { buildLiveTorikumiTarget } from '../page';

export interface LiveTorikumiCardLinkProps {
  to: string;
  label: React.ReactNode;
  sub: string;
  primary: boolean;
  archive: TorikumiDataSet;
  data: TorikumiDataSet;
}

// homepage の hero Quick Nav 「ただいまの取組」カードを Client Component 化。
// SSR で固定された anchor (buildLiveTorikumiTarget の jstMinutesOfDay() default は
// render 時の new Date()) ではなく、click 時の new Date() で buildLiveTorikumiTarget
// を再計算し、現在進行中の取組 (#bout-juryo-X / #bout-makuuchi-X) へ遷移する。
// ScrollToHash ([hash, pathname] 監視 → scrollToAnchorWithRetry) がそのまま anchor
// scroll を実行するため、PR #639 の仕組みに追加変更不要。
export default function LiveTorikumiCardLink({
  to,
  label,
  sub,
  primary,
  archive,
  data,
}: LiveTorikumiCardLinkProps) {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // modifier key / middle click は default のリンク動作 (新タブ / 別タブ) を許可
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const freshTarget = buildLiveTorikumiTarget(archive, data);
    event.preventDefault();
    navigate(freshTarget.href);
  };

  return (
    <a
      href={to}
      className={`quick-nav-card${primary ? ' primary' : ''}`}
      onClick={handleClick}
    >
      <span className="quick-nav-card__label">{label}</span>
      <span className="quick-nav-card__sub">{sub}</span>
    </a>
  );
}
