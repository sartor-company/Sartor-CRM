import { Badge, Button, DataTable, IconLabel, InfoBanner, KpiCard, KpiGrid, Mono, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useTableFilter } from '../hooks/useTableFilter';

const GRN_ROWS = [
  { id: 'GRN-0004', supplier: 'West Africa Chemicals Ltd', invoice: 'WAC-2024-0891', skus: '3 SKUs · 4 batches', units: '1,800 units', value: '₦1,404,000', by: 'Amaka Obi', date: '9 May 2026', status: 'Accepted — Full', statusVariant: 'green' as const },
  { id: 'GRN-0003', supplier: 'Kemi Industries Nigeria', invoice: 'KI-2024-0612', skus: '1 SKU · 1 batch', units: '500 units', value: '₦360,000', by: 'Amaka Obi', date: '2 May 2026', status: 'Short — 50 units pending', statusVariant: 'amber' as const },
  { id: 'GRN-0002', supplier: 'West Africa Chemicals Ltd', invoice: 'WAC-2024-0612', skus: '2 SKUs · 2 batches', units: '900 units', value: '₦684,000', by: 'Musa Abdullahi', date: '20 Apr 2026', status: 'Accepted — Full', statusVariant: 'green' as const },
];

export default function GrnLogPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { search, setSearch, filtered } = useTableFilter(GRN_ROWS, '', (row, q) =>
    [row.id, row.supplier, row.invoice].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="upload"
        title="Receive Stock — GRN Log"
        subtitle="One GRN per supplier delivery. Covers all SKUs and batches in that delivery. All received stock updates inventory simultaneously on save."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('grn')}>
            + New GRN — Receive Delivery
          </Button>
        }
      />

      <InfoBanner>
        <strong>One GRN = one delivery.</strong> When stock arrives from a supplier — regardless of how many SKUs or
        batches are on the truck — open a single GRN and add all line items. This is the only way to maintain a clean
        audit trail linking every batch back to its supplier invoice and delivery date.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="GRNs This Month" value="4" accent="green" />
        <KpiCard label="Total Units Received" value="3,200" />
        <KpiCard label="Short Deliveries Logged" value="1" accent="amber" />
      </KpiGrid>

      <SearchBar placeholder="Search GRNs by number, supplier or SKU…" value={search} onChange={setSearch} />

      <DataTable id="grn-table">
        <thead>
          <tr>
            <th>GRN No.</th>
            <th>Supplier</th>
            <th>Supplier Invoice</th>
            <th>SKUs Received</th>
            <th>Total Units</th>
            <th>Total Value</th>
            <th>Received By</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((g) => (
            <tr key={g.id}>
              <td>
                <Mono style={{ fontWeight: 700 }}>{g.id}</Mono>
              </td>
              <td>{g.supplier}</td>
              <td>
                <Mono style={{ fontSize: 11 }}>{g.invoice}</Mono>
              </td>
              <td>{g.skus}</td>
              <td>
                <Mono>{g.units}</Mono>
              </td>
              <td>
                <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>{g.value}</Mono>
              </td>
              <td>{g.by}</td>
              <td>{g.date}</td>
              <td>
                <Badge variant={g.statusVariant}>{g.status}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button variant="outline" size="xs" onClick={() => openModal('grn')}>
                    View GRN
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => showToast('Downloading GRN PDF…', 'ok')}>
                    <IconLabel icon="download" size={13}>PDF</IconLabel>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
