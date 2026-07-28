export type RoleId =
  | 'ceo'
  | 'admin'
  | 'rep'
  | 'finance'
  | 'inv'
  | 'wh'
  | 'driver'
  | 'merch';

export type TierId = 'sn' | 'snp' | '360';

export type PageId =
  | 'dash'
  | 'merch-dash'
  | 'pipeline'
  | 'leads'
  | 'customers'
  | 'lpos'
  | 'invoices'
  | 'warehouses'
  | 'team'
  | 'reports'
  | 'sartor360'
  | 'products'
  | 'lpo-queue'
  | 'pack-lpos'
  | 'drivers'
  | 'deliveries'
  | 'visits'
  | 'intel'
  | 'finance-dash'
  | 'returns'
  | 'commissions'
  | 'my-commissions'
  | 'settings'
  | 'grn-log'
  | 'reorder-alerts'
  | 'reconciliation'
  | 'suppliers'
  | 'redeem-gift';

export type ModalId =
  | 'add-lead'
  | 'lead-detail'
  | 'reassign-lead'
  | 'update-status'
  | 'create-lpo'
  | 'view-lpo'
  | 'dispatch-lpo'
  | 'view-invoice'
  | 'add-payment'
  | 'mark-paid'
  | 'confirm-payment'
  | 'view-product'
  | 'add-product'
  | 'edit-product'
  | 'add-batch'
  | 'pack-lpo'
  | 'approve-stock'
  | 'driver-pickup'
  | 'delivery-confirm'
  | 'onboard-driver'
  | 'assign-driver'
  | 'new-visit'
  | 'visit-detail'
  | 'market-intel'
  | 'invite-user'
  | 'set-commission'
  | 'add-warehouse'
  | 'add-category'
  | 'view-driver'
  | 'assign-driver-warehouse'
  | 'goods-return'
  | 'credit-note'
  | 'payment-refund'
  | 'stock-writeoff'
  | 'stock-adjust'
  | 'customer-statement'
  | 'grn'
  | 'quarantine-batch'
  | 'stock-recon-count'
  | 'replenishment-request'
  | 'add-supplier'
  | 'supplier-payment'
  | 'commission-payout'
  | 'credit-note-apply'
  | 'qr-view'
  | 'qr-delivery-confirm'
  | 'location-picker'
  | 'location-view';

import type { IconName } from './icons';

export type { IconName } from './icons';

export type NavEntry =
  | { type: 'sep'; lbl: string }
  | { type: 'item'; id: PageId; ico: IconName; lbl: string; tier?: TierId[] };

export interface RoleMeta {
  name: string;
  role: string;
  color: string;
  av: string;
}

export interface LocationPin {
  lat: number;
  lng: number;
  label: string;
  pinned_by?: string;
  pinned_at?: string;
}

export type LocationContext = 'lead' | 'customer' | 'visit' | 'delivery';

export type BadgeVariant =
  | 'green'
  | 'amber'
  | 'red'
  | 'blue'
  | 'gray'
  | 'purple'
  | 'teal'
  | 'navy';
