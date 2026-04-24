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
