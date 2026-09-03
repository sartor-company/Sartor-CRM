import { apiClient, cachedGet, listParams, unwrap, invalidateRequestCache } from './client';

export interface OpsWarehouse {
  _id: string;
  name: string;
  address: string;
  state?: string;
  lga?: string;
  status?: string;
  manager?: { _id: string; fullName?: string; role?: string } | string | null;
  staff?: Array<{ _id: string; fullName?: string; role?: string }>;
  skuCount?: number;
  totalUnits?: number;
  creationDateTime?: number;
}

export interface OpsDriver {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  plate: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licenceNo?: string;
  licenceExpiry?: string;
  status?: string;
  warehouse?: { _id: string; name?: string } | string | null;
  activeLpo?: { _id: string; lpoId?: string; status?: string } | string | null;
}

export interface OpsVisit {
  _id: string;
  storeName: string;
  address?: string;
  category?: string;
  visitDate?: number;
  merchandiser?: { _id: string; fullName?: string } | string | null;
  skusFound?: number;
  skusTotal?: number;
  skusOos?: number;
  competitors?: string;
  photoCount?: number;
  notes?: string;
  lat?: number;
  lng?: number;
  products?: Array<{ label?: string; found?: boolean; qty?: number }>;
  creationDateTime?: number;
}

export interface OpsIntel {
  _id: string;
  storeName: string;
  category?: string;
  competitor?: string;
  observation: string;
  severity?: string;
  reportedBy?: { _id: string; fullName?: string } | string | null;
  reportDate?: number;
  photoCount?: number;
  creationDateTime?: number;
}

export interface OpsReturn {
  _id: string;
  returnId?: string;
  customerName?: string;
  invoiceId?: string;
  reason: string;
  condition?: string;
  skus?: string;
  amount?: number;
  status?: string;
  creditNote?: string;
  creationDateTime?: number;
  lead?: { _id: string; name?: string } | string | null;
  invoice?: { _id: string; invoiceId?: string } | string | null;
}

export interface OpsRecon {
  _id: string;
  sku?: string;
  productName?: string;
  systemQty?: number;
  physicalQty?: number;
  variance?: number;
  status?: string;
  notes?: string;
  countDate?: number;
  creationDateTime?: number;
  warehouse?: { _id: string; name?: string } | string | null;
}

export interface OpsReorderAlert {
  productId: string;
  sku: string;
  name: string;
  stock: number;
  reorderLevel: number;
  pct: number;
  alert: 'Critical' | 'Low Stock' | string;
  replenishment?: { _id: string; status: string; requestedQty: number } | null;
}

export interface OpsLpoRow {
  _id: string;
  lpoId?: string;
  status?: string;
  terms?: string;
  totalAmount?: number;
  totalQuantity?: number;
  skuCount?: number;
  packedAt?: number;
  assignedAt?: number;
  deliveryCode?: string;
  creationDateTime?: number;
  lead?: { _id?: string; name?: string; state?: string; address?: string; lat?: number; lng?: number } | string | null;
  user?: { _id: string; fullName?: string } | string | null;
  packedBy?: { _id: string; fullName?: string } | string | null;
  driver?: { _id: string; name?: string; plate?: string; phone?: string } | string | null;
  warehouse?: { _id: string; name?: string } | string | null;
}

export interface OpsFinanceInvoice {
  _id: string;
  invoiceId?: string;
  name?: string;
  status?: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  isFirstInvoice?: boolean;
  lead?: { _id?: string; name?: string; address?: string; lat?: number; lng?: number } | string | null;
  user?: { _id: string; fullName?: string } | string | null;
  creationDateTime?: number;
}

function listData<T>(res: { data: { message: string; status: boolean; data: { data: T[] } } }): T[] {
  return unwrap<{ data: T[] }>(res).data ?? [];
}

