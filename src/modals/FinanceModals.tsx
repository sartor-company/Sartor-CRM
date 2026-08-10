import { useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { leadName, type CrmCustomer } from '../api/crm';
import { opsApi, type OpsReturn } from '../api/ops';
import { useApp } from '../context/AppContext';
import { productLabel, productSku, useLiveOptions } from '../hooks/useLiveOptions';
import { formatDate, formatNaira, num } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, UploadBtn, useModalActions } from './helpers';

type ReturnRow = { id: number };

function customerLabel(c?: CrmCustomer | null) {
  if (!c) return 'Customer';
  if (typeof c.lead === 'object') return leadName(c.lead) || c.customerId || 'Customer';
  return c.customerId || 'Customer';
}

export function FinanceModals() {
  const { isOpen, closeModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { displayName, roleLabel } = useApp();
  const { products, invoices } = useLiveOptions();
  const [returnRows, setReturnRows] = useState<ReturnRow[]>([{ id: 1 }]);
  const [savingReturn, setSavingReturn] = useState(false);
  const invoiceRef = useRef<HTMLSelectElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const conditionRef = useRef<HTMLSelectElement>(null);

  const statementCustomer = getPayload<{ customer?: CrmCustomer }>('customer-statement')?.customer;
  const goodsReturnPayload = getPayload<{ customer?: CrmCustomer; returnRow?: OpsReturn }>('goods-return');
  const returnRow =
    getPayload<{ returnRow?: OpsReturn }>('credit-note')?.returnRow ||
    getPayload<{ returnRow?: OpsReturn }>('payment-refund')?.returnRow ||
    getPayload<{ returnRow?: OpsReturn }>('credit-note-apply')?.returnRow ||
    goodsReturnPayload?.returnRow;

  const statementName = customerLabel(statementCustomer);

  const statementInvoices = useMemo(() => {
    if (!statementCustomer) return [];
    const leadId =
      typeof statementCustomer.lead === 'object' && statementCustomer.lead
        ? statementCustomer.lead._id
        : typeof statementCustomer.lead === 'string'
          ? statementCustomer.lead
          : null;
    const name = customerLabel(statementCustomer).toLowerCase();
    return invoices.filter((inv) => {
      const invLeadId =
        typeof inv.lead === 'object' && inv.lead ? inv.lead._id : typeof inv.lead === 'string' ? inv.lead : null;
      if (leadId && invLeadId && leadId === invLeadId) return true;
      const invName = (inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null) || '').toLowerCase();
      return invName && invName === name;
    });
  }, [invoices, statementCustomer]);

  const statementTotals = useMemo(() => {
    const invoiced = statementInvoices.reduce((s, i) => s + num(i.totalAmount), 0);
    const paid = statementInvoices
      .filter((i) => String(i.status || '').toLowerCase() === 'paid')
      .reduce((s, i) => s + num(i.totalAmount), 0);
    return { invoiced, paid, due: Math.max(0, invoiced - paid) };
  }, [statementInvoices]);

  const returnRef = returnRow?.returnId || returnRow?._id?.slice(-6) || '—';
  const returnCustomer = returnRow?.customerName || '—';
  const returnAmount = num(returnRow?.amount);
  const creditNoteLabel = returnRow?.creditNote || (returnRow ? `CN-${returnRef}` : '—');

  const addReturnRow = () =>
    setReturnRows((prev) => [...prev, { id: (prev[prev.length - 1]?.id ?? 0) + 1 }]);

  const saveReturn = async (btn: HTMLButtonElement | null) => {
    const invoiceLabel = invoiceRef.current?.value || '';
    const reasonEl = document.querySelector<HTMLSelectElement>('#ret-reason-0');
    const reason = reasonEl?.value.trim() || reasonRef.current?.value.trim() || 'Customer return';
    const skus = returnRows
      .map((_, i) => {
        const sel = document.querySelector<HTMLSelectElement>(`#ret-sku-${i}`);
        const qty = document.querySelector<HTMLInputElement>(`#ret-qty-${i}`);
        if (!sel?.value || !qty?.value) return null;
        return `${sel.value} × ${qty.value}`;
      })
      .filter(Boolean)
      .join(', ');

    setSavingReturn(true);
    if (btn) btn.disabled = true;
    try {
      const selected = invoices.find((inv) => inv._id === invoiceLabel);
      const invoiceId = selected?.invoiceId || (invoiceLabel || undefined);
      const customerName =
        selected?.name ||
        leadName(typeof selected?.lead === 'object' ? selected.lead : null) ||
        customerLabel(goodsReturnPayload?.customer) ||
        undefined;
      await opsApi.createReturn({
        invoiceId,
        customerName: customerName === 'Customer' ? undefined : customerName,
        reason,
        skus: skus || undefined,
        condition: conditionRef.current?.value || 'Resaleable',
        status: 'WH Receiving',
      });
      closeModal('goods-return');
      showToast('Return logged. WH Manager notified to receive goods.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to log return', 'err');
    } finally {
      setSavingReturn(false);
      if (btn) btn.disabled = false;
    }
  };

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
              disabled={savingReturn}
              onClick={(e) => void saveReturn(e.currentTarget)}
            >
              {savingReturn ? 'Saving…' : 'Submit Return →'}
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          A return reference is generated on submission. WH Manager must confirm receipt before a credit
          note can be issued.
        </InfoBanner>
        <FRow>
          <FG label="Invoice Reference *">
            <select ref={invoiceRef} className="sel" defaultValue="">
              <option value="">Select invoice…</option>
              {invoices.map((inv) => {
                const cust =
                  inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null) || 'Customer';
                return (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceId || inv._id.slice(-6)} — {cust} ({formatNaira(num(inv.totalAmount))})
                  </option>
                );
              })}
            </select>
          </FG>
          <FG label="Return Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
          {returnRows.map((row, i) => (
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
              <select id={`ret-sku-${i}`} className="sel" style={{ fontSize: 12, padding: '6px 8px' }}>
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p._id} value={productSku(p)}>
                    {productLabel(p)}
                  </option>
                ))}
              </select>
              <input
                id={`ret-qty-${i}`}
                className="inp"
                type="number"
                placeholder="Qty"
                min={1}
                style={{ fontSize: 12 }}
              />
              <select
                id={`ret-reason-${i}`}
                className="sel"
                style={{ fontSize: 12, padding: '6px 8px' }}
              >
                <option>Damaged on delivery</option>
                <option>Wrong product sent</option>
                <option>Customer changed order</option>
              </select>
              <select
                ref={i === 0 ? conditionRef : undefined}
                className="sel"
                style={{ fontSize: 12, padding: '6px 8px' }}
                defaultValue="Resaleable"
              >
                <option value="Resaleable">Resaleable — Return to stock</option>
                <option value="Not Resaleable">Damaged — Write-off</option>
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
            <input className="inp" readOnly value={`${displayName} (${roleLabel})`} />
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
        subtitle={`${returnRef} — ${returnCustomer}`}
        footer={
          <ModalFooterActions onCancel={() => closeModal('credit-note')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('credit-note', e.currentTarget, 'Credit note issued. Customer notified.')
              }
            >
              Issue Credit Note →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>
          Credit note is issued to the customer. Commission may be reversed proportionally on approval.
        </InfoBanner>
        <IRow label="Return Ref" value={returnRef} />
        <IRow label="Customer" value={returnCustomer} />
        <IRow
          label="Condition"
          value={
            <Badge variant={returnRow?.condition === 'Resaleable' ? 'green' : 'amber'}>
              {returnRow?.condition || '—'}
            </Badge>
          }
        />
        <div className="sdiv" />
        <FRow>
          <FG label="Credit Note Amount *">
            <input
              className="inp"
              type="number"
              defaultValue={returnAmount || undefined}
              placeholder="0"
            />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
      </SartorModal>

      <SartorModal
        id="payment-refund"
        open={isOpen('payment-refund')}
        onClose={() => closeModal('payment-refund')}
        title="Process Payment Refund"
        subtitle={`${creditNoteLabel} — ${returnCustomer}${returnAmount ? ` · ${formatNaira(returnAmount)}` : ''}`}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('payment-refund')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('payment-refund', e.currentTarget, 'Refund processed.')
              }
            >
              Process Refund →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ">Permanent — cannot be reversed. Finance Manager or CEO authorisation only.</InfoBanner>
        <IRow
          label="Credit Note"
          value={`${creditNoteLabel}${returnAmount ? ` · ${formatNaira(returnAmount)}` : ''}`}
        />
        <IRow label="Customer" value={returnCustomer} />
        <div className="sdiv" />
        <FRow>
          <FG label="Refund Amount *">
            <input
              className="inp"
              type="number"
              defaultValue={returnAmount || undefined}
              placeholder="0"
            />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
        title={`Statement of Account — ${statementName}`}
        subtitle="Invoices linked to this customer"
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
            <div className="kval kval-s">{formatNaira(statementTotals.invoiced)}</div>
          </div>
          <div className="kc kg" style={{ padding: '10px 16px' }}>
            <div className="klbl">Paid Invoices</div>
            <div className="kval kval-s">{formatNaira(statementTotals.paid)}</div>
          </div>
          <div className="kc ka" style={{ padding: '10px 16px' }}>
            <div className="klbl">Balance Due</div>
            <div className="kval kval-s">{formatNaira(statementTotals.due)}</div>
          </div>
        </div>
        <div className="tw">
          <table style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statementInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: 'var(--tx3)' }}>
                    No invoices found for this customer yet.
                  </td>
                </tr>
              ) : (
                statementInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>{formatDate(inv.creationDateTime || inv.dueDate)}</td>
                    <td>
                      <Badge variant="blue">Invoice</Badge>
                    </td>
                    <td style={{ fontFamily: "'DM Mono',monospace" }}>
                      {inv.invoiceId || inv._id.slice(-6)}
                    </td>
                    <td style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(inv.totalAmount)}</td>
                    <td>{inv.status || '—'}</td>
                  </tr>
                ))
              )}
              <tr style={{ background: 'var(--Gb)' }}>
                <td colSpan={3} style={{ fontWeight: 700, color: 'var(--Gd)' }}>
                  Outstanding Balance
                </td>
                <td
                  colSpan={2}
                  style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: 'var(--Gd)' }}
                >
                  {formatNaira(statementTotals.due)}
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
                handleSubmit('commission-payout', e.currentTarget, 'Commission payout recorded.')
              }
            >
              Confirm Payout →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ" icon="dollar">
          This records that the commission has been physically paid to the rep.
        </InfoBanner>
        <FRow>
          <FG label="Rep / Admin *">
            <input className="inp" placeholder="Staff name" />
          </FG>
          <FG label="Payout Amount *">
            <input className="inp" type="number" placeholder="0" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Payment Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </FG>
          <FG label="Payment Method *">
            <select className="sel">
              <option>Bank Transfer</option>
              <option>Cash</option>
            </select>
          </FG>
        </FRow>
        <FG label="Bank Reference / Description" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Transfer reference" />
        </FG>
        <FG label="Period Covered" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Current month" />
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
        subtitle={`${creditNoteLabel} — ${returnCustomer}${returnAmount ? ` · ${formatNaira(returnAmount)}` : ''}`}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('credit-note-apply')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'credit-note-apply',
                  e.currentTarget,
                  'Credit note applied. Invoice balance reduced.',
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
        <IRow
          label="Credit Note"
          value={`${creditNoteLabel}${returnAmount ? ` · ${formatNaira(returnAmount)}` : ''}`}
        />
        <IRow label="Customer" value={returnCustomer} />
        <FG label="Apply to Invoice *" full style={{ marginTop: 10 }}>
          <select className="sel" defaultValue="">
            <option value="">Select invoice…</option>
            {invoices.map((inv) => {
              const cust =
                inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null) || 'Customer';
              return (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceId || inv._id.slice(-6)} — {cust} ({formatNaira(num(inv.totalAmount))})
                </option>
              );
            })}
          </select>
        </FG>
        <FRow>
          <FG label="Credit Amount to Apply *">
            <input
              className="inp"
              type="number"
              defaultValue={returnAmount || undefined}
              placeholder="0"
            />
          </FG>
          <FG label="Application Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </FG>
        </FRow>
        <FG label="Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="Optional notes for the record…" />
        </FG>
      </SartorModal>
    </>
  );
}
