import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Icon, IconLabel } from '../components/ui/Icon';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { leadName, type CrmInvoice } from '../api/crm';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatDate, formatNaira, num } from '../utils/format';
import { invoiceStatusVariant } from '../utils/statusBadges';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, UploadBtn, useModalActions } from './helpers';

function PinInputs({ count = 6 }: { count?: number }) {
  return (
    <div className="pin-inputs">
      {Array.from({ length: count }).map((_, i) => (
        <input key={i} className="pin-box" maxLength={1} />
      ))}
    </div>
  );
}

function useSharedInvoice(
  getPayload: <T extends Record<string, unknown> | null = Record<string, unknown> | null>(
    id: import('../types').ModalId,
  ) => T,
) {
  const view = getPayload<{ invoice?: CrmInvoice }>('view-invoice')?.invoice;
  const qr = getPayload<{ invoice?: CrmInvoice }>('qr-view')?.invoice;
  const addPay = getPayload<{ invoice?: CrmInvoice }>('add-payment')?.invoice;
  const mark = getPayload<{ invoice?: CrmInvoice }>('mark-paid')?.invoice;
  const confirm = getPayload<{ invoice?: CrmInvoice }>('confirm-payment')?.invoice;
  return view || qr || addPay || mark || confirm || null;
}

