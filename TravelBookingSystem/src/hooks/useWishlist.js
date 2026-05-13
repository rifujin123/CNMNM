import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { addWishlist, fetchWishlist, removeWishlist } from "../api/services";

const wishlistKeys = {
  all: ["wishlist"],
  byToken: (token) => ["wishlist", token],
};

export default function useWishlist() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = token ? wishlistKeys.byToken(token) : wishlistKeys.all;

  const { data: wishlistIds = [] } = useQuery({
    queryKey,
    queryFn: () => fetchWishlist({ token }),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async ({ tourId, isAdd }) => {
      try {
        if (isAdd) {
          await addWishlist({ token, tourId });
        } else {
          await removeWishlist({ token, tourId });
        }
      } catch (err) {
        console.error("Wishlist mutation error:", err?.response?.data || err.message);
        throw err;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const isWishlisted = (tourId) => wishlistIds.some((id) => String(id) === String(tourId));

  const toggleWishlist = (item) => {
    const tourId = item?.id;
    if (!tourId || !token) return;
    const isAdd = !isWishlisted(tourId);
    mutation.mutate({ tourId: String(tourId), isAdd });
  };

  return { wishlistIds, isWishlisted, toggleWishlist, isLoading: mutation.isPending };
}
