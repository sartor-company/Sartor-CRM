import { Badge, DataTable, InfoBanner, KpiCard, KpiGrid, Mono, PageHead, SearchBar } from '../components/ui';
import { crmApi, leadName, refName } from '../api/crm';
import { useAuthStore } from '../store/authStore';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatMonth, formatNaira, num } from '../utils/format';
import { inThisMonth, isPaid } from '../utils/invoice';
import { invoiceStatusVariant } from '../utils/statusBadges';

export default function MyCommissionsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: config } = useApiQuery(() => crmApi.getCommissionConfig(), []);
  const { data, loading, error, reload } = useApiQuery(async () => {
    if (!user?._id) return [];
    return crmApi.listUserCommissions(user._id);
  }, [user?._id]);

  const rows = data ?? [];
  const { search, setSearch, filtered } = useTableFilter(rows, '', (row, q) =>
    [row.invoiceId, row.name, leadName(typeof row.lead === 'object' ? row.lead : null), row.status]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const totalDue = rows.reduce((s, c) => s + num(c.earned), 0);
  const thisMonth = rows.filter((c) => inThisMonth(c.creationDateTime || c.dueDate)).reduce((s, c) => s + num(c.earned), 0);
  const paidYtd = rows.filter(isPaid).reduce((s, c) => s + num(c.earned), 0);
  const rateLabel = config?.price ? `${config.price}%` : '—';
  const monthLabel = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <>
      <PageHead icon="dollar" title="My Commissions" />

      {error && (
        <InfoBanner variant="err" style={{ marginBottom: 12 }}>
          {error}{' '}
          <button type="button" className="ca" onClick={() => void reload()}>
            Retry
          </button>
        </InfoBanner>
      )}

      <div className="comm-card mb">
        <div className="comm-card-rate">{rateLabel} Rate</div>
        <div className="comm-card-lbl">Total Due — {monthLabel}</div>
        <div className="comm-card-amt">{loading ? '…' : formatNaira(thisMonth || totalDue)}</div>
        <div className="comm-card-sub">From {rows.length} CEO/Finance-confirmed invoice{rows.length === 1 ? '' : 's'}</div>
      </div>

      <KpiGrid cols={3}>
        <KpiCard label="This Month" value={formatNaira(thisMonth)} accent="green" smallValue />
        <KpiCard label="YTD" value={formatNaira(totalDue)} smallValue />
        <KpiCard label="Paid Out YTD" value={formatNaira(paidYtd)} accent="blue" smallValue />
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
          {loading && !data ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                Loading commissions…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                No commission entries yet.
              </td>
            </tr>
          ) : (
            filtered.map((c) => (
              <tr key={c.commissionID || c._id}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{c.invoiceId || c._id.slice(-6)}</Mono>
                </td>
                <td>{c.name || leadName(typeof c.lead === 'object' ? c.lead : null)}</td>
                <td>
                  <Mono>{formatNaira(num(c.totalAmount))}</Mono>
                </td>
                <td>{rateLabel}</td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>{formatNaira(num(c.earned))}</Mono>
                </td>
                <td>{refName(c.admin) || refName(c.user) || '—'}</td>
                <td>{formatMonth(c.creationDateTime || c.dueDate)}</td>
                <td>
                  <Badge variant={invoiceStatusVariant(c.status)}>
                    {isPaid(c) ? 'Paid Out' : 'Confirmed'}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </>
  );
}
