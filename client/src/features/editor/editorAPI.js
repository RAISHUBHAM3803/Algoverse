import api from "../../api/axios";

export const executeCodeAPI = async (executeData) => {
  const response = await api.post("/code/run", executeData);
  return response.data;
};
