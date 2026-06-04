import { Badge, Button, DataTable, InfoBanner, PageHead, RoleGate, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useApp } from '../context/AppContext';
import { useTableFilter } from '../hooks/useTableFilter';

const INTEL_ROWS = [
  { store: 'FreshMart Garki', date: '10 May 2026', merch: 'Einstein Dare', brands: [{ label: 'Dettol', variant: 'amber' as const }, { label: 'Septol', variant: 'gray' as const }, { label: 'PureGel', variant: 'gray' as const }], obs: 'Dettol at eye level (prime shelf). Septol running BOGOF this week. Sartor on mid-shelf, good facing.' },
  { store: 'HealthPlus Maitama', date: '8 May 2026', merch: 'Einstein Dare', brands: [{ label: 'Lifebuoy', variant: 'amber' as const }, { label: 'PureGel', variant: 'gray' as const }], obs: 'Sartor on bottom shelf, low visibility. Lifebuoy dominant. Manager said demand is stable but placement issue.' },
  { store: 'City Pharmacy Wuse', date: '5 May 2026', merch: 'Einstein Dare', brands: [{ label: 'Septol', variant: 'gray' as const }], obs: 'Only Septol as direct competitor. Sartor well-positioned, facing out. Pharmacist requested more stock of 500ml variant.' },
];

export default function IntelPage() {
  const { openModal } = useModal();
  const { isCeoAdmin, isMerch } = useApp();
  const { search, setSearch, filtered } = useTableFilter(INTEL_ROWS, '', (row, q) =>
    [row.store, row.merch, row.obs, ...row.brands.map((b) => b.label)].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHead
        icon="search"
        title="Market Intelligence"
        subtitle={
          isCeoAdmin
            ? 'Competitor intelligence aggregated from all merchandiser store visits.'
            : 'Competitor observations from your store visits.'
        }
        actions={
          <RoleGate show={isMerch}>
            <Button variant="green" size="sm" onClick={() => openModal('market-intel')}>
              + Add Intel
            </Button>
          </RoleGate>
        }
      />

      <SearchBar
        placeholder="Search by store, competitor brand or observation…"
        value={search}
        onChange={setSearch}
      />

      <RoleGate show={isCeoAdmin}>
        <InfoBanner id="intel-info-banner" icon="search">
          Market intelligence is aggregated from all merchandiser visit logs. Each entry includes the store location,
          date, competitor brands spotted, and detailed shelf observations.
        </InfoBanner>
      </RoleGate>

      <DataTable id="intel-table">
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
          {filtered.map((row) => (
            <tr key={row.store + row.date}>
              <td>{row.store}</td>
              <td>{row.date}</td>
              <td>{row.merch}</td>
              <td>
                {row.brands.map((b) => (
                  <Badge key={b.label} variant={b.variant} style={{ marginRight: 4 }}>
                    {b.label}
                  </Badge>
                ))}
              </td>
              <td style={{ maxWidth: 260, fontSize: 12 }}>{row.obs}</td>
              <td>
                <Button variant="outline" size="xs" onClick={() => openModal('visit-detail')}>
                  Visit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
