import type { PageId, TierId } from '../types';

export const TIER_LABELS: Record<TierId, string> = {
  sn: 'Sartor CRM Field',
  snp: 'Sartor CRM Depot',
  '360': 'Sartor CRM 360',
};

export const TIER_SHORT: Record<TierId, string> = {
  sn: 'Field',
  snp: 'Depot',
  '360': 'CRM 360',
};

export const TIER_BADGE_CLASS: Record<TierId, string> = {
  sn: 't-sn',
  snp: 't-snp',
  '360': 't-360',
};

/** Monthly pricing model from v3-4 prototype */
export const TIER_PRICING = {
  sn: { revSeatMo: 15_000, revSeatAnn: 12_000, minSeats: 3 },
  snp: {
    revSeatMo: 22_000,
    revSeatAnn: 17_600,
    opSeatMo: 8_000,
    opSeatAnn: 6_400,
    minSeats: 5,
  },
  '360': { flatMo: 750_000, flatAnn: 7_200_000 },
} as const;

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
    'redeem-gift',
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
    'redeem-gift',
  ],
  '360': null,
};

export const REPORT_TABS_BY_TIER: Record<TierId, string[]> = {
  sn: ['overview', 'sales', 'collections'],
  snp: ['overview', 'sales', 'collections', 'aging', 'commission', 'stock'],
  '360': ['overview', 'sales', 'collections', 'aging', 'commission', 'stock', 'pl', 'vat', 'suppliers'],
};

export const REPORT_TAB_UPGRADE: Record<string, string> = {
  aging: 'Depot',
  commission: 'Depot',
  stock: 'Depot',
  pl: 'CRM 360',
  vat: 'CRM 360',
  suppliers: 'CRM 360',
};
