import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/Button';
import { IconLabel } from '../components/ui/Icon';
import { SartorModal } from '../components/ui/SartorModal';
import type { ApiSupplier } from '../api/catalog';
import { opsApi } from '../api/ops';
import type { ApiTeamUser } from '../api/team';
import { useApp } from '../context/AppContext';
import { useLiveOptions } from '../hooks/useLiveOptions';
import type { RoleId } from '../types';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const INVITE_ROLES: { value: RoleId; label: string; tiers: Array<'sn' | 'snp' | '360'> }[] = [
  { value: 'admin', label: 'Admin', tiers: ['sn', 'snp', '360'] },
  { value: 'rep', label: 'Sales Rep', tiers: ['sn', 'snp', '360'] },
  { value: 'finance', label: 'Finance', tiers: ['sn', 'snp'] },
  { value: 'merch', label: 'Merchandiser', tiers: ['sn', 'snp', '360'] },
  { value: 'inv', label: 'Inventory Officer', tiers: ['snp', '360'] },
  { value: 'wh', label: 'Warehouse Manager', tiers: ['snp', '360'] },
  { value: 'driver', label: 'Driver', tiers: ['snp', '360'] },
];

function roleSelectValue(role?: string) {
  const r = (role || '').toLowerCase();
  if (r === 'admin' || r.includes('admin')) return 'admin';
  if (r === 'rep' || r.includes('rep') || r.includes('sales')) return 'rep';
  if (r === 'finance' || r.includes('finance')) return 'finance';
  if (r === 'inv' || r.includes('inv') || r.includes('inventory')) return 'inv';
  if (r === 'wh' || r.includes('warehouse')) return 'wh';
  if (r === 'driver' || r.includes('driver')) return 'driver';
  if (r === 'merch' || r.includes('merch')) return 'merch';
  return '';
}

