import { Badge, Button, DataTable, Mono, PageHead, QueryState, SearchBar } from '../components/ui';
import { opsApi } from '../api/ops';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira } from '../utils/format';
import { lpoStatusVariant } from '../utils/statusBadges';

function leadName(lead: { name?: string } | string | null | undefined) {
  if (!lead) return '—';
  if (typeof lead === 'string') return lead;
  return lead.name || '—';
}

export default function PackLposPage() {
  const { openModal } = useModal();
  const { showToast } = useToast();
  const { data: rows = [], loading, error, reload } = useApiQuery(() => opsApi.packQueue(), []);

  const { search, setSearch, filtered } = useTableFilter(rows ?? [], '', (row, q) =>
    [row.lpoId, leadName(row.lead), row.status].some((v) => String(v || '').toLowerCase().includes(q)),
  );

  const pack = async (id: string) => {
    try {
      await opsApi.packLpo(id);
      showToast('LPO packed — moved to dispatch queue.', 'ok');
      void reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Pack failed', 'err');
    }
  };

  return (
    <>
      <PageHead
        icon="package"
        title="Pack LPOs"
        subtitle="Select batches and quantities. Stock committed on save; deducted on delivery confirmation."
      />

      <SearchBar placeholder="Search LPOs to pack…" value={search} onChange={setSearch} />

      <QueryState
        loading={loading}
        error={error}
        empty={!filtered.length}
        emptyMessage="No LPOs waiting to be packed."
      >
        <DataTable>
          <thead>
            <tr>
              <th>LPO No.</th>
              <th>Customer</th>
              <th>SKUs</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Assigned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{r.lpoId || r._id.slice(-6)}</Mono>
                </td>
                <td>{leadName(r.lead)}</td>
                <td>{r.skuCount ?? 0} SKUs</td>
                <td>
                  <Mono>{(r.totalQuantity ?? 0).toLocaleString()} units</Mono>
                </td>
                <td>
                  <Mono>{formatNaira(r.totalAmount)}</Mono>
                </td>
                <td>{formatDate(r.assignedAt || r.creationDateTime)}</td>
                <td>
                  <Badge variant={lpoStatusVariant(r.status)}>{r.status}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="green" size="xs" onClick={() => void pack(r._id)}>
                      Pack LPO
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => openModal('pack-lpo')}>
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </QueryState>
    </>
  );
}
