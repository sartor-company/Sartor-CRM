import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LocationContext as LocCtx, LocationPin } from '../types';
import { ROLE_META } from '../constants/roles';
import { useApp } from './AppContext';

export const LOC_DEFAULT = { lat: 9.0579, lng: 7.4951 };

export const SAMPLE_COORDS: Partial<Record<LocCtx, LocationPin>> = {
  lead: { lat: 9.0765, lng: 7.4893, label: 'Plot 14 Aminu Kano Crescent, Wuse II — Abuja' },
  visit: { lat: 9.0368, lng: 7.4676, label: '31 Garki Market Rd, Garki II — Abuja' },
  delivery: { lat: 9.03, lng: 7.46, label: '14 Adetokunbo Ademola Crescent, Wuse II' },
};

interface LocationContextValue {
  pins: Partial<Record<LocCtx, LocationPin>>;
  pickerLat: number;
  pickerLng: number;
  setPickerCoords: (lat: number, lng: number) => void;
  pickerContext: LocCtx | null;
  setPickerContext: (ctx: LocCtx | null) => void;
  savePin: (label: string) => void;
  viewPin: LocationPin | null;
  setViewPin: (pin: LocationPin | null) => void;
  viewContext: LocCtx | null;
  setViewContext: (ctx: LocCtx | null) => void;
  navigateTo: (lat: number, lng: number) => void;
}

const LocationCtx = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const [pins, setPins] = useState<Partial<Record<LocCtx, LocationPin>>>({});
  const [pickerLat, setPickerLat] = useState(LOC_DEFAULT.lat);
  const [pickerLng, setPickerLng] = useState(LOC_DEFAULT.lng);
  const [pickerContext, setPickerContext] = useState<LocCtx | null>(null);
  const [viewPin, setViewPin] = useState<LocationPin | null>(null);
  const [viewContext, setViewContext] = useState<LocCtx | null>(null);

  const setPickerCoords = useCallback((lat: number, lng: number) => {
    setPickerLat(lat);
    setPickerLng(lng);
  }, []);

  const savePin = useCallback(
    (label: string) => {
      if (!pickerContext) return;
      const pin: LocationPin = {
        lat: pickerLat,
        lng: pickerLng,
        label: label.trim() || `${pickerLat.toFixed(4)}, ${pickerLng.toFixed(4)}`,
        pinned_by: ROLE_META[role].role,
        pinned_at: new Date().toLocaleDateString('en-GB'),
      };
      setPins((prev) => ({ ...prev, [pickerContext]: pin }));
    },
    [pickerContext, pickerLat, pickerLng, role],
  );

  const navigateTo = useCallback((lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  }, []);

  const value = useMemo(
    () => ({
      pins,
      pickerLat,
      pickerLng,
      setPickerCoords,
      pickerContext,
      setPickerContext,
      savePin,
      viewPin,
      setViewPin,
      viewContext,
      setViewContext,
      navigateTo,
    }),
    [
      pins,
      pickerLat,
      pickerLng,
      setPickerCoords,
      pickerContext,
      savePin,
      viewPin,
      viewContext,
      navigateTo,
    ],
  );

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationCtx);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
