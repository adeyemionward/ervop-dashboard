import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/utils/auth';

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const useAutoLogout = () => {
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode<DecodedToken>(token); // ✅ generic type
        const now = Date.now() / 1000; //in seconds

        if (decoded.exp && decoded.exp < now) {
          console.warn('⏰ Token expired — logging out automatically.');
          logout(router);
        }
      } catch (error) {
        console.error('Invalid token detected:', error);
        logout(router);
      }
    };

    // Check immediately
    checkToken();

    // Check every 30 seconds
    const interval = setInterval(checkToken, 30 * 1000);

    return () => clearInterval(interval);
  }, [router]);
};
