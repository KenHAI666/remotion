#!/bin/bash
# BasketChallenge v2 全套建立腳本
# 執行方式：bash setup_v2.sh（在你的 Remotion 專案根目錄）

set -e
echo "🏀 建立 BasketChallenge v2 所有檔案..."

mkdir -p src/constants src/components src/templates

# ─── 1. constants/brand.ts ────────────────────────────────────────────────────
cat > src/constants/brand.ts << 'EOF'
export const BRAND = {
  colors: {
    bg: '#050505',
    bgCard: '#111111',
    bgSection: '#0a0a0a',
    bgOverlay: 'rgba(0,0,0,0.6)',
    gold: '#FFD700',
    goldDim: 'rgba(255, 215, 0, 0.12)',
    goldGlow: 'rgba(255, 215, 0, 0.55)',
    blue: '#4facfe',
    blueDim: 'rgba(79, 172, 254, 0.12)',
    blueGlow: 'rgba(79, 172, 254, 0.45)',
    success: '#4CAF50',
    successDim: 'rgba(76, 175, 80, 0.12)',
    successGlow: 'rgba(76, 175, 80, 0.5)',
    danger: '#FF4D4D',
    dangerDim: 'rgba(255, 77, 77, 0.12)',
    dangerGlow: 'rgba(255, 77, 77, 0.5)',
    basketball: '#FF8C00',
    basketballGlow: 'rgba(255, 140, 0, 0.55)',
    white: '#FFFFFF',
    whiteDim: 'rgba(255,255,255,0.08)',
    whiteMid: 'rgba(255,255,255,0.55)',
    whiteLow: 'rgba(255,255,255,0.25)',
    divider: 'rgba(255,255,255,0.10)',
    muted: '#888888',
  },
  fonts: {
    primary: "'Noto Sans TC', 'PingFang TC', sans-serif",
    display: "'Montserrat', 'Arial Black', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    display: 120, h1: 80, h2: 60, h3: 48,
    body: 36, caption: 28, small: 24, tag: 20,
  },
  fontWeight: { black: 900, bold: 700, regular: 400 },
  spacing: { xs: 16, sm: 32, md: 48, lg: 64, xl: 96 },
  radius: { sm: 12, md: 24, lg: 40, pill: 999 },
} as const;
EOF

# ─── 2. constants/safeZone.ts ─────────────────────────────────────────────────
cat > src/constants/safeZone.ts << 'EOF'
export const CANVAS = { WIDTH: 1080, HEIGHT: 1920 } as const;

export const SAFE_ZONE = {
  TOP: 220, BOTTOM: 420, LEFT: 60, RIGHT: 120,
} as const;

export const SAFE_CONTENT = {
  x: SAFE_ZONE.LEFT,
  y: SAFE_ZONE.TOP,
  width: CANVAS.WIDTH - SAFE_ZONE.LEFT - SAFE_ZONE.RIGHT,
  height: CANVAS.HEIGHT - SAFE_ZONE.TOP - SAFE_ZONE.BOTTOM,
  centerX: CANVAS.WIDTH / 2,
  centerY: SAFE_ZONE.TOP + (CANVAS.HEIGHT - SAFE_ZONE.TOP - SAFE_ZONE.BOTTOM) / 2,
  right: CANVAS.WIDTH - SAFE_ZONE.RIGHT,
  bottom: CANVAS.HEIGHT - SAFE_ZONE.BOTTOM,
} as const;
EOF

# ─── 3. constants/index.ts ────────────────────────────────────────────────────
cat > src/constants/index.ts << 'EOF'
export * from './brand';
export * from './safeZone';
EOF

# ─── 4. components/Ball.tsx ───────────────────────────────────────────────────
cat > src/components/Ball.tsx << 'EOF'
import React from 'react';
import { BRAND } from '../constants';

interface BallProps {
  size?: number;
  color?: string;
  glowColor?: string;
  glowSize?: number;
  glowSizeOuter?: number;
  opacity?: number;
  border?: string;
  style?: React.CSSProperties;
}

export const Ball: React.FC<BallProps> = ({
  size = 60,
  color = BRAND.colors.white,
  glowColor,
  glowSize = 30,
  glowSizeOuter,
  opacity = 1,
  border,
  style = {},
}) => {
  const g = glowColor ?? 'rgba(255,255,255,0.7)';
  const shadow = glowSizeOuter
    ? `0 0 ${glowSize}px ${g}, 0 0 ${glowSizeOuter}px ${g}`
    : `0 0 ${glowSize}px ${g}`;
  return (
    <div style={{
      width: size, height: size,
      backgroundColor: color,
      borderRadius: '50%',
      boxShadow: shadow,
      opacity,
      flexShrink: 0,
      ...(border ? { border } : {}),
      ...style,
    }} />
  );
};
EOF

