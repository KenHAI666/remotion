import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { Ball } from './components/Ball';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS, SAFE_CONTENT } from './constants';

/**
 * ========================================
 * 時間軸與佈局常數
 * ========================================
 */
const TIMELINE = {
  INTRO_START: 0,
  INTRO_END: 20,
  ANIMATE_START: 20,
  ANIMATE_END: 140,
  CONCLUSION_START: 125,
  CONCLUSION_END: 150,
} as const;

/**
 * 佈局常數 - 所有座標必須在安全區內
 * 安全區：top: 220, bottom: 1500, left: 60, right: 120
 * 可用寬度：1080 - 60 - 120 = 900px
 * 可用高度：1500 - 220 = 1280px
 */
const LAYOUT = {
  TITLE_TOP: 260,            // 標題在安全區頂部 (220 + 40)
  CHART_START_TOP: 420,      // 圖表區開始
  CHART_HEIGHT: 550,         // 柱狀圖高度（不超過可用高度的一半）
  CHART_BOTTOM: 970,         // 圖表基準線位置 (420 + 550)
  CHART_CENTER_X: 540,       // 水平中心
  CHART_WIDTH: 800,          // 圖表寬度（在 900px 安全寬度內）
  DIVIDER_TOP: 1000,         // 分隔線
  CONCLUSION_TOP: 1050,      // 結論文字框起點
  CONCLUSION_MAX_HEIGHT: 400, // 結論框最大高度，確保底部不超過 1500
} as const;

const BAR_COUNT = 12;
const MAX_BAR_HEIGHT = LAYOUT.CHART_HEIGHT; // 450

