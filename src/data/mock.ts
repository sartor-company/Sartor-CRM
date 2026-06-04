import type { BadgeVariant } from '../types';

export const MOCK_LEADS = [
  { name: 'FreshMart NG', category: 'FMCG-Retail', location: 'Garki, Abuja', stage: 'Contact Made', stageVariant: 'teal' as BadgeVariant, rep: 'Abubakar', date: '2 May 2026' },
  { name: 'PharmaCare Ltd', category: 'Pharma-Retail', location: 'Ikeja, Lagos', stage: 'Qualifying', stageVariant: 'amber' as BadgeVariant, rep: 'Emmanuel', date: '28 Apr 2026' },
];

export const MOCK_CUSTOMERS = [
  { name: 'Zenith Pharma', category: 'Pharma-Retail', location: 'Abuja', since: '12 Jan 2026', lpos: 4, revenue: '₦1,240,000', outstanding: '₦0', lat: 9.0765, lng: 7.4893 },
  { name: 'MedPoint Stores', category: 'FMCG-Retail', location: 'Abuja', since: '20 Feb 2026', lpos: 2, revenue: '₦680,000', outstanding: '₦140,000', lat: 9.0765, lng: 7.4893 },
];

export const MOCK_LPOS = [
  { id: 'LPO-0042', customer: 'FreshMart NG', rep: 'Abubakar', terms: 'POD', termsVariant: 'teal' as BadgeVariant, amount: '₦240,000', status: 'Dispatched', statusVariant: 'amber' as BadgeVariant, invoice: 'INV-00042' },
  { id: 'LPO-0041', customer: 'PharmaCare Ltd', rep: 'CEO', terms: 'SOR 30d', termsVariant: 'purple' as BadgeVariant, amount: '₦180,000', status: 'Delivered', statusVariant: 'green' as BadgeVariant, invoice: 'INV-00041' },
  { id: 'LPO-0040', customer: 'HealthPlus Abuja', rep: 'Samuel', terms: 'Upfront', termsVariant: 'gray' as BadgeVariant, amount: '₦96,000', status: 'Packed', statusVariant: 'gray' as BadgeVariant, invoice: null },
];

export const MOCK_INVOICES = [
  { id: 'INV-00042', lpo: 'LPO-0042', customer: 'FreshMart NG', date: '8 May 2026', terms: 'POD', amount: '₦240,000', paid: '₦100,000', due: '8 May 2026', aging: '3d overdue', agingColor: 'var(--at)', qr: 'Pending', qrVariant: 'amber' as BadgeVariant, status: 'Part Paid', statusVariant: 'amber' as BadgeVariant },
  { id: 'INV-00041', lpo: 'LPO-0041', customer: 'PharmaCare Ltd', date: '2 May 2026', terms: 'SOR 30d', amount: '₦180,000', paid: '₦0', due: '1 Jun 2026', aging: '9d overdue', agingColor: 'var(--rt)', qr: 'Expired', qrVariant: 'red' as BadgeVariant, status: 'Overdue', statusVariant: 'red' as BadgeVariant },
  { id: 'INV-00040', lpo: 'LPO-0040', customer: 'HealthPlus Abuja', date: '30 Apr 2026', terms: 'Upfront', amount: '₦96,000', paid: '₦96,000', due: 'Before Dispatch', aging: 'Paid', agingColor: 'var(--Gd)', qr: 'Confirmed', qrVariant: 'green' as BadgeVariant, status: 'Confirmed Paid', statusVariant: 'green' as BadgeVariant },
];

export const PIPELINE_COLUMNS = [
  { title: 'New', count: 4, cards: [{ name: 'City Pharmacy', sub: 'Wuse II, Abuja', meta: 'Today' }] },
  { title: 'Contact Made', count: 7, cards: [{ name: 'FreshMart NG', sub: 'Garki, Abuja', meta: '3d ago' }] },
  { title: 'Qualifying', count: 5, cards: [{ name: 'PharmaCare Ltd', sub: 'Ikeja, Lagos' }] },
  { title: 'Negotiation', count: 3, cards: [{ name: 'HealthPlus Abuja', sub: 'Maitama' }] },
  { title: 'LPO Raised', count: 6, cards: [{ name: 'MedPoint Stores', sub: 'Asokoro' }] },
  { title: 'Customer', titleIcon: 'sparkles' as const, count: 55, cards: [{ name: 'Zenith Pharma', sub: 'Converted 12 Jan' }] },
];

export const GRN_PRODUCTS = [
  { sku: 'SH-25-CAR', name: 'Hand Sanitiser 250ml Carabiner', price: 780 },
  { sku: 'SH-25-SIL', name: 'Hand Sanitiser 250ml Silicone', price: 720 },
  { sku: 'SH-50-CAR', name: 'Hand Sanitiser 500ml', price: 1100 },
  { sku: 'SH-25-HOK', name: 'Silicone Hook Pack', price: 650 },
];

export const MOCK_PRODUCTS = [
  { sku: 'SH-25-CAR', name: 'Hand Sanitiser 250ml Carabiner', brand: 'Sartor', category: 'Personal Care', stock: 1240, reorder: 500 },
  { sku: 'SH-25-SIL', name: 'Hand Sanitiser 250ml Silicone', brand: 'Sartor', category: 'Personal Care', stock: 380, reorder: 400 },
  { sku: 'SH-50-CAR', name: 'Hand Sanitiser 500ml', brand: 'Sartor', category: 'Personal Care', stock: 85, reorder: 500 },
  { sku: 'SH-25-HOK', name: 'Silicone Hook Pack', brand: 'Sartor', category: 'Personal Care', stock: 620, reorder: 200 },
];
