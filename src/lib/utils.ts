import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD', options?: Intl.NumberFormatOptions) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      ...options,
    }).format(amount);
  } catch (error) {
    // Fallback for invalid currency code, which can happen if userProfile is loading
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      ...options
    }).format(amount);
  }
}
