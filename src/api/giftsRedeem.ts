const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

function token(): string | null {
  return localStorage.getItem('s-token') || localStorage.getItem('sartor_crm_token');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  const t = token();
  if (t) headers['s-token'] = t;

  const res = await fetch(`${baseURL}${path}`, { ...init, headers });
  const json = (await res.json()) as { status: boolean; message: string; data: T };
  if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
  return json.data;
}

export type RedeemPoolStock = {
  campaignId: string;
  campaignName: string;
  poolId: string;
  giftId: string;
  name: string;
  trigger: string;
  qty: number;
  lowStockThreshold: number;
};

export type RedeemTodayItem = {
  _id: string;
  gift: string;
  consumer: string;
  method: string;
  time: string;
};

export type RedeemGiftResult = {
  outcome: 'SUCCESS' | 'ALREADY_REDEEMED' | 'PENDING_STOCK' | 'INVALID';
  title: string;
  subtitle: string;
  rows?: [string, string][];
  giftName?: string;
  remaining?: number;
};

export const giftsRedeemApi = {
  redeemPools: () =>
    request<{ data: RedeemPoolStock[] }>('/gifts/redeem/pools').then((d) => d.data),

  myRedemptionsToday: () =>
    request<{ data: RedeemTodayItem[] }>('/gifts/redeem/mine-today').then((d) => d.data),

  redeemGift: async (body: { code: string; method: 'QR_SCAN' | 'MANUAL_ENTRY' }) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const t = token();
    if (t) headers['s-token'] = t;
    const res = await fetch(`${baseURL}/gifts/redeem`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data: RedeemGiftResult;
    };
    if (!json?.data?.outcome) {
      throw new Error(json?.message || 'Redeem failed — sign in / set s-token to call the API.');
    }
    return json.data;
  },
};
