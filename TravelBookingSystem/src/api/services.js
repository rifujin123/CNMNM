import Apis, { authApis, endpoints } from "../../configs/Apis";

export const fetchCategories = async () => {
  const res = await Apis.get(endpoints.categories);
  return res?.data ?? [];
};

export const fetchPlaces = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.tours}?${queryParams}`
    : endpoints.tours;

  const res = await Apis.get(url);
  const items = res?.data ?? [];
  return items.map((item, index) => ({
    id: String(item.id),
    name: item.name,
    star_rating: item.star_rating,
    base_price: item.base_price_display,
    city: item.city,
    category: item.category,
    type: 'tour',
  }));
};

export const fetchPlaceDetail = async (id) => {
  if (!id) return null;
  const res = await Apis.get(`${endpoints.tours}${id}/`);
  return res?.data ?? null;
};

export const addWishlist = async ({ token, tourId }) => {
  if (!token || !tourId) throw new Error("Missing token or tourId");
  const res = await authApis(token).post(endpoints.wishlist, {
    tour_id: Number(tourId),
  });
  return res?.data ?? null;
};

export const removeWishlist = async ({ token, tourId }) => {
  if (!token || !tourId) throw new Error("Missing token or tourId");
  const res = await authApis(token).delete(`${endpoints.wishlist}remove/?tour_id=${tourId}`);
  return res?.data ?? null;
};

export const fetchWishlist = async ({ token }) => {
  if (!token) return [];
  const res = await authApis(token).get(endpoints.wishlist);
  const items = res?.data?.results ?? [];
  return items
    .map((item) => item.travel_tour?.id ?? item.tour_id ?? item.tour?.id ?? item.tour ?? item.id)
    .filter(Boolean)
    .map(String);
};

export const fetchHotels = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.hotels}?${queryParams}`
    : endpoints.hotels;

  const res = await Apis.get(url);
  const items = res?.data ?? [];
  return items.map((item) => ({
    id: String(item.id),
    name: item.name,
    star_rating: item.star_rating,
    base_price: item.base_price,
    base_price_display: item.base_price ? `From ${item.base_price}` : "N/A",
    city: item.city,
    category: item.category,
    type: 'hotel',
  }));
};

export const fetchTransports = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);

  const url = queryParams.toString()
    ? `${endpoints.transports}?${queryParams}`
    : endpoints.transports;

  const res = await Apis.get(url);
  const items = res?.data ?? [];
  return items.map((item) => ({
    id: String(item.id),
    name: item.name,
    star_rating: item.star_rating,
    base_price: item.base_price,
    base_price_display: item.base_price ? `From ${item.base_price}` : "N/A",
    city: item.city,
    category: item.category,
    type: 'transport',
  }));
};
