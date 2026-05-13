import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchPlaceDetail, fetchPlaces } from "../api/services";

export const tourKeys = {
  all: ["tours"],
  categories: () => [...tourKeys.all, "categories"],
  places: () => [...tourKeys.all, "places"],
  detail: (id) => [...tourKeys.all, "detail", id],
};

export function useCategories(options = {}) {
  return useQuery({
    queryKey: tourKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function usePlaces(options = {}) {
  return useQuery({
    queryKey: tourKeys.places(),
    queryFn: fetchPlaces,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function usePlaceDetail(id, options = {}) {
  return useQuery({
    queryKey: tourKeys.detail(id),
    queryFn: () => fetchPlaceDetail(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
