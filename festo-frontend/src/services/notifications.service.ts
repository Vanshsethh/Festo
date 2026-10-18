import { apiClient } from '../api/client.js';

export const notificationsService = {
  async mine() {
    return (await apiClient.get('/notifications')).data;
  },
};
