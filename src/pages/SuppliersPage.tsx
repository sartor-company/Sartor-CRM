import { Badge, Button, DataTable, KpiCard, KpiGrid, Mono, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useTableFilter } from '../hooks/useTableFilter';

const SUPPLIERS = [
  { name: 'West Africa Chemicals Ltd', category: 'Raw Materials', contact: 'Kehinde Afolabi · +234 806 234 5678', terms: 'Net 30', lastPurchase: '12 May 2026', owed: '₦720,000', overdue: '₦480,000', owedColor: 'var(--at)', overdueColor: 'var(--rt)', status: 'Overdue', statusVariant: 'red' as const },
  { name: 'Kemi Industries Nigeria', category: 'Packaging', contact: 'Funmilayo Osei · +234 703 445 8821', terms: 'Net 15', lastPurchase: '2 May 2026', owed: '₦280,000', overdue: '₦0', owedColor: 'var(--N)', overdueColor: 'var(--Gd)', status: 'Current', statusVariant: 'green' as const },
  { name: 'AromaChem West Africa', category: 'Fragrances / Actives', contact: 'Tobi Fasanya · +234 812 009 3441', terms: 'Cash on Delivery', lastPurchase: '20 Apr 2026', owed: '₦0', overdue: '₦0', owedColor: 'var(--Gd)', overdueColor: 'var(--Gd)', status: 'Settled', statusVariant: 'green' as const, historyOnly: true },
];

export default function SuppliersPage() {
  const { openModal } = useModal();
  const { search, setSearch, filtered } = useTableFilter(SUPPLIERS, '', (row, q) =>
    [row.name, row.category].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="building"
        title="Supplier Management"
        subtitle="Track suppliers, purchase history, and amounts owed."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('add-supplier')}>
            + Add Supplier
          </Button>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard label="Total Owed to Suppliers" value="₦1.2M" trend="3 suppliers" accent="red" smallValue />
        <KpiCard label="Overdue (30+ days)" value="₦480K" accent="amber" smallValue />
        <KpiCard label="Paid This Month" value="₦640K" accent="green" smallValue />
      </KpiGrid>

      <SearchBar placeholder="Search suppliers by name or category…" value={search} onChange={setSearch} />

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
            <tr key={s.name}>
              <td>
                <strong>{s.name}</strong>
              </td>
              <td>{s.category}</td>
              <td>{s.contact}</td>
              <td>{s.terms}</td>
              <td>{s.lastPurchase}</td>
              <td>
                <Mono style={{ fontWeight: 700, color: s.owedColor }}>{s.owed}</Mono>
              </td>
              <td>
                <Mono style={{ color: s.overdueColor }}>{s.overdue}</Mono>
              </td>
              <td>
                <Badge variant={s.statusVariant}>{s.status}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {!s.historyOnly && (
                    <Button variant="green" size="xs" onClick={() => openModal('supplier-payment')}>
                      Record Payment
                    </Button>
                  )}
                  <Button variant={s.historyOnly ? 'secondary' : 'outline'} size="xs" onClick={() => openModal('add-supplier')}>
                    {s.historyOnly ? 'View History' : 'View / Edit'}
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
