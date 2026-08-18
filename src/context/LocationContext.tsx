import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LocationPin } from '../types';
import { ROLE_META } from '../constants/roles';
import { useApp } from './AppContext';

export const LOC_DEFAULT = { lat: 9.0579, lng: 7.4951 };

export function locationPinKey(context: string, entityId?: string | null) {
  return entityId ? `${context}:${entityId}` : context;
}

export function parseLocationPinKey(key: string | null): { context: string; entityId?: string } {
  if (!key) return { context: 'lead' };
  const i = key.indexOf(':');
  if (i === -1) return { context: key };
  return { context: key.slice(0, i), entityId: key.slice(i + 1) };
}

interface LocationContextValue {
  pins: Record<string, LocationPin>;
  pickerLat: number;
  pickerLng: number;
  setPickerCoords: (lat: number, lng: number) => void;
  pickerContext: string | null;
  setPickerContext: (ctx: string | null) => void;
  savePin: (label: string) => LocationPin | null;
  hydratePin: (key: string, pin: LocationPin) => void;
  clearPin: (key: string) => void;
  viewPin: LocationPin | null;
  setViewPin: (pin: LocationPin | null) => void;
  viewContext: string | null;
  setViewContext: (ctx: string | null) => void;
  navigateTo: (lat: number, lng: number) => void;
}

const LocationCtx = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const [pins, setPins] = useState<Record<string, LocationPin>>({});
  const [pickerLat, setPickerLat] = useState(LOC_DEFAULT.lat);
  const [pickerLng, setPickerLng] = useState(LOC_DEFAULT.lng);
  const [pickerContext, setPickerContext] = useState<string | null>(null);
  const [viewPin, setViewPin] = useState<LocationPin | null>(null);
  const [viewContext, setViewContext] = useState<string | null>(null);

  const setPickerCoords = useCallback((lat: number, lng: number) => {
    setPickerLat(lat);
    setPickerLng(lng);
  }, []);

  const hydratePin = useCallback((key: string, pin: LocationPin) => {
    setPins((prev) => (prev[key] ? prev : { ...prev, [key]: pin }));
  }, []);

  const clearPin = useCallback((key: string) => {
    setPins((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const savePin = useCallback(
    (label: string) => {
      if (!pickerContext) return null;
      const pin: LocationPin = {
        lat: pickerLat,
        lng: pickerLng,
        label: label.trim() || `${pickerLat.toFixed(4)}, ${pickerLng.toFixed(4)}`,
        pinned_by: ROLE_META[role].role,
        pinned_at: new Date().toLocaleDateString('en-GB'),
      };
      setPins((prev) => ({ ...prev, [pickerContext]: pin }));
      return pin;
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
      hydratePin,
      clearPin,
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
      hydratePin,
      clearPin,
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
