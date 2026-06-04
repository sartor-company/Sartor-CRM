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
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { MOCK_INVOICES } from '../data/mock';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';

export default function InvoicesPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showInvAddPay, showInvMarkPaid, showInvConfirmPay } = useRoleGates();
  const { search, setSearch, filtered } = useTableFilter(MOCK_INVOICES, '', (row, q) =>
    [row.id, row.customer, row.status].some((v) => v.toLowerCase().includes(q)),
  );

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

      <InfoBanner variant="err">
        <strong>2 invoices are 60+ days overdue — action required.</strong> INV-00039 (PharmaCare Ltd · ₦180,000 · 68
        days) and INV-00037 (MedPoint · ₦96,000 · 63 days). Escalate to CEO or initiate formal collection.
      </InfoBanner>
      <InfoBanner variant="warn">
        <strong>3 invoices are 30–59 days overdue.</strong> Follow up with customers. Collection rate this month: 73.8%.
      </InfoBanner>

      <SearchBar
        placeholder="Search by invoice number, customer or status…"
        value={search}
        onChange={setSearch}
      />

      <KpiGrid cols={4}>
        <KpiCard label="Total Outstanding" value="₦2.4M" smallValue />
        <KpiCard label="Fully Paid" value="18" accent="green" />
        <KpiCard label="Part Paid" value="4" accent="amber" />
        <KpiCard label="Overdue" value="5" accent="red" />
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
          {filtered.map((inv) => (
            <tr key={inv.id}>
              <td>
                <Mono style={{ fontSize: 12 }}>{inv.id}</Mono>
              </td>
              <td>{inv.lpo}</td>
              <td>{inv.customer}</td>
              <td>{inv.date}</td>
              <td>
                <Badge variant={inv.terms === 'POD' ? 'teal' : inv.terms === 'SOR 30d' ? 'purple' : 'gray'}>
                  {inv.terms}
                </Badge>
              </td>
              <td>
                <Mono>{inv.amount}</Mono>
              </td>
              <td>
                <Mono>{inv.paid}</Mono>
              </td>
              <td>{inv.due}</td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, color: inv.agingColor }}>{inv.aging}</span>
              </td>
              <td>
                <Button variant="secondary" size="xs" onClick={() => openModal('qr-view')} style={{ gap: 4 }}>
                  <Icon name="camera" size={14} />
                  <Badge variant={inv.qrVariant} style={{ fontSize: 10 }}>
                    {inv.qr}
                  </Badge>
                </Button>
              </td>
              <td>
                <Badge variant={inv.statusVariant}>{inv.status}</Badge>
              </td>
              <td>
                {inv.status === 'Confirmed Paid' ? (
                  <Button variant="outline" size="xs" onClick={() => openModal('view-invoice')}>
                    View
                  </Button>
                ) : (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Button variant="outline" size="xs" onClick={() => openModal('view-invoice')}>
                      View
                    </Button>
                    <Button variant="secondary" size="xs" onClick={() => openModal('qr-view')} aria-label="QR Status">
                      <Icon name="camera" size={14} />
                    </Button>
                    <RoleGate show={showInvAddPay}>
                      <Button variant="secondary" size="xs" onClick={() => openModal('add-payment')}>
                        Add Payment
                      </Button>
                    </RoleGate>
                    <RoleGate show={showInvMarkPaid}>
                      <Button variant="amber" size="xs" onClick={() => openModal('mark-paid')}>
                        Mark Paid
                      </Button>
                    </RoleGate>
                    <RoleGate show={showInvConfirmPay}>
                      <Button variant="green" size="xs" onClick={() => openModal('confirm-payment')}>
                        <IconLabel icon="check" size={12}>Confirm</IconLabel>
                      </Button>
                    </RoleGate>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
