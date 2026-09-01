import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names together, resolving conflicting Tailwind
 * utilities so the later class wins (e.g. a caller's `text-cream-50`
 * correctly overrides a variant's `text-ink-900`). Plain clsx() only
 * concatenates strings — it does NOT do this, and which class wins ends up
 * depending on Tailwind's generated stylesheet order instead of the order
 * they were passed in, which caused an invisible "Explore Menu" button
 * early on (its override className lost to the outline variant's text
 * color). Always use this instead of clsx() directly anywhere classes from
 * a prop might collide with a component's own defaults.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Bangladeshi Taka, e.g. 42500 -> "৳42,500". */
export function formatCurrency(amount: number): string {
  return `৳${Math.round(amount).toLocaleString("en-US")}`;
}

/** Format an ISO date string as a short, readable date + time. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format an ISO date string as just the date. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Generate a readable mock order number, e.g. "DF-48213". */
export function generateOrderNumber(): string {
  const random = Math.floor(10000 + Math.random() * 89999);
  return `DF-${random}`;
}

/** Generate a simple unique id for client-side mock records. */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Clamp a number between a min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Turn a name into a URL-safe slug, e.g. "Spicy Chicken!" -> "spicy-chicken".
 * Used server-side by the Foods/Categories API routes so a record created
 * via the API gets the same kind of slug the admin form would have made.
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}
