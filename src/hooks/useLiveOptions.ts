import { useEffect, useState } from 'react';
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

export function useLiveOptions(enabled = true) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [warehouses, setWarehouses] = useState<OpsWarehouse[]>([]);
  const [drivers, setDrivers] = useState<OpsDriver[]>([]);
  const [invoices, setInvoices] = useState<CrmInvoice[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const token = useAuthStore.getState().token;
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      catalogApi.listProducts().catch(() => [] as ApiProduct[]),
      catalogApi.listSuppliers().catch(() => [] as ApiSupplier[]),
      opsApi.listWarehouses().catch(() => [] as OpsWarehouse[]),
      opsApi.listDrivers().catch(() => [] as OpsDriver[]),
      crmApi.listInvoices().catch(() => [] as CrmInvoice[]),
      crmApi.listLeads().catch(() => [] as CrmLead[]),
      crmApi.listCustomers().catch(() => [] as CrmCustomer[]),
    ]).then(([prods, sups, whs, drvs, invs, lds, custs]) => {
      if (cancelled) return;
      setProducts(prods);
      setSuppliers(sups);
      setWarehouses(whs);
      setDrivers(drvs);
      setInvoices(invs);
      setLeads(lds);
      setCustomers(custs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const customerOptions = [
    ...customers.map((c) => ({
      id: c._id,
      label:
        (typeof c.lead === 'object' && c.lead ? leadName(c.lead) : null) ||
        c.customerId ||
        c._id.slice(-6),
      kind: 'customer' as const,
    })),
    ...leads.map((l) => ({
      id: l._id,
      label: `${l.name || 'Lead'}${l.state ? ` — ${l.state}` : ''}`,
      kind: 'lead' as const,
    })),
  ];

  return {
    products,
    suppliers,
    warehouses,
    drivers,
    invoices,
    leads,
    customers,
    customerOptions,
    loading,
  };
}
