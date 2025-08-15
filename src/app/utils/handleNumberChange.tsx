import { ChangeEvent, Dispatch, SetStateAction } from 'react';

/**
 * A reusable function to handle number input changes for a React state hook.
 * It ensures the state is always a number (or 0 for invalid input).
 * * @param setter The `setState` function from a `useState<number>` hook.
 * @returns An `onChange` event handler for an input element.
 */
export const handleNumberChange = (setter: Dispatch<SetStateAction<number>>) => (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  // If the value is an empty string, we set the state to 0.
  // This ensures the state is always a number.
  if (value === '') {
    setter(0);
    return;
  }

  // Use parseInt to convert the string to a number, specifying base 10.
  const parsedValue = parseInt(value, 10);

  // Check if the parsed value is a valid number.
  // If it is, update the state. Otherwise, default to 0.
  if (!isNaN(parsedValue)) {
    setter(parsedValue);
  } else {
    setter(0);
  }
};
