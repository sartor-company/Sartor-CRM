import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { ActionDropdown } from '../components/ui/ActionDropdown';
import type { ApiBatch, ApiProduct } from '../api/catalog';
import { catalogApi } from '../api/catalog';
import { opsApi, type OpsLpoRow } from '../api/ops';
import { useLiveOptions, productSku } from '../hooks/useLiveOptions';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatMonth, formatNaira, num } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

function dash(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  return String(value);
}

function refName(value: { name?: string } | string | null | undefined) {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  return value.name || '—';
}

function productWarehouseLabel(p: ApiProduct) {
  if (p.warehouseLabel) return p.warehouseLabel;
  if (p.warehouse && typeof p.warehouse === 'object') return p.warehouse.name || '—';
  const fromBatches = [
    ...new Set(
      (p.batches || [])
        .map((b) => (b.warehouse && typeof b.warehouse === 'object' ? b.warehouse.name : null))
        .filter(Boolean),
    ),
  ];
  return fromBatches.join(', ') || '—';
}

function productLicence(p: ApiProduct) {
  return p.licenceNumber || p.regulatoryLicences?.[0]?.number || '—';
}

function toDateInputValue(value?: number | string | null): string {
  if (value == null || value === '') return '';
  const d = typeof value === 'number' ? new Date(value) : new Date(String(value));
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function ProductModals() {
  const { isOpen, closeModal, openModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { showAddProduct, showProdEdit, showProdStock, showCeoBatch } = useRoleGates();
  const { warehouses } = useLiveOptions(
    isOpen('pack-lpo') ||
      isOpen('add-batch') ||
      isOpen('add-product') ||
      isOpen('edit-product') ||
      isOpen('view-product'),
  );
  const packWarehouseRef = useRef<HTMLSelectElement>(null);
  const addNameRef = useRef<HTMLInputElement>(null);
  const addMfgRef = useRef<HTMLInputElement>(null);
  const addBrandRef = useRef<HTMLInputElement>(null);
  const addCatRef = useRef<HTMLSelectElement>(null);
  const addOriginRef = useRef<HTMLInputElement>(null);
  const addLicenceRef = useRef<HTMLInputElement>(null);
  const addPriceRef = useRef<HTMLInputElement>(null);
  const addPurchaseRef = useRef<HTMLInputElement>(null);
  const addReorderRef = useRef<HTMLInputElement>(null);
  const addWhRef = useRef<HTMLSelectElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  const editMfgRef = useRef<HTMLInputElement>(null);
  const editBrandRef = useRef<HTMLInputElement>(null);
  const editCatRef = useRef<HTMLInputElement>(null);
  const editOriginRef = useRef<HTMLInputElement>(null);
  const editLicenceRef = useRef<HTMLInputElement>(null);
  const editPriceRef = useRef<HTMLInputElement>(null);
  const editReorderRef = useRef<HTMLInputElement>(null);

  const viewProduct = getPayload<{ product?: ApiProduct }>('view-product')?.product;
  const editProduct =
    getPayload<{ product?: ApiProduct }>('edit-product')?.product ?? viewProduct;
  const approveProduct = getPayload<{ product?: ApiProduct }>('approve-stock')?.product;
  const packPayload = getPayload<{ lpo?: OpsLpoRow; warehouseId?: string }>('pack-lpo');
  const batchPayload = getPayload<{ product?: ApiProduct; batch?: ApiBatch }>('add-batch');
  const editBatch = batchPayload?.batch;
  const batchProduct = batchPayload?.product ?? viewProduct ?? editProduct;
  const [detailProduct, setDetailProduct] = useState<ApiProduct | null>(null);

  const viewOpen = isOpen('view-product');
  useEffect(() => {
    if (!viewOpen || !viewProduct?._id) {
      setDetailProduct(null);
      return;
    }
    let cancelled = false;
    void catalogApi
      .getProduct(viewProduct._id)
      .then((p) => {
        if (!cancelled) setDetailProduct(p);
      })
      .catch(() => {
        if (!cancelled) setDetailProduct(viewProduct);
      });
    return () => {
      cancelled = true;
    };
  }, [viewOpen, viewProduct?._id]);

  const shown = detailProduct || viewProduct;

  const viewSku = shown ? productSku(shown) : null;
  const viewName = shown?.productName || 'Select a product';
  const viewTitle = viewSku ? `${viewSku} — ${viewName}` : 'Select a product';
  const availableQty = Number(shown?.totalQuantityAvailable ?? 0);
  const committedQty = Number(shown?.committedQuantity ?? 0);
  const qtyIn = Number(shown?.totalQuantityIn ?? availableQty + committedQty);
  const uncommittedQty = Math.max(0, availableQty - committedQty);
  const sellingPrice = num(shown?.sellingPrice ?? shown?.price);
  const purchasePrice = num(shown?.defaultPurchasePrice ?? shown?.supplyPrice);
  const margin = sellingPrice - purchasePrice;
  const marginPct = sellingPrice > 0 ? Math.round((margin / sellingPrice) * 100) : 0;
  const reorderLevel = Number(shown?.reorderLevel ?? 100);
  const stockStatus =
    availableQty <= 0
      ? { label: 'Out of Stock', variant: 'red' as const }
      : availableQty < reorderLevel
        ? { label: 'Low Stock — Below Reorder Level', variant: 'amber' as const }
        : { label: 'OK — Above Reorder Level', variant: 'green' as const };
  const batches: ApiBatch[] = shown?.batches ?? [];
  const expiredBatch = batches.find((b) => Number(b.expiryDate || 0) > 0 && Number(b.expiryDate) < Date.now());

  const savePack = async (btn: HTMLButtonElement | null) => {
    const lpo = packPayload?.lpo;
    const warehouse = packWarehouseRef.current?.value || packPayload?.warehouseId || '';
    if (!lpo?._id) {
      showToast('Open Pack from an LPO in the pack queue.', 'err');
      return;
    }
    if (!warehouse) {
      showToast('Select the warehouse packing this LPO.', 'err');
      return;
    }
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Packing…';
    }
    try {
      await opsApi.packLpo(lpo._id, warehouse);
      closeModal('pack-lpo');
      showToast('LPO packed. Stock deducted from the selected warehouse.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Pack failed', 'err');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig || 'Save Pack & Commit Stock →';
      }
    }
  };

  const saveAddProduct = async (btn: HTMLButtonElement | null) => {
    const productName = addNameRef.current?.value.trim() || '';
    const manufacturer = addMfgRef.current?.value.trim() || '';
    const sellingPrice = Number(addPriceRef.current?.value);
    if (!productName || !manufacturer || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      showToast('Product name, manufacturer and selling price are required.', 'err');
      return;
    }
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }
    try {
      await catalogApi.createProduct({
        productName,
        manufacturer,
        brandOwner: addBrandRef.current?.value.trim() || manufacturer,
        productCategory: addCatRef.current?.value || undefined,
        countryOfOrigin: addOriginRef.current?.value.trim() || undefined,
        licenceNumber: addLicenceRef.current?.value.trim() || undefined,
        sellingPrice,
        defaultPurchasePrice: Number(addPurchaseRef.current?.value) || undefined,
        reorderLevel: Number(addReorderRef.current?.value) || undefined,
        warehouse: addWhRef.current?.value || undefined,
      });
      closeModal('add-product');
      showToast('Product added to catalog.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to add product', 'err');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig || 'Add Product';
      }
    }
  };

  const saveEditProduct = async (btn: HTMLButtonElement | null) => {
    if (!editProduct?._id) {
      showToast('Select a product to edit.', 'err');
      return;
    }
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }
    try {
      await catalogApi.updateProduct(editProduct._id, {
        productName: editNameRef.current?.value.trim() || editProduct.productName,
        manufacturer: editMfgRef.current?.value.trim() || undefined,
        brandOwner: editBrandRef.current?.value.trim() || undefined,
        productCategory: editCatRef.current?.value.trim() || undefined,
        countryOfOrigin: editOriginRef.current?.value.trim() || undefined,
        licenceNumber: editLicenceRef.current?.value.trim() || undefined,
        sellingPrice: Number(editPriceRef.current?.value) || undefined,
        reorderLevel: Number(editReorderRef.current?.value) || undefined,
      });
      closeModal('edit-product');
      showToast('Product updated.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update product', 'err');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig || 'Save Changes';
      }
    }
  };

  return (
    <>
      <SartorModal
        id="view-product"
        open={isOpen('view-product')}
        onClose={() => closeModal('view-product')}
        title={viewTitle}
        subtitle={
          viewProduct
            ? 'Full product details, pricing, and batch inventory'
            : 'Open a product from the catalog to view details'
        }
        size="xwide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-product')}>
              Close
            </Button>
            <RoleGate show={showProdEdit && !!shown}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('view-product');
                  openModal('edit-product', { product: shown });
                }}
              >
                Edit Product
              </Button>
            </RoleGate>
          </>
        }
      >
        {!shown ? (
          <InfoBanner>No product selected. Open this modal from the product catalog.</InfoBanner>
        ) : (
          <>
            <div className="g2" style={{ marginBottom: 0 }}>
              <div className="card cp" style={{ marginBottom: 14 }}>
                <div className="ch">
                  <span className="ct">Product Metadata</span>
                </div>
                <IRow
                  label="SKU"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{viewSku}</span>
                  }
                />
                <IRow label="Product Name" value={viewName} />
                <IRow label="Brand Owner" value={dash(shown.brandOwner || shown.manufacturer)} />
                <IRow label="Manufacturer" value={dash(shown.manufacturer)} />
                <IRow label="Category" value={dash(shown.productCategory)} />
                <IRow
                  label="Country of Origin"
                  value={dash(shown.countryOfOrigin || shown.regulatoryLicences?.[0]?.country)}
                />
                <IRow
                  label="Licence Number"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>{productLicence(shown)}</span>
                  }
                />
                <IRow label="Warehouse" value={productWarehouseLabel(shown)} />
              </div>
              <div className="card cp" style={{ marginBottom: 14 }}>
                <div className="ch">
                  <span className="ct">Pricing & Stock Summary</span>
                </div>
                <IRow
                  label="Selling Price"
                  value={
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontWeight: 700,
                        color: 'var(--N)',
                        fontSize: 16,
                      }}
                    >
                      {formatNaira(sellingPrice)}
                    </span>
                  }
                />
                <IRow
                  label="Default Purchase Price"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(purchasePrice)}</span>
                  }
                />
                <IRow
                  label="Gross Margin"
                  value={
                    <span style={{ fontWeight: 700, color: 'var(--Gd)' }}>
                      {formatNaira(margin)} ({marginPct}%)
                    </span>
                  }
                />
                <div style={{ height: 1, background: 'var(--brd)', margin: '10px 0' }} />
                <IRow
                  label="Total Qty In"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>
                      {qtyIn.toLocaleString()} units
                    </span>
                  }
                />
                <IRow
                  label="Available Stock"
                  value={
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontWeight: 700,
                        color: 'var(--Gd)',
                      }}
                    >
                      {availableQty.toLocaleString()} units
                    </span>
                  }
                />
                <IRow
                  label="Committed Qty"
                  value={
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontWeight: 700,
                        color: 'var(--at)',
                      }}
                    >
                      {committedQty.toLocaleString()} units
                    </span>
                  }
                />
                <IRow
                  label="Uncommitted Qty"
                  value={
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontWeight: 700,
                        color: 'var(--Gd)',
                      }}
                    >
                      {uncommittedQty.toLocaleString()} units
                    </span>
                  }
                />
                <IRow
                  label="Reorder Level"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>
                      {reorderLevel.toLocaleString()} units
                    </span>
                  }
                />
                <IRow
                  label="Stock Status"
                  value={<Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SDivLabel style={{ margin: 0 }}>Inventory Batches — Full Traceability</SDivLabel>
              <RoleGate show={showProdStock}>
                <Button
                  variant="green"
                  size="sm"
                  onClick={() => {
                    closeModal('view-product');
                    openModal('add-batch', { product: shown });
                  }}
                >
                  + Add Batch
                </Button>
              </RoleGate>
            </div>
            {batches.length === 0 ? (
              <InfoBanner>
                No batches for this SKU yet. Receive stock (GRN) or add a batch to start traceability.
              </InfoBanner>
            ) : (
              <div className="tw">
                <table className="batch-table">
                  <thead>
                    <tr>
                      <th>Batch No.</th>
                      <th>Mfg Date</th>
                      <th>Exp Date</th>
                      <th>Qty In</th>
                      <th>Available</th>
                      <th>Committed</th>
                      <th>Uncommitted</th>
                      <th>Supplier</th>
                      <th>Supplier Invoice</th>
                      <th>Purchase Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => {
                      const qty = Number(b.quantity || 0);
                      const received = Number(b.quantityReceived || b.quantity || 0);
                      const expired = Number(b.expiryDate || 0) > 0 && Number(b.expiryDate) < Date.now();
                      const pct = received > 0 ? Math.min(100, Math.round((qty / received) * 100)) : 100;
                      return (
                        <tr key={b._id} style={expired ? { background: 'rgba(239,68,68,.03)' } : undefined}>
                          <td>
                            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                              {b.batchNumber || b._id.slice(-6)}
                            </span>
                          </td>
                          <td>{formatMonth(b.manufactureDate)}</td>
                          <td>
                            <span style={expired ? { color: 'var(--rt)', fontWeight: 700 } : undefined}>
                              {formatMonth(b.expiryDate)}
                              {expired ? ' ⚠' : ''}
                            </span>
                          </td>
                          <td style={{ fontFamily: "'DM Mono',monospace" }}>{received.toLocaleString()}</td>
                          <td>
                            <div>
                              <span
                                style={{
                                  fontFamily: "'DM Mono',monospace",
                                  fontWeight: 700,
                                  color: expired ? 'var(--rt)' : 'var(--Gd)',
                                }}
                              >
                                {qty.toLocaleString()}
                              </span>
                              <div className="batch-avail-bar">
                                <div
                                  className="batch-avail-fill"
                                  style={{
                                    width: `${pct}%`,
                                    ...(expired ? { background: 'var(--red)' } : {}),
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: "'DM Mono',monospace" }}>0</td>
                          <td
                            style={{
                              fontFamily: "'DM Mono',monospace",
                              fontWeight: 700,
                              color: expired ? 'var(--rt)' : 'var(--Gd)',
                            }}
                          >
                            {qty.toLocaleString()}
                          </td>
                          <td>{refName(b.supplier)}</td>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
                            {b.invoiceNumber || '—'}
                          </td>
                          <td style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(b.supplyPrice)}</td>
                          <td>
                            <ActionDropdown
                              items={[
                                {
                                  label: 'Edit Batch',
                                  onClick: () => {
                                    closeModal('view-product');
                                    openModal('add-batch', { product: shown, batch: b });
                                  },
                                },
                                {
                                  label: 'View Commits',
                                  hidden: !showCeoBatch,
                                  onClick: () => showToast('No committed LPOs on this batch yet.'),
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {expiredBatch && (
              <InfoBanner variant="warn" style={{ marginTop: 12 }}>
                <strong>{expiredBatch.batchNumber || 'A batch'}</strong> has an expired Exp date (
                {formatMonth(expiredBatch.expiryDate)}). This batch should be quarantined or disposed of per
                company policy. Available count is shown but these units should not be committed.
              </InfoBanner>
            )}
          </>
        )}
      </SartorModal>

      <RoleGate show={showAddProduct}>
        <SartorModal
          id="add-product"
          open={isOpen('add-product')}
          onClose={() => closeModal('add-product')}
          title="Add New Product"
          subtitle="SKU auto-generated on save"
          size="wide"
          footer={
            <ModalFooterActions onCancel={() => closeModal('add-product')}>
              <Button variant="green" onClick={(e) => void saveAddProduct(e.currentTarget)}>
                Add Product
              </Button>
            </ModalFooterActions>
          }
        >
          <SDivLabel style={{ marginTop: 0 }}>Product Identity</SDivLabel>
          <FRow>
            <FG label="Auto-Generated SKU" className="w50">
              <input
                className="inp"
                readOnly
                style={{ background: 'var(--bg)', fontFamily: "'DM Mono',monospace", color: 'var(--tx3)' }}
                placeholder="SH-XXXX (assigned on save)"
              />
            </FG>
            <FG label="Barcode / QR Code" className="w50">
              <input className="inp" placeholder="If applicable" />
            </FG>
          </FRow>
          <FG label="Product Name *" full style={{ marginBottom: 10 }}>
            <input ref={addNameRef} className="inp" placeholder="Product name" />
          </FG>
          <FRow>
            <FG label="Manufacturer *" className="w50">
              <input ref={addMfgRef} className="inp" placeholder="Name of manufacturer" />
            </FG>
            <FG label="Brand Owner *" className="w50">
              <input ref={addBrandRef} className="inp" placeholder="Brand owner" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Category *" className="w50">
              <select ref={addCatRef} className="sel">
                <option value="">Select…</option>
                <option>Personal Care</option>
                <option>Health Products</option>
                <option>FMCG</option>
              </select>
            </FG>
            <FG label="Country of Origin" className="w50">
              <input ref={addOriginRef} className="inp" placeholder="e.g. Nigeria" />
            </FG>
          </FRow>
          <FG label="Licence Number" full style={{ marginBottom: 10 }}>
            <input ref={addLicenceRef} className="inp" placeholder="e.g. NAFDAC/01/XXXXX" />
          </FG>
          <SDivLabel>Pricing & Stock</SDivLabel>
          <FRow>
            <FG label="Selling Price (₦) *" className="w33">
              <input ref={addPriceRef} className="inp" type="number" placeholder="0.00" />
            </FG>
            <FG label="Default Purchase Price (₦)" className="w33">
              <input ref={addPurchaseRef} className="inp" type="number" placeholder="0.00" />
            </FG>
            <FG label="Reorder Level *" className="w33">
              <input ref={addReorderRef} className="inp" type="number" placeholder="300" />
            </FG>
          </FRow>
          <FG label="Assign to Warehouse *" full>
            <select ref={addWhRef} className="sel" defaultValue="">
              <option value="">Select warehouse…</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </FG>
        </SartorModal>
      </RoleGate>

      <RoleGate show={showProdEdit}>
        <SartorModal
          id="edit-product"
          open={isOpen('edit-product')}
          onClose={() => closeModal('edit-product')}
          title={
            editProduct
              ? `Edit Product — ${productSku(editProduct)}`
              : 'Edit Product — Select a product'
          }
          subtitle="CEO and Inventory Officer only"
          size="wide"
          footer={
            <ModalFooterActions onCancel={() => closeModal('edit-product')}>
              <Button variant="primary" onClick={(e) => void saveEditProduct(e.currentTarget)}>
                Save Changes
              </Button>
            </ModalFooterActions>
          }
        >
          {!editProduct ? (
            <InfoBanner>No product selected. Open this modal from the product catalog.</InfoBanner>
          ) : (
            <>
              <FRow>
                <FG label="Product Name" className="w50">
                  <input
                    ref={editNameRef}
                    className="inp"
                    key={`name-${editProduct._id}`}
                    defaultValue={editProduct.productName || ''}
                  />
                </FG>
                <FG label="Manufacturer" className="w50">
                  <input
                    ref={editMfgRef}
                    className="inp"
                    key={`mfg-${editProduct._id}`}
                    defaultValue={editProduct.manufacturer || ''}
                  />
                </FG>
              </FRow>
              <FRow>
                <FG label="Brand Owner" className="w50">
                  <input
                    ref={editBrandRef}
                    className="inp"
                    key={`brand-${editProduct._id}`}
                    defaultValue={editProduct.brandOwner || ''}
                  />
                </FG>
                <FG label="Category" className="w50">
                  <input
                    ref={editCatRef}
                    className="inp"
                    key={`cat-${editProduct._id}`}
                    defaultValue={editProduct.productCategory || ''}
                  />
                </FG>
              </FRow>
              <FRow>
                <FG label="Licence Number" className="w50">
                  <input
                    ref={editLicenceRef}
                    className="inp"
                    key={`lic-${editProduct._id}`}
                    defaultValue={editProduct.licenceNumber || ''}
                  />
                </FG>
                <FG label="Country of Origin" className="w50">
                  <input
                    ref={editOriginRef}
                    className="inp"
                    key={`origin-${editProduct._id}`}
                    defaultValue={editProduct.countryOfOrigin || ''}
                  />
                </FG>
              </FRow>
              <FRow>
                <FG label="Selling Price (₦)" className="w50">
                  <input
                    ref={editPriceRef}
                    className="inp"
                    type="number"
                    key={`price-${editProduct._id}`}
                    defaultValue={num(editProduct.sellingPrice ?? editProduct.price)}
                  />
                </FG>
                <FG label="Reorder Level" className="w50">
                  <input
                    ref={editReorderRef}
                    className="inp"
                    type="number"
                    key={`reo-${editProduct._id}`}
                    defaultValue={Number(editProduct.reorderLevel ?? 100)}
                  />
                </FG>
              </FRow>
            </>
          )}
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="add-batch"
        open={isOpen('add-batch')}
        onClose={() => closeModal('add-batch')}
        title={editBatch ? 'Edit Inventory Batch' : 'Add Inventory Batch'}
        subtitle={
          batchProduct
            ? `${productSku(batchProduct)} — ${batchProduct.productName || 'Product'}`
            : 'Select a product first'
        }
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-batch')}>
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-batch', e.currentTarget, 'Batch saved.')}
            >
              Save Batch
            </Button>
          </ModalFooterActions>
        }
      >
        <div key={editBatch?._id || 'new-batch'}>
          <FRow>
            <FG label="Batch Number *" className="w50">
              <input
                className="inp"
                placeholder="Batch number"
                defaultValue={editBatch?.batchNumber || ''}
              />
            </FG>
            <FG label="Quantity Received *" className="w50">
              <input
                className="inp"
                type="number"
                placeholder="0"
                defaultValue={
                  editBatch
                    ? String(editBatch.quantityReceived ?? editBatch.quantity ?? '')
                    : ''
                }
              />
            </FG>
          </FRow>
          <FRow>
            <FG label="Manufacturing Date *" className="w50">
              <input
                className="inp"
                type="date"
                defaultValue={toDateInputValue(editBatch?.manufactureDate)}
              />
            </FG>
            <FG label="Expiry Date *" className="w50">
              <input
                className="inp"
                type="date"
                defaultValue={toDateInputValue(editBatch?.expiryDate)}
              />
            </FG>
          </FRow>
          <SDivLabel>Supplier & Purchase Details</SDivLabel>
          <FRow>
            <FG label="Supplier Name *" className="w50">
              <input
                className="inp"
                placeholder="Supplier name"
                defaultValue={
                  editBatch?.supplier && typeof editBatch.supplier === 'object'
                    ? editBatch.supplier.name || ''
                    : ''
                }
              />
            </FG>
            <FG label="Supplier Invoice Ref" className="w50">
              <input
                className="inp"
                placeholder="Supplier invoice number"
                defaultValue={editBatch?.invoiceNumber || ''}
              />
            </FG>
          </FRow>
          <FRow>
            <FG label="Purchase Price / Unit (₦)" className="w50">
              <input
                className="inp"
                type="number"
                placeholder="0.00"
                defaultValue={
                  editBatch?.supplyPrice != null && editBatch.supplyPrice !== ''
                    ? String(editBatch.supplyPrice)
                    : ''
                }
              />
            </FG>
            <FG label="Selling Price Override (₦)" className="w50">
              <input
                className="inp"
                type="number"
                placeholder="Leave blank for default"
                defaultValue={
                  editBatch?.sellingPrice != null && editBatch.sellingPrice !== ''
                    ? String(editBatch.sellingPrice)
                    : ''
                }
              />
            </FG>
          </FRow>
          <FG label="Notes" full>
            <textarea className="ta" rows={2} placeholder="Storage conditions, quality notes…" />
          </FG>
        </div>
      </SartorModal>

      <SartorModal
        id="pack-lpo"
        open={isOpen('pack-lpo')}
        onClose={() => closeModal('pack-lpo')}
        title={packPayload?.lpo ? `Pack LPO ${packPayload.lpo.lpoId || packPayload.lpo._id.slice(-6)}` : 'Pack LPO'}
        subtitle="Stock is deducted from the warehouse you select — other locations are unchanged."
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('pack-lpo')}>
            <Button variant="green" onClick={(e) => void savePack(e.currentTarget)}>
              Save Pack & Commit Stock →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>
          Packing deducts units from <strong>this warehouse only</strong>. If that location does not have
          enough stock, the pack is rejected.
        </InfoBanner>
        <FG label="Packing warehouse *" full style={{ marginTop: 10 }}>
          <select
            key={packPayload?.warehouseId || packPayload?.lpo?._id || 'pack-wh'}
            ref={packWarehouseRef}
            className="sel"
            defaultValue={
              packPayload?.warehouseId ||
              (typeof packPayload?.lpo?.warehouse === 'object'
                ? packPayload.lpo.warehouse?._id
                : packPayload?.lpo?.warehouse) ||
              ''
            }
          >
            <option value="">Select warehouse…</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </FG>
        <FG label="Packing Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="Notes for WH Manager or driver…" />
        </FG>
      </SartorModal>

      <RoleGate show={showProdStock}>
        <SartorModal
          id="approve-stock"
          open={isOpen('approve-stock')}
          onClose={() => closeModal('approve-stock')}
          title="Approve Stock Update"
          subtitle={
            approveProduct
              ? `${productSku(approveProduct)} — ${approveProduct.productName || 'Product'}`
              : 'Review pending stock update'
          }
          size="narrow"
          footer={
            <>
              <Button variant="secondary" onClick={() => closeModal('approve-stock')}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) =>
                  handleSubmit('approve-stock', e.currentTarget, 'Stock update rejected. Inv. Officer notified.')
                }
              >
                Reject
              </Button>
              <Button
                variant="green"
                onClick={(e) =>
                  handleSubmit('approve-stock', e.currentTarget, 'Stock update approved. Inventory updated.')
                }
              >
                Approve Update
              </Button>
            </>
          }
        >
          <IRow
            label="Product"
            value={
              approveProduct
                ? `${productSku(approveProduct)} — ${approveProduct.productName || 'Product'}`
                : 'Select a product'
            }
          />
          <IRow
            label="Current Available"
            value={
              approveProduct
                ? `${Number(approveProduct.totalQuantityAvailable ?? 0).toLocaleString()} units`
                : '—'
            }
          />
          <FG label="WH Manager Note (optional)" full style={{ marginTop: 10 }}>
            <textarea className="ta" rows={2} />
          </FG>
        </SartorModal>
      </RoleGate>
    </>
  );
}
