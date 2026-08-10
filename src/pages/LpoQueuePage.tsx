import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, QueryState } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate, formatNaira } from '../utils/format';
import { lpoTermsVariant } from '../utils/statusBadges';

function leadName(lead: { name?: string } | string | null | undefined) {
  if (!lead) return '—';
  if (typeof lead === 'string') return lead;
  return lead.name || '—';
}

function personName(p: { fullName?: string } | string | null | undefined) {
  if (!p) return '—';
  if (typeof p === 'string') return p;
  return p.fullName || '—';
}

export default function LpoQueuePage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data: rows = [], loading, error, reload } = useApiQuery(() => opsApi.dispatchQueue(), []);

  const dispatch = async (id: string) => {
    try {
      await opsApi.dispatchLpo(id);
      showToast('LPO dispatched — invoice / PIN flow triggered.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Dispatch failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="upload"
        title="LPO Queue"
        subtitle="Dispatch packed LPOs — auto-generates invoice + sends PIN."
      />

      <InfoBanner>
        Only <strong>Packed</strong> LPOs can be dispatched. Invoice auto-generates and PIN is sent to customer via
        SMS/WhatsApp/Email.
      </InfoBanner>

      <QueryState
        loading={loading}
        error={error}
        empty={!rows?.length}
        emptyMessage="No packed LPOs waiting for dispatch."
      >
        <DataTable>
          <thead>
            <tr>
              <th>LPO No.</th>
              <th>Customer</th>
              <th>Terms</th>
              <th>Amount</th>
              <th>Packed By</th>
              <th>Pack Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r._id}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{r.lpoId || r._id.slice(-6)}</Mono>
                </td>
                <td>{leadName(r.lead)}</td>
                <td>
                  <Badge variant={lpoTermsVariant(r.terms)}>{r.terms || '—'}</Badge>
                </td>
                <td>
                  <Mono>{formatNaira(r.totalAmount)}</Mono>
                </td>
                <td>{personName(r.packedBy)}</td>
                <td>{formatDate(r.packedAt)}</td>
                <td>
                  <Badge variant="gray">{r.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="green" size="sm" onClick={() => void dispatch(r._id)}>
                      Dispatch → Invoice
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => openModal('dispatch-lpo')}>
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
