import { Badge, Button, DataTable, PageHead, QueryState } from '../components/ui';
import { teamApi } from '../api/team';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import type { BadgeVariant } from '../types';

function roleVariant(role?: string): BadgeVariant {
  const r = (role || '').toLowerCase();
  if (r.includes('owner') || r.includes('admin') || r.includes('ceo')) return 'navy';
  if (r.includes('rep') || r.includes('sales')) return 'blue';
  if (r.includes('merch')) return 'purple';
  if (r.includes('warehouse') || r.includes('inventory') || r.includes('wh')) return 'amber';
  if (r.includes('finance') || r.includes('manager')) return 'teal';
  if (r.includes('driver')) return 'gray';
  return 'gray';
}

export default function TeamPage() {
  const { openModal } = useModal();
  const { data: members = [], loading, error } = useApiQuery(() => teamApi.listUsers(), []);

  return (
    <>
      <PageHead
        icon="user"
        title="Team"
        subtitle={loading ? undefined : `${members?.length ?? 0} people`}
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('invite-user')}>
            + Invite User
          </Button>
        }
      />

      <QueryState
        loading={loading}
        error={error}
        empty={!members?.length}
        emptyMessage="No team members found. Only account owners can list users."
      >
        <DataTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => {
              const inactive = m.blocked || m.isDisabled;
              const noCommission =
                m.isOwner ||
                /warehouse|inventory|driver|merch|owner/i.test(m.role || '');
              return (
                <tr key={m._id}>
                  <td>
                    <strong>{m.fullName || '—'}</strong>
                    {m.isOwner ? (
                      <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--tx3)' }}>Owner</span>
                    ) : null}
                  </td>
                  <td>{m.email || '—'}</td>
                  <td>
                    <Badge variant={roleVariant(m.role)}>{m.role || m.consoleRole || '—'}</Badge>
                  </td>
                  <td>
                    <Badge variant={inactive ? 'amber' : 'green'}>
                      {inactive ? 'Inactive' : 'Active'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('invite-user', { user: m })}
                      >
                        Edit
                      </Button>
                      {!noCommission && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => openModal('set-commission', { user: m })}
                        >
                          Commission
                        </Button>
                      )}
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
