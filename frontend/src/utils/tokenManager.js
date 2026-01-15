/**
 * Token Manager
 * Handles access token storage and retrieval
 */

const TOKEN_KEY = 'accessToken'
const EXPIRES_IN_KEY = 'expiresIn'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token, expiresIn) => {
  localStorage.setItem(TOKEN_KEY, token)
  if (expiresIn) {
    localStorage.setItem(EXPIRES_IN_KEY, expiresIn)
  }
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_IN_KEY)
}

export const hasToken = () => {
  return !!localStorage.getItem(TOKEN_KEY)
}
