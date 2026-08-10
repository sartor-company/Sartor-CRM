import {
  Badge,
  Button,
  DataTable,
  IconLabel,
  InfoBanner,
  KpiCard,
  KpiGrid,
  Mono,
  PageHead,
  QueryState,
} from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';

export default function ReorderAlertsPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data, loading, error, reload } = useApiQuery(() => opsApi.reorderAlerts(), []);

  const alerts = data?.data ?? [];
  const critical = alerts.filter((a) => a.alert === 'Critical');
  const low = alerts.filter((a) => a.alert === 'Low Stock');
  const pending = data?.pendingRequests ?? 0;

  const requestReplen = async (a: (typeof alerts)[0]) => {
    try {
      await opsApi.createReplenishment({
        product: a.productId,
        sku: a.sku,
        productName: a.name,
        currentStock: a.stock,
        reorderLevel: a.reorderLevel,
        requestedQty: Math.max(a.reorderLevel - a.stock, a.reorderLevel),
        status: 'CEO Review',
      });
      showToast('Replenishment request submitted to CEO.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="bell"
        title="Reorder Alerts"
        subtitle="SKUs at or below their reorder level. Submit a replenishment request to CEO."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('replenishment-request')}>
            + Submit Replenishment Request
          </Button>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Critical (0–20% of reorder level)"
          value={String(critical.length)}
          trend="Immediate action required"
          trendType="down"
          accent="red"
        />
        <KpiCard
          label="Low Stock (below reorder level)"
          value={String(low.length)}
          trend="Order within 7 days"
          accent="amber"
        />
        <KpiCard label="Requests Pending CEO Approval" value={String(pending)} accent="blue" />
      </KpiGrid>

      {critical[0] && (
        <InfoBanner variant="err">
          <strong>
            {critical[0].sku} ({critical[0].name})
          </strong>{' '}
          has only {critical[0].stock} units — {critical[0].pct}% of its {critical[0].reorderLevel}-unit reorder
          level. Raise replenishment request immediately.
        </InfoBanner>
      )}

      <QueryState
        loading={loading}
        error={error}
        empty={!alerts.length}
        emptyMessage="All SKUs are above reorder levels."
      >
        <DataTable>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>% of Level</th>
              <th>Alert</th>
              <th>Replenishment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.productId}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{a.sku}</Mono>
                </td>
                <td>{a.name}</td>
                <td>
                  <Mono>{a.stock.toLocaleString()}</Mono>
                </td>
                <td>
                  <Mono>{a.reorderLevel.toLocaleString()}</Mono>
                </td>
                <td>{a.pct}%</td>
                <td>
                  <Badge variant={a.alert === 'Critical' ? 'red' : 'amber'}>
                    <IconLabel icon={a.alert === 'Critical' ? 'circle-alert' : 'alert'} size={12}>
                      {a.alert}
                    </IconLabel>
                  </Badge>
                </td>
                <td>
                  <Badge variant={a.replenishment ? 'teal' : 'gray'}>
                    {a.replenishment
                      ? `${a.replenishment.status} · qty ${a.replenishment.requestedQty}`
                      : 'No Request Raised'}
                  </Badge>
                </td>
                <td>
                  {!a.replenishment ? (
                    <Button variant="green" size="xs" onClick={() => void requestReplen(a)}>
                      Request
                    </Button>
                  ) : (
                    <Button variant="outline" size="xs" onClick={() => openModal('replenishment-request')}>
                      View
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
