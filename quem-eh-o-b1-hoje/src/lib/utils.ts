import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (
      (parts[0]?.charAt(0).toUpperCase() ?? "") +
      (parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "")
    );
  }

  return (
    parts[0]?.charAt(0).toUpperCase() ??
    "" + parts[0]?.charAt(1).toUpperCase() ??
    ""
  );
}
