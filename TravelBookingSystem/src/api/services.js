import Apis, { authApis, endpoints } from "../../configs/Apis";

const UNVERIFIED_PROVIDER_ERROR = "Provider account is not verified";

const SERVICE_TYPES = {
  tour: "tour",
  hotel: "hotel",
  transport: "transport",
};

const SERVICE_ENDPOINTS = {
  [SERVICE_TYPES.tour]: endpoints.tours,
  [SERVICE_TYPES.hotel]: endpoints.hotels,
  [SERVICE_TYPES.transport]: endpoints.transports,
};

const SERVICE_DETAIL_ENDPOINTS = {
  [SERVICE_TYPES.tour]: endpoints.tours,
  [SERVICE_TYPES.hotel]: endpoints.hotels,
  [SERVICE_TYPES.transport]: endpoints.transports,
};

const normalizeServiceType = (type) => {
  const normalized = String(type || "").toLowerCase();
  return SERVICE_DETAIL_ENDPOINTS[normalized] ? normalized : SERVICE_TYPES.tour;
};

const formatBasePrice = (item) => {
  if (item?.base_price_display) return item.base_price_display;

  const value = item?.base_price;
  const number = Number(value);

  if (value === null || value === undefined || Number.isNaN(number)) {
    return "N/A";
  }

  return number.toLocaleString("vi-VN");
};

const mapServiceListItem = (item, type) => ({
  id: String(item.id),
  name: item.name,
  description: item.description,
  star_rating: item.star_rating,
  base_price: item.base_price,
  base_price_display: formatBasePrice(item),
  city: item.city,
  category: item.category,
  type,
  empty_slot: item.empty_slot,
  time_start: item.time_start,
  is_active: item.is_active,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

export const fetchCategories = async () => {
  const res = await Apis.get(endpoints.categories);
  return res?.data?.results ?? res?.data ?? [];
};

export const fetchCities = async () => {
  const res = await Apis.get(endpoints.cities);
  return res?.data?.results ?? res?.data ?? [];
};

export const fetchPlaces = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.tours}?${queryParams}`
    : endpoints.tours;

  const res = await Apis.get(url);
  const items = res?.data?.results ?? [];
  return items.map((item) => mapServiceListItem(item, SERVICE_TYPES.tour));
};

export const fetchPlaceDetail = async (id, serviceType = SERVICE_TYPES.tour) => {
  if (!id) return null;
  const type = normalizeServiceType(serviceType);
  const endpoint = SERVICE_DETAIL_ENDPOINTS[type];
  const res = await Apis.get(`${endpoint}${id}/`);
  const data = res?.data ?? null;
  return data ? { ...data, type } : null;
};

export const addWishlist = async ({ token, serviceId, tourId }) => {
  const id = serviceId ?? tourId;
  if (!token || !id) throw new Error("Missing token or serviceId");
  const res = await authApis(token).post(endpoints.wishlist, {
    service_id: Number(id),
  });
  return res?.data ?? null;
};

export const removeWishlist = async ({ token, serviceId, tourId }) => {
  const id = serviceId ?? tourId;
  if (!token || !id) throw new Error("Missing token or serviceId");
  const res = await authApis(token).delete(`${endpoints.wishlist}${id}/`);
  return res?.data ?? null;
};

export const fetchWishlist = async ({ token }) => {
  if (!token) return [];
  const res = await authApis(token).get(endpoints.wishlist);
  const items = res?.data?.results ?? [];
  return items
    .map((item) => item.service?.id ?? item.service_id ?? item.travel_tour?.id ?? item.tour_id ?? item.tour?.id ?? item.tour)
    .filter(Boolean)
    .map(String);
};

export const fetchWishListItems = async ({ token }) => {
  if(!token) return [];
  const res = await authApis(token).get(endpoints.wishlist);
  const items = res?.data?.results ?? [];
  return items
    .map((item) => item.service ?? item.travel_tour)
    .filter(Boolean)
    .map((item) => ({
      ...item,
      type: item.type || 'tour',
      base_price_display: formatBasePrice(item),
    }));
};


export const fetchBookings = async ({ token, filters = {} }) => {
  if (!token) return [];

  const res = await authApis(token).get(endpoints.bookings, {
    params: filters,
  });

  const data = res?.data ?? [];
  return Array.isArray(data) ? data : data.results ?? [];
};

export const createBooking = async ({ token, payload }) => {
  if (!token) throw new Error("Missing token");
  if (!payload?.service) throw new Error("Missing service");

  const res = await authApis(token).post(endpoints.bookings, payload);
  return res?.data ?? null;
};

export const cancelBooking = async ({ token, bookingId }) => {
  if (!token) throw new Error("Missing token");
  if (!bookingId) throw new Error("Missing bookingId");

  const res = await authApis(token).post(
    `${endpoints.bookings}${bookingId}/cancel/`,
  );

  return res?.data ?? null;
};

export const createPayment = async ({
  token,
  bookingId,
  method = "STATIC_QR",
}) => {
  if (!token) throw new Error("Missing token");
  if (!bookingId) throw new Error("Missing bookingId");

  const res = await authApis(token).post(endpoints.payments, {
    booking: bookingId,
    payment_method: method,
  });

  return res?.data ?? null;
};

export const fetchPayments = async ({ token, filters = {} }) => {
  if (!token) return [];

  const res = await authApis(token).get(endpoints.payments, {
    params: filters,
  });

  const data = res?.data ?? [];
  return Array.isArray(data) ? data : data.results ?? [];
};

export const fetchPaymentDetail = async ({ token, paymentId }) => {
  if (!token) return null;
  if (!paymentId) return null;

  const res = await authApis(token).get(`${endpoints.payments}${paymentId}/`);
  return res?.data ?? null;
};

export const confirmStaticQrPayment = async ({
  token,
  paymentId,
  result = "success",
  providerTransactionId,
}) => {
  if (!token) throw new Error("Missing token");
  if (!paymentId) throw new Error("Missing paymentId");

  const payload = {
    result,
  };

  if (providerTransactionId) {
    payload.provider_transaction_id = providerTransactionId;
  }

  const res = await authApis(token).post(
    `${endpoints.payments}${paymentId}/static-qr-confirmation/`,
    payload,
  );

  return res?.data ?? null;
};

export const cancelPayment = async ({ token, paymentId }) => {
  if (!token) throw new Error("Missing token");
  if (!paymentId) throw new Error("Missing paymentId");

  const res = await authApis(token).post(
    `${endpoints.payments}${paymentId}/cancel/`,
  );

  return res?.data ?? null;
};
export const fetchDashboardStats = async ({ token, filters = {} }) => {
  if (!token) return null;

  const res = await authApis(token).get(`${endpoints.providerStats}revenue/`, {
    params: filters,
  });

  return res?.data ?? null;
};


export const fetchHotels = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.hotels}?${queryParams}`
    : endpoints.hotels;

  const res = await Apis.get(url);
  const items = res?.data?.results ?? res?.data ?? [];
  return items.map((item) => mapServiceListItem(item, SERVICE_TYPES.hotel));
};

