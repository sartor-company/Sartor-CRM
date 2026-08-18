import { apiClient, unwrap } from './client';

export interface ApiTeamUser {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  consoleRole?: string;
  status?: boolean | string;
  isOwner?: boolean;
  blocked?: boolean;
  isDisabled?: boolean;
  userRole?: string;
  image?: string;
  warehouse?: { _id: string; name?: string } | string | null;
  commissionRate?: number;
  onLeave?: boolean;
  creationDateTime?: number;
  createdAt?: string;
}

function listParams() {
  return { limit: 'all' as const };
}

export const teamApi = {
  listUsers: async () => {
    const res = await apiClient.get('/users', { params: listParams() });
    const data = unwrap<{ data: ApiTeamUser[] }>(res);
    return data.data ?? [];
  },

  createUser: async (body: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    consoleRole?: string;
  }) => {
    const res = await apiClient.post('/user/create', body);
    return unwrap<ApiTeamUser>(res);
  },
};
