import type { PageId, TierId } from '../types';

export const TIER_LABELS: Record<TierId, string> = {
  sn: 'Sales Navigator',
  snp: 'Sales Nav Plus',
  '360': 'CRM 360',
};

export const TIER_BADGE_CLASS: Record<TierId, string> = {
  sn: 't-sn',
  snp: 't-snp',
  '360': 't-360',
};

export const TIER_GATES: Record<TierId, PageId[] | null> = {
  sn: [
    'dash',
    'merch-dash',
    'pipeline',
    'leads',
    'customers',
    'lpos',
    'invoices',
    'products',
    'team',
    'reports',
    'settings',
    'visits',
    'intel',
    'my-commissions',
    'returns',
  ],
  snp: [
    'dash',
    'merch-dash',
    'pipeline',
    'leads',
    'customers',
    'lpos',
    'invoices',
    'products',
    'team',
    'reports',
    'settings',
    'visits',
    'intel',
    'my-commissions',
    'returns',
    'warehouses',
    'drivers',
    'pack-lpos',
    'lpo-queue',
    'deliveries',
    'finance-dash',
    'commissions',
    'reorder-alerts',
    'grn-log',
    'suppliers',
  ],
  '360': null,
};

export const REPORT_TABS_BY_TIER: Record<TierId, string[]> = {
  sn: ['overview', 'sales', 'collections'],
  snp: ['overview', 'sales', 'collections', 'aging', 'commission', 'stock'],
  '360': ['overview', 'sales', 'collections', 'aging', 'commission', 'stock', 'pl', 'vat', 'suppliers'],
};

export const REPORT_TAB_UPGRADE: Record<string, string> = {
  aging: 'SNP',
  commission: 'SNP',
  stock: 'SNP',
  pl: 'CRM 360',
  vat: 'CRM 360',
  suppliers: 'CRM 360',
};
