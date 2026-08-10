import { useMemo, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import type { OpsWarehouse } from '../api/ops';
import { productLabel, productSku, useLiveOptions } from '../hooks/useLiveOptions';
import { FG, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

type PoLine = { id: number; sku: string; qty: number; unitCost: number };

function emptyPoLine(id: number): PoLine {
  return { id, sku: '', qty: 0, unitCost: 0 };
}

function staffName(s: { fullName?: string } | string | null | undefined) {
  if (!s) return '—';
  if (typeof s === 'string') return s;
  return s.fullName || '—';
}

export function WarehouseModals() {
  const { isOpen, closeModal, openModal, getPayload } = useModalActions();
  const { products } = useLiveOptions(isOpen('wh-inventory') || isOpen('wh-staff'));
  const warehouse = getPayload<{ warehouse?: OpsWarehouse }>('wh-inventory')?.warehouse
    ?? getPayload<{ warehouse?: OpsWarehouse }>('wh-staff')?.warehouse;

  const stockRows = useMemo(() => {
    return products.map((p) => {
      const qty = Number(p.totalQuantityAvailable ?? 0);
      const status = qty <= 0 ? 'Out of Stock' : qty < 100 ? 'Low Stock' : 'OK';
      return {
        sku: productSku(p),
        product: p.productName || '—',
        batch: p.batchNumber || '—',
        available: qty,
        reserved: 0,
        reorder: 100,
        status,
      };
    });
  }, [products]);

  const low = stockRows.filter((r) => r.status === 'Low Stock').length;
  const oos = stockRows.filter((r) => r.status === 'Out of Stock').length;
  const units = stockRows.reduce((s, r) => s + r.available, 0);

  const staff = useMemo(() => {
    const rows: Array<{ name: string; role: string }> = [];
    if (warehouse?.manager) {
      rows.push({
        name: staffName(warehouse.manager),
        role: typeof warehouse.manager === 'object' ? warehouse.manager.role || 'WH Manager' : 'WH Manager',
      });
    }
    for (const s of warehouse?.staff ?? []) {
      rows.push({
        name: staffName(s),
        role: typeof s === 'object' ? s.role || 'Staff' : 'Staff',
      });
    }
    return rows;
  }, [warehouse]);

  const titleName = warehouse?.name || 'Warehouse';

  return (
    <>
      <SartorModal
        id="wh-inventory"
        open={isOpen('wh-inventory')}
        onClose={() => closeModal('wh-inventory')}
        title={`${titleName} — Inventory`}
        subtitle="Catalog stock snapshot for this workspace"
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('wh-inventory')} cancelLabel="Close">
            <Button
              variant="green"
              size="sm"
              onClick={() => {
                closeModal('wh-inventory');
                openModal('replenishment-request', { warehouse });
              }}
            >
              Request Replenishment →
            </Button>
          </ModalFooterActions>
        }
      >
        <div className="krow k4 mb">
          <div className="kc kg">
            <div className="klbl">Total SKUs</div>
            <div className="kval">{stockRows.length}</div>
          </div>
          <div className="kc kn">
            <div className="klbl">Total Units</div>
            <div className="kval">{units.toLocaleString()}</div>
          </div>
          <div className="kc ka">
            <div className="klbl">Low Stock SKUs</div>
            <div className="kval">{low}</div>
          </div>
          <div className="kc kr">
            <div className="klbl">Out of Stock</div>
            <div className="kval">{oos}</div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Available</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--tx3)' }}>
                      No products in catalog yet.
                    </td>
                  </tr>
                ) : (
                  stockRows.map((r) => (
                    <tr key={r.sku}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{r.sku}</td>
                      <td>{r.product}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{r.batch}</td>
                      <td
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontWeight: 700,
                          color:
                            r.status === 'Out of Stock'
                              ? 'var(--rt)'
                              : r.status === 'Low Stock'
                                ? 'var(--at)'
                                : 'var(--Gd)',
                        }}
                      >
                        {r.available.toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          variant={r.status === 'OK' ? 'green' : r.status === 'Low Stock' ? 'amber' : 'red'}
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SartorModal>

      <SartorModal
        id="wh-staff"
        open={isOpen('wh-staff')}
        onClose={() => closeModal('wh-staff')}
        title={`Warehouse Staff — ${titleName}`}
        subtitle="Assigned manager and staff on this warehouse record"
        footer={
          <Button variant="secondary" onClick={() => closeModal('wh-staff')}>
            Close
          </Button>
        }
      >
        <InfoBanner variant="info">
          Staff listed here come from the warehouse record. Assignments are managed when creating or updating
          warehouses.
        </InfoBanner>
        <div className="tw">
          <table style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ color: 'var(--tx3)' }}>
                    No staff assigned to this warehouse yet.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={`${s.name}-${s.role}`}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <Badge variant="gray">{s.role}</Badge>
                    </td>
                    <td>
                      <Badge variant="green">Active</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SartorModal>
    </>
  );
}