export const CompoundBarChart: React.FC = () => {
  const frame = useCurrentFrame();

  /**
   * ─────────────────────────────────────────
   * 主動畫進度
   * ─────────────────────────────────────────
   */
  const progress = interpolate(frame, [TIMELINE.ANIMATE_START, TIMELINE.ANIMATE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  /**
   * ─────────────────────────────────────────
   * 柱狀圖數據計算
   * ─────────────────────────────────────────
   */
  const bars = Array.from({ length: BAR_COUNT }).map((_, i) => {
    const day = (365 / (BAR_COUNT - 1)) * i;
    const value = Math.pow(1.01, day); // 每天進步 1%
    const targetHeight = (value / 37.78) * MAX_BAR_HEIGHT;

    // 柱子逐根長出的動畫
    const barVisibility = interpolate(
      progress * BAR_COUNT,
      [i, i + 1],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // 柱子中心 X 座標（水平居中在安全區內）
    const x =
      LAYOUT.CHART_CENTER_X -
      LAYOUT.CHART_WIDTH / 2 +
      (LAYOUT.CHART_WIDTH / (BAR_COUNT - 1)) * i;

    return {
      height: targetHeight * barVisibility,
      value: value.toFixed(1),
      x,
    };
  });

  /**
   * ─────────────────────────────────────────
   * 小球跳躍邏輯
   * ─────────────────────────────────────────
   */
  const ballIdx = progress * (BAR_COUNT - 1);
  const currentBarIdx = Math.floor(ballIdx);
  const nextBarIdx = Math.min(BAR_COUNT - 1, currentBarIdx + 1);
  const segmentProgress = ballIdx - currentBarIdx;

  // X 座標：跟隨柱子位置平滑移動
  const ballX = interpolate(
    progress,
    [0, 1],
    [
      LAYOUT.CHART_CENTER_X - LAYOUT.CHART_WIDTH / 2,
      LAYOUT.CHART_CENTER_X + LAYOUT.CHART_WIDTH / 2,
    ]
  );

  // Y 座標：柱子高度 + 跳躍拋物線
  const currentHeight = bars[currentBarIdx].height;
  const nextHeight = bars[nextBarIdx].height;
  const baseHeight = interpolate(
    segmentProgress,
    [0, 1],
    [currentHeight, nextHeight]
  );
  const jumpHeight = Math.sin(segmentProgress * Math.PI) * 80;
  const ballY =
    LAYOUT.CHART_BOTTOM - baseHeight - jumpHeight - 36; // 球半徑 36 (size 72)

  /**
   * ─────────────────────────────────────────
   * 結論框高度計算（防止超出底部安全區）
   * ─────────────────────────────────────────
   */
  const conclusionBoxHeight = 220; // "37.78倍" + "一年後..." 高度
  const conclusionBoxTop = LAYOUT.CONCLUSION_TOP;
  const conclusionBoxBottom = conclusionBoxTop + conclusionBoxHeight;

  // 檢查是否會超出安全區底部 (1500)
  const isConclusionSafe = conclusionBoxBottom <= SAFE_CONTENT.bottom;

  return (
    <BaseTemplate showSafeZone={false}>
      <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
        
        {/* ═══════════════════════════════════════════════════════════
            標題文字 (TOP: 260, 安全區內)
            ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.TITLE_TOP,
            left: SAFE_CONTENT.LEFT,
            width: SAFE_CONTENT.width,
            textAlign: 'center',
            opacity: interpolate(frame, [TIMELINE.INTRO_START, TIMELINE.INTRO_END], [0, 1]),
            fontFamily: BRAND.fonts.primary,
            color: BRAND.colors.white,
            fontSize: 52,
            fontWeight: BRAND.fontWeight.black,
            letterSpacing: 2,
            lineHeight: 1.3,
          }}
        >
          每天進步 <span style={{ color: BRAND.colors.gold }}>1%</span> 的累積
        </div>

        {/* ═══════════════════════════════════════════════════════════
            柱狀圖區域
            ═══════════════════════════════════════════════════════════ */}
        {bars.map((bar, i) => (
          <React.Fragment key={`bar-${i}`}>
            {/* 柱體 */}
            <div
              style={{
                position: 'absolute',
                left: bar.x - 22,
                top: LAYOUT.CHART_BOTTOM - bar.height,
                width: 44,
                height: bar.height,
                background:
                  i === BAR_COUNT - 1
                    ? `linear-gradient(to top, ${BRAND.colors.gold}66, ${BRAND.colors.gold})`
                    : `linear-gradient(to top, #2a2a2a, #4a4a4a)`,
                borderRadius: '8px 8px 0 0',
                boxShadow:
                  i === BAR_COUNT - 1
                    ? `0 0 40px ${BRAND.colors.gold}44`
                    : 'none',
                opacity: interpolate(bar.height, [0, 5], [0, 1]),
                transition: 'height 0.1s ease-out',
              }}
            />

            {/* 關鍵點數值標籤 (每隔一根或最後一根) */}
            {(i % 2 === 0 || i === BAR_COUNT - 1) && bar.height > 20 && (
              <div
                style={{
                  position: 'absolute',
                  left: bar.x - 35,
                  top: LAYOUT.CHART_BOTTOM - bar.height - 45,
                  width: 70,
                  textAlign: 'center',
                  color:
                    i === BAR_COUNT - 1
                      ? BRAND.colors.gold
                      : 'rgba(255,255,255,0.5)',
                  fontSize: 24,
                  fontWeight: 'bold',
                  fontFamily: BRAND.fonts.display,
                  opacity: interpolate(bar.height, [10, 40], [0, 1]),
                  pointerEvents: 'none',
                }}
              >
                {bar.value}x
              </div>
            )}
          </React.Fragment>
        ))}

        {/* ═══════════════════════════════════════════════════════════
            圖表基準線 (DIVIDER_TOP: 1000)
            ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            left: SAFE_CONTENT.LEFT,
            right: SAFE_CONTENT.RIGHT,
            top: LAYOUT.DIVIDER_TOP,
            height: 1,
            background: `linear-gradient(to right, 
              transparent, 
              ${BRAND.colors.divider}, 
              transparent)`,
            opacity: interpolate(frame, [TIMELINE.ANIMATE_START, TIMELINE.ANIMATE_START + 20], [0, 0.5]),
          }}
        />

        {/* ═══════════════════════════════════════════════════════════
            跳動的小球 (位置同步)
            ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            left: ballX,
            top: ballY,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <Ball
            size={72}
            color={BRAND.colors.gold}
            glowColor={BRAND.colors.goldGlow}
            glowSize={interpolate(progress, [0, 1], [30, 60])}
            glowSizeOuter={interpolate(progress, [0, 1], [60, 100])}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            結論文字框 (安全區內：top 1050-1270)
            ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'absolute',
            top: LAYOUT.CONCLUSION_TOP,
            left: SAFE_CONTENT.LEFT,
            width: SAFE_CONTENT.width,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02))`,
              padding: '40px 60px',
              borderRadius: 24,
              border: `2px solid ${BRAND.colors.gold}44`,
              textAlign: 'center',
              boxShadow: `
                0 0 60px ${BRAND.colors.gold}22,
                inset 0 1px 1px rgba(255,255,255,0.1)
              `,
              backdropFilter: 'blur(10px)',
              maxWidth: SAFE_CONTENT.width - 40,
            }}
          >
            {/* 主數字 */}
            <div
              style={{
                color: BRAND.colors.gold,
                fontSize: 96,
                fontWeight: BRAND.fontWeight.black,
                textShadow: `0 0 40px ${BRAND.colors.goldGlow}44`,
                letterSpacing: -2,
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              37.78倍
            </div>

            {/* 副標題 */}
            <div
              style={{
                color: BRAND.colors.white,
                fontSize: 28,
                letterSpacing: 4,
                opacity: 0.9,
                fontFamily: BRAND.fonts.primary,
                fontWeight: BRAND.fontWeight.bold,
              }}
            >
              一年後的驚人差距
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            安全區檢查：調試用（上線前刪除 showSafeZone={true}）
            ═══════════════════════════════════════════════════════════ */}
        {/* BaseTemplate 會自動在 showSafeZone={true} 時顯示安全區框線 */}
      </AbsoluteFill>
    </BaseTemplate>
  );
};