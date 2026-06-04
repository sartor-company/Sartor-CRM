import type { ReactNode } from 'react';
import { useLocation } from '../../context/LocationContext';
import { IconLabel } from './Icon';

export function NavButton({
  lat,
  lng,
  small,
  children,
}: {
  lat: number;
  lng: number;
  small?: boolean;
  children?: ReactNode;
}) {
  const { navigateTo } = useLocation();
  return (
    <button
      type="button"
      className={`nav-btn ${small ? 'nav-btn-sml' : ''}`.trim()}
      onClick={() => navigateTo(lat, lng)}
    >
      {children ?? <IconLabel icon="compass" size={small ? 12 : 14}>Navigate</IconLabel>}
    </button>
  );
}
