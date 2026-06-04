import { Badge, Button, DataTable, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

const TEAM = [
  { name: 'Abubakar Idah', role: 'Admin', roleVariant: 'navy' as const, commission: '3.5%', status: 'Active', statusVariant: 'green' as const },
  { name: 'Emmanuel Batimehin', role: 'Sales Rep', roleVariant: 'blue' as const, commission: '2.5%', status: 'Active', statusVariant: 'green' as const },
  { name: 'Samuel Okon', role: 'Sales Rep', roleVariant: 'blue' as const, commission: '3.0%', status: 'On Leave', statusVariant: 'amber' as const },
  { name: 'Einstein Dare', role: 'Merchandiser', roleVariant: 'purple' as const, commission: '—', status: 'Active', statusVariant: 'green' as const, noCommission: true },
  { name: 'Musa Abdullahi', role: 'WH Manager', roleVariant: 'amber' as const, commission: '—', status: 'Active', statusVariant: 'green' as const, noCommission: true },
];

export default function TeamPage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        icon="user"
        title="Team"
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('invite-user')}>
            + Invite User
          </Button>
        }
      />

      <DataTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Commission</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {TEAM.map((m) => (
            <tr key={m.name}>
              <td>
                <strong>{m.name}</strong>
              </td>
              <td>
                <Badge variant={m.roleVariant}>{m.role}</Badge>
              </td>
              <td>{m.commission}</td>
              <td>
                <Badge variant={m.statusVariant}>{m.status}</Badge>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Button variant="outline" size="xs">
                    Edit
                  </Button>
                  {!m.noCommission && (
                    <Button variant="secondary" size="xs" onClick={() => openModal('set-commission')}>
                      Commission
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
