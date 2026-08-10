import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { opsApi, type OpsDriver, type OpsWarehouse } from '../api/ops';
import { useLiveOptions } from '../hooks/useLiveOptions';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatDate } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

function PinInputs() {
  return (
    <div className="pin-inputs">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} className="pin-box" maxLength={1} />
      ))}
    </div>
  );
}

function whName(warehouse: OpsDriver['warehouse']) {
  if (!warehouse) return '—';
  if (typeof warehouse === 'string') return warehouse;
  return warehouse.name || '—';
}

function lpoLabel(active: OpsDriver['activeLpo']) {
  if (!active) return '—';
  if (typeof active === 'string') return active;
  return active.lpoId || '—';
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || '?'
  );
}

export function DriverModals() {
  const { isOpen, closeModal, openModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { showOnboardDriver, showDriverEdit, showDriverWh } = useRoleGates();
  const { drivers, warehouses: liveWarehouses } = useLiveOptions();
  const [warehouses, setWarehouses] = useState<OpsWarehouse[]>([]);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const licenceRef = useRef<HTMLInputElement>(null);
  const licenceExpRef = useRef<HTMLInputElement>(null);
  const makeRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLInputElement>(null);
  const whRef = useRef<HTMLSelectElement>(null);

  const driver =
    getPayload<{ driver?: OpsDriver }>('view-driver')?.driver ||
    getPayload<{ driver?: OpsDriver }>('assign-driver')?.driver ||
    getPayload<{ driver?: OpsDriver }>('assign-driver-warehouse')?.driver ||
    getPayload<{ driver?: OpsDriver }>('onboard-driver')?.driver ||
    null;

  const whList = warehouses.length ? warehouses : liveWarehouses;

  useEffect(() => {
    if (!isOpen('onboard-driver') && !isOpen('assign-driver-warehouse')) return;
    void opsApi.listWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  }, [isOpen]);

  const saveDriver = async (btn: HTMLButtonElement | null) => {
    const name = nameRef.current?.value.trim() || '';
    const phone = phoneRef.current?.value.trim() || '';
    const plate = plateRef.current?.value.trim() || '';
    if (!name || !phone || !plate) {
      showToast('Name, phone and plate are required.', 'err');
      return;
    }
    setSaving(true);
    if (btn) btn.disabled = true;
    try {
      await opsApi.createDriver({
        name,
        phone,
        plate,
        licenceNo: licenceRef.current?.value.trim() || undefined,
        licenceExpiry: licenceExpRef.current?.value || undefined,
        vehicleMake: makeRef.current?.value.trim() || undefined,
        vehicleModel: modelRef.current?.value.trim() || undefined,
        vehicleYear: yearRef.current?.value.trim() || undefined,
        warehouse: whRef.current?.value || undefined,
      });
      closeModal('onboard-driver');
      showToast('Driver onboarded successfully.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to onboard driver', 'err');
    } finally {
      setSaving(false);
      if (btn) btn.disabled = false;
    }
  };

  const vehicle = driver
    ? [driver.vehicleMake, driver.vehicleModel, driver.vehicleYear].filter(Boolean).join(' ') || '—'
    : '—';
  const passDriver = (id: import('../types').ModalId) => {
    if (driver) openModal(id, { driver });
    else openModal(id);
  };

  return (
    <>
      <RoleGate show={showOnboardDriver}>
        <SartorModal
          id="onboard-driver"
          open={isOpen('onboard-driver')}
          onClose={() => closeModal('onboard-driver')}
          icon="car"
          title={driver ? 'Edit Driver' : 'Onboard Driver'}
          footer={
            <ModalFooterActions onCancel={() => closeModal('onboard-driver')}>
              <Button
                variant="green"
                disabled={saving}
                onClick={(e) => void saveDriver(e.currentTarget)}
              >
                {saving ? 'Saving…' : driver ? 'Save Changes' : 'Onboard Driver'}
              </Button>
            </ModalFooterActions>
          }
        >
          <FRow>
            <FG label="Full Name *" className="w50">
              <input
                ref={nameRef}
                className="inp"
                placeholder="Legal name"
                key={`n-${driver?._id || 'new'}`}
                defaultValue={driver?.name || ''}
              />
            </FG>
            <FG label="Phone *" className="w50">
              <input
                ref={phoneRef}
                className="inp"
                type="tel"
                placeholder="+234…"
                key={`p-${driver?._id || 'new'}`}
                defaultValue={driver?.phone || ''}
              />
            </FG>
          </FRow>
          <FRow>
            <FG label="Licence No. *" className="w50">
              <input
                ref={licenceRef}
                className="inp"
                placeholder="Licence number"
                key={`l-${driver?._id || 'new'}`}
                defaultValue={driver?.licenceNo || ''}
              />
            </FG>
            <FG label="Licence Expiry *" className="w50">
              <input ref={licenceExpRef} className="inp" type="date" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Make *">
              <input
                ref={makeRef}
                className="inp"
                placeholder="Toyota"
                key={`mk-${driver?._id || 'new'}`}
                defaultValue={driver?.vehicleMake || ''}
              />
            </FG>
            <FG label="Model *">
              <input
                ref={modelRef}
                className="inp"
                placeholder="Model"
                key={`md-${driver?._id || 'new'}`}
                defaultValue={driver?.vehicleModel || ''}
              />
            </FG>
            <FG label="Year">
              <input
                ref={yearRef}
                className="inp"
                type="number"
                placeholder="2020"
                key={`y-${driver?._id || 'new'}`}
                defaultValue={driver?.vehicleYear || ''}
              />
            </FG>
          </FRow>
          <FRow>
            <FG label="Plate No. *" className="w50">
              <input
                ref={plateRef}
                className="inp"
                placeholder="Plate"
                key={`pl-${driver?._id || 'new'}`}
                defaultValue={driver?.plate || ''}
              />
            </FG>
            <FG label="Warehouse *" className="w50">
              <select ref={whRef} className="sel" defaultValue="">
                <option value="">Select warehouse…</option>
                {whList.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </FG>
          </FRow>
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="view-driver"
        open={isOpen('view-driver')}
        onClose={() => closeModal('view-driver')}
        title={driver ? `Driver Profile — ${driver.name}` : 'Driver Profile'}
        subtitle={
          driver ? `${whName(driver.warehouse)} · ${driver.plate}` : 'Select a driver'
        }
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-driver')}>
              Close
            </Button>
            <RoleGate show={showDriverWh}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('view-driver');
                  passDriver('assign-driver-warehouse');
                }}
              >
                Assign Warehouse
              </Button>
            </RoleGate>
            <RoleGate show={showDriverEdit}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('view-driver');
                  passDriver('onboard-driver');
                }}
              >
                Edit Details
              </Button>
            </RoleGate>
          </>
        }
      >
        {!driver ? (
          <InfoBanner>No driver selected.</InfoBanner>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 14,
                background: 'var(--bg)',
                borderRadius: 9,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--N)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {initials(driver.name)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--N)' }}>{driver.name}</div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
                  Driver · {whName(driver.warehouse)} ·{' '}
                  <Badge
                    variant={
                      driver.status === 'Available'
                        ? 'green'
                        : driver.status === 'On Route'
                          ? 'amber'
                          : 'gray'
                    }
                  >
                    {driver.status || 'Available'}
                  </Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
                  <IconLabel icon="phone" size={12}>
                    {driver.phone}
                  </IconLabel>
                </div>
              </div>
            </div>
            <div className="g2" style={{ marginBottom: 0 }}>
              <div>
                <SDivLabel style={{ marginTop: 0 }}>Personal & Licence Details</SDivLabel>
                <IRow label="Licence No." value={driver.licenceNo || '—'} />
                <IRow label="Licence Expiry" value={formatDate(driver.licenceExpiry)} />
                <IRow
                  label="Active Assignment"
                  value={
                    lpoLabel(driver.activeLpo) !== '—' ? (
                      <Badge variant="amber">{lpoLabel(driver.activeLpo)}</Badge>
                    ) : (
                      '—'
                    )
                  }
                />
              </div>
              <div>
                <SDivLabel style={{ marginTop: 0 }}>Vehicle Details</SDivLabel>
                <IRow label="Make / Model" value={vehicle} />
                <IRow label="Plate Number" value={driver.plate} />
              </div>
            </div>
          </>
        )}
      </SartorModal>

      <SartorModal
        id="assign-driver"
        open={isOpen('assign-driver')}
        onClose={() => closeModal('assign-driver')}
        title="Assign Driver to LPO"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('assign-driver')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('assign-driver', e.currentTarget, 'Driver assigned to LPO.')}
            >
              Assign Driver
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Select Driver *" full>
          <select
            className="sel"
            defaultValue={driver?._id || ''}
            key={driver?._id || 'none'}
          >
            <option value="">Choose driver…</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
                {d.vehicleMake || d.vehicleModel
                  ? ` — ${[d.vehicleMake, d.vehicleModel].filter(Boolean).join(' ')}`
                  : ''}
                {d.status ? ` · ${d.status}` : ''}
              </option>
            ))}
          </select>
        </FG>
      </SartorModal>

      <RoleGate show={showDriverWh}>
        <SartorModal
          id="assign-driver-warehouse"
          open={isOpen('assign-driver-warehouse')}
          onClose={() => closeModal('assign-driver-warehouse')}
          title="Assign Driver to Warehouse"
          subtitle={
            driver
              ? `${driver.name} · Currently: ${whName(driver.warehouse)}`
              : 'Select a driver'
          }
          size="narrow"
          footer={
            <ModalFooterActions onCancel={() => closeModal('assign-driver-warehouse')}>
              <Button
                variant="primary"
                onClick={(e) =>
                  handleSubmit('assign-driver-warehouse', e.currentTarget, 'Driver assigned to warehouse.')
                }
              >
                Confirm Assignment
              </Button>
            </ModalFooterActions>
          }
        >
          <InfoBanner>
            Linking a driver to a warehouse means they appear when dispatching from that warehouse only.
          </InfoBanner>
          <IRow
            label="Driver"
            value={
              driver
                ? `${driver.name}${vehicle !== '—' ? ` — ${vehicle}` : ''} (${driver.plate})`
                : '—'
            }
          />
          <FG label="Assign to Warehouse *" full style={{ marginTop: 10 }}>
            <select className="sel" defaultValue="">
              <option value="">Select warehouse…</option>
              {whList.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                  {w.address ? ` — ${w.address}` : ''}
                </option>
              ))}
            </select>
          </FG>
          <FG label="Effective Date *" full style={{ marginTop: 10 }}>
            <input className="inp" type="date" />
          </FG>
          <FG label="Notes" full style={{ marginTop: 10 }}>
            <textarea className="ta" rows={2} placeholder="Reason for reassignment…" />
          </FG>
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="driver-pickup"
        open={isOpen('driver-pickup')}
        onClose={() => closeModal('driver-pickup')}
        title="Step 1: Confirm Pickup"
        subtitle="Photo of packed goods at warehouse"
        footer={
          <ModalFooterActions onCancel={() => closeModal('driver-pickup')}>
            <Button
              variant="primary"
              onClick={(e) => {
                handleSubmit('driver-pickup', e.currentTarget, 'Pickup confirmed.');
                openModal('delivery-confirm');
              }}
            >
              Confirm Pickup →
            </Button>
          </ModalFooterActions>
        }
      >
        <div className="dlv-step">
          <div className="dlv-step-num">Step 1 of 2</div>
          <div className="dlv-step-t">Photo of packed goods at warehouse</div>
          <div
            className="upload-zone"
            role="button"
            tabIndex={0}
            onClick={() => showToast('Camera / gallery would open on device.')}
            onKeyDown={(e) => e.key === 'Enter' && showToast('Camera / gallery would open on device.')}
          >
            <div className="upload-zone-ico">
              <Icon name="camera" size={28} />
            </div>
            <div className="upload-zone-t">Tap to take or upload photo</div>
          </div>
        </div>
        <FG label="Odometer at Pickup" full style={{ marginTop: 10 }}>
          <input className="inp" placeholder="e.g. 45,320 km" />
        </FG>
      </SartorModal>

      <SartorModal
        id="delivery-confirm"
        open={isOpen('delivery-confirm')}
        onClose={() => closeModal('delivery-confirm')}
        title="Step 2: Confirm Delivery"
        subtitle="Enter customer PIN and upload evidence"
        footer={
          <ModalFooterActions onCancel={() => closeModal('delivery-confirm')}>
            <Button
              variant="green"
              onClick={() => {
                closeModal('delivery-confirm');
                showToast('Delivery confirmed. Stock deducted. Invoice aging started.');
              }}
            >
              Confirm Delivery →
            </Button>
          </ModalFooterActions>
        }
      >
        <div className="dlv-step">
          <div className="dlv-step-num">Customer PIN</div>
          <div className="dlv-step-t">Enter 6-digit code from customer</div>
          <PinInputs />
        </div>
        <div className="dlv-step">
          <div className="dlv-step-num">Delivery Evidence</div>
          <div className="dlv-step-t">Photo of signed invoice acknowledged by customer</div>
          <div
            className="upload-zone"
            role="button"
            tabIndex={0}
            onClick={() => showToast('Camera / gallery would open on device.')}
          >
            <div className="upload-zone-ico">
              <Icon name="file-text" size={28} />
            </div>
            <div className="upload-zone-t">Signed invoice — required</div>
          </div>
        </div>
      </SartorModal>
    </>
  );
}
