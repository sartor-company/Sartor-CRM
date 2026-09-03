import { apiClient, cachedGet, listParams, unwrap, invalidateRequestCache } from './client';

export type NamedRef = { _id: string; fullName?: string } | string | null | undefined;

export interface CrmLead {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  lga?: string;
  type?: string;
  status?: string;
  dealSize?: string;
  stores?: number;
  note?: string;
  lat?: number;
  lng?: number;
  locationLabel?: string;
  creationDateTime?: number;
  user?: NamedRef;
  admin?: NamedRef;
  contacts?: Array<{
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  }>;
}

export interface CrmCustomer {
  _id: string;
  customerId?: string;
  status?: string;
  creationDateTime?: number;
  lead?: CrmLead | string | null;
  user?: NamedRef;
}

export interface CrmLpo {
  _id: string;
  lpoId?: string;
  terms?: string;
  status?: string;
  totalAmount?: number;
  totalQuantity?: number;
  creationDateTime?: number;
  lead?: CrmLead | string | null;
  user?: NamedRef;
  admin?: NamedRef;
  products?: Array<{
    _id?: string;
    quantity?: number;
    unitPrice?: number;
    price?: number;
    amount?: number;
    product?: {
      _id?: string;
      productName?: string;
      sku?: string;
      skuCode?: string;
      productSku?: string;
      productId?: string;
      barcodeNumber?: string;
      price?: number;
      unitPrice?: number;
      sellingPrice?: number;
    } | string | null;
  }>;
}

export interface CrmInvoice {
  _id: string;
  invoiceId?: string;
  name?: string;
  status?: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  qrStatus?: string;
  dueDate?: string;
  creationDateTime?: number;
  lead?: CrmLead | string | null;
  lpo?: CrmLpo | string | null;
  user?: NamedRef;
  admin?: NamedRef;
}

export interface DashboardSummary {
  cards: {
    totalCustomers: number;
    totalLpos: number;
    totalSales: number;
    totalProducts: number;
  };
  customerChart?: { monthlyCounts: number[] };
  topRegions?: unknown[];
  revenueChart?: { monthlyRevenue: number[] };
  topProducts?: Array<{
    productName: string;
    unitPrice: number;
    orders: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topSalesReps?: Array<{ name: string; completedTasks: number; image?: string }>;
}

export interface CommissionConfig {
  _id?: string;
  price?: number;
  status?: boolean;
}

export interface CommissionRow extends CrmInvoice {
  commissionID?: string;
  earned?: number;
}

export function refName(ref: NamedRef): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.fullName || '—';
}

/** Prefer staff creator; fall back to account owner when CEO/admin created the LPO. */
export function lpoCreatedBy(lpo: { user?: NamedRef; admin?: NamedRef } | null | undefined): string {
  if (!lpo) return '—';
  const byUser = refName(lpo.user);
  if (byUser !== '—') return byUser;
  return refName(lpo.admin);
}

export function leadName(lead: CrmLead | string | null | undefined): string {
  if (!lead) return '—';
  if (typeof lead === 'string') return lead;
  return lead.name || '—';
}

export function leadCoords(
  lead: CrmLead | string | null | undefined,
): { lat: number; lng: number; label: string } | null {
  if (!lead || typeof lead === 'string') return null;
  const lat = Number(lead.lat);
  const lng = Number(lead.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    label: lead.locationLabel || lead.address || lead.name || 'Pinned location',
  };
}

export const crmApi = {
  dashboard: async () => {
    return cachedGet<DashboardSummary>('/dashboard', undefined, 20_000);
  },

  listLeads: async (search?: string, opts?: { lean?: boolean }) => {
    const data = await cachedGet<{ leads: CrmLead[] }>(
      '/leads',
      listParams(search, opts),
    );
    return data.leads ?? [];
  },

  getLead: async (id: string) => {
    const res = await apiClient.get(`/lead/${id}`);
    return unwrap<CrmLead>(res);
  },

  createLead: async (body: {
    name: string;
    address: string;
    email: string;
    phone?: string;
    state: string;
    type: string;
    stores: number;
    dealSize: string;
    status: string;
    notes?: string;
    lat?: number;
    lng?: number;
    locationLabel?: string;
    contact: Array<{ name: string; email?: string; phone?: string; role?: string }>;
  }) => {
    const res = await apiClient.post('/lead', body);
    invalidateRequestCache('/leads');
    return unwrap<{ lead: CrmLead; contacts: unknown[] }>(res);
  },

  updateLeadStatus: async (id: string, status: string) => {
    const res = await apiClient.put('/lead/status/update', { id, status });
    invalidateRequestCache('/leads');
    invalidateRequestCache('/customers');
    return unwrap(res);
  },

  updateLead: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/lead/edit/${id}`, body);
    invalidateRequestCache('/leads');
    return unwrap(res);
  },

  listCustomers: async (search?: string, opts?: { lean?: boolean }) => {
    const data = await cachedGet<{ customers: CrmCustomer[] }>(
      '/customers',
      listParams(search, opts),
    );
    return data.customers ?? [];
  },

  createLpo: async (body: {
    lead: string;
    terms: string;
    product: Array<{ product: string; quantity: number }>;
  }) => {
    const res = await apiClient.post('/lpo', body);
    invalidateRequestCache('/lpos');
    invalidateRequestCache('/invoices');
    invalidateRequestCache('/dashboard');
    return unwrap<{ lpo?: CrmLpo } & Record<string, unknown>>(res);
  },

  listLpos: async (search?: string, opts?: { lean?: boolean }) => {
    const data = await cachedGet<{ lpos: CrmLpo[] }>(
      '/lpos',
      listParams(search, opts),
    );
    return data.lpos ?? [];
  },

  getLpo: async (id: string) => {
    const res = await apiClient.get(`/lpo/${id}`);
    return unwrap<CrmLpo>(res);
  },

  updateCustomer: async (id: string, body: { status?: string }) => {
    const res = await apiClient.put(`/customer/edit/${id}`, body);
    invalidateRequestCache('/customers');
    return unwrap(res);
  },

  listInvoices: async (search?: string, opts?: { lean?: boolean }) => {
    const data = await cachedGet<{ invoices: CrmInvoice[] }>(
      '/invoices',
      listParams(search, opts),
    );
    return data.invoices ?? [];
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const res = await apiClient.put('/invoice/status/update', { id, status });
    invalidateRequestCache('/invoices');
    return unwrap(res);
  },

  getCommissionConfig: async () => {
    const data = await cachedGet<{ data: CommissionConfig }>('/commission', undefined, 60_000);
    return data.data;
  },

  listUserCommissions: async (userId: string) => {
    const data = await cachedGet<{ commission: CommissionRow[] }>(
      `/commissions/${userId}`,
      listParams(),
    );
    return data.commission ?? [];
  },
};
