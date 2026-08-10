import {
  Badge,
  Button,
  DataTable,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
  RoleGate,
  SearchBar,
} from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira } from '../utils/format';

export default function ReturnsPage() {
  const { openModal } = useModal();
  const { showInvConfirmPay } = useRoleGates();
  const { data: rows = [], loading, error } = useApiQuery(() => opsApi.listReturns(), []);

  const { search, setSearch, filtered } = useTableFilter(rows ?? [], '', (row, q) =>
    [row.returnId, row.customerName, row.invoiceId, row.reason]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const pending = (rows ?? []).filter((r) =>
    ['Logged', 'WH Receiving', 'Assessed'].includes(r.status || ''),
  ).length;
  const cnPending = (rows ?? []).filter((r) => r.status === 'Credit Note Issued').length;
  const resolved = (rows ?? []).filter((r) => ['Refunded', 'Closed'].includes(r.status || '')).length;

  return (
    <>
      <PageHead
        icon="undo"
        title="Goods Returns"
        subtitle="Customer returns, credit notes, and refund tracking."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('goods-return')}>
            + Log Return
          </Button>
        }
      />

      <InfoBanner>
        <strong>Returns flow:</strong> Log Return → WH Receives & Assesses → Issue Credit Note → Apply to Next Invoice
        or Refund.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="Pending Assessment" value={String(pending)} accent="red" />
        <KpiCard label="Credit Notes" value={String(cnPending)} accent="amber" />
        <KpiCard label="Resolved" value={String(resolved)} accent="green" />
      </KpiGrid>

      <SearchBar
        placeholder="Search by return ref, customer or invoice…"
        value={search}
        onChange={setSearch}
      />

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No goods returns logged yet."
      >
        <DataTable id="returns-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Customer</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>SKUs</th>
              <th>Reason</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Credit Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>
                  <Mono style={{ fontWeight: 700 }}>{r.returnId || r._id.slice(-6)}</Mono>
                </td>
                <td>{r.customerName || '—'}</td>
                <td>
                  <Mono style={{ fontSize: 11 }}>{r.invoiceId || '—'}</Mono>
                </td>
                <td>{formatDate(r.creationDateTime)}</td>
                <td>{r.skus || '—'}</td>
                <td>{r.reason}</td>
                <td>
                  <Badge variant={r.condition === 'Resaleable' ? 'green' : 'red'}>
                    {r.condition || '—'}
                  </Badge>
                </td>
                <td>
                  <Badge variant={r.status === 'Credit Note Issued' ? 'teal' : 'amber'}>
                    {r.status}
                  </Badge>
                </td>
                <td>
                  <Mono style={{ fontSize: 11 }}>{r.creditNote || '—'}</Mono>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openModal('goods-return', { returnRow: r })}
                    >
                      View
                    </Button>
                    <RoleGate show={showInvConfirmPay}>
                      {r.status !== 'Credit Note Issued' && r.status !== 'Closed' && (
                        <Button
                          variant="green"
                          size="xs"
                          onClick={() => openModal('credit-note', { returnRow: r })}
                        >
                          Issue CN
                        </Button>
                      )}
                      {r.creditNote && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => openModal('credit-note', { returnRow: r })}
                        >
                          Credit Note
                        </Button>
                      )}
                    </RoleGate>
                    {r.amount ? <Mono style={{ fontSize: 10 }}>{formatNaira(r.amount)}</Mono> : null}
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
