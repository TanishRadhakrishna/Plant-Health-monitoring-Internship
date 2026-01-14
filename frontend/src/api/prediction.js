// src/api/prediction.js
import axiosInstance from './axios';

/**
 * Prediction API Service
 */
const predictionAPI = {
  /**
   * Check AI service health status
   * @returns {Promise<Object>} - { aiService: 'healthy' | 'unavailable', timestamp }
   */
  checkAIHealth: async () => {
    try {
      const response = await axiosInstance.get('/predict/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to check AI service health' };
    }
  },

  /**
   * Create a new prediction session
   * @param {string} title - Optional session title
   * @returns {Promise<Object>} - Session data
   */
  createSession: async (title = null) => {
    try {
      const response = await axiosInstance.post('/predict/session', 
        title ? { title } : {}
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create session' };
    }
  },

  /**
   * Upload image for prediction
   * @param {File} imageFile - Image file to analyze
   * @param {number|null} sessionId - Optional session ID (auto-creates if null)
   * @param {Function} onUploadProgress - Optional progress callback
   * @returns {Promise<Object>} - Prediction result
   */
  predict: async (imageFile, sessionId = null, onUploadProgress = null) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const response = await axiosInstance.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 413) {
        throw { error: 'File size too large. Maximum size is 5MB.' };
      } else if (error.response?.status === 415) {
        throw { error: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.' };
      } else if (error.response?.status === 503) {
        throw { error: 'AI service is currently unavailable. Please try again later.' };
      }
      throw error.response?.data || { error: 'Prediction failed' };
    }
  },

  /**
   * Validate image file before upload
   * @param {File} file - Image file to validate
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateImageFile: (file) => {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check file size (5MB = 5242880 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size is 5MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid file type. Only JPG, JPEG, and PNG are allowed. Your file: ${file.type}` 
      };
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return { 
        valid: false, 
        error: 'Invalid file extension. Only .jpg, .jpeg, and .png are allowed.' 
      };
    }

    return { valid: true };
  },
};

export default predictionAPI;