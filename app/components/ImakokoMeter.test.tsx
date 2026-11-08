import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ImakokoMeter from './ImakokoMeter';
import { i18n } from '../lib/i18n';
import type { LiveProgressResult } from '../lib/live-progress';

beforeEach(async () => {
  await i18n.changeLanguage('ja');
});

describe('ImakokoMeter', () => {
  it('renders segments, markers, and clamped pin label', () => {
    const progress: LiveProgressResult = {
      state: 'makuuchi',
      segments: [
        { key: 'makushita', progress: 1, ratioPercent: 20 },
        { key: 'juryo', progress: 1, ratioPercent: 32 },
        { key: 'makuuchi', progress: 0.5, ratioPercent: 48 },
      ],
      currentBout: {
        division: '幕内',
        boutNo: 10,
        eastName: '照ノ富士',
        westName: '豊昇龍',
      },
      nowMinutes: 16 * 60 + 30,
      formattedTime: '16:30',
      isOpeningDay: false,
      schedule: {
        juryoStartMinutes: 14 * 60 + 15,
        makuuchiStartMinutes: 15 * 60 + 40,
        endMinutes: 18 * 60,
      },
      activeDivision: 'makuuchi',
      pinPositionPercent: 76,
      pinLabelDesktop: 'イマココ（🌅 照ノ富士 対 🌇 豊昇龍）',
      pinLabelMobile: 'イマココ',
    };

    const { container } = render(<ImakokoMeter progress={progress} />);

    // ピンアンカー位置
    const pinAnchor = container.querySelector('.imakoko-meter__pin-anchor');
    expect(pinAnchor).toHaveStyle({ left: '76%' });

    // 端クランプラベルラッパー & ピンアイコン (translateX(-76%))
    const pinIcon = container.querySelector('.imakoko-meter__pin-icon');
    const labelWrapper = container.querySelector('.imakoko-meter__pin-label-wrapper');
    expect(pinIcon).toHaveStyle({ transform: 'translateX(-76%)' });
    expect(labelWrapper).toHaveStyle({ transform: 'translateX(-76%)' });

    // デスクトップ用ラベルに 🌅 と 🌇 が含まれる
    const desktopLabel = container.querySelector('.imakoko-meter__pin-label.is-desktop');
    expect(desktopLabel?.textContent).toBe('イマココ（🌅 照ノ富士 対 🌇 豊昇龍）');

    // セグメント幅（通常日: 20/32/48）
    const makushitaSeg = container.querySelector('.imakoko-meter__segment.is-makushita');
    const juryoSeg = container.querySelector('.imakoko-meter__segment.is-juryo');
    const makuuchiSeg = container.querySelector('.imakoko-meter__segment.is-makuuchi');
    expect(makushitaSeg).toHaveStyle({ flex: '0 0 20%' });
    expect(juryoSeg).toHaveStyle({ flex: '0 0 32%' });
    expect(makuuchiSeg).toHaveStyle({ flex: '0 0 48%' });
  });

  it('renders Day 1 dynamic ratios (20/29/51) for segments and markers', () => {
    const progress: LiveProgressResult = {
      state: 'juryo',
      segments: [
        { key: 'makushita', progress: 1, ratioPercent: 20 },
        { key: 'juryo', progress: 0.2, ratioPercent: 29 },
        { key: 'makuuchi', progress: 0, ratioPercent: 51 },
      ],
      currentBout: {
        division: '十両',
        boutNo: 2,
        eastName: '東十2',
        westName: '西十2',
      },
      nowMinutes: 14 * 60 + 20,
      formattedTime: '14:20',
      isOpeningDay: true,
      schedule: {
        juryoStartMinutes: 14 * 60 + 5,
        makuuchiStartMinutes: 15 * 60 + 30,
        endMinutes: 18 * 60,
      },
      activeDivision: 'juryo',
      pinPositionPercent: 25.8,
      pinLabelDesktop: 'イマココ（🌅 東十2 対 🌇 西十2）',
      pinLabelMobile: 'イマココ',
    };

    const { container } = render(<ImakokoMeter progress={progress} />);

    // 初日のセグメント比率 (20/29/51)
    const makushitaSeg = container.querySelector('.imakoko-meter__segment.is-makushita');
    const juryoSeg = container.querySelector('.imakoko-meter__segment.is-juryo');
    const makuuchiSeg = container.querySelector('.imakoko-meter__segment.is-makuuchi');
    expect(makushitaSeg).toHaveStyle({ flex: '0 0 20%' });
    expect(juryoSeg).toHaveStyle({ flex: '0 0 29%' });
    expect(makuuchiSeg).toHaveStyle({ flex: '0 0 51%' });

    // マーカーの位置 (十両開始: 20%, 幕内開始: 20 + 29 = 49%)
    const juryoMarker = container.querySelector('.imakoko-meter__time-marker.is-juryo');
    const makuuchiMarker = container.querySelector('.imakoko-meter__time-marker.is-makuuchi');
    expect(juryoMarker).toHaveStyle({ left: '20%' });
    expect(makuuchiMarker).toHaveStyle({ left: '49%' });
  });

  it('clamps pin icon and label at 100% (finished state) to align with the right edge', () => {
    const progress: LiveProgressResult = {
      state: 'finished',
      segments: [
        { key: 'makushita', progress: 1, ratioPercent: 20 },
        { key: 'juryo', progress: 1, ratioPercent: 32 },
        { key: 'makuuchi', progress: 1, ratioPercent: 48 },
      ],
      currentBout: null,
      nowMinutes: 20 * 60,
      formattedTime: '20:00',
      isOpeningDay: false,
      schedule: {
        juryoStartMinutes: 14 * 60 + 15,
        makuuchiStartMinutes: 15 * 60 + 40,
        endMinutes: 18 * 60,
      },
      activeDivision: null,
      pinPositionPercent: 100,
      pinLabelDesktop: '本日の取組は終了しました',
      pinLabelMobile: '本日の取組は終了しました',
    };

    const { container } = render(<ImakokoMeter progress={progress} />);

    const pinAnchor = container.querySelector('.imakoko-meter__pin-anchor');
    expect(pinAnchor).toHaveStyle({ left: '100%' });

    const pinIcon = container.querySelector('.imakoko-meter__pin-icon');
    const labelWrapper = container.querySelector('.imakoko-meter__pin-label-wrapper');
    expect(pinIcon).toHaveStyle({ transform: 'translateX(-100%)' });
    expect(labelWrapper).toHaveStyle({ transform: 'translateX(-100%)' });
  });
});
