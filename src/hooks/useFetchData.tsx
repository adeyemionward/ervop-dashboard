import { useState, useEffect } from "react";

export const useFetchData = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token provided.");
        }

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
      } catch (err: unknown) {
      console.error("Fetching failed:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }

    };

    if (url && token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error };
};
