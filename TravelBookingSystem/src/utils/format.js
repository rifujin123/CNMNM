export const SERVICE_TYPES = {
  tour: "tour",
  hotel: "hotel",
  transport: "transport",
};

export const SERVICE_LABELS = {
  [SERVICE_TYPES.tour]: "Tour",
  [SERVICE_TYPES.hotel]: "Hotel",
  [SERVICE_TYPES.transport]: "Transport",
};

export const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const formatMoney = (value, currency = "VND") => {
  const number = toNumber(value);
  return `${number.toLocaleString("vi-VN")} ${currency}`;
};

export const formatMoneyOrNA = (value) => {
  const number = toNumber(value);
  if (!number) return "N/A";
  return `${number.toLocaleString("vi-VN")} VND`;
};

export const formatBasePrice = (item) => {
  if (item?.base_price_display) return item.base_price_display;
  const value = typeof item === "object" ? item?.base_price : item;
  const number = toNumber(value);
  if (!number) return "N/A";
  return number.toLocaleString("vi-VN");
};

export const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getCityName = (service) => {
  if (!service?.city) return "Unknown location";
  if (typeof service.city === "string") return service.city;
  return service.city.name || "Unknown location";
};

export const getRouteLabel = (route) => {
  const fromCity = route?.from_city?.name || route?.from_city || "Unknown";
  const toCity = route?.to_city?.name || route?.to_city || "Unknown";
  return `${fromCity} to ${toCity}`;
};

export const isPastDate = (value) => {
  if (!value) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
};
