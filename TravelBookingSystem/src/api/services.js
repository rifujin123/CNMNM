import Apis, { endpoints } from "../../configs/Apis";

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
