import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge, Button, Icon, IconLabel, PageHead } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

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

export default function SettingsPage() {
  const { isCeo, tier } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const isSnp = tier === 'snp' || tier === '360';

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
                    <tr>
                      <td>
                        <strong>Nwachukwu Confidence</strong>{' '}
                        <span style={{ fontSize: 10, color: 'var(--tx3)' }}>(You)</span>
                      </td>
                      <td>
                        <Badge variant="navy">CEO / MD</Badge>
                      </td>
                      <td>—</td>
                      <td>—</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>1</td>
                      <td>
                        <Badge variant="green">Active</Badge>
                      </td>
                      <td>—</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Abubakar Idah</strong>
                      </td>
                      <td>
                        <Badge variant="blue">Admin</Badge>
                      </td>
                      <td>—</td>
                      <td>3.5%</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>1</td>
                      <td>
                        <Badge variant="green">Active</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <Button variant="outline" size="xs" onClick={() => openModal('invite-user')}>
                            Edit
                          </Button>
                          <Button variant="secondary" size="xs" onClick={() => openModal('set-commission')}>
                            Rate
                          </Button>
                          <Button variant="danger" size="xs" onClick={() => save('User deactivated. Seat freed.')}>
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
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
                  Active Seats: <strong style={{ color: 'var(--N)' }}>9 / 9</strong> — CRM 360 plan
                </span>
                <Button size="sm" onClick={() => setActive('billing')}>
                  Manage Seats & Billing →
                </Button>
              </div>
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
              <div className="cat-row">
                <span className="cat-name">Personal Care</span>
                <Badge variant="green" style={{ fontSize: 10 }}>
                  4 products — VAT 7.5%
                </Badge>
                <div className="cat-acts">
                  <Button variant="secondary" size="xs" onClick={() => openModal('add-category')}>
                    Edit
                  </Button>
                </div>
              </div>
              <div className="cat-row">
                <span className="cat-name">Health Products (Pharma)</span>
                <Badge variant="blue" style={{ fontSize: 10 }}>
                  0 products — VAT Exempt
                </Badge>
                <div className="cat-acts">
                  <Button variant="secondary" size="xs" onClick={() => openModal('add-category')}>
                    Edit
                  </Button>
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
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--N)', fontFamily: "'Fraunces', serif", marginBottom: 4 }}>
                Subscription & Billing
              </h3>
              <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 16 }}>
                SartorCRM charges per seat per tier. Every active user account is one seat. Deactivating a user frees the
                seat immediately.
              </p>
              <div
                style={{
                  background: 'linear-gradient(135deg,var(--N),#0000A8)',
                  borderRadius: 10,
                  padding: '18px 20px',
                  color: '#fff',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                      Current Plan
                    </div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700 }}>CRM 360</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
                      Full platform — SartorChain, DORA AI, Field Intel, GRN, Reconciliation
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>
                      Per Seat / Month
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: 'var(--G)' }}>
                      ₦25,000
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    background: 'rgba(255,255,255,.08)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div className="flex-stats">
                    <div className="flex-stats-col">
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: 'var(--G)' }}>9</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Active Seats</div>
                    </div>
                    <div className="flex-stats-col">
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700 }}>₦225,000</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Monthly Total</div>
                    </div>
                    <div className="flex-stats-col">
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: '#7EC8FF' }}>19</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Days to Renewal</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="green" size="sm" onClick={() => save('Annual billing saves ₦540,000 per year. Contact billing@sartor.ng to switch.')}>
                      Switch to Annual (Save 20%)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ color: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.2)' }}
                      onClick={() => save('Contact billing@sartor.ng to change plans.')}
                    >
                      Change Plan
                    </Button>
                  </div>
                </div>
              </div>

              <div className="sdiv-label">Plan Comparison — Per Seat / Month</div>
              <div className="grid-3-col">
                <div style={{ border: '1px solid var(--brd)', borderRadius: 9, padding: 14, background: 'var(--bg)' }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: 'var(--tx2)', marginBottom: 4 }}>
                    Sales Navigator
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--N)', marginBottom: 8 }}>
                    ₦5,000<span style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'inherit', fontWeight: 400 }}>/seat/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.8 }}>
                    Leads, Customers, LPOs
                    <br />
                    Basic Sales Reporting
                    <br />
                    My Commissions
                    <br />
                    <span style={{ color: 'var(--rt)' }}>No Invoices, No WH, No DORA</span>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--pur)', borderRadius: 9, padding: 14, background: 'var(--pb)' }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: 'var(--pt)', marginBottom: 4 }}>
                    Sales Nav Plus
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--pt)', marginBottom: 8 }}>
                    ₦12,000<span style={{ fontSize: 11, color: 'var(--pt)', fontFamily: 'inherit', fontWeight: 400, opacity: 0.7 }}>/seat/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--pt)', opacity: 0.8, lineHeight: 1.8 }}>
                    Everything in SN +
                    <br />
                    Invoices & Collections
                    <br />
                    Warehouses & Drivers
                    <br />
                    Product Catalog
                    <br />
                    <span style={{ opacity: 0.6 }}>No SartorChain / DORA</span>
                  </div>
                </div>
                <div style={{ border: '2px solid var(--G)', borderRadius: 9, padding: 14, background: '#E6FAF0', position: 'relative' }}>
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
                      letterSpacing: '.5px',
                    }}
                  >
                    Current Plan
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 700, color: 'var(--Gd)', marginBottom: 4 }}>
                    CRM 360
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--Gd)', marginBottom: 8 }}>
                    ₦25,000<span style={{ fontSize: 11, fontFamily: 'inherit', fontWeight: 400, opacity: 0.7 }}>/seat/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--Gd)', lineHeight: 1.8 }}>
                    Everything in SNP +
                    <br />
                    SartorChain + DORA AI
                    <br />
                    GRN & Stock Reconciliation
                    <br />
                    Field Intelligence
                    <br />
                    Supplier Management
                    <br />
                    VAT & P&L Reports
                  </div>
                </div>
              </div>

              <div className="sdiv-label">Active Seats</div>
              <div className="tw">
                <table style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Seat Added</th>
                      <th>Cost/Month</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nwachukwu Confidence</td>
                      <td>CEO</td>
                      <td>1 Jan 2026</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦25,000</td>
                      <td style={{ color: 'var(--tx3)', fontSize: 11 }}>Owner seat</td>
                    </tr>
                    <tr>
                      <td>Abubakar Idah</td>
                      <td>Admin</td>
                      <td>15 Jan 2026</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦25,000</td>
                      <td>
                        <Button variant="danger" size="xs" onClick={() => save('Seat removed. Billing adjusted from next cycle.')}>
                          Remove Seat
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Emmanuel Batimehin</td>
                      <td>Sales Rep</td>
                      <td>15 Jan 2026</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦25,000</td>
                      <td>
                        <Button variant="danger" size="xs" onClick={() => save('Seat removed. Billing adjusted from next cycle.')}>
                          Remove Seat
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Samuel Okon</td>
                      <td>Sales Rep</td>
                      <td>1 Feb 2026</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦25,000</td>
                      <td>
                        <Button variant="danger" size="xs" onClick={() => save('Seat removed. Billing adjusted from next cycle.')}>
                          Remove Seat
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Okeke David</td>
                      <td>Finance Manager</td>
                      <td>1 Feb 2026</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦25,000</td>
                      <td>
                        <Button variant="danger" size="xs" onClick={() => save('Seat removed. Billing adjusted from next cycle.')}>
                          Remove Seat
                        </Button>
                      </td>
                    </tr>
                    <tr style={{ background: 'var(--Gb)' }}>
                      <td colSpan={3} style={{ fontWeight: 700, color: 'var(--Gd)' }}>
                        Monthly Total
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--Gd)' }}>₦225,000</td>
                      <td>
                        <Button variant="green" size="sm" onClick={() => openModal('invite-user')}>
                          + Add Seat
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="sdiv-label" style={{ marginTop: 20 }}>
                Billing History
              </div>
              <div className="tw">
                <table style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Plan</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>May 2026</td>
                      <td>CRM 360</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>9</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦225,000</td>
                      <td>
                        <Badge variant="amber">Due 31 May</Badge>
                      </td>
                      <td>
                        <Button variant="outline" size="xs" onClick={() => save('Downloading invoice…')}>
                          Invoice
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Apr 2026</td>
                      <td>CRM 360</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>8</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦200,000</td>
                      <td>
                        <Badge variant="green">Paid</Badge>
                      </td>
                      <td>
                        <Button variant="outline" size="xs" onClick={() => save('Downloading receipt…')}>
                          Receipt
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Mar 2026</td>
                      <td>CRM 360</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>7</td>
                      <td style={{ fontFamily: "'DM Mono', monospace" }}>₦175,000</td>
                      <td>
                        <Badge variant="green">Paid</Badge>
                      </td>
                      <td>
                        <Button variant="outline" size="xs" onClick={() => save('Downloading receipt…')}>
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
