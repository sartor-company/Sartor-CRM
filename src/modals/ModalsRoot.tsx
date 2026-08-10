import { BillingModals } from './BillingModals';
import { DriverModals } from './DriverModals';
import { FieldModals } from './FieldModals';
import { FinanceModals } from './FinanceModals';
import { InventoryModals } from './InventoryModals';
import { InvoiceModals } from './InvoiceModals';
import { LeadModals } from './LeadModals';
import { LocationModals } from './LocationModals';
import { LpoModals } from './LpoModals';
import { ProductModals } from './ProductModals';
import { SettingsModals } from './SettingsModals';
import { RaisePoModal, WarehouseModals } from './WarehouseModals';

/** Mount once inside ModalProvider — renders every CRM modal group. */
export function ModalsRoot() {
  return (
    <>
      <LeadModals />
      <LpoModals />
      <InvoiceModals />
      <ProductModals />
      <DriverModals />
      <FieldModals />
      <FinanceModals />
      <InventoryModals />
      <SettingsModals />
      <LocationModals />
      <BillingModals />
      <WarehouseModals />
      <RaisePoModal />
    </>
  );
}
