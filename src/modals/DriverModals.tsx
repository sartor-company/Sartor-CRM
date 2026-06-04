import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { useRoleGates } from '../hooks/useRoleGates';
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

export function DriverModals() {
  const { isOpen, closeModal, openModal, handleSubmit, showToast } = useModalActions();
  const { showOnboardDriver, showDriverEdit, showDriverWh } = useRoleGates();

  return (
    <>
      <RoleGate show={showOnboardDriver}>
        <SartorModal
          id="onboard-driver"
          open={isOpen('onboard-driver')}
          onClose={() => closeModal('onboard-driver')}
          icon="car"
          title="Onboard Driver"
          footer={
            <ModalFooterActions onCancel={() => closeModal('onboard-driver')}>
              <Button
                variant="green"
                onClick={(e) => handleSubmit('onboard-driver', e.currentTarget, 'Driver onboarded successfully.')}
              >
                Onboard Driver
              </Button>
            </ModalFooterActions>
          }
        >
          <FRow>
            <FG label="Full Name *" className="w50">
              <input className="inp" placeholder="Legal name" />
            </FG>
            <FG label="Phone *" className="w50">
              <input className="inp" type="tel" placeholder="+234…" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Licence No. *" className="w50">
              <input className="inp" placeholder="Licence number" />
            </FG>
            <FG label="Licence Expiry *" className="w50">
              <input className="inp" type="date" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Make *">
              <input className="inp" placeholder="Toyota" />
            </FG>
            <FG label="Model *">
              <input className="inp" placeholder="Hilux" />
            </FG>
            <FG label="Year">
              <input className="inp" type="number" placeholder="2020" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Plate No. *" className="w50">
              <input className="inp" placeholder="ABJ-234-KW" />
            </FG>
            <FG label="Warehouse *" className="w50">
              <select className="sel" defaultValue="Abuja Central">
                <option>Abuja Central</option>
                <option>Lagos Hub</option>
              </select>
            </FG>
          </FRow>
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="view-driver"
        open={isOpen('view-driver')}
        onClose={() => closeModal('view-driver')}
        title="Driver Profile — Chidi Okeke"
        subtitle="Abuja Central Warehouse · ABJ-234-KW"
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
                  openModal('assign-driver-warehouse');
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
                  openModal('onboard-driver');
                }}
              >
                Edit Details
              </Button>
            </RoleGate>
          </>
        }
      >
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
            CO
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--N)' }}>Chidi Okeke</div>
            <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
              Driver · Abuja Central · <Badge variant="amber">On Route</Badge>
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
              <IconLabel icon="phone" size={12}>+234 803 567 4421</IconLabel>
            </div>
          </div>
        </div>
        <div className="g2" style={{ marginBottom: 0 }}>
          <div>
            <SDivLabel style={{ marginTop: 0 }}>Personal & Licence Details</SDivLabel>
            <IRow label="Licence No." value="FCT-2021-DL-04892" />
            <IRow label="Licence Expiry" value="Mar 2027 — Valid" />
            <IRow label="Active Assignment" value={<Badge variant="amber">LPO-0042 → FreshMart NG</Badge>} />
          </div>
          <div>
            <SDivLabel style={{ marginTop: 0 }}>Vehicle Details</SDivLabel>
            <IRow label="Make / Model" value="Toyota Hilux 2020" />
            <IRow label="Plate Number" value="ABJ-234-KW" />
          </div>
        </div>
        <SDivLabel>Recent Deliveries</SDivLabel>
        <div className="tw">
          <table style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>LPO</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: "'DM Mono',monospace" }}>LPO-0042</td>
                <td>FreshMart NG</td>
                <td>Current</td>
                <td>
                  <Badge variant="amber">In Progress</Badge>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: "'DM Mono',monospace" }}>LPO-0038</td>
                <td>SafeZone Pharma</td>
                <td>5 May 2026</td>
                <td>
                  <Badge variant="green">Delivered</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
          <select className="sel" defaultValue="">
            <option value="">Choose driver…</option>
            <option>Emeka Eze — Hino Truck · Available</option>
            <option>Chidi Okeke — Toyota Hilux</option>
          </select>
        </FG>
      </SartorModal>

      <RoleGate show={showDriverWh}>
        <SartorModal
          id="assign-driver-warehouse"
          open={isOpen('assign-driver-warehouse')}
          onClose={() => closeModal('assign-driver-warehouse')}
          title="Assign Driver to Warehouse"
          subtitle="Chidi Okeke · Currently: Abuja Central"
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
          <InfoBanner>Linking a driver to a warehouse means they appear when dispatching from that warehouse only.</InfoBanner>
          <IRow label="Driver" value="Chidi Okeke — Toyota Hilux (ABJ-234-KW)" />
          <FG label="Assign to Warehouse *" full style={{ marginTop: 10 }}>
            <select className="sel" defaultValue="abuja">
              <option value="abuja">Abuja Central — Garki Industrial</option>
              <option value="lagos">Lagos Hub — Apapa Road</option>
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
        subtitle="LPO-0042 · Abuja Central"
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
        subtitle="LPO-0041 · PharmaCare Ltd"
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
