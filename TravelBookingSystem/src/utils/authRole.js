export const getUserRole = (user) => {
  if (!user) return 'guest';
  if (user.is_provider === true) return 'provider';
  if (user.is_customer === true) return 'customer';
  return 'guest';
};

export const isAuthenticated = (token, user) => {
  return Boolean(token && user);
};
