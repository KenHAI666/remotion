import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BaseTemplate } from './templates/BaseTemplate';
import { BRAND, CANVAS, SAFE_CONTENT } from './constants';

const TL = {
  TITLE_IN: 0,
  CALENDAR_START: 24,
  CALENDAR_END: 222,
  FOOTER_IN: 258,
} as const;

const DAYS = 30;
const COLS = 7;
const CELL_WIDTH = 108;
const CELL_HEIGHT = 126;
const CELL_GAP = 18;
const GRID_WIDTH = COLS * CELL_WIDTH + (COLS - 1) * CELL_GAP;
const GRID_ROWS = 5;
const GRID_HEIGHT = GRID_ROWS * CELL_HEIGHT + (GRID_ROWS - 1) * CELL_GAP;
const TITLE_TOP = 320;
const GRID_LEFT = SAFE_CONTENT.x + (SAFE_CONTENT.width - GRID_WIDTH) / 2;
const GRID_TOP = 610;
const FOOTER_TOP = GRID_TOP + GRID_HEIGHT + 44;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

const MINUTES = [
  10, 12, 8, 14, 9, 15, 11,
  7, 16, 10, 12, 8, 14, 9,
  18, 11, 10, 13, 7, 15, 12,
  8, 16, 9, 10, 14, 8, 12,
  11, 17,
] as const;

