import { Button, DataTable, InfoBanner, Mono, PageHead, SearchBar } from '../components/ui';
import { crmApi, leadName, type CrmCustomer } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate } from '../utils/format';

function leadOf(c: CrmCustomer) {
  return typeof c.lead === 'object' && c.lead ? c.lead : null;
}

export default function CustomersPage() {
  const { openModal } = useModal();
  const { data, loading, error, reload } = useApiQuery(() => crmApi.listCustomers(), []);
  const customers = data ?? [];

  const { search, setSearch, filtered } = useTableFilter(customers, '', (row, q) => {
    const lead = leadOf(row);
    return [leadName(lead), lead?.type, lead?.state, lead?.lga, row.customerId]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <>
      <PageHead
        title="Customers"
        subtitle="Converted accounts with first confirmed payment."
        actions={
          <Button variant="secondary" size="sm">
            Export
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
        placeholder="Search customers by name, location or category…"
        value={search}
        onChange={setSearch}
      />

      <DataTable id="cust-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Category</th>
            <th>Location</th>
            <th>Converted</th>
            <th>ID</th>
            <th>Status</th>
            <th>Outstanding</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                Loading customers…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                No customers found.
              </td>
            </tr>
          ) : (
            filtered.map((c) => {
              const lead = leadOf(c);
              return (
                <tr key={c._id}>
                  <td>
                    <strong>{leadName(lead)}</strong>
                  </td>
                  <td>{lead?.type || '—'}</td>
                  <td>{[lead?.lga, lead?.state].filter(Boolean).join(', ') || '—'}</td>
                  <td>{formatDate(c.creationDateTime)}</td>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{c.customerId || c._id.slice(-6)}</Mono>
                  </td>
                  <td>{c.status || 'Active'}</td>
                  <td>
                    <Mono style={{ color: 'var(--Gd)' }}>—</Mono>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('customer-statement', { customer: c })}
                      >
                        Statement
                      </Button>
                      <Button
                        variant="green"
                        size="xs"
                        onClick={() => openModal('create-lpo', { customer: c })}
                      >
                        New LPO
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openModal('goods-return', { customer: c })}
                      >
                        Return
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTable>
    </>
  );
}