# ─── 5. components/TextBox.tsx ────────────────────────────────────────────────
cat > src/components/TextBox.tsx << 'EOF'
import React from 'react';
import { BRAND } from '../constants';

type Variant = 'gold' | 'blue' | 'success' | 'danger' | 'dark' | 'glass';

const VARIANTS: Record<Variant, React.CSSProperties> = {
  gold:    { backgroundColor: BRAND.colors.goldDim,    border: `2px solid ${BRAND.colors.gold}`,    color: BRAND.colors.gold },
  blue:    { backgroundColor: BRAND.colors.blueDim,    border: `2px solid ${BRAND.colors.blue}`,    color: BRAND.colors.blue },
  success: { backgroundColor: BRAND.colors.successDim, border: `2px solid ${BRAND.colors.success}`, color: BRAND.colors.success },
  danger:  { backgroundColor: BRAND.colors.dangerDim,  border: `2px solid ${BRAND.colors.danger}`,  color: BRAND.colors.danger },
  dark:    { backgroundColor: BRAND.colors.bgCard,     border: `1px solid ${BRAND.colors.whiteDim}`,color: BRAND.colors.white },
  glass:   { backgroundColor: 'rgba(255,255,255,0.07)',backdropFilter:'blur(20px)', border:`1px solid rgba(255,255,255,0.14)`, color: BRAND.colors.white },
};

interface TextBoxProps {
  children: React.ReactNode;
  variant?: Variant;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: string;
  textAlign?: React.CSSProperties['textAlign'];
  padding?: string | number;
  style?: React.CSSProperties;
}

export const TextBox: React.FC<TextBoxProps> = ({
  children, variant = 'dark',
  fontSize = BRAND.fontSize.body,
  fontWeight = BRAND.fontWeight.bold,
  fontFamily = BRAND.fonts.primary,
  lineHeight = 1.5, letterSpacing = '0.03em', textAlign = 'center',
  padding = `${BRAND.spacing.sm}px ${BRAND.spacing.md}px`, style = {},
}) => (
  <div style={{
    padding, borderRadius: BRAND.radius.md,
    fontSize, fontWeight, fontFamily, lineHeight, letterSpacing, textAlign,
    ...VARIANTS[variant], ...style,
  }}>
    {children}
  </div>
);
EOF

# ─── 6. components/ui.tsx （Divider, BackgroundGlow, BrandTag） ───────────────
cat > src/components/ui.tsx << 'EOF'
import React from 'react';
import { BRAND, SAFE_ZONE } from '../constants';

export const Divider: React.FC<{
  width?: string | number; thickness?: number;
  color?: string; style?: React.CSSProperties;
}> = ({ width = '60%', thickness = 1, color = BRAND.colors.divider, style = {} }) => (
  <div style={{ width, height: thickness, backgroundColor: color, position: 'absolute', ...style }} />
);

export const BackgroundGlow: React.FC<{
  color?: string; opacity?: number; blur?: number; style?: React.CSSProperties;
}> = ({ color = BRAND.colors.gold, opacity = 0.1, blur = 150, style = {} }) => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundColor: color, opacity, filter: `blur(${blur}px)`,
    pointerEvents: 'none', ...style,
  }} />
);

export const BrandTag: React.FC<{ text?: string; style?: React.CSSProperties }> = ({
  text = '@runing_9to5', style = {},
}) => (
  <div style={{
    position: 'absolute',
    bottom: SAFE_ZONE.BOTTOM + 36,
    right: SAFE_ZONE.RIGHT + 16,
    color: BRAND.colors.whiteMid,
    fontSize: BRAND.fontSize.tag,
    fontFamily: BRAND.fonts.display,
    fontWeight: BRAND.fontWeight.bold,
    letterSpacing: '0.12em',
    zIndex: 50,
    ...style,
  }}>
    {text}
  </div>
);
EOF

# ─── 7. components/index.ts ───────────────────────────────────────────────────
cat > src/components/index.ts << 'EOF'
export { Ball } from './Ball';
export { TextBox } from './TextBox';
export { Divider, BackgroundGlow, BrandTag } from './ui';
EOF

