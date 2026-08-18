import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge, Button, Icon, IconLabel, PageHead, QueryState } from '../components/ui';
import { billingApi, type PlatformInvoice } from '../api/billing';
import { teamApi } from '../api/team';
import { TIER_LABELS, TIER_PRICING } from '../constants/tiers';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { formatNaira } from '../context/PaymentIntentContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { openSartorInvoice } from '../modals/BillingModals';
import { useAuthStore } from '../store/authStore';
import type { BadgeVariant } from '../types';
import { formatDate } from '../utils/format';
import { billingInvoiceVariant } from '../utils/statusBadges';

type SettingsPanel = 'users' | 'thresholds' | 'commission' | 'categories' | 'notifications' | 'billing';

function Panel({
  id,
  active,
  children,
}: {
  id: SettingsPanel;
  active: SettingsPanel;
  children: ReactNode;
}) {
  if (active !== id) return null;
  return (
    <div id={`sp-${id}`} className="on">
      {children}
    </div>
  );
}

const PANEL_LABELS: Record<SettingsPanel, string> = {
  users: 'Users & Roles',
  thresholds: 'Approval Thresholds',
  commission: 'Commission Config',
  categories: 'Product Categories',
  notifications: 'Notifications',
  billing: 'Subscription & Billing',
};

function roleVariant(role?: string): BadgeVariant {
  const r = (role || '').toLowerCase();
  if (r.includes('owner') || r.includes('admin') || r.includes('ceo')) return 'navy';
  if (r.includes('rep') || r.includes('sales')) return 'blue';
  if (r.includes('merch')) return 'purple';
  if (r.includes('warehouse') || r.includes('inventory') || r.includes('wh')) return 'amber';
  if (r.includes('finance') || r.includes('manager')) return 'teal';
  if (r.includes('driver')) return 'gray';
  return 'gray';
}

