import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { IconLabel } from '../components/ui/Icon';
import { SartorModal } from '../components/ui/SartorModal';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const INVITE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'rep', label: 'Sales Rep' },
  { value: 'finance', label: 'Finance Manager' },
  { value: 'inv', label: 'Inventory Officer' },
  { value: 'wh', label: 'Warehouse Manager' },
  { value: 'driver', label: 'Driver' },
  { value: 'merch', label: 'Merchandiser' },
];

export function SettingsModals() {
  const { isOpen, closeModal, handleSubmit } = useModalActions();
  const [inviteRole, setInviteRole] = useState('');

  const showComm = inviteRole === 'admin' || inviteRole === 'rep';
  const showWh = inviteRole === 'wh' || inviteRole === 'driver';

  return (
    <>
      <SartorModal
        id="invite-user"
        open={isOpen('invite-user')}
        onClose={() => closeModal('invite-user')}
        title="Invite Team Member"
        footer={
          <ModalFooterActions onCancel={() => closeModal('invite-user')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('invite-user', e.currentTarget, 'Invitation sent successfully.')}
            >
              Send Invitation
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Full Name *" className="w50">
            <input className="inp" placeholder="Full name" />
          </FG>
          <FG label="Email *" className="w50">
            <input className="inp" type="email" placeholder="email@…" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Phone *" className="w50">
            <input className="inp" type="tel" placeholder="+234…" />
          </FG>
          <FG label="Role *" className="w50">
            <select
              className="sel"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="">Select role…</option>
              {INVITE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FG>
        </FRow>
        {showComm && (
          <div
            style={{
              background: 'var(--Gb)',
              border: '1px solid rgba(0,179,65,.25)',
              borderRadius: 8,
              padding: 14,
              marginTop: 6,
            }}
          >
            <SDivLabel style={{ marginTop: 0, color: 'var(--Gd)' }}>
              Commission Settings
            </SDivLabel>
            <FRow>
              <FG label="Commission Rate (%) *" className="w50">
                <input className="inp" type="number" placeholder="3.5" step={0.5} />
              </FG>
              <FG label="Effective From *" className="w50">
                <input className="inp" type="date" />
              </FG>
            </FRow>
          </div>
        )}
        {showWh && (
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--brd)',
              borderRadius: 8,
              padding: 14,
              marginTop: 6,
            }}
          >
            <FG label="Assign to Warehouse *" full>
              <select className="sel" defaultValue="Abuja Central">
                <option>Abuja Central</option>
                <option>Lagos Hub</option>
              </select>
            </FG>
          </div>
        )}
      </SartorModal>

      <SartorModal
        id="set-commission"
        open={isOpen('set-commission')}
        onClose={() => closeModal('set-commission')}
        title="Edit Commission Rate"
        subtitle="Abubakar Idah — Admin"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('set-commission')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('set-commission', e.currentTarget, 'Commission rate saved.')}
            >
              Save Rate
            </Button>
          </ModalFooterActions>
        }
      >
        <IRow label="Current Rate" value="3.5%" />
        <FRow>
          <FG label="New Rate (%) *">
            <input className="inp" type="number" step={0.5} />
          </FG>
          <FG label="Effective From *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
      </SartorModal>

      <SartorModal
        id="add-warehouse"
        open={isOpen('add-warehouse')}
        onClose={() => closeModal('add-warehouse')}
        title="Add Warehouse"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-warehouse')}>
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-warehouse', e.currentTarget, 'Warehouse created.')}
            >
              Create Warehouse
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Warehouse Name *" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Port Harcourt Hub" />
        </FG>
        <FG label="Street Address *" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Full address" />
        </FG>
        <FRow>
          <FG label="State *">
            <select className="sel">
              <option value="">State…</option>
              <option>FCT — Abuja</option>
              <option>Lagos</option>
              <option>Rivers</option>
            </select>
          </FG>
          <FG label="LGA *">
            <input className="inp" placeholder="LGA" />
          </FG>
        </FRow>
      </SartorModal>

      <SartorModal
        id="add-category"
        open={isOpen('add-category')}
        onClose={() => closeModal('add-category')}
        title="Product Category"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-category')}>
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-category', e.currentTarget, 'Category saved.')}
            >
              Save Category
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Category Name *" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Health Products" />
        </FG>
        <FG label="Description" full>
          <textarea className="ta" rows={2} />
        </FG>
      </SartorModal>

      <SartorModal
        id="add-supplier"
        open={isOpen('add-supplier')}
        onClose={() => closeModal('add-supplier')}
        title="Add / Edit Supplier"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-supplier')}>
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-supplier', e.currentTarget, 'Supplier saved.')}
            >
              Save Supplier
            </Button>
          </ModalFooterActions>
        }
      >
        <SDivLabel style={{ marginTop: 0 }}>Supplier Details</SDivLabel>
        <FRow>
          <FG label="Company Name *" className="w50">
            <input className="inp" placeholder="e.g. West Africa Chemicals Ltd" />
          </FG>
          <FG label="Category *" className="w50">
            <select className="sel">
              <option>Raw Materials</option>
              <option>Packaging</option>
              <option>Finished Goods</option>
            </select>
          </FG>
        </FRow>
        <FRow>
          <FG label="Contact Person *" className="w50">
            <input className="inp" placeholder="Full name" />
          </FG>
          <FG label="Phone *" className="w50">
            <input className="inp" type="tel" placeholder="+234…" />
          </FG>
        </FRow>
        <FG label="Business Address" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Full address" />
        </FG>
        <SDivLabel>Payment Terms</SDivLabel>
        <FRow>
          <FG label="Standard Payment Terms">
            <select className="sel">
              <option>Net 30 days</option>
              <option>Net 15 days</option>
              <option>Cash on Delivery</option>
            </select>
          </FG>
          <FG label="Bank Name">
            <input className="inp" placeholder="Supplier's bank" />
          </FG>
          <FG label="Account Number">
            <input className="inp" placeholder="Account number" />
          </FG>
        </FRow>
      </SartorModal>

      <SartorModal
        id="supplier-payment"
        open={isOpen('supplier-payment')}
        onClose={() => closeModal('supplier-payment')}
        title="Record Supplier Payment"
        subtitle="West Africa Chemicals Ltd — Outstanding: ₦720,000"
        footer={
          <ModalFooterActions onCancel={() => closeModal('supplier-payment')}>
            <Button
              variant="primary"
              onClick={(e) =>
                handleSubmit(
                  'supplier-payment',
                  e.currentTarget,
                  'Supplier payment recorded. GRN balances updated.',
                )
              }
            >
              Record Payment
            </Button>
          </ModalFooterActions>
        }
      >
        <IRow label="Supplier" value={<strong>West Africa Chemicals Ltd</strong>} />
        <IRow label="Total Outstanding" value="₦720,000" />
        <div className="sdiv" />
        <SDivLabel style={{ marginTop: 0 }}>Select GRN(s) This Payment Covers</SDivLabel>
        <div style={{ border: '1px solid var(--brd)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          <label
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 90px 100px',
              gap: 10,
              padding: '10px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--bg2)',
            }}
          >
            <input type="checkbox" style={{ accentColor: 'var(--G)' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>
                GRN-0004 — WAC-2024-0891
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>3 SKUs · Abuja Central</div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
              ₦480,000 unpaid
            </div>
          </label>
        </div>
        <FRow>
          <FG label="Payment Amount *">
            <input className="inp" type="number" placeholder="0.00" />
          </FG>
          <FG label="Payment Date *">
            <input className="inp" type="date" />
          </FG>
        </FRow>
        <FG label="Payment Method *" full style={{ marginBottom: 10 }}>
          <select className="sel">
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Cash</option>
          </select>
        </FG>
        <FG label="Bank Reference / Transaction ID *" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="Transaction reference from bank" />
        </FG>
        <FG label="Payment Evidence *" full>
          <label className="btn bsec bsm" style={{ cursor: 'pointer', margin: 0 }}>
            <IconLabel icon="paperclip" size={13}>Upload</IconLabel>
            <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" />
          </label>
        </FG>
      </SartorModal>
    </>
  );
}
