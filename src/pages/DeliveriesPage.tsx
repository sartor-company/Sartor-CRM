import { Badge, Button, Card, IconLabel, InfoBanner, Mono, NavButton, PageHead, QueryState } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate, formatNaira } from '../utils/format';
import { termsShort } from '../utils/invoice';

function leadOf(lead: { name?: string; address?: string; lat?: number; lng?: number } | string | null | undefined) {
  if (!lead || typeof lead === 'string') return { name: lead || '—', address: '', lat: undefined as number | undefined, lng: undefined as number | undefined };
  return lead;
}

export default function DeliveriesPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data: deliveries = [], loading, error, reload } = useApiQuery(
    () => opsApi.listDeliveries(),
    [],
  );

  const confirm = async (id: string) => {
    try {
      await opsApi.confirmDelivery(id);
      showToast('Delivery confirmed.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Confirm failed', 'err');
    }
  };

  return (
    <>
      <PageHead icon="car" title="My Deliveries" subtitle="In-transit and completed deliveries." />

      <InfoBanner>
        <strong>Step 1:</strong> Confirm pickup at warehouse (photo). <strong>Step 2:</strong> Confirm delivery —
        customer 6-digit PIN + signed invoice photo. Stock permanently deducted on delivery confirmation.
      </InfoBanner>

      <QueryState
        loading={loading}
        error={error}
        empty={!deliveries?.length}
        emptyMessage="No active or recent deliveries."
      >
        {(deliveries ?? []).map((d) => {
          const lead = leadOf(typeof d.lead === 'object' ? d.lead : null);
          const status = d.status || '';
          const pickupPending = ['Dispatched', 'Packed', 'Pickup Pending'].includes(status);
          const inTransit = status === 'In Transit';
          const delivered = status === 'Delivered';
          const pin =
            lead.lat != null && lead.lng != null && Number.isFinite(lead.lat) && Number.isFinite(lead.lng)
              ? { lat: lead.lat, lng: lead.lng }
              : null;
          const statusLabel = pickupPending ? 'Pickup Pending' : status;
          return (
            <Card key={d._id} className="mb" padding={false}>
              <div className="cp" style={{ borderBottom: '1px solid var(--brd)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <strong>
                      {d.lpoId || d._id.slice(-6)} → {lead.name || '—'}
                    </strong>
                    <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>
                        {lead.address || '—'} · {formatNaira(d.totalAmount)} · {termsShort(d.terms)}
                      </span>
                      {pin ? <NavButton lat={pin.lat} lng={pin.lng} small /> : null}
                    </div>
                  </div>
                  <Badge variant={delivered ? 'green' : inTransit ? 'blue' : 'amber'}>{statusLabel}</Badge>
                </div>
              </div>
              <div className="cp" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {delivered ? (
                  <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
                    Delivered {formatDate(d.creationDateTime)}
                  </Button>
                ) : pickupPending ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => openModal('driver-pickup', { delivery: d })}>
                      Step 1: Confirm Pickup
                    </Button>
                    <Button variant="secondary" size="sm" disabled>
                      Step 2: Confirm Delivery
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
                      <IconLabel icon="check" size={13}>
                        Pickup Confirmed
                      </IconLabel>
                    </Button>
                    <Button variant="green" size="sm" onClick={() => openModal('delivery-confirm', { delivery: d })}>
                      Step 2: Confirm Delivery
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => void confirm(d._id)}>
                      Confirm without PIN
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </QueryState>
    </>
  );
}
