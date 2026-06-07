// API Configuration
export const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator
// export const API_BASE_URL = 'http://localhost:8000'; // iOS simulator
export const API_TIMEOUT = 30000;

// OAuth2 endpoints
export const OAUTH_TOKEN_URL = `${API_BASE_URL}/o/token/`;
export const OAUTH_REVOKE_URL = `${API_BASE_URL}/o/revoke_token/`;

// API paths
export const API_PATHS = {
  // Auth
  LOGIN: '/api/accounts/login/',
  REGISTER: '/api/accounts/register/',
  LOGOUT: '/api/accounts/logout/',
  ME: '/api/accounts/me/',
  CHANGE_PASSWORD: '/api/accounts/me/change-password/',

  // Services
  TOURS: '/api/services/tours/',
  HOTELS: '/api/services/hotels/',
  TRANSPORTS: '/api/services/transports/',
  CATEGORIES: '/api/services/categories/',
  PROMO_BANNERS: '/api/services/promo-banners/',

  // Locations
  COUNTRIES: '/api/locations/countries/',
  CITIES: '/api/locations/cities/',

  // Bookings
  BOOKINGS: '/api/bookings/',
  BOOKING_ACTIONS: '/api/bookings/actions/',

  // Payments
  PAYMENTS: '/api/payments/',

  // Provider
  PROVIDER_STATS: '/api/provider/stats/',
  PROVIDER_CHATS: '/api/provider/chats/',

  // Admin
  ADMIN_USERS: '/api/accounts/admin/users/',
  ADMIN_PROVIDERS: '/api/admin/providers/',
  ADMIN_DASHBOARD: '/api/payments/admin/dashboard/',
};