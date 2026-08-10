import { useEffect } from 'react';
import { Badge, Button, Card, CardHeader, PageHead, QueryState } from '../components/ui';
import { opsApi, type OpsWarehouse } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate } from '../utils/format';

function managerName(w: OpsWarehouse) {
  if (!w.manager) return 'Unassigned';
  if (typeof w.manager === 'string') return w.manager;
  return w.manager.fullName || 'Unassigned';
}

export default function WarehousesPage() {
  const { openModal } = useModal();
  const { data: warehouses = [], loading, error, reload } = useApiQuery(
    () => opsApi.listWarehouses(),
    [],
  );

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-ops-changed', onChange);
    return () => window.removeEventListener('crm-ops-changed', onChange);
  }, [reload]);

  return (
    <>
      <PageHead
        icon="factory"
        title="Warehouses"
        subtitle={loading ? undefined : `${warehouses?.length ?? 0} locations`}
        actions={
          <Button
            variant="green"
            size="sm"
            onClick={() => openModal('add-warehouse')}
          >
            + Add Warehouse
          </Button>
        }
      />

      <QueryState
        loading={loading}
        error={error}
        empty={!warehouses?.length}
        emptyMessage="No warehouses yet. Add your first depot or hub."
      >
        <div className="g2">
          {(warehouses ?? []).map((w) => (
            <Card key={w._id}>
              <CardHeader
                title={w.name}
                subtitle={
                  <Badge variant={w.status === 'Active' ? 'green' : w.status === 'Pending' ? 'amber' : 'gray'}>
                    {w.status || 'Active'}
                  </Badge>
                }
              />
              <div className="irow">
                <span className="ilbl">Address</span>
                <span className="ival">{w.address}</span>
              </div>
              <div className="irow">
                <span className="ilbl">WH Manager</span>
                <span className="ival">{managerName(w)}</span>
              </div>
              <div className="irow">
                <span className="ilbl">SKUs</span>
                <span className="ival">
                  {w.skuCount ?? 0} products · {(w.totalUnits ?? 0).toLocaleString()} units
                </span>
              </div>
              <div className="irow">
                <span className="ilbl">Created</span>
                <span className="ival">{formatDate(w.creationDateTime)}</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('wh-inventory', { warehouse: w })}
                >
                  View Inventory
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal('wh-staff', { warehouse: w })}
                >
                  Manage Staff
                </Button>
                <Button variant="outline" size="sm" onClick={() => void reload()}>
                  Refresh
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </>
  );
}
