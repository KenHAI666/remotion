// src/PersistWins90.tsx
// 故事二：堅持，贏了 90%
// 10 顆球 → 9 顆逐一消失（數字往後縮小飛走）→ 只剩金球 → 登台

import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS } from './constants';

// ── 時間軸 (30fps, 12秒 = 360 frames) ────────────────────────────────────────
const TL = {
  COUNT_END:      30,   // 1s：倒數
  HOLD:           50,   // 稍微靜止讓觀眾看清 10 顆球
  DROP_START:     65,   // 第一顆開始消失
  DROP_INTERVAL:  18,   // 每顆間隔
  // 9 × 18 = 162，全部消失於 frame 65+162 = 227
  ALL_GONE:      230,
  VICTORY_START: 250,   // 金球登台
  VICTORY_MID:   295,
  TEXT2_IN:      268,
  END:           360,   // 12 秒
} as const;

const BALL_SIZE    = 80;
const TRACK_Y      = 920;
const BALL_SPACING = 95;
const TOTAL_BALLS  = 10;
const START_X      = (CANVAS.WIDTH - (TOTAL_BALLS - 1) * BALL_SPACING) / 2;

// 消失順序：由兩側往中間
const DISAPPEAR_ORDER = [9, 0, 8, 1, 7, 2, 6, 3, 5]; // 不含金球 index=4

