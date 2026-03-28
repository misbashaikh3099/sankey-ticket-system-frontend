/*import api from '@/lib/api';
import { LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  getVendors: async () => {
    const res = await api.get('/auth/vendors');
    return res.data;
  },
};
*/
import api from '@/lib/api';
import { LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  getVendors: async () => {
    const res = await api.get('/auth/vendors');
    return res.data;
  },

  // ADMIN: get all users
  getAllUsers: async () => {
    const res = await api.get('/auth/users');
    return res.data;
  },

  // ADMIN: delete a user
  deleteUser: async (userId: string) => {
    const res = await api.delete(`/auth/users/${userId}`);
    return res.data;
  },
};