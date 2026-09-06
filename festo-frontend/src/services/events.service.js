import { apiClient } from '../api/client.js';

export const eventsService = {
  async list(params = {}) { return (await apiClient.get('/events', { params })).data; },
  async get(slug) { return (await apiClient.get(`/events/${slug}`)).data; },
  async mine() { return (await apiClient.get('/events/mine')).data; },
  async create(data) { return (await apiClient.post('/events', data)).data; },
  async update(id, data) { return (await apiClient.patch(`/events/${id}`, data)).data; },
  async submit(id) { return (await apiClient.post(`/events/${id}/submit`)).data; },
  async cancel(id) { return (await apiClient.post(`/events/${id}/cancel`)).data; },
  async delete(id) { return (await apiClient.delete(`/events/${id}`)).data; },
  async pending() { return (await apiClient.get('/events/admin/pending')).data; },
  async approve(id) { return (await apiClient.post(`/events/${id}/approve`)).data; },
  async reject(id) { return (await apiClient.post(`/events/${id}/reject`)).data; },
  async register(eventId, quantity = 1) { return (await apiClient.post(`/events/${eventId}/register`, { quantity })).data; },
  async myRegistrations() { return (await apiClient.get('/registrations')).data; },
  async cancelRegistration(id) { return (await apiClient.delete(`/registrations/${id}`)).data; },
  async uploadPoster(eventId, data) { return (await apiClient.post('/media/upload', { kind: 'event_poster', event_id: eventId, data })).data; },
};