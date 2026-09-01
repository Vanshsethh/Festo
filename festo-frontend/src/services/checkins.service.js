import { apiClient } from '../api/client.js';

export const checkinsService = {
  async scan(qrToken) {
    return (await apiClient.post('/checkins/scan', { qr_token: qrToken })).data;
  },
};
