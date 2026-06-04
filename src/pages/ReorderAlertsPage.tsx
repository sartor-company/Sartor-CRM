import { Badge, Button, DataTable, IconLabel, InfoBanner, KpiCard, KpiGrid, Mono, PageHead } from '../components/ui';
import type { IconName } from '../types/icons';
import { useModal } from '../context/ModalContext';

const ALERTS: {
  sku: string;
  name: string;
  stock: string;
  committed: string;
  reorder: string;
  days: string;
  alert: string;
  alertIcon: IconName;
  alertVariant: 'red' | 'amber';
  replen: string;
  replenVariant: 'gray' | 'teal';
  primary?: boolean;
}[] = [
  { sku: 'SH-50-CAR', name: 'Hand Sanitiser 500ml', stock: '85', committed: '0', reorder: '500', days: '~3 days', alert: 'Critical', alertIcon: 'circle-alert', alertVariant: 'red', replen: 'No Request Raised', replenVariant: 'gray', primary: true },
  { sku: 'SH-25-SIL', name: 'Hand Sanitiser 250ml Silicone', stock: '380', committed: '60', reorder: '500', days: '~12 days', alert: 'Low Stock', alertIcon: 'alert', alertVariant: 'amber', replen: 'Request Sent — CEO Review', replenVariant: 'teal' },
  { sku: 'SH-25-HOK', name: 'Silicone Hook Pack', stock: '280', committed: '0', reorder: '400', days: '~18 days', alert: 'Low Stock', alertIcon: 'alert', alertVariant: 'amber', replen: 'No Request Raised', replenVariant: 'gray' },
];

export default function ReorderAlertsPage() {
  const { openModal } = useModal();

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
        <KpiCard label="Critical (0–20% of reorder level)" value="1" trend="Immediate action required" trendType="down" accent="red" />
        <KpiCard label="Low Stock (below reorder level)" value="2" trend="Order within 7 days" accent="amber" />
        <KpiCard label="Requests Pending CEO Approval" value="1" accent="blue" />
      </KpiGrid>

      <InfoBanner variant="err">
        <strong>SH-50-CAR (Hand Sanitiser 500ml)</strong> has only 85 units — 17% of its 500-unit reorder level. Current
        LPO commitments may deplete this SKU within 3 days. Raise replenishment request immediately.
      </InfoBanner>

      <DataTable>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Available Stock</th>
            <th>Committed</th>
            <th>Reorder Level</th>
            <th>Days Until Stockout</th>
            <th>Alert Level</th>
            <th>Replenishment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ALERTS.map((a) => (
            <tr key={a.sku}>
              <td>
                <Mono style={{ fontSize: 12 }}>{a.sku}</Mono>
              </td>
              <td>{a.name}</td>
              <td>
                <Mono style={{ fontWeight: 700, color: a.primary ? 'var(--rt)' : 'var(--at)' }}>{a.stock}</Mono>
              </td>
              <td>
                <Mono>{a.committed}</Mono>
              </td>
              <td>
                <Mono>{a.reorder}</Mono>
              </td>
              <td style={{ fontWeight: 700, color: a.primary ? 'var(--rt)' : 'var(--at)' }}>{a.days}</td>
              <td>
                <Badge variant={a.alertVariant}>
                  <IconLabel icon={a.alertIcon} size={12}>
                    {a.alert}
                  </IconLabel>
                </Badge>
              </td>
              <td>
                <Badge variant={a.replenVariant}>{a.replen}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Button
                    variant={a.replen.includes('Request Sent') ? 'secondary' : 'green'}
                    size="sm"
                    onClick={() => openModal('replenishment-request')}
                  >
                    {a.replen.includes('Request Sent') ? 'View Request' : 'Request Replenishment'}
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => openModal('view-product')}>
                    View Batches
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
