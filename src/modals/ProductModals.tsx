import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import type { ApiProduct } from '../api/catalog';
import { useLiveOptions, productSku } from '../hooks/useLiveOptions';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatNaira, num } from '../utils/format';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

export function ProductModals() {
  const { isOpen, closeModal, openModal, getPayload, handleSubmit } = useModalActions();
  const { showAddProduct, showProdEdit, showProdStock } = useRoleGates();
  const { warehouses } = useLiveOptions();

  const viewProduct = getPayload<{ product?: ApiProduct }>('view-product')?.product;
  const editProduct =
    getPayload<{ product?: ApiProduct }>('edit-product')?.product ?? viewProduct;
  const approveProduct = getPayload<{ product?: ApiProduct }>('approve-stock')?.product;

  const viewSku = viewProduct ? productSku(viewProduct) : null;
  const viewName = viewProduct?.productName || 'Select a product';
  const viewTitle = viewSku ? `${viewSku} — ${viewName}` : 'Select a product';
  const stockQty = Number(viewProduct?.totalQuantityAvailable ?? 0);
  const selling = formatNaira(viewProduct?.sellingPrice ?? viewProduct?.price);

  return (
    <>
      <SartorModal
        id="view-product"
        open={isOpen('view-product')}
        onClose={() => closeModal('view-product')}
        title={viewTitle}
        subtitle={
          viewProduct
            ? 'Full product details, pricing, and batch inventory'
            : 'Open a product from the catalog to view details'
        }
        size="xwide"
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('view-product')}>
              Close
            </Button>
            <RoleGate show={showProdEdit && !!viewProduct}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('view-product');
                  openModal('edit-product', { product: viewProduct });
                }}
              >
                Edit Product
              </Button>
            </RoleGate>
          </>
        }
      >
        {!viewProduct ? (
          <InfoBanner>No product selected. Open this modal from the product catalog.</InfoBanner>
        ) : (
          <>
            <div className="g2" style={{ marginBottom: 0 }}>
              <div className="card cp" style={{ marginBottom: 14 }}>
                <div className="ch">
                  <span className="ct">Product Metadata</span>
                </div>
                <IRow
                  label="SKU"
                  value={
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                      {viewSku}
                    </span>
                  }
                />
                <IRow label="Product Name" value={viewName} />
                <IRow label="Brand / Manufacturer" value={viewProduct.manufacturer || '—'} />
                <IRow label="Category" value={viewProduct.productCategory || '—'} />
                <IRow label="Status" value={viewProduct.status || '—'} />
              </div>
              <div className="card cp" style={{ marginBottom: 14 }}>
                <div className="ch">
                  <span className="ct">Pricing & Stock Summary</span>
                </div>
                <IRow label="Selling Price" value={selling} />
                <IRow
                  label="Supply Price"
                  value={formatNaira(viewProduct.supplyPrice ?? viewProduct.price)}
                />
                <IRow label="Available Stock" value={`${stockQty.toLocaleString()} units`} />
                <IRow
                  label="Stock Status"
                  value={
                    <Badge variant={stockQty <= 0 ? 'red' : stockQty < 100 ? 'amber' : 'green'}>
                      {stockQty <= 0 ? 'Out of Stock' : stockQty < 100 ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  }
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <SDivLabel style={{ margin: 0 }}>Inventory Batches</SDivLabel>
              <RoleGate show={showProdStock}>
                <Button
                  variant="green"
                  size="sm"
                  onClick={() => {
                    closeModal('view-product');
                    openModal('add-batch', { product: viewProduct });
                  }}
                >
                  + Add Batch
                </Button>
              </RoleGate>
            </div>
            <InfoBanner>
              Batch-level detail will appear here when inventory batches are linked to this SKU.
            </InfoBanner>
          </>
        )}
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
              <input
                className="inp"
                readOnly
                style={{ background: 'var(--bg)', fontFamily: "'DM Mono',monospace", color: 'var(--tx3)' }}
                placeholder="SH-XXXX (assigned on save)"
              />
            </FG>
            <FG label="Barcode / QR Code" className="w50">
              <input className="inp" placeholder="If applicable" />
            </FG>
          </FRow>
          <FG label="Product Name *" full style={{ marginBottom: 10 }}>
            <input className="inp" placeholder="Product name" />
          </FG>
          <FRow>
            <FG label="Manufacturer *" className="w50">
              <input className="inp" placeholder="Name of manufacturer" />
            </FG>
            <FG label="Brand Owner *" className="w50">
              <input className="inp" placeholder="Brand owner" />
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
            <select className="sel" defaultValue="">
              <option value="">Select warehouse…</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </FG>
        </SartorModal>
      </RoleGate>

      <RoleGate show={showProdEdit}>
        <SartorModal
          id="edit-product"
          open={isOpen('edit-product')}
          onClose={() => closeModal('edit-product')}
          title={
            editProduct
              ? `Edit Product — ${productSku(editProduct)}`
              : 'Edit Product — Select a product'
          }
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
          {!editProduct ? (
            <InfoBanner>No product selected. Open this modal from the product catalog.</InfoBanner>
          ) : (
            <>
              <FRow>
                <FG label="Product Name" className="w50">
                  <input
                    className="inp"
                    key={`name-${editProduct._id}`}
                    defaultValue={editProduct.productName || ''}
                  />
                </FG>
                <FG label="Manufacturer" className="w50">
                  <input
                    className="inp"
                    key={`mfg-${editProduct._id}`}
                    defaultValue={editProduct.manufacturer || ''}
                  />
                </FG>
              </FRow>
              <FRow>
                <FG label="Selling Price (₦)" className="w50">
                  <input
                    className="inp"
                    type="number"
                    key={`price-${editProduct._id}`}
                    defaultValue={num(editProduct.sellingPrice ?? editProduct.price)}
                  />
                </FG>
                <FG label="Category" className="w50">
                  <input
                    className="inp"
                    key={`cat-${editProduct._id}`}
                    defaultValue={editProduct.productCategory || ''}
                  />
                </FG>
              </FRow>
            </>
          )}
        </SartorModal>
      </RoleGate>

      <SartorModal
        id="add-batch"
        open={isOpen('add-batch')}
        onClose={() => closeModal('add-batch')}
        title="Add / Edit Inventory Batch"
        subtitle={
          viewProduct || editProduct
            ? `${productSku((viewProduct || editProduct)!)} — ${(viewProduct || editProduct)!.productName || 'Product'}`
            : 'Select a product first'
        }
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
            <input className="inp" placeholder="Batch number" />
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
            <input className="inp" placeholder="Supplier name" />
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
        title="Pack LPO"
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
          subtitle={
            approveProduct
              ? `${productSku(approveProduct)} — ${approveProduct.productName || 'Product'}`
              : 'Review pending stock update'
          }
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
          <IRow
            label="Product"
            value={
              approveProduct
                ? `${productSku(approveProduct)} — ${approveProduct.productName || 'Product'}`
                : 'Select a product'
            }
          />
          <IRow
            label="Current Available"
            value={
              approveProduct
                ? `${Number(approveProduct.totalQuantityAvailable ?? 0).toLocaleString()} units`
                : '—'
            }
          />
          <FG label="WH Manager Note (optional)" full style={{ marginTop: 10 }}>
            <textarea className="ta" rows={2} />
          </FG>
        </SartorModal>
      </RoleGate>
    </>
  );
}
