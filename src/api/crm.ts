import { apiClient, unwrap } from './client';

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

function listParams(search?: string) {
  return { limit: 'all' as const, ...(search ? { search } : {}) };
}

export function refName(ref: NamedRef): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.fullName || '—';
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
    const res = await apiClient.get('/dashboard');
    return unwrap<DashboardSummary>(res);
  },

  listLeads: async (search?: string) => {
    const res = await apiClient.get('/leads', { params: listParams(search) });
    const data = unwrap<{ leads: CrmLead[] }>(res);
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
    return unwrap<{ lead: CrmLead; contacts: unknown[] }>(res);
  },

  updateLeadStatus: async (id: string, status: string) => {
    const res = await apiClient.put('/lead/status/update', { id, status });
    return unwrap(res);
  },

  updateLead: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/lead/edit/${id}`, body);
    return unwrap(res);
  },

  listCustomers: async (search?: string) => {
    const res = await apiClient.get('/customers', { params: listParams(search) });
    const data = unwrap<{ customers: CrmCustomer[] }>(res);
    return data.customers ?? [];
  },

  createLpo: async (body: {
    lead: string;
    terms: string;
    product: Array<{ product: string; quantity: number }>;
  }) => {
    const res = await apiClient.post('/lpo', body);
    return unwrap<{ lpo?: CrmLpo } & Record<string, unknown>>(res);
  },

  listLpos: async (search?: string) => {
    const res = await apiClient.get('/lpos', { params: listParams(search) });
    const data = unwrap<{ lpos: CrmLpo[] }>(res);
    return data.lpos ?? [];
  },

  listInvoices: async (search?: string) => {
    const res = await apiClient.get('/invoices', { params: listParams(search) });
    const data = unwrap<{ invoices: CrmInvoice[] }>(res);
    return data.invoices ?? [];
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const res = await apiClient.put('/invoice/status/update', { id, status });
    return unwrap(res);
  },

  getCommissionConfig: async () => {
    const res = await apiClient.get('/commission');
    const data = unwrap<{ data: CommissionConfig }>(res);
    return data.data;
  },

  listUserCommissions: async (userId: string) => {
    const res = await apiClient.get(`/commissions/${userId}`, { params: { limit: 'all' } });
    const data = unwrap<{ commission: CommissionRow[] }>(res);
    return data.commission ?? [];
  },
};
