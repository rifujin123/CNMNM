import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { fetchPaymentDetail, fetchPayments } from "../api/services";

const ACTIVE_PAYMENT_STATUSES = ["PENDING", "PROCESSING", "REVIEW"];

export const paymentKeys = {
  all: ["payments"],
  list: (filters = {}) => [...paymentKeys.all, "list", filters],
  detail: (paymentId) => [...paymentKeys.all, "detail", String(paymentId)],
};

export function usePayments(filters = {}, options = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => fetchPayments({ token, filters }),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
    ...options,
  });
}

export function usePayment(paymentId, options = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => fetchPaymentDetail({ token, paymentId }),
    enabled: Boolean(token) && Boolean(paymentId),
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.payment_status;
      return ACTIVE_PAYMENT_STATUSES.includes(status) ? 5000 : false;
    },
    ...options,
  });
}