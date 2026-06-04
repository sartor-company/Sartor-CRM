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
  RoleGate,
  IconLabel,
} from '../components/ui';
import type { IconName } from '../types/icons';
import { ReportRevenueChart, AgingChart } from '../components/charts/DashboardCharts';
import { REPORT_TABS_BY_TIER, REPORT_TAB_UPGRADE } from '../constants/tiers';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useRoleGates } from '../hooks/useRoleGates';

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

export default function ReportsPage() {
  const { tier } = useApp();
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showInvConfirmPay } = useRoleGates();
  const allowedTabs = REPORT_TABS_BY_TIER[tier];
  const [activeTab, setActiveTab] = useState(allowedTabs[0] ?? 'overview');
  const [period, setPeriod] = useState('mtd');
  const [showCustom, setShowCustom] = useState(false);

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

  return (
    <>
      <PageHead
        icon="chart"
        title="Reports & Analytics"
        subtitle="Select a report type. All reports respect the period filter above."
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
          <option value="mtd">This Month (May 2026)</option>
          <option value="last">Last Month</option>
          <option value="q">This Quarter (Q2 2026)</option>
          <option value="ytd">Year to Date 2026</option>
          <option value="custom">Custom Range</option>
        </select>
        {showCustom && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="inp" style={{ width: 130, padding: '5px 8px', fontSize: 12 }} defaultValue="2026-05-01" />
            <span style={{ fontSize: 12, color: 'var(--tx3)' }}>to</span>
            <input type="date" className="inp" style={{ width: 130, padding: '5px 8px', fontSize: 12 }} defaultValue="2026-05-12" />
          </div>
        )}
        <Button size="sm" onClick={() => showToast('Filter applied.', 'ok')}>
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

      {activeTab === 'overview' && (
        <div className="rpt-section">
          <KpiGrid cols={4}>
            <KpiCard label="Total Sales (LPOs)" value="₦8.4M" trend="↑ 14% vs Apr" trendType="up" smallValue />
            <KpiCard label="Payments Received" value="₦6.2M" trend="73.8% collection rate" accent="green" smallValue />
            <KpiCard label="Outstanding Balance" value="₦2.2M" trend="5 overdue invoices" trendType="down" accent="amber" smallValue />
            <KpiCard label="Net Operating Income" value="₦2.5M" trend="Margin: 34.5%" trendType="up" accent="purple" smallValue />
          </KpiGrid>
          <div className="g2 mb">
            <Card>
              <CardHeader title="Revenue — Last 6 Months" />
              <div className="chart-wrap">
                <ReportRevenueChart />
              </div>
            </Card>
            <Card>
              <CardHeader title="Invoice Aging Breakdown" />
              <div className="chart-wrap">
                <AgingChart />
              </div>
            </Card>
          </div>
          <div className="g2">
            <Card className="mb" padding={false}>
              <div className="cp" style={{ paddingBottom: 0 }}>
                <CardHeader icon="trophy" title="Top Customers" />
              </div>
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
                  <tr>
                    <td>
                      <span className="rank rank-1">1</span>
                    </td>
                    <td>Zenith Pharma</td>
                    <td>
                      <Mono style={{ fontWeight: 700 }}>₦1,240,000</Mono>
                    </td>
                    <td>
                      <Mono style={{ color: 'var(--Gd)' }}>₦0</Mono>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="rank rank-2">2</span>
                    </td>
                    <td>FreshMart NG</td>
                    <td>
                      <Mono style={{ fontWeight: 700 }}>₦680,000</Mono>
                    </td>
                    <td>
                      <Mono style={{ color: 'var(--at)' }}>₦140,000</Mono>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card className="mb" padding={false}>
              <div className="cp" style={{ paddingBottom: 0 }}>
                <CardHeader icon="medal" title="Top Reps / Admins" />
              </div>
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
                  <tr>
                    <td>
                      <span className="rank rank-1">1</span>
                    </td>
                    <td>Abubakar (Admin)</td>
                    <td>
                      <Mono>₦820,000</Mono>
                    </td>
                    <td>
                      <Mono style={{ color: 'var(--Gd)' }}>₦28,700</Mono>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="rank rank-2">2</span>
                    </td>
                    <td>Emmanuel (Rep)</td>
                    <td>
                      <Mono>₦540,000</Mono>
                    </td>
                    <td>
                      <Mono style={{ color: 'var(--Gd)' }}>₦13,500</Mono>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="rpt-section">
          <KpiGrid cols={4}>
            <KpiCard label="Gross Sales" value="₦8,400,000" smallValue />
            <KpiCard label="Less: Returns" value="₦54,000" accent="red" smallValue />
            <KpiCard label="Net Sales" value="₦8,346,000" accent="green" smallValue />
            <KpiCard label="Units Sold" value="2,680" accent="blue" />
          </KpiGrid>
          <DataTable>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Gross Revenue</th>
                <th>Returns</th>
                <th>Net Revenue</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Mono style={{ fontSize: 11 }}>SH-25-CAR</Mono>
                </td>
                <td>Carabiner 250ml</td>
                <td>
                  <Mono>1,200</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700 }}>₦1,440,000</Mono>
                </td>
                <td>
                  <Mono style={{ color: 'var(--rt)' }}>₦12,000</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--N)' }}>₦1,428,000</Mono>
                </td>
                <td style={{ color: 'var(--Gd)', fontWeight: 700 }}>35%</td>
              </tr>
            </tbody>
          </DataTable>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="rpt-section">
          <KpiGrid cols={4}>
            <KpiCard label="Total Collected (MTD)" value="₦6,200,000" accent="green" smallValue />
            <KpiCard label="Collection Rate" value="73.8%" trend="Target: 90%" />
            <KpiCard label="30–60 Days Overdue" value="₦980,000" trend="3 invoices" accent="amber" smallValue />
            <KpiCard label="60+ Days Overdue" value="₦276,000" trend="2 invoices — escalate" trendType="down" accent="red" smallValue />
          </KpiGrid>
          <DataTable>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Invoice Amt</th>
                <th>Payments Received</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Mono style={{ fontSize: 11 }}>INV-00042</Mono>
                </td>
                <td>FreshMart NG</td>
                <td>
                  <Mono>₦240,000</Mono>
                </td>
                <td>
                  <Mono>₦100,000</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--at)' }}>₦140,000</Mono>
                </td>
                <td>
                  <Badge variant="amber">Part Paid</Badge>
                </td>
              </tr>
            </tbody>
          </DataTable>
        </div>
      )}

      {activeTab === 'aging' && (
        <div className="rpt-section">
          <KpiGrid cols={4}>
            <KpiCard label="Current (0–30 days)" value="₦944,000" trend="8 invoices" accent="green" smallValue />
            <KpiCard label="Due Soon (30–60 days)" value="₦980,000" trend="3 invoices" accent="amber" smallValue />
            <KpiCard label="Overdue (60–90 days)" value="₦276,000" trend="2 invoices" trendType="down" accent="red" smallValue />
            <KpiCard label="At Risk (90+ days)" value="₦0" trend="None this period" accent="red" smallValue />
          </KpiGrid>
          <InfoBanner variant="err">
            INV-00039 (PharmaCare ₦180,000 · 68 days) and INV-00037 (MedPoint ₦96,000 · 63 days) are over 60 days.
            Formal collection notice required.
          </InfoBanner>
          <DataTable>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Balance Due</th>
                <th>Days Outstanding</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Mono style={{ fontSize: 11 }}>INV-00039</Mono>
                </td>
                <td>PharmaCare Ltd</td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--rt)' }}>₦180,000</Mono>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--rt)' }}>68 days</td>
                <td>
                  <Button variant="danger" size="xs" onClick={() => showToast('Collection escalation sent to CEO.', 'warn')}>
                    Escalate
                  </Button>
                </td>
              </tr>
              <tr>
                <td>
                  <Mono style={{ fontSize: 11 }}>INV-00042</Mono>
                </td>
                <td>FreshMart NG</td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--at)' }}>₦140,000</Mono>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--at)' }}>3 days</td>
                <td>
                  <Button variant="secondary" size="xs" onClick={() => openModal('add-payment')}>
                    Add Payment
                  </Button>
                </td>
              </tr>
            </tbody>
          </DataTable>
        </div>
      )}

      {activeTab === 'pl' && (
        <div className="rpt-section">
          <Card style={{ borderTop: '3px solid var(--N)' }}>
            <CardHeader title="Profit & Loss Statement" subtitle={<span style={{ fontSize: 11, color: 'var(--tx3)' }}>May 2026</span>} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div className="sdiv-label" style={{ marginTop: 0 }}>
                  Revenue
                </div>
                <div className="irow" style={{ marginBottom: 4 }}>
                  <span className="ilbl" style={{ minWidth: 200 }}>
                    Gross Sales (Invoiced)
                  </span>
                  <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>
                    ₦8,400,000
                  </span>
                </div>
                <div className="irow" style={{ borderTop: '1px solid var(--brd)', paddingTop: 6, marginBottom: 12 }}>
                  <span className="ilbl" style={{ minWidth: 200, fontWeight: 700, color: 'var(--N)' }}>
                    Net Revenue
                  </span>
                  <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700, color: 'var(--N)' }}>
                    ₦8,346,000
                  </span>
                </div>
                <div className="sdiv-label" style={{ marginTop: 0 }}>
                  Cost of Goods
                </div>
                <div className="irow" style={{ borderTop: '1px solid var(--brd)', paddingTop: 6 }}>
                  <span className="ilbl" style={{ minWidth: 200, fontWeight: 700, color: 'var(--Gd)' }}>
                    Gross Profit
                  </span>
                  <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700, color: 'var(--Gd)' }}>
                    ₦2,878,200
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 6 }}>
                  Gross Margin: <strong style={{ color: 'var(--Gd)' }}>34.5%</strong>
                </div>
              </div>
              <div>
                <div className="sdiv-label" style={{ marginTop: 0 }}>
                  Operating Expenses
                </div>
                <div className="irow" style={{ borderTop: '2px solid var(--N)', paddingTop: 6, marginBottom: 14 }}>
                  <span className="ilbl" style={{ minWidth: 200, fontWeight: 700, color: 'var(--N)' }}>
                    Net Operating Income
                  </span>
                  <span className="ival" style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right', fontWeight: 700, color: 'var(--N)' }}>
                    ₦2,544,200
                  </span>
                </div>
                <div style={{ background: 'var(--Gb)', borderRadius: 8, padding: 12 }}>
                  <div className="sdiv-label" style={{ marginTop: 0, color: 'var(--Gd)' }}>
                    VAT Position — FIRS
                  </div>
                  <div className="irow" style={{ borderTop: '1px solid rgba(0,179,65,.3)', paddingTop: 5 }}>
                    <span className="ilbl" style={{ minWidth: 140, fontWeight: 700, color: 'var(--Gd)' }}>
                      VAT Payable to FIRS
                    </span>
                    <span className="ival" style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--Gd)' }}>
                      ₦289,300
                    </span>
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
            <KpiCard label="Total Commission Due (MTD)" value="₦53,600" smallValue />
            <KpiCard label="Paid Out" value="₦13,500" accent="green" smallValue />
            <KpiCard label="Outstanding" value="₦40,100" accent="amber" smallValue />
          </KpiGrid>
          <DataTable>
            <thead>
              <tr>
                <th>Rep / Admin</th>
                <th>Rate</th>
                <th>Commission Earned</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Abubakar Idah</strong>
                </td>
                <td>3.5%</td>
                <td>
                  <Mono style={{ fontWeight: 700 }}>₦28,700</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--at)' }}>₦28,700</Mono>
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
            </tbody>
          </DataTable>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="rpt-section">
          <KpiGrid cols={4}>
            <KpiCard label="GRNs This Month" value="4" />
            <KpiCard label="Units Received" value="3,200" accent="green" />
            <KpiCard label="Write-offs (Value)" value="₦28,000" accent="red" smallValue />
            <KpiCard label="Open Variances" value="2" accent="amber" />
          </KpiGrid>
          <div className="sdiv-label">GRN Summary</div>
          <DataTable>
            <thead>
              <tr>
                <th>GRN No.</th>
                <th>Supplier</th>
                <th>Units Received</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Mono style={{ fontWeight: 700 }}>GRN-0004</Mono>
                </td>
                <td>West Africa Chemicals</td>
                <td>
                  <Mono>1,800</Mono>
                </td>
                <td>
                  <Mono>₦1,404,000</Mono>
                </td>
                <td>
                  <Badge variant="green">Full Acceptance</Badge>
                </td>
              </tr>
            </tbody>
          </DataTable>
        </div>
      )}

      {activeTab === 'vat' && (
        <div className="rpt-section">
          <InfoBanner variant="warn">
            <strong>VAT Filing Reminder:</strong> VAT Return Form 002 for May 2026 is due by 30 June 2026. VAT Payable
            to FIRS: <strong>₦289,300</strong>.
          </InfoBanner>
          <KpiGrid cols={3}>
            <KpiCard label="Output VAT Collected (7.5%)" value="₦472,500" accent="green" smallValue />
            <KpiCard label="Input VAT (paid on purchases)" value="₦183,200" accent="red" smallValue />
            <KpiCard label="VAT Payable to FIRS" value="₦289,300" smallValue />
          </KpiGrid>
          <Card>
            <CardHeader title="VAT by Product Category" />
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>VAT Treatment</th>
                  <th>Net Sales</th>
                  <th>Output VAT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Personal Care (Hand Sanitiser)</td>
                  <td>
                    <Badge variant="green">Taxable</Badge>
                  </td>
                  <td>
                    <Mono>₦6,300,000</Mono>
                  </td>
                  <td>
                    <Mono style={{ color: 'var(--N)', fontWeight: 700 }}>₦472,500</Mono>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <Button size="sm" onClick={() => showToast('VAT return prepared. Review before filing.', 'ok')}>
                Prepare VAT Return Form 002
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="rpt-section">
          <KpiGrid cols={3}>
            <KpiCard label="Total Owed to Suppliers" value="₦1,200,000" accent="red" smallValue />
            <KpiCard label="Overdue (30+ days)" value="₦480,000" accent="amber" smallValue />
            <KpiCard label="Paid This Month" value="₦640,000" accent="green" smallValue />
          </KpiGrid>
          <DataTable>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Purchases (MTD)</th>
                <th>Outstanding</th>
                <th>Overdue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>West Africa Chemicals</strong>
                </td>
                <td>
                  <Mono>₦1,764,000</Mono>
                </td>
                <td>
                  <Mono style={{ fontWeight: 700, color: 'var(--at)' }}>₦720,000</Mono>
                </td>
                <td>
                  <Mono style={{ color: 'var(--rt)' }}>₦480,000</Mono>
                </td>
                <td>
                  <Badge variant="red">Overdue</Badge>
                </td>
              </tr>
            </tbody>
          </DataTable>
        </div>
      )}
    </>
  );
}
