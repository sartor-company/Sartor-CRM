import { Badge, Button, DataTable, InfoBanner, KpiCard, KpiGrid, Mono, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

const RECON_ROWS = [
  { date: '10 May 2026', sku: 'SH-25-CAR', product: 'Carabiner 250ml', system: '2,340', physical: '2,326', variance: '-14', varPct: '-0.6%', status: 'Under Investigation', statusVariant: 'amber' as const, actions: true },
  { date: '10 May 2026', sku: 'SH-25-SIL', product: 'Silicone 250ml', system: '380', physical: '380', variance: '0', varPct: '0.0%', status: 'Reconciled', statusVariant: 'green' as const },
  { date: '30 Apr 2026', sku: 'SH-50-CAR', product: '500ml', system: '92', physical: '85', variance: '-7', varPct: '-7.6%', status: 'Variance Approved — Adjusted', statusVariant: 'red' as const, report: true },
];

export default function ReconciliationPage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        icon="hash"
        title="Stock Reconciliation"
        subtitle="Formal cycle count. Physical count vs system count. Variances require CEO investigation before adjustment."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('stock-recon-count')}>
            + Start Cycle Count
          </Button>
        }
      />

      <InfoBanner>
        A <strong>cycle count</strong> is a scheduled, partial physical count — typically one SKU category per week —
        rather than a full stocktake. Variances exceeding 2% must be investigated before any stock adjustment is approved.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard
          label="Last Full Count"
          value={<span style={{ fontSize: 15, fontFamily: "'DM Mono', monospace" }}>30 Apr 2026</span>}
          trend="12 days ago"
        />
        <KpiCard label="Open Variances" value="2" trend="Pending investigation" trendType="down" accent="amber" />
        <KpiCard
          label="Next Scheduled Count"
          value={<span style={{ fontSize: 15, fontFamily: "'DM Mono', monospace" }}>17 May 2026</span>}
        />
      </KpiGrid>

      <DataTable>
        <thead>
          <tr>
            <th>Count Date</th>
            <th>SKU</th>
            <th>Product</th>
            <th>System Count</th>
            <th>Physical Count</th>
            <th>Variance</th>
            <th>Var %</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {RECON_ROWS.map((r) => (
            <tr key={r.sku + r.date}>
              <td>{r.date}</td>
              <td>
                <Mono style={{ fontSize: 11 }}>{r.sku}</Mono>
              </td>
              <td>{r.product}</td>
              <td>
                <Mono>{r.system}</Mono>
              </td>
              <td>
                <Mono>{r.physical}</Mono>
              </td>
              <td>
                <Mono style={{ fontWeight: 700, color: r.variance === '0' ? 'var(--Gd)' : 'var(--rt)' }}>
                  {r.variance}
                </Mono>
              </td>
              <td style={{ fontWeight: 700, color: r.variance === '0' ? 'var(--Gd)' : 'var(--rt)' }}>{r.varPct}</td>
              <td>
                <Badge variant={r.statusVariant}>{r.status}</Badge>
              </td>
              <td>
                {r.actions ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="secondary" size="xs" onClick={() => openModal('stock-adjust')}>
                      Adjust
                    </Button>
                    <Button variant="outline" size="xs">
                      Report
                    </Button>
                  </div>
                ) : r.report ? (
                  <Button variant="outline" size="xs">
                    View Report
                  </Button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
