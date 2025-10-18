// src/hooks/useAppointmentControls.ts
import { useAppointmentState } from "@/hooks/useAppointmentState";

export const useAppointmentControls = () => {
  // Call the original hook inside this custom hook
  const state = useAppointmentState();

  // Return the whole state object
  return state;
};
