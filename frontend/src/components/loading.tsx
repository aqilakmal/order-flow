import { cn } from "../lib/utils";

interface LoadingProps {
  className?: string;
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={cn("h-14 w-14 animate-spin", className)}>
      <svg
        className="text-brand-500"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="stroke-current opacity-25" cx="25" cy="25" r="20" strokeWidth="5" />
        <circle
          className="stroke-current"
          cx="25"
          cy="25"
          r="20"
          strokeWidth="5"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
    </div>
  );
}
