import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility function to ensure amounts are limited to 2 decimal places
export function formatAmount(amount) {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  if (isNaN(amount)) {
    return 0;
  }
  return Number(amount.toFixed(2));
}
