import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, SearchBar } from '../components/ui';
import { crmApi, leadName, refName, type CrmLpo } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatNaira, num } from '../utils/format';
import { lpoStatusVariant, lpoTermsVariant } from '../utils/statusBadges';

function termsLabel(terms?: string) {
  if (!terms) return '—';
  const t = terms.toLowerCase();
  if (t.includes('delivery') || t.includes('pod')) return 'POD';
  if (t.includes('sales') || t.includes('return')) return 'SOR';
  if (t.includes('70%')) return '70% sold';
  if (t.includes('week')) return '2 weeks';
  return terms.length > 18 ? `${terms.slice(0, 16)}…` : terms;
}

export default function LposPage() {
  const { openModal } = useModal();
  const { data, loading, error, reload } = useApiQuery(() => crmApi.listLpos(), []);
  const lpos = data ?? [];

  const { search, setSearch, filtered } = useTableFilter(lpos, '', (row: CrmLpo, q) =>
    [row.lpoId, leadName(typeof row.lead === 'object' ? row.lead : null), row.status, refName(row.user)]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        title="LPOs"
        subtitle={loading ? 'Loading…' : `${lpos.length} purchase orders`}
        actions={
          <Button variant="green" size="sm" onClick={() => openModal('create-lpo')}>
            + Create LPO
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
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                Loading LPOs…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                No LPOs found.
              </td>
            </tr>
          ) : (
            filtered.map((lpo) => (
              <tr key={lpo._id}>
                <td>
                  <Mono style={{ fontSize: 12 }}>{lpo.lpoId || lpo._id.slice(-6)}</Mono>
                </td>
                <td>{leadName(typeof lpo.lead === 'object' ? lpo.lead : null)}</td>
                <td>{refName(lpo.user)}</td>
                <td>
                  <Badge variant={lpoTermsVariant(lpo.terms)}>{termsLabel(lpo.terms)}</Badge>
                </td>
                <td>
                  <Mono>{formatNaira(num(lpo.totalAmount))}</Mono>
                </td>
                <td>
                  <Badge variant={lpoStatusVariant(lpo.status)}>{lpo.status || '—'}</Badge>
                </td>
                <td>
                  <Mono>{lpo.totalQuantity ?? '—'}</Mono>
                </td>
                <td>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openModal('view-lpo', { lpo })}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </>
  );
}
