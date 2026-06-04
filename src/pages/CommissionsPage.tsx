import { Badge, Button, DataTable, KpiCard, KpiGrid, Mono, PageHead, RoleGate, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';

const COMMISSIONS = [
  { rep: 'Abubakar Idah', invoice: 'INV-00040', amount: '₦96,000', rate: '3.5%', commission: '₦3,360', month: 'May 2026', status: 'Confirmed', statusVariant: 'green' as const },
  { rep: 'Emmanuel Batimehin', invoice: 'INV-00038', amount: '₦144,000', rate: '2.5%', commission: '₦3,600', month: 'May 2026', status: 'Pending Payout', statusVariant: 'amber' as const },
];

export default function CommissionsPage() {
  const { openModal } = useModal();
  const { showInvConfirmPay } = useRoleGates();
  const { search, setSearch, filtered } = useTableFilter(COMMISSIONS, '', (row, q) =>
    [row.rep, row.invoice, row.month].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="dollar"
        title="Commissions"
        subtitle="Calculated on CEO/Finance-confirmed invoices only."
        actions={
          <Button variant="secondary" size="sm">
            Export
          </Button>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard label="Due This Month" value="₦42,200" smallValue />
        <KpiCard label="Paid Out" value="₦13,500" accent="green" smallValue />
        <KpiCard label="Outstanding" value="₦28,700" accent="amber" smallValue />
      </KpiGrid>

      <SearchBar placeholder="Search by rep, invoice or month…" value={search} onChange={setSearch} />

      <DataTable id="comm-table">
        <thead>
          <tr>
            <th>Rep</th>
            <th>Invoice</th>
            <th>Confirmed Amount</th>
            <th>Rate</th>
            <th>Commission</th>
            <th>Month</th>
            <th>Status</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.invoice}>
              <td>{c.rep}</td>
              <td>
                <Mono style={{ fontSize: 12 }}>{c.invoice}</Mono>
              </td>
              <td>
                <Mono>{c.amount}</Mono>
              </td>
              <td>{c.rate}</td>
              <td>
                <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>{c.commission}</Mono>
              </td>
              <td>{c.month}</td>
              <td>
                <Badge variant={c.statusVariant}>{c.status}</Badge>
              </td>
              <td>
                <RoleGate show={showInvConfirmPay}>
                  <Button variant="green" size="xs" onClick={() => openModal('commission-payout')}>
                    Mark Paid Out
                  </Button>
                </RoleGate>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
