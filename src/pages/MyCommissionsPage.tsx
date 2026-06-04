import { Badge, DataTable, KpiCard, KpiGrid, Mono, PageHead, SearchBar } from '../components/ui';
import { useTableFilter } from '../hooks/useTableFilter';

const MY_COMMISSIONS = [
  { invoice: 'INV-00040', customer: 'HealthPlus', amount: '₦96,000', rate: '3.5%', commission: '₦3,360', confirmedBy: 'Nwachukwu C. (CEO)', month: 'May 2026', status: 'Confirmed', statusVariant: 'green' as const },
  { invoice: 'INV-00036', customer: 'City Pharmacy', amount: '₦72,000', rate: '3.5%', commission: '₦2,520', confirmedBy: 'Okeke David (Finance)', month: 'Apr 2026', status: 'Paid Out', statusVariant: 'green' as const },
];

export default function MyCommissionsPage() {
  const { search, setSearch, filtered } = useTableFilter(MY_COMMISSIONS, '', (row, q) =>
    [row.invoice, row.customer, row.month].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead icon="dollar" title="My Commissions" />

      <div className="comm-card mb">
        <div className="comm-card-rate">3.5% Rate</div>
        <div className="comm-card-lbl">Total Due — May 2026</div>
        <div className="comm-card-amt">₦28,700</div>
        <div className="comm-card-sub">From 5 CEO/Finance-confirmed invoices</div>
      </div>

      <KpiGrid cols={3}>
        <KpiCard label="This Month" value="₦28,700" accent="green" smallValue />
        <KpiCard label="YTD" value="₦112,400" smallValue />
        <KpiCard label="Paid Out YTD" value="₦83,700" accent="blue" smallValue />
      </KpiGrid>

      <SearchBar placeholder="Search commission history…" value={search} onChange={setSearch} />

      <DataTable id="mycomm-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Rate</th>
            <th>Commission</th>
            <th>Confirmed By</th>
            <th>Month</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.invoice}>
              <td>
                <Mono style={{ fontSize: 12 }}>{c.invoice}</Mono>
              </td>
              <td>{c.customer}</td>
              <td>
                <Mono>{c.amount}</Mono>
              </td>
              <td>{c.rate}</td>
              <td>
                <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>{c.commission}</Mono>
              </td>
              <td>{c.confirmedBy}</td>
              <td>{c.month}</td>
              <td>
                <Badge variant={c.statusVariant}>{c.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
