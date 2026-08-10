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

  const matched = (rows ?? []).filter((r) => r.status === 'Matched').length;
  const investigating = (rows ?? []).filter((r) => r.status === 'Under Investigation').length;
  const adjusted = (rows ?? []).filter((r) => r.status === 'Adjusted').length;

  return (
    <>
      <PageHead
        icon="clipboard"
        title="Stock Reconciliation"
        subtitle="Physical counts vs system stock."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('stock-recon-count')}>
            + New Count
          </Button>
        }
      />

      <InfoBanner>
        Log physical counts regularly. Variances open an investigation until adjusted or matched.
      </InfoBanner>

      <KpiGrid cols={3}>
        <KpiCard label="Matched" value={String(matched)} accent="green" />
        <KpiCard label="Under Investigation" value={String(investigating)} accent="amber" />
        <KpiCard label="Adjusted" value={String(adjusted)} accent="blue" />
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const variance = r.variance ?? 0;
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
                    <Badge
                      variant={
                        r.status === 'Matched' ? 'green' : r.status === 'Adjusted' ? 'blue' : 'amber'
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline" size="xs" onClick={() => openModal('stock-recon-count')}>
                      Review
                    </Button>
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
