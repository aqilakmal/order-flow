import { useAtomValue } from "jotai";
import { sessionAtom } from "../store/auth";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useAuthHeader(): HeadersInit {
  const session = useAtomValue(sessionAtom);

  if (!session) return {};

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export function formatTimestamp(date: Date | string | number, lastUpdated?: number): string {
  const timestamp = new Date(date);
  const formatted = timestamp
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2");

  if (lastUpdated) {
    const secondsAgo = Math.floor((Date.now() - lastUpdated) / 1000);
    return `${formatted} (${secondsAgo}s ago)`;
  }

  return formatted;
}
