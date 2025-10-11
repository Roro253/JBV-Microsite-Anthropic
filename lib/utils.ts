import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, options: Intl.NumberFormatOptions = {}) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...options
  }).format(value);
};

export const formatBillions = (value: number) => `${value.toLocaleString("en-US", {
  maximumFractionDigits: 1
})}B`;
