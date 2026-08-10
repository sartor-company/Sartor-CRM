import { Badge, Button, DataTable, PageHead, QueryState, RoleGate, SearchBar } from '../components/ui';
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

function severityVariant(s?: string) {
  const v = (s || '').toLowerCase();
  if (v === 'critical' || v === 'high') return 'red' as const;
  if (v === 'medium') return 'amber' as const;
  return 'gray' as const;
}

export default function IntelPage() {
  const { openModal } = useModal();
  const { isCeoAdmin, isMerch } = useApp();
  const { data: rows = [], loading, error } = useApiQuery(() => opsApi.listIntel(), []);

  const { search, setSearch, filtered } = useTableFilter(rows ?? [], '', (row, q) =>
    [row.storeName, row.competitor, row.observation, row.category]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="eye"
        title="Market Intel"
        subtitle="Competitor sightings and field observations."
        actions={
          <RoleGate show={isMerch || isCeoAdmin}>
            <Button variant="green" size="sm" onClick={() => openModal('market-intel')}>
              + Log Intel
            </Button>
          </RoleGate>
        }
      />

      <SearchBar placeholder="Search by store, competitor or observation…" value={search} onChange={setSearch} />

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
              <th>Category</th>
              <th>Competitor</th>
              <th>Observation</th>
              <th>Severity</th>
              <th>Reported By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>
                  <strong>{r.storeName}</strong>
                </td>
                <td>{r.category || '—'}</td>
                <td>{r.competitor || '—'}</td>
                <td>{r.observation}</td>
                <td>
                  <Badge variant={severityVariant(r.severity)}>{r.severity || 'Medium'}</Badge>
                </td>
                <td>{personName(r.reportedBy)}</td>
                <td>{formatDate(r.reportDate || r.creationDateTime)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
