import apiClient from "./apiClient";

export const register = async ({
  username,
  email,
  is_provider = false,
  is_customer = true,
  password,
}) => {
  return apiClient.post("/accounts/register/", payload);
};

export const login = async (payload) => {
  return apiClient.post("/accounts/login/", payload);
};

export const logout = async () => {
  return apiClient.post("/accounts/logout/");
};