const CellShell: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 22,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const NoZeroDays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntrance = spring({
    fps,
    frame: frame - TL.TITLE_IN,
    config: { damping: 18, stiffness: 110 },
  });

  const footerEntrance = spring({
    fps,
    frame: frame - TL.FOOTER_IN,
    config: { damping: 16, stiffness: 110 },
  });

  const dayFloat = interpolate(frame, [TL.CALENDAR_START, TL.CALENDAR_END], [0, DAYS], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const completedDays = Math.min(DAYS, Math.floor(dayFloat));
  const totalMinutes = MINUTES.slice(0, completedDays).reduce((sum, value) => sum + value, 0);

  const ambientX = CANVAS.WIDTH / 2 + Math.sin(frame * 0.03) * 90;
  const ambientY = 360 + Math.cos(frame * 0.025) * 45;
  const pulseScale = 1 + Math.sin(frame * 0.2) * 0.025;

  return (
    <BaseTemplate showSafeZone={false} brandTag={false}>
      <AbsoluteFill style={{ backgroundColor: BRAND.colors.bg }}>
        <div
          style={{
            position: 'absolute',
            left: ambientX - 250,
            top: ambientY - 250,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: `radial-gradient(circle, ${BRAND.colors.gold}20 0%, transparent 72%)`,
            filter: 'blur(26px)',
            opacity: 0.9,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 74%, rgba(255,255,255,0.03) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: TITLE_TOP,
            left: SAFE_CONTENT.x,
            width: SAFE_CONTENT.width,
            textAlign: 'center',
            opacity: interpolate(titleEntrance, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [34, 0])}px)`,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 22px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: BRAND.colors.gold,
                boxShadow: `0 0 20px ${BRAND.colors.goldGlow}`,
                transform: `scale(${pulseScale})`,
              }}
            />
            <div
              style={{
                color: BRAND.colors.whiteMid,
                fontFamily: BRAND.fonts.display,
                fontSize: 24,
                fontWeight: BRAND.fontWeight.bold,
                letterSpacing: '0.14em',
              }}
            >
              NO ZERO DAYS
            </div>
          </div>

          <div
            style={{
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.display,
              fontSize: 78,
              fontWeight: BRAND.fontWeight.black,
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Show Up
            <span style={{ color: BRAND.colors.gold, marginLeft: 18 }}>Anyway</span>
          </div>

          <div
            style={{
              color: BRAND.colors.whiteMid,
              fontFamily: BRAND.fonts.primary,
              fontSize: 30,
              fontWeight: BRAND.fontWeight.bold,
              lineHeight: 1.35,
            }}
          >
            今天有一點點，就不算歸零
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: GRID_TOP - 54,
            left: GRID_LEFT,
            width: GRID_WIDTH,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL_WIDTH}px)`,
            gap: CELL_GAP,
          }}
        >
          {DAY_LABELS.map((label, index) => (
            <div
              key={`${label}-${index}`}
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.42)',
                fontFamily: BRAND.fonts.display,
                fontSize: 21,
                fontWeight: BRAND.fontWeight.bold,
                letterSpacing: '0.14em',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: GRID_TOP,
            left: GRID_LEFT,
            width: GRID_WIDTH,
            height: GRID_HEIGHT,
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL_WIDTH}px)`,
            gap: CELL_GAP,
          }}
        >
          {Array.from({ length: 35 }, (_, index) => {
            const day = index + 1;
            const isRealDay = day <= DAYS;
            const fillProgress = isRealDay
              ? interpolate(dayFloat, [day - 1, day - 0.15], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 0;
            const minutes = isRealDay ? MINUTES[day - 1] : 0;
            const pillWidth = 18 + minutes * 3.9;

            return (
              <CellShell
                key={index}
                style={{
                  position: 'relative',
                  width: CELL_WIDTH,
                  height: CELL_HEIGHT,
                  opacity: isRealDay ? 1 : 0.18,
                }}
              >
                {isRealDay && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 16,
                        color: fillProgress > 0.45 ? BRAND.colors.white : BRAND.colors.whiteMid,
                        fontFamily: BRAND.fonts.display,
                        fontSize: 28,
                        fontWeight: BRAND.fontWeight.bold,
                      }}
                    >
                      {day}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: 18,
                        right: 14,
                        color: fillProgress > 0.8 ? BRAND.colors.gold : 'rgba(255,255,255,0.24)',
                        fontFamily: BRAND.fonts.display,
                        fontSize: 16,
                        fontWeight: BRAND.fontWeight.bold,
                        letterSpacing: '0.06em',
                        opacity: fillProgress,
                      }}
                    >
                      {minutes}m
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        right: 14,
                        bottom: 16,
                        height: 18,
                        borderRadius: 999,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: pillWidth * fillProgress,
                          height: '100%',
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${BRAND.colors.gold}aa, ${BRAND.colors.gold})`,
                          boxShadow: `0 0 18px ${BRAND.colors.goldGlow}`,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        bottom: 46,
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: BRAND.colors.gold,
                        boxShadow: `0 0 18px ${BRAND.colors.goldGlow}`,
                        opacity: fillProgress,
                      }}
                    />
                  </>
                )}
              </CellShell>
            );
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            top: FOOTER_TOP,
            left: SAFE_CONTENT.x,
            width: SAFE_CONTENT.width,
            textAlign: 'center',
            opacity: interpolate(footerEntrance, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(footerEntrance, [0, 1], [24, 0])}px)`,
          }}
        >
          <div
            style={{
              color: BRAND.colors.gold,
              fontFamily: BRAND.fonts.display,
              fontSize: 22,
              fontWeight: BRAND.fontWeight.bold,
              letterSpacing: '0.14em',
              marginBottom: 14,
            }}
          >
            {completedDays} DAYS  •  {totalMinutes} MIN
          </div>

          <div
            style={{
              color: BRAND.colors.white,
              fontFamily: BRAND.fonts.display,
              fontSize: 44,
              fontWeight: BRAND.fontWeight.black,
              lineHeight: 1.05,
              marginBottom: 10,
            }}
          >
            Done is better than perfect
          </div>

          <div
            style={{
              color: BRAND.colors.whiteMid,
              fontFamily: BRAND.fonts.primary,
              fontSize: 26,
              fontWeight: BRAND.fontWeight.bold,
              lineHeight: 1.35,
            }}
          >
            每天做一點，比等完美開始更重要
          </div>
        </div>
      </AbsoluteFill>
    </BaseTemplate>
  );
};
