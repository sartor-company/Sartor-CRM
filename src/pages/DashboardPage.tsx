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
import { useAuthStore } from '../store/authStore';
import { formatCompactNaira, formatNaira, num } from '../utils/format';
import { inThisMonth, isOverdue, outstandingAmount } from '../utils/invoice';
import { invoiceStatusVariant } from '../utils/statusBadges';

export default function DashboardPage() {
  const { openModal } = useModal();
  const { navigateToPage } = useApp();
  const user = useAuthStore((s) => s.user);
  const { showDashCommCard, showKcComm } = useRoleGates();

  const { data: dash, loading: dashLoading, error: dashError } = useApiQuery(
    () => crmApi.dashboard(),
    [],
  );
  const { data: extra } = useApiQuery(async () => {
    const [invoices, leads, lpos, config, commissions] = await Promise.all([
      crmApi.listInvoices().catch(() => []),
      crmApi.listLeads().catch(() => []),
      crmApi.listLpos().catch(() => []),
      crmApi.getCommissionConfig().catch(() => null),
      user?._id ? crmApi.listUserCommissions(user._id).catch(() => []) : Promise.resolve([]),
    ]);
    return { invoices, leads, lpos, config, commissions };
  }, [user?._id]);

  const invoices = extra?.invoices ?? [];
  const recent = invoices.slice(0, 5);
  const overdue = invoices.filter(isOverdue);
  const overdueAmt = overdue.reduce((s, i) => s + outstandingAmount(i), 0);
  const activeLeads = (extra?.leads ?? []).filter((l) => l.status !== 'Closed Lost' && l.status !== 'Closed Won' && l.status !== 'Payment Confirmed').length;
  const pendingLpos = (extra?.lpos ?? []).filter((l) => !/deliver|cancel/i.test(l.status || '')).length;
  const mtdRevenue = invoices
    .filter((i) => inThisMonth(i.creationDateTime || i.dueDate))
    .reduce((s, i) => s + num(i.totalAmount), 0);
  const commissionDue = (extra?.commissions ?? []).reduce((s, c) => s + num(c.earned), 0);
  const rate = extra?.config?.price ? `${extra.config.price}%` : 'Commission';
  const cards = dash?.cards;

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
          <div className="comm-card-rate">{rate} Rate</div>
          <div className="comm-card-lbl">My Commission Due</div>
          <div className="comm-card-amt">{formatNaira(commissionDue)}</div>
          <div className="comm-card-sub">
            From {(extra?.commissions ?? []).length} confirmed invoice
            {(extra?.commissions ?? []).length === 1 ? '' : 's'} ·{' '}
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
          label="Revenue (MTD)"
          value={dashLoading ? '…' : formatCompactNaira(mtdRevenue || cards?.totalSales)}
          trend="This month"
          accent="green"
          smallValue
        />
        <KpiCard
          label="Active Leads"
          value={String(activeLeads || cards?.totalCustomers || 0)}
          accent="green"
        />
        <KpiCard
          label="Pending LPOs"
          value={String(pendingLpos || cards?.totalLpos || 0)}
          accent="amber"
        />
        <KpiCard
          label="Overdue Invoices"
          value={String(overdue.length)}
          trend={overdue.length ? formatNaira(overdueAmt) : 'All clear'}
          trendType={overdue.length ? 'down' : 'up'}
          accent="red"
        />
        <RoleGate show={showKcComm}>
          <KpiCard
            label="Commission Owed"
            value={formatCompactNaira(commissionDue)}
            accent="purple"
            smallValue
          />
        </RoleGate>
      </KpiGrid>

      <div className="g3 mb">
        <Card>
          <CardHeader title="Revenue — Last 6 Months" />
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
                    {extra ? 'No invoices yet.' : 'Loading…'}
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
