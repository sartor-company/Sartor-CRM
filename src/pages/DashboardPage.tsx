import {
  Badge,
  Card,
  CardHeader,
  CardLinkAction,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  RoleGate,
} from '../components/ui';
import { RevenueChart, AgingChart, PipelineChart } from '../components/charts/DashboardCharts';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { MOCK_INVOICES } from '../data/mock';
import { useRoleGates } from '../hooks/useRoleGates';

export default function DashboardPage() {
  const { openModal } = useModal();
  const { navigateToPage } = useApp();
  const { showDashCommCard, showKcComm } = useRoleGates();
  const recent = MOCK_INVOICES.slice(0, 2);

  return (
    <>
      <PageHead title="Dashboard" subtitle="Business overview at a glance." />

      <RoleGate show={showDashCommCard}>
        <div className="comm-card mb">
          <div className="comm-card-rate">3.5%</div>
          <div className="comm-card-lbl">My Commission Due — May 2026</div>
          <div className="comm-card-amt">₦28,700</div>
          <div className="comm-card-sub">
            From 5 confirmed invoices ·{' '}
            <button
              type="button"
              className="ca"
              style={{ color: 'rgba(255,255,255,.8)' }}
              onClick={() => navigateToPage('my-commissions')}
            >
              View history →
            </button>
          </div>
        </div>
      </RoleGate>

      <KpiGrid cols={5}>
        <KpiCard label="Revenue (MTD)" value="₦4.2M" trend="↑ 10.5%" trendType="up" smallValue />
        <KpiCard label="Active Leads" value="84" trend="↑ 7 this week" trendType="up" accent="green" />
        <KpiCard label="Pending LPOs" value="12" trend="3 await dispatch" accent="amber" />
        <KpiCard label="Overdue Invoices" value="5" trend="₦1.8M outstanding" trendType="down" accent="red" />
        <RoleGate show={showKcComm}>
          <KpiCard label="Commission Owed" value="₦218K" trend="3 reps active" accent="purple" smallValue />
        </RoleGate>
      </KpiGrid>

      <div className="g3 mb">
        <Card>
          <CardHeader title="Revenue — Last 6 Months" />
          <div className="chart-wrap">
            <RevenueChart />
          </div>
        </Card>
        <Card>
          <CardHeader title="Invoice Aging" />
          <div className="chart-wrap">
            <AgingChart />
          </div>
        </Card>
      </div>

      <div className="g2 mb">
        <Card>
          <CardHeader
            title="Pipeline Snapshot"
            action={<CardLinkAction onClick={() => navigateToPage('pipeline')}>Board →</CardLinkAction>}
          />
          <div className="chart-wrap" style={{ height: 140 }}>
            <PipelineChart />
          </div>
        </Card>
        <Card padding={false}>
          <div className="cp" style={{ paddingBottom: 0 }}>
            <CardHeader
              title="Recent Invoices"
              action={<CardLinkAction onClick={() => navigateToPage('invoices')}>All →</CardLinkAction>}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((inv) => (
                <tr
                  key={inv.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openModal('view-invoice')}
                >
                  <td>
                    <Mono>{inv.id}</Mono>
                  </td>
                  <td>{inv.customer}</td>
                  <td>
                    <Mono>{inv.amount}</Mono>
                  </td>
                  <td>
                    <Badge variant={inv.statusVariant}>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