export function InvoiceModals() {
  const { isOpen, closeModal, openModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { showInvAddPay, showInvMarkPaid, showInvConfirmPay } = useRoleGates();
  const [qrStep, setQrStep] = useState<'otp' | 'confirm' | 'success'>('otp');

  const invoice = useSharedInvoice(getPayload);
  const invId = invoice?.invoiceId || (invoice ? invoice._id.slice(-6) : 'Invoice');
  const customer =
    invoice?.name ||
    leadName(typeof invoice?.lead === 'object' ? invoice.lead : null) ||
    (invoice ? 'Customer' : 'Select an invoice');
  const amount = formatNaira(num(invoice?.totalAmount));
  const due = formatDate(invoice?.dueDate);
  const status = invoice?.status || '—';
  const lpoId =
    typeof invoice?.lpo === 'object' && invoice.lpo
      ? invoice.lpo.lpoId || '—'
      : '—';
  const terms =
    typeof invoice?.lpo === 'object' && invoice.lpo ? invoice.lpo.terms || '—' : '—';

  const passInvoice = (id: import('../types').ModalId) => {
    if (invoice) openModal(id, { invoice });
    else openModal(id);
  };

  return (
    <>
      <SartorModal
        id="view-invoice"
        open={isOpen('view-invoice')}
        onClose={() => closeModal('view-invoice')}
        title={`Invoice ${invId}`}
        subtitle={`${customer} · ${terms} · Due ${due}`}
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-invoice')}>
              Close
            </Button>
            <Button variant="outline" onClick={() => showToast('Downloading PDF…')}>
              <IconLabel icon="download" size={13}>PDF</IconLabel>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                closeModal('view-invoice');
                passInvoice('qr-view');
              }}
            >
              <IconLabel icon="camera" size={13}>QR Status</IconLabel>
            </Button>
            <RoleGate show={showInvAddPay}>
              <Button
                variant="primary"
                onClick={(e) =>
                  handleSubmit('view-invoice', e.currentTarget, 'Payment record saved.')
                }
              >
                Save Payment
              </Button>
            </RoleGate>
            <RoleGate show={showInvMarkPaid}>
              <Button
                variant="amber"
                onClick={() => {
                  closeModal('view-invoice');
                  passInvoice('mark-paid');
                }}
              >
                Mark as Paid
              </Button>
            </RoleGate>
            <RoleGate show={showInvConfirmPay}>
              <Button
                variant="green"
                onClick={() => {
                  closeModal('view-invoice');
                  passInvoice('confirm-payment');
                }}
              >
                <IconLabel icon="check" size={13}>Confirm Full Payment</IconLabel>
              </Button>
            </RoleGate>
          </>
        }
      >
        {!invoice ? (
          <InfoBanner>No invoice selected. Open from the invoices list or dashboard.</InfoBanner>
        ) : (
          <>
            <div className="aging-wrap aging-warn">
              <div className="aging-label">
                <span>Invoice Status</span>
                <span>{status}</span>
              </div>
              <div className="aging-track">
                <div className="aging-fill" style={{ width: '100%' }} />
              </div>
              <div className="aging-status">
                <IconLabel icon="alert" size={13}>
                  {status} — Due {due}
                </IconLabel>
              </div>
            </div>
            <div className="inv-doc">
              <div className="inv-doc-head">
                <div>
                  <div className="inv-doc-logo">Sartor Health</div>
                  <div className="inv-doc-sub">Company Ltd</div>
                </div>
                <div className="inv-doc-num">
                  <div className="n">{invId}</div>
                  <div className="s">{formatDate(invoice.creationDateTime)}</div>
                </div>
              </div>
              <div className="inv-doc-body">
                <div className="inv-party">
                  <div>
                    <div className="inv-party-lbl">From</div>
                    <div className="inv-party-val">Sartor Health Company Ltd</div>
                  </div>
                  <div>
                    <div className="inv-party-lbl">Bill To</div>
                    <div className="inv-party-val">{customer}</div>
                  </div>
                </div>
                <div className="inv-total">
                  <div className="inv-total-box">
                    <div className="inv-total-row grand">
                      <span>Amount</span>
                      <span>{amount}</span>
                    </div>
                    <div className="inv-total-row">
                      <span>Status</span>
                      <span>
                        <Badge variant={invoiceStatusVariant(invoice.status)}>{status}</Badge>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="inv-terms">
                  <strong>LPO:</strong> {lpoId} · <strong>Terms:</strong> {terms} ·{' '}
                  <strong>Due:</strong> {due}
                </div>
              </div>
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--brd)',
                borderRadius: 9,
                padding: '14px 16px',
                marginBottom: 12,
                marginTop: 12,
              }}
            >
              <SDivLabel style={{ marginTop: 0 }}>QR Delivery Confirmation</SDivLabel>
              <Badge variant="amber">Pending — QR not yet scanned</Badge>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <Button variant="green" size="sm" onClick={() => passInvoice('qr-view')}>
                  <IconLabel icon="camera" size={13}>View QR Code</IconLabel>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => showToast('QR confirmation link resent to customer via WhatsApp & Email.')}
                >
                  Resend QR Link
                </Button>
              </div>
            </div>
            <RoleGate show={showInvAddPay}>
              <div className="sdiv" />
              <SDivLabel style={{ marginTop: 0 }}>Add Payment Record</SDivLabel>
              <FRow>
                <FG label="Amount Received *">
                  <input className="inp" type="number" placeholder="₦0.00" />
                </FG>
                <FG label="Date *">
                  <input className="inp" type="date" />
                </FG>
                <FG label="Method">
                  <select className="sel" defaultValue="Bank Transfer">
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>POS</option>
                    <option>Cheque</option>
                  </select>
                </FG>
              </FRow>
              <FG label="Evidence / Receipt (optional)" full>
                <UploadBtn />
              </FG>
            </RoleGate>
          </>
        )}
      </SartorModal>

      <SartorModal
        id="add-payment"
        open={isOpen('add-payment')}
        onClose={() => closeModal('add-payment')}
        title="Add Payment Record"
        subtitle={`${invId} · ${amount}`}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-payment')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('add-payment', e.currentTarget, 'Payment record saved.')}
            >
              Save Record
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Amount Received *">
            <input className="inp" type="number" placeholder="₦0.00" />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Method" full style={{ marginBottom: 10 }}>
          <select className="sel" defaultValue="Bank Transfer">
            <option>Bank Transfer</option>
            <option>Cash</option>
            <option>POS</option>
            <option>Cheque</option>
          </select>
        </FG>
        <FG label="Reference" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Transaction ref" />
        </FG>
        <FG label="Payment Evidence (optional)" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="mark-paid"
        open={isOpen('mark-paid')}
        onClose={() => closeModal('mark-paid')}
        title="Mark Invoice as Fully Paid"
        subtitle={`${invId} · ${amount}`}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('mark-paid')}>
            <Button
              variant="amber"
              onClick={(e) =>
                handleSubmit(
                  'mark-paid',
                  e.currentTarget,
                  'Invoice submitted to Finance/CEO for confirmation.',
                )
              }
            >
              Submit for Confirmation →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          Submits for CEO/Finance confirmation — does not finalise payment. Commission triggered only
          on confirmed payment.
        </InfoBanner>
        <FRow>
          <FG label="Final Amount *">
            <input
              className="inp"
              type="number"
              key={invoice?._id || 'amt'}
              defaultValue={invoice ? num(invoice.totalAmount) : undefined}
            />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Evidence (optional)" full>
          <UploadBtn />
        </FG>
      </SartorModal>

      <SartorModal
        id="confirm-payment"
        open={isOpen('confirm-payment')}
        onClose={() => closeModal('confirm-payment')}
        title="Confirm Full Payment"
        subtitle={`${invId} · ${customer}`}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('confirm-payment')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'confirm-payment',
                  e.currentTarget,
                  'Payment confirmed. Lead converted to Customer. Commission calculated.',
                )
              }
            >
              Confirm & Convert →
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Balance Amount *">
            <input
              className="inp"
              type="number"
              key={`bal-${invoice?._id || 'x'}`}
              defaultValue={invoice ? num(invoice.totalAmount) : undefined}
            />
          </FG>
          <FG label="Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Evidence (optional)" full>
          <UploadBtn />
        </FG>
        <InfoBanner variant="succ" style={{ marginTop: 10 }}>
          <strong>First Invoice:</strong> Will convert {customer} to a Customer and calculate rep
          commission. Cannot be reversed.
        </InfoBanner>
      </SartorModal>

      <SartorModal
        id="qr-view"
        open={isOpen('qr-view')}
        onClose={() => closeModal('qr-view')}
        icon="camera"
        title={`QR Delivery Confirmation — ${invId}`}
        subtitle={`${customer} · Due ${due}`}
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('qr-view')}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setQrStep('otp');
                openModal('qr-delivery-confirm', invoice ? { invoice } : undefined);
              }}
            >
              <IconLabel icon="eye" size={13}>Preview Customer Page</IconLabel>
            </Button>
            <RoleGate show={showInvConfirmPay}>
              <Button
                variant="amber"
                onClick={() => showToast('QR token regenerated. New link sent to customer.')}
              >
                Regenerate QR (Finance/CEO)
              </Button>
            </RoleGate>
          </>
        }
      >
        <InfoBanner>
          This QR code is linked to {invId} for {customer}. When the customer scans it, they confirm
          receipt via OTP.
        </InfoBanner>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 140,
                height: 140,
                border: '2px solid #000068',
                borderRadius: 6,
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 48,
              }}
            >
              ▦
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                marginTop: 8,
                fontFamily: "'DM Mono',monospace",
                wordBreak: 'break-all',
                maxWidth: 152,
              }}
            >
              confirm.sartor.ng/delivery/{invId}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center' }}>
              <Button variant="primary" size="sm" onClick={() => showToast('QR code downloaded as PNG.')}>
                <IconLabel icon="download" size={13}>Download</IconLabel>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => showToast('QR resent to customer.')}>
                Resend
              </Button>
            </div>
          </div>
          <div>
            <SDivLabel style={{ marginTop: 0 }}>Confirmation Status</SDivLabel>
            <Badge variant="amber">Pending — Awaiting Customer Scan</Badge>
            <SDivLabel>Invoice Summary</SDivLabel>
            <IRow label="Invoice" value={`${invId} · ${amount}`} />
            <IRow label="LPO Reference" value={lpoId} />
            <IRow label="Customer" value={customer} />
            <IRow label="Due Date" value={due} />
          </div>
        </div>
      </SartorModal>

      <SartorModal
        id="qr-delivery-confirm"
        open={isOpen('qr-delivery-confirm')}
        onClose={() => {
          closeModal('qr-delivery-confirm');
          setQrStep('otp');
        }}
        title="Sartor · Delivery Confirmation"
        subtitle="confirm.sartor.ng/delivery — Customer View"
        size="narrow"
        footer={null}
      >
        {qrStep === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: 'var(--N)' }}>
                Sartor Health Company Ltd
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Delivery confirmation · Powered by SartorCRM</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 9, padding: 14, marginBottom: 14 }}>
              <IRow label="Invoice" value={invId} />
              <IRow label="Customer" value={customer} />
              <IRow label="Due Date" value={due} />
              <IRow label="Invoice Amount" value={amount} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                Enter the 6-digit OTP sent to your WhatsApp
              </div>
              <PinInputs />
            </div>
            <Button variant="green" style={{ width: '100%' }} onClick={() => setQrStep('confirm')}>
              Verify OTP →
            </Button>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Button variant="outline" size="sm" onClick={() => showToast('New OTP sent to your WhatsApp.')}>
                Resend OTP
              </Button>
            </div>
          </>
        )}
        {qrStep === 'confirm' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)' }}>OTP Verified</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)' }}>Please confirm the delivery status below</div>
            </div>
            <FG label="How were the goods received?" full>
              <label style={{ display: 'flex', gap: 10, padding: '10px 12px', border: '2px solid var(--G)', borderRadius: 8, marginBottom: 8 }}>
                <input type="radio" name="qr-receipt" defaultChecked />
                <span>All goods received in good condition</span>
              </label>
              <label style={{ display: 'flex', gap: 10, padding: '10px 12px', border: '1px solid var(--brd)', borderRadius: 8 }}>
                <input type="radio" name="qr-receipt" value="discrepancy" />
                <span>Received with discrepancy</span>
              </label>
            </FG>
            <Button
              variant="green"
              style={{ width: '100%' }}
              onClick={() => {
                setQrStep('success');
                showToast('Delivery confirmed. Timestamp recorded.');
              }}
            >
              Confirm Receipt →
            </Button>
          </>
        )}
        {qrStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 10 }}>
              <Icon name="check" size={36} style={{ color: 'var(--Gd)' }} />
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: 'var(--N)' }}>
              Delivery Confirmed
            </div>
            <div style={{ fontSize: 13, color: 'var(--tx3)', margin: '8px 0 16px' }}>
              Your confirmation has been recorded.
            </div>
            <IRow label="Reference" value={invId} />
            <IRow label="Customer" value={customer} />
            <IRow label="Status" value={<Badge variant="green">All goods received</Badge>} />
            <Button variant="secondary" style={{ marginTop: 16 }} onClick={() => closeModal('qr-delivery-confirm')}>
              Close
            </Button>
          </div>
        )}
      </SartorModal>
    </>
  );
}
