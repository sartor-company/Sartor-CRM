import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SN_TIER_ROLES } from '../constants/roles';
import { pageToPath, pathToPageId } from '../constants/routes';
import { getDefaultPageForRole, PAGE_TITLES } from '../constants/nav';
import { useAuthStore } from '../store/authStore';
import type { PageId, RoleId, TierId } from '../types';

interface AppContextValue {
  role: RoleId;
  tier: TierId;
  pageTitle: string;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  companyName: string;
  displayName: string;
  roleLabel: string;
  canShowSalesActions: boolean;
  isCeoAdmin: boolean;
  isMerch: boolean;
  isCeo: boolean;
  isFinance: boolean;
  isRep: boolean;
  isWH: boolean;
  isInv: boolean;
  navigateToPage: (pageId: PageId) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role: RoleId = user?.crmRole ?? 'ceo';
  const tier: TierId = user?.tier ?? '360';
  const companyName = user?.companyName || 'Company';
  const displayName = user?.displayName || user?.email || 'User';
  const roleLabel = user?.roleLabel || 'User';

  const pageId = pathToPageId(location.pathname) ?? getDefaultPageForRole(role);
  const pageTitle = PAGE_TITLES[pageId] ?? 'Dashboard';

  const navigateToPage = useCallback(
    (id: PageId) => {
      navigate(pageToPath(id));
      setSidebarOpen(false);
    },
    [navigate],
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  const value = useMemo(
    () => ({
      role,
      tier,
      pageTitle,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      companyName,
      displayName,
      roleLabel,
      canShowSalesActions: ['ceo', 'admin', 'rep'].includes(role),
      isCeoAdmin: role === 'ceo' || role === 'admin',
      isMerch: role === 'merch',
      isCeo: role === 'ceo',
      isFinance: role === 'finance',
      isRep: role === 'rep',
      isWH: role === 'wh',
      isInv: role === 'inv',
      navigateToPage,
      logout,
    }),
    [role, tier, pageTitle, sidebarOpen, companyName, displayName, roleLabel, navigateToPage, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useTierAllowsRole(role: RoleId, tier: TierId): boolean {
  return tier !== 'sn' || SN_TIER_ROLES.includes(role);
}
