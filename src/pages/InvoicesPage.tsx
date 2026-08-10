import {
  Badge,
  Button,
  DataTable,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Icon,
  IconLabel,
  Mono,
  PageHead,
  RoleGate,
  SearchBar,
} from '../components/ui';
import { crmApi, leadName, type CrmInvoice } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira, num } from '../utils/format';
import { invoiceStatusVariant, lpoTermsVariant } from '../utils/statusBadges';

export default function InvoicesPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showInvAddPay, showInvMarkPaid, showInvConfirmPay } = useRoleGates();
  const { data, loading, error, reload } = useApiQuery(() => crmApi.listInvoices(), []);
  const invoices = data ?? [];

  const { search, setSearch, filtered } = useTableFilter(invoices, '', (row: CrmInvoice, q) =>
    [
      row.invoiceId,
      leadName(typeof row.lead === 'object' ? row.lead : null),
      row.status,
      typeof row.lpo === 'object' && row.lpo ? row.lpo.lpoId : '',
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const outstanding = invoices
    .filter((i) => {
      const s = String(i.status || '').toLowerCase();
      return s !== 'paid' && s !== 'cancelled';
    })
    .reduce((sum, i) => sum + num(i.totalAmount), 0);
  const paidCount = invoices.filter((i) => String(i.status || '').toLowerCase() === 'paid').length;
  const partialCount = invoices.filter((i) =>
    String(i.status || '').toLowerCase().includes('partial'),
  ).length;
  const overdueCount = invoices.filter((i) =>
    String(i.status || '').toLowerCase().includes('overdue'),
  ).length;

  return (
    <>
      <PageHead
        title="Invoices"
        subtitle="Aging starts from delivery confirmation per payment terms."
        actions={
          <Button variant="secondary" size="sm" onClick={() => showToast('Exporting invoices…', 'ok')}>
            Export
          </Button>
        }
      />

      {error && (
        <InfoBanner variant="err" style={{ marginBottom: 12 }}>
          {error}{' '}
          <button type="button" className="ca" onClick={() => void reload()}>
            Retry
          </button>
        </InfoBanner>
      )}

      {overdueCount > 0 && (
        <InfoBanner variant="err">
          <strong>
            {overdueCount} invoice{overdueCount === 1 ? '' : 's'} overdue — action required.
          </strong>
        </InfoBanner>
      )}

      <SearchBar
        placeholder="Search by invoice number, customer or status…"
        value={search}
        onChange={setSearch}
      />

      <KpiGrid cols={4}>
        <KpiCard label="Total Outstanding" value={formatNaira(outstanding)} smallValue />
        <KpiCard label="Fully Paid" value={String(paidCount)} accent="green" />
        <KpiCard label="Part Paid" value={String(partialCount)} accent="amber" />
        <KpiCard label="Overdue" value={String(overdueCount)} accent="red" />
      </KpiGrid>

      <DataTable id="inv-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>LPO</th>
            <th>Customer</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                Loading invoices…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                No invoices found.
              </td>
            </tr>
          ) : (
            filtered.map((inv) => {
              const lpoId =
                typeof inv.lpo === 'object' && inv.lpo ? inv.lpo.lpoId || '—' : '—';
              const terms =
                typeof inv.lpo === 'object' && inv.lpo ? inv.lpo.terms : undefined;
              const paid = String(inv.status || '').toLowerCase() === 'paid';
              return (
                <tr key={inv._id}>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                  </td>
                  <td>{lpoId}</td>
                  <td>{inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td>
                    <Mono>{formatNaira(num(inv.totalAmount))}</Mono>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {terms ? (
                        <Badge variant={lpoTermsVariant(terms)} style={{ fontSize: 10, width: 'fit-content' }}>
                          {terms.length > 20 ? `${terms.slice(0, 18)}…` : terms}
                        </Badge>
                      ) : null}
                      <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status || '—'}</Badge>
                    </div>
                  </td>
                  <td>
                    {paid ? (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('view-invoice', { invoice: inv })}
                      >
                        View
                      </Button>
                    ) : (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openModal('view-invoice', { invoice: inv })}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => openModal('qr-view', { invoice: inv })}
                          aria-label="QR Status"
                        >
                          <Icon name="camera" size={14} />
                        </Button>
                        <RoleGate show={showInvAddPay}>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => openModal('add-payment', { invoice: inv })}
                          >
                            Add Payment
                          </Button>
                        </RoleGate>
                        <RoleGate show={showInvMarkPaid}>
                          <Button
                            variant="amber"
                            size="xs"
                            onClick={() => openModal('mark-paid', { invoice: inv })}
                          >
                            Mark Paid
                          </Button>
                        </RoleGate>
                        <RoleGate show={showInvConfirmPay}>
                          <Button
                            variant="green"
                            size="xs"
                            onClick={() => openModal('confirm-payment', { invoice: inv })}
                          >
                            <IconLabel icon="check" size={12}>
                              Confirm
                            </IconLabel>
                          </Button>
                        </RoleGate>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTable>
    </>
  );
}