# ─── 8. templates/BaseTemplate.tsx ───────────────────────────────────────────
cat > src/templates/BaseTemplate.tsx << 'EOF'
import { AbsoluteFill } from 'remotion';
import React from 'react';
import { BRAND, SAFE_ZONE, CANVAS } from '../constants';
import { BrandTag } from '../components';

interface BaseTemplateProps {
  children: React.ReactNode;
  bgColor?: string;
  showSafeZone?: boolean;
  brandTag?: string | false;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  children,
  bgColor = BRAND.colors.bg,
  showSafeZone = false,
  brandTag = '@runing_9to5',
}) => (
  <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
    {children}
    {showSafeZone && (
      <>
        <div style={{
          position: 'absolute',
          left: SAFE_ZONE.LEFT, top: SAFE_ZONE.TOP,
          width: CANVAS.WIDTH - SAFE_ZONE.LEFT - SAFE_ZONE.RIGHT,
          height: CANVAS.HEIGHT - SAFE_ZONE.TOP - SAFE_ZONE.BOTTOM,
          border: '3px dashed rgba(255,80,80,0.6)',
          pointerEvents: 'none', zIndex: 9998,
        }} />
        <div style={{
          position: 'absolute', left: SAFE_ZONE.LEFT + 8, top: SAFE_ZONE.TOP + 8,
          color: 'rgba(255,80,80,0.8)', fontSize: 20, fontFamily: 'monospace',
          zIndex: 9999, pointerEvents: 'none',
        }}>
          SAFE ZONE {CANVAS.WIDTH - SAFE_ZONE.LEFT - SAFE_ZONE.RIGHT} × {CANVAS.HEIGHT - SAFE_ZONE.TOP - SAFE_ZONE.BOTTOM}
        </div>
      </>
    )}
    {brandTag !== false && <BrandTag text={brandTag} />}
  </AbsoluteFill>
);
EOF

# ─── 9. BasketChallenge.tsx v2 ────────────────────────────────────────────────
cat > src/BasketChallenge.tsx << 'EOF'
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import React from 'react';
import { BaseTemplate } from './templates/BaseTemplate';
import { Ball, Divider, BackgroundGlow } from './components';
import { BRAND, CANVAS, SAFE_ZONE } from './constants';

const SECTION_H = CANVAS.HEIGHT / 2; // 960

const HOOP = {
  x: CANVAS.WIDTH * 0.80,
  topY: SECTION_H * 0.58,
  bottomY: SECTION_H + SECTION_H * 0.58,
  width: 130, thickness: 14,
};

const THROW_START = {
  x: 280,
  topY: SECTION_H * 0.72,
  bottomY: SECTION_H + SECTION_H * 0.72,
};

const BALL_SIZE = 75;
const ARC_HEIGHT = 460;
const MISS_OFFSETS_X = [110, -90, 150, -120];

const Hoop: React.FC<{ absoluteY: number; color: string }> = ({ absoluteY, color }) => (
  <>
    <div style={{
      position: 'absolute',
      left: HOOP.x - HOOP.width / 2, top: absoluteY,
      width: HOOP.width, height: HOOP.thickness,
      backgroundColor: color, borderRadius: HOOP.thickness / 2,
      boxShadow: `0 6px 24px ${color}66`, zIndex: 3,
    }} />
    <div style={{
      position: 'absolute',
      left: HOOP.x - HOOP.width * 0.4, top: absoluteY + HOOP.thickness,
      width: HOOP.width * 0.8, height: 90,
      border: `4px dashed ${color}`, opacity: 0.4,
      borderTop: 'none', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, zIndex: 2,
    }} />
  </>
);

const SectionTitle: React.FC<{
  title: string; subtitle: string;
  titleColor: string; absoluteY: number;
}> = ({ title, subtitle, titleColor, absoluteY }) => (
  <div style={{ position: 'absolute', top: absoluteY, left: SAFE_ZONE.LEFT + 20, zIndex: 10 }}>
    <div style={{
      color: titleColor, fontSize: BRAND.fontSize.h2,
      fontFamily: BRAND.fonts.display, fontWeight: BRAND.fontWeight.black, letterSpacing: '0.12em', lineHeight: 1,
    }}>{title}</div>
    <div style={{ color: BRAND.colors.muted, fontSize: BRAND.fontSize.caption, fontFamily: BRAND.fonts.primary, marginTop: 10 }}>
      {subtitle}
    </div>
  </div>
);

