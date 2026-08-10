import {
  Badge,
  Button,
  DataTable,
  IconLabel,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
  SearchBar,
} from '../components/ui';
import { catalogApi, type CrmProduct, type CrmSupplier } from '../api/catalog';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira, num } from '../utils/format';

export default function GrnLogPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data: restocks = [], loading, error } = useApiQuery(() => catalogApi.listRestocks(), []);

  const rows = (restocks ?? []).map((r, idx) => {
    const supplier =
      typeof r.supplier === 'object' && r.supplier
        ? (r.supplier as CrmSupplier).name || '—'
        : '—';
    const products = r.products || [];
    const units = products.reduce((s, p) => s + num(p.quantity), 0);
    const value = products.reduce((s, p) => {
      const qty = num(p.quantity);
      const price = num(p.supplyPrice ?? p.sellingPrice);
      return s + qty * price;
    }, 0);
    const skuNames = products
      .map((p) => {
        const prod = typeof p.product === 'object' && p.product ? (p.product as CrmProduct) : null;
        return prod?.productName || prod?.skuCode;
      })
      .filter(Boolean);
    return {
      id: r._id,
      grn: `GRN-${String(restocks!.length - idx).padStart(4, '0')}`,
      supplier,
      skus: `${products.length} SKU${products.length === 1 ? '' : 's'}${skuNames.length ? ` · ${skuNames.slice(0, 2).join(', ')}` : ''}`,
      units,
      value,
      date: formatDate(r.creationDateTime),
      status: 'Accepted',
      statusVariant: 'green' as const,
    };
  });

  const { search, setSearch, filtered } = useTableFilter(rows, '', (row, q) =>
    [row.grn, row.supplier, row.skus].some((v) => v.toLowerCase().includes(q)),
  );

  const totalUnits = rows.reduce((s, r) => s + r.units, 0);

  return (
    <>
      <PageHead
        icon="upload"
        title="Receive Stock — GRN Log"
        subtitle="Restock receipts from suppliers. Each restock maps to a GRN delivery."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('grn')}>
            + New GRN — Receive Delivery
          </Button>
        }
      />

      <InfoBanner>
        <strong>One GRN = one delivery.</strong> Restocks from the API are listed here as your goods-received
        history.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="GRNs" value={String(rows.length)} accent="green" />
        <KpiCard label="Total Units Received" value={totalUnits.toLocaleString()} />
        <KpiCard
          label="Total Value"
          value={formatNaira(rows.reduce((s, r) => s + r.value, 0))}
          accent="amber"
          smallValue
        />
      </KpiGrid>

      <SearchBar placeholder="Search GRNs by number, supplier or SKU…" value={search} onChange={setSearch} />

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No restocks / GRNs recorded yet."
      >
        <DataTable id="grn-table">
          <thead>
            <tr>
              <th>GRN No.</th>
              <th>Supplier</th>
              <th>SKUs Received</th>
              <th>Total Units</th>
              <th>Total Value</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id}>
                <td>
                  <Mono style={{ fontWeight: 700 }}>{g.grn}</Mono>
                </td>
                <td>{g.supplier}</td>
                <td>{g.skus}</td>
                <td>
                  <Mono>{g.units.toLocaleString()}</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>{formatNaira(g.value)}</Mono>
                </td>
                <td>{g.date}</td>
                <td>
                  <Badge variant={g.statusVariant}>{g.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="outline" size="xs" onClick={() => openModal('grn')}>
                      View GRN
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => showToast('Downloading GRN PDF…', 'ok')}
                    >
                      <IconLabel icon="download" size={13}>
                        PDF
                      </IconLabel>
                    </Button>
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
