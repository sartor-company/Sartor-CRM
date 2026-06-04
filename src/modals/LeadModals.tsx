import { LocationCardSection } from '../components/location/LocationCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoBanner } from '../components/ui/InfoBanner';
import { SartorModal } from '../components/ui/SartorModal';
import { RoleGate } from '../components/ui/RoleGate';
import { useApp } from '../context/AppContext';
import { useRoleGates } from '../hooks/useRoleGates';
import { ROLE_META } from '../constants/roles';
import { FG, FRow, IRow, ModalFooterActions, SDivLabel, useModalActions } from './helpers';

const BUSINESS_CATEGORIES = [
  'FMCG-Retail / Supermarket',
  'FMCG-Wholesale',
  'Pharma-Retail',
  'Pharma-Wholesale',
  'Hospital / Clinic',
];

const STAFF_OPTIONS = [
  'Abubakar Idah (Admin)',
  'Emmanuel Batimehin (Rep)',
  'Samuel Okon (Rep)',
];

export function LeadModals() {
  const { isOpen, closeModal, openModal, handleSubmit } = useModalActions();
  const { role } = useApp();
  const { showCeoAdmin } = useRoleGates();
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
            <Button
              variant="green"
              onClick={(e) => handleSubmit('add-lead', e.currentTarget, 'Lead saved successfully.')}
            >
              Save Lead
            </Button>
          </ModalFooterActions>
        }
      >
        <SDivLabel style={{ marginTop: 0 }}>Business Details</SDivLabel>
        <FRow>
          <FG label="Business / Store Name *" className="w50">
            <input className="inp" placeholder="e.g. FreshMart NG" />
          </FG>
          <FG label="Business Category *" className="w50">
            <select className="sel" defaultValue="">
              <option value="">Select…</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FG>
        </FRow>
        <SDivLabel>Business Address</SDivLabel>
        <FG label="Street Address *" full style={{ marginBottom: 10 }}>
          <input className="inp" placeholder="e.g. Plot 12, Gimbiya Street" />
        </FG>
        <FRow>
          <FG label="State *">
            <select className="sel" defaultValue="">
              <option value="">State…</option>
              <option>FCT — Abuja</option>
              <option>Lagos</option>
              <option>Kano</option>
              <option>Rivers</option>
              <option>Oyo</option>
              <option>Kaduna</option>
            </select>
          </FG>
          <FG label="LGA *">
            <input className="inp" placeholder="e.g. Garki" />
          </FG>
          <FG label="Postal Code">
            <input className="inp" placeholder="900001" />
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
              <input className="inp" placeholder="Contact's full name" />
            </FG>
            <FG label="Role at Business *" className="w50">
              <select className="sel" defaultValue="">
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
              <input className="inp" type="tel" placeholder="+234…" />
            </FG>
            <FG label="Email" className="w50">
              <input className="inp" type="email" placeholder="email@business.com" />
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
                {STAFF_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FG>
            <FG label="Initial Stage" className="w50">
              <select className="sel" defaultValue="New">
                <option>New</option>
                <option>Contact Made</option>
                <option>Qualifying</option>
              </select>
            </FG>
          </FRow>
        </RoleGate>
        <RoleGate show={!showCeoAdmin}>
          <InfoBanner>
            Lead will be auto-assigned to <strong>{ROLE_META[role].name}</strong>. Only CEO and
            Admin can reassign leads.
          </InfoBanner>
        </RoleGate>
        <FG label="Notes" full style={{ marginTop: 4 }}>
          <textarea className="ta" rows={2} placeholder="Additional context…" />
        </FG>
      </SartorModal>

      <SartorModal
        id="lead-detail"
        open={isOpen('lead-detail')}
        onClose={() => closeModal('lead-detail')}
        title="FreshMart NG"
        subtitle="Lead · FMCG-Retail · Contact Made"
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
                  openModal('reassign-lead');
                }}
              >
                Reassign
              </Button>
            </RoleGate>
            <Button
              variant="outline"
              onClick={() => {
                closeModal('lead-detail');
                openModal('update-status');
              }}
            >
              Update Stage
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                closeModal('lead-detail');
                openModal('create-lpo');
              }}
            >
              Create LPO
            </Button>
          </>
        }
      >
        <IRow label="Business" value="FreshMart NG" />
        <IRow label="Address" value="31 Garki Market Rd, Garki, FCT — Abuja" />
        <SDivLabel style={{ marginTop: 0 }}>Contacts</SDivLabel>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--brd)',
            borderRadius: 7,
            padding: '10px 12px',
            fontSize: 13,
          }}
        >
          <strong>Adebisi Olawale</strong>{' '}
          <Badge variant="teal" style={{ fontSize: 10, marginLeft: 6 }}>
            Procurement Manager
          </Badge>
          <br />
          <span style={{ color: 'var(--tx3)' }}>
            +234 802 334 5567 · procurement@freshmart.ng
          </span>
        </div>
        <div className="sdiv" />
        <IRow label="Stage" value={<Badge variant="teal">Contact Made</Badge>} />
        <IRow label="Assigned To" value="Abubakar Idah (Admin)" />
        <IRow label="LPOs" value="1 — LPO-0042 (Dispatched)" />
        <div className="sdiv" />
        <SDivLabel>Location Pin</SDivLabel>
        <LocationCardSection context="lead" />
      </SartorModal>

      <SartorModal
        id="reassign-lead"
        open={isOpen('reassign-lead')}
        onClose={() => closeModal('reassign-lead')}
        title="Assign / Reassign Lead"
        subtitle="FreshMart NG"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('reassign-lead')}>
            <Button
              variant="primary"
              onClick={(e) =>
                handleSubmit('reassign-lead', e.currentTarget, 'Lead assignment updated.')
              }
            >
              Confirm Assignment
            </Button>
          </ModalFooterActions>
        }
      >
        <IRow label="Currently" value="Abubakar Idah (Admin)" />
        <FG label="Assign To *" full style={{ marginTop: 10 }}>
          <select className="sel" defaultValue="">
            <option value="">Select staff…</option>
            {STAFF_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option>Unassigned</option>
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
        subtitle="FreshMart NG · Current: Contact Made"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => closeModal('update-status')}>
            <Button
              variant="primary"
              onClick={(e) => handleSubmit('update-status', e.currentTarget, 'Lead stage updated.')}
            >
              Update Stage
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Move to Stage *" full>
          <select className="sel" defaultValue="">
            <option value="">Select stage…</option>
            <option>New</option>
            <option>Contact Made</option>
            <option>Qualifying</option>
            <option>Negotiation</option>
            <option>LPO Raised</option>
            <option>Delivered</option>
          </select>
        </FG>
        <FG label="Notes" full style={{ marginTop: 10 }}>
          <textarea className="ta" rows={2} placeholder="What happened at this stage?" />
        </FG>
      </SartorModal>
    </>
  );
}