export const opsApi = {
  listWarehouses: async () => {
    return cachedGet<{ data: OpsWarehouse[] }>('/warehouses', listParams(undefined, { lean: true }), 45_000).then(
      (d) => d.data ?? [],
    );
  },
  getWarehouseInventory: async (id: string) => {
    const res = await apiClient.get(`/warehouse/${id}/inventory`);
    return unwrap<{
      warehouse: { _id: string; name?: string };
      skuCount: number;
      totalUnits: number;
      lowStock: number;
      outOfStock: number;
      items: Array<{
        productId: string;
        sku: string;
        productName: string;
        available: number;
        reorderLevel: number;
        status: string;
        batches: Array<{ _id: string; batchNumber?: string; quantity: number; expiryDate?: number; status?: string }>;
      }>;
    }>(res);
  },
  createWarehouse: async (body: {
    name: string;
    address: string;
    state?: string;
    lga?: string;
    status?: string;
  }) => {
    const res = await apiClient.post('/warehouse', body);
    invalidateRequestCache('/warehouses');
    return unwrap(res);
  },

  listDrivers: async () => {
    return cachedGet<{ data: OpsDriver[] }>('/drivers', listParams(undefined, { lean: true }), 45_000).then(
      (d) => d.data ?? [],
    );
  },
  createDriver: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/driver', body);
    invalidateRequestCache('/drivers');
    return unwrap(res);
  },
  updateDriver: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/driver/edit/${id}`, body);
    invalidateRequestCache('/drivers');
    return unwrap(res);
  },
  assignDriverLpo: async (driverId: string, lpoId: string) => {
    const res = await apiClient.post('/driver/assign-lpo', { driverId, lpoId });
    invalidateRequestCache('/drivers');
    return unwrap(res);
  },
  unassignDriver: async (id: string) => {
    const res = await apiClient.post(`/driver/${id}/unassign`);
    invalidateRequestCache('/drivers');
    return unwrap(res);
  },

  listVisits: async (mine = false) => {
    const res = await apiClient.get('/visits', { params: mine ? { mine: '1' } : {} });
    return listData<OpsVisit>(res);
  },
  createVisit: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/visit', body);
    return unwrap(res);
  },

  listIntel: async () => {
    const res = await apiClient.get('/intel');
    return listData<OpsIntel>(res);
  },
  createIntel: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/intel', body);
    return unwrap(res);
  },

  listReturns: async () => {
    const res = await apiClient.get('/returns');
    return listData<OpsReturn>(res);
  },
  createReturn: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/return', body);
    return unwrap(res);
  },
  updateReturn: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/return/edit/${id}`, body);
    return unwrap(res);
  },

  listRecons: async () => {
    const res = await apiClient.get('/recons');
    return listData<OpsRecon>(res);
  },
  createRecon: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/recon', body);
    return unwrap(res);
  },

  reorderAlerts: async () => {
    const res = await apiClient.get('/reorder-alerts');
    return unwrap<{ data: OpsReorderAlert[]; pendingRequests: number }>(res);
  },
  createReplenishment: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/replenishment', body);
    return unwrap(res);
  },

  packQueue: async () => {
    const res = await apiClient.get('/lpos/pack-queue');
    return listData<OpsLpoRow>(res);
  },
  packLpo: async (id: string, warehouse?: string) => {
    const res = await apiClient.post(`/lpo/${id}/pack`, warehouse ? { warehouse } : {});
    return unwrap(res);
  },
  dispatchQueue: async () => {
    const res = await apiClient.get('/lpos/dispatch-queue');
    return listData<OpsLpoRow>(res);
  },
  dispatchLpo: async (id: string, driverId?: string) => {
    const res = await apiClient.post(`/lpo/${id}/dispatch`, driverId ? { driverId } : {});
    return unwrap(res);
  },
  listDeliveries: async (mine = false) => {
    const res = await apiClient.get('/deliveries', { params: mine ? { mine: '1' } : {} });
    return listData<OpsLpoRow>(res);
  },
  confirmDelivery: async (id: string, body?: { deliveryCode?: string; deliveredTo?: string }) => {
    const res = await apiClient.post(`/lpo/${id}/confirm-delivery`, body || {});
    return unwrap(res);
  },

  financeQueue: async () => {
    const res = await apiClient.get('/finance/queue');
    return listData<OpsFinanceInvoice>(res);
  },
};
