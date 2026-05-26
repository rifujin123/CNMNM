export const getUserRole = (user) => {
  if (!user) return 'guest';

  const normalizedRole = String(user.role || "").toLowerCase();

  if (user.is_staff === true || user.is_superuser === true || normalizedRole === "admin") return "admin";
  if (user.is_provider === true) return 'provider';
  if (user.is_customer === true) return 'customer';
  return 'guest';
};

export const isAuthenticated = (token, user) => {
  return Boolean(token && user);
};
