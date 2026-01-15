import api from "./axios";

/**
 * Login user
 * Backend: POST /api/auth/login
 */
export const login = data => {
  return api.post("/auth/login", data);
};

/**
 * Register user
 * Backend: POST /api/auth/register
 */
export const register = data => {
  return api.post("/auth/register", data);
};

/**
 * Logout user
 * Backend: POST /api/auth/logout
 */
export const logout = () => {
  return api.post("/auth/logout");
};

/**
 * Get current user profile
 * Backend: GET /api/auth/profile
 */
export const profile = () => {
  return api.get("/auth/profile");
};
