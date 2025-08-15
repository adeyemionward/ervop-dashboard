// utils/auth.js (or directly inside your component)
export const logout = (router:any) => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  router.push('/auth/login');
};
