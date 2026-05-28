import { useEffect, useState } from "react";
import {
  cancelPayment,
  fetchPaymentDetail,
  fetchPayments,
} from "../api/services";
import { useAuth } from "../../context/AuthContext";

const ACTIVE_PAYMENT_STATUSES = ["PENDING", "PROCESSING", "REVIEW"];

export function usePayments(filters = {}) {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const loadPayments = async (refresh = false) => {
    if (!token) {
      setData([]);
      return [];
    }

    try {
      refresh ? setIsRefetching(true) : setIsLoading(true);
      setIsError(false);
      const payments = await fetchPayments({ token, filters });
      setData(payments);
      return payments;
    } catch (err) {
      console.error("Load payments error:", err);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [token, JSON.stringify(filters)]);

  return {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch: () => loadPayments(true),
  };
}

export function usePayment(paymentId, options = {}) {
  const { token } = useAuth();
  const [data, setData] = useState(options.initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadPayment = async () => {
    if (!token || !paymentId) return null;

    try {
      setIsLoading(true);
      setIsError(false);
      const payment = await fetchPaymentDetail({ token, paymentId });
      setData(payment);
      return payment;
    } catch (err) {
      console.error("Load payment error:", err);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      loadPayment();
    }
  }, [token, paymentId, options.enabled]);

  useEffect(() => {
    if (!data || !ACTIVE_PAYMENT_STATUSES.includes(data.payment_status)) return;

    const interval = setInterval(() => {
      loadPayment();
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  return {
    data,
    isLoading,
    isError,
    refetch: loadPayment,
  };
}

export function useCancelPayment() {
  const { token } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const execute = async ({ paymentId }) => {
    try {
      setIsPending(true);
      return await cancelPayment({ token, paymentId });
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}
