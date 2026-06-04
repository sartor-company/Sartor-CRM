import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { useApp } from '../context/AppContext';
import { ROLE_META } from '../constants/roles';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const LPO_CUSTOMERS: Record<
  string,
  { label: string; addr: string; state: string; lga: string }
> = {
  freshmart: {
    label: 'FreshMart NG — Garki, Abuja',
    addr: '31 Garki Market Rd',
    state: 'FCT — Abuja',
    lga: 'Garki',
  },
  pharmacare: {
    label: 'PharmaCare Ltd — Ikeja, Lagos',
    addr: '14 Allen Avenue',
    state: 'Lagos',
    lga: 'Ikeja',
  },
  zenith: {
    label: 'Zenith Pharma (Customer) — VI',
    addr: '12 Adeola Odeku St',
    state: 'Lagos',
    lga: 'Victoria Island',
  },
};

const LPO_PRODUCTS = [
  { sku: 'SH-25-CAR', name: 'Hand Sanitiser 250ml Carabiner', price: 1200 },
  { sku: 'SH-25-SIL', name: 'Hand Sanitiser 250ml Silicone', price: 1000 },
  { sku: 'SH-25-HOK', name: 'Silicone Hook Pack', price: 1000 },
];

type LpoItem = { product: string; qty: number; price: number };

