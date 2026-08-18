import type { CrmProfile } from '../store/authStore';

/**
 * Sticker orders, authentication credits, and verification domain live in
 * Sartor-Chain + DORA. CRM 360 includes that stack; Field/Depot do not unless
 * the tenant was also onboarded with SC+DORA (`servicesScdora`).
 */
export function canUseSartorChain(
  user: Pick<CrmProfile, 'tier' | 'servicesScdora' | 'scEnabled'> | null | undefined,
): boolean {
  if (!user) return false;
  if (user.tier === '360') return true;
  return user.servicesScdora === true && user.scEnabled !== false;
}
