import { apiClient } from '../api/client.js';

export const dashboardService = {
  async user() { return (await apiClient.get('/dashboard/user')).data; },
  async student() { return (await apiClient.get('/dashboard/student')).data; },
  async college() { return (await apiClient.get('/dashboard/college')).data; },
  async organizer() { return (await apiClient.get('/dashboard/organizer')).data; },
};