import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'solid';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  padding = 'md',
  children,
  className = '',
  style,
  ...props
}) => {
  const variantClass = variant === 'glass-dark' ? 'glass-card-dark' : 'glass-card';
  
  const paddingStyles: Record<string, string> = {
    none: '0',
    sm: '1rem',
    md: '1.75rem',
    lg: '2.5rem',
  };

  const combinedStyles: React.CSSProperties = {
    padding: paddingStyles[padding],
    ...style,
  };

  return (
    <div className={`${variantClass} ${className}`} style={combinedStyles} {...props}>
      {children}
    </div>
  );
};
