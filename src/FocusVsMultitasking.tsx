import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Easing } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, SAFE_CONTENT } from './constants';

const SAFE_LEFT = (SAFE_CONTENT as any).LEFT || 60;
const SAFE_WIDTH = (SAFE_CONTENT as any).width || 900;

const TIMELINE = {
  HOOK_START: 0,
  HOOK_END: 20,           // 縮短 hook 時間
  COMPARISON_START: 20,   // 提早開始對比
  COMPARISON_END: 240,
  CONCLUSION_START: 220,
  CONCLUSION_END: 270,
} as const;

/**
 * ========================================
 * 佈局常數（移除頂部標題，擴大對比區）
 * ========================================
 */
const LAYOUT = {
  // 上半區（多工）- 從安全區頂部開始
  TOP_SECTION_TOP: 240,          // 從 220 安全區開始，留 20px 邊距
  TOP_SECTION_BOTTOM: 950,       // 擴大到接近中間
  TOP_LABEL_TOP: 280,            // 標籤位置
  TOP_CHART_Y: 880,              // 柱體底部
  TOP_CENTER_X: SAFE_LEFT + SAFE_WIDTH / 2,

  // 下半區（專注）
  BOTTOM_SECTION_TOP: 970,       // 緊接著上區
  BOTTOM_SECTION_BOTTOM: 1480,   // 到安全區底部附近
  BOTTOM_LABEL_TOP: 1010,        // 標籤位置
  BOTTOM_CHART_Y: 1410,          // 柱體底部
  BOTTOM_CENTER_X: SAFE_LEFT + SAFE_WIDTH / 2,

  // 結論區（縮小，在最底部）
  CONCLUSION_TOP: 1500,
} as const;

/**
 * ========================================
 * 柱體組件（保持不變）
 * ========================================
 */
const PillBar: React.FC<{
  x: number;
  y: number;
  fillPercent: number;
  color?: string;
  width?: number;
  height?: number;
}> = ({ x, y, fillPercent, color = '#444', width = 55, height = 320 }) => {
  const currentFill = (fillPercent / 100) * height;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height,
        width,
        height,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: `${width / 2}px`,
        border: '1px solid rgba(255,255,255,0.12)',
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
          borderRadius: `${width / 2}px ${width / 2}px 0 0`,
          boxShadow:
            fillPercent > 25
              ? `0 0 ${Math.max(15, fillPercent / 4)}px ${color}80`
              : 'none',
          transition: 'height 0.15s ease-out, box-shadow 0.15s ease-out',
        }}
      />
    </div>
  );
};

/**
 * ========================================
 * 雙語標籤組件（中文 + 英文）
 * ========================================
 */
const BilingualLabel: React.FC<{
  english: string;
  chinese: string;
  isTop: boolean;
  opacity: number;
}> = ({ english, chinese, isTop, opacity }) => {
  const color = isTop ? '#888' : '#888';
  const top = isTop ? LAYOUT.TOP_LABEL_TOP : LAYOUT.BOTTOM_LABEL_TOP;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: SAFE_LEFT,
        width: SAFE_WIDTH,
        textAlign: 'center',
        opacity,
      }}
    >
      {/* 英文標題 */}
      <div
        style={{
          fontFamily: BRAND.fonts.primary,
          fontSize: 52,
          fontWeight: BRAND.fontWeight.black,
          color,
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {english}
      </div>
      {/* 中文副標題 */}
      <div
        style={{
          fontFamily: BRAND.fonts.primary,
          fontSize: 28,
          fontWeight: BRAND.fontWeight.bold,
          color: 'rgba(136, 136, 136, 0.7)',
          letterSpacing: 2,
        }}
      >
        {chinese}
      </div>
    </div>
  );
};

/**
 * ========================================
 * 主影片元件
 * ========================================
 */
