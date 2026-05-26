import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { cancelBooking, createBooking, createPayment, fetchBookings } from "../api/services";

export const bookingKeys = {
  all: ["bookings"],
  list: (filters = {}) => [...bookingKeys.all, "list", filters],
};

export function useBookings(filters = {}) {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const loadBookings = async (refresh = false) => {
    if (!token) {
      setData([]);
      return [];
    }

    try {
      refresh ? setIsRefetching(true) : setIsLoading(true);
      setIsError(false);
      const bookings = await fetchBookings({ token, filters });
      setData(bookings);
      return bookings;
    } catch (err) {
      console.error("Load bookings error:", err);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [token, JSON.stringify(filters)]);

  return {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch: () => loadBookings(true),
  };
}

export function useCreateBooking() {
  const { token } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const execute = async ({ payload }) => {
    try {
      setIsPending(true);
      return await createBooking({ token, payload });
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}

export function useCancelBooking() {
  const { token } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const execute = async ({ bookingId }) => {
    try {
      setIsPending(true);
      return await cancelBooking({ token, bookingId });
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}

export function useCreatePayment() {
  const { token } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const execute = async ({ bookingId, method = "STATIC_QR" }) => {
    try {
      setIsPending(true);
      return await createPayment({ token, bookingId, method });
    } finally {
      setIsPending(false);
    }
  };

  return { execute, isPending };
}
