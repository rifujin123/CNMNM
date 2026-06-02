import { authApis, endpoints } from "../../configs/Apis";

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
      next: null,
      previous: null,
      raw: data,
    };
  }
  return {
    items: data?.results ?? [],
    count: data?.count ?? data?.results?.length ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    raw: data,
  };
};

const requireToken = (token) => {
  if (!token) throw new Error("Missing admin token");
};

export const fetchAdminBookings = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.bookings, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
};

export const fetchAdminPayments = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.payments, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
};

export const fetchPendingProviders = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.providerPending, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
};

export const verifyProvider = async ({
  token,
  providerId,
  approved,
}) => {
  requireToken(token);
  if (!providerId) throw new Error("Missing providerId");

  const res = await authApis(token).patch(
    endpoints.providerVerification(providerId),
    {
      approved: Boolean(approved),
    },
  );

  return res?.data ?? null;
};

export const confirmStaticQrPayment = async ({
  token,
  paymentId,
  result = "success",
}) => {
  requireToken(token);
  if (!paymentId) throw new Error("Missing paymentId");

  const payload = { result };

  const res = await authApis(token).post(
    endpoints.confirmStaticQrPayment(paymentId),
    payload,
  );

  return res?.data ?? null;
};


export const refundBooking = async ({ token, bookingId }) => {
  requireToken(token);
  if (!bookingId) throw new Error("Missing bookingId");

  const res = await authApis(token).post(endpoints.bookingRefund(bookingId));
  return res?.data ?? null;
};

export const fetchAdminDashboard = async ({ token }) => {
  requireToken(token);

  const res = await authApis(token).get(endpoints.adminDashboard);
  return res?.data ?? {
    summary: {
      paid_revenue: "0.00",
      success_payment_count: 0,
      pending_payment_count: 0,
      total_bookings: 0,
      pending_provider_count: 0,
      total_services: 0,
      active_service_count: 0,
      inactive_service_count: 0,
    },
    booking_status_counts: {},
    payment_status_counts: {},
    revenue_by_service_type: [],
    recent_pending_payments: [],
  };
};