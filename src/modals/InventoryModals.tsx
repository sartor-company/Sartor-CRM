import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import type { ApiProduct } from '../api/catalog';
import { catalogApi } from '../api/catalog';
import { opsApi } from '../api/ops';
import { useApp } from '../context/AppContext';
import { productLabel, productSku, useLiveOptions } from '../hooks/useLiveOptions';
import { num } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, UploadBtn, useModalActions } from './helpers';

type GrnRow = {
  id: number;
  sku: string;
  batch: string;
  ordered: number;
  received: number;
  unitPrice: number;
};

function emptyGrnRow(id: number, sku = '', unitPrice = 0): GrnRow {
  return { id, sku, batch: '', ordered: 0, received: 0, unitPrice };
}

function productUnitPrice(p: ApiProduct) {
  return num(p.sellingPrice ?? p.supplyPrice ?? p.price);
}

function defaultSku(p?: ApiProduct) {
  return p ? productSku(p) : '';
}

export function InventoryModals() {
  const { isOpen, closeModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { isCeo, displayName } = useApp();
  const { products, suppliers, warehouses } = useLiveOptions();
  const [grnRows, setGrnRows] = useState<GrnRow[]>([emptyGrnRow(1)]);
  const [savingGrn, setSavingGrn] = useState(false);
  const [grnWarehouseId, setGrnWarehouseId] = useState('');
  const grnSupplierRef = useRef<HTMLSelectElement>(null);
  const grnInvoiceRef = useRef<HTMLInputElement>(null);

  const grnPayload = getPayload<{ product?: ApiProduct; warehouse?: { _id: string } }>('grn');
  const quarantinePayload = getPayload<{ product?: ApiProduct }>('quarantine-batch');
  const adjustPayload = getPayload<{ product?: ApiProduct }>('stock-adjust');
  const writeoffPayload = getPayload<{ product?: ApiProduct }>('stock-writeoff');

  const grnOpen = isOpen('grn');
  useEffect(() => {
    if (!grnOpen) {
      setGrnRows([emptyGrnRow(1)]);
      setGrnWarehouseId('');
      return;
    }
    setGrnWarehouseId(grnPayload?.warehouse?._id || '');
    const p = grnPayload?.product;
    if (p) {
      const sku = productSku(p);
      setGrnRows([emptyGrnRow(1, sku, productUnitPrice(p))]);
    }
  }, [grnOpen, grnPayload?.product, grnPayload?.warehouse?._id]);

  const grnTotals = useMemo(() => {
    const lines = grnRows.filter((r) => r.sku);
    const ordered = lines.reduce((s, r) => s + r.ordered, 0);
    const received = lines.reduce((s, r) => s + r.received, 0);
    const value = lines.reduce((s, r) => s + r.received * r.unitPrice, 0);
    return { lines: lines.length, ordered, received, value };
  }, [grnRows]);

  const updateGrnRow = (id: number, patch: Partial<GrnRow>) => {
    setGrnRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const onSkuChange = (id: number, sku: string) => {
    const p = products.find((x) => productSku(x) === sku);
    updateGrnRow(id, { sku, unitPrice: p ? productUnitPrice(p) : 0 });
  };

  const productOptions = products.map((p) => (
    <option key={p._id} value={productSku(p)}>
      {productLabel(p)}
    </option>
  ));

  const warehouseOptions = (
    <>
      <option value="">Select warehouse…</option>
      {warehouses.map((w) => (
        <option key={w._id} value={w._id}>
          {w.name}
        </option>
      ))}
    </>
  );

  const supplierOptions = (
    <>
      <option value="">Select supplier…</option>
      {suppliers.map((s) => (
        <option key={s._id} value={s._id}>
          {s.name || s.contactName || s._id.slice(-6)}
        </option>
      ))}
    </>
  );

  const saveGrn = async (btn: HTMLButtonElement | null) => {
    const warehouse = grnWarehouseId;
    const supplier = grnSupplierRef.current?.value || '';
    const invoiceRef = grnInvoiceRef.current?.value.trim() || '';
    const lines = grnRows
      .map((r) => {
        const p = products.find((x) => productSku(x) === r.sku);
        return p && r.received > 0 ? { product: p._id, quantity: String(r.received) } : null;
      })
      .filter((x): x is { product: string; quantity: string } => Boolean(x));
    if (!warehouse) {
      showToast('Select the warehouse receiving this stock.', 'err');
      return;
    }
    if (!supplier) {
      showToast('Select a supplier.', 'err');
      return;
    }
    if (!lines.length) {
      showToast('Add at least one SKU with quantity received.', 'err');
      return;
    }
    setSavingGrn(true);
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }
    try {
      await catalogApi.createRestock({ supplier, warehouse, invoiceRef, products: lines });
      closeModal('grn');
      setGrnRows([emptyGrnRow(1)]);
      showToast('GRN saved. Stock added to the selected warehouse only.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save GRN', 'err');
    } finally {
      setSavingGrn(false);
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig || 'Save & Generate GRN →';
      }
    }
  };

  return (
    <>
      <SartorModal
        id="grn"
        open={isOpen('grn')}
        onClose={() => closeModal('grn')}
        title="Receive Stock — Goods Received Note (GRN)"
        subtitle="One GRN covers all SKUs and batches in this delivery. All inventory updates happen simultaneously on save."
        size="xwide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('grn')}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => showToast('GRN draft saved.')}>
              Save Draft
            </Button>
            <Button
              variant="green"
              disabled={savingGrn}
              onClick={(e) => void saveGrn(e.currentTarget)}
            >
              Save & Generate GRN →
            </Button>
          </>
        }
      >
        <InfoBanner variant="succ" icon="check">
          Saving this GRN creates batch records for <strong>every line item</strong> at the receiving
          warehouse you select. Other warehouses keep their own stock.
        </InfoBanner>
        <div style={{ background: 'var(--N)', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'rgba(255,255,255,.55)',
              textTransform: 'uppercase',
              letterSpacing: '.6px',
              marginBottom: 10,
            }}
          >
            Delivery Details — applies to all items below
          </div>
          <div className="grn-del-1">
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Supplier *</label>
              <select ref={grnSupplierRef} className="sel" style={{ fontSize: 12 }}>
                {supplierOptions}
              </select>
            </div>
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Supplier Invoice No. *</label>
              <input
                ref={grnInvoiceRef}
                className="inp"
                style={{ fontSize: 12, fontFamily: "'DM Mono',monospace" }}
                placeholder="e.g. WAC-2024-0891"
              />
            </div>
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Invoice Date *</label>
              <input className="inp" type="date" style={{ fontSize: 12 }} />
            </div>
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Delivery / Receipt Date *</label>
              <input className="inp" type="date" style={{ fontSize: 12 }} />
            </div>
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Waybill / Delivery Note No.</label>
              <input className="inp" style={{ fontSize: 12 }} placeholder="e.g. DLV-00123" />
            </div>
          </div>
          <div className="grn-del-2">
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Purchase Order Reference</label>
              <input
                className="inp"
                style={{ fontSize: 12, fontFamily: "'DM Mono',monospace" }}
                placeholder="PO-XXXX if applicable"
              />
            </div>
            <div className="fg grn-wh" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Receiving Warehouse *</label>
              <select
                className="sel"
                style={{ fontSize: 12 }}
                value={grnWarehouseId}
                onChange={(e) => setGrnWarehouseId(e.target.value)}
              >
                <option value="">Select warehouse…</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="fg" style={{ gap: 4, minWidth: 0 }}>
              <label style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Received By *</label>
              <input className="inp" style={{ fontSize: 12 }} defaultValue={displayName} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <SDivLabel style={{ margin: 0 }}>
            Items Received — add one row per SKU/batch combination
          </SDivLabel>
          <Button
            variant="green"
            size="sm"
            onClick={() =>
              setGrnRows((prev) => [...prev, emptyGrnRow((prev[prev.length - 1]?.id ?? 0) + 1)])
            }
          >
            + Add SKU / Batch
          </Button>
        </div>
        <div
          style={{
            background: 'var(--bg2)',
            borderRadius: '6px 6px 0 0',
            padding: '7px 10px',
            display: 'grid',
            gridTemplateColumns: '1.8fr 0.9fr 70px 70px 90px 85px 85px 28px',
            gap: 8,
            fontSize: 9,
            fontWeight: 800,
            color: 'var(--tx3)',
            textTransform: 'uppercase',
          }}
        >
          <span>Product / SKU</span>
          <span>Batch No.</span>
          <span>Ordered</span>
          <span>Received</span>
          <span>Unit Price (₦)</span>
          <span>Mfg Date</span>
          <span>Exp Date</span>
          <span />
        </div>
        <div
          style={{
            border: '1px solid var(--brd)',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            background: '#fff',
            padding: '6px 10px',
          }}
        >
          {grnRows.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.8fr 0.9fr 70px 70px 90px 85px 85px 28px',
                gap: 8,
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <select
                className="sel"
                style={{ fontSize: 11, padding: '5px 6px' }}
                value={row.sku}
                onChange={(e) => onSkuChange(row.id, e.target.value)}
              >
                <option value="">Select…</option>
                {productOptions}
              </select>
              <input
                className="inp"
                style={{ fontSize: 11, padding: '5px 6px' }}
                placeholder="BTH-…"
                value={row.batch}
                onChange={(e) => updateGrnRow(row.id, { batch: e.target.value })}
              />
              <input
                className="inp"
                type="number"
                style={{ fontSize: 11, padding: '5px 6px' }}
                value={row.ordered || ''}
                onChange={(e) => updateGrnRow(row.id, { ordered: Number(e.target.value) || 0 })}
              />
              <input
                className="inp"
                type="number"
                style={{ fontSize: 11, padding: '5px 6px' }}
                value={row.received || ''}
                onChange={(e) => updateGrnRow(row.id, { received: Number(e.target.value) || 0 })}
              />
              <input
                className="inp"
                type="number"
                style={{ fontSize: 11, padding: '5px 6px' }}
                value={row.unitPrice || ''}
                onChange={(e) => updateGrnRow(row.id, { unitPrice: Number(e.target.value) || 0 })}
              />
              <input className="inp" type="date" style={{ fontSize: 11, padding: '5px 4px' }} />
              <input className="inp" type="date" style={{ fontSize: 11, padding: '5px 4px' }} />
              {grnRows.length > 1 && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}
                  onClick={() => setGrnRows((prev) => prev.filter((r) => r.id !== row.id))}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--brd)',
            borderRadius: 6,
            padding: '10px 14px',
            marginTop: 10,
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Lines: </span>
            <strong style={{ fontFamily: "'DM Mono',monospace" }}>{grnTotals.lines}</strong>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Total Received: </span>
            <strong style={{ fontFamily: "'DM Mono',monospace", color: 'var(--N)' }}>
              {grnTotals.received}
            </strong>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Total Invoice Value: </span>
            <strong style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, color: 'var(--N)' }}>
              ₦{grnTotals.value.toLocaleString('en-NG')}
            </strong>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
        <FRow>
          <FG label="Overall Delivery Status">
            <select className="sel">
              <option>Full Acceptance — all items received as ordered</option>
              <option>Short Delivery — fewer units than ordered</option>
              <option>Partial Acceptance — some lines rejected</option>
            </select>
          </FG>
          <FG label="Inspection Done By">
            <input className="inp" defaultValue={displayName} />
          </FG>
        </FRow>
        </div>
        <FG label="Notes / Discrepancies" full style={{ marginBottom: 10 }}>
          <textarea className="ta" rows={2} placeholder="Describe any short deliveries or damaged items…" />
        </FG>
        <FG label="Supporting Documents" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="quarantine-batch"
        open={isOpen('quarantine-batch')}
        onClose={() => closeModal('quarantine-batch')}
        title="Quarantine Batch"
        subtitle="Suspend stock pending quality decision — prevents commitment to any LPO"
        footer={
          <ModalFooterActions onCancel={() => closeModal('quarantine-batch')}>
            <Button
              style={{ background: 'var(--pur)', color: '#fff' }}
              onClick={(e) =>
                handleSubmit(
                  'quarantine-batch',
                  e.currentTarget,
                  'Batch quarantined. Stock suspended from LPO packing. Quality team notified.',
                )
              }
            >
              Quarantine Batch
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          Quarantined stock is <strong>not available</strong> for LPO packing or sale until released.
        </InfoBanner>
        <FRow>
          <FG label="Product *" className="w50">
            <select className="sel" defaultValue={defaultSku(quarantinePayload?.product)}>
              <option value="">Select product…</option>
              {productOptions}
            </select>
          </FG>
          <FG label="Batch *" className="w50">
            <input className="inp" placeholder="Batch number" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Quantity to Quarantine *">
            <input className="inp" type="number" placeholder="Units" min={1} />
          </FG>
          <FG label="Quarantine Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Reason for Quarantine *" full style={{ marginBottom: 10 }}>
          <select className="sel">
            <option value="">Select reason…</option>
            <option>Customer complaint — quality issue</option>
            <option>Suspected contamination — pending lab test</option>
            <option>Near-expiry — pending disposal decision</option>
          </select>
        </FG>
        <FG label="Notes" full>
          <textarea className="ta" rows={2} placeholder="Details of the quality concern…" />
        </FG>
      </SartorModal>

      <SartorModal
        id="stock-recon-count"
        open={isOpen('stock-recon-count')}
        onClose={() => closeModal('stock-recon-count')}
        title="Start Stock Cycle Count"
        subtitle="Record physical counts per SKU and batch. System calculates variances automatically."
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('stock-recon-count')}>
            <Button
              variant="primary"
              onClick={(e) => {
                const btn = e.currentTarget;
                const physicalInputs = document.querySelectorAll<HTMLInputElement>('[data-recon-physical]');
                const rows = Array.from(physicalInputs);
                void (async () => {
                  btn.disabled = true;
                  try {
                    for (const input of rows) {
                      const systemQty = Number(input.dataset.systemQty || 0);
                      const physicalQty = Number(input.value || 0);
                      if (!input.value) continue;
                      await opsApi.createRecon({
                        sku: input.dataset.sku || 'SKU',
                        productName: input.dataset.product || 'Product',
                        systemQty,
                        physicalQty,
                      });
                    }
                    closeModal('stock-recon-count');
                    showToast('Cycle count submitted. Variances calculated and flagged for review.', 'ok');
                    window.dispatchEvent(new CustomEvent('crm-ops-changed'));
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : 'Count failed', 'err');
                  } finally {
                    btn.disabled = false;
                  }
                })();
              }}
            >
              Submit Count →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>Count one category at a time. Counts must be done blind — do not look at system quantities first.</InfoBanner>
        <FRow>
          <FG label="Count Date *">
            <input className="inp" type="date" />
          </FG>
          <FG label="Category to Count">
            <select className="sel">
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p._id} value={productSku(p)}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
          </FG>
          <FG label="Warehouse">
            <select className="sel">{warehouseOptions}</select>
          </FG>
        </FRow>
        <FG label="Counter Name *" full style={{ marginBottom: 12 }}>
          <input className="inp" defaultValue={displayName} />
        </FG>
        <SDivLabel>Physical Count Entry</SDivLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>System Qty</th>
                <th style={{ textAlign: 'right' }}>Physical Count *</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--tx3)', padding: 12 }}>
                    No products loaded.
                  </td>
                </tr>
              ) : (
                products.slice(0, 8).map((p) => {
                  const sku = productSku(p);
                  const sys = Number(p.totalQuantityAvailable ?? 0);
                  return (
                    <tr key={p._id}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{sku}</td>
                      <td>{p.productName || '—'}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", textAlign: 'right' }}>{sys}</td>
                      <td style={{ padding: '4px 10px' }}>
                        <input
                          className="inp"
                          type="number"
                          placeholder="Enter count"
                          data-recon-physical
                          data-sku={sku}
                          data-product={p.productName || sku}
                          data-system-qty={sys}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <FG label="Count Notes" full style={{ marginTop: 12 }}>
          <textarea className="ta" rows={2} placeholder="Observations during counting…" />
        </FG>
      </SartorModal>

      <SartorModal
        id="replenishment-request"
        open={isOpen('replenishment-request')}
        onClose={() => closeModal('replenishment-request')}
        title="Replenishment Request"
        subtitle="Submitted to CEO for approval. You cannot independently order stock."
        footer={
          <ModalFooterActions onCancel={() => closeModal('replenishment-request')}>
            <Button
              variant="amber"
              onClick={(e) =>
                handleSubmit(
                  'replenishment-request',
                  e.currentTarget,
                  'Replenishment request submitted to CEO for review.',
                )
              }
            >
              Submit Request to CEO →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          This is a <strong>request only</strong> — not a purchase order. The CEO approves and initiates
          the purchase.
        </InfoBanner>
        <FRow>
          <FG label="Product / SKU *" className="w50">
            <select className="sel">
              <option value="">Select product…</option>
              {productOptions}
            </select>
          </FG>
          <FG label="Preferred Supplier" className="w50">
            <select className="sel">{supplierOptions}</select>
          </FG>
        </FRow>
        <FRow>
          <FG label="Requested Quantity *">
            <input className="inp" type="number" placeholder="Units to order" min={1} />
          </FG>
          <FG label="Required By Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Justification / Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="Why is this urgent?" />
        </FG>
      </SartorModal>

      <RoleGate show={isCeo}>
        <SartorModal
          id="stock-adjust"
          open={isOpen('stock-adjust')}
          onClose={() => closeModal('stock-adjust')}
          title="Manual Stock Adjustment"
          subtitle="CEO authorisation — permanently audit-logged"
          size="narrow"
          footer={
            <ModalFooterActions onCancel={() => closeModal('stock-adjust')}>
              <Button
                variant="primary"
                onClick={(e) =>
                  handleSubmit('stock-adjust', e.currentTarget, 'Stock adjustment applied. Audit log updated.')
                }
              >
                Apply Adjustment
              </Button>
            </ModalFooterActions>
          }
        >
          <InfoBanner variant="err" icon="lock">
            For data entry corrections only. Permanently logged with your name and timestamp.
          </InfoBanner>
          <FRow>
            <FG label="Product *" className="w50">
              <select className="sel" defaultValue={defaultSku(adjustPayload?.product)}>
                <option value="">Select…</option>
                {productOptions}
              </select>
            </FG>
            <FG label="Batch *" className="w50">
              <input className="inp" placeholder="Batch number" />
            </FG>
          </FRow>
          <IRow
            label="Current Available"
            value={
              adjustPayload?.product
                ? `${Number(adjustPayload.product.totalQuantityAvailable ?? 0).toLocaleString()} units`
                : '—'
            }
          />
          <FRow>
            <FG label="Adjustment Type" className="w50">
              <select className="sel">
                <option>Add units (+)</option>
                <option>Remove units (−)</option>
                <option>Set exact quantity</option>
              </select>
            </FG>
            <FG label="Quantity *" className="w50">
              <input className="inp" type="number" placeholder="0" min={0} />
            </FG>
          </FRow>
          <FG label="Reason *" full style={{ marginBottom: 10 }}>
            <select className="sel">
              <option value="">Select reason…</option>
              <option>Data entry correction</option>
              <option>Physical count discrepancy</option>
            </select>
          </FG>
          <FG label="Notes *" full>
            <textarea className="ta" rows={2} placeholder="Detailed explanation…" />
          </FG>
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="stock-writeoff"
        open={isOpen('stock-writeoff')}
        onClose={() => closeModal('stock-writeoff')}
        title="Stock Write-off"
        subtitle="Remove expired or damaged inventory permanently"
        footer={
          <ModalFooterActions onCancel={() => closeModal('stock-writeoff')}>
            <Button
              variant="danger"
              onClick={(e) =>
                handleSubmit(
                  'stock-writeoff',
                  e.currentTarget,
                  'Write-off recorded. Inventory updated. Audit log created.',
                )
              }
            >
              Confirm Write-off →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          Write-offs are permanent and irreversible. CEO approval required for write-offs above ₦50,000
          in value.
        </InfoBanner>
        <FRow>
          <FG label="Product *" className="w50">
            <select className="sel" defaultValue={defaultSku(writeoffPayload?.product)}>
              <option value="">Select product…</option>
              {productOptions}
            </select>
          </FG>
          <FG label="Batch *" className="w50">
            <input className="inp" placeholder="Batch number" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Write-off Quantity *">
            <input className="inp" type="number" placeholder="Units" min={1} />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Write-off Type *" full style={{ marginBottom: 10 }}>
          <select className="sel">
            <option value="">Select reason…</option>
            <option>Expired — Past expiry date</option>
            <option>Damaged — Physical damage</option>
            <option>Theft / Loss</option>
          </select>
        </FG>
        <FG label="Notes *" full>
          <textarea className="ta" rows={2} placeholder="Describe condition and disposal instructions…" />
        </FG>
      </SartorModal>
    </>
  );
}
