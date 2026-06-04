import { ActionDropdown, Badge, Button, DataTable, KpiCard, KpiGrid, Mono, PageHead, RoleGate, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { MOCK_PRODUCTS } from '../data/mock';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';

const PRODUCT_ROWS = [
  { ...MOCK_PRODUCTS[0], brand: 'SartorShield', available: '2,340', committed: '120', price: '₦1,200', status: 'OK', statusVariant: 'green' as const },
  { ...MOCK_PRODUCTS[1], brand: 'SartorShield', available: '380', committed: '60', price: '₦1,000', status: 'Low Stock', statusVariant: 'amber' as const },
  { ...MOCK_PRODUCTS[2], brand: 'SartorShield', available: '85', committed: '0', price: '₦1,800', status: 'Critical', statusVariant: 'red' as const },
];

export default function ProductsPage() {
  const { openModal } = useModal();
  const { showAddProduct, showProdEdit, showProdStock, showWhApprove, showCeoBatch } = useRoleGates();
  const { search, setSearch, filtered } = useTableFilter(PRODUCT_ROWS, '', (row, q) =>
    [row.sku, row.name, row.brand, row.category].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="package"
        title="Product Catalog"
        actions={
          <RoleGate show={showAddProduct}>
            <Button variant="green" size="sm" onClick={() => openModal('add-product')}>
              + Add Product
            </Button>
          </RoleGate>
        }
      />

      <SearchBar
        placeholder="Search by SKU, name, brand, manufacturer or category…"
        value={search}
        onChange={setSearch}
      />

      <KpiGrid cols={3}>
        <KpiCard label="Total SKUs" value="4" accent="green" />
        <KpiCard label="Low Stock" value="2" accent="amber" />
        <KpiCard label="Critical / Expiring" value="1" accent="red" />
      </KpiGrid>

      <DataTable id="prod-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Available</th>
            <th>Committed</th>
            <th>Selling Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.sku}>
              <td>
                <Mono style={{ fontSize: 12 }}>{p.sku}</Mono>
              </td>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>
                <Mono>{p.available}</Mono>
              </td>
              <td>
                <Mono style={{ color: 'var(--at)' }}>{p.committed}</Mono>
              </td>
              <td>
                <Mono>{p.price}</Mono>
              </td>
              <td>
                <Badge variant={p.statusVariant}>{p.status}</Badge>
              </td>
              <td>
                <ActionDropdown
                  items={[
                    { icon: 'eye', label: 'View Details & Batches', onClick: () => openModal('view-product') },
                    { icon: 'pencil', label: 'Edit Product', onClick: () => openModal('edit-product'), hidden: !showProdEdit },
                    { icon: 'clipboard', label: 'Receive Stock (GRN)', onClick: () => openModal('grn'), hidden: !showProdStock },
                    { icon: 'trash', label: 'Write-off Expired / Damaged', onClick: () => openModal('stock-writeoff'), hidden: !showProdStock },
                    { icon: 'ban', label: 'Quarantine Batch', onClick: () => openModal('quarantine-batch'), hidden: !showProdStock },
                    { icon: 'wrench', label: 'Stock Adjustment (CEO)', onClick: () => openModal('stock-adjust'), hidden: !showCeoBatch },
                    { icon: 'check', label: 'Approve Stock Update', onClick: () => openModal('approve-stock'), hidden: !showWhApprove },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
