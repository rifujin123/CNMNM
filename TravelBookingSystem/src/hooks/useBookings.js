import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from  "../../context/AuthContext";
import {cancelBooking,createBooking,createPayment,fetchBookings} from "../api/services";

export const bookingKeys = {
    all: ["bookings"],
    list: (filters = {}) => [...bookingKeys.all, "list", filters],
};

export function useBookings(filters = {}, options = {}){
    const {token } = useAuth();

    return useQuery({
        queryKey: bookingKeys.list(filters),
        queryFn: () => fetchBookings({token,filters}),
        enabled: Boolean(token),
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useCreateBooking() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }) => createBooking({ token, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useCancelBooking() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }) => cancelBooking({ token, bookingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useCreatePayment() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, method = "STATIC_QR" }) =>
      createPayment({ token, bookingId, method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}