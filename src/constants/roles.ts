import type { RoleId, RoleMeta } from '../types';

export const ROLE_ORDER: RoleId[] = [
  'ceo',
  'admin',
  'rep',
  'finance',
  'inv',
  'wh',
  'driver',
  'merch',
];

export const SN_TIER_ROLES: RoleId[] = ['ceo', 'admin', 'rep', 'finance', 'merch'];

export const ROLE_META: Record<RoleId, RoleMeta> = {
  ceo: { name: 'Nwachukwu Confidence', role: 'CEO / MD', color: '#000068', av: 'NC' },
  admin: { name: 'Abubakar Idah', role: 'Admin', color: '#3B82F6', av: 'AI' },
  rep: { name: 'Emmanuel Batimehin', role: 'Sales Representative', color: '#8B5CF6', av: 'EB' },
  finance: { name: 'Okeke David', role: 'Finance Manager', color: '#0EA5E9', av: 'OD' },
  inv: { name: 'Amaka Obi', role: 'Inventory Officer', color: '#F59E0B', av: 'AO' },
  wh: { name: 'Musa Abdullahi', role: 'Warehouse Manager', color: '#00B341', av: 'MA' },
  driver: { name: 'Chidi Okeke', role: 'Driver', color: '#6B7280', av: 'CO' },
  merch: { name: 'Einstein Dare', role: 'Merchandiser', color: '#EC4899', av: 'ED' },
};

export const ROLE_LABELS: Record<RoleId, string> = {
  ceo: 'CEO',
  admin: 'Admin',
  rep: 'Sales Rep',
  finance: 'Finance',
  inv: 'Inv. Officer',
  wh: 'WH Manager',
  driver: 'Driver',
  merch: 'Merchandiser',
};
