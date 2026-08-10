import { Badge, Button, DataTable, InfoBanner, KpiCard, KpiGrid, Mono, PageHead, RoleGate, SearchBar } from '../components/ui';
import { crmApi, leadName, refName, type CommissionRow } from '../api/crm';
import { teamApi } from '../api/team';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../store/authStore';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira, num } from '../utils/format';
import { invoiceStatusVariant } from '../utils/statusBadges';

export default function CommissionsPage() {
  const { openModal } = useModal();
  const { showInvConfirmPay } = useRoleGates();
  const user = useAuthStore((s) => s.user);

  const { data: config } = useApiQuery(() => crmApi.getCommissionConfig(), []);
  const { data: rows, loading, error, reload } = useApiQuery(async () => {
    // Prefer team-wide view when admin can list users; otherwise current user only.
    try {
      const users = await teamApi.listUsers();
      const lists = await Promise.all(
        users.filter((u) => !u.isOwner).map(async (u) => {
          try {
            const items = await crmApi.listUserCommissions(u._id);
            return items.map((row) => ({ ...row, _repName: u.fullName || refName(row.user) }));
          } catch {
            return [] as Array<CommissionRow & { _repName?: string }>;
          }
        }),
      );
      return lists.flat();
    } catch {
      if (!user?._id) return [] as Array<CommissionRow & { _repName?: string }>;
      const items = await crmApi.listUserCommissions(user._id);
      return items.map((row) => ({ ...row, _repName: user.displayName || user.fullName }));
    }
  }, [user?._id]);

  const commissions = rows ?? [];
  const { search, setSearch, filtered } = useTableFilter(commissions, '', (row, q) =>
    [
      row._repName,
      row.invoiceId,
      leadName(typeof row.lead === 'object' ? row.lead : null),
      row.status,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const totalEarned = commissions.reduce((s, c) => s + num(c.earned), 0);
  const rateLabel = config?.price ? `÷ ${config.price}` : '—';

  return (
    <>
      <PageHead
        icon="dollar"
        title="Commissions"
        subtitle="Calculated on confirmed invoices only."
        actions={
          <Button variant="secondary" size="sm">
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

      <KpiGrid cols={3}>
        <KpiCard label="Total Earned" value={formatNaira(totalEarned)} smallValue />
        <KpiCard label="Rate Config" value={rateLabel} accent="green" smallValue />
        <KpiCard label="Entries" value={String(commissions.length)} accent="amber" />
      </KpiGrid>

      <SearchBar placeholder="Search by rep, invoice or customer…" value={search} onChange={setSearch} />

      <DataTable id="comm-table">
        <thead>
          <tr>
            <th>Rep</th>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Confirmed Amount</th>
            <th>Rate</th>
            <th>Commission</th>
            <th>Date</th>
            <th>Status</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {loading && !rows ? (
            <tr>
              <td colSpan={9} style={{ color: 'var(--tx3)' }}>
                Loading commissions…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ color: 'var(--tx3)' }}>
                No commission entries found.
              </td>
            </tr>
          ) : (
            filtered.map((c) => (
              <tr key={c.commissionID || c._id}>
                <td>{c._repName || refName(c.user)}</td>
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
                <td>{formatDate(c.creationDateTime || c.dueDate)}</td>
                <td>
                  <Badge variant={invoiceStatusVariant(c.status)}>{c.status || '—'}</Badge>
                </td>
                <td>
                  <RoleGate show={showInvConfirmPay}>
                    <Button variant="green" size="xs" onClick={() => openModal('commission-payout')}>
                      Mark Paid Out
                    </Button>
                  </RoleGate>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </>
  );
}
