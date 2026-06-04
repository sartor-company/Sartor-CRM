import { Button, DataTable, Mono, NavButton, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { MOCK_CUSTOMERS } from '../data/mock';
import { useTableFilter } from '../hooks/useTableFilter';

export default function CustomersPage() {
  const { openModal } = useModal();
  const { search, setSearch, filtered } = useTableFilter(MOCK_CUSTOMERS, '', (row, q) =>
    [row.name, row.category, row.location].some((v) => v.toLowerCase().includes(q)),
  );

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
            <th>Orders</th>
            <th>Revenue</th>
            <th>Outstanding</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.name}>
              <td>
                <strong>{c.name}</strong>
              </td>
              <td>{c.category}</td>
              <td>{c.location}</td>
              <td>{c.since}</td>
              <td>{c.lpos}</td>
              <td>
                <Mono>{c.revenue}</Mono>
              </td>
              <td>
                <Mono style={{ color: c.outstanding === '₦0' ? 'var(--Gd)' : 'var(--at)' }}>
                  {c.outstanding}
                </Mono>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Button variant="outline" size="xs" onClick={() => openModal('customer-statement')}>
                    Statement
                  </Button>
                  <NavButton lat={c.lat} lng={c.lng} small />
                  <Button variant="green" size="xs" onClick={() => openModal('create-lpo')}>
                    New LPO
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => openModal('goods-return')}>
                    Return
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
