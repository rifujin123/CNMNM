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

export const fetchAdminCategories = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.categories, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
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

export const createCategory = async ({ token, payload }) => {
  requireToken(token);
  const res = await authApis(token).post(endpoints.categories, payload);
  return res?.data ?? null;
};

export const updateCategory = async ({ token, categoryId, payload }) => {
  requireToken(token);
  if (!categoryId) throw new Error("Missing categoryId");

  const res = await authApis(token).patch(
    `${endpoints.categories}${categoryId}/`,
    payload,
  );

  return res?.data ?? null;
};

export const deleteCategory = async ({ token, categoryId }) => {
  requireToken(token);
  if (!categoryId) throw new Error("Missing categoryId");

  await authApis(token).delete(`${endpoints.categories}${categoryId}/`);
  return true;
};

export const fetchPromoBanners = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.promoBanners, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
};

export const createPromoBanner = async ({ token, payload }) => {
  requireToken(token);
  const res = await authApis(token).post(endpoints.promoBanners, payload);
  return res?.data ?? null;
};

export const updatePromoBanner = async ({ token, bannerId, payload }) => {
  requireToken(token);
  if (!bannerId) throw new Error("Missing bannerId");

  const res = await authApis(token).patch(
    `${endpoints.promoBanners}${bannerId}/`,
    payload,
  );

  return res?.data ?? null;
};

export const deletePromoBanner = async ({ token, bannerId }) => {
  requireToken(token);
  if (!bannerId) throw new Error("Missing bannerId");

  await authApis(token).delete(`${endpoints.promoBanners}${bannerId}/`);
  return true;
};
