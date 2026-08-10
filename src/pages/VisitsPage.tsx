import { Badge, Button, DataTable, InfoBanner, NavButton, PageHead, QueryState, RoleGate, SearchBar } from '../components/ui';
import { opsApi } from '../api/ops';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate } from '../utils/format';

function personName(p: { fullName?: string } | string | null | undefined) {
  if (!p) return '—';
  if (typeof p === 'string') return p;
  return p.fullName || '—';
}

export default function VisitsPage() {
  const { openModal } = useModal();
  const { isCeoAdmin, isMerch } = useApp();
  const { data: visits = [], loading, error } = useApiQuery(() => opsApi.listVisits(!isCeoAdmin), [
    isCeoAdmin,
  ]);

  const { search, setSearch, filtered } = useTableFilter(visits ?? [], '', (row, q) =>
    [row.storeName, personName(row.merchandiser), row.category, row.competitors]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  const navVisit = (visits ?? []).find((v) => v.lat != null && v.lng != null);

  return (
    <>
      <PageHead
        icon="store"
        title="Store Visits"
        subtitle={
          isCeoAdmin
            ? 'All merchandiser field visits — observations, shelf data, and photos.'
            : 'Your submitted store visit reports.'
        }
        actions={
          <>
            <RoleGate show={isMerch || isCeoAdmin}>
              <Button variant="green" size="sm" onClick={() => openModal('new-visit')}>
                + Log Visit
              </Button>
            </RoleGate>
            {navVisit ? <NavButton lat={navVisit.lat!} lng={navVisit.lng!} small /> : null}
          </>
        }
      />

      <SearchBar
        placeholder="Search by store, merchandiser, date or SKU…"
        value={search}
        onChange={setSearch}
      />

      <RoleGate show={isCeoAdmin}>
        <InfoBanner id="visits-info-banner">
          Merchandisers log shelf presence, OOS counts, and competitor sightings from the field.
        </InfoBanner>
      </RoleGate>

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No store visits logged yet."
      >
        <DataTable>
          <thead>
            <tr>
              <th>Store</th>
              <th>Category</th>
              <th>Date</th>
              <th>Merchandiser</th>
              <th>Found</th>
              <th>OOS</th>
              <th>Competitors</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v._id}>
                <td>
                  <strong>{v.storeName}</strong>
                </td>
                <td>{v.category || '—'}</td>
                <td>{formatDate(v.visitDate || v.creationDateTime)}</td>
                <td>{personName(v.merchandiser)}</td>
                <td>
                  {v.skusFound ?? 0} of {v.skusTotal ?? 0} SKUs
                </td>
                <td>
                  <Badge variant={(v.skusOos ?? 0) > 0 ? 'red' : 'green'}>
                    {(v.skusOos ?? 0) > 0 ? `${v.skusOos} OOS` : 'None'}
                  </Badge>
                </td>
                <td>{v.competitors || '—'}</td>
                <td>{v.photoCount ?? 0}</td>
                <td>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openModal('visit-detail', { visit: v })}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
