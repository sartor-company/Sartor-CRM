import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function Card({
  children,
  className = '',
  padding = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`card ${padding ? 'cp' : ''} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  subtitle,
}: {
  title: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="ch">
      <span className="ct">
        {icon && <Icon name={icon} size={16} className="ct-ico" />}
        {title}
      </span>
      {subtitle}
      {action}
    </div>
  );
}

export function CardLinkAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="ca" onClick={onClick}>
      {children}
    </button>
  );
}
