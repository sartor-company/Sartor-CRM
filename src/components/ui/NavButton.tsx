import type { ReactNode } from 'react';
import { useLocation } from '../../context/LocationContext';
import { Icon, IconLabel } from './Icon';

export function NavButton({
  lat,
  lng,
  small,
  iconOnly,
  title,
  children,
}: {
  lat: number;
  lng: number;
  small?: boolean;
  iconOnly?: boolean;
  title?: string;
  children?: ReactNode;
}) {
  const { navigateTo } = useLocation();
  return (
    <button
      type="button"
      className={`nav-btn ${small ? 'nav-btn-sml' : ''}`.trim()}
      title={title ?? 'Navigate to location'}
      onClick={() => navigateTo(lat, lng)}
    >
      {children ??
        (iconOnly ? (
          <Icon name="compass" size={small ? 14 : 16} />
        ) : (
          <IconLabel icon="compass" size={small ? 12 : 14}>
            Navigate
          </IconLabel>
        ))}
    </button>
  );
}
