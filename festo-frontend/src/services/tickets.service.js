import { apiClient } from '../api/client.js';

export const ticketsService = {
  async listMine() { return (await apiClient.get('/passes')).data; },
  async getMine(id) { return (await apiClient.get(`/passes/${id}`)).data; },
};
