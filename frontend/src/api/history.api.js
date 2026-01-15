import api from "./axios";

/**
 * Get all prediction sessions for the logged-in user
 * Backend: GET /api/history/sessions
 */
export const getSessions = (params = {}) => {
  return api.get("/history/sessions", { params });
};

/**
 * Get predictions for a specific session
 * Backend: GET /api/history/sessions/:sessionId/predictions
 */
export const getSessionPredictions = (sessionId, params = {}) => {
  return api.get(`/history/sessions/${sessionId}/predictions`, { params });
};

/**
 * Rename a session
 * Backend: PATCH /api/history/sessions/:sessionId
 */
export const updateSessionTitle = (sessionId, title) => {
  return api.patch(`/history/sessions/${sessionId}`, { title });
};

/**
 * Delete a session
 * Backend: DELETE /api/history/sessions/:sessionId
 */
export const deleteSession = sessionId => {
  return api.delete(`/history/sessions/${sessionId}`);
};
