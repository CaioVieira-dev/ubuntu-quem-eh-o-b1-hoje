import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    const firstInitial = parts[0]?.charAt(0).toUpperCase() ?? "";
    const lastInitial = parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "";

    return firstInitial + lastInitial;
  }

  const firstInitial = parts[0]?.charAt(0).toUpperCase() ?? "";
  const lastInitial = parts[0]?.charAt(1).toUpperCase() ?? "";

  return firstInitial + lastInitial;
}
