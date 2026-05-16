import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchPlaceDetail, fetchPlaces, fetchHotels, fetchTransports } from "../api/services";

export const tourKeys = {
  all: ["tours"],
  categories: () => [...tourKeys.all, "categories"],
  places: (params) => [...tourKeys.all, "places", params],
  detail: (id) => [...tourKeys.all, "detail", id],
  hotels: (params) => [...tourKeys.all, "hotels", params],
  transports: (params) => [...tourKeys.all, "transports", params],
};

export function useCategories(options = {}) {
  return useQuery({
    queryKey: tourKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function usePlaces(params = {}, options = {}) {
  return useQuery({
    queryKey: tourKeys.places(params),
    queryFn: () => fetchPlaces(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useHotels(params = {}, options = {}) {
  return useQuery({
    queryKey: tourKeys.hotels(params),
    queryFn: () => fetchHotels(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useTransports(params = {}, options = {}) {
  return useQuery({
    queryKey: tourKeys.transports(params),
    queryFn: () => fetchTransports(params),
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
