/**
 * BasketChallenge v2.1
 * 依照 remotion-ig SKILL 規範優化
 *
 * 修正：
 * 1. 移除所有 CSS transition（Remotion 不支援）
 * 2. topAimX 振幅從 150 → 60（球不超出左側安全區）
 * 3. 成功球入筐後定格邏輯修正（frameInAttempt 鎖值拆分）
 * 4. 失敗球渲染條件整理
 * 5. hardcode '#FFD700' → BRAND.colors.gold
 * 6. 下半 SectionTitle 往下移，與分隔線保持 80px 間距
 */
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import React from 'react';
import { BaseTemplate } from './templates/BaseTemplate';
import { Ball, Divider, BackgroundGlow } from './components';
import { BRAND, CANVAS, SAFE_ZONE, SAFE_CONTENT } from './constants';

// ─── Layout 常數（絕對 canvas 座標）────────────────────────────────────────
const SECTION_H = CANVAS.HEIGHT / 2; // 960

const HOOP = {
  x:          CANVAS.WIDTH * 0.80,           // 864
  topY:       SECTION_H * 0.58,              // 557
  bottomY:    SECTION_H + SECTION_H * 0.58,  // 1517
  width:      130,
  thickness:  14,
} as const;

const THROW_START = {
  x:       280,
  topY:    SECTION_H * 0.72,                 // 691
  bottomY: SECTION_H + SECTION_H * 0.72,    // 1651
} as const;

const BALL_SIZE   = 75;
const ARC_HEIGHT  = 460;
const MISS_OFFSETS_X = [110, -90, 150, -120] as const;

// ─── 時間軸常數 ───────────────────────────────────────────────────────────────
const TIMELINE = {
  BOTTOM_END:        360,   // 0s–12s：下半 5 次投籃
  TOTAL_ATTEMPTS:    5,
  FRAMES_PER_ATTEMPT: 72,   // 360 / 5
  TOP_THROW_FRAMES:  80,    // 上半投出動畫長度
} as const;

// ─── 局部子元件：籃框 ─────────────────────────────────────────────────────────
const Hoop: React.FC<{ absoluteY: number; color: string }> = ({ absoluteY, color }) => (
  <>
    {/* 橫桿（移除 transition，改用 interpolate 控制顏色） */}
    <div style={{
      position: 'absolute',
      left: HOOP.x - HOOP.width / 2,
      top: absoluteY,
      width: HOOP.width,
      height: HOOP.thickness,
      backgroundColor: color,
      borderRadius: HOOP.thickness / 2,
      boxShadow: `0 6px 24px ${color}66`,
      zIndex: 3,
    }} />
    {/* 網 */}
    <div style={{
      position: 'absolute',
      left: HOOP.x - HOOP.width * 0.4,
      top: absoluteY + HOOP.thickness,
      width: HOOP.width * 0.8,
      height: 90,
      border: `4px dashed ${color}`,
      opacity: 0.4,
      borderTop: 'none',
      borderBottomLeftRadius: 60,
      borderBottomRightRadius: 60,
      zIndex: 2,
    }} />
  </>
);

// ─── 局部子元件：區塊標題 ──────────────────────────────────────────────────────
const SectionTitle: React.FC<{
  title: string;
  subtitle: string;
  titleColor: string;
  absoluteY: number;
}> = ({ title, subtitle, titleColor, absoluteY }) => (
  <div style={{
    position: 'absolute',
    top: absoluteY,
    left: SAFE_ZONE.LEFT + 20,
    zIndex: 10,
  }}>
    <div style={{
      color: titleColor,
      fontSize: BRAND.fontSize.h2,
      fontFamily: BRAND.fonts.display,
      fontWeight: BRAND.fontWeight.black,
      letterSpacing: '0.12em',
      lineHeight: 1,
    }}>
      {title}
    </div>
    <div style={{
      color: BRAND.colors.muted,
      fontSize: BRAND.fontSize.caption,
      fontFamily: BRAND.fonts.primary,
      marginTop: 12,
    }}>
      {subtitle}
    </div>
  </div>
);

