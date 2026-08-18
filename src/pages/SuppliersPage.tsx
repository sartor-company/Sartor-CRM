import { Badge, Button, DataTable, KpiCard, KpiGrid, Mono, PageHead, QueryState, SearchBar } from '../components/ui';
import { catalogApi } from '../api/catalog';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira, num } from '../utils/format';

export default function SuppliersPage() {
  const { openModal } = useModal();
  const { data, loading, error } = useApiQuery(async () => {
    const [suppliers, restocks] = await Promise.all([
      catalogApi.listSuppliers(),
      catalogApi.listRestocks().catch(() => []),
    ]);
    return { suppliers, restocks };
  }, []);

  const restocks = data?.restocks ?? [];
  const rows = (data?.suppliers ?? []).map((s) => {
    const mine = restocks.filter((r) => {
      const sid = typeof r.supplier === 'object' && r.supplier ? r.supplier._id : r.supplier;
      return sid === s._id;
    });
    const owed = mine.reduce((sum, r) => {
      const products = r.products || [];
      return (
        sum +
        products.reduce((ls, p) => ls + num(p.quantity) * num(p.supplyPrice ?? p.sellingPrice), 0)
      );
    }, 0);
    return {
      id: s._id,
      supplier: s,
      name: s.name || '—',
      category: s.product || s.branch || '—',
      contact: [s.contactName, s.contactNumber || s.phone].filter(Boolean).join(' · ') || s.email || '—',
      terms: 'Net 30',
      lastPurchase: mine.length
        ? formatDate(Math.max(...mine.map((r) => r.creationDateTime || 0)))
        : '—',
      restockCount: mine.length || s.restocks?.length || 0,
      productCount: s.products?.length ?? 0,
      owed,
      overdue: 0,
      status: (mine.length || s.restocks?.length || 0) > 0 ? 'Active' : 'Listed',
      statusVariant: ((mine.length || s.restocks?.length || 0) > 0 ? 'green' : 'gray') as 'green' | 'gray',
    };
  });

  const { search, setSearch, filtered } = useTableFilter(rows, '', (row, q) =>
    [row.name, row.category, row.contact].some((v) => v.toLowerCase().includes(q)),
  );

  const totalOwed = rows.reduce((s, r) => s + r.owed, 0);

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
        <KpiCard label="Total Purchases" value={formatNaira(totalOwed)} accent="green" smallValue />
        <KpiCard label="Overdue (30+)" value={formatNaira(0)} accent="amber" smallValue />
        <KpiCard
          label="Suppliers"
          value={String(rows.length)}
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
              <th>Payment Terms</th>
              <th>Last Purchase</th>
              <th>Total Owed</th>
              <th>Overdue</th>
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
                <td>{s.terms}</td>
                <td>{s.lastPurchase}</td>
                <td>
                  <Mono>{formatNaira(s.owed)}</Mono>
                </td>
                <td>
                  <Mono style={{ color: s.overdue ? 'var(--at)' : 'var(--Gd)' }}>{formatNaira(s.overdue)}</Mono>
                </td>
                <td>
                  <Badge variant={s.statusVariant}>{s.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.owed > 0 ? (
                      <Button
                        variant="green"
                        size="xs"
                        onClick={() => openModal('supplier-payment', { supplier: s.supplier })}
                      >
                        Record Payment
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('add-supplier', { supplier: s.supplier })}
                      >
                        View History
                      </Button>
                    )}
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