export function RaisePoModal() {
  const { isOpen, closeModal, showToast } = useModalActions();
  const { products, suppliers } = useLiveOptions(isOpen('raise-po'));
  const [lines, setLines] = useState<PoLine[]>([emptyPoLine(1)]);

  const total = lines.reduce((s, l) => s + l.qty * l.unitCost, 0);

  const updateLine = (id: number, patch: Partial<PoLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  return (
    <SartorModal
      id="raise-po"
      open={isOpen('raise-po')}
      onClose={() => {
        closeModal('raise-po');
        setLines([emptyPoLine(1)]);
      }}
      title="Raise Purchase Order"
      subtitle="Download as PDF and send to supplier manually. Reference the PO number on your GRN when stock arrives."
      size="wide"
      footer={
        <ModalFooterActions
          onCancel={() => {
            closeModal('raise-po');
            setLines([emptyPoLine(1)]);
          }}
        >
          <Button variant="secondary" onClick={() => showToast('PO saved as Draft.', 'ok')}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              closeModal('raise-po');
              setLines([emptyPoLine(1)]);
              showToast('PO generated. Send the PDF to your supplier and reference it on the GRN.', 'ok');
            }}
          >
            Generate PDF & Download
          </Button>
        </ModalFooterActions>
      }
    >
      <div className="g2 mb">
        <FG label="Supplier *">
          <select className="sel" id="po-supplier" defaultValue="">
            <option value="">Select supplier...</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || s._id.slice(-6)}
              </option>
            ))}
          </select>
        </FG>
        <FG label="PO Number">
          <input
            className="inp"
            value={`PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`}
            readOnly
            style={{ fontFamily: "'DM Mono',monospace", background: 'var(--bg2)' }}
          />
          <div className="fi-hint">Auto-generated · Reference this on your GRN when stock arrives</div>
        </FG>
      </div>
      <div className="g2 mb">
        <FG label="PO Date *">
          <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </FG>
        <FG label="Expected Delivery Date">
          <input className="inp" type="date" />
        </FG>
      </div>

      <SDivLabel>Line Items</SDivLabel>
      {lines.map((line) => (
        <div key={line.id} className="po-line">
          <div>
            <label className="fi">Product / SKU *</label>
            <select className="sel" value={line.sku} onChange={(e) => updateLine(line.id, { sku: e.target.value })}>
              <option value="">Select SKU...</option>
              {products.map((p) => (
                <option key={p._id} value={productSku(p)}>
                  {productLabel(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fi">Qty *</label>
            <input
              className="inp"
              type="number"
              placeholder="0"
              value={line.qty || ''}
              onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="fi">Unit Cost (₦) *</label>
            <input
              className="inp"
              type="number"
              placeholder="0.00"
              value={line.unitCost || ''}
              onChange={(e) => updateLine(line.id, { unitCost: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="fi">Line Total</label>
            <input
              className="inp"
              value={`₦${(line.qty * line.unitCost).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
              readOnly
              style={{ background: 'var(--bg2)' }}
            />
          </div>
          <div style={{ paddingBottom: 1 }}>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== line.id)))}
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        style={{ marginTop: 8 }}
        onClick={() => setLines((prev) => [...prev, emptyPoLine((prev[prev.length - 1]?.id ?? 0) + 1)])}
      >
        + Add Line
      </Button>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 16 }}>
          Total: ₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </SartorModal>
  );
}