// ─── 主元件 ────────────────────────────────────────────────────────────────────
export const BasketChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { BOTTOM_END, FRAMES_PER_ATTEMPT, TOTAL_ATTEMPTS, TOP_THROW_FRAMES } = TIMELINE;

  // ── 下半：時間軸計算 ────────────────────────────────────────────────────
  const isBottomEnd    = frame >= BOTTOM_END;
  const attemptIndex   = isBottomEnd
    ? TOTAL_ATTEMPTS - 1
    : Math.floor(frame / FRAMES_PER_ATTEMPT);

  const frameInAttempt = isBottomEnd
    // 成功後讓球定格在進筐位置（progress = 1 終點）
    ? FRAMES_PER_ATTEMPT
    : frame % FRAMES_PER_ATTEMPT;

  const throwProgress = interpolate(
    frameInAttempt,
    [0, FRAMES_PER_ATTEMPT * 0.7],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' },
  );

  // ── 下半：計算球位置 ────────────────────────────────────────────────────
  const calcBottomBall = (i: number, progress: number) => {
    const isSuccess = i === TOTAL_ATTEMPTS - 1;
    const targetX   = isSuccess ? HOOP.x : HOOP.x + (MISS_OFFSETS_X[i] ?? 100);
    const x         = interpolate(progress, [0, 1], [THROW_START.x, targetX]);
    const arcY      = -Math.sin(progress * Math.PI) * ARC_HEIGHT;
    // 成功：終點落在筐口；失敗：落在地面偏低處
    const landYOffset = isSuccess
      ? HOOP.bottomY - THROW_START.bottomY
      : SECTION_H * 0.08;
    return {
      x,
      y: THROW_START.bottomY + interpolate(progress, [0, 1], [0, landYOffset]) + arcY,
    };
  };

  // ── 上半：猶豫搖擺 ──────────────────────────────────────────────────────
  // 振幅 60px（原本 150），確保球不超出 SAFE_ZONE.LEFT 左側
  const topAimX    = Math.sin(frame * 0.05) * 60;
  // 記錄上半開始投出瞬間的偏移，讓 airball 從該點飛出
  const finalAimX  = Math.sin(BOTTOM_END * 0.05) * 60;
  const lineSwing  = Math.sin(frame * 0.05) * 55;
  const dashOffset = frame * 2.5;

  // ── 上半：投出（Airball）────────────────────────────────────────────────
  const isAirball = frame >= BOTTOM_END;
  const topFrame  = Math.max(0, frame - BOTTOM_END);

  const topThrowProgress = interpolate(
    topFrame,
    [0, TOP_THROW_FRAMES * 0.72],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const topBallX = isAirball
    ? interpolate(topThrowProgress, [0, 1], [THROW_START.x + finalAimX, CANVAS.WIDTH + 60])
    : THROW_START.x + topAimX;

  const topBallY = isAirball
    ? THROW_START.topY
        + interpolate(topThrowProgress, [0, 1], [0, SECTION_H * 0.1])
        - Math.sin(topThrowProgress * Math.PI) * ARC_HEIGHT
    : THROW_START.topY;

  // ── 籃框顏色（用 BRAND Token，不 hardcode）──────────────────────────────
  const hoopTopColor = isAirball ? BRAND.colors.danger : BRAND.colors.gold;

  const getHoopBottomColor = (): string => {
    if (attemptIndex === TOTAL_ATTEMPTS - 1) {
      return throwProgress >= 0.7 ? BRAND.colors.success : BRAND.colors.gold;
    }
    return throwProgress > 0.1 && throwProgress < 0.75
      ? BRAND.colors.danger
      : BRAND.colors.gold;
  };

  // ── 背景微光 ────────────────────────────────────────────────────────────
  const successGlow = attemptIndex === TOTAL_ATTEMPTS - 1
    ? interpolate(
        frameInAttempt,
        [0, FRAMES_PER_ATTEMPT * 0.7],
        [0, 0.12],
        { extrapolateRight: 'clamp' },
      )
    : 0;

  const airballGlowOpacity = isAirball
    ? interpolate(topFrame, [0, 20], [0, 0.10], { extrapolateRight: 'clamp' })
    : 0;

  // ── 動態文字 ────────────────────────────────────────────────────────────
  const bottomSubtitle =
    attemptIndex < TOTAL_ATTEMPTS - 1
      ? `迭代中：Round ${attemptIndex + 1}`
      : frame < BOTTOM_END
        ? 'Round 5：成功入網！'
        : '5 Rounds，找到節奏';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <BaseTemplate showSafeZone={false}>

      {/* ── 背景微光層 ── */}
      {successGlow > 0 && (
        <BackgroundGlow
          color={BRAND.colors.success}
          opacity={successGlow}
          blur={200}
          style={{ top: SECTION_H, height: SECTION_H }}
        />
      )}
      {airballGlowOpacity > 0 && (
        <BackgroundGlow
          color={BRAND.colors.danger}
          opacity={airballGlowOpacity}
          blur={200}
          style={{ top: 0, height: SECTION_H }}
        />
      )}

      {/* ══ 上半：OVER-PLANNING ══════════════════════════════════════════════ */}
      <SectionTitle
        title="WAIT 等待"
        subtitle={isAirball ? '等太久，錯過時機⋯' : '思考中...'}
        titleColor={BRAND.colors.danger}
        absoluteY={SAFE_ZONE.TOP + 30}            // 250px，安全區上方 30px
      />

      <Hoop absoluteY={HOOP.topY} color={hoopTopColor} />

      {/* 猶豫虛線軌跡 */}
      {!isAirball && (
        <svg
          style={{ position: 'absolute', width: CANVAS.WIDTH, height: SECTION_H, overflow: 'visible', zIndex: 1 }}
          viewBox={`0 0 ${CANVAS.WIDTH} ${SECTION_H}`}
        >
          <path
            d={`M ${THROW_START.x + topAimX},${THROW_START.topY} Q ${CANVAS.WIDTH * 0.55},${SECTION_H * 0.2 + lineSwing} ${HOOP.x},${HOOP.topY}`}
            fill="none"
            stroke={BRAND.colors.whiteLow}
            strokeWidth={5}
            strokeDasharray="22 16"
            strokeDashoffset={-dashOffset}
          />
        </svg>
      )}

      {/* 上半球 */}
      <div style={{
        position: 'absolute',
        left: topBallX - BALL_SIZE / 2,
        top: topBallY - BALL_SIZE / 2,
        zIndex: 5,
      }}>
        <Ball
          size={BALL_SIZE}
          color={BRAND.colors.basketball}
          glowColor={BRAND.colors.basketballGlow}
          glowSize={isAirball ? 50 : 22}
          border="3px solid rgba(255,255,255,0.2)"
        />
      </div>

      {/* ══ 分隔線 & VS 徽章 ════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        top: SECTION_H - 3,
        left: 0,
        width: CANVAS.WIDTH,
        height: 6,
        backgroundColor: '#222',
        zIndex: 20,
      }} />
      <div style={{
        position: 'absolute',
        top: SECTION_H,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: BRAND.colors.white,
        color: BRAND.colors.bg,
        padding: '14px 40px',
        borderRadius: BRAND.radius.pill,
        fontFamily: BRAND.fonts.display,
        fontWeight: BRAND.fontWeight.black,
        fontSize: BRAND.fontSize.body,
        letterSpacing: '0.1em',
        boxShadow: '0 0 32px rgba(255,255,255,0.55)',
        zIndex: 30,
      }}>
        VS
      </div>

      {/* ══ 下半：TAKING ACTION ══════════════════════════════════════════════ */}
      <SectionTitle
        title="TEST 嘗試"
        subtitle={bottomSubtitle}
        titleColor={BRAND.colors.success}
        absoluteY={SECTION_H + 80}               // 1040px（原 1020px，與分隔線多 20px 間距）
      />

      <Hoop absoluteY={HOOP.bottomY} color={getHoopBottomColor()} />

      <Divider
        width="90%"
        color={BRAND.colors.divider}
        style={{ top: SECTION_H + SECTION_H * 0.85, left: '5%' }}
      />

      {/* 失敗球：留在地面（index 0–3）
          條件：該次嘗試已完成 AND（不是當前進行中 OR 已到 BOTTOM_END） */}
      {([0, 1, 2, 3] as const).map((i) => {
        const attemptCompleted = frame >= (i + 1) * FRAMES_PER_ATTEMPT;
        const isCurrentlyMoving = i === attemptIndex && !isBottomEnd;
        if (!attemptCompleted || isCurrentlyMoving) return null;

        const pos = calcBottomBall(i, 1);
        return (
          <div
            key={`fail-${i}`}
            style={{ position: 'absolute', left: pos.x - BALL_SIZE / 2, top: pos.y - BALL_SIZE / 2, zIndex: 2 }}
          >
            <Ball
              size={BALL_SIZE}
              color={BRAND.colors.basketball}
              glowColor={BRAND.colors.basketballGlow}
              glowSize={10}
              opacity={0.55}
            />
          </div>
        );
      })}

      {/* 當前投擲球 / 成功定格球 */}
      {(() => {
        const pos  = calcBottomBall(attemptIndex, throwProgress);
        const isOk = attemptIndex === TOTAL_ATTEMPTS - 1;
        return (
          <div style={{
            position: 'absolute',
            left: pos.x - BALL_SIZE / 2,
            top: pos.y - BALL_SIZE / 2,
            zIndex: 6,
          }}>
            <Ball
              size={BALL_SIZE}
              color={BRAND.colors.basketball}
              glowColor={isOk ? BRAND.colors.successGlow : BRAND.colors.basketballGlow}
              glowSize={isOk ? 55 : 35}
              glowSizeOuter={isOk ? 90 : undefined}
              border={`3px solid rgba(255,255,255,${isOk ? 0.6 : 0.25})`}
            />
          </div>
        );
      })()}

    </BaseTemplate>
  );
};