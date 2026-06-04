import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { useRoleGates } from '../hooks/useRoleGates';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

export function ProductModals() {
  const { isOpen, closeModal, openModal, handleSubmit } = useModalActions();
  const { showAddProduct, showProdEdit, showProdStock } = useRoleGates();

  return (
    <>
      <SartorModal
        id="view-product"
        open={isOpen('view-product')}
        onClose={() => closeModal('view-product')}
        title="SH-25-CAR — Hand Sanitiser 250ml Carabiner"
        subtitle="Full product details, pricing, and batch inventory"
        size="xwide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-product')}>
              Close
            </Button>
            <RoleGate show={showProdEdit}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('view-product');
                  openModal('edit-product');
                }}
              >
                Edit Product
              </Button>
            </RoleGate>
          </>
        }
      >
        <div className="g2" style={{ marginBottom: 0 }}>
          <div className="card cp" style={{ marginBottom: 14 }}>
            <div className="ch">
              <span className="ct">Product Metadata</span>
            </div>
            <IRow label="SKU" value={<span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>SH-25-CAR</span>} />
            <IRow label="Product Name" value="Hand Sanitiser 250ml Carabiner" />
            <IRow label="Brand Owner" value="Sartor Health Company Ltd" />
            <IRow label="Category" value="Personal Care" />
            <IRow label="Warehouse" value="Abuja Central" />
          </div>
          <div className="card cp" style={{ marginBottom: 14 }}>
            <div className="ch">
              <span className="ct">Pricing & Stock Summary</span>
            </div>
            <IRow label="Selling Price" value="₦1,200" />
            <IRow label="Available Stock" value="2,340 units" />
            <IRow label="Committed Qty" value="120 units" />
            <IRow label="Stock Status" value={<Badge variant="green">OK — Above Reorder Level</Badge>} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <SDivLabel style={{ margin: 0 }}>Inventory Batches — Full Traceability</SDivLabel>
          <RoleGate show={showProdStock}>
            <Button
              variant="green"
              size="sm"
              onClick={() => {
                closeModal('view-product');
                openModal('add-batch');
              }}
            >
              + Add Batch
            </Button>
          </RoleGate>
        </div>
        <div className="tw">
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch No.</th>
                <th>Exp Date</th>
                <th>Available</th>
                <th>Committed</th>
                <th>Supplier</th>
                <th>Purchase Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>BTH-2024-09A</td>
                <td>Sep 2026</td>
                <td>680</td>
                <td>120</td>
                <td>West Africa Chemicals</td>
                <td>₦740</td>
              </tr>
              <tr>
                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>BTH-2024-06B</td>
                <td>Jun 2026</td>
                <td>1000</td>
                <td>0</td>
                <td>West Africa Chemicals</td>
                <td>₦760</td>
              </tr>
              <tr style={{ background: 'rgba(239,68,68,.03)' }}>
                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>BTH-2024-03C</td>
                <td style={{ color: 'var(--rt)', fontWeight: 700 }}>
                  Dec 2025 <Icon name="alert" size={14} style={{ verticalAlign: 'middle' }} />
                </td>
                <td>660</td>
                <td>0</td>
                <td>Kemi Industries</td>
                <td>₦720</td>
              </tr>
            </tbody>
          </table>
        </div>
        <InfoBanner variant="warn" style={{ marginTop: 12 }}>
          <strong>BTH-2024-03C</strong> has an expired Exp date. This batch should be quarantined per
          company policy.
        </InfoBanner>
      </SartorModal>

      <RoleGate show={showAddProduct}>
        <SartorModal
          id="add-product"
          open={isOpen('add-product')}
          onClose={() => closeModal('add-product')}
          title="Add New Product"
          subtitle="SKU auto-generated on save"
          size="wide"
          footer={
            <ModalFooterActions onCancel={() => closeModal('add-product')}>
              <Button
                variant="green"
                onClick={(e) => handleSubmit('add-product', e.currentTarget, 'Product added to catalog.')}
              >
                Add Product
              </Button>
            </ModalFooterActions>
          }
        >
          <SDivLabel style={{ marginTop: 0 }}>Product Identity</SDivLabel>
          <FRow>
            <FG label="Auto-Generated SKU" className="w50">
              <input className="inp" readOnly style={{ background: 'var(--bg)', fontFamily: "'DM Mono',monospace", color: 'var(--tx3)' }} placeholder="SH-XXXX (assigned on save)" />
            </FG>
            <FG label="Barcode / QR Code" className="w50">
              <input className="inp" placeholder="If applicable" />
            </FG>
          </FRow>
          <FG label="Product Name *" full style={{ marginBottom: 10 }}>
            <input className="inp" placeholder="e.g. Hand Sanitiser 750ml Carabiner" />
          </FG>
          <FRow>
            <FG label="Manufacturer *" className="w50">
              <input className="inp" placeholder="Name of manufacturer" />
            </FG>
            <FG label="Brand Owner *" className="w50">
              <input className="inp" placeholder="e.g. Sartor Health Company Ltd" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Category *" className="w50">
              <select className="sel">
                <option value="">Select…</option>
                <option>Personal Care</option>
                <option>Health Products</option>
                <option>FMCG</option>
              </select>
            </FG>
            <FG label="Country of Origin" className="w50">
              <input className="inp" placeholder="e.g. Nigeria" />
            </FG>
          </FRow>
          <SDivLabel>Pricing & Stock</SDivLabel>
          <FRow>
            <FG label="Selling Price (₦) *" className="w33">
              <input className="inp" type="number" placeholder="0.00" />
            </FG>
            <FG label="Default Purchase Price (₦)" className="w33">
              <input className="inp" type="number" placeholder="0.00" />
            </FG>
            <FG label="Reorder Level *" className="w33">
              <input className="inp" type="number" placeholder="300" />
            </FG>
          </FRow>
          <FG label="Assign to Warehouse *" full>
            <select className="sel" defaultValue="Abuja Central">
              <option>Abuja Central</option>
              <option>Lagos Hub</option>
            </select>
          </FG>
        </SartorModal>
      </RoleGate>

      <RoleGate show={showProdEdit}>
        <SartorModal
          id="edit-product"
          open={isOpen('edit-product')}
          onClose={() => closeModal('edit-product')}
          title="Edit Product — SH-25-CAR"
          subtitle="CEO and Inventory Officer only"
          size="wide"
          footer={
            <ModalFooterActions onCancel={() => closeModal('edit-product')}>
              <Button
                variant="primary"
                onClick={(e) => handleSubmit('edit-product', e.currentTarget, 'Product updated.')}
              >
                Save Changes
              </Button>
            </ModalFooterActions>
          }
        >
          <FRow>
            <FG label="Product Name" className="w50">
              <input className="inp" defaultValue="Hand Sanitiser 250ml Carabiner" />
            </FG>
            <FG label="Manufacturer" className="w50">
              <input className="inp" defaultValue="Sartor Health Company Ltd" />
            </FG>
          </FRow>
          <FRow>
            <FG label="Selling Price (₦)" className="w50">
              <input className="inp" type="number" defaultValue={1200} />
            </FG>
            <FG label="Reorder Level" className="w50">
              <input className="inp" type="number" defaultValue={500} />
            </FG>
          </FRow>
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="add-batch"
        open={isOpen('add-batch')}
        onClose={() => closeModal('add-batch')}
        title="Add / Edit Inventory Batch"
        subtitle="SH-25-CAR — Hand Sanitiser 250ml Carabiner"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-batch')}>
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-batch', e.currentTarget, 'Batch saved.')}
            >
              Save Batch
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Batch Number *" className="w50">
            <input className="inp" placeholder="e.g. BTH-2024-12A" />
          </FG>
          <FG label="Quantity Received *" className="w50">
            <input className="inp" type="number" placeholder="0" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Manufacturing Date *" className="w50">
            <input className="inp" type="date" />
          </FG>
          <FG label="Expiry Date *" className="w50">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <SDivLabel>Supplier & Purchase Details</SDivLabel>
        <FRow>
          <FG label="Supplier Name *" className="w50">
            <input className="inp" placeholder="e.g. West Africa Chemicals Ltd" />
          </FG>
          <FG label="Supplier Invoice Ref" className="w50">
            <input className="inp" placeholder="Supplier invoice number" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Purchase Price / Unit (₦)" className="w50">
            <input className="inp" type="number" placeholder="0.00" />
          </FG>
          <FG label="Selling Price Override (₦)" className="w50">
            <input className="inp" type="number" placeholder="Leave blank for default" />
          </FG>
        </FRow>
        <FG label="Notes" full>
          <textarea className="ta" rows={2} placeholder="Storage conditions, quality notes…" />
        </FG>
      </SartorModal>

      <SartorModal
        id="pack-lpo"
        open={isOpen('pack-lpo')}
        onClose={() => closeModal('pack-lpo')}
        title="Pack LPO-0039 — Konga Health"
        subtitle="Select batches and enter quantities. Available qty updates live. FEFO order recommended."
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('pack-lpo')}>
            <Button
              variant="green"
              onClick={(e) =>
                handleSubmit('pack-lpo', e.currentTarget, 'LPO packed. Stock committed.')
              }
            >
              Save Pack & Commit Stock →
            </Button>
          </ModalFooterActions>
        }
      >
        <InfoBanner>
          <strong>Committed:</strong> Stock reserved when you save this pack. Validate all SKU totals
          match LPO quantities before saving.
        </InfoBanner>
        <div className="pack-sku-block">
          <div className="pack-sku-header">
            <div>
              <div className="pack-sku-name">SH-25-CAR — Hand Sanitiser 250ml Carabiner</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>
                2,340 units total available across all batches
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pack-sku-lpo-qty">LPO Required</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, fontWeight: 700, color: 'var(--N)' }}>
                100 units
              </div>
            </div>
          </div>
          <div className="pack-batch-header">
            <span />
            <span>Batch</span>
            <span>Exp Date</span>
            <span>Available</span>
            <span>Pack Qty</span>
          </div>
          <div className="pack-batch-row">
            <input type="checkbox" style={{ accentColor: 'var(--G)' }} />
            <span className="pack-batch-id">BTH-2024-09A</span>
            <span className="pack-exp">Sep 2026</span>
            <span className="pack-avail">680</span>
            <input className="inp pack-qty-inp" type="number" placeholder="0" min={0} max={680} />
          </div>
          <div className="pack-total-row">
            <span className="pack-total-lbl">Total packed for this SKU:</span>
            <span className="pack-total-counter">0 / 100</span>
          </div>
        </div>
        <FG label="Packing Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="Notes for WH Manager or driver…" />
        </FG>
      </SartorModal>

      <RoleGate show={showProdStock}>
        <SartorModal
          id="approve-stock"
          open={isOpen('approve-stock')}
          onClose={() => closeModal('approve-stock')}
          title="Approve Stock Update"
          subtitle="Request from Amaka Obi (Inventory Officer)"
          size="narrow"
          footer={
            <>
              <Button variant="secondary" onClick={() => closeModal('approve-stock')}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) =>
                  handleSubmit('approve-stock', e.currentTarget, 'Stock update rejected. Inv. Officer notified.')
                }
              >
                Reject
              </Button>
              <Button
                variant="green"
                onClick={(e) =>
                  handleSubmit('approve-stock', e.currentTarget, 'Stock update approved. Inventory updated.')
                }
              >
                Approve Update
              </Button>
            </>
          }
        >
          <IRow label="Product" value="SH-25-CAR" />
          <IRow label="Requested Change" value="+500 units — Batch BTH-2024-12A" />
          <FG label="WH Manager Note (optional)" full style={{ marginTop: 10 }}>
            <textarea className="ta" rows={2} />
          </FG>
        </SartorModal>
      </RoleGate>
    </>
  );
}
