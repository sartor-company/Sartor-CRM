import { Badge, Button, DataTable, InfoBanner, KpiCard, KpiGrid, Mono, PageHead, RoleGate, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';

const RETURNS = [
  { ref: 'RET-0002', customer: 'FreshMart NG', invoice: 'INV-00042', date: '11 May 2026', skus: 'SH-25-SIL × 20', reason: 'Damaged on delivery', condition: 'Not Resaleable', conditionVariant: 'red' as const, status: 'WH Receiving', statusVariant: 'amber' as const, creditNote: '—' },
  { ref: 'RET-0001', customer: 'PharmaCare Ltd', invoice: 'INV-00038', date: '5 May 2026', skus: 'SH-25-CAR × 10', reason: 'Wrong product sent', condition: 'Resaleable', conditionVariant: 'green' as const, status: 'Credit Note Issued', statusVariant: 'teal' as const, creditNote: 'CN-0001', hasActions: true },
];

export default function ReturnsPage() {
  const { openModal } = useModal();
  const { showInvConfirmPay } = useRoleGates();
  const { search, setSearch, filtered } = useTableFilter(RETURNS, '', (row, q) =>
    [row.ref, row.customer, row.invoice].some((v) => v.toLowerCase().includes(q)),
  );

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
        or Refund. Commission is not reversed until the credit note is approved.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="Pending Assessment" value="2" accent="red" />
        <KpiCard label="Credit Notes Pending" value="1" accent="amber" />
        <KpiCard label="Resolved This Month" value="3" accent="green" />
      </KpiGrid>

      <SearchBar
        placeholder="Search by return ref, customer or invoice…"
        value={search}
        onChange={setSearch}
      />

      <DataTable id="returns-table">
        <thead>
          <tr>
            <th>Return Ref</th>
            <th>Customer</th>
            <th>Invoice</th>
            <th>Date</th>
            <th>SKUs / Qty</th>
            <th>Reason</th>
            <th>Condition</th>
            <th>Status</th>
            <th>Credit Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.ref}>
              <td>
                <Mono style={{ fontSize: 12, fontWeight: 700 }}>{r.ref}</Mono>
              </td>
              <td>{r.customer}</td>
              <td>{r.invoice}</td>
              <td>{r.date}</td>
              <td>{r.skus}</td>
              <td>{r.reason}</td>
              <td>
                <Badge variant={r.conditionVariant}>{r.condition}</Badge>
              </td>
              <td>
                <Badge variant={r.statusVariant}>{r.status}</Badge>
              </td>
              <td>
                {r.creditNote === '—' ? (
                  '—'
                ) : (
                  <Badge variant="teal" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10 }}>
                    {r.creditNote}
                  </Badge>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button variant="outline" size="xs" onClick={() => openModal('goods-return')}>
                    View
                  </Button>
                  {r.hasActions && (
                    <RoleGate show={showInvConfirmPay}>
                      <>
                        <Button variant="secondary" size="xs" onClick={() => openModal('credit-note-apply')}>
                          Apply CN
                        </Button>
                        <Button variant="outline" size="xs" onClick={() => openModal('payment-refund')}>
                          Cash Refund
                        </Button>
                      </>
                    </RoleGate>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
