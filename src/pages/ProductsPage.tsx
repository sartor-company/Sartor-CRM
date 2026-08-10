import {
  ActionDropdown,
  Badge,
  Button,
  DataTable,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
  RoleGate,
  SearchBar,
} from '../components/ui';
import { catalogApi } from '../api/catalog';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatNaira } from '../utils/format';
import { productStockVariant } from '../utils/statusBadges';

export default function ProductsPage() {
  const { openModal } = useModal();
  const { showAddProduct, showProdEdit, showProdStock, showWhApprove, showCeoBatch } = useRoleGates();
  const { data: products = [], loading, error } = useApiQuery(() => catalogApi.listProducts(), []);

  const rows = (products ?? []).map((p) => {
    const qty = Number(p.totalQuantityAvailable ?? 0);
    const status =
      qty <= 0 || (p.status || '').toLowerCase().includes('out')
        ? 'Out of Stock'
        : qty < 100
          ? 'Low Stock'
          : p.status || 'In-Stock';
    return {
      id: p._id,
      product: p,
      sku: p.skuCode || p.productId || p.barcodeNumber || p._id.slice(-6),
      name: p.productName || '—',
      brand: p.manufacturer || '—',
      category: p.productCategory || '—',
      available: qty.toLocaleString(),
      qty,
      price: formatNaira(p.sellingPrice ?? p.price),
      status,
      statusVariant: productStockVariant(status, qty),
    };
  });

  const { search, setSearch, filtered } = useTableFilter(rows, '', (row, q) =>
    [row.sku, row.name, row.brand, row.category].some((v) => v.toLowerCase().includes(q)),
  );

  const low = rows.filter((r) => r.status === 'Low Stock').length;
  const critical = rows.filter((r) => r.status === 'Out of Stock' || r.qty < 50).length;

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
        <KpiCard label="Total SKUs" value={String(rows.length)} accent="green" />
        <KpiCard label="Low Stock" value={String(low)} accent="amber" />
        <KpiCard label="Critical / Out" value={String(critical)} accent="red" />
      </KpiGrid>

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No products in the catalog yet."
      >
        <DataTable id="prod-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Available</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
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
                  <Mono>{p.price}</Mono>
                </td>
                <td>
                  <Badge variant={p.statusVariant}>{p.status}</Badge>
                </td>
                <td>
                  <ActionDropdown
                    items={[
                      {
                        icon: 'eye',
                        label: 'View Details & Batches',
                        onClick: () => openModal('view-product', { product: p.product }),
                      },
                      {
                        icon: 'pencil',
                        label: 'Edit Product',
                        onClick: () => openModal('edit-product', { product: p.product }),
                        hidden: !showProdEdit,
                      },
                      {
                        icon: 'clipboard',
                        label: 'Receive Stock (GRN)',
                        onClick: () => openModal('grn', { product: p.product }),
                        hidden: !showProdStock,
                      },
                      {
                        icon: 'trash',
                        label: 'Write-off Expired / Damaged',
                        onClick: () => openModal('stock-writeoff', { product: p.product }),
                        hidden: !showProdStock,
                      },
                      {
                        icon: 'ban',
                        label: 'Quarantine Batch',
                        onClick: () => openModal('quarantine-batch', { product: p.product }),
                        hidden: !showProdStock,
                      },
                      {
                        icon: 'wrench',
                        label: 'Stock Adjustment (CEO)',
                        onClick: () => openModal('stock-adjust', { product: p.product }),
                        hidden: !showCeoBatch,
                      },
                      {
                        icon: 'check',
                        label: 'Approve Stock Update',
                        onClick: () => openModal('approve-stock', { product: p.product }),
                        hidden: !showWhApprove,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
