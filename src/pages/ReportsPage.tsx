import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
  RoleGate,
  IconLabel,
} from '../components/ui';
import type { IconName } from '../types/icons';
import { AgingChart, RevenueChart } from '../components/charts/DashboardCharts';
import { catalogApi } from '../api/catalog';
import { crmApi, leadName, refName, type CrmInvoice } from '../api/crm';
import { opsApi } from '../api/ops';
import { REPORT_TABS_BY_TIER, REPORT_TAB_UPGRADE } from '../constants/tiers';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useAuthStore } from '../store/authStore';
import { formatCompactNaira, formatDate, formatNaira, num } from '../utils/format';
import { lpoTermsOf, paidAmount, outstandingAmount, termsShort } from '../utils/invoice';
import { invoiceStatusVariant } from '../utils/statusBadges';

const ALL_TABS: { id: string; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'sales', label: 'Sales', icon: 'banknote' },
  { id: 'collections', label: 'Collections', icon: 'credit-card' },
  { id: 'aging', label: 'Invoice Aging', icon: 'clock' },
  { id: 'pl', label: 'P&L', icon: 'trending-up' },
  { id: 'commission', label: 'Commission', icon: 'dollar' },
  { id: 'stock', label: 'Stock', icon: 'package' },
  { id: 'vat', label: 'VAT / FIRS', icon: 'scroll' },
  { id: 'suppliers', label: 'Suppliers', icon: 'building' },
];

function invoiceAmount(inv: CrmInvoice) {
  return num(inv.totalAmount);
}

function isPaid(inv: CrmInvoice) {
  return String(inv.status || '').toLowerCase() === 'paid';
}

function isOutstanding(inv: CrmInvoice) {
  const s = String(inv.status || '').toLowerCase();
  return s !== 'paid' && s !== 'cancelled';
}

function daysOutstanding(inv: CrmInvoice) {
  const due = inv.dueDate ? new Date(inv.dueDate).getTime() : inv.creationDateTime;
  if (!due) return 0;
  return Math.max(0, Math.floor((Date.now() - Number(due)) / 86_400_000));
}

function customerOf(inv: CrmInvoice) {
  return inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null);
}

