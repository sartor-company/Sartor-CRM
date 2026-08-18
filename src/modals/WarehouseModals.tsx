import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { opsApi, type OpsDriver, type OpsWarehouse } from '../api/ops';
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
  const { isOpen, closeModal, openModal, getPayload, showToast } = useModalActions();
  const warehouse = getPayload<{ warehouse?: OpsWarehouse }>('wh-inventory')?.warehouse
    ?? getPayload<{ warehouse?: OpsWarehouse }>('wh-staff')?.warehouse;

  const [inv, setInv] = useState<Awaited<ReturnType<typeof opsApi.getWarehouseInventory>> | null>(null);
  const [invLoading, setInvLoading] = useState(false);
  const [whDrivers, setWhDrivers] = useState<OpsDriver[]>([]);
  const inventoryOpen = isOpen('wh-inventory');
  const staffOpen = isOpen('wh-staff');

  useEffect(() => {
    if (!inventoryOpen || !warehouse?._id) {
      setInv(null);
      return;
    }
    let cancelled = false;
    setInvLoading(true);
    void opsApi
      .getWarehouseInventory(warehouse._id)
      .then((data) => {
        if (!cancelled) setInv(data);
      })
      .catch((e) => {
        if (!cancelled) showToast(e instanceof Error ? e.message : 'Failed to load inventory', 'err');
      })
      .finally(() => {
        if (!cancelled) setInvLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inventoryOpen, warehouse?._id, showToast]);

  useEffect(() => {
    if (!staffOpen || !warehouse?._id) {
      setWhDrivers([]);
      return;
    }
    let cancelled = false;
    void opsApi
      .listDrivers()
      .then((rows) => {
        if (cancelled) return;
        const id = String(warehouse._id);
        setWhDrivers(
          rows.filter((d) => {
            const wh = d.warehouse;
            if (!wh) return false;
            return typeof wh === 'string' ? wh === id : wh._id === id;
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setWhDrivers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [staffOpen, warehouse?._id]);

  const stockRows = inv?.items ?? [];
  const units = inv?.totalUnits ?? 0;
  const low = inv?.lowStock ?? 0;
  const oos = inv?.outOfStock ?? 0;

  const staff = useMemo(() => {
    const rows: Array<{ key: string; name: string; role: string; driverId?: string }> = [];
    if (warehouse?.manager) {
      rows.push({
        key: `mgr-${typeof warehouse.manager === 'object' ? warehouse.manager._id : warehouse.manager}`,
        name: staffName(warehouse.manager),
        role: typeof warehouse.manager === 'object' ? warehouse.manager.role || 'WH Manager' : 'WH Manager',
      });
    }
    for (const s of warehouse?.staff ?? []) {
      rows.push({
        key: `st-${typeof s === 'object' ? s._id : s}`,
        name: staffName(s),
        role: typeof s === 'object' ? s.role || 'Staff' : 'Staff',
      });
    }
    for (const d of whDrivers) {
      rows.push({
        key: `drv-${d._id}`,
        name: d.name,
        role: 'Driver',
        driverId: d._id,
      });
    }
    return rows;
  }, [warehouse, whDrivers]);

  const titleName = warehouse?.name || 'Warehouse';

  return (
    <>
      <SartorModal
        id="wh-inventory"
        open={isOpen('wh-inventory')}
        onClose={() => closeModal('wh-inventory')}
        title={`${titleName} — Inventory`}
        subtitle="Live stock levels for this warehouse only"
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('wh-inventory')} cancelLabel="Close">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                closeModal('wh-inventory');
                openModal('grn', { warehouse });
              }}
            >
              Receive Stock
            </Button>
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
            <div className="kval">{invLoading ? '…' : stockRows.length}</div>
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
                {invLoading ? (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--tx3)' }}>
                      Loading this warehouse’s stock…
                    </td>
                  </tr>
                ) : stockRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--tx3)' }}>
                      No stock received at this warehouse yet. Use Receive Stock (GRN) and select this location.
                    </td>
                  </tr>
                ) : (
                  stockRows.map((r) => (
                    <tr key={r.productId}>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{r.sku}</td>
                      <td>{r.productName}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
                        {r.batches.map((b) => b.batchNumber).filter(Boolean).join(', ') || '—'}
                      </td>
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
          Staff assigned here appear as operators for this warehouse. Drivers linked to this location can be
          unassigned without deleting their profile.
        </InfoBanner>
        <div className="tw">
          <table style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--tx3)' }}>
                    No staff assigned to this warehouse yet.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.key}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <Badge variant={s.role === 'Driver' ? 'gray' : s.role.includes('Manager') ? 'amber' : 'blue'}>
                        {s.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="green">Active</Badge>
                    </td>
                    <td>
                      {s.driverId ? (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            void (async () => {
                              try {
                                await opsApi.updateDriver(s.driverId!, { warehouse: '' });
                                setWhDrivers((prev) => prev.filter((d) => d._id !== s.driverId));
                                showToast(`${s.name} unassigned from ${titleName}.`, 'warn');
                                window.dispatchEvent(new CustomEvent('crm-ops-changed'));
                              } catch (e) {
                                showToast(e instanceof Error ? e.message : 'Unassign failed', 'err');
                              }
                            })();
                          }}
                        >
                          Unassign
                        </Button>
                      ) : (
                        '—'
                      )}
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
