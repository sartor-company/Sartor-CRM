import { useEffect } from 'react';
import { Badge, Button, DataTable, InfoBanner, Mono, PageHead, SearchBar } from '../components/ui';
import { crmApi, leadName, lpoCreatedBy, type CrmInvoice, type CrmLpo } from '../api/crm';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatNaira, num } from '../utils/format';
import { invoiceForLpo, termsShort } from '../utils/invoice';
import { lpoStatusVariant, lpoTermsVariant } from '../utils/statusBadges';

export default function LposPage() {
  const { openModal } = useModal();
  const { data, loading, error, reload } = useApiQuery(async () => {
    const [lpos, invoices] = await Promise.all([
      crmApi.listLpos(),
      crmApi.listInvoices().catch(() => [] as CrmInvoice[]),
    ]);
    return { lpos, invoices };
  }, []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-lpos-changed', onChange);
    return () => window.removeEventListener('crm-lpos-changed', onChange);
  }, [reload]);
  const lpos = data?.lpos ?? [];
  const invoices = data?.invoices ?? [];

  const { search, setSearch, filtered } = useTableFilter(lpos, '', (row: CrmLpo, q) =>
    [row.lpoId, leadName(typeof row.lead === 'object' ? row.lead : null), row.status, lpoCreatedBy(row)]
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
            <th>Invoice</th>
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
            filtered.map((lpo) => {
              const inv = invoiceForLpo(invoices, lpo);
              const dispatched = /dispatch|transit|deliver|packed/i.test(lpo.status || '');
              return (
                <tr key={lpo._id}>
                  <td>
                    <Mono style={{ fontSize: 12 }}>{lpo.lpoId || lpo._id.slice(-6)}</Mono>
                  </td>
                  <td>{leadName(typeof lpo.lead === 'object' ? lpo.lead : null)}</td>
                  <td>{lpoCreatedBy(lpo)}</td>
                  <td>
                    <Badge variant={lpoTermsVariant(lpo.terms)}>{termsShort(lpo.terms)}</Badge>
                  </td>
                  <td>
                    <Mono>{formatNaira(num(lpo.totalAmount))}</Mono>
                  </td>
                  <td>
                    <Badge variant={lpoStatusVariant(lpo.status)}>{lpo.status || '—'}</Badge>
                  </td>
                  <td>
                    {inv ? (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openModal('view-invoice', { invoice: inv })}
                      >
                        {inv.invoiceId || inv._id.slice(-6)}
                      </Button>
                    ) : dispatched ? (
                      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Pending invoice</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Pending dispatch</span>
                    )}
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
              );
            })
          )}
        </tbody>
      </DataTable>
    </>
  );
}
