// src/api/axios.js
import axios from 'axios';
import tokenManager from '../utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Send cookies (refresh token) with every request
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh automatically
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response, return as-is
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if it's specifically a TOKEN_EXPIRED error
    const errorCode = error.response?.data?.code;
    if (errorCode === 'TOKEN_EXPIRED') {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${API_BASE_URL.replace('/api', '')}/api/auth/refresh`,
          {},
          {
            withCredentials: true, // Send refresh token cookie
          }
        );

        const { accessToken, expiresIn } = response.data;

        // Store new access token
        tokenManager.setAccessToken(accessToken, expiresIn);

        // Update authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        processQueue(refreshError, null);
        tokenManager.clearAccessToken();
        
        // Clear user data
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other 401 errors (invalid token, not TOKEN_EXPIRED), redirect to login
    if (error.response?.status === 401) {
      tokenManager.clearAccessToken();
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;