export default function ReportsPage() {
  const { tier } = useApp();
  const user = useAuthStore((s) => s.user);
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showInvConfirmPay } = useRoleGates();
  const allowedTabs = REPORT_TABS_BY_TIER[tier];
  const [activeTab, setActiveTab] = useState(allowedTabs[0] ?? 'overview');
  const [period, setPeriod] = useState('mtd');
  const [showCustom, setShowCustom] = useState(false);

  const { data, loading, error } = useApiQuery(async () => {
    const [dash, invoices, lpos, products, suppliers, restocks, returns, recons, commissionCfg, myCommissions] =
      await Promise.all([
        crmApi.dashboard().catch(() => null),
        crmApi.listInvoices().catch(() => []),
        crmApi.listLpos().catch(() => []),
        catalogApi.listProducts().catch(() => []),
        catalogApi.listSuppliers().catch(() => []),
        catalogApi.listRestocks().catch(() => []),
        opsApi.listReturns().catch(() => []),
        opsApi.listRecons().catch(() => []),
        crmApi.getCommissionConfig().catch(() => null),
        user?._id ? crmApi.listUserCommissions(user._id).catch(() => []) : Promise.resolve([]),
      ]);
    return {
      dash,
      invoices,
      lpos,
      products,
      suppliers,
      restocks: restocks || [],
      returns,
      recons,
      commissionCfg,
      myCommissions,
    };
  }, [user?._id]);

  const tabs = useMemo(
    () => ALL_TABS.filter((t) => allowedTabs.includes(t.id) || REPORT_TAB_UPGRADE[t.id]),
    [allowedTabs],
  );

  const switchTab = (id: string) => {
    if (!allowedTabs.includes(id)) {
      const upgrade = REPORT_TAB_UPGRADE[id];
      showToast(`${upgrade} tier required for this report.`, 'warn');
      return;
    }
    setActiveTab(id);
  };

  const invoices = data?.invoices ?? [];
  const lpos = data?.lpos ?? [];
  const products = data?.products ?? [];
  const suppliers = data?.suppliers ?? [];
  const restocks = data?.restocks ?? [];
  const returns = data?.returns ?? [];
  const recons = data?.recons ?? [];
  const dash = data?.dash;

  const totalSales = dash?.cards.totalSales ?? lpos.reduce((s, l) => s + num(l.totalAmount), 0);
  const paidTotal = invoices.filter(isPaid).reduce((s, i) => s + invoiceAmount(i), 0);
  const outstandingTotal = invoices.filter(isOutstanding).reduce((s, i) => s + invoiceAmount(i), 0);
  const overdueInvoices = invoices.filter((i) =>
    String(i.status || '').toLowerCase().includes('overdue'),
  );
  const collectionRate = totalSales > 0 ? Math.round((paidTotal / totalSales) * 1000) / 10 : 0;
  const returnValue = returns.reduce((s, r) => s + num(r.amount), 0);
  const netSales = Math.max(0, totalSales - returnValue);
  const unitsSold = lpos.reduce((s, l) => s + num(l.totalQuantity), 0);
  const vatRate = 0.075;
  const outputVat = Math.round(netSales * vatRate);
  const openVariances = recons.filter((r) => Math.abs(num(r.variance)) > 0).length;

  const agingBuckets = useMemo(() => {
    const buckets = { current: 0, soon: 0, overdue: 0, risk: 0, counts: [0, 0, 0] as [number, number, number] };
    for (const inv of invoices.filter(isOutstanding)) {
      const days = daysOutstanding(inv);
      const amt = invoiceAmount(inv);
      if (days <= 30) {
        buckets.current += amt;
        buckets.counts[0] += 1;
      } else if (days <= 60) {
        buckets.soon += amt;
        buckets.counts[1] += 1;
      } else if (days <= 90) {
        buckets.overdue += amt;
        buckets.counts[2] += 1;
      } else {
        buckets.risk += amt;
        buckets.counts[2] += 1;
      }
    }
    return buckets;
  }, [invoices]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; outstanding: number }>();
    for (const inv of invoices) {
      const name = customerOf(inv);
      const row = map.get(name) ?? { name, revenue: 0, outstanding: 0 };
      row.revenue += invoiceAmount(inv);
      if (isOutstanding(inv)) row.outstanding += invoiceAmount(inv);
      map.set(name, row);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [invoices]);

  const topReps = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; commission: number }>();
    for (const inv of invoices) {
      const name = refName(inv.user) || refName(inv.admin) || 'Unassigned';
      const row = map.get(name) ?? { name, revenue: 0, commission: 0 };
      row.revenue += invoiceAmount(inv);
      map.set(name, row);
    }
    const ratePct = num(data?.commissionCfg?.price) / 100;
    for (const row of map.values()) row.commission = Math.round(row.revenue * (ratePct || 0.03));
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [invoices, data?.commissionCfg?.price]);

  const rate = num(data?.commissionCfg?.price);
  const commissions = data?.myCommissions ?? [];
  const commissionEarned = commissions.reduce((s, c) => s + num(c.earned ?? c.totalAmount), 0);

  const agingRows = invoices
    .filter(isOutstanding)
    .map((inv) => ({ inv, days: daysOutstanding(inv), amt: invoiceAmount(inv) }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 12);

  const restockUnits = restocks.reduce((s, r) => {
    const lines = Array.isArray(r.products) ? r.products : [];
    return s + lines.reduce((ls, p) => ls + num(p.quantity), 0);
  }, 0);
  const restockValue = restocks.reduce((s, r) => {
    const lines = Array.isArray(r.products) ? r.products : [];
    return s + lines.reduce((ls, p) => ls + num(p.quantity) * num(p.supplyPrice ?? p.sellingPrice), 0);
  }, 0);
  const cogs = restockValue;
  const grossProfit = netSales - cogs;
  const inputVat = Math.round(cogs * vatRate);
  const vatPayable = Math.max(0, outputVat - inputVat);
  const writeOffValue = recons
    .filter((r) => num(r.variance) < 0)
    .reduce((s, r) => {
      const p = products.find((x) => x.productName === r.productName || x.skuCode === r.sku);
      const price = num(p?.supplyPrice ?? p?.sellingPrice ?? p?.price);
      return s + Math.abs(num(r.variance)) * price;
    }, 0);
  const commissionPaidOut = commissions
    .filter((c) => String(c.status || '').toLowerCase() === 'paid')
    .reduce((s, c) => s + num(c.earned ?? c.totalAmount), 0);
  const commissionOutstanding = Math.max(0, commissionEarned - commissionPaidOut);
  const opex = commissionPaidOut + writeOffValue + returnValue;
  const noi = grossProfit - opex;

  return (
    <>
      <PageHead
        icon="chart"
        title="Reports & Analytics"
        subtitle="Live workspace metrics. Period filter is for export labelling."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => showToast('Exporting to Excel…', 'ok')}>
              <IconLabel icon="download" size={13}>Excel</IconLabel>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => showToast('Exporting to PDF…', 'ok')}>
              <IconLabel icon="download" size={13}>PDF</IconLabel>
            </Button>
          </>
        }
      />

      <div className="rpt-filter">
        <label>Period:</label>
        <select
          className="sel"
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setShowCustom(e.target.value === 'custom');
          }}
          style={{ minWidth: 160, padding: '6px 10px', fontSize: 12 }}
        >
          <option value="mtd">This Month</option>
          <option value="last">Last Month</option>
          <option value="q">This Quarter</option>
          <option value="ytd">Year to Date</option>
          <option value="custom">Custom Range</option>
        </select>
        {showCustom && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="inp" style={{ width: 130, padding: '5px 8px', fontSize: 12 }} />
            <span style={{ fontSize: 12, color: 'var(--tx3)' }}>to</span>
            <input type="date" className="inp" style={{ width: 130, padding: '5px 8px', fontSize: 12 }} />
          </div>
        )}
        <Button size="sm" onClick={() => showToast('Filter label applied.', 'ok')}>
          Apply
        </Button>
      </div>

      <div className="rpt-tabs">
        {tabs.map((tab) => {
          const locked = !allowedTabs.includes(tab.id);
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id && !locked ? 'primary' : 'secondary'}
              size="sm"
              className={`rpt-tab ${activeTab === tab.id && !locked ? 'on' : ''}`.trim()}
              onClick={() => switchTab(tab.id)}
              style={locked ? { opacity: 0.55 } : undefined}
            >
              <IconLabel icon={tab.icon} size={13}>{tab.label}</IconLabel>
            </Button>
          );
        })}
      </div>

      <QueryState loading={loading} error={error}>
        {activeTab === 'overview' && (
          <div className="rpt-section">
            <KpiGrid cols={4}>
              <KpiCard label="Total Sales (LPOs)" value={formatCompactNaira(totalSales)} smallValue />
              <KpiCard
                label="Payments Received"
                value={formatCompactNaira(paidTotal)}
                trend={`${collectionRate}% collection rate`}
                accent="green"
                smallValue
              />
              <KpiCard
                label="Outstanding Balance"
                value={formatCompactNaira(outstandingTotal)}
                trend={`${overdueInvoices.length} overdue`}
                trendType={overdueInvoices.length ? 'down' : 'up'}
                accent="amber"
                smallValue
              />
              <KpiCard
                label="Net Operating Income"
                value={formatCompactNaira(Math.max(0, noi))}
                trend={`${collectionRate}% collection`}
                accent="green"
                smallValue
              />
            </KpiGrid>
            <div className="g2 mb">
              <Card>
                <CardHeader title="Revenue Trend" />
                <div className="chart-wrap">
                  <RevenueChart monthlyRevenue={dash?.revenueChart?.monthlyRevenue} />
                </div>
              </Card>
              <Card>
                <CardHeader title="Invoice Aging Breakdown" />
                <div className="chart-wrap">
                  <AgingChart counts={agingBuckets.counts} />
                </div>
              </Card>
            </div>
            <div className="g2">
              <Card className="mb" padding={false}>
                <div className="cp" style={{ paddingBottom: 0 }}>
                  <CardHeader icon="trophy" title="Top Customers" />
                </div>
                {topCustomers.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--tx3)', fontSize: 13 }}>No invoice data yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Customer</th>
                        <th>Revenue</th>
                        <th>Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((c, i) => (
                        <tr key={c.name}>
                          <td>
                            <span className={`rank rank-${Math.min(i + 1, 3)}`}>{i + 1}</span>
                          </td>
                          <td>{c.name}</td>
                          <td>
                            <Mono style={{ fontWeight: 700 }}>{formatNaira(c.revenue)}</Mono>
                          </td>
                          <td>
                            <Mono style={{ color: c.outstanding ? 'var(--at)' : 'var(--Gd)' }}>
                              {formatNaira(c.outstanding)}
                            </Mono>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
              <Card className="mb" padding={false}>
                <div className="cp" style={{ paddingBottom: 0 }}>
                  <CardHeader icon="medal" title="Top Reps / Admins" />
                </div>
                {topReps.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--tx3)', fontSize: 13 }}>No sales attribution yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Revenue</th>
                        <th>Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topReps.map((r, i) => (
                        <tr key={r.name}>
                          <td>
                            <span className={`rank rank-${Math.min(i + 1, 3)}`}>{i + 1}</span>
                          </td>
                          <td>{r.name}</td>
                          <td>
                            <Mono>{formatNaira(r.revenue)}</Mono>
                          </td>
                          <td>
                            <Mono>{formatNaira(r.commission)}</Mono>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="rpt-section">
            <KpiGrid cols={4}>
              <KpiCard label="Gross Sales" value={formatNaira(totalSales)} smallValue />
              <KpiCard label="Less: Returns" value={formatNaira(returnValue)} accent="red" smallValue />
              <KpiCard label="Net Sales" value={formatNaira(netSales)} accent="green" smallValue />
              <KpiCard label="Units on LPOs" value={String(unitsSold)} accent="blue" />
            </KpiGrid>
            <div className="sdiv-label">Sales by Product</div>
            <DataTable>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Gross Revenue</th>
                  <th>Returns</th>
                  <th>Net Revenue</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                      No products in catalog.
                    </td>
                  </tr>
                ) : (
                  (dash?.topProducts?.length ? dash.topProducts : products.slice(0, 20).map((p) => ({
                    productName: p.productName || '—',
                    unitPrice: num(p.sellingPrice ?? p.price),
                    orders: 0,
                    totalQuantity: 0,
                    totalRevenue: 0,
                    sku: p.skuCode || p.productId || '—',
                  }))).map((p, i) => {
                    const rev = num('totalRevenue' in p ? p.totalRevenue : 0);
                    const share = netSales > 0 ? Math.round((rev / netSales) * 1000) / 10 : 0;
                    return (
                      <tr key={`${p.productName}-${i}`}>
                        <td>
                          <Mono style={{ fontSize: 11 }}>{'sku' in p ? String(p.sku) : '—'}</Mono>
                        </td>
                        <td>{p.productName || '—'}</td>
                        <td>
                          <Mono>{num(p.totalQuantity).toLocaleString()}</Mono>
                        </td>
                        <td>
                          <Mono>{formatNaira(rev)}</Mono>
                        </td>
                        <td>
                          <Mono>₦0</Mono>
                        </td>
                        <td>
                          <Mono style={{ fontWeight: 700 }}>{formatNaira(rev)}</Mono>
                        </td>
                        <td>{share}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </DataTable>
            <div className="sdiv-label">Sales by Rep / Admin</div>
            <DataTable>
              <thead>
                <tr>
                  <th>Rep / Admin</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {topReps.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: 'var(--tx3)' }}>No sales attribution yet.</td>
                  </tr>
                ) : (
                  topReps.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td><Mono>{formatNaira(r.revenue)}</Mono></td>
                      <td><Mono>{formatNaira(r.commission)}</Mono></td>
                    </tr>
                  ))
                )}
              </tbody>
            </DataTable>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="rpt-section">
            <KpiGrid cols={4}>
              <KpiCard label="Total Collected" value={formatNaira(paidTotal)} accent="green" smallValue />
              <KpiCard label="Collection Rate" value={`${collectionRate}%`} />
              <KpiCard
                label="30–60 Days"
                value={formatNaira(agingBuckets.soon)}
                accent="amber"
                smallValue
              />
              <KpiCard
                label="60+ Days"
                value={formatNaira(agingBuckets.overdue + agingBuckets.risk)}
                accent="red"
                smallValue
              />
            </KpiGrid>
            <DataTable>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Invoice Amt</th>
                  <th>Payments Received</th>
                  <th>Method</th>
                  <th>Last Payment</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.slice(0, 25).map((inv) => (
                    <tr key={inv._id}>
                      <td>
                        <Mono style={{ fontSize: 11 }}>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                      </td>
                      <td>{customerOf(inv)}</td>
                      <td>
                        <Mono>{formatNaira(invoiceAmount(inv))}</Mono>
                      </td>
                      <td>
                        <Mono>{formatNaira(paidAmount(inv))}</Mono>
                      </td>
                      <td>—</td>
                      <td>{isPaid(inv) ? formatDate(inv.dueDate || inv.creationDateTime) : '—'}</td>
                      <td>
                        <Mono>{formatNaira(outstandingAmount(inv))}</Mono>
                      </td>
                      <td>
                        <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status || '—'}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </DataTable>
          </div>
        )}

        {activeTab === 'aging' && (
          <div className="rpt-section">
            <KpiGrid cols={4}>
              <KpiCard
                label="Current (0–30 days)"
                value={formatNaira(agingBuckets.current)}
                accent="green"
                smallValue
              />
              <KpiCard
                label="Due Soon (30–60 days)"
                value={formatNaira(agingBuckets.soon)}
                accent="amber"
                smallValue
              />
              <KpiCard
                label="Overdue (60–90 days)"
                value={formatNaira(agingBuckets.overdue)}
                accent="red"
                smallValue
              />
              <KpiCard
                label="At Risk (90+ days)"
                value={formatNaira(agingBuckets.risk)}
                accent="red"
                smallValue
              />
            </KpiGrid>
            {agingRows.some((r) => r.days > 60) && (
              <InfoBanner variant="err">
                {agingRows.filter((r) => r.days > 60).length} invoice(s) over 60 days outstanding.
              </InfoBanner>
            )}
            <DataTable>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Terms</th>
                  <th>Amount</th>
                  <th>Invoice Date</th>
                  <th>Balance Due</th>
                  <th>Days Outstanding</th>
                  <th>Aging Bucket</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {agingRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ color: 'var(--tx3)' }}>
                      No outstanding invoices.
                    </td>
                  </tr>
                ) : (
                  agingRows.map(({ inv, days, amt }) => (
                    <tr key={inv._id}>
                      <td>
                        <Mono style={{ fontSize: 11 }}>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                      </td>
                      <td>{customerOf(inv)}</td>
                      <td>{termsShort(lpoTermsOf(inv))}</td>
                      <td>
                        <Mono>{formatNaira(invoiceAmount(inv))}</Mono>
                      </td>
                      <td>{formatDate(inv.creationDateTime)}</td>
                      <td>
                        <Mono style={{ fontWeight: 700, color: days > 60 ? 'var(--rt)' : 'var(--at)' }}>
                          {formatNaira(amt)}
                        </Mono>
                      </td>
                      <td style={{ fontWeight: 700, color: days > 60 ? 'var(--rt)' : undefined }}>
                        {days} days
                      </td>
                      <td>
                        <Badge variant={days > 60 ? 'red' : days > 30 ? 'amber' : 'gray'}>
                          {days > 90 ? '90+' : days > 60 ? '60–90' : days > 30 ? '30–60' : '0–30'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => openModal('add-payment', { invoice: inv })}
                          >
                            Add Payment
                          </Button>
                          {days > 60 && (
                            <Button variant="danger" size="xs" onClick={() => showToast('Escalated to CEO for collection.', 'warn')}>
                              Escalate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </DataTable>
          </div>
        )}

        {activeTab === 'pl' && (
          <div className="rpt-section">
            <Card style={{ borderTop: '3px solid var(--N)' }}>
              <CardHeader title="Profit & Loss Snapshot" subtitle={<span style={{ fontSize: 11, color: 'var(--tx3)' }}>From live LPO / invoice totals</span>} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div className="sdiv-label" style={{ marginTop: 0 }}>
                    Revenue
                  </div>
                  <div className="irow" style={{ marginBottom: 4 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      Gross Sales (LPOs)
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>
                      {formatNaira(totalSales)}
                    </span>
                  </div>
                  <div className="irow" style={{ marginBottom: 4 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      Returns
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', color: 'var(--rt)' }}>
                      ({formatNaira(returnValue)})
                    </span>
                  </div>
                  <div className="irow" style={{ borderTop: '1px solid var(--brd)', paddingTop: 6 }}>
                    <span className="ilbl" style={{ minWidth: 200, fontWeight: 700, color: 'var(--N)' }}>
                      Net Revenue
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700 }}>
                      {formatNaira(netSales)}
                    </span>
                  </div>
                  <div className="irow" style={{ marginBottom: 4, marginTop: 8 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      COGS (from GRNs)
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>
                      ({formatNaira(cogs)})
                    </span>
                  </div>
                  <div className="irow" style={{ borderTop: '1px solid var(--brd)', paddingTop: 6 }}>
                    <span className="ilbl" style={{ minWidth: 200, fontWeight: 700 }}>
                      Gross Profit
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700, color: 'var(--Gd)' }}>
                      {formatNaira(grossProfit)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 6 }}>
                    Gross Margin:{' '}
                    <strong style={{ color: 'var(--Gd)' }}>
                      {netSales > 0 ? `${Math.round((grossProfit / netSales) * 1000) / 10}%` : '—'}
                    </strong>{' '}
                    — FMCG benchmark: 28–38%
                  </div>
                </div>
                <div>
                  <div className="sdiv-label" style={{ marginTop: 0 }}>
                    Operating Expenses
                  </div>
                  <div className="irow" style={{ marginBottom: 4 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      Sales Commissions Paid
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', color: 'var(--rt)' }}>
                      ({formatNaira(commissionPaidOut)})
                    </span>
                  </div>
                  <div className="irow" style={{ marginBottom: 4 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      Stock Write-offs
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', color: 'var(--rt)' }}>
                      ({formatNaira(writeOffValue)})
                    </span>
                  </div>
                  <div className="irow" style={{ marginBottom: 4 }}>
                    <span className="ilbl" style={{ minWidth: 200 }}>
                      Credit Notes Issued
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', color: 'var(--rt)' }}>
                      ({formatNaira(returnValue)})
                    </span>
                  </div>
                  <div className="irow" style={{ borderTop: '2px solid var(--N)', paddingTop: 6, marginBottom: 14 }}>
                    <span className="ilbl" style={{ minWidth: 200, fontWeight: 700, color: 'var(--N)' }}>
                      Net Operating Income
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700, color: 'var(--N)' }}>
                      {formatNaira(noi)}
                    </span>
                  </div>
                  <div style={{ background: 'var(--Gb)', borderRadius: 8, padding: 12 }}>
                    <div className="sdiv-label" style={{ marginTop: 0, color: 'var(--Gd)' }}>
                      VAT Position — FIRS
                    </div>
                    <div className="irow" style={{ marginBottom: 3 }}>
                      <span className="ilbl" style={{ minWidth: 140, color: 'var(--tx3)' }}>
                        Output VAT (7.5% collected)
                      </span>
                      <span className="ival" style={{ fontFamily: "'DM Mono', monospace", color: 'var(--Gd)' }}>
                        {formatNaira(outputVat)}
                      </span>
                    </div>
                    <div className="irow" style={{ marginBottom: 3 }}>
                      <span className="ilbl" style={{ minWidth: 140, color: 'var(--tx3)' }}>
                        Input VAT (paid on purchases)
                      </span>
                      <span className="ival" style={{ fontFamily: "'DM Mono', monospace", color: 'var(--rt)' }}>
                        ({formatNaira(inputVat)})
                      </span>
                    </div>
                    <div className="irow" style={{ borderTop: '1px solid rgba(0,179,65,.3)', paddingTop: 5 }}>
                      <span className="ilbl" style={{ minWidth: 140, fontWeight: 700, color: 'var(--Gd)' }}>
                        VAT Payable to FIRS
                      </span>
                      <span className="ival" style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--Gd)' }}>
                        {formatNaira(vatPayable)}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 6 }}>
                      Due: last day of next month. File VAT Return Form 002.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'commission' && (
          <div className="rpt-section">
            <KpiGrid cols={3}>
              <KpiCard label="Total Commission Due (MTD)" value={formatNaira(commissionEarned)} smallValue />
              <KpiCard label="Paid Out" value={formatNaira(commissionPaidOut)} accent="green" smallValue />
              <KpiCard label="Outstanding" value={formatNaira(commissionOutstanding)} accent="amber" smallValue />
            </KpiGrid>
            <DataTable>
              <thead>
                <tr>
                  <th>Rep / Admin</th>
                  <th>Rate</th>
                  <th>Confirmed Revenue</th>
                  <th>Commission Earned</th>
                  <th>Paid Out</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topReps.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                      No commissionable revenue yet.
                    </td>
                  </tr>
                ) : (
                  topReps.map((r) => (
                    <tr key={r.name}>
                      <td>
                        <strong>{r.name}</strong>
                      </td>
                      <td>{rate ? `${rate}%` : '—'}</td>
                      <td>
                        <Mono>{formatNaira(r.revenue)}</Mono>
                      </td>
                      <td>
                        <Mono style={{ fontWeight: 700 }}>{formatNaira(r.commission)}</Mono>
                      </td>
                      <td>
                        <Mono style={{ color: 'var(--Gd)' }}>{formatNaira(0)}</Mono>
                      </td>
                      <td>
                        <Mono style={{ fontWeight: 700, color: 'var(--at)' }}>{formatNaira(r.commission)}</Mono>
                      </td>
                      <td>
                        <Badge variant="amber">Pending</Badge>
                      </td>
                      <td>
                        <RoleGate show={showInvConfirmPay}>
                          <Button variant="green" size="xs" onClick={() => openModal('commission-payout')}>
                            Pay Out
                          </Button>
                        </RoleGate>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </DataTable>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="rpt-section">
            <KpiGrid cols={4}>
              <KpiCard label="GRNs / Restocks" value={String(restocks.length)} />
              <KpiCard label="Units Received" value={String(restockUnits)} accent="green" />
              <KpiCard label="Write-offs (Value)" value={formatNaira(writeOffValue)} accent="red" smallValue />
              <KpiCard label="Open Variances" value={String(openVariances)} accent="amber" />
            </KpiGrid>
            <div className="sdiv-label">Write-offs & Disposals</div>
            <DataTable>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recons.filter((r) => num(r.variance) < 0).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: 'var(--tx3)' }}>No write-offs recorded.</td>
                  </tr>
                ) : (
                  recons
                    .filter((r) => num(r.variance) < 0)
                    .slice(0, 12)
                    .map((r) => (
                      <tr key={r._id}>
                        <td>{formatDate(r.countDate || r.creationDateTime)}</td>
                        <td><Mono style={{ fontSize: 11 }}>{r.sku || '—'}</Mono></td>
                        <td>{r.productName || '—'}</td>
                        <td><Mono style={{ color: 'var(--rt)' }}>{r.variance}</Mono></td>
                        <td><Badge variant="amber">{r.status || 'Open'}</Badge></td>
                      </tr>
                    ))
                )}
              </tbody>
            </DataTable>
            <div className="sdiv-label">GRN Summary</div>
            <DataTable>
              <thead>
                <tr>
                  <th>GRN No.</th>
                  <th>Supplier</th>
                  <th>Lines</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {restocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: 'var(--tx3)' }}>
                      No restock / GRN records yet.
                    </td>
                  </tr>
                ) : (
                  restocks.slice(0, 15).map((r) => {
                    const supplier =
                      typeof r.supplier === 'object' && r.supplier
                        ? r.supplier.name || '—'
                        : '—';
                    return (
                      <tr key={r._id}>
                        <td>
                          <Mono style={{ fontWeight: 700 }}>{r._id.slice(-8).toUpperCase()}</Mono>
                        </td>
                        <td>{supplier}</td>
                        <td>
                          <Mono>{Array.isArray(r.products) ? r.products.length : 0}</Mono>
                        </td>
                        <td>{formatDate(r.creationDateTime || r.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </DataTable>
          </div>
        )}

        {activeTab === 'vat' && (
          <div className="rpt-section">
            <InfoBanner variant="warn">
              <strong>VAT Filing Reminder:</strong> VAT Return Form 002 is due by the last day of next month. VAT
              payable to FIRS: <strong>{formatNaira(vatPayable)}</strong>. NAFDAC-registered pharmaceutical medicines
              are VAT exempt under the VAT Act 2019 (as amended). Personal care and FMCG products attract 7.5%.
            </InfoBanner>
            <KpiGrid cols={3}>
              <KpiCard label="Output VAT Collected (7.5%)" value={formatNaira(outputVat)} accent="green" smallValue />
              <KpiCard label="Input VAT (paid on purchases)" value={formatNaira(inputVat)} accent="red" smallValue />
              <KpiCard label="VAT Payable to FIRS" value={formatNaira(vatPayable)} smallValue />
            </KpiGrid>
            <Card>
              <CardHeader
                title="VAT by Product Category"
                action={
                  <Button size="sm" variant="outline" onClick={() => showToast('Preparing VAT Return Form 002…', 'ok')}>
                    Prepare VAT Return Form 002
                  </Button>
                }
              />
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>VAT Treatment</th>
                    <th>SKUs</th>
                    <th>VAT Rate</th>
                    <th>Est. Output VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    products.reduce<Record<string, { skus: number; units: number }>>((acc, p) => {
                      const cat = p.productCategory || p.doraCategory || 'Uncategorised';
                      const row = acc[cat] ?? { skus: 0, units: 0 };
                      row.skus += 1;
                      row.units += num(p.totalQuantityAvailable);
                      acc[cat] = row;
                      return acc;
                    }, {}),
                  ).map(([cat, row]) => {
                    const exempt = /pharma|medicine|nafdac/i.test(cat);
                    return (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td>
                          <Badge variant={exempt ? 'blue' : 'green'}>{exempt ? 'VAT Exempt' : 'Taxable'}</Badge>
                        </td>
                        <td>
                          <Mono>{row.skus}</Mono>
                        </td>
                        <td>{exempt ? '0%' : '7.5%'}</td>
                        <td>
                          <Mono style={{ fontWeight: 700 }}>{exempt ? formatNaira(0) : '—'}</Mono>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="rpt-section">
            <KpiGrid cols={3}>
              <KpiCard label="Suppliers" value={String(suppliers.length)} />
              <KpiCard label="Restocks Logged" value={String(restocks.length)} accent="green" />
              <KpiCard label="Returns Logged" value={String(returns.length)} accent="amber" />
            </KpiGrid>
            <DataTable>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>GRNs</th>
                  <th>Purchases</th>
                  <th>Payments Made</th>
                  <th>Outstanding</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: 'var(--tx3)' }}>
                      No suppliers yet.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => {
                    const mine = restocks.filter((r) => {
                      const sid = typeof r.supplier === 'object' && r.supplier ? r.supplier._id : r.supplier;
                      return sid === s._id;
                    });
                    const purchases = mine.reduce((sum, r) => {
                      const lines = Array.isArray(r.products) ? r.products : [];
                      return sum + lines.reduce((ls, p) => ls + num(p.quantity) * num(p.supplyPrice ?? p.sellingPrice), 0);
                    }, 0);
                    return (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.name || '—'}</strong>
                        </td>
                        <td>
                          <Mono>{mine.length}</Mono>
                        </td>
                        <td>
                          <Mono>{formatNaira(purchases)}</Mono>
                        </td>
                        <td>
                          <Mono style={{ color: 'var(--Gd)' }}>{formatNaira(0)}</Mono>
                        </td>
                        <td>
                          <Mono style={{ fontWeight: 700, color: purchases ? 'var(--at)' : undefined }}>
                            {formatNaira(purchases)}
                          </Mono>
                        </td>
                        <td>{s.contactName || s.email || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </DataTable>
          </div>
        )}
      </QueryState>
    </>
  );
}
