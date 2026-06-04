import { Badge, Button, DataTable, InfoBanner, Mono, PageHead } from '../components/ui';
import { useModal } from '../context/ModalContext';

export default function FinanceDashPage() {
  const { openModal } = useModal();

  return (
    <>
      <PageHead
        icon="inbox"
        title="Payment Confirmation Queue"
        subtitle="Invoices marked as paid — awaiting Finance/CEO confirmation."
      />

      <InfoBanner variant="warn">
        Only CEO and Finance Manager can confirm full payment. Confirmation triggers commission calculation and
        Lead→Customer conversion.
      </InfoBanner>

      <DataTable>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Marked By</th>
            <th>First Invoice?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Mono style={{ fontSize: 12 }}>INV-00038</Mono>
            </td>
            <td>SafeZone Pharmacy</td>
            <td>
              <Mono>₦144,000</Mono>
            </td>
            <td>
              <Mono>₦144,000</Mono>
            </td>
            <td>Sales Rep</td>
            <td>
              <Badge variant="amber">Yes — Will Convert</Badge>
            </td>
            <td>
              <Button variant="green" size="sm" onClick={() => openModal('confirm-payment')}>
                Confirm Full Payment →
              </Button>
            </td>
          </tr>
          <tr>
            <td>
              <Mono style={{ fontSize: 12 }}>INV-00035</Mono>
            </td>
            <td>MedPoint Stores</td>
            <td>
              <Mono>₦200,000</Mono>
            </td>
            <td>
              <Mono>₦200,000</Mono>
            </td>
            <td>Admin</td>
            <td>
              <Badge variant="gray">No</Badge>
            </td>
            <td>
              <Button variant="green" size="sm" onClick={() => openModal('confirm-payment')}>
                Confirm Full Payment →
              </Button>
            </td>
          </tr>
        </tbody>
      </DataTable>
    </>
  );
}
