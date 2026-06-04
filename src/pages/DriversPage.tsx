import { Badge, Button, DataTable, PageHead, RoleGate } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useRoleGates } from '../hooks/useRoleGates';

const DRIVERS = [
  { name: 'Chidi Okeke', vehicle: 'Toyota Hilux 2020', plate: 'ABJ-234-KW', wh: 'Abuja Central', delivery: 'LPO-0042', status: 'On Route', statusVariant: 'amber' as const },
  { name: 'Emeka Eze', vehicle: 'Hino Truck 2019', plate: 'ABJ-199-FK', wh: 'Abuja Central', delivery: '—', status: 'Available', statusVariant: 'green' as const },
];

export default function DriversPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showOnboardDriver, showDriverEdit, showDriverWh } = useRoleGates();

  return (
    <>
      <PageHead
        icon="car"
        title="Drivers"
        actions={
          <RoleGate show={showOnboardDriver}>
            <Button variant="green" size="sm" onClick={() => openModal('onboard-driver')}>
              + Onboard Driver
            </Button>
          </RoleGate>
        }
      />

      <DataTable>
        <thead>
          <tr>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Plate</th>
            <th>Warehouse</th>
            <th>Active Delivery</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {DRIVERS.map((d) => (
            <tr key={d.name}>
              <td>
                <strong>{d.name}</strong>
              </td>
              <td>{d.vehicle}</td>
              <td>{d.plate}</td>
              <td>{d.wh}</td>
              <td>{d.delivery}</td>
              <td>
                <Badge variant={d.statusVariant}>{d.status}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Button variant="outline" size="xs" onClick={() => openModal('view-driver')}>
                    View
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => openModal('assign-driver')}>
                    Assign LPO
                  </Button>
                  <RoleGate show={showDriverWh}>
                    <Button variant="secondary" size="xs" onClick={() => openModal('assign-driver-warehouse')}>
                      Assign WH
                    </Button>
                  </RoleGate>
                  {d.delivery !== '—' && (
                    <Button variant="secondary" size="xs" onClick={() => showToast('Driver unassigned from delivery.', 'warn')}>
                      Unassign
                    </Button>
                  )}
                  <RoleGate show={showDriverEdit}>
                    <Button variant="outline" size="xs" onClick={() => openModal('onboard-driver')}>
                      Edit
                    </Button>
                  </RoleGate>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
