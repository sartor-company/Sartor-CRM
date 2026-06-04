import { Badge, Button, DataTable, Mono, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useTableFilter } from '../hooks/useTableFilter';

const PACK_ROWS = [
  { id: 'LPO-0039', customer: 'Konga Health', skus: '2 SKUs', qty: '180 units', amount: '₦236,000', assigned: '8 May 2026', status: 'Assigned', statusVariant: 'blue' as const, action: 'Pack LPO', actionVariant: 'green' as const },
  { id: 'LPO-0036', customer: 'SafeZone Pharma', skus: '2 SKUs', qty: '120 units', amount: '₦144,000', assigned: '6 May 2026', status: 'In Progress', statusVariant: 'amber' as const, action: 'Continue', actionVariant: 'secondary' as const },
];

export default function PackLposPage() {
  const { openModal } = useModal();
  const { search, setSearch, filtered } = useTableFilter(PACK_ROWS, '', (row, q) =>
    [row.id, row.customer].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="package"
        title="Pack LPOs"
        subtitle="Select batches and quantities. Stock committed on save; deducted on delivery confirmation."
      />

      <SearchBar placeholder="Search LPOs to pack…" value={search} onChange={setSearch} />

      <DataTable id="pack-table">
        <thead>
          <tr>
            <th>LPO No.</th>
            <th>Customer</th>
            <th>SKUs</th>
            <th>Total Qty</th>
            <th>Amount</th>
            <th>Assigned</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td>
                <Mono style={{ fontSize: 12 }}>{row.id}</Mono>
              </td>
              <td>{row.customer}</td>
              <td>{row.skus}</td>
              <td>{row.qty}</td>
              <td>
                <Mono>{row.amount}</Mono>
              </td>
              <td>{row.assigned}</td>
              <td>
                <Badge variant={row.statusVariant}>{row.status}</Badge>
              </td>
              <td>
                <Button variant={row.actionVariant} size="sm" onClick={() => openModal('pack-lpo')}>
                  {row.action}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
