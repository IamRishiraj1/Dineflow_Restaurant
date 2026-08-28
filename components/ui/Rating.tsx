import { Star } from "lucide-react";

export function Rating({ value, reviewCount, size = "sm" }: { value: number; reviewCount?: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <Star className={`${starSize} fill-ember-400 text-ember-400`} aria-hidden="true" />
      <span className="text-xs font-medium text-ink-700">{value.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-ink-400">({reviewCount})</span>
      )}
    </div>
  );
}