export const BasketChallenge: React.FC = () => {
  const frame = useCurrentFrame();

  const BOTTOM_END = 360;
  const TOTAL_ATTEMPTS = 5;
  const FRAMES_PER_ATTEMPT = BOTTOM_END / TOTAL_ATTEMPTS; // 72

  const attemptIndex = Math.min(TOTAL_ATTEMPTS - 1, Math.floor(frame / FRAMES_PER_ATTEMPT));
  const frameInAttempt = frame % FRAMES_PER_ATTEMPT;
  const throwProgress = interpolate(frameInAttempt, [0, FRAMES_PER_ATTEMPT * 0.7], [0, 1], {
    extrapolateRight: 'clamp', extrapolateLeft: 'clamp',
  });

  const calcBottomBall = (i: number, progress: number) => {
    const isSuccess = i === 4;
    const targetX = isSuccess ? HOOP.x : HOOP.x + (MISS_OFFSETS_X[i] ?? 100);
    const x = interpolate(progress, [0, 1], [THROW_START.x, targetX]);
    const arcY = -Math.sin(progress * Math.PI) * ARC_HEIGHT;
    const landY = isSuccess ? 0 : SECTION_H * 0.08;
    return { x, y: THROW_START.bottomY + interpolate(progress, [0, 1], [0, landY]) + arcY };
  };

  const shakeX = frame < BOTTOM_END ? Math.sin(frame * 0.14) * 10 : 0;
  const lineSwing = Math.sin(frame * 0.05) * 55;
  const dashOffset = frame * 2.5;

  const topFrame = Math.max(0, frame - BOTTOM_END);
  const topThrowProgress = interpolate(topFrame, [0, 80 * 0.72], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const isAirball = frame >= BOTTOM_END;
  const topBallX = isAirball
    ? interpolate(topThrowProgress, [0, 1], [THROW_START.x, CANVAS.WIDTH + 60])
    : THROW_START.x + shakeX;
  const topBallY = isAirball
    ? THROW_START.topY + interpolate(topThrowProgress, [0, 1], [0, SECTION_H * 0.1]) + (-Math.sin(topThrowProgress * Math.PI) * ARC_HEIGHT)
    : THROW_START.topY;

  const hoopBottomColor = attemptIndex === 4 && frame < BOTTOM_END
    ? BRAND.colors.success
    : attemptIndex < 4 ? BRAND.colors.danger : BRAND.colors.success;

  const successGlow = attemptIndex === 4 && frame < BOTTOM_END
    ? interpolate(frameInAttempt, [0, FRAMES_PER_ATTEMPT * 0.7], [0, 0.12], { extrapolateRight: 'clamp' })
    : 0;

  const bottomSubtitle = attemptIndex < 4
    ? `快速迭代中：第 ${attemptIndex + 1} 次嘗試`
    : frame < BOTTOM_END ? '第 5 次：成功入網！' : '5 次迭代，找到節奏';

  return (
    <BaseTemplate showSafeZone={false}>
      {successGlow > 0 && (
        <BackgroundGlow color={BRAND.colors.success} opacity={successGlow} blur={200}
          style={{ top: SECTION_H, height: SECTION_H }} />
      )}
      {isAirball && (
        <BackgroundGlow color={BRAND.colors.danger}
          opacity={interpolate(topFrame, [0, 20], [0, 0.10], { extrapolateRight: 'clamp' })}
          blur={200} style={{ top: 0, height: SECTION_H }} />
      )}

      {/* 上半 */}
      <SectionTitle title="OVER-PLANNING"
        subtitle={isAirball ? '等太久，出手時機已過⋯' : '一直在算計完美時機...'}
        titleColor={BRAND.colors.danger} absoluteY={SAFE_ZONE.TOP + 30} />
      <Hoop absoluteY={HOOP.topY} color={isAirball ? BRAND.colors.danger : BRAND.colors.whiteLow} />
      {!isAirball && (
        <svg style={{ position: 'absolute', width: CANVAS.WIDTH, height: SECTION_H, overflow: 'visible', zIndex: 1 }}
          viewBox={`0 0 ${CANVAS.WIDTH} ${SECTION_H}`}>
          <path d={`M ${THROW_START.x},${THROW_START.topY} Q ${CANVAS.WIDTH * 0.55},${SECTION_H * 0.2 + lineSwing} ${HOOP.x},${HOOP.topY}`}
            fill="none" stroke={BRAND.colors.whiteLow} strokeWidth={5}
            strokeDasharray="22 16" strokeDashoffset={-dashOffset} />
        </svg>
      )}
      <div style={{ position: 'absolute', left: topBallX - BALL_SIZE / 2, top: topBallY - BALL_SIZE / 2, zIndex: 5 }}>
        <Ball size={BALL_SIZE} color={BRAND.colors.basketball} glowColor={BRAND.colors.basketballGlow}
          glowSize={isAirball ? 50 : 22} border="3px solid rgba(255,255,255,0.2)" />
      </div>

      {/* 分隔 */}
      <div style={{ position: 'absolute', top: SECTION_H - 3, left: 0, width: CANVAS.WIDTH, height: 6, backgroundColor: '#222', zIndex: 20 }} />
      <div style={{
        position: 'absolute', top: SECTION_H, left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: BRAND.colors.white, color: BRAND.colors.bg,
        padding: '14px 40px', borderRadius: BRAND.radius.pill,
        fontFamily: BRAND.fonts.display, fontWeight: BRAND.fontWeight.black,
        fontSize: BRAND.fontSize.body, letterSpacing: '0.1em',
        boxShadow: '0 0 32px rgba(255,255,255,0.55)', zIndex: 30,
      }}>VS</div>

      {/* 下半 */}
      <SectionTitle title="TAKING ACTION" subtitle={bottomSubtitle}
        titleColor={BRAND.colors.success} absoluteY={SECTION_H + 60} />
      <Hoop absoluteY={HOOP.bottomY} color={hoopBottomColor} />
      <Divider width="90%" color={BRAND.colors.divider}
        style={{ top: SECTION_H + SECTION_H * 0.85, left: '5%' }} />

      {[0, 1, 2, 3].map((i) => {
        if (frame < (i + 1) * FRAMES_PER_ATTEMPT) return null;
        if (i === attemptIndex && frame < BOTTOM_END) return null;
        const pos = calcBottomBall(i, 1);
        return (
          <div key={`fail-${i}`} style={{ position: 'absolute', left: pos.x - BALL_SIZE / 2, top: pos.y - BALL_SIZE / 2, zIndex: 2 }}>
            <Ball size={BALL_SIZE} color={BRAND.colors.basketball}
              glowColor={BRAND.colors.basketballGlow} glowSize={10} opacity={0.55} />
          </div>
        );
      })}

      {frame < BOTTOM_END && (() => {
        const pos = calcBottomBall(attemptIndex, throwProgress);
        const ok = attemptIndex === 4;
        return (
          <div style={{ position: 'absolute', left: pos.x - BALL_SIZE / 2, top: pos.y - BALL_SIZE / 2, zIndex: 6 }}>
            <Ball size={BALL_SIZE} color={BRAND.colors.basketball}
              glowColor={ok ? BRAND.colors.successGlow : BRAND.colors.basketballGlow}
              glowSize={ok ? 55 : 35} glowSizeOuter={ok ? 90 : undefined}
              border={`3px solid rgba(255,255,255,${ok ? 0.6 : 0.25})`} />
          </div>
        );
      })()}
    </BaseTemplate>
  );
};
EOF

# ─── 10. Root.tsx ─────────────────────────────────────────────────────────────
cat > src/Root.tsx << 'EOF'
import { Composition } from 'remotion';
import { SeamlessLifeLoop } from './SeamlessLifeLoop';
import { BasketChallenge } from './BasketChallenge';
import React from 'react';

const IG_CONFIG = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LifeLoop" component={SeamlessLifeLoop} durationInFrames={450} {...IG_CONFIG} />
    <Composition id="BasketChallenge" component={BasketChallenge} durationInFrames={450} {...IG_CONFIG} />
  </>
);
EOF

echo ""
echo "✅ 全部完成！檔案結構："
echo "   src/constants/brand.ts"
echo "   src/constants/safeZone.ts"
echo "   src/constants/index.ts"
echo "   src/components/Ball.tsx"
echo "   src/components/TextBox.tsx"
echo "   src/components/ui.tsx  (Divider, BackgroundGlow, BrandTag)"
echo "   src/components/index.ts"
echo "   src/templates/BaseTemplate.tsx"
echo "   src/BasketChallenge.tsx  ← v2 重構版"
echo "   src/Root.tsx"
echo ""
echo "🚀 啟動預覽：npx remotion studio"
