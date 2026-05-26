import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Safely converts a Date or an ISO string (from unstable_cache deserialization) to a Date. */
export const toDate = (d: Date | string): Date => d instanceof Date ? d : new Date(d)
