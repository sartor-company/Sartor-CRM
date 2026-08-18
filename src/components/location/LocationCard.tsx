import { useEffect } from 'react';
import { Button, Icon, IconLabel, NavButton } from '../ui';
import { locationPinKey, useLocation } from '../../context/LocationContext';
import { useModal } from '../../context/ModalContext';
import type { LocationContext as LocCtx, LocationPin } from '../../types';
import { useRoleGates } from '../../hooks/useRoleGates';

export function LocationCardSection({
  context,
  entityId,
  initialPin,
}: {
  context: LocCtx;
  entityId?: string;
  initialPin?: LocationPin | null;
}) {
  const { pins, setPickerContext, setViewContext, setViewPin, hydratePin } = useLocation();
  const { openModal } = useModal();
  const pinKey = locationPinKey(context, entityId);
  const { showLocPin } = useRoleGates();
  const pin = pins[pinKey] ?? initialPin ?? undefined;

  useEffect(() => {
    if (initialPin) hydratePin(pinKey, initialPin);
  }, [hydratePin, initialPin, pinKey]);

  const openPicker = () => {
    setPickerContext(pinKey);
    openModal('location-picker');
  };

  if (!pin) {
    return (
      <div className="loc-no-pin">
        <Icon name="map-pin" size={18} />
        <span>No location pinned yet.</span>
        {showLocPin && (
          <button
            type="button"
            className="loc-pin-btn"
            style={{ marginLeft: 'auto' }}
            onClick={openPicker}
          >
            <IconLabel icon="map-pin" size={14}>
              Pin Location
            </IconLabel>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="location-card">
      <div className="location-card-inner">
        <div className="location-icon">
          <Icon name="map-pin" size={20} />
        </div>
        <div className="location-info">
          <div className="location-lbl">
            <IconLabel icon="check" size={12}>
              Location Pinned
            </IconLabel>
          </div>
          <div className="location-coords">
            {pin.lat.toFixed(4)}° N · {pin.lng.toFixed(4)}° E
          </div>
          <div className="location-addr">{pin.label}</div>
        </div>
        <div className="location-acts">
          <NavButton lat={pin.lat} lng={pin.lng} small />
          <Button
            variant="secondary"
            size="xs"
            onClick={() => {
              setViewContext(pinKey);
              setViewPin(pin);
              openModal('location-view');
            }}
          >
            View Map
          </Button>
          {showLocPin && (
            <Button variant="outline" size="xs" onClick={openPicker}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
