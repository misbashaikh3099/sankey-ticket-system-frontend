import api from '@/lib/api';
import { CreateTicketRequest } from '@/types';

export const ticketApi = {
  create: async (data: CreateTicketRequest) => {
    const res = await api.post('/tickets', data);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get('/tickets');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  getByBuyer: async (buyerId: string) => {
    const res = await api.get(`/tickets/buyer/${buyerId}`);
    return res.data;
  },

  getByVendor: async (vendorId: string) => {
    const res = await api.get(`/tickets/vendor/${vendorId}`);
    return res.data;
  },

  updateStatus: async (ticketId: string, status: string) => {
    const res = await api.put(`/tickets/${ticketId}/status/${status}`);
    return res.data;
  },

  assignVendor: async (ticketId: string, vendorId: string) => {
    const res = await api.put(`/tickets/${ticketId}/assign/${vendorId}`);
    return res.data;
  },

  getHistory: async (ticketId: string) => {
    const res = await api.get(`/tickets/${ticketId}/history`);
    return res.data;
  },

  search: async (keyword: string) => {
    const res = await api.get(`/tickets/search?keyword=${keyword}`);
    return res.data;
  },

  getByStatus: async (status: string) => {
    const res = await api.get(`/tickets/status/${status}`);
    return res.data;
  },

  getPaginated: async (page: number, size: number) => {
    const res = await api.get(`/tickets/page?page=${page}&size=${size}`);
    return res.data;
  },
};

export const commentApi = {
  add: async (ticketId: string, userId: string, message: string, userName: string) => {
    const res = await api.post(`/tickets/${ticketId}/comments`, { userId, message, userName });
    return res.data;
  },

  get: async (ticketId: string) => {
    const res = await api.get(`/tickets/${ticketId}/comments`);
    return res.data;
  },
};

export const reportApi = {
  getStats: async () => {
    const res = await api.get('/reports/tickets');
    return res.data;
  },

  getPriorityStats: async () => {
    const res = await api.get('/reports/priority');
    return res.data;
  },

  getVendorPerformance: async () => {
    const res = await api.get('/reports/vendors/performance');
    return res.data;
  },

  getSlaReport: async () => {
    const res = await api.get('/reports/sla');
    return res.data;
  },
};

export const fileApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
