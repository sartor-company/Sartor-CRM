import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, QueryState } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
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
  const { data: rows = [], loading, error } = useApiQuery(() => opsApi.financeQueue(), []);

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
              <th>Paid</th>
              <th>Marked By</th>
              <th>First Invoice?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((inv) => {
              const paid = inv.paidAmount != null ? num(inv.paidAmount) : num(inv.totalAmount);
              return (
                <tr key={inv._id}>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                  </td>
                  <td>{leadName(inv.lead) || inv.name || '—'}</td>
                  <td>
                    <Mono>{formatNaira(num(inv.totalAmount))}</Mono>
                  </td>
                  <td>
                    <Mono>{formatNaira(paid)}</Mono>
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
                    <Button
                      variant="green"
                      size="sm"
                      onClick={() => openModal('confirm-payment', { invoice: inv })}
                    >
                      Confirm Full Payment →
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
