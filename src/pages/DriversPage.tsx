import { useEffect } from 'react';
import { Badge, Button, DataTable, PageHead, QueryState, RoleGate } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';

function whName(warehouse: { name?: string } | string | null | undefined) {
  if (!warehouse) return '—';
  if (typeof warehouse === 'string') return warehouse;
  return warehouse.name || '—';
}

function lpoLabel(active: { lpoId?: string } | string | null | undefined) {
  if (!active) return '—';
  if (typeof active === 'string') return active;
  return active.lpoId || '—';
}

export default function DriversPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { showOnboardDriver, showDriverEdit, showDriverWh } = useRoleGates();
  const { data: drivers = [], loading, error, reload } = useApiQuery(() => opsApi.listDrivers(), []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-ops-changed', onChange);
    return () => window.removeEventListener('crm-ops-changed', onChange);
  }, [reload]);

  const unassign = async (id: string) => {
    try {
      await opsApi.unassignDriver(id);
      showToast('Driver unassigned from delivery.', 'warn');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Unassign failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="car"
        title="Drivers"
        subtitle={loading ? undefined : `${drivers?.length ?? 0} drivers`}
        actions={
          <RoleGate show={showOnboardDriver}>
            <Button variant="green" size="sm" onClick={() => openModal('onboard-driver')}>
              + Onboard Driver
            </Button>
          </RoleGate>
        }
      />

      <QueryState
        loading={loading}
        error={error}
        empty={!drivers?.length}
        emptyMessage="No drivers onboarded yet."
      >
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
            {(drivers ?? []).map((d) => {
              const vehicle = [d.vehicleMake, d.vehicleModel, d.vehicleYear].filter(Boolean).join(' ') || '—';
              const delivery = lpoLabel(d.activeLpo);
              return (
                <tr key={d._id}>
                  <td>
                    <strong>{d.name}</strong>
                    <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{d.phone}</div>
                  </td>
                  <td>{vehicle}</td>
                  <td>{d.plate}</td>
                  <td>{whName(d.warehouse)}</td>
                  <td>{delivery}</td>
                  <td>
                    <Badge
                      variant={
                        d.status === 'Available' ? 'green' : d.status === 'On Route' ? 'amber' : 'gray'
                      }
                    >
                      {d.status || 'Available'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('view-driver', { driver: d })}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openModal('assign-driver', { driver: d })}
                      >
                        Assign LPO
                      </Button>
                      <RoleGate show={showDriverWh}>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => openModal('assign-driver-warehouse', { driver: d })}
                        >
                          Assign WH
                        </Button>
                      </RoleGate>
                      {delivery !== '—' && (
                        <Button variant="secondary" size="xs" onClick={() => void unassign(d._id)}>
                          Unassign
                        </Button>
                      )}
                      <RoleGate show={showDriverEdit}>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openModal('onboard-driver', { driver: d })}
                        >
                          Edit
                        </Button>
                      </RoleGate>
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
