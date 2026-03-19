import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(value: unknown, pattern: string, fallback = '—'): string {
  if (!value) return fallback
  const date = new Date(value as string | number)
  if (isNaN(date.getTime())) return fallback
  return format(date, pattern)
}
