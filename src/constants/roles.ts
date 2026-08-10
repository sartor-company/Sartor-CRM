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

export const ROLE_META: Record<RoleId, RoleMeta> = {
  ceo: { name: 'CEO', role: 'CEO / MD', color: '#000068', av: 'CE' },
  admin: { name: 'Admin', role: 'Admin', color: '#3B82F6', av: 'AD' },
  rep: { name: 'Sales Rep', role: 'Sales Representative', color: '#8B5CF6', av: 'SR' },
  finance: { name: 'Finance', role: 'Finance Manager', color: '#0EA5E9', av: 'FI' },
  inv: { name: 'Inv. Officer', role: 'Inventory Officer', color: '#F59E0B', av: 'IO' },
  wh: { name: 'WH Manager', role: 'Warehouse Manager', color: '#00B341', av: 'WM' },
  driver: { name: 'Driver', role: 'Driver', color: '#6B7280', av: 'DR' },
  merch: { name: 'Merchandiser', role: 'Merchandiser', color: '#EC4899', av: 'ME' },
};
