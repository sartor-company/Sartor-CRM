import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { notifySessionExpired } from '../utils/appFeedback';
import { cachedRequest, invalidateRequestCache } from './requestCache';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

/** Soft cap for “load everything” list calls — never unbounded. */
export const LIST_CAP = 500;

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let handlingSessionExpiry = false;

function isPublicPath(pathname: string) {
  return pathname === '/' || pathname === '/login';
}

function handleSessionExpired(serverMessage?: string) {
  if (handlingSessionExpiry) return;
  // Anonymous 401s on public pages (landing/login) must not force a login loop.
  if (!useAuthStore.getState().token) return;
  if (isPublicPath(window.location.pathname)) return;
  handlingSessionExpiry = true;

  notifySessionExpired(serverMessage);
  useAuthStore.getState().logout();
  invalidateRequestCache();

  window.setTimeout(() => {
    window.location.href = '/login?session=expired';
  }, 1200);
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers['s-token'] = token;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message;
    if (msg) err.message = msg;
    if (err.response?.status === 401) {
      handleSessionExpired(
        typeof msg === 'string' && /session|expired|sign in|unauthorized/i.test(msg)
          ? msg
          : undefined,
      );
    }
    return Promise.reject(err);
  },
);

export type ApiResponse<T> = {
  message: string;
  status: boolean;
  data: T;
};

export function unwrap<T>(res: { data: ApiResponse<T> }): T {
  if (!res.data.status) throw new Error(res.data.message || 'Request failed');
  return res.data.data;
}

/** Standard list query — capped, optional lean projection for dropdowns. */
export function listParams(search?: string, opts?: { lean?: boolean; limit?: number }) {
  return {
    limit: opts?.limit ?? LIST_CAP,
    ...(opts?.lean ? { lean: 1 } : {}),
    ...(search ? { search } : {}),
  };
}

/** Cached GET helper keyed by path + params. */
export function cachedGet<T>(
  path: string,
  params?: Record<string, unknown>,
  ttlMs = 30_000,
): Promise<T> {
  const key = `${path}?${JSON.stringify(params || {})}`;
  return cachedRequest(key, async () => {
    const res = await apiClient.get(path, { params });
    return unwrap<T>(res);
  }, ttlMs);
}

export { invalidateRequestCache };
