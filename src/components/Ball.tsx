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
