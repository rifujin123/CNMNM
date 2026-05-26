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

const SERVICE_ENDPOINTS = {
  tour: endpoints.tours,
  hotel: endpoints.hotels,
  transport: endpoints.transports,
};

const normalizeServiceItem = (item, type) => ({
  ...item,
  service_type: type,
});

const fetchServicePages = async ({ token, endpoint, params, type }) => {
  let nextUrl = endpoint;
  let nextParams = params;
  let items = [];
  let count = 0;

  while (nextUrl) {
    const res = await authApis(token).get(nextUrl, { params: nextParams });
    const data = normalizeListResponse(res?.data);

    items = [
      ...items,
      ...data.items.map((item) => normalizeServiceItem(item, type)),
    ];
    count = data.count || items.length;
    nextUrl = data.next;
    nextParams = undefined;
  }

  return {
    items,
    count,
    next: null,
    previous: null,
    raw: items,
  };
};



// ========================== Lấy Dữ Liệu Cho Admin ==========================
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
  providerTransactionId = "",
}) => {
  requireToken(token);
  if (!paymentId) throw new Error("Missing paymentId");

  const payload = { result };

  if (providerTransactionId) {
    payload.provider_transaction_id = providerTransactionId;
  }

  const res = await authApis(token).post(
    endpoints.confirmStaticQrPayment(paymentId),
    payload,
  );

  return res?.data ?? null;
};
// ==========================================================================


export const refundBooking = async ({ token, bookingId }) => {
  requireToken(token);
  if (!bookingId) throw new Error("Missing bookingId");

  const res = await authApis(token).post(endpoints.bookingRefund(bookingId));
  return res?.data ?? null;
};

export const fetchAdminServices = async ({
  token,
  type = "all",
  filters = {},
}) => {
  requireToken(token);

  const params = {
    admin: "true",
    ordering: "newest",
    ...filters,
  };

  if (type !== "all") {
    const endpoint = SERVICE_ENDPOINTS[type];
    if (!endpoint) throw new Error("Invalid service type");

    return fetchServicePages({ token, endpoint, params, type });
  }

  const responses = await Promise.all(
    Object.entries(SERVICE_ENDPOINTS).map(async ([serviceType, endpoint]) => {
      const data = await fetchServicePages({
        token,
        endpoint,
        params,
        type: serviceType,
      });

      return data.items;
    }),
  );

  const items = responses.flat();

  return {
    items,
    count: items.length,
    next: null,
    previous: null,
    raw: items,
  };
};

export const updateAdminServiceActive = async ({
  token,
  type,
  serviceId,
  isActive,
}) => {
  requireToken(token);
  if (!SERVICE_ENDPOINTS[type]) throw new Error("Invalid service type");
  if (!serviceId) throw new Error("Missing serviceId");

  const res = await authApis(token).patch(
    `${SERVICE_ENDPOINTS[type]}${serviceId}/`,
    { is_active: Boolean(isActive) },
  );

  return res?.data ?? null;
};


export const fetchAdminCategories = async ({ token, filters = {} }) => {
  requireToken(token);
  const res = await authApis(token).get(endpoints.categories, {
    params: filters,
  });
  return normalizeListResponse(res?.data);
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
