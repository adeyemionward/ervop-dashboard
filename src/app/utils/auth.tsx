  // utils/auth.js (or directly inside your component)


  // utils/auth.ts
  import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

  export const logout = (router?: AppRouterInstance) => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Redirect to login page
    if (router) {
      router.push('/auth/login');
    } else {
      window.location.href = '/auth/login';
    }
  };

