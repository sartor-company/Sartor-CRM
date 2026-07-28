import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useRoleGates() {
  const { role, isCeoAdmin, isCeo, isFinance, isRep, isWH, isInv } = useApp();

  return useMemo(
    () => ({
      role,
      showCeoAdmin: isCeoAdmin,
      showInvAddPay: isCeo || role === 'admin' || isRep,
      showInvMarkPaid: role === 'admin' || isRep,
      showInvConfirmPay: isCeo || isFinance,
      showAddProduct: isCeo || isWH,
      showProdEdit: isCeo || isInv,
      showProdStock: isCeo || isWH || isInv,
      showWhApprove: isWH,
      showCeoBatch: isCeo,
      showOnboardDriver: isCeoAdmin,
      showDriverEdit: isCeoAdmin,
      showDriverWh: isCeoAdmin || isWH,
      showKcComm: isCeo || isFinance,
      showDashCommCard: role === 'admin' || isRep,
      showTierUpgrade: isCeo,
      showLocPin: ['ceo', 'admin', 'rep', 'merch'].includes(role),
      showNav: ['ceo', 'admin', 'rep', 'merch', 'driver'].includes(role),
      showGiftRedeem: ['ceo', 'admin', 'rep', 'merch'].includes(role),
    }),
    [role, isCeoAdmin, isCeo, isFinance, isRep, isWH, isInv],
  );
}
