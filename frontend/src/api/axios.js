import axios from "axios";
import { getToken, setToken, clearToken } from "../utils/tokenManager";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.data?.code === "TOKEN_EXPIRED") {
      try {
        const r = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        setToken(r.data.data.accessToken, r.data.data.expiresIn);
        err.config.headers.Authorization =
          `Bearer ${r.data.data.accessToken}`;
        return api.request(err.config);
      } catch {
        clearToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
