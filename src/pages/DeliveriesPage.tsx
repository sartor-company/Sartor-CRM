import { Badge, Button, Card, IconLabel, InfoBanner, NavButton, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

export default function DeliveriesPage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead icon="car" title="My Deliveries" />

      <InfoBanner>
        <strong>Step 1:</strong> Confirm pickup at warehouse (photo). <strong>Step 2:</strong> Confirm delivery —
        customer 6-digit PIN + signed invoice photo. Stock permanently deducted on delivery confirmation.
      </InfoBanner>

      <Card className="mb" padding={false}>
        <div className="cp" style={{ borderBottom: '1px solid var(--brd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <strong>LPO-0042</strong> → FreshMart NG
              <br />
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>31 Garki Market Rd · ₦240,000 · POD</span>
              <NavButton lat={9.0368} lng={7.4676} small />
            </div>
            <Badge variant="amber">Pickup Pending</Badge>
          </div>
        </div>
        <div className="cp">
          <div style={{ display: 'flex', gap: 10 }}>
            <Button size="sm" onClick={() => openModal('driver-pickup')}>
              Step 1: Confirm Pickup
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Step 2: Confirm Delivery
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb" padding={false}>
        <div className="cp" style={{ borderBottom: '1px solid var(--brd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <strong>LPO-0041</strong> → PharmaCare Ltd
              <br />
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>14 Allen Avenue, Ikeja · ₦180,000 · SOR 30d</span>
              <NavButton lat={9.0368} lng={7.4676} small />
            </div>
            <Badge variant="blue">In Transit</Badge>
          </div>
        </div>
        <div className="cp">
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
              <IconLabel icon="check" size={13}>Pickup Confirmed</IconLabel>
            </Button>
            <Button size="sm" onClick={() => openModal('delivery-confirm')}>
              Step 2: Confirm Delivery
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
