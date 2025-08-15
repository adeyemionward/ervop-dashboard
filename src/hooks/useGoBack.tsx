import { useRouter } from 'next/navigation'; // Or 'next/router' for older versions

/**
 * A custom hook to get a function that navigates to the previous page.
 * @returns {() => void} A function that calls router.back().
 */
export const useGoBack = () => {
  const router = useRouter();

  // Define the function that will be returned
  const handleGoBack = () => {
    router.back();
  };
  return handleGoBack; // Return the function itself
};

