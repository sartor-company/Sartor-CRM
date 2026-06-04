import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { useApp } from '../context/AppContext';
import { GRN_PRODUCTS } from '../data/mock';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, UploadBtn, useModalActions } from './helpers';

type GrnRow = {
  id: number;
  sku: string;
  batch: string;
  ordered: number;
  received: number;
  unitPrice: number;
};

function emptyGrnRow(id: number): GrnRow {
  return { id, sku: '', batch: '', ordered: 0, received: 0, unitPrice: 0 };
}

export function InventoryModals() {
  const { isOpen, closeModal, handleSubmit, showToast } = useModalActions();
  const { isCeo } = useApp();
  const [grnRows, setGrnRows] = useState<GrnRow[]>([emptyGrnRow(1)]);

  const grnOpen = isOpen('grn');
  useEffect(() => {
    if (!grnOpen) setGrnRows([emptyGrnRow(1)]);
  }, [grnOpen]);

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
    const p = GRN_PRODUCTS.find((x) => x.sku === sku);
    updateGrnRow(id, { sku, unitPrice: p?.price ?? 0 });
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
              onClick={(e) =>
                handleSubmit(
                  'grn',
                  e.currentTarget,
                  'GRN-0005 generated. All batch records updated. GRN document ready to print.',
                )
              }
            >
              Save & Generate GRN →
            </Button>
          </>
        }
      >
        <InfoBanner variant="succ" icon="check">
          Saving this GRN creates batch records for <strong>every line item</strong> simultaneously and
          links them to the same GRN number and supplier invoice.
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1.2fr',
              gap: 10,
            }}
          >
            <FG label={<span style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Supplier *</span>}>
              <select className="sel" style={{ fontSize: 12 }}>
                <option value="">Select supplier…</option>
                <option>West Africa Chemicals Ltd</option>
                <option>Kemi Industries Nigeria</option>
              </select>
            </FG>
            <FG label={<span style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Supplier Invoice No. *</span>}>
              <input className="inp" style={{ fontSize: 12, fontFamily: "'DM Mono',monospace" }} placeholder="WAC-2024-0891" />
            </FG>
            <FG label={<span style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Invoice Date *</span>}>
              <input className="inp" type="date" style={{ fontSize: 12 }} />
            </FG>
            <FG label={<span style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Receipt Date *</span>}>
              <input className="inp" type="date" style={{ fontSize: 12 }} />
            </FG>
            <FG label={<span style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Waybill No.</span>}>
              <input className="inp" style={{ fontSize: 12 }} placeholder="DLV-00123" />
            </FG>
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
                {GRN_PRODUCTS.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku}
                  </option>
                ))}
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
            <input className="inp" defaultValue="Amaka Obi" />
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
            <select className="sel">
              <option value="">Select product…</option>
              {GRN_PRODUCTS.map((p) => (
                <option key={p.sku}>{p.sku}</option>
              ))}
            </select>
          </FG>
          <FG label="Batch *" className="w50">
            <select className="sel">
              <option value="">Select batch…</option>
              <option>BTH-2024-09A (Available: 680)</option>
              <option>BTH-2024-03C — EXPIRED (660)</option>
            </select>
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
              onClick={(e) =>
                handleSubmit(
                  'stock-recon-count',
                  e.currentTarget,
                  'Cycle count submitted. Variances calculated and flagged for review.',
                )
              }
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
              <option>Personal Care — All SKUs</option>
              <option>SH-25-CAR only</option>
            </select>
          </FG>
          <FG label="Warehouse">
            <select className="sel" defaultValue="Abuja Central">
              <option>Abuja Central</option>
              <option>Lagos Hub</option>
            </select>
          </FG>
        </FRow>
        <FG label="Counter Name *" full style={{ marginBottom: 12 }}>
          <select className="sel">
            <option>Amaka Obi (Inventory Officer)</option>
            <option>Musa Abdullahi (WH Manager)</option>
          </select>
        </FG>
        <SDivLabel>Physical Count Entry</SDivLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Batch</th>
                <th style={{ textAlign: 'right' }}>System Qty</th>
                <th style={{ textAlign: 'right' }}>Physical Count *</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sku: 'SH-25-CAR', batch: 'BTH-2024-09A', sys: 680 },
                { sku: 'SH-25-CAR', batch: 'BTH-2024-06B', sys: 1000 },
                { sku: 'SH-25-SIL', batch: 'BTH-2024-08B', sys: 380 },
              ].map((r) => (
                <tr key={`${r.sku}-${r.batch}`}>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{r.sku}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{r.batch}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace", textAlign: 'right' }}>{r.sys}</td>
                  <td style={{ padding: '4px 10px' }}>
                    <input
                      className="inp"
                      type="number"
                      placeholder="Enter count"
                      style={{ padding: '5px 8px', fontSize: 12, textAlign: 'right', width: 110 }}
                    />
                  </td>
                </tr>
              ))}
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
              <option>SH-50-CAR — Hand Sanitiser 500ml (CRITICAL)</option>
              <option>SH-25-SIL — Silicone 250ml (Low)</option>
            </select>
          </FG>
          <FG label="Preferred Supplier" className="w50">
            <select className="sel">
              <option>West Africa Chemicals Ltd</option>
              <option>Kemi Industries Nigeria</option>
            </select>
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
        <IRow label="Current Available" value="85 units" />
        <IRow label="Reorder Level" value="500 units" />
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
              <select className="sel">
                <option value="">Select…</option>
                {GRN_PRODUCTS.map((p) => (
                  <option key={p.sku}>{p.sku}</option>
                ))}
              </select>
            </FG>
            <FG label="Batch *" className="w50">
              <select className="sel">
                <option value="">Select…</option>
                <option>BTH-2024-09A</option>
              </select>
            </FG>
          </FRow>
          <IRow label="Current Available" value="680 units" />
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
            <select className="sel">
              <option value="">Select product…</option>
              {GRN_PRODUCTS.map((p) => (
                <option key={p.sku}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </FG>
          <FG label="Batch *" className="w50">
            <select className="sel">
              <option value="">Select batch…</option>
              <option>BTH-2024-03C — EXPIRED (660 units)</option>
            </select>
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
