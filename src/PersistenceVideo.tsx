import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS, SAFE_CONTENT } from './constants';

// ── 時間軸常數 (30fps × 450 frames = 15秒) ────────────────────────────────────
const TIMELINE = {
  COUNT_END:      30,   // 倒數 3-2-1 結束         (1.0s)
  LAUNCH_START:   30,   // 球群起跑                (1.0s)
  LAUNCH_END:     60,   // Spring 收斂              (2.0s)
  TEXT1_SHOW:     90,   // WIN 50% 出現            (3.0s)
  GRAY_DROPOFF:  120,   // 灰球開始脫隊            (4.0s)
  TEXT1_FADE:    240,   // WIN 50% 淡出            (8.0s)
  TEXT2_SHOW:    300,   // WIN 90% 出現            (10.0s)
  VICTORY:       330,   // 金球登台開始            (11.0s)
  VICTORY_END:   450,   // 結尾                    (15.0s)
} as const;

// ── Layout 常數 ───────────────────────────────────────────────────────────────
const BALL_SIZE   = 72;          // 球直徑 px
const TRACK_Y     = 920;         // 跑道垂直位置
const GOLD_RUN_X  = 490;         // 金球跑動期間固定螢幕 X
const START_X     = 280;         // 起跑線 X 位置

// 10 顆球配置：5 顆跑者 + 5 顆留守者（豎直排列，不重疊）
const BALL_CONFIGS = [
  // 前 5 顆：會跟著金球跑（逐一脫隊）
  { id: 'gray-0', yOffset: -200, isRunner: true, dropAt: 130, color: '#5a5a5a' },
  { id: 'gray-1', yOffset: -100, isRunner: true, dropAt: 160, color: '#5a5a5a' },
  { id: 'gold',   yOffset:    0, isRunner: true, dropAt: null, color: BRAND.colors.gold },
  { id: 'gray-2', yOffset:  100, isRunner: true, dropAt: 190, color: '#5a5a5a' },
  { id: 'gray-3', yOffset:  200, isRunner: true, dropAt: 220, color: '#5a5a5a' },
  
  // 後 5 顆：會停留在起點
  { id: 'stay-0', yOffset: -300, isRunner: false, dropAt: null, color: '#303030' },
  { id: 'stay-1', yOffset: -150, isRunner: false, dropAt: null, color: '#303030' },
  { id: 'stay-2', yOffset:  150, isRunner: false, dropAt: null, color: '#303030' },
  { id: 'stay-3', yOffset:  300, isRunner: false, dropAt: null, color: '#303030' },
  { id: 'stay-4', yOffset: -450, isRunner: false, dropAt: null, color: '#303030' },
];

// ── 子元件 ────────────────────────────────────────────────────────────────────

/** 定位外框，Ball 本身無 position */
const Positioned: React.FC<{
  cx: number; cy: number; size: number; scale?: number; children: React.ReactNode;
}> = ({ cx, cy, size, scale = 1, children }) => (
  <div style={{
    position: 'absolute',
    left: cx - size / 2,
    top:  cy - size / 2,
    transform: `scale(${scale})`,
    transformOrigin: 'center',
  }}>
    {children}
  </div>
);

/** 水平流動速度線（跑道感） */
const FlowLines: React.FC<{ offset: number }> = ({ offset }) => (
  <svg style={{
    position: 'absolute', top: 0, left: 0,
    width: CANVAS.WIDTH, height: CANVAS.HEIGHT,
    overflow: 'visible',
  }}>
    {[0.035, 0.055, 0.045, 0.03, 0.05].map((op, i) => {
      const y = TRACK_Y - 160 + i * 80;
      return (
        <line key={i}
          x1={-120} y1={y} x2={CANVAS.WIDTH + 120} y2={y}
          stroke={`rgba(255,255,255,${op})`}
          strokeWidth={1.5}
          strokeDasharray="50 28"
          strokeDashoffset={-offset}
        />
      );
    })}
  </svg>
);

/** 倒數數字 */
const CountNum: React.FC<{ n: number; opacity: number }> = ({ n, opacity }) => (
  <div style={{
    position: 'absolute',
    top: TRACK_Y - 310,
    left: 0, width: CANVAS.WIDTH, textAlign: 'center',
    fontFamily: BRAND.fonts.display,
    fontSize: 230,
    fontWeight: BRAND.fontWeight.black,
    color: BRAND.colors.gold,
    opacity,
    textShadow: `0 0 70px ${BRAND.colors.goldGlow}`,
  }}>
    {n}
  </div>
);

