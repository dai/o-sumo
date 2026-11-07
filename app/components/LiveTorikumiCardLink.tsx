'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TorikumiDataSet } from '../lib/torikumi-data';
import { buildLiveTorikumiTarget } from '../page';
import {
  deriveLiveProgress,
  jstMinutesOfDay,
  resolveLiveDailyData,
} from '../lib/live-progress';
import ImakokoMeter from './ImakokoMeter';

export interface LiveTorikumiCardLinkProps {
  to: string;
  label: React.ReactNode;
  sub: string;
  primary: boolean;
  archive: TorikumiDataSet;
  data: TorikumiDataSet;
}

export default function LiveTorikumiCardLink({
  to,
  label,
  sub,
  primary,
  archive,
  data,
}: LiveTorikumiCardLinkProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  // SSR 初期値はサーバーレンダリング時点の JST 分
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => jstMinutesOfDay());

  // クライアントマウント後、60秒ごとに現在時刻を再計算
  useEffect(() => {
    setCurrentMinutes(jstMinutesOfDay());
    const interval = setInterval(() => {
      setCurrentMinutes(jstMinutesOfDay());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyData = resolveLiveDailyData(archive, data);
  const progress = deriveLiveProgress(dailyData, currentMinutes);
  const { currentBout, state, formattedTime } = progress;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

  // スクリーンリーダー向けのテキスト
  let srText = '';
  if (state === 'finished') {
    srText = t('home.imakokoSrFinished');
  } else if (state === 'before_juryo' || !currentBout) {
    srText = t('home.imakokoSrMakushita', { time: formattedTime });
  } else {
    srText = t('home.imakokoSrLive', {
      time: formattedTime,
      division: currentBout.division,
      east: currentBout.eastName,
      west: currentBout.westName,
    });
  }

  return (
    <a
      href={to}
      className={`quick-nav-card live-torikumi-board${primary ? ' primary' : ''}`}
      onClick={handleClick}
    >
      <span className="sr-only">{srText}</span>

      {/* 上段: ヘッダー部（只今の取組バッジ & HH:MM 現在） */}
      <div className="live-torikumi-board__header">
        <span className="quick-nav-card__label live-torikumi-board__title">{label}</span>
        <span className="live-torikumi-board__time">
          {t('home.imakokoNow', { time: formattedTime })}
        </span>
      </div>

      {/* 上段: 現在の一番・進行状況 */}
      <div className="live-torikumi-board__current-row">
        {currentBout ? (
          <div className="live-torikumi-board__matchup">
            <span className="bout-side is-east">
              <span className="bout-emoji" aria-hidden="true">🌅</span>
              <span className="bout-side-tag">{t('home.eastSide')}</span>
              <span className="bout-shikona">{currentBout.eastName}</span>
            </span>
            <span className="bout-vs" aria-hidden="true">対</span>
            <span className="bout-side is-west">
              <span className="bout-emoji" aria-hidden="true">🌇</span>
              <span className="bout-side-tag">{t('home.westSide')}</span>
              <span className="bout-shikona">{currentBout.westName}</span>
            </span>
          </div>
        ) : (
          <div className="live-torikumi-board__state-label">
            {state === 'finished' ? t('home.imakokoFinished') : t('home.imakokoMakushita')}
          </div>
        )}
        <span className="quick-nav-card__sub live-torikumi-board__sub">{sub}</span>
      </div>

      {/* 下段: イマココメーター */}
      <ImakokoMeter progress={progress} />
    </a>
  );
}
