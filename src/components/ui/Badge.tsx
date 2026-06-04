import type { ReactNode } from 'react';
import type { BadgeVariant } from '../../types';

const variantClass: Record<BadgeVariant, string> = {
  green: 'bg2',
  amber: 'ba',
  red: 'br',
  blue: 'bbl',
  gray: 'bx',
  purple: 'bp',
  teal: 'btl',
  navy: 'bn',
};

export function Badge({
  variant = 'gray',
  children,
  className = '',
  style,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`badge ${variantClass[variant]} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}
