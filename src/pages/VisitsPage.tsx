import { Badge, Button, DataTable, IconLabel, InfoBanner, NavButton, PageHead, RoleGate, SearchBar } from '../components/ui';
import { useModal } from '../context/ModalContext';
import { useApp } from '../context/AppContext';
import { useTableFilter } from '../hooks/useTableFilter';

const VISITS = [
  { store: 'FreshMart Garki', category: 'FMCG-Retail', date: '10 May 2026', merch: 'Einstein Dare', found: '3 of 4 SKUs', oos: '1 OOS', oosVariant: 'red' as const, competitors: 'Dettol, Septol, PureGel', photoCount: 4 },
  { store: 'HealthPlus Maitama', category: 'FMCG-Retail', date: '8 May 2026', merch: 'Einstein Dare', found: '2 of 4 SKUs', oos: '2 OOS', oosVariant: 'red' as const, competitors: 'Lifebuoy, PureGel', photoCount: 2 },
  { store: 'City Pharmacy Wuse', category: 'Pharma-Retail', date: '5 May 2026', merch: 'Einstein Dare', found: '3 of 4 SKUs', oos: 'None', competitors: 'Septol', photoCount: 3 },
];

export default function VisitsPage() {
  const { openModal } = useModal();
  const { isCeoAdmin, isMerch } = useApp();
  const { search, setSearch, filtered } = useTableFilter(VISITS, '', (row, q) =>
    [row.store, row.merch, row.date, row.category].some((v) => v.toLowerCase().includes(q)),
  );

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
            <RoleGate show={isMerch}>
              <Button variant="green" size="sm" onClick={() => openModal('new-visit')}>
                + Log Visit
              </Button>
            </RoleGate>
            <NavButton lat={9.0368} lng={7.4676} small />
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
          You are viewing <strong>all merchandiser visits</strong>. Visits include shelf stock counts per SKU,
          out-of-stock alerts, competitor observations, general notes, and attached photos — all submitted by your
          merchandisers.
        </InfoBanner>
      </RoleGate>

      <DataTable id="visits-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Category</th>
            <th>Visit Date</th>
            <th>Merchandiser</th>
            <th>Sartor SKUs Found</th>
            <th>OOS SKUs</th>
            <th>Competitors Noted</th>
            <th>Photos</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.store + v.date}>
              <td>
                <strong>{v.store}</strong>
              </td>
              <td>{v.category}</td>
              <td>{v.date}</td>
              <td>{v.merch}</td>
              <td>{v.found}</td>
              <td>
                {v.oos === 'None' ? v.oos : <Badge variant={v.oosVariant}>{v.oos}</Badge>}
              </td>
              <td>{v.competitors}</td>
              <td>
                <IconLabel icon="camera" size={13}>
                  {v.photoCount}
                </IconLabel>
              </td>
              <td>
                <Button variant="green" size="xs" onClick={() => openModal('visit-detail')}>
                  View Full Report
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
