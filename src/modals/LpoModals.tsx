import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Icon, IconLabel } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { crmApi, leadName, lpoCreatedBy, type CrmCustomer, type CrmLead, type CrmLpo } from '../api/crm';
import { useApp } from '../context/AppContext';
import { productLabel, productSku, useLiveOptions, invalidateLiveOptions } from '../hooks/useLiveOptions';
import { formatNaira, num } from '../utils/format';
import { downloadLpoExcel, downloadLpoPdf } from '../utils/lpoExport';
import { lpoStatusVariant } from '../utils/statusBadges';
import { FG, FRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

type LpoItem = { product: string; qty: number; price: number };

const TERMS_TO_API: Record<string, string> = {
  pod: 'Payment On Delivery',
  upfront: 'Upfront Payment',
  sor30: 'Sales Or Returns',
  '2wk': 'Payment 2 weeks after delivery',
  sold60: 'Full Payment after 70% stock sold',
};

export function LpoModals() {
  const { isOpen, closeModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { companyName, displayName, roleLabel } = useApp();
  const { products, customerOptions, customers, drivers } = useLiveOptions(
    isOpen('create-lpo') || isOpen('view-lpo') || isOpen('dispatch-lpo'),
  );
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<LpoItem[]>([{ product: '', qty: 0, price: 0 }]);

  const lpo = getPayload<{ lpo?: CrmLpo }>('view-lpo')?.lpo;
  const createPayload = getPayload<{ customer?: CrmCustomer; lead?: CrmLead }>('create-lpo');
  const [detailLpo, setDetailLpo] = useState<CrmLpo | null>(null);
  const [exporting, setExporting] = useState(false);

  const viewLpoOpen = isOpen('view-lpo');
  useEffect(() => {
    if (!viewLpoOpen || !lpo?._id) {
      setDetailLpo(null);
      return;
    }
    let cancelled = false;
    crmApi
      .getLpo(lpo._id)
      .then((full) => {
        if (!cancelled) setDetailLpo(full);
      })
      .catch(() => {
        if (!cancelled) setDetailLpo(lpo);
      });
    return () => {
      cancelled = true;
    };
  }, [viewLpoOpen, lpo?._id]);

  const activeLpo = detailLpo || lpo;

  const resetWizard = () => {
    setStep(1);
    setCustomer('');
    setTerms('');
    setItems([{ product: '', qty: 0, price: 0 }]);
  };

  const createLpoOpen = isOpen('create-lpo');
  useEffect(() => {
    if (!createLpoOpen) {
      resetWizard();
      return;
    }
    const pre = createPayload?.customer?._id || createPayload?.lead?._id;
    if (pre) setCustomer(pre);
  }, [createLpoOpen, createPayload?.customer?._id, createPayload?.lead?._id]);

  const grand = items.reduce((s, i) => s + i.qty * i.price, 0);
  const selectedOption = customerOptions.find((c) => c.id === customer);
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

  const onProductChange = (idx: number, id: string) => {
    const p = products.find((x) => x._id === id);
    updateItem(idx, {
      product: id,
      price: p ? num(p.sellingPrice ?? p.price) : 0,
    });
  };

  const resolveLeadId = () => {
    if (!customer || customer === 'new') return '';
    const selected = customerOptions.find((c) => c.id === customer);
    if (selected?.kind === 'lead') return customer;
    const cust = customers.find((c) => c._id === customer);
    if (!cust) return '';
    if (typeof cust.lead === 'object' && cust.lead) return cust.lead._id;
    if (typeof cust.lead === 'string') return cust.lead;
    return '';
  };

  const saveLpo = async (btn: HTMLButtonElement | null) => {
    if (saving) return;
    const leadId = resolveLeadId();
    const apiTerms = TERMS_TO_API[terms];
    const lines = items.filter((i) => i.product && i.qty > 0);
    if (!leadId) {
      showToast('Select a lead or customer with a linked lead.', 'err');
      return;
    }
    if (!apiTerms) {
      showToast('Select payment terms.', 'err');
      return;
    }
    if (!lines.length) {
      showToast('Add at least one product with quantity.', 'err');
      return;
    }
    setSaving(true);
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting…';
    }
    try {
      await crmApi.createLpo({
        lead: leadId,
        terms: apiTerms,
        product: lines.map((i) => ({ product: i.product, quantity: i.qty })),
      });
      invalidateLiveOptions();
      closeModal('create-lpo');
      resetWizard();
      showToast('LPO submitted for warehouse review.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-lpos-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to create LPO', 'err');
    } finally {
      setSaving(false);
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig || 'Submit LPO →';
      }
    }
  };

  const lpoId = activeLpo?.lpoId || (activeLpo ? activeLpo._id.slice(-6) : 'LPO');
  const lpoCustomer = activeLpo
    ? leadName(typeof activeLpo.lead === 'object' ? activeLpo.lead : null)
    : '—';

  const buildExportRows = () => {
    const rows = (activeLpo?.products || []).map((line) => {
      const prod = typeof line.product === 'object' && line.product ? line.product : null;
      const qty = Number(line.quantity) || 0;
      const unit = Number(line.unitPrice ?? line.price ?? prod?.unitPrice ?? prod?.price) || 0;
      return {
        sku: prod?.skuCode || prod?.sku || prod?.productSku || prod?.productId || prod?.barcodeNumber || '—',
        product: prod?.productName || '—',
        qty,
        unitPrice: unit,
        subtotal: Number(line.amount) || qty * unit,
      };
    });
    return {
      lpoId: String(lpoId),
      companyName,
      customerName: lpoCustomer,
      createdBy: lpoCreatedBy(activeLpo),
      terms: activeLpo?.terms || '—',
      status: activeLpo?.status || '—',
      rows,
      grandTotal: num(activeLpo?.totalAmount) || rows.reduce((s, r) => s + r.subtotal, 0),
    };
  };

  const exportPdf = async () => {
    if (!activeLpo) return;
    setExporting(true);
    try {
      if (!detailLpo && activeLpo._id) {
        const full = await crmApi.getLpo(activeLpo._id);
        setDetailLpo(full);
        downloadLpoPdf({
          ...buildExportRows(),
          rows: (full.products || []).map((line) => {
            const prod = typeof line.product === 'object' && line.product ? line.product : null;
            const qty = Number(line.quantity) || 0;
            const unit = Number(line.unitPrice ?? line.price ?? prod?.unitPrice ?? prod?.price) || 0;
            return {
              sku: prod?.skuCode || prod?.sku || prod?.productSku || prod?.productId || prod?.barcodeNumber || '—',
              product: prod?.productName || '—',
              qty,
              unitPrice: unit,
              subtotal: Number(line.amount) || qty * unit,
            };
          }),
          grandTotal: num(full.totalAmount),
          createdBy: lpoCreatedBy(full),
          terms: full.terms || '—',
          status: full.status || '—',
        });
      } else {
        downloadLpoPdf(buildExportRows());
      }
      showToast('PDF downloaded.', 'ok');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'PDF download failed', 'err');
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    if (!activeLpo) return;
    setExporting(true);
    try {
      if (!detailLpo && activeLpo._id) {
        const full = await crmApi.getLpo(activeLpo._id);
        setDetailLpo(full);
        downloadLpoExcel({
          lpoId: String(full.lpoId || full._id.slice(-6)),
          companyName,
          customerName: leadName(typeof full.lead === 'object' ? full.lead : null),
          createdBy: lpoCreatedBy(full),
          terms: full.terms || '—',
          status: full.status || '—',
          rows: (full.products || []).map((line) => {
            const prod = typeof line.product === 'object' && line.product ? line.product : null;
            const qty = Number(line.quantity) || 0;
            const unit = Number(line.unitPrice ?? line.price ?? prod?.unitPrice ?? prod?.price) || 0;
            return {
              sku: prod?.skuCode || prod?.sku || prod?.productSku || prod?.productId || prod?.barcodeNumber || '—',
              product: prod?.productName || '—',
              qty,
              unitPrice: unit,
              subtotal: Number(line.amount) || qty * unit,
            };
          }),
          grandTotal: num(full.totalAmount),
        });
      } else {
        downloadLpoExcel(buildExportRows());
      }
      showToast('Excel downloaded.', 'ok');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Excel download failed', 'err');
    } finally {
      setExporting(false);
    }
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
              disabled={saving}
              onClick={(e) => {
                if (step === 1) setStep(2);
                else void saveLpo(e.currentTarget);
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
                  {customerOptions.map((c) => (
                    <option key={`${c.kind}-${c.id}`} value={c.id}>
                      {c.label}
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
                  color: selectedOption ? 'var(--tx2)' : 'var(--tx3)',
                }}
              >
                {selectedOption ? selectedOption.label : '— select customer / lead —'}
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
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {productLabel(p)}
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
                    {displayName} ({roleLabel})
                  </div>
                </div>
              </div>
              <div className="lpo-doc-body">
                <div className="inv-party">
                  <div>
                    <div className="inv-party-lbl">From</div>
                    <div className="inv-party-val">{companyName}</div>
                  </div>
                  <div>
                    <div className="inv-party-lbl">Deliver To</div>
                    <div className="inv-party-val">{selectedOption?.label ?? '—'}</div>
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
                          .map((i, idx) => {
                            const p = products.find((x) => x._id === i.product);
                            return (
                              <tr key={idx}>
                                <td>{p ? productSku(p) : '—'}</td>
                                <td>{p?.productName || '—'}</td>
                                <td style={{ textAlign: 'right' }}>{i.qty}</td>
                                <td style={{ textAlign: 'right' }}>{formatNaira(i.price)}</td>
                                <td style={{ textAlign: 'right' }}>{formatNaira(i.qty * i.price)}</td>
                              </tr>
                            );
                          })
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
        title={lpoId}
        subtitle={
          activeLpo
            ? `${lpoCustomer} · ${activeLpo.status || '—'} · ${activeLpo.terms || '—'}`
            : 'Open an LPO from the list'
        }
        size="wide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-lpo')}>
              Close
            </Button>
            <Button variant="outline" disabled={exporting || !activeLpo} onClick={() => void exportPdf()}>
              <IconLabel icon="download" size={13}>PDF</IconLabel>
            </Button>
            <Button variant="outline" disabled={exporting || !activeLpo} onClick={() => void exportExcel()}>
              <IconLabel icon="download" size={13}>Excel</IconLabel>
            </Button>
          </>
        }
      >
        {!activeLpo ? (
          <InfoBanner>No LPO selected.</InfoBanner>
        ) : (
          <div className="lpo-doc">
            <div className="lpo-doc-head">
              <div>
                <div className="lpo-doc-title">Purchase Order</div>
                <div className="lpo-doc-ref">{lpoId}</div>
              </div>
              <Badge variant={lpoStatusVariant(activeLpo.status)}>{activeLpo.status || '—'}</Badge>
            </div>
            <div className="lpo-doc-body">
              <div className="inv-party">
                <div>
                  <div className="inv-party-lbl">From</div>
                  <div className="inv-party-val">{companyName}</div>
                </div>
                <div>
                  <div className="inv-party-lbl">Deliver To</div>
                  <div className="inv-party-val">{lpoCustomer}</div>
                </div>
              </div>
              <div className="inv-party" style={{ marginTop: -8 }}>
                <div>
                  <div className="inv-party-lbl">Created By</div>
                  <div className="inv-party-val">{lpoCreatedBy(activeLpo)}</div>
                </div>
                <div>
                  <div className="inv-party-lbl">Terms</div>
                  <div className="inv-party-val">{activeLpo.terms || '—'}</div>
                </div>
              </div>
              {(activeLpo.products?.length ?? 0) > 0 && (
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
                      {activeLpo.products!.map((line, idx) => {
                        const prod =
                          typeof line.product === 'object' && line.product ? line.product : null;
                        const qty = Number(line.quantity) || 0;
                        const unit =
                          Number(line.unitPrice ?? line.price ?? prod?.unitPrice ?? prod?.price) || 0;
                        const sub = Number(line.amount) || qty * unit;
                        return (
                          <tr key={line._id || idx}>
                            <td>{prod?.skuCode || prod?.sku || prod?.productSku || prod?.productId || prod?.barcodeNumber || '—'}</td>
                            <td>{prod?.productName || '—'}</td>
                            <td style={{ textAlign: 'right' }}>{qty}</td>
                            <td style={{ textAlign: 'right' }}>{formatNaira(unit)}</td>
                            <td style={{ textAlign: 'right' }}>{formatNaira(sub)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="inv-total">
                <div className="inv-total-box">
                  <div className="inv-total-row">
                    <span>Quantity</span>
                    <span>{activeLpo.totalQuantity ?? '—'}</span>
                  </div>
                  <div className="inv-total-row grand">
                    <span>Grand Total</span>
                    <span>{formatNaira(num(activeLpo.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SartorModal>

      <SartorModal
        id="dispatch-lpo"
        open={isOpen('dispatch-lpo')}
        onClose={() => closeModal('dispatch-lpo')}
        title="Dispatch LPO → Generate Invoice"
        subtitle="Assign a driver and confirm dispatch"
        footer={
          <ModalFooterActions onCancel={() => closeModal('dispatch-lpo')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit(
                  'dispatch-lpo',
                  e.currentTarget,
                  'LPO dispatched. Invoice generated. PIN sent to customer.',
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
        <FG label="Assign Driver *" full>
          <select className="sel" defaultValue="">
            <option value="">Select driver…</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
                {d.vehicleMake || d.vehicleModel
                  ? ` — ${[d.vehicleMake, d.vehicleModel].filter(Boolean).join(' ')}`
                  : ''}
                {d.status ? ` · ${d.status}` : ''}
              </option>
            ))}
          </select>
        </FG>
      </SartorModal>
    </>
  );
}
