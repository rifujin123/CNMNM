export const getUserRole = (user) => {
  if (!user) return 'guest';

  return String(user.role || 'guest').toLowerCase();
};

export const isAuthenticated = (token, user) => {
  return Boolean(token && user);
};
