import { Badge, Button, DataTable, InfoBanner, PageHead, QueryState, RoleGate, SearchBar } from '../components/ui';
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

export default function IntelPage() {
  const { openModal } = useModal();
  const { isCeoAdmin, isMerch } = useApp();
  const { data: rows = [], loading, error } = useApiQuery(() => opsApi.listIntel(), []);
  const { data: visits = [] } = useApiQuery(() => opsApi.listVisits(!isCeoAdmin), [isCeoAdmin]);

  const { search, setSearch, filtered } = useTableFilter(rows ?? [], '', (row, q) =>
    [row.storeName, row.competitor, row.observation, row.category]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="eye"
        title="Market Intelligence"
        subtitle="Competitor observations submitted from store visits."
        actions={
          <RoleGate show={isMerch || isCeoAdmin}>
            <Button variant="green" size="sm" onClick={() => openModal('market-intel')}>
              + Log Intel
            </Button>
          </RoleGate>
        }
      />

      <SearchBar placeholder="Search by store, competitor brand or observation…" value={search} onChange={setSearch} />

      <RoleGate show={isCeoAdmin}>
        <InfoBanner>
          Market intelligence is aggregated from merchandiser visit logs. Each entry includes the store, competitor
          brands spotted, and shelf observations.
        </InfoBanner>
      </RoleGate>

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No market intel reports yet."
      >
        <DataTable>
          <thead>
            <tr>
              <th>Store</th>
              <th>Date</th>
              <th>Merchandiser</th>
              <th>Competitor Brands</th>
              <th>Observations</th>
              <th>Visit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const brands = (r.competitor || '')
                .split(/[,;/]+/)
                .map((b) => b.trim())
                .filter(Boolean);
              const visit = (visits ?? []).find((v) => v.storeName === r.storeName);
              return (
                <tr key={r._id}>
                  <td>
                    <strong>{r.storeName}</strong>
                  </td>
                  <td>{formatDate(r.reportDate || r.creationDateTime)}</td>
                  <td>{personName(r.reportedBy)}</td>
                  <td>
                    {brands.length ? (
                      brands.map((b) => (
                        <Badge key={b} variant="gray" style={{ marginRight: 4 }}>
                          {b}
                        </Badge>
                      ))
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ maxWidth: 260, fontSize: 12 }}>{r.observation}</td>
                  <td>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openModal('visit-detail', visit ? { visit } : undefined)}
                    >
                      Visit
                    </Button>
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
