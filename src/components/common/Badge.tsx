import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'gold' | 'dark' | 'violet' | 'orange' | 'magenta' | 'blue';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  children,
  icon,
  className = '',
  style,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};
