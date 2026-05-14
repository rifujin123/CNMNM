import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
  register: "/api/accounts/register/",
  login: "/o/token/",
  logout: "/api/accounts/logout/",
  currentUser: "/api/accounts/me/",
  changePassword: "/api/accounts/me/change-password/",
  categories: "/api/services/categories/",
  tours: "/api/services/travel-tours/",
  providerPending: "/api/providers/pending/",
  wishlist: "/api/services/wishlist/",
};

export const authApis = (token) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
});
