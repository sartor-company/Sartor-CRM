import { Badge, Button, Card, CardHeader, CardLinkAction, Icon, IconLabel, InfoBanner, KpiCard, KpiGrid, NavButton, PageHead, QueryState } from '../components/ui';
import { catalogApi } from '../api/catalog';
import { opsApi } from '../api/ops';
import { useApp } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { formatDate } from '../utils/format';

export default function MerchDashboardPage() {
  const { openModal } = useModal();
  const { navigateToPage } = useApp();

  const { data, loading, error } = useApiQuery(async () => {
    const [visits, products, alerts] = await Promise.all([
      opsApi.listVisits(true).catch(() => []),
      catalogApi.listProducts().catch(() => []),
      opsApi.reorderAlerts().catch(() => ({ data: [], pendingRequests: 0 })),
    ]);
    return { visits, products, alerts: alerts.data ?? [] };
  }, []);

  const visits = data?.visits ?? [];
  const products = data?.products ?? [];
  const alerts = data?.alerts ?? [];
  const oosVisits = visits.filter((v) => (v.skusOos ?? 0) > 0);
  const stores = Array.from(
    new Map(
      visits.map((v) => [
        v.storeName,
        {
          name: v.storeName,
          category: v.category || '—',
          lastVisit: formatDate(v.visitDate || v.creationDateTime),
          oos: v.skusOos ?? 0,
          visit: v,
        },
      ]),
    ).values(),
  );
  const recent = visits.slice(0, 8);
  const navVisit = visits.find((v) => v.lat != null && v.lng != null);

  return (
    <>
      <PageHead
        title="Field Dashboard"
        subtitle="Your assigned stores, visits, and shelf intelligence."
        actions={
          <>
            <Button variant="green" size="sm" onClick={() => openModal('new-visit')}>
              + Log Visit
            </Button>
            {navVisit ? <NavButton lat={navVisit.lat!} lng={navVisit.lng!} small /> : null}
          </>
        }
      />

      <QueryState loading={loading} error={error}>
        <KpiGrid cols={4}>
          <KpiCard label="Stores Visited" value={String(stores.length)} accent="blue" />
          <KpiCard label="Visits Logged" value={String(visits.length)} accent="green" />
          <KpiCard
            label="Out-of-Stock Alerts"
            value={String(oosVisits.length || alerts.filter((a) => a.alert === 'Critical').length)}
            accent="amber"
          />
          <KpiCard label="SKUs Tracked" value={String(products.length)} />
        </KpiGrid>

        {(oosVisits[0] || alerts[0]) && (
          <InfoBanner variant="warn">
            <strong>Out-of-Stock Alert:</strong>{' '}
            {oosVisits[0]
              ? `${oosVisits[0].storeName} reported ${oosVisits[0].skusOos} OOS SKU(s).`
              : `${alerts[0].sku} (${alerts[0].name}) is ${alerts[0].alert.toLowerCase()} — ${alerts[0].stock} units vs reorder ${alerts[0].reorderLevel}.`}
          </InfoBanner>
        )}

        <div className="g2 mb">
          <Card>
            <CardHeader icon="store" title="Recent Stores" />
            {stores.length === 0 ? (
              <div style={{ padding: 12, color: 'var(--tx3)', fontSize: 13 }}>
                No visits yet. Log a store visit to populate this list.
              </div>
            ) : (
              stores.slice(0, 8).map((s) => (
                <div
                  key={s.name}
                  className="merch-store-card"
                  onClick={() => openModal('visit-detail', { visit: s.visit })}
                  role="button"
                  tabIndex={0}
                >
                  <div className="merch-store-ico">
                    <Icon name="store" size={20} />
                  </div>
                  <div>
                    <div className="merch-store-name">{s.name}</div>
                    <div className="merch-store-sub">
                      Last visit: {s.lastVisit} · {s.category}
                    </div>
                  </div>
                  <div className="merch-store-badge">
                    {s.oos > 0 ? (
                      <span className="oos-badge">{s.oos} OOS</span>
                    ) : (
                      <Badge variant="green">OK</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>
          <Card>
            <CardHeader
              icon="package"
              title="Catalog Snapshot"
              subtitle={<span style={{ fontSize: 11, color: 'var(--tx3)' }}>Active products</span>}
            />
            {products.length === 0 ? (
              <div style={{ padding: 12, color: 'var(--tx3)', fontSize: 13 }}>No products in catalog.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 8).map((p) => {
                    const qty = Number(p.totalQuantityAvailable ?? 0);
                    return (
                      <tr key={p._id}>
                        <td>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                            {p.skuCode || p.productId || p._id.slice(-6)}
                          </span>
                        </td>
                        <td>{p.productName || '—'}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace" }}>{qty.toLocaleString()}</td>
                        <td>
                          <Badge variant={qty <= 0 ? 'red' : qty < 100 ? 'amber' : 'green'}>
                            {qty <= 0 ? 'OOS' : p.status || 'In-Stock'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <Card padding={false}>
          <div className="cp" style={{ paddingBottom: 0 }}>
            <CardHeader
              title="Recent Visits"
              action={<CardLinkAction onClick={() => navigateToPage('visits')}>All →</CardLinkAction>}
            />
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--tx3)', fontSize: 13 }}>No visits logged yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Date</th>
                  <th>Products Found</th>
                  <th>OOS</th>
                  <th>Competitors</th>
                  <th>Photos</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr
                    key={v._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openModal('visit-detail', { visit: v })}
                  >
                    <td>{v.storeName}</td>
                    <td>{formatDate(v.visitDate || v.creationDateTime)}</td>
                    <td>
                      {v.skusFound ?? 0}/{v.skusTotal ?? 0} SKUs
                    </td>
                    <td>{v.skusOos ?? 0} SKU</td>
                    <td>{v.competitors || '—'}</td>
                    <td>
                      <IconLabel icon="camera" size={13}>
                        {String(v.photoCount ?? 0)}
                      </IconLabel>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </QueryState>
    </>
  );
}
