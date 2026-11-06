import React from 'react';

export type ProductStatusType = 'Live' | 'Under Development' | 'PUBLISHED' | 'DRAFT' | string;

interface ProductStatusBadgeProps {
  status?: ProductStatusType;
  colorScheme?: 'green' | 'blue' | 'amber' | 'violet';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  style?: React.CSSProperties;
}

/**
 * ProductStatusBadge
 * Renders consistent, accessible color-coded badges for product statuses:
 * - Green (Live): #DCFCE7 bg, #15803D text, #86EFAC border
 * - Blue (Ready For Deployment): #EFF6FF bg, #1D4ED8 text, #BFDBFE border
 * - Violet (Staging): #F3E8FF bg, #7E22CE text, #D8B4FE border
 * - Amber (Under Development): #FFFBEB bg, #B45309 text, #FDE68A border
 */
export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  status = 'Under Development',
  colorScheme,
  className = '',
  size = 'md',
  showDot = true,
  style = {},
}) => {
  const normalized = (status || '').trim().toLowerCase();
  const isLive = normalized === 'live' || normalized === 'published';
  const isReady = normalized === 'ready for deployment' || normalized === 'ready';
  const isStaging = normalized === 'staging';

  // Determine effective color scheme
  let scheme: 'green' | 'blue' | 'amber' | 'violet' = 'amber';
  if (colorScheme) {
    scheme = colorScheme;
  } else if (isLive) {
    scheme = 'green';
  } else if (isStaging) {
    scheme = 'violet';
  } else if (isReady) {
    scheme = 'blue';
  } else {
    scheme = 'amber';
  }

  let label = status || 'Under Development';
  let bg = '#FFFBEB';
  let text = '#B45309';
  let border = '#FDE68A';
  let dotColor = '#D97706';
  let pulse = true;

  if (scheme === 'green') {
    label = isLive ? 'Live' : status;
    bg = '#DCFCE7';
    text = '#15803D';
    border = '#86EFAC';
    dotColor = '#16A34A';
    pulse = false;
  } else if (scheme === 'blue') {
    label = isReady ? 'Ready For Deployment' : status;
    bg = '#EFF6FF';
    text = '#1D4ED8';
    border = '#BFDBFE';
    dotColor = '#2563EB';
    pulse = true;
  } else if (scheme === 'violet') {
    label = isStaging ? 'Staging' : status;
    bg = '#F3E8FF';
    text = '#7E22CE';
    border = '#D8B4FE';
    dotColor = '#9333EA';
    pulse = true;
  } else {
    // amber
    bg = '#FFFBEB';
    text = '#B45309';
    border = '#FDE68A';
    dotColor = '#D97706';
    pulse = true;
  }

  // Size styling
  const sizeStyles = {
    sm: {
      padding: '0.2rem 0.5rem',
      fontSize: '0.6875rem',
      gap: '0.3rem',
      dotSize: '5px',
    },
    md: {
      padding: '0.3rem 0.65rem',
      fontSize: '0.75rem',
      gap: '0.375rem',
      dotSize: '6px',
    },
    lg: {
      padding: '0.4rem 0.85rem',
      fontSize: '0.8125rem',
      gap: '0.45rem',
      dotSize: '7px',
    },
  }[size];

  return (
    <span
      role="status"
      aria-label={`Product status: ${label}`}
      className={`inline-flex items-center font-semibold rounded-full select-none ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: sizeStyles.padding,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: '9999px',
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        transition: 'all 180ms ease-in-out',
        ...style,
      }}
    >
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
            animation: pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
};

export default ProductStatusBadge;
