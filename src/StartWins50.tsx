// src/StartWins50.tsx
// 故事一：開始動作，贏了 50%
// 方案 B：燈號起跑
// 紅燈亮 → 所有球震動猶豫 → 綠燈亮 → 9顆留在原地 → 只有金球衝出

import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS } from './constants';

// ── 時間軸 (30fps, 9秒 = 270 frames) ──────────────────────────────────────────
const TL = {
  // 燈號亮起前
  RED_IN:         20,   // 紅燈出現
  RED_HOLD:       40,   // 紅燈亮起，球群開始猶豫震動
  // 黃燈
  YELLOW_IN:      85,   // 黃燈切換
  // 綠燈
  GREEN_IN:      120,   // 綠燈切換 → 金球衝出
  LAUNCH_END:    175,   // 金球加速完成
  // 灰球：看到綠燈還是猶豫，逐一試著起步又縮回
  GRAY_HESITATE: 130,   // 灰球開始猶豫抽動
  GRAY_FADE:     180,   // 灰球開始淡出
  GRAY_GONE:     230,
  // 文字
  TEXT_IN:       195,
  TEXT_OUT:      255,
  END:           270,
} as const;

const BALL_SIZE    = 76;
const TRACK_Y      = 940;
const TOTAL_BALLS  = 10;
const BALL_SPACING = 88;
const START_X      = (CANVAS.WIDTH - (TOTAL_BALLS - 1) * BALL_SPACING) / 2;
const GOLD_IDX     = 4;   // 金球在橫排中的位置
const GOLD_END_X   = 820; // 金球衝到的終點 X

// 燈號位置
const LIGHT_X = CANVAS.WIDTH / 2 - 30;
const LIGHT_Y = TRACK_Y - 480;

// 灰球猶豫配置：每顆有獨立的猶豫幅度和頻率，製造不整齊的猶豫感
const GRAY_CONFIGS = [
  { hesitateAmp: 18, freq: 0.28, phase: 0.0 },
  { hesitateAmp: 12, freq: 0.22, phase: 0.8 },
  { hesitateAmp: 20, freq: 0.31, phase: 1.6 },
  { hesitateAmp: 15, freq: 0.25, phase: 2.4 },
  null, // gold
  { hesitateAmp: 22, freq: 0.27, phase: 3.2 },
  { hesitateAmp: 10, freq: 0.33, phase: 0.4 },
  { hesitateAmp: 16, freq: 0.20, phase: 1.2 },
  { hesitateAmp: 14, freq: 0.29, phase: 2.0 },
  { hesitateAmp: 19, freq: 0.24, phase: 2.8 },
];

// ── 燈號元件 ──────────────────────────────────────────────────────────────────
const TrafficLight: React.FC<{
  phase: 'red' | 'yellow' | 'green'; 
  opacity: number;
  yOffset: number; // 新增控制垂直位移的屬性
}> = ({ phase, opacity, yOffset }) => {
  const isRed    = phase === 'red';
  const isYellow = phase === 'yellow';
  const isGreen  = phase === 'green';

  return (
    <div style={{
      position: 'absolute',
      left: LIGHT_X,
      top: LIGHT_Y,
      opacity,
      transform: `translateY(${yOffset}px)`, // 加入位移效果
    }}>
      {/* 燈桿 */}
      <div style={{
        position: 'absolute',
        left: 28, top: 0,
        width: 4, height: 480,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 2,
      }} />

      {/* 燈殼 */}
      <div style={{
        width: 60, height: 160,
        background: 'rgba(20,20,20,0.85)',
        borderRadius: 12,
        border: '1.5px solid rgba(255,255,255,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '12px 0',
      }}>
        {/* 紅燈 */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isRed ? '#e74c3c' : '#3a1010',
          boxShadow: isRed ? '0 0 20px #e74c3c, 0 0 40px #e74c3c88' : 'none',
          transition: 'all 0.2s',
        }} />
        {/* 黃燈 */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isYellow ? '#f39c12' : '#2a1a00',
          boxShadow: isYellow ? '0 0 20px #f39c12, 0 0 40px #f39c1288' : 'none',
          transition: 'all 0.2s',
        }} />
        {/* 綠燈 */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isGreen ? '#2ecc71' : '#0a2a14',
          boxShadow: isGreen ? '0 0 20px #2ecc71, 0 0 40px #2ecc7188' : 'none',
          transition: 'all 0.2s',
        }} />
      </div>
    </div>
  );
};

