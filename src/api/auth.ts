import { apiClient, unwrap } from './client';
import type { CrmProfile } from '../store/authStore';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return unwrap<Record<string, unknown> & { accountType: 'admin' | 'user' | 'sartor'; token: string }>(res);
  },

  getAccount: async () => {
    const res = await apiClient.get('/account');
    return unwrap<Record<string, unknown>>(res);
  },

  changePassword: async (passwordOld: string, password1: string, password2: string) => {
    const res = await apiClient.put('/user/password-change', {
      passwordOld,
      password1,
      password2,
    });
    return unwrap(res);
  },
};

export type { CrmProfile };
