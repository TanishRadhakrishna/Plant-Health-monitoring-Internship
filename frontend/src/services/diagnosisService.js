import api from './api'

export const diagnosisService = {
  /**
   * STATELESS DIAGNOSIS (No login required)
   * Sends image, gets prediction, nothing stored
   */
  diagnoseStateless: async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/diagnose/stateless', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * STATEFUL DIAGNOSIS (Login required)
   * Saves prediction to user history
   */
  diagnoseWithHistory: async (file, sessionId = null) => {
    const formData = new FormData()
    formData.append('image', file)
    if (sessionId) {
      formData.append('session_id', sessionId)
    }

    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Check AI service health
   */
  checkHealth: async () => {
    const response = await api.get('/diagnose/health')
    return response.data
  },
}