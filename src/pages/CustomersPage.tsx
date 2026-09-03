import { useEffect, useMemo, useState } from 'react';
import { Button, DataTable, InfoBanner, Mono, PageHead, SearchBar } from '../components/ui';
import { Icon } from '../components/ui/Icon';
import { RoleGate } from '../components/ui/RoleGate';
import { SartorModal } from '../components/ui/SartorModal';
import {
  crmApi,
  leadCoords,
  leadName,
  type CrmCustomer,
  type CrmInvoice,
  type CrmLpo,
} from '../api/crm';
import { useLocation } from '../context/LocationContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery } from '../hooks/useApiQuery';
import { useRoleGates } from '../hooks/useRoleGates';
import { useTableFilter } from '../hooks/useTableFilter';
import { formatDate, formatNaira, num } from '../utils/format';
import { FG, ModalFooterActions } from '../modals/helpers';

function leadOf(c: CrmCustomer) {
  return typeof c.lead === 'object' && c.lead ? c.lead : null;
}

function refId(ref: { _id: string } | string | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === 'string' ? ref : ref._id || null;
}

function invoiceAmount(inv: CrmInvoice) {
  return num(inv.totalAmount);
}

function isPaid(inv: CrmInvoice) {
  const s = String(inv.status || '').toLowerCase();
  return s === 'paid' || s === 'payment confirmed' || s === 'confirmed paid';
}

function isCancelled(inv: CrmInvoice) {
  return String(inv.status || '').toLowerCase() === 'cancelled';
}

function CustomerGpsButton({ customer }: { customer: CrmCustomer }) {
  const { pins, navigateTo } = useLocation();
  const { showToast } = useToast();
  const lead = leadOf(customer);
  const stored = leadCoords(lead);
  const live = lead?._id ? pins[`lead:${lead._id}`] : undefined;
  const pin = stored ?? (live ? { lat: live.lat, lng: live.lng } : null);

  return (
    <button
      type="button"
      className="nav-btn nav-btn-sml"
      title={pin ? 'Navigate to pinned customer location' : 'No GPS pin yet'}
      onClick={() => {
        if (!pin) {
          showToast('No location pinned for this customer yet. Pin it from the lead record.', 'warn');
          return;
        }
        navigateTo(pin.lat, pin.lng);
      }}
    >
      <Icon name="compass" size={14} />
    </button>
  );
}

