import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TIER_PRICING } from '../constants/tiers';

export type PaymentIntent = {
  amountLabel: string;
  amountNaira: number;
  description: string;
  reference: string;
};

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

const DEFAULT_INTENT: PaymentIntent = {
  amountLabel: formatNaira(TIER_PRICING['360'].flatMo),
  amountNaira: TIER_PRICING['360'].flatMo,
  description: 'Sartor CRM 360',
  reference: 'Subscription billing',
};

interface PaymentIntentContextValue {
  intent: PaymentIntent;
  setIntent: (intent: Partial<PaymentIntent> & Pick<PaymentIntent, 'amountNaira' | 'amountLabel'>) => void;
  resetIntent: () => void;
}

const PaymentIntentContext = createContext<PaymentIntentContextValue | null>(null);

export function PaymentIntentProvider({ children }: { children: ReactNode }) {
  const [intent, setIntentState] = useState<PaymentIntent>(DEFAULT_INTENT);

  const setIntent = useCallback(
    (next: Partial<PaymentIntent> & Pick<PaymentIntent, 'amountNaira' | 'amountLabel'>) => {
      setIntentState((prev) => ({ ...prev, ...next }));
    },
    [],
  );

  const resetIntent = useCallback(() => setIntentState(DEFAULT_INTENT), []);

  const value = useMemo(
    () => ({ intent, setIntent, resetIntent }),
    [intent, setIntent, resetIntent],
  );

  return <PaymentIntentContext.Provider value={value}>{children}</PaymentIntentContext.Provider>;
}

export function usePaymentIntent() {
  const ctx = useContext(PaymentIntentContext);
  if (!ctx) throw new Error('usePaymentIntent must be used within PaymentIntentProvider');
  return ctx;
}
