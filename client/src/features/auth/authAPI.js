import api from "../../api/axios";

export const loginAPI = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const registerAPI = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const loadUserAPI = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfileAPI = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};
