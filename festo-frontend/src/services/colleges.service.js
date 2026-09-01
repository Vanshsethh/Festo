import { apiClient } from '../api/client.js';

export const collegesService = {
  /**
   * Get paginated verified colleges for public directory
   */
  async getVerifiedColleges(params = {}) {
    const response = await apiClient.get('/colleges', { params });
    return response.data;
  },

  /**
   * Get single college by id or slug
   */
  async getCollege(identifier) {
    const response = await apiClient.get(`/colleges/${identifier}`);
    return response.data;
  },

  /**
   * Submit college onboarding application (STUDENT)
   */
  async applyCollege(data) {
    const response = await apiClient.post('/colleges/apply', data);
    return response.data;
  },

  /**
   * Get current user's submitted college application
   */
  async getMyApplication() {
    const response = await apiClient.get('/colleges/my-application');
    return response.data;
  },

  /**
   * Update college profile (COLLEGE_ADMIN)
   */
  async updateCollege(collegeId, data) {
    const response = await apiClient.patch(`/colleges/${collegeId}`, data);
    return response.data;
  },

  /**
   * List staff members of a college
   */
  async getMembers(collegeId) {
    const response = await apiClient.get(`/colleges/${collegeId}/members`);
    return response.data;
  },

  /**
   * Add staff member by email
   */
  async addMember(collegeId, data) {
    const response = await apiClient.post(`/colleges/${collegeId}/members`, data);
    return response.data;
  },

  /**
   * Remove staff member
   */
  async removeMember(collegeId, memberId) {
    const response = await apiClient.delete(`/colleges/${collegeId}/members/${memberId}`);
    return response.data;
  },

  /**
   * Super Admin: list all colleges across statuses
   */
  async adminListColleges(params = {}) {
    const response = await apiClient.get('/admin/colleges', { params });
    return response.data;
  },

  /**
   * Super Admin: approve college application
   */
  async adminApproveCollege(collegeId) {
    const response = await apiClient.post(`/admin/colleges/${collegeId}/approve`);
    return response.data;
  },

  /**
   * Super Admin: reject college application
   */
  async adminRejectCollege(collegeId) {
    const response = await apiClient.post(`/admin/colleges/${collegeId}/reject`);
    return response.data;
  },
};
