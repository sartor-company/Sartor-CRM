import {
  Badge,
  Card,
  CardHeader,
  CardLinkAction,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  RoleGate,
} from '../components/ui';
import { RevenueChart, AgingChart, PipelineChart } from '../components/charts/DashboardCharts';
import { crmApi, leadName, type CrmInvoice } from '../api/crm';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatCompactNaira, formatNaira, num } from '../utils/format';
import { invoiceStatusVariant } from '../utils/statusBadges';

export default function DashboardPage() {
  const { openModal } = useModal();
  const { navigateToPage } = useApp();
  const { showDashCommCard, showKcComm } = useRoleGates();

  const { data: dash, loading: dashLoading, error: dashError } = useApiQuery(
    () => crmApi.dashboard(),
    [],
  );
  const { data: invoices } = useApiQuery(() => crmApi.listInvoices(), []);

  const cards = dash?.cards;
  const recent = (invoices ?? []).slice(0, 5);
  const overdueCount = (invoices ?? []).filter((i) =>
    String(i.status || '').toLowerCase().includes('overdue'),
  ).length;
  const pendingLpos = cards?.totalLpos ?? '—';

  return (
    <>
      <PageHead title="Dashboard" subtitle="Business overview at a glance." />

      {dashError && (
        <InfoBanner variant="err" style={{ marginBottom: 12 }}>
          {dashError}
        </InfoBanner>
      )}

      <RoleGate show={showDashCommCard}>
        <div className="comm-card mb">
          <div className="comm-card-rate">Commission</div>
          <div className="comm-card-lbl">My Commission Due</div>
          <div className="comm-card-amt">—</div>
          <div className="comm-card-sub">
            From confirmed invoices ·{' '}
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
        <KpiCard
          label="Total Sales"
          value={dashLoading ? '…' : formatCompactNaira(cards?.totalSales)}
          trend="From dashboard"
          accent="green"
          smallValue
        />
        <KpiCard
          label="Customers"
          value={dashLoading ? '…' : String(cards?.totalCustomers ?? 0)}
          accent="green"
        />
        <KpiCard
          label="LPOs"
          value={dashLoading ? '…' : String(pendingLpos)}
          accent="amber"
        />
        <KpiCard
          label="Overdue Invoices"
          value={String(overdueCount)}
          trend={overdueCount ? 'Needs attention' : 'All clear'}
          trendType={overdueCount ? 'down' : 'up'}
          accent="red"
        />
        <RoleGate show={showKcComm}>
          <KpiCard
            label="Products"
            value={dashLoading ? '…' : String(cards?.totalProducts ?? 0)}
            accent="purple"
            smallValue
          />
        </RoleGate>
      </KpiGrid>

      <div className="g3 mb">
        <Card>
          <CardHeader title="Revenue — Monthly" />
          <div className="chart-wrap">
            <RevenueChart monthlyRevenue={dash?.revenueChart?.monthlyRevenue} />
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
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--tx3)', fontSize: 12 }}>
                    {invoices ? 'No invoices yet.' : 'Loading…'}
                  </td>
                </tr>
              ) : (
                recent.map((inv: CrmInvoice) => (
                  <tr
                    key={inv._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openModal('view-invoice', { invoice: inv })}
                  >
                    <td>
                      <Mono>{inv.invoiceId || inv._id.slice(-6)}</Mono>
                    </td>
                    <td>{leadName(typeof inv.lead === 'object' ? inv.lead : null)}</td>
                    <td>
                      <Mono>{formatNaira(num(inv.totalAmount))}</Mono>
                    </td>
                    <td>
                      <Badge variant={invoiceStatusVariant(inv.status)}>{inv.status || '—'}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
