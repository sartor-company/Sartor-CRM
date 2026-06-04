import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function PageHead({
  title,
  icon,
  subtitle,
  actions,
}: {
  title: ReactNode;
  icon?: IconName;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="pghead">
      <div>
        <div className="pgtitle">
          {icon && <Icon name={icon} size={20} className="pgtitle-ico" />}
          <span>{title}</span>
        </div>
        {subtitle && <div className="pgsub">{subtitle}</div>}
      </div>
      {actions && <div className="pghead-actions">{actions}</div>}
    </div>
  );
}
