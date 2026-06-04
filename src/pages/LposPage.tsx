import { Badge, Button, DataTable, Mono, PageHead, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { MOCK_LPOS } from '../data/mock';
import { useTableFilter } from '../hooks/useTableFilter';

export default function LposPage() {
  const { openModal } = useModal();
  const { search, setSearch, filtered } = useTableFilter(MOCK_LPOS, '', (row, q) =>
    [row.id, row.customer, row.status].some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        title="LPOs"
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('create-lpo')}>
            + Create LPO
          </Button>
        }
      />

      <SearchBar
        placeholder="Search by LPO number, customer or status…"
        value={search}
        onChange={setSearch}
      />

      <DataTable id="lpos-table">
        <thead>
          <tr>
            <th>LPO No.</th>
            <th>Customer/Lead</th>
            <th>Created By</th>
            <th>Terms</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Invoice</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((lpo) => (
            <tr key={lpo.id}>
              <td>
                <Mono style={{ fontSize: 12 }}>{lpo.id}</Mono>
              </td>
              <td>{lpo.customer}</td>
              <td>{lpo.rep}</td>
              <td>
                <Badge variant={lpo.termsVariant}>{lpo.terms}</Badge>
              </td>
              <td>
                <Mono>{lpo.amount}</Mono>
              </td>
              <td>
                <Badge variant={lpo.statusVariant}>{lpo.status}</Badge>
              </td>
              <td>
                {lpo.invoice ? (
                  <Button variant="secondary" size="xs" onClick={() => openModal('view-invoice')}>
                    {lpo.invoice}
                  </Button>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Pending dispatch</span>
                )}
              </td>
              <td>
                <Button variant="outline" size="xs" onClick={() => openModal('view-lpo')}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
