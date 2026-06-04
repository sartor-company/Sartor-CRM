import { Badge, Button, Card, CardHeader, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

export default function WarehousesPage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        icon="factory"
        title="Warehouses"
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('add-warehouse')}>
            + Add Warehouse
          </Button>
        }
      />

      <div className="g2">
        <Card>
          <CardHeader title="Abuja Central" subtitle={<Badge variant="green">Active</Badge>} />
          <div className="irow">
            <span className="ilbl">Address</span>
            <span className="ival">Plot 12, Garki Industrial</span>
          </div>
          <div className="irow">
            <span className="ilbl">WH Manager</span>
            <span className="ival">Musa Abdullahi</span>
          </div>
          <div className="irow">
            <span className="ilbl">SKUs</span>
            <span className="ival">4 products · 3,925 units</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm">
              View Inventory
            </Button>
            <Button variant="secondary" size="sm">
              Manage Staff
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Lagos Hub" subtitle={<Badge variant="amber">Pending</Badge>} />
          <div className="irow">
            <span className="ilbl">Address</span>
            <span className="ival">14 Apapa Road, Lagos</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Button variant="green" size="sm">
              Assign Staff
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
