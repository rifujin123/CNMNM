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
  promoBanners: "/api/services/promo-banners",
  wishlist: "/api/services/wishlist/",

  providerPending: "/api/providers/pending/",
  providerVerification: (providerId) => `/api/providers/${providerId}/verification/`,
  bookings: "/api/bookings/",
  payments: "/api/payments/",
  providerStats: "/api/provider/stats/",
  bookingRefund: (bookingId) => `/api/bookings/${bookingId}/refund/`,
  confirmStaticQrPayment: (paymentId) => `/api/payments/${paymentId}/confirm_static_qr_payment/`,
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
