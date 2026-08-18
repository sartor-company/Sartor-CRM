import { apiClient, unwrap } from './client';

export interface ApiProduct {
  _id: string;
  productName?: string;
  productId?: string;
  skuCode?: string;
  manufacturer?: string;
  productCategory?: string;
  doraCategory?: string;
  price?: number | string;
  sellingPrice?: number | string;
  supplyPrice?: number | string;
  status?: string;
  totalQuantityAvailable?: number;
  description?: string;
  productImage?: string;
  batchNumber?: string;
  barcodeNumber?: string;
  lastRestock?: unknown;
  batches?: ApiBatch[];
  expiryDate?: string;
  committedQuantity?: number;
  totalQuantityIn?: number;
  reorderLevel?: number;
  brandOwner?: string;
  countryOfOrigin?: string;
  licenceNumber?: string;
  defaultPurchasePrice?: number | string;
  warehouse?: { _id: string; name?: string } | string | null;
  warehouseLabel?: string;
  regulatoryLicences?: Array<{ authority?: string; number?: string; country?: string }>;
}

export interface ApiBatch {
  _id: string;
  batchNumber?: string;
  quantity?: number;
  quantityReceived?: number;
  manufactureDate?: number;
  expiryDate?: number;
  status?: string;
  invoiceNumber?: string;
  supplyPrice?: number | string;
  sellingPrice?: number | string;
  supplier?: { _id?: string; name?: string } | string | null;
  warehouse?: { _id?: string; name?: string } | string | null;
}

export interface ApiSupplier {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  contactRole?: string;
  contactNumber?: string;
  address?: string;
  branch?: string;
  product?: string;
  products?: unknown[];
  restocks?: unknown[];
  creationDateTime?: number;
  createdAt?: string;
}

export interface ApiRestockProduct {
  _id?: string;
  product?: ApiProduct | string;
  quantity?: string | number;
  supplyPrice?: number | string;
  sellingPrice?: number | string;
}

export type CrmProduct = ApiProduct;
export type CrmSupplier = ApiSupplier;

export interface ApiRestock {
  _id: string;
  supplier?: ApiSupplier | string | null;
  products?: ApiRestockProduct[];
  creationDateTime?: number;
  createdAt?: string;
  admin?: unknown;
  warehouse?: { _id: string; name?: string } | string | null;
  invoiceRef?: string;
  user?: { _id: string; fullName?: string } | string | null;
  status?: string;
  expectedQuantity?: number;
}

export interface ApiStock {
  _id: string;
  status?: string;
  level?: number | string;
  lastStock?: number | string;
  price?: number | string;
  product?: ApiProduct | string | null;
  customer?: unknown;
  user?: unknown;
}

function listParams(search?: string) {
  return { limit: 'all' as const, ...(search ? { search } : {}) };
}

export const catalogApi = {
  listProducts: async (search?: string) => {
    const res = await apiClient.get('/products', { params: listParams(search) });
    const data = unwrap<{ data: ApiProduct[] }>(res);
    return data.data ?? [];
  },

  getProduct: async (id: string) => {
    const res = await apiClient.get(`/product/${id}`);
    return unwrap<ApiProduct>(res);
  },

  createProduct: async (body: Record<string, unknown>) => {
    const res = await apiClient.post('/product', body);
    return unwrap<ApiProduct>(res);
  },

  updateProduct: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/product/edit/${id}`, body);
    return unwrap<ApiProduct>(res);
  },

  listSuppliers: async (search?: string) => {
    const res = await apiClient.get('/suppliers', { params: listParams(search) });
    const data = unwrap<{ data: ApiSupplier[] }>(res);
    return data.data ?? [];
  },

  createSupplier: async (body: {
    name: string;
    email: string;
    phone?: string;
    contactName?: string;
    contactRole?: string;
    contactNumber?: string;
    address?: string;
    branch?: string;
  }) => {
    const res = await apiClient.post('/supplier', body);
    return unwrap<ApiSupplier>(res);
  },

  updateSupplier: async (id: string, body: Record<string, unknown>) => {
    const res = await apiClient.put(`/supplier/edit/${id}`, body);
    return unwrap<ApiSupplier>(res);
  },

  listRestocks: async (search?: string) => {
    const res = await apiClient.get('/restocks', { params: listParams(search) });
    const data = unwrap<{ data: ApiRestock[] }>(res);
    return data.data ?? [];
  },

  getRestock: async (id: string) => {
    const res = await apiClient.get(`/restock/${id}`);
    return unwrap<ApiRestock>(res);
  },

  createRestock: async (body: {
    supplier: string;
    warehouse?: string;
    invoiceRef?: string;
    products: Array<{ product: string; quantity: string | number }>;
  }) => {
    const res = await apiClient.post('/restock', body);
    return unwrap<{ restock: ApiRestock; restockProducts: ApiRestockProduct[] }>(res);
  },

  listStocks: async (search?: string) => {
    const res = await apiClient.get('/stocks', { params: listParams(search) });
    const data = unwrap<{ data: ApiStock[] }>(res);
    return data.data ?? [];
  },

  listCompanyStocks: async (search?: string) => {
    const res = await apiClient.get('/stocks/company', { params: listParams(search) });
    const data = unwrap<{ data: ApiStock[] }>(res);
    return data.data ?? [];
  },
};
