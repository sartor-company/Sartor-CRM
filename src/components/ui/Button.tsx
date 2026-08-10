import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'green' | 'secondary' | 'danger' | 'amber' | 'outline' | 'ghost';
type Size = 'md' | 'sm' | 'xs';

const variantClass: Record<Variant, string> = {
  primary: 'bpri',
  green: 'bgrn',
  secondary: 'bsec',
  danger: 'bred',
  amber: 'bamb',
  outline: 'bout',
  ghost: 'bghost',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'bsm' : size === 'xs' ? 'bxs' : '';
  return (
    <button
      type="button"
      className={['btn', variantClass[variant], sizeClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