export const fetchTransports = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.transports}?${queryParams}`
    : endpoints.transports;

  const res = await Apis.get(url);
  const items = res?.data?.results ?? res?.data ?? [];
  return items.map((item) => mapServiceListItem(item, SERVICE_TYPES.transport));
};

export const createService = async ({ token, user, type, payload }) => {
  if (!token) throw new Error("Missing token");
  if (user?.is_verified_provider !== true) throw new Error(UNVERIFIED_PROVIDER_ERROR);
  const endpoint = SERVICE_ENDPOINTS[type];
  if (!endpoint) throw new Error("Invalid service type");

  const res = await authApis(token).post(endpoint, payload);
  return res?.data;
};

export const updateService = async ({ token, user, type, id, payload }) => {
  if (!token) throw new Error("Missing token");
  if (user?.is_verified_provider !== true) throw new Error(UNVERIFIED_PROVIDER_ERROR);
  if (!id) throw new Error("Missing service id");
  const endpoint = SERVICE_ENDPOINTS[type];
  if (!endpoint) throw new Error("Invalid service type");

  const res = await authApis(token).put(`${endpoint}${id}/`, payload);
  return res?.data;
};

export const deleteService = async ({ token, user, type, id }) => {
  if (!token) throw new Error("Missing token");
  if (user?.is_verified_provider !== true) throw new Error(UNVERIFIED_PROVIDER_ERROR);
  if (!id) throw new Error("Missing service id");
  const endpoint = SERVICE_ENDPOINTS[type];
  if (!endpoint) throw new Error("Invalid service type");

  const res = await authApis(token).delete(`${endpoint}${id}/`);
  return res?.data;
};
