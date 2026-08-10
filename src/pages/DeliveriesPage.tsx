import { Badge, Button, Card, IconLabel, InfoBanner, Mono, PageHead, QueryState } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate, formatNaira } from '../utils/format';

function leadName(lead: { name?: string } | string | null | undefined) {
  if (!lead) return '—';
  if (typeof lead === 'string') return lead;
  return lead.name || '—';
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
          const inTransit = ['In Transit', 'Dispatched'].includes(d.status || '');
          return (
            <Card key={d._id} className="mb" padding={false}>
              <div className="cp" style={{ borderBottom: '1px solid var(--brd)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <Mono style={{ fontSize: 12 }}>{d.lpoId || d._id.slice(-6)}</Mono>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{leadName(d.lead)}</div>
                    <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
                      {formatNaira(d.totalAmount)} · {d.skuCount ?? 0} SKUs · {formatDate(d.creationDateTime)}
                    </div>
                  </div>
                  <Badge variant={d.status === 'Delivered' ? 'green' : 'amber'}>{d.status}</Badge>
                </div>
              </div>
              <div className="cp" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {inTransit && (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => openModal('driver-pickup')}>
                      Confirm Pickup
                    </Button>
                    <Button variant="green" size="sm" onClick={() => void confirm(d._id)}>
                      <IconLabel icon="check" size={13}>
                        Confirm Delivery
                      </IconLabel>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openModal('delivery-confirm')}>
                      PIN Flow
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
