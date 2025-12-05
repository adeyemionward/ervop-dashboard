'use client';

import { useMemo } from 'react';

/**
 * Custom hook to calculate and return today's date in the standard YYYY-MM-DD format.
 * Uses useMemo to ensure the calculation only runs once per render,
 * though for a simple date calculation, it's primarily for convention.
 * * @returns {string} The current date formatted as 'YYYY-MM-DD'.
 */
export function useTodayDate(): string {
    // Use useMemo to calculate the date only once during the initial render 
    // and whenever the component re-renders (though there are no dependencies here).
    const todayDate = useMemo(() => {
        const today = new Date();
        
        // Get year
        const year = today.getFullYear();
        
        // Month is 0-indexed (0=Jan, 11=Dec), so add 1 and pad with '0'
        const month = String(today.getMonth() + 1).padStart(2, '0');
        
        // Pad day with '0'
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }, []); // Empty dependency array means this value is calculated once

    return todayDate;
}