import type { RoleId, TierId } from '../types';
import type { CrmProfile } from '../store/authStore';
import { ROLE_LABELS, ROLE_META } from '../constants/roles';

function resolveTier(raw: unknown): TierId {
  const t = String(raw || '').toLowerCase();
  if (t === 'sn' || t === 'field' || t === 'navigator') return 'sn';
  if (t === 'snp' || t === 'depot' || t === 'plus') return 'snp';
  return '360';
}

/**
 * Map backend account → CRM UI RoleId.
 * Prefer explicit userRole ids; fall back to role enum + permission flags.
 */
export function resolveCrmRole(data: Record<string, unknown>): RoleId {
  const accountType = data.accountType as string;
  if (accountType === 'admin') return 'ceo';

  const userRole = String(data.userRole || '').toLowerCase();
  if (userRole === 'ceo') return 'ceo';
  if (userRole === 'admin') return 'admin';
  if (userRole === 'rep') return 'rep';
  if (userRole === 'finance') return 'finance';
  if (userRole === 'inv') return 'inv';
  if (userRole === 'wh') return 'wh';
  if (userRole === 'driver') return 'driver';
  if (userRole === 'merch') return 'merch';

  const role = String(data.role || '');
  if (role === 'Admin') return 'admin';
  if (role === 'Sales Rep') return 'rep';
  if (role === 'Inventory Manager') return 'inv';
  if (role === 'Driver') return 'driver';
  if (role === 'Merchandiser') return 'merch';

  if (role === 'Manager') {
    const payment =
      data.paymentHandling === true ||
      data.paymentConfirmation === true ||
      data.paymentVisibility === true;
    if (payment) return 'finance';
    return 'wh';
  }

  return 'rep';
}

export function mapLoginToProfile(data: Record<string, unknown>): CrmProfile {
  const accountType = data.accountType as 'admin' | 'user';
  const crmRole = resolveCrmRole(data);
  const companyName =
    accountType === 'admin'
      ? String(data.fullName || 'Company')
      : String(data.tenantName || data.fullName || 'Company');
  const displayName =
    accountType === 'user'
      ? String(data.fullName || ROLE_META[crmRole].name)
      : String(data.contactName || data.fullName || 'Account Owner');

  return {
    _id: String(data._id || ''),
    fullName: companyName,
    companyName,
    displayName,
    email: String(data.email || ''),
    token: String(data.token || ''),
    accountType,
    crmRole,
    role: data.role as string | undefined,
    roleLabel:
      accountType === 'admin' ? 'CEO / Account Owner' : ROLE_LABELS[crmRole] || String(data.role || 'User'),
    tier: resolveTier(data.crmTier ?? data.crmTierType),
    servicesScdora: data.servicesScdora === true,
    scEnabled: data.scEnabled !== false,
    clientCode: data.clientCode as string | undefined,
    phone: data.phone as string | undefined,
    address: data.address as string | undefined,
    smsCredits: data.smsCredits as number | undefined,
    pinCredits: data.pinCredits as number | undefined,
    batchCalCredits: data.batchCalCredits as number | undefined,
    verifyDomain: data.verifyDomain as string | undefined,
    giftRedemption: Boolean(data.giftRedemption),
    paymentHandling: Boolean(data.paymentHandling),
    paymentConfirmation: Boolean(data.paymentConfirmation),
    paymentVisibility: Boolean(data.paymentVisibility),
    delivery: Boolean(data.delivery),
    lpoWorkflow: Boolean(data.lpoWorkflow),
  };
}
