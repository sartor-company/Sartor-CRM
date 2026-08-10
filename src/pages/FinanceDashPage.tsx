import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, QueryState } from '../components/ui';
import { opsApi } from '../api/ops';
import { crmApi } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatNaira, num } from '../utils/format';

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

export default function FinanceDashPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data: rows = [], loading, error, reload } = useApiQuery(() => opsApi.financeQueue(), []);

  const confirmPaid = async (id: string) => {
    try {
      await crmApi.updateInvoiceStatus(id, 'Paid');
      showToast('Payment confirmed.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Confirm failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="inbox"
        title="Payment Confirmation Queue"
        subtitle="Invoices marked as paid — awaiting Finance/CEO confirmation."
      />

      <InfoBanner variant="warn">
        Only CEO and Finance Manager can confirm full payment. Confirmation triggers commission calculation and
        Lead→Customer conversion.
      </InfoBanner>

      <QueryState
        loading={loading}
        error={error}
        empty={!rows?.length}
        emptyMessage="No invoices awaiting payment confirmation."
      >
        <DataTable>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Marked By</th>
              <th>First Invoice?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((inv) => (
              <tr key={inv._id}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                </td>
                <td>{leadName(inv.lead) || inv.name || '—'}</td>
                <td>
                  <Mono>{formatNaira(num(inv.totalAmount))}</Mono>
                </td>
                <td>
                  <Badge variant="amber">{inv.status}</Badge>
                </td>
                <td>{personName(inv.user)}</td>
                <td>
                  {inv.isFirstInvoice ? (
                    <Badge variant="amber">Yes — Will Convert</Badge>
                  ) : (
                    <Badge variant="gray">No</Badge>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="green" size="sm" onClick={() => void confirmPaid(inv._id)}>
                      Confirm Full Payment →
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => openModal('confirm-payment')}>
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
