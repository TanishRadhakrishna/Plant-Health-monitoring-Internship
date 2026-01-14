// src/api/auth.js
import axiosInstance from './axios';
import tokenManager from '../utils/tokenManager';

/**
 * Authentication API Service
 */
const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { username, email, password }
   * @returns {Promise<Object>} - User data
   */
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { accessToken, user, expiresIn }
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const token = response.data.accessToken || response.data.token;
      const user = response.data.user;
      const expiresIn = response.data.expiresIn || 900; // default 15 minutes

      // Store access token in memory
      if (token) tokenManager.setAccessToken(token, expiresIn);

      // Store user info in localStorage (non-sensitive data)
      if (user) localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  /**
   * Refresh access token using refresh token cookie
   * @returns {Promise<Object>} - { accessToken, expiresIn }
   */
  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/auth/refresh');
      const { accessToken, expiresIn } = response.data;

      // Store new access token
      tokenManager.setAccessToken(accessToken, expiresIn);

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Token refresh failed' };
    }
  },

  /**
   * Logout user (revokes refresh token)
   * @returns {Promise<Object>}
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      
      // Clear client-side data
      tokenManager.clearAccessToken();
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      // Even if API call fails, clear local data
      tokenManager.clearAccessToken();
      localStorage.removeItem('user');
      throw error.response?.data || { error: 'Logout failed' };
    }
  },

  /**
   * Logout from all devices (revoke all refresh tokens)
   * @returns {Promise<Object>}
   */
  logoutAll: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout-all');
      
      // Clear client-side data
      tokenManager.clearAccessToken();
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      tokenManager.clearAccessToken();
      localStorage.removeItem('user');
      throw error.response?.data || { error: 'Logout all failed' };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} - User data
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const hasToken = tokenManager.hasValidToken();
    const hasUser = localStorage.getItem('user') !== null;
    return hasToken && hasUser;
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
};

export default authAPI;