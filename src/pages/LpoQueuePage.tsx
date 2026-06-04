import { Badge, Button, DataTable, InfoBanner, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

export default function LpoQueuePage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        icon="upload"
        title="LPO Queue"
        subtitle="Dispatch packed LPOs — auto-generates invoice + sends PIN."
      />

      <InfoBanner>
        Only <strong>Packed</strong> LPOs can be dispatched. Invoice auto-generates and PIN is sent to customer via
        SMS/WhatsApp/Email.
      </InfoBanner>

      <DataTable>
        <thead>
          <tr>
            <th>LPO No.</th>
            <th>Customer</th>
            <th>Terms</th>
            <th>Amount</th>
            <th>Packed By</th>
            <th>Pack Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>LPO-0040</span>
            </td>
            <td>HealthPlus Abuja</td>
            <td>
              <Badge variant="gray">Upfront</Badge>
            </td>
            <td>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>₦96,000</span>
            </td>
            <td>Amaka Obi</td>
            <td>9 May 2026</td>
            <td>
              <Badge variant="gray">Packed</Badge>
            </td>
            <td>
              <Button variant="green" size="sm" onClick={() => openModal('dispatch-lpo')}>
                Dispatch → Invoice
              </Button>
            </td>
          </tr>
          <tr>
            <td>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>LPO-0038</span>
            </td>
            <td>Konga Health</td>
            <td>
              <Badge variant="amber">2 Wks</Badge>
            </td>
            <td>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>₦312,000</span>
            </td>
            <td>—</td>
            <td>—</td>
            <td>
              <Badge variant="blue">Assigned</Badge>
            </td>
            <td>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Awaiting Inv. Officer</span>
            </td>
          </tr>
        </tbody>
      </DataTable>
    </>
  );
}