// ── 主元件 ────────────────────────────────────────────────────────────────────
export const PersistenceVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ──────────────────────────────────────────
  // 第一幕：倒數 & 震動
  // ──────────────────────────────────────────

  const countNum =
    frame < 10 ? 3 :
    frame < 20 ? 2 :
    frame < TIMELINE.COUNT_END ? 1 : null;

  const countOpacity = frame < TIMELINE.COUNT_END
    ? interpolate(frame % 10, [0, 1, 7, 10], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 0;

  const vibrateX = frame < TIMELINE.COUNT_END
    ? Math.sin(frame * 2.1) * 5 : 0;

  // ──────────────────────────────────────────
  // 球群 Spring 發射
  // ──────────────────────────────────────────

  const launchSpr = spring({
    frame: frame - TIMELINE.LAUNCH_START,
    fps,
    config: { stiffness: 100, damping: 14 },
  });

  // ──────────────────────────────────────────
  // 第二幕：奔跑 + 灰球脫隊
  // ──────────────────────────────────────────

  const isRunning   = frame >= TIMELINE.LAUNCH_END;
  const runElapsed  = Math.max(0, frame - TIMELINE.LAUNCH_END);
  const flowOffset  = runElapsed * 6;

  // ⭐ 每顆球都有跑步感（彈跳）
  const bounceY     = isRunning
    ? Math.sin((runElapsed / 16) * Math.PI * 2) * 60
    : 0;

  // 跑者 X 位置（跟著 Spring）
  const runnerX = interpolate(launchSpr, [0, 1], [START_X, GOLD_RUN_X], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // 留守者透明度
  const starterOpacity = interpolate(
    frame, [TIMELINE.LAUNCH_START, TIMELINE.LAUNCH_END],
    [1, 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ──────────────────────────────────────────
  // 灰球脫隊邏輯
  // ──────────────────────────────────────────
  const getGrayBallState = (dropAt: number | null) => {
    if (dropAt === null) return { isActive: true, opacity: 1, offsetX: 0 }; // 金球不脫隊

    const hasDropped = frame >= dropAt;
    if (!hasDropped) {
      return { isActive: true, opacity: 1, offsetX: 0 };
    }

    // 脫隊後向後漂移 + 淡出
    const dropElapsed = frame - dropAt;
    const driftX = interpolate(dropElapsed, [0, 60], [0, -300], {
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(dropElapsed, [0, 50], [1, 0], {
      extrapolateRight: 'clamp',
    });

    return { isActive: opacity > 0.05, opacity, offsetX: driftX };
  };

  // ──────────────────────────────────────────
  // 金球登台（WIN 90%）
  // ──────────────────────────────────────────
  const victoryProg = interpolate(
    frame, [TIMELINE.VICTORY, TIMELINE.VICTORY + 50],
    [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 金球上升（登台）
  const goldVictoryY = interpolate(victoryProg, [0, 1], [0, -300]);
  // 金球放大（強調勝利）
  const goldVictoryScale = interpolate(victoryProg, [0, 1], [1, 1]);

  const goldGlowSize = interpolate(
    frame, [TIMELINE.VICTORY, TIMELINE.VICTORY_END],
    [35, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ) + Math.sin(frame * 0.12) * 20;

  // ──────────────────────────────────────────
  // 文字動畫
  // ──────────────────────────────────────────

  const text1Opacity = interpolate(
    frame,
    [TIMELINE.TEXT1_SHOW, TIMELINE.TEXT1_SHOW + 15, TIMELINE.TEXT1_FADE - 15, TIMELINE.TEXT1_FADE],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const text2Opacity = interpolate(
    frame, [TIMELINE.TEXT2_SHOW, TIMELINE.TEXT2_SHOW + 30],
    [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const bgGlowOp = interpolate(
    frame, [TIMELINE.VICTORY, TIMELINE.VICTORY + 60],
    [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const showStartLine = frame < TIMELINE.LAUNCH_END + 18;
  const showScene12   = frame < TIMELINE.VICTORY;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <BaseTemplate showSafeZone={false}>

      {/* ── 背景微光（第三幕） */}
      {frame >= TIMELINE.VICTORY && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: CANVAS.WIDTH, height: CANVAS.HEIGHT,
          background: `radial-gradient(ellipse at 50% 36%,
            ${BRAND.colors.gold}1A 0%,
            ${BRAND.colors.gold}08 35%,
            transparent 60%)`,
          opacity: bgGlowOp,
        }} />
      )}

      {/* ── 流動線條（跑步時） */}
      {isRunning && frame < TIMELINE.TEXT1_FADE && <FlowLines offset={flowOffset} />}

      {/* ── 起跑線 */}
      {showStartLine && (
        <div style={{
          position: 'absolute',
          top: TRACK_Y + BALL_SIZE / 2 + 16,
          left: 60, right: 60, height: 2,
          background: 'rgba(255,255,255,0.22)',
          opacity: interpolate(
            frame,
            [0, 8, TIMELINE.LAUNCH_END, TIMELINE.LAUNCH_END + 18],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
        }} />
      )}

      {/* ── 倒數數字 */}
      {countNum !== null && (
        <CountNum n={countNum} opacity={countOpacity} />
      )}

      {/* ─────────────────────────────────────
          球群（10 顆豎直排列 + 全彈跳）
      ───────────────────────────────────── */}
      {showScene12 && BALL_CONFIGS.map((config) => {
        const cy = TRACK_Y + config.yOffset;
        const isRunner = config.isRunner;
        const { isActive, opacity: dropOpacity, offsetX } = getGrayBallState(config.dropAt);

        if (!isActive) return null; // 脫隊的球完全消失

        if (isRunner) {
          // 跑者：跟著 Spring 跑動 + 全彈跳
          const cx = runnerX + vibrateX + offsetX;
          const cy_actual = cy + bounceY;

          return (
            <Positioned
              key={config.id}
              cx={cx}
              cy={cy_actual}
              size={BALL_SIZE}
            >
              {config.id === 'gold' ? (
                <Ball
                  size={BALL_SIZE}
                  color={BRAND.colors.gold}
                  glowColor={BRAND.colors.goldGlow}
                  glowSize={30}
                  opacity={dropOpacity}
                />
              ) : (
                <Ball
                  size={BALL_SIZE}
                  color={config.color}
                  opacity={dropOpacity}
                />
              )}
            </Positioned>
          );
        } else {
          // 留守者：停在起點，逐漸淡出（不彈跳）
          return (
            <Positioned
              key={config.id}
              cx={START_X + vibrateX}
              cy={cy}
              size={BALL_SIZE}
            >
              <Ball
                size={BALL_SIZE}
                color={config.color}
                opacity={interpolate(
                  frame, [TIMELINE.LAUNCH_END, TIMELINE.LAUNCH_END + 30],
                  [1, 0.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                )}
              />
            </Positioned>
          );
        }
      })}

      {/* ── 金球登台（WIN 90%） */}
      {frame >= TIMELINE.VICTORY && (
        <Positioned
          cx={GOLD_RUN_X}
          cy={TRACK_Y + goldVictoryY}
          size={BALL_SIZE}
          scale={goldVictoryScale}
        >
          <Ball
            size={BALL_SIZE}
            color={BRAND.colors.gold}
            glowColor={BRAND.colors.goldGlow}
            glowSize={goldGlowSize}
            glowSizeOuter={goldGlowSize * 2}
            opacity={1}
          />
        </Positioned>
      )}

      {/* ─────────────────────────────────────
          文字 1：WIN 50%
      ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: 300 + BALL_SIZE / 2 + 72,
        left: 0, width: CANVAS.WIDTH,
        textAlign: 'center',
        opacity: text1Opacity,
      }}>
        <span style={{
          display: 'inline-block',
          fontFamily: BRAND.fonts.primary,
          fontSize: BRAND.fontSize.h3,
          fontWeight: BRAND.fontWeight.bold,
          color: BRAND.colors.white,
          background: 'rgba(5,5,5,0.65)',
          padding: '18px 48px',
          borderRadius: BRAND.radius.md,
          border: '1px solid rgba(255,255,255,0.12)',
          letterSpacing: 1,
        }}>
          WIN{' '}
          <span style={{ color: BRAND.colors.gold }}>50%</span>
        </span>
      </div>

      {/* ─────────────────────────────────────
          第三幕文字：WIN 90% + 持續的力量
      ───────────────────────────────────── */}
      {frame >= TIMELINE.TEXT2_SHOW && (
        <div style={{
          position: 'absolute',
          top: 680,
          left: 0, width: CANVAS.WIDTH,
          textAlign: 'center',
          opacity: text2Opacity,
        }}>
          {/* 主標：WIN 90% */}
          <div style={{
            fontFamily: BRAND.fonts.primary,
            fontSize: BRAND.fontSize.display,
            fontWeight: BRAND.fontWeight.black,
            color: BRAND.colors.gold,
            textShadow: [
              `0 0 60px ${BRAND.colors.goldGlow}`,
              `0 0 120px ${BRAND.colors.goldGlow}`,
              `0 0 200px rgba(255,215,0,0.25)`,
            ].join(', '),
            lineHeight: 1,
            letterSpacing: 8,
            marginBottom: 32,
          }}>
            WIN 90%
          </div>

          {/* 分隔線 */}
          <div style={{
            margin: '32px auto',
            width: 200,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${BRAND.colors.gold}, transparent)`,
            opacity: 0.5,
          }} />

          {/* 副標：持續的力量 */}
          <div style={{
            fontFamily: BRAND.fonts.primary,
            fontSize: BRAND.fontSize.h2,
            fontWeight: BRAND.fontWeight.bold,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 3,
            marginTop: 28,
          }}>
            持續的力量
          </div>
        </div>
      )}

    </BaseTemplate>
  );
};