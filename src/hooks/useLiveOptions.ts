import { useEffect, useMemo, useState } from 'react';
import { catalogApi, type ApiProduct, type ApiSupplier } from '../api/catalog';
import { crmApi, leadName, type CrmCustomer, type CrmInvoice, type CrmLead } from '../api/crm';
import { opsApi, type OpsDriver, type OpsWarehouse } from '../api/ops';
import { useAuthStore } from '../store/authStore';

export function productLabel(p: ApiProduct) {
  const sku = p.skuCode || p.productId || p._id.slice(-6);
  return `${sku} — ${p.productName || 'Product'}`;
}

export function productSku(p: ApiProduct) {
  return p.skuCode || p.productId || p._id.slice(-6);
}

type LiveOptionsData = {
  products: ApiProduct[];
  suppliers: ApiSupplier[];
  warehouses: OpsWarehouse[];
  drivers: OpsDriver[];
  invoices: CrmInvoice[];
  leads: CrmLead[];
  customers: CrmCustomer[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 60_000;
const listeners = new Set<() => void>();

let cache: LiveOptionsData | null = null;
let inflight: Promise<LiveOptionsData> | null = null;
let loading = false;

function notify() {
  listeners.forEach((fn) => fn());
}

function uniqueCustomers(customers: CrmCustomer[]) {
  const seen = new Set<string>();
  const rows: CrmCustomer[] = [];
  for (let i = customers.length - 1; i >= 0; i -= 1) {
    const c = customers[i];
    const leadId = typeof c.lead === 'object' && c.lead ? c.lead._id : c.lead;
    const key = String(leadId || c._id);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(c);
  }
  return rows.reverse();
}

async function fetchLiveOptions(force = false): Promise<LiveOptionsData> {
  const token = useAuthStore.getState().token;
  if (!token) {
    const empty: LiveOptionsData = {
      products: [],
      suppliers: [],
      warehouses: [],
      drivers: [],
      invoices: [],
      leads: [],
      customers: [],
      fetchedAt: Date.now(),
    };
    cache = empty;
    return empty;
  }

  if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }
  if (inflight) return inflight;

  loading = true;
  notify();

  inflight = Promise.all([
    catalogApi.listProducts(undefined, { lean: true }).catch(() => [] as ApiProduct[]),
    catalogApi.listSuppliers(undefined, { lean: true }).catch(() => [] as ApiSupplier[]),
    opsApi.listWarehouses().catch(() => [] as OpsWarehouse[]),
    opsApi.listDrivers().catch(() => [] as OpsDriver[]),
    crmApi.listInvoices(undefined, { lean: true }).catch(() => [] as CrmInvoice[]),
    crmApi.listLeads(undefined, { lean: true }).catch(() => [] as CrmLead[]),
    crmApi.listCustomers(undefined, { lean: true }).catch(() => [] as CrmCustomer[]),
  ])
    .then(([products, suppliers, warehouses, drivers, invoices, leads, customers]) => {
      cache = {
        products,
        suppliers,
        warehouses,
        drivers,
        invoices,
        leads,
        customers,
        fetchedAt: Date.now(),
      };
      return cache;
    })
    .finally(() => {
      inflight = null;
      loading = false;
      notify();
    });

  return inflight;
}

/** Invalidate shared modal/options cache (call after create/update mutations). */
export function invalidateLiveOptions() {
  cache = null;
}

export function refreshLiveOptions() {
  return fetchLiveOptions(true);
}

/**
 * Shared dropdown/options data for modals.
 * Dedupes in-flight requests and caches for 60s so mounting many modal groups
 * does not spam the API with duplicate limit=all fetches.
 */
export function useLiveOptions(enabled = true) {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const onChange = () => bump((n) => n + 1);
    listeners.add(onChange);
    void fetchLiveOptions(false);
    return () => {
      listeners.delete(onChange);
    };
  }, [enabled]);

  const data = cache;
  const products = data?.products ?? [];
  const suppliers = data?.suppliers ?? [];
  const warehouses = data?.warehouses ?? [];
  const drivers = data?.drivers ?? [];
  const invoices = data?.invoices ?? [];
  const leads = data?.leads ?? [];
  const customersRaw = data?.customers ?? [];

  const customers = useMemo(() => uniqueCustomers(customersRaw), [customersRaw]);

  const customerOptions = useMemo(() => {
    const convertedLeadIds = new Set(
      customers
        .map((c) => (typeof c.lead === 'object' && c.lead ? c.lead._id : c.lead))
        .filter(Boolean)
        .map(String),
    );
    return [
      ...customers.map((c) => ({
        id: c._id,
        label:
          (typeof c.lead === 'object' && c.lead ? leadName(c.lead) : null) ||
          c.customerId ||
          c._id.slice(-6),
        kind: 'customer' as const,
      })),
      ...leads
        .filter((l) => !convertedLeadIds.has(l._id))
        .map((l) => ({
          id: l._id,
          label: `${l.name || 'Lead'}${l.state ? ` — ${l.state}` : ''}`,
          kind: 'lead' as const,
        })),
    ];
  }, [customers, leads]);

  return {
    products,
    suppliers,
    warehouses,
    drivers,
    invoices,
    leads,
    customers,
    customerOptions,
    loading: enabled && loading && !data,
  };
}
