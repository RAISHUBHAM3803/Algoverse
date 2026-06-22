export const setToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const clearToken = () => {
  localStorage.removeItem("accessToken");
};
