import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '../components/ui/Button';
import { IconLabel } from '../components/ui/Icon';
import { NavButton } from '../components/ui/NavButton';
import { SartorModal } from '../components/ui/SartorModal';
import { LOC_DEFAULT, useLocation } from '../context/LocationContext';
import { useRoleGates } from '../hooks/useRoleGates';
import type { LocationPin } from '../types';
import { useModalActions } from './helpers';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function DraggableMarker({
  lat,
  lng,
  onMove,
}: {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
}) {
  const [pos, setPos] = useState<L.LatLngExpression>([lat, lng]);

  useEffect(() => {
    setPos([lat, lng]);
  }, [lat, lng]);

  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={pos}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat: la, lng: ln } = e.target.getLatLng();
          setPos([la, ln]);
          onMove(la, ln);
        },
      }}
    />
  );
}

export function LocationModals() {
  const { isOpen, closeModal, openModal, showToast, handleSubmit } = useModalActions();
  const {
    pickerLat,
    pickerLng,
    setPickerCoords,
    setPickerContext,
    pickerContext,
    savePin,
    pins,
    viewPin,
    setViewPin,
    viewContext,
  } = useLocation();
  const { showLocPin } = useRoleGates();
  const [addressLabel, setAddressLabel] = useState('');

  const displayPin =
    viewPin ??
    (viewContext ? pins[viewContext] : null) ??
    (pickerContext ? pins[pickerContext] : null) ??
    ({ lat: LOC_DEFAULT.lat, lng: LOC_DEFAULT.lng, label: 'Map center' } satisfies LocationPin);

  useEffect(() => {
    if (isOpen('location-picker')) {
      const existing = pickerContext ? pins[pickerContext] : undefined;
      if (existing) {
        setPickerCoords(existing.lat, existing.lng);
        setAddressLabel(existing.label);
      } else {
        setPickerCoords(LOC_DEFAULT.lat, LOC_DEFAULT.lng);
        setAddressLabel('');
      }
    }
  }, [isOpen('location-picker'), pickerContext, pins, setPickerCoords]);

  useEffect(() => {
    if (isOpen('location-view') && viewContext) {
      const pin = pins[viewContext];
      if (pin) setViewPin(pin);
      else setViewPin(null);
    }
  }, [isOpen('location-view'), viewContext, pins, setViewPin]);

  const useGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not available in this browser.', 'warn');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickerCoords(pos.coords.latitude, pos.coords.longitude);
        showToast('Location updated from GPS.');
      },
      () => showToast('Could not get GPS location.', 'err'),
    );
  };

  return (
    <>
      <SartorModal
        id="location-picker"
        open={isOpen('location-picker')}
        onClose={() => closeModal('location-picker')}
        icon="map-pin"
        title="Pin Location on Map"
        subtitle="Drag the marker to the exact entrance. Tap GPS for auto-locate."
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('location-picker')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                savePin(addressLabel);
                handleSubmit('location-picker', e.currentTarget, 'Location pin saved.');
              }}
            >
              Save Pin
            </Button>
          </>
        }
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <input
            className="loc-search-inp"
            placeholder="Type an address or area to pan the map…"
            value={addressLabel}
            onChange={(e) => setAddressLabel(e.target.value)}
          />
          <button type="button" className="loc-gps-btn" onClick={useGps}>
            <IconLabel icon="phone" size={13}>Use My Location</IconLabel>
          </button>
        </div>
        <div className="loc-map-container">
          <MapContainer
            center={[pickerLat, pickerLng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={pickerLat} lng={pickerLng} />
            <DraggableMarker lat={pickerLat} lng={pickerLng} onMove={setPickerCoords} />
          </MapContainer>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--tx3)',
              textTransform: 'uppercase',
            }}
          >
            Pin Coordinates:
          </span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: 'var(--N)' }}>
            {pickerLat.toFixed(4)}° N
          </span>
          <span style={{ color: 'var(--tx3)' }}>·</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: 'var(--N)' }}>
            {pickerLng.toFixed(4)}° E
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            className="inp"
            placeholder="Location label (e.g. Store entrance)"
            style={{ fontSize: 12, padding: '7px 10px' }}
            value={addressLabel}
            onChange={(e) => setAddressLabel(e.target.value)}
          />
          <div className="fi-hint">Optional: a human-readable label for this pin.</div>
        </div>
      </SartorModal>

      <SartorModal
        id="location-view"
        open={isOpen('location-view')}
        onClose={() => closeModal('location-view')}
        icon="map-pin"
        title="Pinned Location"
        subtitle={displayPin?.label ?? 'Customer location'}
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('location-view')}>
              Close
            </Button>
            {displayPin && (
              <NavButton lat={displayPin.lat} lng={displayPin.lng} />
            )}
          </>
        }
      >
        {displayPin && (
          <>
            <div className="loc-map-container">
              <MapContainer
                center={[displayPin.lat, displayPin.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[displayPin.lat, displayPin.lng]} />
              </MapContainer>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--N)', marginBottom: 3 }}>
                  {displayPin.label}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: 'var(--tx3)' }}>
                    {displayPin.lat.toFixed(4)}° N
                  </span>
                  <span style={{ color: 'var(--tx3)' }}>·</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: 'var(--tx3)' }}>
                    {displayPin.lng.toFixed(4)}° E
                  </span>
                </div>
                {displayPin.pinned_by && (
                  <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 3 }}>
                    Pinned by {displayPin.pinned_by}
                    {displayPin.pinned_at ? ` · ${displayPin.pinned_at}` : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <NavButton lat={displayPin.lat} lng={displayPin.lng} />
                {showLocPin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (viewContext) {
                        setPickerContext(viewContext);
                        setPickerCoords(displayPin.lat, displayPin.lng);
                      }
                      closeModal('location-view');
                      openModal('location-picker');
                    }}
                  >
                    Edit Pin
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SartorModal>
    </>
  );
}
