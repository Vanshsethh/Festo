import { apiClient } from '../api/client.js';

export const dashboardService = {
  async user() { return (await apiClient.get('/dashboard/user')).data; },
  async college() { return (await apiClient.get('/dashboard/college')).data; },
  async admin() { return (await apiClient.get('/dashboard/admin')).data; },
};