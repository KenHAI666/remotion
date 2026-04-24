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