export function SettingsModals() {
  const { isOpen, closeModal, getPayload, handleSubmit, showToast } = useModalActions();
  const { tier } = useApp();
  const { warehouses } = useLiveOptions(isOpen('invite-user') || isOpen('supplier-payment'));
  const supplier = getPayload<{ supplier?: ApiSupplier }>('supplier-payment')?.supplier;
  const inviteUser = getPayload<{ user?: ApiTeamUser }>('invite-user')?.user;
  const commissionUser = getPayload<{ user?: ApiTeamUser }>('set-commission')?.user;
  const [inviteRole, setInviteRole] = useState('');
  const [savingWh, setSavingWh] = useState(false);

  const inviteRoles = useMemo(
    () => INVITE_ROLES.filter((r) => r.tiers.includes(tier)),
    [tier],
  );

  const inviteOpen = isOpen('invite-user');
  useEffect(() => {
    if (inviteOpen) {
      const resolved = roleSelectValue(
        inviteUser?.userRole || inviteUser?.role || inviteUser?.consoleRole,
      );
      setInviteRole(
        resolved && inviteRoles.some((r) => r.value === resolved)
          ? resolved
          : inviteRoles[0]?.value || '',
      );
    }
  }, [inviteOpen, inviteUser, inviteRoles]);
  const whNameRef = useRef<HTMLInputElement>(null);
  const whAddrRef = useRef<HTMLInputElement>(null);
  const whStateRef = useRef<HTMLSelectElement>(null);
  const whLgaRef = useRef<HTMLInputElement>(null);

  const showComm = inviteRole === 'admin' || inviteRole === 'rep';
  const showWh = inviteRole === 'wh' || inviteRole === 'driver';

  const saveWarehouse = async (btn: HTMLButtonElement | null) => {
    const name = whNameRef.current?.value.trim() || '';
    const address = whAddrRef.current?.value.trim() || '';
    const state = whStateRef.current?.value.trim() || '';
    const lga = whLgaRef.current?.value.trim() || '';
    if (!name || !address) {
      showToast('Name and address are required.', 'err');
      return;
    }
    setSavingWh(true);
    if (btn) btn.disabled = true;
    try {
      await opsApi.createWarehouse({ name, address, state, lga, status: 'Active' });
      closeModal('add-warehouse');
      showToast('Warehouse created.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-ops-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to create warehouse', 'err');
    } finally {
      setSavingWh(false);
      if (btn) btn.disabled = false;
    }
  };

  return (
    <>
      <SartorModal
        id="invite-user"
        open={isOpen('invite-user')}
        onClose={() => closeModal('invite-user')}
        title={inviteUser ? 'Edit Team Member' : 'Invite Team Member'}
        footer={
          <ModalFooterActions onCancel={() => closeModal('invite-user')}>
            <Button
              variant="primary"
              onClick={(e) =>
                handleSubmit(
                  'invite-user',
                  e.currentTarget,
                  inviteUser ? 'User updated.' : 'Invitation sent successfully.',
                )
              }
            >
              {inviteUser ? 'Save Changes' : 'Send Invitation'}
            </Button>
          </ModalFooterActions>
        }
      >
        <FRow>
          <FG label="Full Name *" className="w50">
            <input
              className="inp"
              placeholder="Full name"
              key={`nm-${inviteUser?._id || 'new'}`}
              defaultValue={inviteUser?.fullName || ''}
            />
          </FG>
          <FG label="Email *" className="w50">
            <input
              className="inp"
              type="email"
              placeholder="email@…"
              key={`em-${inviteUser?._id || 'new'}`}
              defaultValue={inviteUser?.email || ''}
            />
          </FG>
        </FRow>
        <FRow>
          <FG label="Phone *" className="w50">
            <input
              className="inp"
              type="tel"
              placeholder="+234…"
              key={`ph-${inviteUser?._id || 'new'}`}
              defaultValue={inviteUser?.phone || ''}
            />
          </FG>
          <FG label="Role *" className="w50">
            <select
              className="sel"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="">Select role…</option>
              {inviteRoles.map((r) => (
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
              <select className="sel" defaultValue="">
                <option value="">Select warehouse…</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
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
        subtitle={
          commissionUser
            ? `${commissionUser.fullName || 'User'} — ${commissionUser.role || commissionUser.consoleRole || '—'}`
            : undefined
        }
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
        <IRow label="Current Rate" value="—" />
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
              disabled={savingWh}
              onClick={(e) => void saveWarehouse(e.currentTarget)}
            >
              {savingWh ? 'Saving…' : 'Create Warehouse'}
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Warehouse Name *" full style={{ marginBottom: 10 }}>
          <input ref={whNameRef} className="inp" placeholder="e.g. Port Harcourt Hub" />
        </FG>
        <FG label="Street Address *" full style={{ marginBottom: 10 }}>
          <input ref={whAddrRef} className="inp" placeholder="Full address" />
        </FG>
        <FRow>
          <FG label="State *">
            <select ref={whStateRef} className="sel" defaultValue="">
              <option value="">State…</option>
              <option value="FCT">FCT — Abuja</option>
              <option value="Lagos">Lagos</option>
              <option value="Rivers">Rivers</option>
            </select>
          </FG>
          <FG label="LGA *">
            <input ref={whLgaRef} className="inp" placeholder="LGA" />
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
            <input className="inp" placeholder="e.g. Supplier company name" />
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
        subtitle={supplier?.name || 'Select a supplier from the list'}
        footer={
          <ModalFooterActions onCancel={() => closeModal('supplier-payment')}>
            <Button
              variant="primary"
              onClick={(e) =>
                handleSubmit('supplier-payment', e.currentTarget, 'Supplier payment recorded.')
              }
            >
              Record Payment
            </Button>
          </ModalFooterActions>
        }
      >
        <IRow label="Supplier" value={<strong>{supplier?.name || '—'}</strong>} />
        <IRow label="Contact" value={supplier?.contactName || supplier?.email || '—'} />
        <IRow label="Phone" value={supplier?.contactNumber || supplier?.phone || '—'} />
        <div className="sdiv" />
        <FRow>
          <FG label="Payment Amount *">
            <input className="inp" type="number" placeholder="0.00" />
          </FG>
          <FG label="Payment Date *">
            <input className="inp" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