export default function CustomersPage() {
  const { openModal } = useModal();
  const { showCustEdit } = useRoleGates();
  const { showToast } = useToast();
  const [editCustomer, setEditCustomer] = useState<CrmCustomer | null>(null);
  const [editStatus, setEditStatus] = useState('Active');
  const [saving, setSaving] = useState(false);
  const { data, loading, error, reload } = useApiQuery(async () => {
    const [customers, invoices, lpos] = await Promise.all([
      crmApi.listCustomers(),
      crmApi.listInvoices().catch(() => [] as CrmInvoice[]),
      crmApi.listLpos().catch(() => [] as CrmLpo[]),
    ]);
    return { customers, invoices, lpos };
  }, []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener('crm-leads-changed', onChange);
    return () => window.removeEventListener('crm-leads-changed', onChange);
  }, [reload]);

  const customers = useMemo(() => {
    const rows = data?.customers ?? [];
    const seen = new Set<string>();
    const unique: CrmCustomer[] = [];
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const c = rows[i];
      const leadId = typeof c.lead === 'object' && c.lead ? c.lead._id : c.lead;
      const key = String(leadId || c._id);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(c);
    }
    return unique.reverse();
  }, [data?.customers]);
  const invoices = data?.invoices ?? [];
  const lpos = data?.lpos ?? [];

  const statsByLead = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number; outstanding: number }>();
    const bump = (id: string | null) => {
      if (!id) return { orders: 0, revenue: 0, outstanding: 0 };
      const row = map.get(id) ?? { orders: 0, revenue: 0, outstanding: 0 };
      map.set(id, row);
      return row;
    };
    for (const lpo of lpos) {
      bump(refId(lpo.lead)).orders += 1;
    }
    for (const inv of invoices) {
      if (isCancelled(inv)) continue;
      const row = bump(refId(inv.lead));
      const amt = invoiceAmount(inv);
      row.revenue += amt;
      if (!isPaid(inv)) row.outstanding += amt;
    }
    return map;
  }, [invoices, lpos]);

  const { search, setSearch, filtered } = useTableFilter(customers, '', (row, q) => {
    const lead = leadOf(row);
    return [leadName(lead), lead?.type, lead?.state, lead?.lga, row.customerId]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <>
      <PageHead
        title="Customers"
        subtitle="Converted accounts. A lead becomes a customer once, when the deal is closed won or payment is confirmed."
        actions={
          <Button variant="secondary" size="sm" onClick={() => showToast('Exporting customers…', 'ok')}>
            Export
          </Button>
        }
      />

      {error && (
        <InfoBanner variant="err" style={{ marginBottom: 12 }}>
          {error}{' '}
          <button type="button" className="ca" onClick={() => void reload()}>
            Retry
          </button>
        </InfoBanner>
      )}

      <SearchBar
        placeholder="Search customers by name, location or category…"
        value={search}
        onChange={setSearch}
      />

      <DataTable id="cust-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Category</th>
            <th>Location</th>
            <th>Converted</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Outstanding</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                Loading customers…
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: 'var(--tx3)' }}>
                No customers found.
              </td>
            </tr>
          ) : (
            filtered.map((c) => {
              const lead = leadOf(c);
              const stats = statsByLead.get(lead?._id || '') ?? { orders: 0, revenue: 0, outstanding: 0 };
              return (
                <tr key={c._id}>
                  <td>
                    <strong>{leadName(lead)}</strong>
                  </td>
                  <td>{lead?.type || '—'}</td>
                  <td>{[lead?.lga, lead?.state].filter(Boolean).join(', ') || '—'}</td>
                  <td>{formatDate(c.creationDateTime)}</td>
                  <td>{stats.orders}</td>
                  <td>
                    <Mono>{formatNaira(stats.revenue)}</Mono>
                  </td>
                  <td>
                    <Mono style={{ color: stats.outstanding > 0 ? 'var(--at)' : 'var(--Gd)' }}>
                      {formatNaira(stats.outstanding)}
                    </Mono>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <RoleGate show={showCustEdit}>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setEditCustomer(c);
                            setEditStatus(c.status === 'In-active' ? 'In-active' : 'Active');
                          }}
                        >
                          Edit
                        </Button>
                      </RoleGate>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openModal('customer-statement', { customer: c })}
                      >
                        Statement
                      </Button>
                      <CustomerGpsButton customer={c} />
                      <Button
                        variant="green"
                        size="xs"
                        onClick={() => openModal('create-lpo', { customer: c })}
                      >
                        New LPO
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openModal('goods-return', { customer: c })}
                      >
                        Return
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTable>

      <SartorModal
        id="edit-customer"
        open={Boolean(editCustomer)}
        onClose={() => setEditCustomer(null)}
        title={editCustomer ? `Edit Customer — ${leadName(leadOf(editCustomer))}` : 'Edit Customer'}
        subtitle="Only CEO and Admin can change customer records"
        size="narrow"
        footer={
          <ModalFooterActions onCancel={() => setEditCustomer(null)}>
            <Button
              variant="green"
              disabled={saving || !editCustomer}
              onClick={async (e) => {
                if (!editCustomer || saving) return;
                const btn = e.currentTarget;
                setSaving(true);
                btn.disabled = true;
                try {
                  await crmApi.updateCustomer(editCustomer._id, { status: editStatus });
                  showToast('Customer updated.', 'ok');
                  setEditCustomer(null);
                  void reload();
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Update failed', 'err');
                } finally {
                  setSaving(false);
                  btn.disabled = false;
                }
              }}
            >
              Save Changes
            </Button>
          </ModalFooterActions>
        }
      >
        <FG label="Status" full>
          <select className="sel" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="In-active">In-active</option>
          </select>
        </FG>
      </SartorModal>
    </>
  );
}
