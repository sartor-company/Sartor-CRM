import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type BannerVariant = 'info' | 'warn' | 'succ' | 'err';

const variantIcon: Record<BannerVariant, IconName> = {
  info: 'info',
  warn: 'alert',
  succ: 'check',
  err: 'circle-alert',
};

export function InfoBanner({
  variant = 'info',
  icon,
  children,
  id,
  style,
}: {
  variant?: BannerVariant;
  icon?: IconName;
  children: ReactNode;
  id?: string;
  style?: React.CSSProperties;
}) {
  const iconName = icon ?? variantIcon[variant];
  return (
    <div className={`info-banner ${variant}`} id={id} style={style}>
      <span className="ico">
        <Icon name={iconName} size={16} />
      </span>
      <div>{children}</div>
    </div>
  );
}
