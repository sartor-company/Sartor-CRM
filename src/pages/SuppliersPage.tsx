import { Badge, Button, DataTable, KpiCard, KpiGrid, Mono, PageHead, QueryState, SearchBar } from '../components/ui';
import { catalogApi } from '../api/catalog';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate } from '../utils/format';

export default function SuppliersPage() {
  const { openModal } = useModal();
  const { data: suppliers = [], loading, error } = useApiQuery(() => catalogApi.listSuppliers(), []);

  const rows = (suppliers ?? []).map((s) => ({
    id: s._id,
    supplier: s,
    name: s.name || '—',
    category: s.product || s.branch || '—',
    contact: [s.contactName, s.contactNumber || s.phone].filter(Boolean).join(' · ') || s.email || '—',
    terms: '—',
    lastPurchase: s.restocks?.length
      ? formatDate(
          Math.max(
            ...((s.restocks as Array<{ creationDateTime?: number }>).map((r) => r.creationDateTime || 0)),
          ),
        )
      : '—',
    restockCount: s.restocks?.length ?? 0,
    productCount: s.products?.length ?? 0,
    status: (s.restocks?.length ?? 0) > 0 ? 'Active' : 'Listed',
    statusVariant: ((s.restocks?.length ?? 0) > 0 ? 'green' : 'gray') as 'green' | 'gray',
  }));

  const { search, setSearch, filtered } = useTableFilter(rows, '', (row, q) =>
    [row.name, row.category, row.contact].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="building"
        title="Supplier Management"
        subtitle="Track suppliers, purchase history, and restocks."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => openModal('raise-po')}>
              Raise PO
            </Button>
            <Button variant="green" size="sm" onClick={() => openModal('add-supplier')}>
              + Add Supplier
            </Button>
          </div>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard label="Suppliers" value={String(rows.length)} accent="green" />
        <KpiCard
          label="With restocks"
          value={String(rows.filter((r) => r.restockCount > 0).length)}
          accent="amber"
        />
        <KpiCard
          label="Linked products"
          value={String(rows.reduce((s, r) => s + r.productCount, 0))}
          accent="blue"
        />
      </KpiGrid>

      <SearchBar placeholder="Search suppliers by name or category…" value={search} onChange={setSearch} />

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No suppliers yet."
      >
        <DataTable id="supplier-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Last Restock</th>
              <th>Restocks</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.name}</strong>
                </td>
                <td>{s.category}</td>
                <td>{s.contact}</td>
                <td>{s.lastPurchase}</td>
                <td>
                  <Mono>{s.restockCount}</Mono>
                </td>
                <td>
                  <Mono>{s.productCount}</Mono>
                </td>
                <td>
                  <Badge variant={s.statusVariant}>{s.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Button
                      variant="green"
                      size="xs"
                      onClick={() => openModal('supplier-payment', { supplier: s.supplier })}
                    >
                      Record Payment
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openModal('add-supplier', { supplier: s.supplier })}
                    >
                      View / Edit
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
