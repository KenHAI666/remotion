import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Easing } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS } from './constants';

const TIMELINE = {
  HOOK_START: 0,
  HOOK_END: 30,
  COMPARISON_START: 30,
  COMPARISON_END: 240,
  CONCLUSION_START: 220,
  CONCLUSION_END: 270,
} as const;

const LAYOUT = {
  TITLE_Y: 260,
  // 上半部：分散 (Multitasking)
  TOP_SECTION_Y: 780,
  // 下半部：專注 (Focus)
  BOTTOM_SECTION_Y: 1380,
  CENTER_X: CANVAS.WIDTH / 2,
  BAR_WIDTH: 55,
  BAR_GAP: 75,
};

const PillBar: React.FC<{
  x: number;
  y: number;
  fillPercent: number;
  color?: string;
  height?: number;
}> = ({ x, y, fillPercent, color = '#444', height = 280 }) => {
  const currentFill = (fillPercent / 100) * height;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - LAYOUT.BAR_WIDTH / 2,
        top: y - height,
        width: LAYOUT.BAR_WIDTH,
        height,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: currentFill,
          backgroundColor: color,
          borderRadius: '30px 30px 0 0',
          boxShadow: fillPercent > 20 ? `0 0 30px ${color}66` : 'none',
          transition: 'height 0.15s ease-out',
        }}
      />
    </div>
  );
};

export const FocusVsMultitasking: React.FC = () => {
  const frame = useCurrentFrame();

  // --- 多任務 (Top) 邏輯 ---
  const mtBallX = () => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    const cycle = (elapsed % 30) / 30; // 每秒切換一次
    return interpolate(
      cycle,
      [0, 0.25, 0.5, 0.75, 1],
      [
        LAYOUT.CENTER_X - 112,
        LAYOUT.CENTER_X - 37,
        LAYOUT.CENTER_X + 37,
        LAYOUT.CENTER_X + 112,
        LAYOUT.CENTER_X - 112,
      ]
    );
  };

  const mtBarFill = (idx: number) => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    const targets = [12, 18, 10, 15];
    return interpolate(elapsed, [0, 210], [0, targets[idx]], {
      extrapolateRight: 'clamp',
    });
  };

  // --- 專注 (Bottom) 邏輯 ---
  const focusBarFill = (idx: number) => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    if (idx === 0) {
      return interpolate(elapsed, [0, 180], [0, 95], {
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.33, 1, 0.68, 1), // 快速成長後緩停
      });
    }
    return 0;
  };

  return (
    <BaseTemplate showSafeZone={false}>
      <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
        {/* 1. 頂部 HOOK */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.TITLE_Y,
            width: '100%',
            textAlign: 'center',
            opacity: interpolate(frame, [0, 20], [0, 1]),
            fontFamily: BRAND.fonts.primary,
            fontSize: 56,
            fontWeight: BRAND.fontWeight.black,
            color: BRAND.colors.white,
          }}
        >
          專注 vs 分散
        </div>

        {/* 2. 上部分：多任務 */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.TOP_SECTION_Y - 380,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: BRAND.colors.danger,
              fontSize: 32,
              fontWeight: BRAND.fontWeight.black,
              letterSpacing: 2,
            }}
          >
            多任務：分散精力
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
            }}
          >
            MULTITASKING
          </div>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <PillBar
            key={`mt-${i}`}
            x={LAYOUT.CENTER_X - 112 + i * LAYOUT.BAR_GAP}
            y={LAYOUT.TOP_SECTION_Y}
            fillPercent={mtBarFill(i)}
            color={BRAND.colors.danger}
          />
        ))}
        {frame >= TIMELINE.COMPARISON_START && (
          <div
            style={{
              position: 'absolute',
              left: mtBallX() - 25,
              top: LAYOUT.TOP_SECTION_Y - 350,
            }}
          >
            <Ball
              size={50}
              color={BRAND.colors.danger}
              glowColor={BRAND.colors.dangerGlow}
            />
          </div>
        )}

        {/* 3. 分隔線 (微光漸層) */}
        <div
          style={{
            position: 'absolute',
            top: (LAYOUT.TOP_SECTION_Y + LAYOUT.BOTTOM_SECTION_Y) / 2 - 250,
            left: 150,
            right: 150,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />

        {/* 4. 下部分：深度專注 */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.BOTTOM_SECTION_Y - 380,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: BRAND.colors.gold,
              fontSize: 32,
              fontWeight: BRAND.fontWeight.black,
              letterSpacing: 2,
            }}
          >
            深度專注：全力突破
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
            }}
          >
            DEEP FOCUS
          </div>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <PillBar
            key={`f-${i}`}
            x={LAYOUT.CENTER_X - 112 + i * LAYOUT.BAR_GAP}
            y={LAYOUT.BOTTOM_SECTION_Y}
            fillPercent={focusBarFill(i)}
            color={i === 0 ? BRAND.colors.gold : '#222'}
          />
        ))}
        {frame >= TIMELINE.COMPARISON_START && (
          <div
            style={{
              position: 'absolute',
              left: LAYOUT.CENTER_X - 112 - 35,
              top: LAYOUT.BOTTOM_SECTION_Y - 350,
            }}
          >
            <Ball
              size={70}
              color={BRAND.colors.gold}
              glowColor={BRAND.colors.goldGlow}
            />
          </div>
        )}

        {/* 5. 底部結論 */}
        <div
          style={{
            position: 'absolute',
            bottom: 180,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: interpolate(
              frame,
              [TIMELINE.CONCLUSION_START, TIMELINE.CONCLUSION_END],
              [0, 1]
            ),
            transform: `translateY(${interpolate(
              frame,
              [TIMELINE.CONCLUSION_START, TIMELINE.CONCLUSION_END],
              [20, 0]
            )}px)`,
          }}
        >
          <div
            style={{
              background: 'rgba(255,215,0,0.08)',
              border: '1px solid rgba(255,215,0,0.3)',
              padding: '25px 60px',
              borderRadius: '100px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                color: BRAND.colors.gold,
                fontSize: 36,
                fontWeight: BRAND.fontWeight.black,
                letterSpacing: 4,
              }}
            >
              專注，是創作者最強的槓桿
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </BaseTemplate>
  );
};

// Backward-compatible export
export const CompoundBarChart = FocusVsMultitasking;
