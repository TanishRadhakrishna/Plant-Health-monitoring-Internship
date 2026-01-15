import api from './api'

export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data.user
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },
}