import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const endpoints = {
  register: "/api/accounts/register/",
  login: "/o/token/",
  logout: "/api/accounts/logout/",
  currentUser: "/api/accounts/me/",
  changePassword: "/api/accounts/me/change-password/",
  categories: "/api/services/categories/",
  cities: "/api/locations/cities/",
  tours: "/api/services/travel-tours/",
  hotels: "/api/services/hotels/",
  transports: "/api/services/transports/",
  providerPending: "/api/providers/pending/",
  wishlist: "/api/services/wishlist/",

  bookings: "/api/bookings/",
  payments: "/api/payments/",
  providerStats: "/api/provider/stats/",
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