function dueInLabel(inv: PlatformInvoice) {
  if (String(inv.status || '').toLowerCase() === 'paid') return 'Paid';
  if (!inv.dueAt) return '—';
  const due = new Date(inv.dueAt).getTime();
  if (Number.isNaN(due)) return '—';
  const days = Math.ceil((due - Date.now()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days} days`;
}

function mapBillingStatus(status?: string): 'due' | 'paid' | 'overdue' {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'paid';
  if (s === 'overdue') return 'overdue';
  return 'due';
}

export default function SettingsPage() {
  const { isCeo, tier, displayName } = useApp();
  const authUser = useAuthStore((s) => s.user);
  const { openModal } = useModal();
  const { showToast } = useToast();
  const isSnp = tier === 'snp' || tier === '360';
  const { data: members = [], loading: usersLoading, error: usersError } = useApiQuery(
    () => teamApi.listUsers(),
    [],
  );
  const { data: billingInvoices, loading: billingLoading } = useApiQuery(
    () => billingApi.listInvoices(),
    [],
  );

  const activeSeats = useMemo(
    () => (members ?? []).filter((m) => !m.blocked && !m.isDisabled).length,
    [members],
  );

  const isCurrentUser = (m: { email?: string; fullName?: string }) => {
    const email = (authUser?.email || '').toLowerCase();
    if (email && m.email && m.email.toLowerCase() === email) return true;
    const name = (authUser?.displayName || displayName || '').trim().toLowerCase();
    if (name && m.fullName && m.fullName.trim().toLowerCase() === name) return true;
    return false;
  };

  const billingRows = useMemo(() => {
    return (billingInvoices ?? []).map((inv) => ({
      key: inv._id,
      no: inv.invoiceId || inv._id.slice(-8),
      date: formatDate(inv.issuedAt),
      description: inv.description || 'Sartor subscription',
      amount: inv.amount ?? 0,
      dueIn: dueInLabel(inv),
      status: mapBillingStatus(inv.status),
      statusLabel: inv.status || 'Pending',
      api: true as const,
    }));
  }, [billingInvoices]);

  const nextDueInvoice = useMemo(() => {
    const unpaid = (billingInvoices ?? []).filter((inv) => {
      const s = String(inv.status || '').toLowerCase();
      return s !== 'paid' && s !== 'cancelled';
    });
    unpaid.sort((a, b) => {
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });
    return unpaid[0] ?? null;
  }, [billingInvoices]);

  const planPrice =
    tier === '360'
      ? TIER_PRICING['360'].flatMo
      : tier === 'snp'
        ? TIER_PRICING.snp.revSeatMo
        : TIER_PRICING.sn.revSeatMo;
  const planHalf = tier === '360' ? Math.round(TIER_PRICING['360'].flatMo / 2) : null;
  const amountDue = nextDueInvoice?.amount ?? (tier === '360' ? planPrice : null);
  const renewalLabel = nextDueInvoice ? dueInLabel(nextDueInvoice) : '—';

  const navItems = useMemo(() => {
    const items: SettingsPanel[] = [];
    if (isCeo) items.push('users');
    if (isCeo && isSnp) items.push('thresholds', 'commission');
    items.push('categories', 'notifications');
    if (isCeo) items.push('billing');
    return items;
  }, [isCeo, isSnp]);

  const [active, setActive] = useState<SettingsPanel>(navItems[0] ?? 'categories');

  useEffect(() => {
    if (!navItems.includes(active)) {
      setActive(navItems[0] ?? 'categories');
    }
  }, [navItems, active]);

  const save = (msg: string) => showToast(msg, 'ok');

  return (
    <>
      <PageHead icon="settings" title="Settings" subtitle="System configuration, team management, and billing." />

      <div className="settings-grid">
        <div className="settings-nav">
          {navItems.map((id) => (
            <div
              key={id}
              className={`settings-nav-item ${active === id ? 'on' : ''}`.trim()}
              onClick={() => setActive(id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActive(id)}
            >
              {PANEL_LABELS[id]}
            </div>
          ))}
        </div>

        <div className="settings-panel">
          <Panel id="users" active={active}>
              <div className="panel-head-row">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif" }}>
                  User & Role Management
                </h3>
                <Button variant="green" size="sm" onClick={() => openModal('invite-user')}>
                  + Invite User
                </Button>
              </div>
              <div className="info-banner info mb">
                <span className="ico"><Icon name="info" size={16} /></span>
                <div>
                  As CEO, you can invite users, assign roles, set commission rates, deactivate accounts, and assign
                  staff to warehouses. Each user occupies one seat on your billing plan.
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  background: 'var(--bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 9,
                  padding: '12px 16px',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>
                    Plan
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--N)' }}>{TIER_LABELS[tier]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>
                    Seats Used
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700 }}>{activeSeats}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>
                    Seat Allowance
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700 }}>
                    {tier === '360' ? 'Unlimited' : 'Per seat'}
                  </div>
                </div>
              </div>
              <QueryState
                loading={usersLoading}
                error={usersError}
                empty={!members?.length}
                emptyMessage="No team members found. Only account owners can list users."
              >
                <div className="tw">
                  <table style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Warehouse</th>
                        <th>Commission</th>
                        <th>Seats</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(members ?? []).map((m) => {
                        const inactive = m.blocked || m.isDisabled;
                        const you = isCurrentUser(m);
                        const noCommission =
                          m.isOwner ||
                          /warehouse|inventory|driver|merch|owner|ceo/i.test(m.role || '');
                        return (
                          <tr key={m._id}>
                            <td>
                              <strong>{m.fullName || '—'}</strong>
                              {you ? (
                                <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--tx3)' }}>
                                  (You)
                                </span>
                              ) : null}
                              {m.isOwner && !you ? (
                                <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--tx3)' }}>
                                  Owner
                                </span>
                              ) : null}
                            </td>
                            <td>
                              <Badge variant={roleVariant(m.role)}>
                                {m.role || m.consoleRole || '—'}
                              </Badge>
                            </td>
                            <td>
                              {typeof m.warehouse === 'object' && m.warehouse
                                ? m.warehouse.name || '—'
                                : m.warehouse || '—'}
                            </td>
                            <td>{noCommission ? '—' : m.commissionRate != null ? `${m.commissionRate}%` : '—'}</td>
                            <td style={{ fontFamily: "'DM Mono',monospace" }}>1</td>
                            <td>
                              <Badge variant={inactive ? 'amber' : m.onLeave ? 'amber' : 'green'}>
                                {inactive ? 'Inactive' : m.onLeave ? 'On Leave' : 'Active'}
                              </Badge>
                            </td>
                            <td>
                              {you || m.isOwner ? (
                                '—'
                              ) : (
                                <div style={{ display: 'flex', gap: 5 }}>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => openModal('invite-user', { user: m })}
                                  >
                                    Edit
                                  </Button>
                                  {!noCommission && (
                                    <Button
                                      variant="secondary"
                                      size="xs"
                                      onClick={() => openModal('set-commission', { user: m })}
                                    >
                                      Rate
                                    </Button>
                                  )}
                                  <Button
                                    variant="danger"
                                    size="xs"
                                    onClick={() => save('User deactivated. Seat freed.')}
                                  >
                                    Deactivate
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
                    Active seats: <strong style={{ color: 'var(--N)' }}>{activeSeats}</strong>
                  </span>
                  <Button size="sm" onClick={() => setActive('billing')}>
                    Manage Seats & Billing →
                  </Button>
                </div>
              </QueryState>
          </Panel>

          <Panel id="thresholds" active={active}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif", marginBottom: 6 }}>
                Approval Thresholds & Permissions
              </h3>
              <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>
                Set who can approve actions and at what financial threshold CEO sign-off is required.
              </p>
              <div className="sdiv-label" style={{ marginTop: 0 }}>
                Invoice & Payment
              </div>
              <div className="frow">
                <div className="fg">
                  <label>Payment Confirmation Delegated To</label>
                  <select className="sel" defaultValue="ceo-finance">
                    <option value="ceo">CEO only</option>
                    <option value="ceo-finance">
                      CEO + Finance Manager
                    </option>
                  </select>
                </div>
                <div className="fg">
                  <label>Auto-Confirm Threshold</label>
                  <select className="sel" defaultValue="below-50k">
                    <option>Never (always require manual confirmation)</option>
                    <option value="below-50k">Below ₦50,000 — Finance can self-confirm</option>
                  </select>
                </div>
              </div>
              <div className="sdiv-label">Commission Payouts</div>
              <div className="frow">
                <div className="fg">
                  <label>Payout Authorisation Threshold</label>
                  <input className="inp" type="number" defaultValue={50000} />
                </div>
                <div className="fg">
                  <label>Payout Method Allowed</label>
                  <select className="sel">
                    <option>Bank Transfer + Cash</option>
                  </select>
                </div>
              </div>
              <div className="sdiv-label">Stock & Inventory</div>
              <div className="frow">
                <div className="fg">
                  <label>Stock Adjustment Approval</label>
                  <select className="sel" defaultValue="ceo">
                    <option value="ceo">CEO only</option>
                    <option value="wh">WH Manager up to 50 units</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Write-off Threshold</label>
                  <select className="sel" defaultValue="25k">
                    <option value="always">Always require CEO</option>
                    <option value="25k">Below ₦25,000 — WH Manager</option>
                  </select>
                </div>
              </div>
              <div className="sdiv-label">Supplier Payments</div>
              <div className="frow">
                <div className="fg">
                  <label>PO Approval Threshold</label>
                  <input className="inp" type="number" defaultValue={250000} />
                </div>
                <div className="fg">
                  <label>Payment Release</label>
                  <select className="sel">
                    <option>CEO + Finance dual approval</option>
                    <option>Finance only</option>
                  </select>
                </div>
              </div>
              <div className="sdiv-label">Lead & Customer Management</div>
              <div className="frow">
                <div className="fg">
                  <label>Lead Reassignment</label>
                  <select className="sel">
                    <option>CEO and Admin only</option>
                    <option>Any manager</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Customer Credit Limit Changes</label>
                  <select className="sel">
                    <option>CEO approval required</option>
                    <option>Finance Manager up to ₦500,000</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Button onClick={() => save('Approval thresholds saved. Changes apply immediately.')}>
                  Save Thresholds
                </Button>
              </div>
          </Panel>

          <Panel id="commission" active={active}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif", marginBottom: 6 }}>
                Commission Configuration
              </h3>
              <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>
                Commission is calculated only on CEO/Finance-confirmed invoices.
              </p>
              <div className="frow">
                <div className="fg">
                  <label>Commission Basis</label>
                  <select className="sel">
                    <option>Invoice value (excl. VAT) on confirmed payment</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Commission Trigger</label>
                  <select className="sel">
                    <option>CEO/Finance confirmation only</option>
                  </select>
                </div>
              </div>
              <div className="sdiv-label">Default Rates by Role</div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--brd)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div className="grid-override-row">
                  <span style={{ fontSize: 13 }}>Admin</span>
                  <input className="inp" type="number" defaultValue={3.5} step={0.5} style={{ padding: '5px 8px', fontSize: 12, textAlign: 'right' }} />
                  <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
                    <IconLabel icon="check" size={12}>Per-user override</IconLabel>
                  </span>
                </div>
                <div className="grid-override-row">
                  <span style={{ fontSize: 13 }}>Sales Rep</span>
                  <input className="inp" type="number" defaultValue={2.5} step={0.5} style={{ padding: '5px 8px', fontSize: 12, textAlign: 'right' }} />
                  <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
                    <IconLabel icon="check" size={12}>Per-user override</IconLabel>
                  </span>
                </div>
                <div className="grid-override-row">
                  <span style={{ fontSize: 13 }}>Finance Manager</span>
                  <input className="inp" type="number" defaultValue={0} step={0.5} style={{ padding: '5px 8px', fontSize: 12, textAlign: 'right' }} />
                  <span style={{ fontSize: 12, color: 'var(--tx3)' }}>Default 0%</span>
                </div>
              </div>
              <div className="sdiv-label">Policy</div>
              <div className="frow">
                <div className="fg">
                  <label>Commission Reversal on Returns</label>
                  <select className="sel">
                    <option>Reverse when credit note is approved</option>
                    <option>Do not reverse</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Commission on Partial Payments</label>
                  <select className="sel">
                    <option>Only on confirmed full payment</option>
                    <option>Pro-rata on each confirmed payment</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => save('Commission settings saved.')}>Save Commission Settings</Button>
          </Panel>

          <Panel id="categories" active={active}>
              <div className="panel-head-row">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif" }}>
                  Product Categories
                </h3>
                <Button variant="green" size="sm" onClick={() => openModal('add-category')}>
                  + Add Category
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Personal Care', 'Health Products', 'FMCG', 'Pharma'].map((cat) => (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      border: '1px solid var(--brd)',
                      borderRadius: 8,
                      background: 'var(--bg)',
                    }}
                  >
                    <strong style={{ fontSize: 13 }}>{cat}</strong>
                    <Badge variant="gray">Active</Badge>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: 'var(--tx3)', padding: '4px 2px' }}>
                  Add a category to organise your catalogue further.
                </div>
              </div>
          </Panel>

          <Panel id="notifications" active={active}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif", marginBottom: 14 }}>
                Notification Preferences
              </h3>
              <div className="fg full" style={{ marginBottom: 12 }}>
                <label>Invoice Dispatch Notifications</label>
                <select className="sel">
                  <option>SMS + WhatsApp + Email</option>
                  <option>WhatsApp + Email</option>
                  <option>Email only</option>
                </select>
              </div>
              <div className="fg full" style={{ marginBottom: 12 }}>
                <label>Low Stock Alert Threshold</label>
                <select className="sel" defaultValue="reorder">
                  <option value="reorder">Alert when below reorder level</option>
                  <option value="2x-reorder">Alert when below 2× reorder level</option>
                </select>
              </div>
              <div className="fg full" style={{ marginBottom: 12 }}>
                <label>Overdue Invoice Alerts</label>
                <select className="sel" defaultValue="30-60-90">
                  <option value="30-60-90">Alert at 30 days & 60 days & 90 days</option>
                  <option value="60-90">Alert at 60 days & 90 days only</option>
                  <option value="ceo-60">CEO email only at 60 days</option>
                </select>
              </div>
              <div className="fg full" style={{ marginBottom: 12 }}>
                <label>Goods Return Notifications</label>
                <select className="sel" defaultValue="immediate">
                  <option value="immediate">All returns — immediate</option>
                  <option value="daily">Summary — daily</option>
                </select>
              </div>
              <div className="fg full" style={{ marginBottom: 12 }}>
                <label>GRN & Stock Receipt Alerts</label>
                <select className="sel" defaultValue="ceo-finance">
                  <option value="ceo-finance">Notify CEO & Finance on every GRN</option>
                  <option value="finance">Notify Finance only</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <Button onClick={() => save('Notification preferences saved.')}>Save Preferences</Button>
          </Panel>

          <Panel id="billing" active={active}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif", marginBottom: 4 }}>
                  Subscription & Billing
                </h3>
                <p style={{ fontSize: 12, color: 'var(--tx3)' }}>
                  Your Sartor Limited subscription. Upgrade your tier or switch billing cycle at any time — changes take
                  effect at your next renewal.
                </p>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg,var(--N),#0000A8)',
                  borderRadius: 10,
                  padding: '18px 20px',
                  color: '#fff',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                  Current Plan · {TIER_LABELS[tier]}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700 }}>{TIER_LABELS[tier]}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
                      {tier === '360'
                        ? 'Full platform · Unlimited users · Flat fee'
                        : tier === 'snp'
                          ? 'Revenue + operational seats'
                          : 'Per revenue seat'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>
                      {tier === '360' ? 'Monthly Total' : 'From'}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700 }}>
                      {formatNaira(planPrice)}
                      {tier === '360' ? '/mo' : '/seat/mo'}
                    </div>
                  </div>
                </div>
                {tier === '360' && planHalf != null && (
                  <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '12px 14px', marginBottom: 10, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,.65)' }}>SC + DORA AI deployment (Year 1)</span>
                      <span style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(planHalf)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: 'rgba(255,255,255,.65)' }}>CRM 360 subscription</span>
                      <span style={{ fontFamily: "'DM Mono',monospace" }}>{formatNaira(planHalf)}</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant="green" size="sm" onClick={() => openModal('billing-cycle')}>
                    Switch to Annual (Save 20%)
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openModal('change-plan')}>
                    Upgrade / Change Tier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('pilot-convert')}
                  >
                    Convert Pilot →
                  </Button>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 9,
                  padding: '13px 16px',
                  marginBottom: 18,
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>
                    Next Renewal
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, color: 'var(--N)' }}>
                    {renewalLabel}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>
                    Amount Due
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, color: 'var(--N)' }}>
                    {amountDue != null ? formatNaira(amountDue) : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3 }}>
                    Billing Cycle
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--N)' }}>Monthly</div>
                </div>
              </div>
              <div className="sdiv-label">Invoices — Payable to Sartor Limited</div>
              <p style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 10 }}>
                Your subscription invoices from Sartor Limited. Separate from the invoices you issue to your own customers.
              </p>
              <div className="tw" style={{ marginBottom: 18 }}>
                <table className="resp" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due In</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingLoading && !billingInvoices ? (
                      <tr>
                        <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                          Loading invoices…
                        </td>
                      </tr>
                    ) : billingRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                          No subscription invoices yet.
                        </td>
                      </tr>
                    ) : (
                      billingRows.map((inv) => (
                        <tr key={inv.key}>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{inv.no}</td>
                          <td>{inv.date}</td>
                          <td>{inv.description}</td>
                          <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                            {formatNaira(inv.amount)}
                          </td>
                          <td>{inv.dueIn}</td>
                          <td>
                            <Badge variant={billingInvoiceVariant(inv.statusLabel)}>
                              {inv.statusLabel}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => openSartorInvoice(inv.no)}
                              >
                                View
                              </Button>
                              {inv.status !== 'paid' && (
                                <Button
                                  variant="green"
                                  size="xs"
                                  onClick={() => openSartorInvoice(inv.no)}
                                >
                                  Pay
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sdiv-label">Plan Comparison & Upgrade Path</div>
              <div className="billing-compare-grid" style={{ marginBottom: 16 }}>
                <div style={{ border: '1px solid var(--brd)', borderRadius: 9, padding: 14, background: 'var(--bg)' }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, color: 'var(--tx2)', marginBottom: 2 }}>
                    {TIER_LABELS.sn}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 7 }}>
                    T1 · Per revenue seat
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 17, fontWeight: 700, color: 'var(--N)' }}>
                    {formatNaira(TIER_PRICING.sn.revSeatMo)}
                    <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx3)' }}>/seat/mo</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 8 }}>
                    {formatNaira(TIER_PRICING.sn.revSeatAnn)}/seat annual · Min {TIER_PRICING.sn.minSeats} seats
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.8 }}>
                    Pipeline & Leads
                    <br />
                    Customer Management
                    <br />
                    LPOs & Invoices
                    <br />
                    <span style={{ color: 'var(--rt)' }}>
                      No WH / Drivers / GRN
                      <br />
                      No Sartor-Chain / DORA AI
                    </span>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--pur)', borderRadius: 9, padding: 14, background: 'var(--pb)' }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, color: 'var(--pt)', marginBottom: 2 }}>
                    {TIER_LABELS.snp}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--pt)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 7 }}>
                    T2 · Revenue + Operational seats
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>
                    {formatNaira(TIER_PRICING.snp.revSeatMo)}
                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>/revenue seat/mo</span>
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 700, color: 'var(--pt)' }}>
                    {formatNaira(TIER_PRICING.snp.opSeatMo)}
                    <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>/operational seat/mo</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--pt)', opacity: 0.7, marginBottom: 8 }}>
                    Annual: {formatNaira(TIER_PRICING.snp.revSeatAnn)} / {formatNaira(TIER_PRICING.snp.opSeatAnn)} · Min{' '}
                    {TIER_PRICING.snp.minSeats} seats
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--pt)', opacity: 0.85, lineHeight: 1.8 }}>
                    Everything in Field +
                    <br />
                    Warehouses & Drivers
                    <br />
                    GRN · Supplier Mgmt
                    <br />
                    <span style={{ opacity: 0.6 }}>No Sartor-Chain / DORA AI</span>
                  </div>
                </div>
                <div style={{ border: '2px solid var(--G)', borderRadius: 9, padding: 14, background: '#E6FAF0', position: 'relative' }}>
                  {tier === '360' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: 12,
                        background: 'var(--G)',
                        color: '#000',
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      Current
                    </div>
                  )}
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, color: 'var(--Gd)', marginBottom: 2 }}>
                    {TIER_LABELS['360']}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--Gd)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 7 }}>
                    T3 · Flat fee · Unlimited users
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--Gd)', marginBottom: 2 }}>Monthly (no discount):</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: 'var(--Gd)' }}>
                    {formatNaira(Math.round(TIER_PRICING['360'].flatMo / 2))} +{' '}
                    {formatNaira(Math.round(TIER_PRICING['360'].flatMo / 2))} ={' '}
                    {formatNaira(TIER_PRICING['360'].flatMo)}/mo
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--Gd)', marginTop: 4, marginBottom: 2 }}>
                    Annual lump sum (20% off):
                  </div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: 'var(--Gd)' }}>
                    {formatNaira(Math.round(TIER_PRICING['360'].flatAnn / 2))} +{' '}
                    {formatNaira(Math.round(TIER_PRICING['360'].flatAnn / 2))} ={' '}
                    {formatNaira(TIER_PRICING['360'].flatAnn)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--Gd)', marginTop: 8, lineHeight: 1.8 }}>
                    Everything in Depot +
                    <br />
                    Sartor-Chain + DORA AI
                    <br />
                    Stock Reconciliation
                    <br />
                    Field Intelligence
                    <br />
                    <strong>No per-seat charge ever</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 7, fontSize: 12, color: 'var(--tx3)' }}>
                Questions about billing? Contact{' '}
                <a href="mailto:billing@sartor.ng" style={{ color: 'var(--N)', fontWeight: 600 }}>
                  billing@sartor.ng
                </a>
              </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
