// src/api/history.js
import axiosInstance from './axios';

/**
 * History API Service - Manage sessions and predictions
 */
const historyAPI = {
  /**
   * Get all user sessions (conversation list)
   * @param {number} limit - Number of sessions per page (default: 50)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} - { total, sessions, pagination }
   */
  getSessions: async (limit = 50, offset = 0) => {
    try {
      const response = await axiosInstance.get('/history/sessions', {
        params: { limit, offset },
      });
      const data = response.data;
      // Validate basic shape; if backend returned HTML or unexpected content, throw
      if (!Array.isArray(data)) throw { error: 'Unexpected response from history API', data };
      return data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch sessions' };
    }
  },

  /**
   * Get all predictions in a specific session (messages in conversation)
   * @param {number} sessionId - Session ID
   * @param {number} limit - Number of predictions per page (default: 100)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} - { session_id, total, predictions, pagination }
   */
  getSessionPredictions: async (sessionId, limit = 100, offset = 0) => {
    try {
      const response = await axiosInstance.get(
        `/history/sessions/${sessionId}/predictions`,
        {
          params: { limit, offset },
        }
      );
      const data = response.data;
      if (!data || !data.id) throw { error: 'Unexpected response from history session API', data };
      return data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch predictions' };
    }
  },

  /**
   * Update session title (rename conversation)
   * @param {number} sessionId - Session ID
   * @param {string} title - New session title
   * @returns {Promise<Object>} - Updated session data
   */
  updateSessionTitle: async (sessionId, title) => {
    try {
      const response = await axiosInstance.put(
        `/history/sessions/${sessionId}`,
        { title }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update session title' };
    }
  },

  /**
   * Delete session and all its predictions (delete conversation)
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} - { success: true, message }
   */
  deleteSession: async (sessionId) => {
    try {
      const response = await axiosInstance.delete(
        `/history/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete session' };
    }
  },

  /**
   * Get single prediction details
   * @param {number} predictionId - Prediction ID
   * @returns {Promise<Object>} - Full prediction object
   */
  getPredictionDetails: async (predictionId) => {
    try {
      const response = await axiosInstance.get(
        `/history/predictions/${predictionId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch prediction details' };
    }
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO 8601 date string
   * @returns {string} - Formatted date
   */
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  },

  /**
   * Get confidence level badge color
   * @param {string} confidenceLevel - 'Very High', 'High', 'Moderate', 'Low'
   * @returns {string} - Tailwind color class
   */
  getConfidenceLevelColor: (confidenceLevel) => {
    const colors = {
      'Very High': 'bg-green-100 text-green-800',
      'High': 'bg-blue-100 text-blue-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800',
    };
    return colors[confidenceLevel] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Parse category and subtype from predicted class
   * @param {string} predictedClass - e.g., 'Pest_Fungal'
   * @returns {Object} - { category: 'Pest', subtype: 'Fungal' }
   */
  parseClass: (predictedClass) => {
    if (!predictedClass) return { category: null, subtype: null };
    
    if (predictedClass === 'Healthy') {
      return { category: 'Healthy', subtype: null };
    }

    const parts = predictedClass.split('_');
    return {
      category: parts[0] || null,
      subtype: parts[1] || null,
    };
  },
};

export default historyAPI;