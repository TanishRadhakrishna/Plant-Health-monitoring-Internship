import api from "./axios";

/**
 * Check AI service health
 * Backend: GET /api/predict/health
 */
export const checkAIHealth = () => {
  return api.get("/predict/health");
};

/**
 * Create a new prediction session
 * Backend: POST /api/predict/session
 */
export const createSession = title => {
  return api.post("/predict/session", { title });
};

/**
 * Upload image and get prediction
 * Backend: POST /api/predict
 *
 * @param {File} imageFile
 * @param {number|null} sessionId
 */
export const predictImage = (imageFile, sessionId = null) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  return api.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
