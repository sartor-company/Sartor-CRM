import { useEffect, useMemo } from 'react';
import { ActionDropdown, Badge, Button, DataTable, InfoBanner, PageHead, SearchBar } from '../components/ui';
import { crmApi, refName, type CrmCustomer, type CrmLead } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate } from '../utils/format';
import { leadStatusVariant } from '../utils/statusBadges';

const CONVERTED_STATUSES = new Set(['Closed Won', 'Payment Confirmed', 'Order Fulfilled']);

function locationOf(lead: CrmLead) {
  return [lead.lga, lead.state].filter(Boolean).join(', ') || lead.address || '—';
}

function leadRefId(lead: CrmCustomer['lead']): string | null {
  if (!lead) return null;
  return typeof lead === 'string' ? lead : lead._id || null;
}

export default function LeadsPage() {
  const { openModal } = useModal();
  const { showCeoAdmin } = useRoleGates();
  const { data, loading, error, reload } = useApiQuery(async () => {
    const [leads, customers] = await Promise.all([
      crmApi.listLeads(),
      crmApi.listCustomers().catch(() => [] as CrmCustomer[]),
    ]);
    return { leads, customers };
  }, []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-leads-changed', onChange);
    return () => window.removeEventListener('crm-leads-changed', onChange);
  }, [reload]);

  const leads = useMemo(() => {
    const all = data?.leads ?? [];
    const convertedIds = new Set(
      (data?.customers ?? [])
        .map((c) => leadRefId(c.lead))
        .filter((id): id is string => Boolean(id)),
    );
    return all.filter(
      (l) => !convertedIds.has(l._id) && !CONVERTED_STATUSES.has(String(l.status || '')),
    );
  }, [data?.leads, data?.customers]);

  const { search, setSearch, filtered } = useTableFilter(leads, '', (row, q) =>
    [row.name, locationOf(row), row.status, refName(row.user), row.type]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        title="All Leads"
        subtitle={loading ? 'Loading…' : `${leads.length} leads across all reps.`}
        actions={
          <Button
            variant="green"
            size="sm"
            onClick={() => openModal('add-lead')}
          >
            + New Lead
          </Button>
        }
      />

      {error && (
        <InfoBanner variant="err" style={{ marginBottom: 12 }}>
          {error}{' '}
          <button type="button" className="ca" onClick={() => void reload()}>
            Retry
          </button>
        </InfoBanner>
      )}

      <SearchBar
        placeholder="Search by name, location, stage or rep…"
        value={search}
        onChange={setSearch}
      />

      <DataTable id="leads-table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Category</th>
            <th>Location</th>
            <th>Stage</th>
            <th>Assigned To</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                Loading leads…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--tx3)' }}>
                No leads found.
              </td>
            </tr>
          ) : (
            filtered.map((lead) => (
              <tr key={lead._id}>
                <td>
                  <strong>{lead.name || '—'}</strong>
                </td>
                <td>{lead.type || '—'}</td>
                <td>{locationOf(lead)}</td>
                <td>
                  <Badge variant={leadStatusVariant(lead.status)}>{lead.status || '—'}</Badge>
                </td>
                <td>{refName(lead.user)}</td>
                <td>{formatDate(lead.creationDateTime)}</td>
                <td>
                  <ActionDropdown
                    items={[
                      {
                        icon: 'eye',
                        label: 'View Details',
                        onClick: () => openModal('lead-detail', { lead }),
                      },
                      {
                        icon: 'undo',
                        label: 'Assign / Reassign',
                        onClick: () => openModal('reassign-lead', { lead }),
                        hidden: !showCeoAdmin,
                      },
                      {
                        icon: 'arrow-up',
                        label: 'Update Stage',
                        onClick: () => openModal('update-status', { lead }),
                      },
                      {
                        icon: 'clipboard',
                        label: 'Create LPO',
                        onClick: () => openModal('create-lpo', { lead }),
                      },
                      {
                        icon: 'dollar',
                        label: 'View Invoices',
                        onClick: () => openModal('view-invoice', { lead }),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </>
  );
}