export const FocusVsMultitasking: React.FC = () => {
  const frame = useCurrentFrame();

  // ============ 多任務邏輯 ============
  const mt_ballX = () => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    const cycle = Math.max(0, Math.min(1, (elapsed % 35) / 35));
    const positions = [
      LAYOUT.TOP_CENTER_X - 140,
      LAYOUT.TOP_CENTER_X - 50,
      LAYOUT.TOP_CENTER_X + 50,
      LAYOUT.TOP_CENTER_X + 140,
    ];
    if (positions.some((p) => !Number.isFinite(p))) {
      return LAYOUT.TOP_CENTER_X;
    }
    return interpolate(
      cycle,
      [0, 0.25, 0.5, 0.75, 1],
      [positions[0], positions[1], positions[2], positions[3], positions[0]]
    );
  };

  const mt_barFill = (idx: number) => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    const maxElapsed = TIMELINE.COMPARISON_END - TIMELINE.COMPARISON_START;
    const progress = Math.min(elapsed / maxElapsed, 1);
    const targets = [12, 16, 8, 15];
    const randomJitter = Math.sin(progress * Math.PI * (idx + 1)) * 2;
    return Math.max(0, interpolate(progress, [0, 1], [0, targets[idx]], { extrapolateRight: 'clamp' }) + randomJitter);
  };

  // ============ 專注邏輯 ============
  const focus_ballX = () => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    return interpolate(
      elapsed,
      [0, 150, 210],
      [LAYOUT.BOTTOM_CENTER_X - 140, LAYOUT.BOTTOM_CENTER_X - 140, LAYOUT.BOTTOM_CENTER_X - 50],
      { extrapolateRight: 'clamp' }
    );
  };

  const focus_barFill = (idx: number) => {
    const elapsed = Math.max(0, frame - TIMELINE.COMPARISON_START);
    const maxElapsed = TIMELINE.COMPARISON_END - TIMELINE.COMPARISON_START;
    const progress = Math.min(elapsed / maxElapsed, 1);

    if (idx === 0) {
      return interpolate(progress, [0, 1], [0, 92], {
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      });
    }
    return 0;
  };

  const conclusionOpacity = interpolate(
    frame,
    [TIMELINE.CONCLUSION_START, TIMELINE.CONCLUSION_END],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // ============ 渲染 ============
  return (
    <BaseTemplate showSafeZone={false}>
      <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
        
        {/* ═══════════════════════════════════════════════════════════
            上半區：多工 (Multitasking)
            ═══════════════════════════════════════════════════════════ */}

        {/* 上半區背景 */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.TOP_SECTION_TOP,
            left: SAFE_LEFT,
            width: SAFE_WIDTH,
            height: LAYOUT.TOP_SECTION_BOTTOM - LAYOUT.TOP_SECTION_TOP,
            background: `linear-gradient(135deg, ${BRAND.colors.danger}08, ${BRAND.colors.danger}02)`,
            borderRadius: 24,
            opacity: interpolate(frame, [TIMELINE.HOOK_START, TIMELINE.HOOK_END], [0, 0.4]),
          }}
        />

        {/* 多工標籤（雙語） */}
        <BilingualLabel
          english="Multitasking"
          chinese="多工"
          isTop={true}
          opacity={interpolate(frame, [TIMELINE.HOOK_START, TIMELINE.HOOK_END], [0, 1])}
        />

        {/* 多工柱體 */}
        {[0, 1, 2, 3].map((i) => (
          <PillBar
            key={`mt-bar-${i}`}
            x={LAYOUT.TOP_CENTER_X - 140 + i * 95}
            y={LAYOUT.TOP_CHART_Y}
            fillPercent={frame >= TIMELINE.COMPARISON_START ? mt_barFill(i) : 0}
            color={BRAND.colors.danger}
            width={55}
            height={320}
          />
        ))}

        {/* 多工跳動的球 */}
        {frame >= TIMELINE.COMPARISON_START && frame < TIMELINE.COMPARISON_END && (
          <div
            style={{
              position: 'absolute',
              left: mt_ballX() - 28,
              top: LAYOUT.TOP_SECTION_TOP + 160,
            }}
          >
            <Ball 
              size={56} 
              color={BRAND.colors.danger} 
              glowColor={BRAND.colors.dangerGlow} 
              glowSize={28} 
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            下半區：專注 (Focus)
            ═══════════════════════════════════════════════════════════ */}

        {/* 下半區背景 */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.BOTTOM_SECTION_TOP,
            left: SAFE_LEFT,
            width: SAFE_WIDTH,
            height: LAYOUT.BOTTOM_SECTION_BOTTOM - LAYOUT.BOTTOM_SECTION_TOP,
            background: `linear-gradient(135deg, ${BRAND.colors.gold}08, ${BRAND.colors.gold}02)`,
            borderRadius: 24,
            opacity: interpolate(frame, [TIMELINE.HOOK_START, TIMELINE.HOOK_END], [0, 0.4]),
          }}
        />

        {/* 專注標籤（雙語） */}
        <BilingualLabel
          english="Focus"
          chinese="專注"
          isTop={false}
          opacity={interpolate(frame, [TIMELINE.HOOK_START, TIMELINE.HOOK_END], [0, 1])}
        />

        {/* 專注柱體 */}
        {[0, 1, 2, 3].map((i) => (
          <PillBar
            key={`focus-bar-${i}`}
            x={LAYOUT.BOTTOM_CENTER_X - 140 + i * 95}
            y={LAYOUT.BOTTOM_CHART_Y}
            fillPercent={frame >= TIMELINE.COMPARISON_START ? focus_barFill(i) : 0}
            color={i === 0 ? BRAND.colors.gold : '#1a1a1a'}
            width={55}
            height={320}
          />
        ))}

        {/* 專注穩定的球 */}
        {frame >= TIMELINE.COMPARISON_START && (
          <div
            style={{
              position: 'absolute',
              left: focus_ballX() - 33,
              top: LAYOUT.BOTTOM_SECTION_TOP + 160,
            }}
          >
            <Ball 
              size={66} 
              color={BRAND.colors.gold} 
              glowColor={BRAND.colors.goldGlow} 
              glowSize={38} 
              glowSizeOuter={76}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            結論區（緊湊版）
            ═══════════════════════════════════════════════════════════ */}
        {conclusionOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: LAYOUT.CONCLUSION_TOP,
              left: SAFE_LEFT + 40,
              width: SAFE_WIDTH - 80,
              textAlign: 'center',
              opacity: conclusionOpacity,
              transform: `translateY(${interpolate(frame, [TIMELINE.CONCLUSION_START, TIMELINE.CONCLUSION_END], [15, 0])}px)`,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${BRAND.colors.gold}12, ${BRAND.colors.gold}04)`,
                border: `2px solid ${BRAND.colors.gold}44`,
                borderRadius: 20,
                padding: '24px 36px',
                boxShadow: `0 0 50px ${BRAND.colors.gold}15`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  color: BRAND.colors.gold,
                  fontSize: 42,
                  fontWeight: BRAND.fontWeight.black,
                  marginBottom: 8,
                  fontFamily: BRAND.fonts.primary,
                  letterSpacing: 1,
                  textShadow: `0 0 30px ${BRAND.colors.goldGlow}40`,
                }}
              >
                Focus is Power
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 16,
                  fontFamily: BRAND.fonts.primary,
                  fontWeight: 600,
                  letterSpacing: 2,
                }}
              >
                Choose depth over breadth
              </div>
            </div>
          </div>
        )}

      </AbsoluteFill>
    </BaseTemplate>
  );
};

// Backward-compatible export
export const CompoundBarChart = FocusVsMultitasking;