function formatNaira(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function LpoModals() {
  const { isOpen, closeModal, handleSubmit, showToast } = useModalActions();
  const { companyName, role } = useApp();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<LpoItem[]>([{ product: '', qty: 0, price: 0 }]);

  const resetWizard = () => {
    setStep(1);
    setCustomer('');
    setTerms('');
    setItems([{ product: '', qty: 0, price: 0 }]);
  };

  const createLpoOpen = isOpen('create-lpo');
  useEffect(() => {
    if (!createLpoOpen) resetWizard();
  }, [createLpoOpen]);

  const grand = items.reduce((s, i) => s + i.qty * i.price, 0);
  const cust = customer && customer !== 'new' ? LPO_CUSTOMERS[customer] : null;
  const termsLabel =
    terms === 'pod'
      ? 'Payment on Delivery (POD)'
      : terms === 'upfront'
        ? 'Upfront Payment'
        : terms === 'sor30'
          ? 'Sales or Return — SOR (30d)'
          : terms === '2wk'
            ? 'Full Payment 2 Weeks after Delivery'
            : terms === 'sold60'
              ? 'Full Payment on 60% Sold (30d)'
              : '—';

  const addRow = () => setItems((prev) => [...prev, { product: '', qty: 0, price: 0 }]);

  const updateItem = (idx: number, patch: Partial<LpoItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const onProductChange = (idx: number, sku: string) => {
    const p = LPO_PRODUCTS.find((x) => x.sku === sku);
    updateItem(idx, { product: sku, price: p?.price ?? 0 });
  };

  return (
    <>
      <SartorModal
        id="create-lpo"
        open={isOpen('create-lpo')}
        onClose={() => {
          closeModal('create-lpo');
          resetWizard();
        }}
        title={`Create LPO — Step ${step}`}
        subtitle={companyName}
        size="wide"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                if (step === 1) {
                  closeModal('create-lpo');
                  resetWizard();
                } else setStep(1);
              }}
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </Button>
            {step === 1 && (
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Preview
              </Button>
            )}
            <Button
              variant="primary"
              onClick={(e) => {
                if (step === 1) setStep(2);
                else
                  handleSubmit('create-lpo', e.currentTarget, 'LPO submitted for warehouse review.', resetWizard);
              }}
            >
              {step === 1 ? 'Next: Review →' : 'Submit LPO →'}
            </Button>
          </>
        }
      >
        <div className="step-bar">
          <div className={`step-item${step === 1 ? ' on' : ''}`}>
            <div className="step-num">1</div>
            <span>Order Details</span>
          </div>
          <div className={`step-line${step === 2 ? ' on' : ''}`} />
          <div className={`step-item${step === 2 ? ' on' : ''}`}>
            <div className="step-num">2</div>
            <span>Review & Confirm</span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <FRow>
              <FG label="Customer / Lead *" style={{ flex: 1.5 }}>
                <select
                  className="sel"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                >
                  <option value="">Select customer or lead…</option>
                  {Object.entries(LPO_CUSTOMERS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                  <option value="new">+ Add New Lead (Quick Create)</option>
                </select>
              </FG>
              <FG label="Payment Terms *">
                <select className="sel" value={terms} onChange={(e) => setTerms(e.target.value)}>
                  <option value="">Select terms…</option>
                  <option value="pod">Payment on Delivery (POD)</option>
                  <option value="upfront">Upfront Payment</option>
                  <option value="sor30">Sales or Return — SOR (30d)</option>
                  <option value="2wk">Full Payment 2 Weeks after Delivery</option>
                  <option value="sold60">Full Payment on 60% Sold (30d)</option>
                </select>
                {terms === 'pod' && (
                  <span className="fi-hint">Invoice due on delivery confirmation</span>
                )}
              </FG>
            </FRow>
            {customer === 'new' && (
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <SDivLabel style={{ marginTop: 0 }}>Quick Add Lead</SDivLabel>
                <FRow>
                  <FG label="Business Name *" className="w50">
                    <input className="inp" placeholder="Name" />
                  </FG>
                  <FG label="Phone *" className="w50">
                    <input className="inp" type="tel" placeholder="+234…" />
                  </FG>
                </FRow>
                <FG label="Street Address *" full style={{ marginBottom: 8 }}>
                  <input className="inp" placeholder="Street address" />
                </FG>
                <FRow>
                  <FG label="State *">
                    <select className="sel">
                      <option value="">State…</option>
                      <option>FCT — Abuja</option>
                      <option>Lagos</option>
                    </select>
                  </FG>
                  <FG label="LGA *">
                    <input className="inp" placeholder="LGA" />
                  </FG>
                </FRow>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx2)' }}>
                Delivery Address
              </label>
              <div
                style={{
                  marginTop: 4,
                  padding: '9px 11px',
                  background: 'var(--bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 6,
                  fontSize: 13,
                  color: cust ? 'var(--tx2)' : 'var(--tx3)',
                }}
              >
                {cust
                  ? `${cust.addr}, ${cust.lga}, ${cust.state}`
                  : '— auto-populated —'}
              </div>
            </div>
            <SDivLabel>Order Items</SDivLabel>
            <div className="lpo-items-wrap">
              <div className="lpo-items-head">
                <span>Product</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Subtotal</span>
                <span />
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="lpo-item-row">
                  <select
                    className="sel"
                    value={item.product}
                    onChange={(e) => onProductChange(idx, e.target.value)}
                  >
                    <option value="">Select product…</option>
                    {LPO_PRODUCTS.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    value={item.qty || ''}
                    onChange={(e) => updateItem(idx, { qty: Number(e.target.value) || 0 })}
                  />
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    value={item.price || ''}
                    onChange={(e) => updateItem(idx, { price: Number(e.target.value) || 0 })}
                  />
                  <span className="lpo-sub">{formatNaira(item.qty * item.price)}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn bout bxs"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <Button variant="secondary" size="sm" onClick={addRow}>
                  + Add Item
                </Button>
              </div>
              <div className="lpo-grand-row">
                <span className="lpo-grand-lbl">Grand Total:</span>
                <span className="lpo-grand-val">{formatNaira(grand)}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lpo-doc">
              <div className="lpo-doc-head">
                <div>
                  <div className="lpo-doc-title">Purchase Order</div>
                  <div className="lpo-doc-ref" style={{ color: 'rgba(255,255,255,.5)' }}>
                    PREVIEW — Not yet submitted
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'rgba(255,255,255,.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                      marginBottom: 3,
                    }}
                  >
                    Created By
                  </div>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
                    {ROLE_META[role].name} ({ROLE_META[role].role})
                  </div>
                </div>
              </div>
              <div className="lpo-doc-body">
                <div className="inv-party">
                  <div>
                    <div className="inv-party-lbl">From</div>
                    <div className="inv-party-val">{companyName}</div>
                    <div className="inv-party-addr">Abuja, FCT, Nigeria</div>
                  </div>
                  <div>
                    <div className="inv-party-lbl">Deliver To</div>
                    <div className="inv-party-val">{cust?.label ?? '—'}</div>
                    <div className="inv-party-addr">
                      {cust ? `${cust.addr}, ${cust.lga}, ${cust.state}` : '—'}
                    </div>
                  </div>
                </div>
                <div className="inv-items">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product</th>
                        <th style={{ textAlign: 'right' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter((i) => i.product).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--tx3)', padding: 12 }}>
                            Add items in Step 1
                          </td>
                        </tr>
                      ) : (
                        items
                          .filter((i) => i.product)
                          .map((i, idx) => (
                            <tr key={idx}>
                              <td>{i.product}</td>
                              <td>{LPO_PRODUCTS.find((p) => p.sku === i.product)?.name}</td>
                              <td style={{ textAlign: 'right' }}>{i.qty}</td>
                              <td style={{ textAlign: 'right' }}>{formatNaira(i.price)}</td>
                              <td style={{ textAlign: 'right' }}>{formatNaira(i.qty * i.price)}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="inv-total">
                  <div className="inv-total-box">
                    <div className="inv-total-row grand">
                      <span>Grand Total</span>
                      <span>{formatNaira(grand)}</span>
                    </div>
                  </div>
                </div>
                <div className="inv-terms">
                  <strong>Payment Terms:</strong> {termsLabel}
                </div>
              </div>
            </div>
            <InfoBanner>
              On submission, LPO awaits warehouse assignment. On dispatch, invoice auto-generates
              and customer receives PIN via SMS/WhatsApp/Email.
            </InfoBanner>
          </>
        )}
      </SartorModal>

      <SartorModal
        id="view-lpo"
        open={isOpen('view-lpo')}
        onClose={() => closeModal('view-lpo')}
        title="LPO-0042"
        subtitle="FreshMart NG · Dispatched · Payment on Delivery"
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-lpo')}>
              Close
            </Button>
            <Button variant="outline" onClick={() => showToast('Downloading PDF…')}>
              <IconLabel icon="download" size={13}>PDF</IconLabel>
            </Button>
            <Button variant="outline" onClick={() => showToast('Downloading Excel…')}>
              <IconLabel icon="download" size={13}>Excel</IconLabel>
            </Button>
          </>
        }
      >
        <div className="lpo-doc">
          <div className="lpo-doc-head">
            <div>
              <div className="lpo-doc-title">Purchase Order</div>
              <div className="lpo-doc-ref">LPO-0042</div>
            </div>
            <Badge variant="amber">Dispatched</Badge>
          </div>
          <div className="lpo-doc-body">
            <div className="inv-party">
              <div>
                <div className="inv-party-lbl">From</div>
                <div className="inv-party-val">{companyName}</div>
              </div>
              <div>
                <div className="inv-party-lbl">Deliver To</div>
                <div className="inv-party-val">FreshMart NG</div>
                <div className="inv-party-addr">
                  31 Garki Market Rd, Garki, FCT — Abuja
                  <br />
                  Attn: Adebisi Olawale (Procurement)
                </div>
              </div>
            </div>
            <div className="inv-party" style={{ marginTop: -8 }}>
              <div>
                <div className="inv-party-lbl">Created By</div>
                <div className="inv-party-val">Abubakar Idah (Admin)</div>
              </div>
              <div>
                <div className="inv-party-lbl">Terms</div>
                <div className="inv-party-val">Payment on Delivery (POD)</div>
              </div>
            </div>
            <div className="inv-items">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>SH-25-CAR</td>
                    <td>Hand Sanitiser 250ml Carabiner</td>
                    <td>BTH-2024-09A</td>
                    <td>100</td>
                    <td>₦1,200</td>
                    <td>₦120,000</td>
                  </tr>
                  <tr>
                    <td>SH-25-SIL</td>
                    <td>Hand Sanitiser 250ml Silicone</td>
                    <td>BTH-2024-08B</td>
                    <td>60</td>
                    <td>₦1,000</td>
                    <td>₦60,000</td>
                  </tr>
                  <tr>
                    <td>SH-25-HOK</td>
                    <td>Silicone Hook Pack</td>
                    <td>BTH-2024-09C</td>
                    <td>60</td>
                    <td>₦1,000</td>
                    <td>₦60,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="inv-total">
              <div className="inv-total-box">
                <div className="inv-total-row grand">
                  <span>Grand Total</span>
                  <span>₦240,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SartorModal>

      <SartorModal
        id="dispatch-lpo"
        open={isOpen('dispatch-lpo')}
        onClose={() => closeModal('dispatch-lpo')}
        title="Dispatch LPO → Generate Invoice"
        subtitle="LPO-0040 · HealthPlus Abuja"
        footer={
          <ModalFooterActions onCancel={() => closeModal('dispatch-lpo')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'dispatch-lpo',
                  e.currentTarget,
                  'LPO dispatched. Invoice INV-00043 generated. PIN sent to customer.',
                )
              }
            >
              Dispatch & Generate Invoice →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner variant="succ">
          Invoice auto-generates on dispatch. Invoice number + 6-digit PIN sent to customer via
          SMS/WhatsApp/Email.
        </InfoBanner>
        <IRow label="Customer" value="HealthPlus Abuja" />
        <IRow
          label="Amount"
          value={
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>₦96,000</span>
          }
        />
        <FG label="Assign Driver *" full>
          <select className="sel" defaultValue="">
            <option value="">Select driver…</option>
            <option>Chidi Okeke — Toyota Hilux</option>
            <option>Emeka Eze — Hino Truck</option>
          </select>
        </FG>
      </SartorModal>
    </>
  );
}
