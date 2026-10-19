import { apiClient } from '../api/client.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  college_id?: string | null;
  college_name?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  data?: {
    user?: AuthUser;
    token?: string;
    message?: string;
  };
}

export const authService = {
  /**
   * Register a new student account
   * @param {{ name: string, email: string, password: string }} data
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Logout user and clear session cookie
   */
  async logout(): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<AuthResponse> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
