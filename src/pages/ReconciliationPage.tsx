import {
  Badge,
  Button,
  DataTable,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
} from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate } from '../utils/format';

export default function ReconciliationPage() {
  const { openModal } = useModal();
  const { data: rows = [], loading, error } = useApiQuery(() => opsApi.listRecons(), []);

  const lastCount = (rows ?? [])[0];
  const openVar = (rows ?? []).filter((r) => (r.variance ?? 0) !== 0 && r.status !== 'Adjusted' && r.status !== 'Matched').length;

  return (
    <>
      <PageHead
        icon="clipboard"
        title="Stock Reconciliation"
        subtitle="Physical counts vs system stock."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('stock-recon-count')}>
            + Start Cycle Count
          </Button>
        }
      />

      <InfoBanner>
        Log physical counts regularly. Variances open an investigation until adjusted or matched.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="Last Full Count" value={lastCount ? formatDate(lastCount.countDate || lastCount.creationDateTime) : '—'} />
        <KpiCard label="Open Variances" value={String(openVar)} accent="amber" />
        <KpiCard label="Next Scheduled Count" value="This week" accent="blue" />
      </KpiGrid>

      <QueryState
        loading={loading}
        error={error}
        empty={!rows?.length}
        emptyMessage="No reconciliation counts yet."
      >
        <DataTable>
          <thead>
            <tr>
              <th>Date</th>
              <th>SKU</th>
              <th>Product</th>
              <th>System</th>
              <th>Physical</th>
              <th>Variance</th>
              <th>Var %</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const variance = r.variance ?? 0;
              const sys = r.systemQty ?? 0;
              const pct = sys ? ((variance / sys) * 100).toFixed(1) : '0.0';
              return (
                <tr key={r._id}>
                  <td>{formatDate(r.countDate || r.creationDateTime)}</td>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{r.sku || '—'}</Mono>
                  </td>
                  <td>{r.productName || '—'}</td>
                  <td>
                    <Mono>{(r.systemQty ?? 0).toLocaleString()}</Mono>
                  </td>
                  <td>
                    <Mono>{(r.physicalQty ?? 0).toLocaleString()}</Mono>
                  </td>
                  <td>
                    <Mono style={{ color: variance === 0 ? 'var(--Gd)' : 'var(--at)' }}>
                      {variance > 0 ? `+${variance}` : variance}
                    </Mono>
                  </td>
                  <td>
                    <Mono style={{ color: variance === 0 ? 'var(--Gd)' : 'var(--at)' }}>
                      {variance === 0 ? '0%' : `${Number(pct) > 0 ? '+' : ''}${pct}%`}
                    </Mono>
                  </td>
                  <td>
                    <Badge
                      variant={
                        r.status === 'Matched' ? 'green' : r.status === 'Adjusted' ? 'blue' : 'amber'
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button variant="outline" size="xs" onClick={() => openModal('stock-recon-count')}>
                        Review
                      </Button>
                      {variance !== 0 && r.status !== 'Adjusted' && (
                        <Button variant="amber" size="xs" onClick={() => openModal('stock-adjust')}>
                          Adjust
                        </Button>
                      )}
                      <Button variant="secondary" size="xs" onClick={() => openModal('stock-recon-count')}>
                        Report
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
