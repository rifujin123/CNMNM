import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  addWishlist,
  fetchWishlist,
  fetchWishListItems,
  removeWishlist,
} from "../api/services";

export const wishlistKeys = {
  all: ["wishlist"],
  ids: (token) => [...wishlistKeys.all, "ids", token],
  items: (token) => [...wishlistKeys.all, "items", token],
};

export default function useWishlist() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistIds = [] } = useQuery({
    queryKey: wishlistKeys.ids(token),
    queryFn: () => fetchWishlist({ token }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async ({ tourId, isAdd }) => {
      if (isAdd) {
        return addWishlist({ token, tourId });
      }

      return removeWishlist({ token, tourId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });

  const isWishlisted = (tourId) =>
    wishlistIds.some((id) => String(id) === String(tourId));

  const toggleWishlist = (item) => {
    const tourId = item?.id;
    if (!tourId || !token) return;

    const isAdd = !isWishlisted(tourId);
    mutation.mutate({ tourId: String(tourId), isAdd });
  };

  return {
    wishlistIds,
    isWishlisted,
    toggleWishlist,
    isLoading: mutation.isPending,
  };
}

export function useWishlistItems(options = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: wishlistKeys.items(token),
    queryFn: () => fetchWishListItems({ token }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}