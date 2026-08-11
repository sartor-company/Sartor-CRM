import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { billingApi, type PlatformInvoice } from '../api/billing';
import { TIER_LABELS, TIER_PRICING } from '../constants/tiers';
import { formatNaira, usePaymentIntent } from '../context/PaymentIntentContext';
import { useAuthStore } from '../store/authStore';
import type { TierId } from '../types';
import { formatDate } from '../utils/format';
import { FG, FRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

type BillingCycle = 'monthly' | 'annual';

type SartorInvoice = {
  no: string;
  date: string;
  description: string;
  amount: number;
  dueIn: string;
  status: 'due' | 'paid' | 'overdue';
  lines: { desc: string; amount: number }[];
};

function mapPlatformInvoice(inv: PlatformInvoice): SartorInvoice {
  const s = String(inv.status || '').toLowerCase();
  const status: SartorInvoice['status'] =
    s === 'paid' ? 'paid' : s === 'overdue' ? 'overdue' : 'due';
  let dueIn = '—';
  if (status === 'paid') dueIn = 'Paid';
  else if (inv.dueAt) {
    const due = new Date(inv.dueAt).getTime();
    if (!Number.isNaN(due)) {
      const days = Math.ceil((due - Date.now()) / 86_400_000);
      if (days < 0) dueIn = `${Math.abs(days)}d overdue`;
      else if (days === 0) dueIn = 'Due today';
      else dueIn = `${days} days`;
    }
  }
  return {
    no: inv.invoiceId || inv._id.slice(-8),
    date: formatDate(inv.issuedAt),
    description: inv.description || 'Sartor subscription',
    amount: inv.amount ?? 0,
    dueIn,
    status,
    lines:
      inv.lineItems?.map((l) => ({
        desc: l.desc || 'Line item',
        amount: l.amt ?? 0,
      })) || [{ desc: inv.description || 'Subscription', amount: inv.amount ?? 0 }],
  };
}

export function BillingModals() {
  const { isOpen, closeModal, openModal, handleSubmit, showToast } = useModalActions();
  const { intent, setIntent } = usePaymentIntent();

  const [planBilling, setPlanBilling] = useState<BillingCycle>('monthly');
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [revSeats, setRevSeats] = useState(3);
  const [opSeats, setOpSeats] = useState(2);
  const [viewInvoice, setViewInvoice] = useState<SartorInvoice | null>(null);
  const [sartorInvoices, setSartorInvoices] = useState<SartorInvoice[]>([]);
  const [convBilling, setConvBilling] = useState<BillingCycle>('monthly');

  useEffect(() => {
    if (!useAuthStore.getState().token) return;
    let cancelled = false;
    void billingApi
      .listInvoices()
      .then((rows) => {
        if (cancelled) return;
        setSartorInvoices(rows.map(mapPlatformInvoice));
      })
      .catch(() => {
        if (!cancelled) setSartorInvoices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const changePlanOpen = isOpen('change-plan');
  useEffect(() => {
    if (changePlanOpen) {
      setSelectedTier(null);
      setPlanBilling('monthly');
      setRevSeats(3);
      setOpSeats(2);
    }
  }, [changePlanOpen]);

  const planTotal = useMemo(() => {
    if (!selectedTier) return 0;
    const annual = planBilling === 'annual';
    if (selectedTier === '360') {
      return annual ? TIER_PRICING['360'].flatAnn : TIER_PRICING['360'].flatMo;
    }
    if (selectedTier === 'sn') {
      const rate = annual ? TIER_PRICING.sn.revSeatAnn : TIER_PRICING.sn.revSeatMo;
      return rate * Math.max(revSeats, TIER_PRICING.sn.minSeats);
    }
    const rev = annual ? TIER_PRICING.snp.revSeatAnn : TIER_PRICING.snp.revSeatMo;
    const op = annual ? TIER_PRICING.snp.opSeatAnn : TIER_PRICING.snp.opSeatMo;
    return rev * revSeats + op * opSeats;
  }, [selectedTier, planBilling, revSeats, opSeats]);

  const openGateway = (amountNaira: number, description: string, reference: string) => {
    setIntent({
      amountNaira,
      amountLabel: formatNaira(amountNaira),
      description,
      reference,
    });
    openModal('payment-gateway');
  };

  const confirmPlanChange = () => {
    if (!selectedTier) return;
    closeModal('change-plan');
    openGateway(
      planTotal,
      `Switch to ${TIER_LABELS[selectedTier]}`,
      planBilling === 'annual' ? 'Annual lump sum' : 'Monthly billing',
    );
  };

  const adjustSeats = (kind: 'rev' | 'op', delta: number) => {
    if (kind === 'rev') {
      const min = selectedTier === 'snp' ? 1 : TIER_PRICING.sn.minSeats;
      setRevSeats((n) => Math.max(min, n + delta));
    } else {
      setOpSeats((n) => Math.max(0, n + delta));
    }
  };

  const convAmount = convBilling === 'annual' ? 800_000 : 83_333;

  return (
    <>
      {/* Billing cycle */}
      <SartorModal
        id="billing-cycle"
        open={isOpen('billing-cycle')}
        onClose={() => closeModal('billing-cycle')}
        title="Switch Billing Cycle"
        subtitle="Sartor CRM 360 · Full Deployment · Year 1 · Currently: Monthly"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('billing-cycle')}>
            <Button
              variant="green"
              style={{ flex: 1, justifyContent: 'center', minWidth: 180 }}
              onClick={() => {
                closeModal('billing-cycle');
                openGateway(7_200_000, 'Sartor CRM 360 Annual', 'Switch to annual lump sum');
              }}
            >
              Switch to Annual — Pay ₦7,200,000
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="info">
          20% discount applies to both SC+DORA deployment and CRM subscription when paid as an annual lump sum
          upfront. Monthly billing carries no discount.
        </InfoBanner>

        <div style={{ border: '2px solid var(--N)', borderRadius: 9, padding: 14, background: 'var(--bb)', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong style={{ color: 'var(--bt)' }}>Monthly Billing</strong>
            <Badge variant="gray">Current</Badge>
          </div>
          <PriceRow
            label="SC + DORA AI deployment (Year 1 split)"
            value={`${formatNaira(Math.round(TIER_PRICING['360'].flatMo / 2))}/mo`}
          />
          <PriceRow
            label="CRM 360 subscription · Unlimited users"
            value={`${formatNaira(Math.round(TIER_PRICING['360'].flatMo / 2))}/mo`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, fontWeight: 700 }}>
            <span>Year 1 monthly total</span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--N)' }}>
              {formatNaira(TIER_PRICING['360'].flatMo)}/mo
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--bt)', marginTop: 4 }}>
            Billed monthly · No discount · 12-month minimum
          </div>
        </div>

        <div style={{ border: '2px solid var(--G)', borderRadius: 9, padding: 14, background: 'var(--Gb)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong style={{ color: 'var(--Gd)' }}>Annual Billing — Lump Sum Upfront</strong>
            <Badge variant="green">
              Save {formatNaira(TIER_PRICING['360'].flatMo * 12 - TIER_PRICING['360'].flatAnn)}
            </Badge>
          </div>
          <PriceRow
            label="SC + DORA AI deployment (annual, 20% off)"
            value={formatNaira(Math.round(TIER_PRICING['360'].flatAnn / 2))}
            green
          />
          <PriceRow
            label="CRM 360 subscription (annual, 20% off)"
            value={formatNaira(Math.round(TIER_PRICING['360'].flatAnn / 2))}
            green
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: 'var(--Gd)' }}>Year 1 annual lump sum</span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--Gd)' }}>
              {formatNaira(TIER_PRICING['360'].flatAnn)}
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--Gd)', marginTop: 4 }}>
            Paid in full upfront · 20% off both components
          </div>
        </div>
        <div style={{ padding: '9px 11px', background: 'var(--ab)', borderRadius: 7, fontSize: 11, color: 'var(--at)' }}>
          ⚠ <strong>Pilot fee (₦3,500,000) is always a flat one-time charge</strong> — no monthly split, no discount,
          regardless of billing cycle.
        </div>
      </SartorModal>

      {/* Change plan */}
      <SartorModal
        id="change-plan"
        open={isOpen('change-plan')}
        onClose={() => closeModal('change-plan')}
        title="Change Sartor CRM Plan"
        subtitle="Current: Sartor CRM 360 · Unlimited users · Flat monthly fee"
        footer={
          <ModalFooterActions onCancel={() => closeModal('change-plan')}>
            <Button variant="green" disabled={!selectedTier} onClick={confirmPlanChange}>
              Review & Pay →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="warn">
          Downgrading from CRM 360 removes Sartor-Chain, DORA AI, and operational modules immediately at next billing
          cycle.
        </InfoBanner>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg)',
            border: '1px solid var(--brd)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx2)' }}>Billing:</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="radio"
              name="plan-billing"
              checked={planBilling === 'monthly'}
              onChange={() => setPlanBilling('monthly')}
              style={{ accentColor: 'var(--N)' }}
            />
            Monthly <span style={{ color: 'var(--tx3)' }}>(no discount)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="radio"
              name="plan-billing"
              checked={planBilling === 'annual'}
              onChange={() => setPlanBilling('annual')}
              style={{ accentColor: 'var(--G)' }}
            />
            Annual lump sum{' '}
            <span style={{ background: 'var(--G)', color: '#000', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 8 }}>
              Save 20%
            </span>
          </label>
        </div>

        <div className="plan-compare-grid" style={{ marginBottom: 14 }}>
          <PlanPickCard
            selected={selectedTier === 'sn'}
            onClick={() => setSelectedTier('sn')}
            title={TIER_LABELS.sn}
            tag="T1 · Per revenue seat"
            price={
              planBilling === 'monthly' ? (
                <>
                  {formatNaira(TIER_PRICING.sn.revSeatMo)}
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx3)' }}>/seat/mo</span>
                </>
              ) : (
                <>
                  {formatNaira(TIER_PRICING.sn.revSeatAnn)}
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx3)' }}>/seat/yr — 20% off</span>
                </>
              )
            }
            hint={`Min ${TIER_PRICING.sn.minSeats} revenue seats`}
            features={
              <>
                Pipeline & Leads
                <br />
                LPOs & Invoices
                <br />
                <span style={{ color: 'var(--rt)' }}>
                  No WH / Drivers / GRN
                  <br />
                  No Sartor-Chain / DORA AI
                </span>
              </>
            }
          />
          <PlanPickCard
            selected={selectedTier === 'snp'}
            onClick={() => setSelectedTier('snp')}
            title={TIER_LABELS.snp}
            tag="T2 · Revenue + Operational"
            purple
            price={
              planBilling === 'monthly' ? (
                <>
                  {formatNaira(TIER_PRICING.snp.revSeatMo)}
                  <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>/rev seat/mo</span>
                  <br />
                  {formatNaira(TIER_PRICING.snp.opSeatMo)}
                  <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>/op seat/mo</span>
                </>
              ) : (
                <>
                  {formatNaira(TIER_PRICING.snp.revSeatAnn)}
                  <span style={{ fontSize: 10, fontWeight: 400 }}>/rev — 20% off</span>
                  <br />
                  {formatNaira(TIER_PRICING.snp.opSeatAnn)}
                  <span style={{ fontSize: 10, fontWeight: 400 }}>/op — 20% off</span>
                </>
              )
            }
            hint={`Min ${TIER_PRICING.snp.minSeats} seats total`}
            features={
              <>
                Everything in Field +
                <br />
                Warehouses & Drivers
                <br />
                GRN / Receive Stock
                <br />
                <span style={{ opacity: 0.6 }}>No Sartor-Chain</span>
              </>
            }
          />
          <PlanPickCard
            selected={selectedTier === '360'}
            onClick={() => setSelectedTier('360')}
            title={TIER_LABELS['360']}
            tag="T3 · Flat fee · Unlimited users"
            green
            price={
              planBilling === 'monthly' ? (
                <>
                  {formatNaira(TIER_PRICING['360'].flatMo)}
                  <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>/mo flat</span>
                </>
              ) : (
                <>
                  {formatNaira(TIER_PRICING['360'].flatAnn)}
                  <span style={{ fontSize: 10, fontWeight: 400 }}>/yr — 20% off</span>
                </>
              )
            }
            hint="Unlimited users · no per-seat charge"
            features={
              <>
                Everything in Depot +
                <br />
                Sartor-Chain + DORA AI
                <br />
                Stock Reconciliation
                <br />
                Field Intelligence
              </>
            }
          />
        </div>

        {selectedTier && selectedTier !== '360' && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--brd)', borderRadius: 9, padding: 14, marginBottom: 12 }}>
            <SDivLabel style={{ marginBottom: 10 }}>Seat Configuration</SDivLabel>
            <div className="g2">
              <FG label={selectedTier === 'snp' ? 'Revenue Seats *' : 'Revenue Seats *'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => adjustSeats('rev', -1)}>
                    −
                  </Button>
                  <input
                    className="inp"
                    type="number"
                    value={revSeats}
                    min={selectedTier === 'sn' ? 3 : 1}
                    onChange={(e) => setRevSeats(Number(e.target.value) || 0)}
                    style={{ textAlign: 'center', fontFamily: "'DM Mono',monospace", fontWeight: 700, width: 70 }}
                  />
                  <Button variant="secondary" size="sm" onClick={() => adjustSeats('rev', 1)}>
                    +
                  </Button>
                </div>
              </FG>
              {selectedTier === 'snp' && (
                <FG label="Operational Seats">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={() => adjustSeats('op', -1)}>
                      −
                    </Button>
                    <input
                      className="inp"
                      type="number"
                      value={opSeats}
                      min={0}
                      onChange={(e) => setOpSeats(Number(e.target.value) || 0)}
                      style={{ textAlign: 'center', fontFamily: "'DM Mono',monospace", fontWeight: 700, width: 70 }}
                    />
                    <Button variant="secondary" size="sm" onClick={() => adjustSeats('op', 1)}>
                      +
                    </Button>
                  </div>
                </FG>
              )}
            </div>
            <div style={{ marginTop: 12, background: 'var(--N)', borderRadius: 8, padding: '12px 14px' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px',
                  marginBottom: 8,
                }}
              >
                Price Breakdown
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                <span>{planBilling === 'annual' ? 'Annual Total' : 'Monthly Total'}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--G)' }}>{formatNaira(planTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </SartorModal>

      {/* Payment gateway */}
      <SartorModal
        id="payment-gateway"
        open={isOpen('payment-gateway')}
        onClose={() => closeModal('payment-gateway')}
        title="💳 Secure Payment"
        subtitle="Powered by Paystack · SSL encrypted"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('payment-gateway')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'payment-gateway',
                  e.currentTarget,
                  `Payment of ${intent.amountLabel} successful. Receipt sent to your email.`,
                )
              }
            >
              Pay Now
            </Button>
          </ModalFooterActions>
        }
      >
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--brd)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 2 }}>Amount due</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, fontWeight: 700, color: 'var(--N)' }}>
              {intent.amountLabel}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{intent.description}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{intent.reference}</div>
          </div>
        </div>
        <FG label="Card Number" style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="0000 0000 0000 0000" maxLength={19} />
        </FG>
        <FRow>
          <FG label="Expiry Date" className="w50">
            <input className="inp" placeholder="MM / YY" maxLength={7} />
          </FG>
          <FG label="CVV" className="w50">
            <input className="inp" placeholder="•••" maxLength={4} type="password" />
          </FG>
        </FRow>
        <FG label="Cardholder Name" style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Name on card" />
        </FG>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            background: 'var(--Gb)',
            borderRadius: 7,
            fontSize: 11,
            color: 'var(--Gd)',
          }}
        >
          🔒 This payment is secured with TLS 256-bit encryption. Card details are processed by Paystack and never stored
          on Sartor servers.
        </div>
      </SartorModal>

      {/* Sartor invoice */}
      <SartorModal
        id="sartor-invoice"
        open={isOpen('sartor-invoice')}
        onClose={() => closeModal('sartor-invoice')}
        title={viewInvoice?.no ?? 'Invoice'}
        subtitle="Payable to Sartor Limited"
        footer={
          <ModalFooterActions onCancel={() => closeModal('sartor-invoice')} cancelLabel="Close">
            <Button variant="secondary" onClick={() => showToast('Downloading invoice PDF…', 'ok')}>
              📄 Download PDF
            </Button>
            {viewInvoice?.status !== 'paid' && (
              <Button
                variant="green"
                onClick={() => {
                  if (!viewInvoice) return;
                  closeModal('sartor-invoice');
                  openGateway(viewInvoice.amount, viewInvoice.description, viewInvoice.no);
                }}
              >
                💳 Pay Now →
              </Button>
            )}
          </ModalFooterActions>
        }
      >
        {viewInvoice && (
          <>
            {viewInvoice.status === 'paid' && (
              <div
                style={{
                  borderRadius: 8,
                  padding: '10px 13px',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 14,
                  background: 'var(--Gb)',
                  color: 'var(--Gd)',
                }}
              >
                ✓ Paid — thank you
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  From
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--N)' }}>Sartor Limited</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>RC 1845734 · Abuja, FCT</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  Invoice
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: 'var(--N)' }}>
                  {viewInvoice.no}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{viewInvoice.date}</div>
              </div>
            </div>
            <div style={{ border: '1px solid var(--brd)', borderRadius: 9, overflow: 'hidden', marginBottom: 14 }}>
              <div
                style={{
                  background: 'var(--bg)',
                  padding: '8px 13px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--tx3)',
                  textTransform: 'uppercase',
                  letterSpacing: '.4px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                }}
              >
                <span>Description</span>
                <span>Amount</span>
              </div>
              {viewInvoice.lines.map((l) => (
                <div
                  key={l.desc}
                  style={{
                    padding: '10px 13px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 10,
                    fontSize: 12,
                    borderTop: '1px solid var(--brd)',
                  }}
                >
                  <span>{l.desc}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(l.amount)}</span>
                </div>
              ))}
              <div
                style={{
                  padding: '11px 13px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  borderTop: '2px solid var(--brd)',
                  background: 'var(--bg)',
                }}
              >
                <span>Total Due</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--N)' }}>
                  {formatNaira(viewInvoice.amount)}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.6 }}>
              Payment is processed securely via Sartor&apos;s payment gateway (Paystack). Your subscription updates
              automatically once payment is confirmed.
            </div>
          </>
        )}
      </SartorModal>

      {/* Domain upgrade */}
      <SartorModal
        id="domain-upgrade"
        open={isOpen('domain-upgrade')}
        onClose={() => closeModal('domain-upgrade')}
        title="Verification Domain Upgrade"
        subtitle="Applies to new QR batches only. Existing printed QR codes continue to work permanently."
        footer={
          <Button variant="secondary" onClick={() => closeModal('domain-upgrade')}>
            Close
          </Button>
        }
      >
        <div style={{ border: '2px solid var(--G)', borderRadius: 9, padding: 13, background: 'var(--Gb)', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <strong style={{ color: 'var(--Gd)' }}>Starter — Active</strong>
            <Badge variant="green">Current</Badge>
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--Gd)', marginBottom: 3 }}>
            verify.dorascan.ai/{'{client_code}'}/{'{order_token}'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--Gd)' }}>Default for all accounts · Included at no charge</div>
        </div>

        <div style={{ border: '1px solid var(--brd)', borderRadius: 9, padding: 13, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Growth Subdomain</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>
            verify-{'{clientname}'}.dorascan.ai/{'{order_token}'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 6 }}>
            Your brand name in the hostname · Custom brand theme · Sartor manages DNS under *.dorascan.ai wildcard SSL
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, marginBottom: 8 }}>
            <span>
              <strong>₦100,000</strong> one-time setup
            </span>
            <span>
              <strong>₦50,000/year</strong> maintenance
            </span>
          </div>
          <FG label="Preferred subdomain name" style={{ marginBottom: 8 }}>
            <input className="inp" placeholder="e.g. sartorhealth → verify-sartorhealth.dorascan.ai" />
          </FG>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              closeModal('domain-upgrade');
              openGateway(100_000, 'Growth Subdomain setup', 'Domain upgrade');
            }}
          >
            Pay ₦100,000 & Request →
          </Button>
        </div>

        <div style={{ border: '1px solid var(--brd)', borderRadius: 9, padding: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Enterprise CNAME</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>
            verify.{'{clientdomain}'}.com/{'{order_token}'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 4 }}>
            Fully client-owned domain · Individual SSL · Client adds CNAME at DNS provider
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <span>
              <strong>₦150,000</strong> setup
            </span>
            <span>
              <strong>₦200,000/year</strong> maintenance
            </span>
            <span>
              <strong>₦350,000</strong> Year 1 total
            </span>
          </div>
          <FG label="Your verification domain" style={{ marginBottom: 8 }}>
            <input className="inp" placeholder="e.g. verify.yourcompany.com" />
          </FG>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              closeModal('domain-upgrade');
              openGateway(350_000, 'Enterprise CNAME Year 1', 'Domain upgrade');
            }}
          >
            Pay ₦350,000 & Request →
          </Button>
        </div>
      </SartorModal>

      {/* Pilot convert */}
      <SartorModal
        id="pilot-convert"
        open={isOpen('pilot-convert')}
        onClose={() => closeModal('pilot-convert')}
        title="Convert Pilot to Full Deployment"
        subtitle="Pilot fee already paid: ₦3,500,000 · Credited toward Full Deployment"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('pilot-convert')}>
            <Button
              variant="green"
              onClick={() => {
                closeModal('pilot-convert');
                openGateway(
                  convAmount,
                  'Pilot → Full Deployment',
                  convBilling === 'annual' ? 'Annual conversion' : 'Monthly conversion',
                );
              }}
            >
              Pay {formatNaira(convAmount)} — Convert Now →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ">
          You&apos;ve completed your 90-day pilot. Your ₦3,500,000 pilot fee is fully credited. You only pay the
          conversion difference (₦1,000,000) to convert to Full Deployment.
        </InfoBanner>

        <div style={{ background: 'var(--bg)', border: '1px solid var(--brd)', borderRadius: 9, padding: 14, marginBottom: 12 }}>
          <SDivLabel style={{ marginBottom: 10 }}>Conversion Fee</SDivLabel>
          <PriceRow label="Full Deployment fee (standalone)" value="₦4,500,000" />
          <PriceRow label="Less: Pilot fee already paid" value="−₦3,500,000" green />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, fontWeight: 700 }}>
            <span>Conversion fee due</span>
            <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--N)' }}>₦1,000,000</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg)', border: '1px solid var(--brd)', borderRadius: 9, padding: 14, marginBottom: 12 }}>
          <SDivLabel style={{ marginBottom: 10 }}>Payment Option</SDivLabel>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              border: `2px solid ${convBilling === 'monthly' ? 'var(--N)' : 'var(--brd)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            <input
              type="radio"
              checked={convBilling === 'monthly'}
              onChange={() => setConvBilling('monthly')}
              style={{ marginTop: 3, accentColor: 'var(--N)' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                Pay monthly <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>(no discount)</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                ₦1,000,000 ÷ 12 = <strong>₦83,333/month</strong> for 12 months
              </div>
            </div>
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '10px 12px',
              border: `2px solid ${convBilling === 'annual' ? 'var(--G)' : 'var(--brd)'}`,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              checked={convBilling === 'annual'}
              onChange={() => setConvBilling('annual')}
              style={{ marginTop: 3, accentColor: 'var(--G)' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                Pay annual lump sum{' '}
                <span style={{ background: 'var(--G)', color: '#000', fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 8 }}>
                  Save 20%
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                ₦1,000,000 × 80% = <strong style={{ color: 'var(--Gd)' }}>₦800,000 upfront</strong>
              </div>
            </div>
          </label>
        </div>
      </SartorModal>

      <SartorInvoiceBridge
        invoices={sartorInvoices}
        onView={(inv) => {
          setViewInvoice(inv);
          openModal('sartor-invoice');
        }}
      />
    </>
  );
}

/** Lets Settings open a specific Sartor invoice without prop drilling */
function SartorInvoiceBridge({
  invoices,
  onView,
}: {
  invoices: SartorInvoice[];
  onView: (inv: SartorInvoice) => void;
}) {
  useEffect(() => {
    const handler = (e: Event) => {
      const no = (e as CustomEvent<string>).detail;
      const inv = invoices.find((i) => i.no === no) ?? invoices[0];
      if (inv) onView(inv);
    };
    window.addEventListener('open-sartor-invoice', handler);
    return () => window.removeEventListener('open-sartor-invoice', handler);
  }, [invoices, onView]);
  return null;
}

export function openSartorInvoice(invoiceNo: string) {
  window.dispatchEvent(new CustomEvent('open-sartor-invoice', { detail: invoiceNo }));
}

export type { SartorInvoice };

function PriceRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 0',
        borderBottom: '1px solid rgba(0,0,0,.06)',
        fontSize: 12,
        gap: 12,
      }}
    >
      <span style={{ color: green ? 'var(--Gd)' : 'var(--bt)' }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: green ? 'var(--Gd)' : 'var(--N)', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}

function PlanPickCard({
  title,
  tag,
  price,
  hint,
  features,
  selected,
  onClick,
  purple,
  green,
}: {
  title: string;
  tag: string;
  price: ReactNode;
  hint: string;
  features: ReactNode;
  selected: boolean;
  onClick: () => void;
  purple?: boolean;
  green?: boolean;
}) {
  return (
    <div
      className={`plan-card${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        border: green ? '2px solid var(--G)' : purple ? '1px solid var(--pur)' : '1px solid var(--brd)',
        borderRadius: 9,
        padding: 13,
        cursor: 'pointer',
        background: green ? '#E6FAF0' : purple ? 'var(--pb)' : undefined,
      }}
    >
      <div
        style={{
          fontFamily: "'Fraunces',serif",
          fontSize: 13,
          fontWeight: 700,
          color: green ? 'var(--Gd)' : purple ? 'var(--pt)' : 'var(--tx2)',
          marginBottom: 3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: green ? 'var(--Gd)' : purple ? 'var(--pt)' : 'var(--tx3)',
          opacity: purple ? 0.7 : 1,
          textTransform: 'uppercase',
          letterSpacing: '.3px',
          marginBottom: 8,
        }}
      >
        {tag}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: green || purple ? 14 : 16,
          fontWeight: 700,
          color: green ? 'var(--Gd)' : purple ? 'var(--pt)' : 'var(--N)',
        }}
      >
        {price}
      </div>
      <div style={{ fontSize: 10, color: green ? 'var(--Gd)' : purple ? 'var(--pt)' : 'var(--tx3)', opacity: purple ? 0.7 : green ? 0.8 : 1, marginBottom: 9 }}>
        {hint}
      </div>
      <div style={{ fontSize: 11, color: green ? 'var(--Gd)' : purple ? 'var(--pt)' : 'var(--tx3)', opacity: purple || green ? 0.9 : 1, lineHeight: 1.8 }}>
        {features}
      </div>
    </div>
  );
}
