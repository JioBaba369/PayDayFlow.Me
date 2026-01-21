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

export function exportToCsv(filename: string, data: any[]) {
  if (!data || data.length === 0) {
    return;
  }

  const replacer = (key: any, value: any) => value === null ? '' : value;
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => 
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
