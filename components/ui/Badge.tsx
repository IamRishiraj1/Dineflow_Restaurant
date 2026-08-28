import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "info";

const styles: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success-600",
  warning: "bg-ember-50 text-ember-600",
  error: "bg-error-50 text-error-600",
  neutral: "bg-ink-100 text-ink-600",
  info: "bg-ink-900 text-cream-50",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
