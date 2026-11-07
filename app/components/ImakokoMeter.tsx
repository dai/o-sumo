import { useTranslation } from 'react-i18next';
import type { LiveProgressResult } from '../lib/live-progress';

export interface ImakokoMeterProps {
  progress: LiveProgressResult;
}

export default function ImakokoMeter({ progress }: ImakokoMeterProps) {
  const { t } = useTranslation('common');
  const { segments, pinPositionPercent, pinLabelDesktop, pinLabelMobile, activeDivision, isOpeningDay } = progress;

  const makushitaSeg = segments.find((s) => s.key === 'makushita');
  const juryoSeg = segments.find((s) => s.key === 'juryo');
  const makuuchiSeg = segments.find((s) => s.key === 'makuuchi');

  const juryoLabelKey = isOpeningDay ? 'home.imakokoJuryoDohyoIriDay1' : 'home.imakokoJuryoDohyoIri';
  const makuuchiLabelKey = isOpeningDay ? 'home.imakokoMakuuchiDohyoIriDay1' : 'home.imakokoMakuuchiDohyoIri';

  // ラベルが端で見切れないよう、ラベル部分の X 方向トランスフォームを内側にクランプ（D-3）
  // pinPositionPercent: 0% → 0% (左揃え寄り), 50% → -50% (中央揃え), 100% → -100% (右揃え寄り)
  const clampedLabelTranslateX = -Math.max(0, Math.min(100, pinPositionPercent));

  return (
    <div className="imakoko-meter" aria-hidden="true">
      {/* 1. 時刻列（イベント名付き） */}
      <div className="imakoko-meter__times">
        <span className="imakoko-meter__time-marker is-start">~</span>
        <span
          className="imakoko-meter__time-marker is-juryo"
          style={{ left: `${makushitaSeg?.ratioPercent ?? 20}%` }}
        >
          {t(juryoLabelKey)}
        </span>
        <span
          className="imakoko-meter__time-marker is-makuuchi"
          style={{ left: `${(makushitaSeg?.ratioPercent ?? 20) + (juryoSeg?.ratioPercent ?? 32)}%` }}
        >
          {t(makuuchiLabelKey)}
        </span>
        <span className="imakoko-meter__time-marker is-end">
          {t('home.imakokoEnd')}
        </span>
      </div>

      {/* 2. 部ラベル列 */}
      <div className="imakoko-meter__labels">
        <div
          className={`imakoko-meter__label is-makushita${activeDivision === 'makushita' ? ' is-active' : ''}`}
          style={{ flex: `0 0 ${makushitaSeg?.ratioPercent ?? 20}%` }}
        >
          {t('home.imakokoMakushita')}
        </div>
        <div
          className={`imakoko-meter__label is-juryo${activeDivision === 'juryo' ? ' is-active' : ''}`}
          style={{ flex: `0 0 ${juryoSeg?.ratioPercent ?? 32}%` }}
        >
          {t('home.imakokoJuryo')}
        </div>
        <div
          className={`imakoko-meter__label is-makuuchi${activeDivision === 'makuuchi' ? ' is-active' : ''}`}
          style={{ flex: `0 0 ${makuuchiSeg?.ratioPercent ?? 48}%` }}
        >
          {t('home.imakokoMakuuchi')}
        </div>
      </div>

      {/* 3. プログレスバー（トラック、セグメントボーダー、金箔フィル） */}
      <div className="imakoko-meter__track">
        <div
          className="imakoko-meter__segment is-makushita"
          style={{ flex: `0 0 ${makushitaSeg?.ratioPercent ?? 20}%` }}
        >
          <div
            className="imakoko-meter__fill"
            style={{ width: `${(makushitaSeg?.progress ?? 0) * 100}%` }}
          />
        </div>
        <div
          className="imakoko-meter__segment is-juryo"
          style={{ flex: `0 0 ${juryoSeg?.ratioPercent ?? 32}%` }}
        >
          <div
            className="imakoko-meter__fill"
            style={{ width: `${(juryoSeg?.progress ?? 0) * 100}%` }}
          />
        </div>
        <div
          className="imakoko-meter__segment is-makuuchi"
          style={{ flex: `0 0 ${makuuchiSeg?.ratioPercent ?? 48}%` }}
        >
          <div
            className="imakoko-meter__fill"
            style={{ width: `${(makuuchiSeg?.progress ?? 0) * 100}%` }}
          />
        </div>
      </div>

      {/* 4. ピン＆ラベル列 */}
      <div className="imakoko-meter__pin-row">
        <div
          className="imakoko-meter__pin-anchor"
          style={{ left: `${pinPositionPercent}%` }}
        >
          <span className="imakoko-meter__pin-icon">▲</span>
          <div
            className="imakoko-meter__pin-label-wrapper"
            style={{ transform: `translateX(${clampedLabelTranslateX}%)` }}
          >
            <span className="imakoko-meter__pin-label is-desktop">{pinLabelDesktop}</span>
            <span className="imakoko-meter__pin-label is-mobile">{pinLabelMobile}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
