import type { PageId } from '../types';
import { getDefaultPageForRole } from './nav';
import type { RoleId } from '../types';

export const PAGE_PATHS: Record<PageId, string> = {
  dash: '/',
  'merch-dash': '/field',
  pipeline: '/pipeline',
  leads: '/leads',
  customers: '/customers',
  lpos: '/lpos',
  invoices: '/invoices',
  warehouses: '/warehouses',
  team: '/team',
  reports: '/reports',
  sartor360: '/sartor360',
  products: '/products',
  'lpo-queue': '/lpo-queue',
  'pack-lpos': '/pack-lpos',
  drivers: '/drivers',
  deliveries: '/deliveries',
  visits: '/visits',
  intel: '/intel',
  'finance-dash': '/payment-queue',
  returns: '/returns',
  commissions: '/commissions',
  'my-commissions': '/my-commission',
  settings: '/settings',
  'grn-log': '/grn',
  'reorder-alerts': '/reorder-alerts',
  reconciliation: '/reconciliation',
  suppliers: '/suppliers',
  'redeem-gift': '/redeem-gift',
};

const pathToPage = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([id, path]) => [path, id as PageId]),
) as Record<string, PageId>;

export function pathToPageId(pathname: string): PageId | undefined {
  return pathToPage[pathname];
}

export function pageToPath(pageId: PageId): string {
  return PAGE_PATHS[pageId];
}

export function defaultPathForRole(role: RoleId): string {
  return pageToPath(getDefaultPageForRole(role));
}
