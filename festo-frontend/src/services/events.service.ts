import { apiClient } from '../api/client.js';

export const eventsService = {
  async list(params: Record<string, unknown> = {}): Promise<any> { return (await apiClient.get('/events', { params })).data; },
  async get(slug: string): Promise<any> { return (await apiClient.get(`/events/${slug}`)).data; },
  async mine(): Promise<any> { return (await apiClient.get('/events/mine')).data; },
  async create(data: Record<string, unknown>): Promise<any> { return (await apiClient.post('/events', data)).data; },
  async update(id: string, data: Record<string, unknown>): Promise<any> { return (await apiClient.patch(`/events/${id}`, data)).data; },
  async submit(id: string): Promise<any> { return (await apiClient.post(`/events/${id}/submit`)).data; },
  async cancel(id: string): Promise<any> { return (await apiClient.post(`/events/${id}/cancel`)).data; },
  async delete(id: string): Promise<any> { return (await apiClient.delete(`/events/${id}`)).data; },
  async pending(): Promise<any> { return (await apiClient.get('/events/admin/pending')).data; },
  async approve(id: string): Promise<any> { return (await apiClient.post(`/events/${id}/approve`)).data; },
  async reject(id: string): Promise<any> { return (await apiClient.post(`/events/${id}/reject`)).data; },
  async register(eventId: string, quantity = 1): Promise<any> { return (await apiClient.post(`/events/${eventId}/register`, { quantity })).data; },
  async myRegistrations(): Promise<any> { return (await apiClient.get('/registrations')).data; },
  async cancelRegistration(id: string): Promise<any> { return (await apiClient.delete(`/registrations/${id}`)).data; },
  async uploadPoster(eventId: string, data: string): Promise<any> { return (await apiClient.post('/media/upload', { kind: 'event_poster', event_id: eventId, data })).data; },
};
