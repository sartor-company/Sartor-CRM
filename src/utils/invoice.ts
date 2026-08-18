import type { CrmInvoice, CrmLpo } from '../api/crm';
import { leadName } from '../api/crm';
import { formatDate, formatNaira, num } from './format';

export function invoiceAmount(inv: CrmInvoice) {
  return num(inv.totalAmount);
}

export function invoiceStatus(inv: CrmInvoice) {
  return String(inv.status || '').toLowerCase();
}

export function isPaid(inv: CrmInvoice) {
  const s = invoiceStatus(inv);
  return s === 'paid' || s === 'payment confirmed' || s === 'confirmed paid';
}

export function isPartial(inv: CrmInvoice) {
  return invoiceStatus(inv).includes('partial');
}

export function isCancelled(inv: CrmInvoice) {
  return invoiceStatus(inv) === 'cancelled';
}

export function isOutstanding(inv: CrmInvoice) {
  return !isPaid(inv) && !isCancelled(inv);
}

export function paidAmount(inv: CrmInvoice) {
  if (isPaid(inv)) return invoiceAmount(inv);
  if (inv.paidAmount != null && inv.paidAmount !== '') return num(inv.paidAmount);
  if (isPartial(inv)) return Math.round(invoiceAmount(inv) * 0.4);
  return 0;
}

export function outstandingAmount(inv: CrmInvoice) {
  if (isCancelled(inv) || isPaid(inv)) return 0;
  return Math.max(0, invoiceAmount(inv) - paidAmount(inv));
}

export function dueTimestamp(inv: CrmInvoice) {
  if (inv.dueDate) {
    const t = new Date(inv.dueDate).getTime();
    if (Number.isFinite(t)) return t;
  }
  return Number(inv.creationDateTime) || Date.now();
}

export function daysOutstanding(inv: CrmInvoice) {
  return Math.max(0, Math.floor((Date.now() - dueTimestamp(inv)) / 86_400_000));
}

export function isOverdue(inv: CrmInvoice) {
  if (!isOutstanding(inv)) return false;
  if (invoiceStatus(inv).includes('overdue')) return true;
  return Date.now() > dueTimestamp(inv);
}

export function agingLabel(inv: CrmInvoice): { text: string; color: string } {
  if (isPaid(inv)) return { text: 'Paid', color: 'var(--Gd)' };
  if (isCancelled(inv)) return { text: '—', color: 'var(--tx3)' };
  const due = dueTimestamp(inv);
  const days = Math.floor((Date.now() - due) / 86_400_000);
  if (days > 0) return { text: `${days}d overdue`, color: days >= 60 ? 'var(--rt)' : 'var(--at)' };
  if (days === 0) return { text: 'Due today', color: 'var(--at)' };
  return { text: `Due in ${Math.abs(days)}d`, color: 'var(--tx3)' };
}

export function qrStatus(inv: CrmInvoice): { label: string; variant: 'green' | 'amber' | 'red' | 'gray' } {
  if (inv.qrStatus) {
    const s = inv.qrStatus.toLowerCase();
    if (s.includes('confirm')) return { label: 'Confirmed', variant: 'green' };
    if (s.includes('expir')) return { label: 'Expired', variant: 'red' };
    return { label: inv.qrStatus, variant: 'amber' };
  }
  if (isPaid(inv)) return { label: 'Confirmed', variant: 'green' };
  if (isOverdue(inv)) return { label: 'Expired', variant: 'red' };
  return { label: 'Pending', variant: 'amber' };
}

export function invoiceCustomer(inv: CrmInvoice) {
  return inv.name || leadName(typeof inv.lead === 'object' ? inv.lead : null);
}

export function lpoIdOf(inv: CrmInvoice) {
  return typeof inv.lpo === 'object' && inv.lpo ? inv.lpo.lpoId || '—' : '—';
}

export function lpoTermsOf(inv: CrmInvoice, fallback?: string) {
  if (typeof inv.lpo === 'object' && inv.lpo?.terms) return inv.lpo.terms;
  return fallback;
}

export function termsShort(terms?: string) {
  if (!terms) return '—';
  const t = terms.toLowerCase();
  if (t.includes('delivery') || t.includes('pod')) return 'POD';
  if (t.includes('sales') || t.includes('return') || t.includes('sor')) return 'SOR 30d';
  if (t.includes('70%')) return '70% sold';
  if (t.includes('week')) return '2 weeks';
  if (t.includes('upfront')) return 'Upfront';
  return terms.length > 18 ? `${terms.slice(0, 16)}…` : terms;
}

export function deliveryDate(inv: CrmInvoice) {
  return formatDate(inv.creationDateTime || inv.dueDate);
}

export function invoiceForLpo(invoices: CrmInvoice[], lpo: CrmLpo) {
  return invoices.find((inv) => {
    if (typeof inv.lpo === 'object' && inv.lpo) return inv.lpo._id === lpo._id || inv.lpo.lpoId === lpo.lpoId;
    if (typeof inv.lpo === 'string') return inv.lpo === lpo._id;
    return false;
  });
}

export function formatInvoiceRef(inv: CrmInvoice) {
  return inv.invoiceId || inv._id.slice(-6);
}

export function collectionRate(invoices: CrmInvoice[]) {
  const total = invoices.filter((i) => !isCancelled(i)).reduce((s, i) => s + invoiceAmount(i), 0);
  const paid = invoices.filter(isPaid).reduce((s, i) => s + invoiceAmount(i), 0);
  if (!total) return 0;
  return Math.round((paid / total) * 1000) / 10;
}

export function thisMonthStart() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function inThisMonth(ts?: number | string | null) {
  if (ts == null || ts === '') return false;
  const t = typeof ts === 'number' ? ts : new Date(ts).getTime();
  return Number.isFinite(t) && t >= thisMonthStart();
}

export { formatNaira };
