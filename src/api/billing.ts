import { apiClient, unwrap } from './client';

export interface PlatformInvoiceLine {
  desc?: string;
  amt?: number;
  type?: string;
}

export interface PlatformInvoice {
  _id: string;
  invoiceId?: string;
  clientCode?: string;
  clientName?: string;
  description?: string;
  lineItems?: PlatformInvoiceLine[];
  amount?: number;
  currency?: string;
  status?: 'Pending' | 'Due Soon' | 'Overdue' | 'Paid' | 'Cancelled' | string;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  creditType?: 'sms' | 'pin' | 'batch' | 'sku' | string;
  creditQuantity?: number;
}

export interface PaymentDetails {
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  bankAccounts?: Array<{
    currency?: string;
    bank?: string;
    accountName?: string;
    accountNumber?: string;
    status?: string;
  }>;
}

export interface CreditBundle {
  id: string;
  title: string;
  quantity: number;
  amount: number;
  unitPrice: number;
  blurb?: string;
}

export interface CreditPackages {
  bundles: {
    pin: CreditBundle[];
    sms: CreditBundle[];
    batch: CreditBundle[];
  };
  packages: {
    pin: { label: string; unit: string; pricePerUnit: number; min: number; step: number };
    sms: { label: string; unit: string; pricePerUnit: number; min: number; step: number };
    batch: { label: string; unit: string; pricePerUnit: number; min: number; step: number };
  };
}

export const billingApi = {
  listInvoices: async (status?: string) => {
    const res = await apiClient.get('/billing/invoices', {
      params: status ? { status } : undefined,
    });
    const data = unwrap<{ data: PlatformInvoice[] }>(res);
    return data.data ?? [];
  },

  getPaymentDetails: async () => {
    const res = await apiClient.get('/billing/payment-details');
    return unwrap<PaymentDetails>(res);
  },

  payInvoice: async (id: string) => {
    const res = await apiClient.post(`/billing/invoices/${id}/pay`);
    return unwrap<
      | { manual: true; invoiceId: string }
      | { authorization_url?: string; access_code?: string; reference?: string }
    >(res);
  },

  listCreditPackages: async () => {
    const res = await apiClient.get('/billing/credit-packages');
    return unwrap<CreditPackages>(res);
  },
};
