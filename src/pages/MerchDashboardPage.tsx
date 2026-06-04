import type { CSSProperties, ReactNode } from 'react';
import { Badge, Button, Card, CardHeader, CardLinkAction, Icon, IconLabel, KpiCard, KpiGrid, InfoBanner, NavButton, PageHead } from '../components/ui';
import type { IconName } from '../types/icons';
import { useModal } from '../context/ModalContext';
import { useApp } from '../context/AppContext';

const STORES: { icon: IconName; name: string; sub: string; badge: ReactNode; onClick?: boolean; subStyle?: CSSProperties }[] = [
  { icon: 'store', name: 'FreshMart Garki', sub: 'Last visit: 10 May 2026 · FMCG-Retail', badge: <span className="oos-badge">1 OOS</span>, onClick: true },
  { icon: 'hospital', name: 'HealthPlus Maitama', sub: 'Last visit: 8 May 2026 · FMCG-Retail', badge: <span className="oos-badge">2 OOS</span>, onClick: true },
  { icon: 'pill', name: 'City Pharmacy Wuse', sub: 'Last visit: 5 May 2026 · Pharma-Retail', badge: <Badge variant="green">OK</Badge> },
  { icon: 'cart', name: 'Shoprite Jabi', sub: 'No visit this month!', subStyle: { color: 'var(--rt)' }, badge: <Badge variant="red">Overdue</Badge> },
];

const SKU_ROWS = [
  { sku: 'SH-25-CAR', name: 'Carabiner 250ml', found: '3/4 stores', qty: '12' },
  { sku: 'SH-25-SIL', name: 'Silicone 250ml', found: '3/4 stores', qty: '7' },
  { sku: 'SH-50-CAR', name: '500ml', found: '2/4 stores', qty: '4' },
  { sku: 'SH-25-HOK', name: 'Hook Pack', found: '0/4 stores', qty: 'OOS', oos: true },
];

export default function MerchDashboardPage() {
  const { openModal } = useModal();
  const { navigateToPage } = useApp();

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
            <NavButton lat={9.0368} lng={7.4676} small />
          </>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard label="Stores Assigned" value="5" trend="Abuja region" accent="blue" />
        <KpiCard label="Visits This Month" value="8" trend="↑ 2 vs last month" trendType="up" accent="green" />
        <KpiCard label="Out-of-Stock Alerts" value="3" trend="Across 2 stores" trendType="down" accent="amber" />
        <KpiCard label="SKUs Tracked" value="4" trend="All active products" />
      </KpiGrid>

      <InfoBanner variant="warn">
        <strong>Out-of-Stock Alert:</strong> SH-25-HOK (Silicone Hook Pack) is out of stock at FreshMart Garki and
        HealthPlus Maitama. Report to your line manager.
      </InfoBanner>

      <div className="g2 mb">
        <Card>
          <CardHeader icon="store" title="My Assigned Stores" />
          {STORES.map((s) => (
            <div
              key={s.name}
              className="merch-store-card"
              onClick={s.onClick ? () => openModal('new-visit') : undefined}
              role={s.onClick ? 'button' : undefined}
              tabIndex={s.onClick ? 0 : undefined}
            >
              <div className="merch-store-ico">
                <Icon name={s.icon} size={20} />
              </div>
              <div>
                <div className="merch-store-name">{s.name}</div>
                <div className="merch-store-sub" style={s.subStyle}>
                  {s.sub}
                </div>
              </div>
              <div className="merch-store-badge">{s.badge}</div>
            </div>
          ))}
        </Card>
        <Card>
          <CardHeader icon="package" title="SKU Shelf Status" subtitle={<span style={{ fontSize: 11, color: 'var(--tx3)' }}>Avg across stores</span>} />
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Found In</th>
                <th>Avg Qty</th>
              </tr>
            </thead>
            <tbody>
              {SKU_ROWS.map((r) => (
                <tr key={r.sku}>
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{r.sku}</span>
                  </td>
                  <td>{r.name}</td>
                  <td>{r.found}</td>
                  <td
                    style={
                      r.oos
                        ? { color: 'var(--rt)', fontWeight: 700, fontFamily: "'DM Mono', monospace" }
                        : { fontFamily: "'DM Mono', monospace" }
                    }
                  >
                    {r.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card padding={false}>
        <div className="cp" style={{ paddingBottom: 0 }}>
          <CardHeader
            title="Recent Visits"
            action={<CardLinkAction onClick={() => navigateToPage('visits')}>All →</CardLinkAction>}
          />
        </div>
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
            <tr style={{ cursor: 'pointer' }} onClick={() => openModal('visit-detail')}>
              <td>FreshMart Garki</td>
              <td>10 May 2026</td>
              <td>3 SKUs</td>
              <td>1 SKU</td>
              <td>Dettol, Septol</td>
              <td>
                <IconLabel icon="camera" size={13}>4</IconLabel>
              </td>
            </tr>
            <tr style={{ cursor: 'pointer' }} onClick={() => openModal('visit-detail')}>
              <td>HealthPlus Maitama</td>
              <td>8 May 2026</td>
              <td>2 SKUs</td>
              <td>2 SKUs</td>
              <td>Lifebuoy</td>
              <td>
                <IconLabel icon="camera" size={13}>2</IconLabel>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </>
  );
}
