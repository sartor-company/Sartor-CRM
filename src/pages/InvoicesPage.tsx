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
import { crmApi, type CrmInvoice } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira } from '../utils/format';
import {
  agingLabel,
  collectionRate,
  daysOutstanding,
  deliveryDate,
  formatInvoiceRef,
  invoiceAmount,
  invoiceCustomer,
  isOverdue,
  isPaid,
  isPartial,
  lpoIdOf,
  lpoTermsOf,
  outstandingAmount,
  paidAmount,
  qrStatus,
  termsShort,
} from '../utils/invoice';
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
      invoiceCustomer(row),
      row.status,
      typeof row.lpo === 'object' && row.lpo ? row.lpo.lpoId : '',
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const outstanding = invoices.reduce((sum, i) => sum + outstandingAmount(i), 0);
  const paidCount = invoices.filter(isPaid).length;
  const partialCount = invoices.filter(isPartial).length;
  const overdue = invoices.filter(isOverdue);
  const severe = overdue.filter((i) => daysOutstanding(i) >= 60);
  const mid = overdue.filter((i) => {
    const d = daysOutstanding(i);
    return d >= 30 && d < 60;
  });
  const rate = collectionRate(invoices);

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

      {severe.length > 0 && (
        <InfoBanner variant="err">
          <strong>
            {severe.length} invoice{severe.length === 1 ? ' is' : 's are'} 60+ days overdue — action required.
          </strong>{' '}
          {severe
            .slice(0, 2)
            .map(
              (i) =>
                `${formatInvoiceRef(i)} (${invoiceCustomer(i)} · ${formatNaira(invoiceAmount(i))} · ${daysOutstanding(i)} days)`,
            )
            .join(' and ')}
          . Escalate to CEO or initiate formal collection.
        </InfoBanner>
      )}

      {mid.length > 0 && (
        <InfoBanner variant="warn">
          <strong>
            {mid.length} invoice{mid.length === 1 ? ' is' : 's are'} 30–59 days overdue.
          </strong>{' '}
          Follow up with customers. Collection rate this month: {rate}%.
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
        <KpiCard label="Overdue" value={String(overdue.length)} accent="red" />
      </KpiGrid>

      <DataTable id="inv-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>LPO</th>
            <th>Customer</th>
            <th>Delivery</th>
            <th>Terms</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Due Date</th>
            <th>Aging</th>
            <th>QR Status</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={12} style={{ color: 'var(--tx3)' }}>
                Loading invoices…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={12} style={{ color: 'var(--tx3)' }}>
                No invoices found.
              </td>
            </tr>
          ) : (
            filtered.map((inv) => {
              const terms = lpoTermsOf(inv);
              const paid = isPaid(inv);
              const aging = agingLabel(inv);
              const qr = qrStatus(inv);
              return (
                <tr key={inv._id}>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{formatInvoiceRef(inv)}</Mono>
                  </td>
                  <td>{lpoIdOf(inv)}</td>
                  <td>{invoiceCustomer(inv)}</td>
                  <td>{deliveryDate(inv)}</td>
                  <td>
                    {terms ? (
                      <Badge variant={lpoTermsVariant(terms)}>{termsShort(terms)}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <Mono>{formatNaira(invoiceAmount(inv))}</Mono>
                  </td>
                  <td>
                    <Mono>{formatNaira(paidAmount(inv))}</Mono>
                  </td>
                  <td>{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: aging.color }}>{aging.text}</span>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => openModal('qr-view', { invoice: inv })}
                      style={{ gap: 4 }}
                    >
                      <Icon name="camera" size={13} />
                      <Badge variant={qr.variant} style={{ fontSize: 10 }}>
                        {qr.label}
                      </Badge>
                    </Button>
                  </td>
                  <td>
                    <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status || '—'}</Badge>
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
