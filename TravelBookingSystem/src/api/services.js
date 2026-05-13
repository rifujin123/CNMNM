import Apis, { authApis, endpoints } from "../../configs/Apis";

export const fetchCategories = async () => {
  const res = await Apis.get(endpoints.categories);
  return res?.data ?? [];
};

export const fetchPlaces = async () => {
  const res = await Apis.get(endpoints.tours);
  const items = res?.data ?? [];
  return items.map((item, index) => ({
    id: String(item.id),
    name: item.name,
    star_rating: item.star_rating,
    base_price: item.base_price_display,
    city: item.city,
    color: index % 2 === 0 ? "#93C5FD" : "#86EFAC",
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
  const items = res?.data ?? [];
  return items
    .map((item) => item.travel_tour?.id ?? item.tour_id ?? item.tour?.id ?? item.tour ?? item.id)
    .filter(Boolean)
    .map(String);
};
