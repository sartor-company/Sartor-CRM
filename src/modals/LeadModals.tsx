import { useEffect, useRef, useState } from 'react';
import { LocationCardSection } from '../components/location/LocationCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { crmApi, refName, type CrmLead } from '../api/crm';
import { teamApi, type ApiTeamUser } from '../api/team';
import { useApp } from '../context/AppContext';
import { useRoleGates } from '../hooks/useRoleGates';
import { formatDate } from '../utils/format';
import { leadStatusVariant, toApiLeadStatus } from '../utils/statusBadges';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const BUSINESS_CATEGORIES = [
  'FMCG-Retail / Supermarket',
  'FMCG-Wholesale',
  'Pharma-Retail',
  'Pharma-Wholesale',
  'Hospital / Clinic',
];

const STATES = ['FCT — Abuja', 'Lagos', 'Kano', 'Rivers', 'Oyo', 'Kaduna'];

const LEAD_STAGES = [
  'Contacted',
  'Qualified',
  'Interested',
  'Follow Up',
  'Hold',
  'In-Negotiations',
  'LPO Generated',
  'Order Fulfilled',
  'Payment Confirmed',
  'Closed Won',
  'Closed Lost',
];

export function LeadModals() {
  const { isOpen, closeModal, openModal, getPayload, showToast } = useModalActions();
  const { displayName, roleLabel } = useApp();
  const { showCeoAdmin } = useRoleGates();
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<ApiTeamUser[]>([]);

  const lead =
    getPayload<{ lead?: CrmLead }>('lead-detail')?.lead ||
    getPayload<{ lead?: CrmLead }>('reassign-lead')?.lead ||
    getPayload<{ lead?: CrmLead }>('update-status')?.lead ||
    null;

  const leadTitle = lead?.name || 'Select a lead';
  const leadLoc = lead
    ? [lead.lga, lead.state].filter(Boolean).join(', ') || lead.address || '—'
    : '—';
  const primaryContact = lead?.contacts?.[0];

  const nameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const lgaRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactRoleRef = useRef<HTMLSelectElement>(null);
  const contactPhoneRef = useRef<HTMLInputElement>(null);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const storesRef = useRef<HTMLInputElement>(null);
  const dealSizeRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const assignRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!isOpen('reassign-lead')) return;
    void teamApi
      .listUsers()
      .then(setStaff)
      .catch(() => setStaff([]));
  }, [isOpen('reassign-lead')]);

  const saveLead = async (btn: HTMLButtonElement | null) => {
    if (saving) return;
    const name = nameRef.current?.value.trim() || '';
    const type = typeRef.current?.value.trim() || '';
    const address = addressRef.current?.value.trim() || '';
    const state = stateRef.current?.value.trim() || '';
    const contactName = contactNameRef.current?.value.trim() || '';
    const contactPhone = contactPhoneRef.current?.value.trim() || '';
    const contactEmail = contactEmailRef.current?.value.trim() || '';
    const businessEmail = emailRef.current?.value.trim() || contactEmail;
    const lga = lgaRef.current?.value.trim() || '';
    const notes = notesRef.current?.value.trim() || '';
    const stores = Number(storesRef.current?.value || 1) || 1;
    const dealSize = dealSizeRef.current?.value.trim() || '0';
    const status = toApiLeadStatus(stageRef.current?.value || 'New');

    if (!name || !type || !address || !state || !contactName || !contactPhone) {
      showToast('Please fill all required fields.', 'err');
      return;
    }
    if (!businessEmail) {
      showToast('Business or contact email is required.', 'err');
      return;
    }

    setSaving(true);
    const orig = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving…';
    }
    try {
      await crmApi.createLead({
        name,
        address: lga ? `${address}, ${lga}` : address,
        email: businessEmail,
        phone: contactPhone,
        state,
        type,
        stores,
        dealSize,
        status,
        notes: notes || undefined,
        contact: [
          {
            name: contactName,
            email: contactEmail || undefined,
            phone: contactPhone,
            role: contactRoleRef.current?.value || undefined,
          },
        ],
      });
      closeModal('add-lead');
      showToast('Lead saved successfully.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-leads-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save lead', 'err');
    } finally {
      setSaving(false);
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig ?? '';
      }
    }
  };

  const updateStatus = async (btn: HTMLButtonElement | null) => {
    if (!lead?._id) {
      showToast('Select a lead first.', 'err');
      return;
    }
    const status = toApiLeadStatus(statusRef.current?.value || '');
    if (!status) {
      showToast('Select a stage.', 'err');
      return;
    }
    if (btn) btn.disabled = true;
    try {
      await crmApi.updateLeadStatus(lead._id, status);
      closeModal('update-status');
      showToast('Lead stage updated.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-leads-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update stage', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  const reassignLead = async (btn: HTMLButtonElement | null) => {
    if (!lead?._id) {
      showToast('Select a lead first.', 'err');
      return;
    }
    const userId = assignRef.current?.value || '';
    if (!userId) {
      showToast('Select a staff member.', 'err');
      return;
    }
    if (btn) btn.disabled = true;
    try {
      await crmApi.updateLead(lead._id, { user: userId });
      closeModal('reassign-lead');
      showToast('Lead assignment updated.', 'ok');
      window.dispatchEvent(new CustomEvent('crm-leads-changed'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update assignment', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  const passLead = (id: import('../types').ModalId) => {
    if (lead) openModal(id, { lead });
    else openModal(id);
  };

  return (
    <>
      <SartorModal
        id="add-lead"
        open={isOpen('add-lead')}
        onClose={() => closeModal('add-lead')}
        title="Add New Lead"
        subtitle="Business and contact details"
        size="wide"
        footer={
          <ModalFooterActions onCancel={() => closeModal('add-lead')}>
            <Button variant="green" onClick={(e) => void saveLead(e.currentTarget)} disabled={saving}>
              Save Lead
            </Button>
          </ModalFooterActions>
        }
      >
        <SDivLabel style={{ marginTop: 0 }}>Business Details</SDivLabel>
        <FRow>
          <FG label="Business / Store Name *" className="w50">
            <input ref={nameRef} className="inp" placeholder="Business name" />
          </FG>
          <FG label="Business Category *" className="w50">
            <select ref={typeRef} className="sel" defaultValue="">
              <option value="">Select…</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FG>
        </FRow>
        <FRow>
          <FG label="Business Email *" className="w50">
            <input ref={emailRef} className="inp" type="email" placeholder="orders@business.com" />
          </FG>
          <FG label="Est. Deal Size (₦)" className="w50">
            <input ref={dealSizeRef} className="inp" placeholder="e.g. 250000" />
          </FG>
        </FRow>
        <FRow>
          <FG label="Stores / Outlets" className="w50">
            <input ref={storesRef} className="inp" type="number" min={1} defaultValue={1} />
          </FG>
        </FRow>
        <SDivLabel>Business Address</SDivLabel>
        <FG label="Street Address *" full style={{ marginBottom: 10 }}>
          <input ref={addressRef} className="inp" placeholder="Street address" />
        </FG>
        <FRow>
          <FG label="State *">
            <select ref={stateRef} className="sel" defaultValue="">
              <option value="">State…</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FG>
          <FG label="LGA *">
            <input ref={lgaRef} className="inp" placeholder="LGA" />
          </FG>
          <FG label="Postal Code">
            <input className="inp" placeholder="Postal code" />
          </FG>
        </FRow>
        <SDivLabel
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>Location Pin</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx3)' }}>
            Helps staff navigate to this customer
          </span>
        </SDivLabel>
        <LocationCardSection context="lead" />
        <SDivLabel>Primary Contact</SDivLabel>
        <div className="contact-row">
          <div className="contact-row-num">Contact 1 — Primary</div>
          <FRow>
            <FG label="Full Name *" className="w50">
              <input ref={contactNameRef} className="inp" placeholder="Contact's full name" />
            </FG>
            <FG label="Role at Business *" className="w50">
              <select ref={contactRoleRef} className="sel" defaultValue="">
                <option value="">Role…</option>
                <option>Owner / CEO / MD</option>
                <option>Store Manager</option>
                <option>Procurement Manager</option>
                <option>Accountant</option>
                <option>Other</option>
              </select>
            </FG>
          </FRow>
          <FRow>
            <FG label="Phone *" className="w50">
              <input ref={contactPhoneRef} className="inp" type="tel" placeholder="+234…" />
            </FG>
            <FG label="Email" className="w50">
              <input ref={contactEmailRef} className="inp" type="email" placeholder="email@business.com" />
            </FG>
          </FRow>
          <FRow>
            <FG label="WhatsApp / SMS Notification Number" className="w50">
              <input className="inp" type="tel" placeholder="If different from phone" />
            </FG>
            <FG label="Preferred Channel" className="w50">
              <select className="sel" defaultValue="WhatsApp + SMS + Email">
                <option>WhatsApp + SMS + Email</option>
                <option>WhatsApp only</option>
                <option>SMS only</option>
                <option>Email only</option>
              </select>
            </FG>
          </FRow>
        </div>
        <RoleGate show={showCeoAdmin}>
          <FRow>
            <FG label="Assign To" className="w50">
              <select className="sel" defaultValue="Unassigned">
                <option>Unassigned</option>
                <option>Assign later from team</option>
              </select>
            </FG>
            <FG label="Initial Stage" className="w50">
              <select ref={stageRef} className="sel" defaultValue="Contacted">
                {LEAD_STAGES.slice(0, 3).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FG>
          </FRow>
        </RoleGate>
        <RoleGate show={!showCeoAdmin}>
          <InfoBanner>
            Lead will be auto-assigned to{' '}
            <strong>
              {displayName} ({roleLabel})
            </strong>
            . Only CEO and Admin can reassign leads.
          </InfoBanner>
        </RoleGate>
        <FG label="Notes" full style={{ marginTop: 4 }}>
          <textarea ref={notesRef} className="ta" rows={2} placeholder="Additional context…" />
        </FG>
      </SartorModal>

      <SartorModal
        id="lead-detail"
        open={isOpen('lead-detail')}
        onClose={() => closeModal('lead-detail')}
        title={leadTitle}
        subtitle={
          lead
            ? `Lead · ${lead.type || '—'} · ${lead.status || '—'}`
            : 'Open a lead from the list or pipeline'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => closeModal('lead-detail')}>
              Close
            </Button>
            <RoleGate show={showCeoAdmin}>
              <Button
                variant="outline"
                onClick={() => {
                  closeModal('lead-detail');
                  passLead('reassign-lead');
                }}
              >
                Reassign
              </Button>
            </RoleGate>
            <Button
              variant="outline"
              onClick={() => {
                closeModal('lead-detail');
                passLead('update-status');
              }}
            >
              Update Stage
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                closeModal('lead-detail');
                passLead('create-lpo');
              }}
            >
              Create LPO
            </Button>
          </>
        }
      >
        {!lead ? (
          <InfoBanner>No lead selected.</InfoBanner>
        ) : (
          <>
            <IRow label="Business" value={lead.name || '—'} />
            <IRow label="Address" value={lead.address || leadLoc} />
            <SDivLabel style={{ marginTop: 0 }}>Contacts</SDivLabel>
            {primaryContact ? (
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 7,
                  padding: '10px 12px',
                  fontSize: 13,
                }}
              >
                <strong>{primaryContact.name || '—'}</strong>{' '}
                {primaryContact.role ? (
                  <Badge variant="teal" style={{ fontSize: 10, marginLeft: 6 }}>
                    {primaryContact.role}
                  </Badge>
                ) : null}
                <br />
                <span style={{ color: 'var(--tx3)' }}>
                  {[primaryContact.phone, primaryContact.email].filter(Boolean).join(' · ') || '—'}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--tx3)' }}>
                {[lead.phone, lead.email].filter(Boolean).join(' · ') || 'No contact on file'}
              </div>
            )}
            <div className="sdiv" />
            <IRow
              label="Stage"
              value={<Badge variant={leadStatusVariant(lead.status)}>{lead.status || '—'}</Badge>}
            />
            <IRow label="Assigned To" value={refName(lead.user)} />
            <IRow label="Created" value={formatDate(lead.creationDateTime)} />
            <div className="sdiv" />
            <SDivLabel>Location Pin</SDivLabel>
            <LocationCardSection context="lead" />
          </>
        )}
      </SartorModal>

      <SartorModal
        id="reassign-lead"
        open={isOpen('reassign-lead')}
        onClose={() => closeModal('reassign-lead')}
        title="Assign / Reassign Lead"
        subtitle={leadTitle}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('reassign-lead')}>
            <Button variant="primary" onClick={(e) => void reassignLead(e.currentTarget)}>
              Confirm Assignment
            </Button>
          </ModalFooterActions>
        }
      >
        <IRow label="Currently" value={lead ? refName(lead.user) : '—'} />
        <FG label="Assign To *" full style={{ marginTop: 10 }}>
          <select ref={assignRef} className="sel" defaultValue="">
            <option value="">Select staff…</option>
            {staff.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullName || u.email || u._id.slice(-6)}
                {u.role ? ` (${u.role})` : ''}
              </option>
            ))}
          </select>
        </FG>
        <FG label="Reason (optional)" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} />
        </FG>
      </SartorModal>
      <SartorModal
        id="update-status"
        open={isOpen('update-status')}
        onClose={() => closeModal('update-status')}
        title="Update Lead Stage"
        subtitle={lead ? `${leadTitle} · Current: ${lead.status || '—'}` : leadTitle}
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('update-status')}>
            <Button variant="primary" onClick={(e) => void updateStatus(e.currentTarget)}>
              Update Stage
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Move to Stage *" full>
          <select ref={statusRef} className="sel" defaultValue={lead?.status || ''}>
            <option value="">Select stage…</option>
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FG>
        <FG label="Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="What happened at this stage?" />
        </FG>
      </SartorModal>
    </>
  );
}
