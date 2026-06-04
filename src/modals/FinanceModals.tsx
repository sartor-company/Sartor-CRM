import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, UploadBtn, useModalActions } from './helpers';
import { GRN_PRODUCTS } from '../data/mock';

type ReturnRow = { id: number };

export function FinanceModals() {
  const { isOpen, closeModal, handleSubmit, showToast } = useModalActions();
  const [returnRows, setReturnRows] = useState<ReturnRow[]>([{ id: 1 }]);

  const addReturnRow = () =>
    setReturnRows((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1 }]);

  return (
    <>
      <SartorModal
        id="goods-return"
        open={isOpen('goods-return')}
        onClose={() => closeModal('goods-return')}
        title="Log Goods Return"
        subtitle="Returns flow: Log → WH Receives → Credit Note → Refund or Apply to Invoice"
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('goods-return')}>
            <Button
              variant="amber"
              onClick={(e) =>
                handleSubmit(
                  'goods-return',
                  e.currentTarget,
                  'Return RET-0003 logged. WH Manager notified to receive goods.',
                )
              }
            >
              Submit Return →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          A return reference (RET-XXXX) is generated on submission. WH Manager must confirm receipt
          before a credit note can be issued.
        </InfoBanner>
        <FRow>
          <FG label="Invoice Reference *">
            <select className="sel" defaultValue="">
              <option value="">Select invoice…</option>
              <option>INV-00042 — FreshMart NG (₦240,000)</option>
              <option>INV-00041 — PharmaCare Ltd (₦180,000)</option>
            </select>
          </FG>
          <FG label="Return Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <SDivLabel>Items Being Returned</SDivLabel>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--brd)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          {returnRows.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 1fr 140px 28px',
                gap: 8,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <select className="sel" style={{ fontSize: 12, padding: '6px 8px' }}>
                {GRN_PRODUCTS.map((p) => (
                  <option key={p.sku}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
              <input className="inp" type="number" placeholder="Qty" min={1} style={{ fontSize: 12 }} />
              <select className="sel" style={{ fontSize: 12, padding: '6px 8px' }}>
                <option>Damaged on delivery</option>
                <option>Wrong product sent</option>
                <option>Customer changed order</option>
              </select>
              <select className="sel" style={{ fontSize: 12, padding: '6px 8px' }}>
                <option>Resaleable — Return to stock</option>
                <option>Damaged — Write-off</option>
              </select>
              {returnRows.length > 1 && (
                <button
                  type="button"
                  style={{ fontSize: 16, color: 'var(--tx3)', cursor: 'pointer', background: 'none', border: 'none' }}
                  onClick={() => setReturnRows((prev) => prev.filter((r) => r.id !== row.id))}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addReturnRow}>
            + Add Item
          </Button>
        </div>
        <FRow>
          <FG label="Return Logistics">
            <select className="sel" defaultValue="Customer drops off at warehouse">
              <option>Customer drops off at warehouse</option>
              <option>Driver collects from customer</option>
            </select>
          </FG>
          <FG label="Initiated By">
            <select className="sel">
              <option>Abubakar Idah (Admin)</option>
              <option>Emmanuel Batimehin (Rep)</option>
            </select>
          </FG>
        </FRow>
        <FG label="Supporting Notes" full style={{ marginBottom: 10 }}>
          <textarea className="ta" rows={2} placeholder="Customer complaint, condition observed…" />
        </FG>
        <FG label="Evidence (optional)" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="credit-note"
        open={isOpen('credit-note')}
        onClose={() => closeModal('credit-note')}
        title="Issue Credit Note"
        subtitle="RET-0001 — PharmaCare Ltd"
        footer={
          <ModalFooterActions onCancel={() => closeModal('credit-note')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'credit-note',
                  e.currentTarget,
                  'Credit Note CN-0001 issued. Commission reversed. Customer notified.',
                )
              }
            >
              Issue Credit Note →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>
          Credit note CN-XXXX is issued to the customer. Commission is reversed proportionally on
          approval.
        </InfoBanner>
        <IRow label="Return Ref" value="RET-0001" />
        <IRow label="Customer" value="PharmaCare Ltd" />
        <IRow label="WH Confirmation" value={<Badge variant="green">Goods received — Resaleable</Badge>} />
        <div className="sdiv" />
        <FRow>
          <FG label="Credit Note Amount *">
            <input className="inp" type="number" defaultValue={12000} />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Application Method *" full style={{ marginBottom: 10 }}>
          <select className="sel">
            <option>Apply to customer&apos;s next invoice (credit)</option>
            <option>Refund as cash / bank transfer</option>
          </select>
        </FG>
        <FG label="Notes" full>
          <textarea className="ta" rows={2} placeholder="Optional notes…" />
        </FG>
        <InfoBanner variant="warn" style={{ marginTop: 8 }}>
          Commission reversal: ₦300 (2.5% on ₦12,000) will be deducted from Emmanuel Batimehin&apos;s
          commission on approval.
        </InfoBanner>
      </SartorModal>

      <SartorModal
        id="payment-refund"
        open={isOpen('payment-refund')}
        onClose={() => closeModal('payment-refund')}
        title="Process Payment Refund"
        subtitle="CN-0001 — PharmaCare Ltd · ₦12,000"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('payment-refund')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('payment-refund', e.currentTarget, 'Refund of ₦12,000 processed. CN-0001 resolved.')
              }
            >
              Process Refund →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ">Permanent — cannot be reversed. Finance Manager or CEO authorisation only.</InfoBanner>
        <IRow label="Credit Note" value="CN-0001 · ₦12,000" />
        <IRow label="Customer" value="PharmaCare Ltd" />
        <div className="sdiv" />
        <FRow>
          <FG label="Refund Amount *">
            <input className="inp" type="number" defaultValue={12000} />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Refund Method *" full style={{ marginBottom: 10 }}>
          <select className="sel">
            <option>Bank Transfer</option>
            <option>Cash</option>
            <option>Cheque</option>
          </select>
        </FG>
        <FG label="Customer Bank Details / Reference" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Account details or payment ref" />
        </FG>
        <FG label="Proof of Refund (optional)" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="customer-statement"
        open={isOpen('customer-statement')}
        onClose={() => closeModal('customer-statement')}
        title="Statement of Account — Zenith Pharma"
        subtitle="All transactions from 1 Jan 2026 to date"
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('customer-statement')}>
              Close
            </Button>
            <Button variant="outline" onClick={() => showToast('Downloading statement…')}>
              <IconLabel icon="download" size={13}>PDF Statement</IconLabel>
            </Button>
            <Button variant="outline" onClick={() => showToast('Downloading Excel…')}>
              <IconLabel icon="download" size={13}>Excel</IconLabel>
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="kc kn" style={{ padding: '10px 16px' }}>
            <div className="klbl">Total Invoiced</div>
            <div className="kval kval-s">₦1,240,000</div>
          </div>
          <div className="kc kg" style={{ padding: '10px 16px' }}>
            <div className="klbl">Total Paid</div>
            <div className="kval kval-s">₦1,240,000</div>
          </div>
          <div className="kc ka" style={{ padding: '10px 16px' }}>
            <div className="klbl">Balance Due</div>
            <div className="kval kval-s">₦0</div>
          </div>
        </div>
        <div className="tw">
          <table style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12 Jan 2026</td>
                <td>
                  <Badge variant="blue">Invoice</Badge>
                </td>
                <td style={{ fontFamily: "'DM Mono',monospace" }}>INV-00018</td>
                <td style={{ fontFamily: "'DM Mono',monospace" }}>₦240,000</td>
                <td>—</td>
                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>₦240,000</td>
              </tr>
              <tr>
                <td>14 Jan 2026</td>
                <td>
                  <Badge variant="green">Payment</Badge>
                </td>
                <td style={{ fontFamily: "'DM Mono',monospace" }}>GT-007123</td>
                <td>—</td>
                <td style={{ fontFamily: "'DM Mono',monospace", color: 'var(--Gd)' }}>₦240,000</td>
                <td style={{ fontFamily: "'DM Mono',monospace", color: 'var(--Gd)' }}>₦0</td>
              </tr>
              <tr style={{ background: 'var(--Gb)' }}>
                <td colSpan={5} style={{ fontWeight: 700, color: 'var(--Gd)' }}>
                  Closing Balance
                </td>
                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: 'var(--Gd)' }}>
                  ₦0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SartorModal>

      <SartorModal
        id="commission-payout"
        open={isOpen('commission-payout')}
        onClose={() => closeModal('commission-payout')}
        title="Mark Commission as Paid Out"
        subtitle="Record cash or transfer payment to rep"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('commission-payout')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('commission-payout', e.currentTarget, 'Commission payout recorded. Rep notified.')
              }
            >
              Confirm Payout →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ" icon="dollar">
          This records that the commission has been physically paid to the rep. CEO or Finance must
          authorise payouts above ₦50,000.
        </InfoBanner>
        <FRow>
          <FG label="Rep / Admin *">
            <select className="sel">
              <option>Abubakar Idah (Admin) — ₦3,360 due</option>
              <option>Emmanuel Batimehin (Rep) — ₦3,600 due</option>
            </select>
          </FG>
          <FG label="Payout Amount *">
            <input className="inp" type="number" placeholder="₦0.00" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Payment Date *">
            <input className="inp" type="date" />
          </FG>
          <FG label="Payment Method *">
            <select className="sel">
              <option>Bank Transfer</option>
              <option>Cash</option>
            </select>
          </FG>
        </FRow>
        <FG label="Bank Reference / Description" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Commission May 2026 — Abubakar" />
        </FG>
        <FG label="Period Covered" full style={{ marginBottom: 10 }}>
          <input className="inp" defaultValue="May 2026" />
        </FG>
        <FG label="Evidence (optional)" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="credit-note-apply"
        open={isOpen('credit-note-apply')}
        onClose={() => closeModal('credit-note-apply')}
        title="Apply Credit Note to Invoice"
        subtitle="CN-0001 — PharmaCare Ltd · ₦12,000"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('credit-note-apply')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'credit-note-apply',
                  e.currentTarget,
                  'Credit note applied. Invoice balance reduced. CN-0001 marked as Applied.',
                )
              }
            >
              Apply Credit Note →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>
          Applying a credit note reduces the balance on the selected invoice. No cash changes hands.
        </InfoBanner>
        <IRow label="Credit Note" value="CN-0001 · ₦12,000" />
        <IRow label="Customer" value="PharmaCare Ltd" />
        <FG label="Apply to Invoice *" full style={{ marginTop: 10 }}>
          <select className="sel">
            <option>INV-00041 — ₦180,000 outstanding (SOR 30d)</option>
            <option>INV-00045 — ₦96,000 (new invoice pending)</option>
          </select>
        </FG>
        <FRow>
          <FG label="Credit Amount to Apply *">
            <input className="inp" type="number" defaultValue={12000} />
          </FG>
          <FG label="Application Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <IRow label="Invoice Balance After Apply" value="₦168,000" />
        <FG label="Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="Optional notes for the record…" />
        </FG>
      </SartorModal>
    </>
  );
}
