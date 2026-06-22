import api from "../../api/axios";

/**
 * Fetch paginated list of problems with optional filters
 * @param {object} params - { page, limit, search, difficulty }
 */
export const fetchProblemsAPI = async (params = {}) => {
  const { page = 1, limit = 20, search = "", difficulty = "", tag = "" } = params;

  const query = new URLSearchParams();
  query.set("page", page);
  query.set("limit", limit);
  if (search) query.set("search", search);
  if (difficulty) query.set("difficulty", difficulty);
  if (tag) query.set("tag", tag);

  const response = await api.get(`/problems?${query.toString()}`);
  return response.data;
};

/**
 * Fetch a single problem by its ID (safe fields only)
 * @param {string} id - Problem ID
 */
export const fetchProblemByIdAPI = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data;
};
