import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RoleId, TierId } from '../types';
import { AUTH_KEY, authStorage } from './authStorage';

export interface CrmProfile {
  _id: string;
  fullName: string;
  /** Company / tenant display name */
  companyName: string;
  /** Staff member display name */
  displayName: string;
  email: string;
  token: string;
  accountType: 'admin' | 'user';
  /** UI role for nav gating */
  crmRole: RoleId;
  /** Backend CRM role string */
  role?: string;
  roleLabel: string;
  tier: TierId;
  /** Tenant was onboarded with Sartor-Chain + DORA (standalone or with CRM). */
  servicesScdora?: boolean;
  scEnabled?: boolean;
  clientCode?: string;
  phone?: string;
  address?: string;
  smsCredits?: number;
  pinCredits?: number;
  batchCalCredits?: number;
  verifyDomain?: string;
  giftRedemption?: boolean;
  paymentHandling?: boolean;
  paymentConfirmation?: boolean;
  paymentVisibility?: boolean;
  delivery?: boolean;
  lpoWorkflow?: boolean;
}

interface AuthState {
  user: CrmProfile | null;
  token: string | null;
  rememberMe: boolean;
  sessionChecked: boolean;
  loggedInAt: number | null;
  setAuth: (user: CrmProfile, rememberMe?: boolean) => void;
  updateProfile: (patch: Partial<CrmProfile>) => void;
  setSessionChecked: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: false,
      sessionChecked: false,
      loggedInAt: null,
      setAuth: (user, rememberMe = false) =>
        set({
          user,
          token: user.token,
          rememberMe,
          sessionChecked: true,
          loggedInAt: Date.now(),
        }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      setSessionChecked: (sessionChecked) => set({ sessionChecked }),
      logout: () =>
        set({
          user: null,
          token: null,
          rememberMe: false,
          sessionChecked: true,
          loggedInAt: null,
        }),
    }),
    {
      name: AUTH_KEY,
      storage: createJSONStorage(() => authStorage),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        rememberMe: s.rememberMe,
        loggedInAt: s.loggedInAt,
      }),
    },
  ),
);
