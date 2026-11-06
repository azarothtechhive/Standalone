import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'primary' | 'secondary' | 'violet' | 'outline' | 'outline-dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  children,
  icon,
  iconPosition = 'right',
  className = '',
  ...props
}) => {
  const variantClass = variant === 'secondary' ? 'btn-secondary' : variant === 'violet' ? 'btn-violet' : `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const combinedClasses = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  const { type, ...restProps } = props;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon" aria-hidden="true">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link
        {...(restProps as unknown as Omit<React.ComponentPropsWithoutRef<typeof Link>, 'to'>)}
        to={to}
        className={combinedClasses}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    const isExternal = /^https?:\/\//i.test(href);
    return (
      <a
        {...(restProps as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        className={combinedClasses}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} type={type ?? 'button'} {...restProps}>
      {content}
    </button>
  );
};
