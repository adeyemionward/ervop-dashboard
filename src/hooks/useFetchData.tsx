import { useState, useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export const useFetchData = <T,>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token provided.');
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          let errorMessage = `Failed to fetch data: ${res.status}`;
          try {
            const errorData = await res.json();
            if (errorData.message) errorMessage = errorData.message;
          } catch {}
          throw new Error(errorMessage);
        }

        const result: T = await res.json();
        setData(result);
      } catch (err: any) {
        console.error('Fetching failed:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (endpoint && token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [endpoint]);

  return { data, loading, error };
};
