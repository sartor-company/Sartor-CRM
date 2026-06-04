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
import { defaultPathForRole, pageToPath, pathToPageId } from '../constants/routes';
import { getDefaultPageForRole, PAGE_TITLES } from '../constants/nav';
import type { PageId, RoleId, TierId } from '../types';
import { useToast } from './ToastContext';

interface AppContextValue {
  role: RoleId;
  tier: TierId;
  setRole: (role: RoleId) => void;
  setTier: (tier: TierId) => void;
  pageTitle: string;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  companyName: string;
  canShowSalesActions: boolean;
  isCeoAdmin: boolean;
  isMerch: boolean;
  isCeo: boolean;
  isFinance: boolean;
  isRep: boolean;
  isWH: boolean;
  isInv: boolean;
  navigateToPage: (pageId: PageId) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [role, setRoleState] = useState<RoleId>('ceo');
  const [tier, setTierState] = useState<TierId>('360');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageId = pathToPageId(location.pathname) ?? getDefaultPageForRole(role);
  const pageTitle = PAGE_TITLES[pageId] ?? 'Dashboard';

  const setRole = useCallback(
    (next: RoleId) => {
      setRoleState(next);
      navigate(defaultPathForRole(next));
      setSidebarOpen(false);
    },
    [navigate],
  );

  const setTier = useCallback(
    (next: TierId) => {
      if (next === 'sn' && ['inv', 'wh', 'driver'].includes(role)) {
        showToast(
          `${role} is not available on Sales Navigator. Switched to CEO.`,
          'warn',
        );
        setRoleState('ceo');
        navigate(defaultPathForRole('ceo'));
      }
      setTierState(next);
    },
    [role, navigate, showToast],
  );

  const navigateToPage = useCallback(
    (id: PageId) => {
      navigate(pageToPath(id));
      setSidebarOpen(false);
    },
    [navigate],
  );

  const value = useMemo(
    () => ({
      role,
      tier,
      setRole,
      setTier,
      pageTitle,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      companyName: 'Sartor Health Company Ltd',
      canShowSalesActions: ['ceo', 'admin', 'rep'].includes(role),
      isCeoAdmin: role === 'ceo' || role === 'admin',
      isMerch: role === 'merch',
      isCeo: role === 'ceo',
      isFinance: role === 'finance',
      isRep: role === 'rep',
      isWH: role === 'wh',
      isInv: role === 'inv',
      navigateToPage,
    }),
    [role, tier, setRole, setTier, pageTitle, sidebarOpen, navigateToPage],
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
