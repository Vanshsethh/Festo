import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      // apiClient baseURL is http://localhost:5000/api, /health is mounted at root /health
      const response = await apiClient.get('/health', {
        baseURL: import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : 'http://localhost:5000',
      });
      return response.data;
    },
    refetchInterval: 10000,
    retry: 2,
  });
}
