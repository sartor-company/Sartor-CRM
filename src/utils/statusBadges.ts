import type { BadgeVariant } from '../types';

export function leadStatusVariant(status?: string): BadgeVariant {
  const s = (status || '').toLowerCase();
  if (s.includes('won') || s.includes('payment confirmed') || s.includes('fulfilled')) return 'green';
  if (s.includes('lost')) return 'red';
  if (s.includes('hold') || s.includes('follow')) return 'amber';
  if (s.includes('lpo') || s.includes('negotiat')) return 'purple';
  if (s.includes('qualified') || s.includes('interest')) return 'blue';
  if (s.includes('contact')) return 'teal';
  return 'gray';
}

export function invoiceStatusVariant(status?: string): BadgeVariant {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'green';
  if (s.includes('partial')) return 'amber';
  if (s === 'overdue') return 'red';
  if (s === 'cancelled') return 'gray';
  if (s === 'pending' || s === 'processing') return 'blue';
  return 'gray';
}

export function lpoStatusVariant(status?: string): BadgeVariant {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'received' || s === 'confirmed') return 'green';
  if (s === 'in transit' || s === 'overdue') return 'amber';
  if (s === 'cancelled') return 'red';
  if (s === 'sorted' || s === 'processing' || s === 'to-do') return 'blue';
  return 'gray';
}

export function lpoTermsVariant(terms?: string): BadgeVariant {
  const t = (terms || '').toLowerCase();
  if (t.includes('delivery') || t.includes('pod')) return 'teal';
  if (t.includes('sales') || t.includes('return') || t.includes('sor')) return 'purple';
  if (t.includes('70%') || t.includes('week')) return 'amber';
  return 'gray';
}

export function productStockVariant(status?: string, qty = 0): BadgeVariant {
  const s = (status || '').toLowerCase();
  if (s.includes('out') || qty <= 0) return 'red';
  if (qty < 100 || s.includes('pending')) return 'amber';
  return 'green';
}

export function billingInvoiceVariant(
  status?: string,
): BadgeVariant {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'green';
  if (s === 'overdue') return 'red';
  if (s.includes('due')) return 'amber';
  if (s === 'cancelled') return 'gray';
  return 'blue';
}

/** Map UI / friendly stage labels to backend lead status enum */
export function toApiLeadStatus(ui?: string): string {
  const map: Record<string, string> = {
    New: 'Contacted',
    'Contact Made': 'Contacted',
    Qualifying: 'Qualified',
    Negotiation: 'In-Negotiations',
    'LPO Raised': 'LPO Generated',
    Customer: 'Closed Won',
  };
  if (!ui) return 'Contacted';
  return map[ui] || ui;
}
