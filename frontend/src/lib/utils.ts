import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string | number, lastUpdated?: number): string {
  const timestamp = new Date(date);
  const formatted = timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  if (lastUpdated) {
    const secondsAgo = Math.floor((Date.now() - lastUpdated) / 1000);
    return `${formatted} (${secondsAgo}s ago)`;
  }

  return formatted;
}
