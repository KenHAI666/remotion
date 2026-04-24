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
