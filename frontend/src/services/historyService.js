import api from './api'

export const historyService = {
  getSessions: async (limit = 50, offset = 0) => {
    const response = await api.get('/history/sessions', {
      params: { limit, offset },
    })
    return response.data
  },

  getSessionPredictions: async (sessionId, limit = 100, offset = 0) => {
    const response = await api.get(`/history/sessions/${sessionId}/predictions`, {
      params: { limit, offset },
    })
    return response.data
  },

  updateSessionTitle: async (sessionId, title) => {
    const response = await api.patch(`/history/sessions/${sessionId}`, { title })
    return response.data
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/history/sessions/${sessionId}`)
    return response.data
  },

  getPredictionDetails: async (predictionId) => {
    const response = await api.get(`/history/predictions/${predictionId}`)
    return response.data
  },
}