// ── 主元件 ────────────────────────────────────────────────────────────────────
export const StartWins50: React.FC = () => {
  const frame = useCurrentFrame();

  // ── 燈號狀態
  const lightPhase: 'red' | 'yellow' | 'green' =
    frame < TL.YELLOW_IN ? 'red' :
    frame < TL.GREEN_IN  ? 'yellow' : 'green';

  const lightOp = interpolate(
    frame, [TL.RED_IN, TL.RED_IN + 12, TL.GRAY_GONE, TL.GRAY_GONE + 30],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── 燈號 Y 軸升降動畫 ──
  const lightYOffset = interpolate(
    frame, 
    [TL.RED_IN, TL.RED_IN + 20, TL.GRAY_GONE, TL.GRAY_GONE + 20],
    [500, 0, 0, 500],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic) 
    }
  );

  // ── 全體起跑前震動（紅燈期間）
  const globalVibe = frame >= TL.RED_HOLD && frame < TL.GREEN_IN
    ? Math.sin(frame * 0.4) * 3 : 0;

  // ── 金球位置
  const goldX = (() => {
    const baseX = START_X + GOLD_IDX * BALL_SPACING;
    if (frame < TL.GREEN_IN) return baseX + globalVibe;
    const prog = interpolate(
      frame, [TL.GREEN_IN, TL.LAUNCH_END], [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.cubic) }
    );
    return interpolate(prog, [0, 1], [baseX, GOLD_END_X]);
  })();

  const goldGlow = interpolate(
    frame, [TL.GREEN_IN, TL.END], [28, 60],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ) + Math.sin(frame * 0.1) * 8;

  // ── 灰球：綠燈後猶豫抽動，然後淡出
  const getGrayX = (ballIdx: number): number => {
    const cfg = GRAY_CONFIGS[ballIdx];
    if (!cfg) return 0;
    const baseX = START_X + ballIdx * BALL_SPACING + globalVibe;

    // 綠燈後：每顆球各自猶豫（不同頻率的左右抽動）
    if (frame < TL.GRAY_HESITATE) return baseX;
    const hesitateElapsed = frame - TL.GRAY_HESITATE;
    const hesitate = Math.sin(hesitateElapsed * cfg.freq + cfg.phase) * cfg.hesitateAmp;

    // 猶豫幅度隨時間遞減（最終停下）
    const hesitateDecay = interpolate(
      frame, [TL.GRAY_HESITATE, TL.GRAY_FADE], [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return baseX + hesitate * hesitateDecay;
  };

  const getGrayOpacity = (ballIdx: number): number => {
    // 各顆稍微錯開消失時間
    const offset  = ((ballIdx * 17) % 40);
    const fadeStart = TL.GRAY_FADE + offset;
    return interpolate(frame, [fadeStart, fadeStart + 30], [1, 0.06], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
  };

  // ── 紅燈期間的「心跳」脈動（球群焦慮感）
  const heartbeat = frame >= TL.RED_HOLD && frame < TL.GREEN_IN
    ? Math.abs(Math.sin(frame * 0.35)) * 4 : 0;

  // ── 文字
  const textOp = interpolate(
    frame, [TL.TEXT_IN, TL.TEXT_IN + 18, TL.TEXT_OUT - 18, TL.TEXT_OUT],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const textSlide = interpolate(
    frame, [TL.TEXT_IN, TL.TEXT_IN + 18], [40, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic) }
  );

  // 背景微光（金球加速後）
  const bgGlow = interpolate(
    frame, [TL.LAUNCH_END, TL.LAUNCH_END + 30], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 起跑橫線
  const trackOp = interpolate(
    frame, [TL.RED_IN, TL.RED_IN + 15, TL.GRAY_GONE, TL.GRAY_GONE + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <BaseTemplate showSafeZone={false}>

      {/* 背景微光 */}
      {frame >= TL.LAUNCH_END && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: CANVAS.WIDTH, height: CANVAS.HEIGHT,
          background: `radial-gradient(ellipse at 50% 50%,
            ${BRAND.colors.gold}14 0%,
            transparent 55%)`,
          opacity: bgGlow,
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

      {/* 燈號 */}
      <TrafficLight phase={lightPhase} opacity={lightOp} yOffset={lightYOffset} />

      {/* ── 球群 ── */}
      {Array.from({ length: TOTAL_BALLS }, (_, i) => {
        const isGold = i === GOLD_IDX;

        if (isGold) {
          return (
            <div key={i} style={{
              position: 'absolute',
              left: goldX - BALL_SIZE / 2,
              top: TRACK_Y + heartbeat - BALL_SIZE / 2,
            }}>
              <Ball
                size={BALL_SIZE}
                color={BRAND.colors.gold}
                glowColor={BRAND.colors.goldGlow}
                glowSize={goldGlow}
                opacity={1}
              />
            </div>
          );
        }

        // 灰球
        const grayOpacity = getGrayOpacity(i);
        if (grayOpacity < 0.03) return null;

        return (
          <div key={i} style={{
            position: 'absolute',
            left: getGrayX(i) - BALL_SIZE / 2,
            top: TRACK_Y + heartbeat - BALL_SIZE / 2,
            opacity: grayOpacity,
          }}>
            <Ball size={BALL_SIZE} color="#4a4a4a" opacity={1} />
          </div>
        );
      })}

      {/* ── 文字 ── */}
      <div style={{
        position: 'absolute',
        top: 310 + textSlide,
        left: 0, width: CANVAS.WIDTH,
        textAlign: 'center',
        opacity: textOp,
      }}>
        <div style={{
          fontFamily: BRAND.fonts.primary,
          fontSize: BRAND.fontSize.caption,
          color: 'rgba(255,255,255,0.38)',
          letterSpacing: 6,
          marginBottom: 22,
        }}>
          綠燈亮了，你踏出去了嗎
        </div>

        <div style={{
          fontFamily: BRAND.fonts.display,
          fontSize: BRAND.fontSize.display,
          fontWeight: BRAND.fontWeight.black,
          color: BRAND.colors.gold,
          lineHeight: 1,
          letterSpacing: 4,
          textShadow: `0 0 60px ${BRAND.colors.goldGlow}, 0 0 120px ${BRAND.colors.goldGlow}`,
        }}>
          50%
        </div>

        <div style={{
          margin: '22px auto',
          width: 140, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${BRAND.colors.gold}, transparent)`,
          opacity: 0.5,
        }} />

        <div style={{
          fontFamily: BRAND.fonts.primary,
          fontSize: BRAND.fontSize.h3,
          fontWeight: BRAND.fontWeight.bold,
          color: BRAND.colors.white,
          letterSpacing: 2,
        }}>
          開始，你就已經贏了
        </div>
      </div>

    </BaseTemplate>
  );
};