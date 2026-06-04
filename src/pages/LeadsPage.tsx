import { ActionDropdown, Badge, Button, DataTable, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { MOCK_LEADS } from '../data/mock';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';

export default function LeadsPage() {
  const { openModal } = useModal();
  const { showCeoAdmin } = useRoleGates();
  const { search, setSearch, filtered } = useTableFilter(MOCK_LEADS, '', (row, q) =>
    [row.name, row.location, row.stage, row.rep].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        title="All Leads"
        subtitle="84 leads across all reps."
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('add-lead')}>
            + New Lead
          </Button>
        }
      />

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
          {filtered.map((lead) => (
            <tr key={lead.name}>
              <td>
                <strong>{lead.name}</strong>
              </td>
              <td>{lead.category}</td>
              <td>{lead.location}</td>
              <td>
                <Badge variant={lead.stageVariant}>{lead.stage}</Badge>
              </td>
              <td>{lead.rep}</td>
              <td>{lead.date}</td>
              <td>
                <ActionDropdown
                  items={[
                    { icon: 'eye', label: 'View Details', onClick: () => openModal('lead-detail') },
                    {
                      icon: 'undo',
                      label: 'Assign / Reassign',
                      onClick: () => openModal('reassign-lead'),
                      hidden: !showCeoAdmin,
                    },
                    { icon: 'arrow-up', label: 'Update Stage', onClick: () => openModal('update-status') },
                    { icon: 'clipboard', label: 'Create LPO', onClick: () => openModal('create-lpo') },
                    { icon: 'dollar', label: 'View Invoices', onClick: () => openModal('view-invoice') },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