// ── 往後飛走的數字 ────────────────────────────────────────────────────────────
// 每個數字出現時：大 → 縮小往後（模擬透視消失）並往上移動
const FlyingNumber: React.FC<{
  n: number; appearAt: number; frame: number;
}> = ({ n, appearAt, frame }) => {
  const elapsed = frame - appearAt;
  if (elapsed < 0 || elapsed > 55) return null;

  // 出現時大，然後快速縮小模擬「往遠處飛走」
  const scale = interpolate(
    elapsed, [0, 6, 50],
    [1.0, 1.15, 0.08],
    {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    }
  );

  // 往上飄走（透視感）
  const translateY = interpolate(
    elapsed, [0, 50],
    [0, -180],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) }
  );

  const opacity = interpolate(
    elapsed, [0, 5, 30, 50],
    [0, 1, 0.8, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 數字越小顏色越偏金（剩最後幾顆越顯眼）
  const isLate = n <= 3;
  const color  = isLate ? BRAND.colors.gold : 'rgba(255,255,255,0.6)';
  const glow   = isLate ? `0 0 80px ${BRAND.colors.goldGlow}` : 'none';

  return (
    <div style={{
      position: 'absolute',
      top: TRACK_Y - 200,
      left: 0, width: CANVAS.WIDTH,
      textAlign: 'center',
      pointerEvents: 'none',
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      transformOrigin: 'center bottom',
      fontFamily: BRAND.fonts.display,
      fontSize: 220,
      fontWeight: BRAND.fontWeight.black,
      color,
      textShadow: glow,
      lineHeight: 1,
    }}>
      {n}
    </div>
  );
};

// ── 主元件 ────────────────────────────────────────────────────────────────────
export const PersistWins90: React.FC = () => {
  const frame = useCurrentFrame();

  const countNum = frame < 10 ? 3 : frame < 20 ? 2 : frame < TL.COUNT_END ? 1 : null;
  const countOpacity = frame < TL.COUNT_END
    ? interpolate(frame % 10, [0, 1, 7, 10], [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const vibrateX = frame < TL.COUNT_END ? Math.sin(frame * 2.1) * 4 : 0;

  // 計算每顆球的透明度
  const getBallOpacity = (ballIndex: number): number => {
    if (ballIndex === 4) return 1; // 金球
    const idx = DISAPPEAR_ORDER.indexOf(ballIndex);
    if (idx === -1) return 1;
    const fadeStart = TL.DROP_START + idx * TL.DROP_INTERVAL;
    const fadeEnd   = fadeStart + 14;
    return interpolate(frame, [fadeStart, fadeEnd], [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // 消失時的縮小
  const getBallScale = (ballIndex: number): number => {
    if (ballIndex === 4) return 1;
    const idx = DISAPPEAR_ORDER.indexOf(ballIndex);
    if (idx === -1) return 1;
    const fadeStart = TL.DROP_START + idx * TL.DROP_INTERVAL;
    return interpolate(frame, [fadeStart + 2, fadeStart + 14], [1, 0.2],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  };

  // 飛走的數字列表
  const flyingNums = DISAPPEAR_ORDER.map((_, i) => ({
    n:        TOTAL_BALLS - 1 - i,
    appearAt: TL.DROP_START + i * TL.DROP_INTERVAL + 4,
  }));

  // 金球：全部消失後輕微懸浮，然後登台
  const goldHover = frame < TL.ALL_GONE
    ? Math.sin(frame * 0.12) * 5 : 0;

  const victoryProg = interpolate(
    frame, [TL.VICTORY_START, TL.VICTORY_MID], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.15)) }
  );
  const goldVX    = interpolate(victoryProg, [0, 1], [START_X + 4 * BALL_SPACING, CANVAS.WIDTH / 2]);
  const goldVY    = interpolate(victoryProg, [0, 1], [TRACK_Y, 370]);
  const goldScale = interpolate(victoryProg, [0, 1], [1, 1.75]);

  const activeGoldX = frame >= TL.VICTORY_START ? goldVX : START_X + 4 * BALL_SPACING + vibrateX;
  const activeGoldY = frame >= TL.VICTORY_START ? goldVY : TRACK_Y + goldHover;
  const activeScale = frame >= TL.VICTORY_START ? goldScale : 1;

  const goldGlow = frame >= TL.VICTORY_START
    ? interpolate(frame, [TL.VICTORY_START, TL.END], [35, 92],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      + Math.sin(frame * 0.1) * 20
    : 30;

  const bgGlowOp = interpolate(
    frame, [TL.VICTORY_START, TL.VICTORY_MID], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 凸台（podium）底座
  const podiumOp = interpolate(
    frame, [TL.VICTORY_START + 10, TL.VICTORY_START + 35], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const podiumW = interpolate(
    frame, [TL.VICTORY_START + 10, TL.VICTORY_START + 35], [20, 180],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic) }
  );

  // 文字 1：靜止期間
  const text1Op = interpolate(
    frame, [TL.HOLD, TL.HOLD + 18, TL.ALL_GONE - 20, TL.ALL_GONE + 10],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 文字 2：勝利（Y=1100，和金球完全分開）
  const text2Op = interpolate(
    frame, [TL.TEXT2_IN, TL.TEXT2_IN + 30], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const text2SlideY = interpolate(
    frame, [TL.TEXT2_IN, TL.TEXT2_IN + 30], [50, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic) }
  );

  // 起跑線
  const trackOp = interpolate(
    frame, [TL.COUNT_END, TL.COUNT_END + 12, TL.ALL_GONE - 10, TL.ALL_GONE + 15],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <BaseTemplate showSafeZone={false}>

      {/* 背景微光 */}
      {frame >= TL.VICTORY_START && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: CANVAS.WIDTH, height: CANVAS.HEIGHT,
          background: `radial-gradient(ellipse at 50% 20%,
            ${BRAND.colors.gold}22 0%,
            ${BRAND.colors.gold}08 32%,
            transparent 58%)`,
          opacity: bgGlowOp,
        }} />
      )}

      {/* 起跑橫線 */}
      <div style={{
        position: 'absolute',
        top: TRACK_Y + BALL_SIZE / 2 + 12,
        left: 60, right: 60, height: 1.5,
        background: 'rgba(255,255,255,0.16)',
        opacity: trackOp,
      }} />

      {/* 倒數 */}
      {countNum !== null && (
        <div style={{
          position: 'absolute', top: TRACK_Y - 340,
          left: 0, width: CANVAS.WIDTH, textAlign: 'center',
          fontFamily: BRAND.fonts.display, fontSize: 230,
          fontWeight: BRAND.fontWeight.black, color: BRAND.colors.gold,
          opacity: countOpacity,
          textShadow: `0 0 70px ${BRAND.colors.goldGlow}`,
        }}>{countNum}</div>
      )}

      {/* 往後飛走的數字 */}
      {flyingNums.map((fn, i) => (
        <FlyingNumber key={i} n={fn.n} appearAt={fn.appearAt} frame={frame} />
      ))}

      {/* ── 10 顆球橫排 ── */}
      {frame < TL.VICTORY_START && Array.from({ length: TOTAL_BALLS }, (_, i) => {
        const isGold   = i === 4;
        const opacity  = getBallOpacity(i);
        const bScale   = getBallScale(i);
        if (opacity <= 0.01) return null;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: START_X + i * BALL_SPACING + (isGold ? vibrateX : 0) - BALL_SIZE / 2,
            top: TRACK_Y + (isGold ? goldHover : 0) - BALL_SIZE / 2,
            transform: `scale(${isGold ? 1 : bScale})`,
            transformOrigin: 'center',
            opacity,
          }}>
            {isGold ? (
              <Ball
                size={BALL_SIZE}
                color={BRAND.colors.gold}
                glowColor={BRAND.colors.goldGlow}
                glowSize={goldGlow}
                opacity={1}
              />
            ) : (
              <Ball size={BALL_SIZE} color="#484848" opacity={1} />
            )}
          </div>
        );
      })}

      {/* ── 金球登台 ── */}
      {frame >= TL.VICTORY_START && (
        <>
          {/* 凸台底座 */}
          <div style={{
            position: 'absolute',
            top: goldVY + BALL_SIZE / 2 * goldScale + 12,
            left: CANVAS.WIDTH / 2 - podiumW / 2,
            width: podiumW,
            height: 14,
            borderRadius: 7,
            background: `linear-gradient(90deg, transparent, ${BRAND.colors.gold}88, transparent)`,
            opacity: podiumOp,
          }} />
          {/* 金球 */}
          <div style={{
            position: 'absolute',
            left: activeGoldX - BALL_SIZE / 2,
            top: activeGoldY - BALL_SIZE / 2,
            transform: `scale(${activeScale})`,
            transformOrigin: 'center',
          }}>
            <Ball
              size={BALL_SIZE}
              color={BRAND.colors.gold}
              glowColor={BRAND.colors.goldGlow}
              glowSize={goldGlow}
              glowSizeOuter={goldGlow * 1.8}
              opacity={1}
            />
          </div>
        </>
      )}

      {/* ── 文字 1：「9 個人放棄了，你還在」 ── */}
      <div style={{
        position: 'absolute',
        top: 310,
        left: 0, width: CANVAS.WIDTH,
        textAlign: 'center',
        opacity: text1Op,
      }}>
        <div style={{
          fontFamily: BRAND.fonts.primary,
          fontSize: BRAND.fontSize.caption,
          color: 'rgba(255,255,255,0.38)',
          letterSpacing: 6,
        }}>
          一個個放棄，你還在
        </div>
      </div>

      {/* ── 文字 2：WIN 90%（底部）── */}
      {frame >= TL.TEXT2_IN && (
        <div style={{
          position: 'absolute',
          top: 1080 + text2SlideY,
          left: 0, width: CANVAS.WIDTH,
          textAlign: 'center',
          opacity: text2Op,
        }}>
          {/* WIN */}
          <div style={{
            fontFamily: BRAND.fonts.display,
            fontSize: 160,
            fontWeight: BRAND.fontWeight.black,
            color: BRAND.colors.gold,
            lineHeight: 1, letterSpacing: 10,
            textShadow: `0 0 60px ${BRAND.colors.goldGlow}, 0 0 130px ${BRAND.colors.goldGlow}`,
          }}>
            WIN
          </div>

          {/* 分隔線 */}
          <div style={{
            margin: '22px auto',
            width: 160, height: 2,
            background: `linear-gradient(90deg, transparent, ${BRAND.colors.gold}, transparent)`,
            opacity: 0.5,
          }} />

          {/* 副標 */}
          <div style={{
            fontFamily: BRAND.fonts.primary,
            fontSize: BRAND.fontSize.h2,
            fontWeight: BRAND.fontWeight.bold,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: 4,
            marginBottom: 18,
          }}>
            贏了{' '}
            <span style={{
              color: BRAND.colors.gold,
              fontSize: BRAND.fontSize.display,
              fontWeight: BRAND.fontWeight.black,
              lineHeight: 1,
            }}>
              90%
            </span>
            {' '}的人
          </div>
        </div>
      )}

    </BaseTemplate>
  );
};