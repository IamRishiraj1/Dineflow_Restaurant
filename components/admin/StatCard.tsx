import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconClassName?: string;
}

export function StatCard({ label, value, icon: Icon, trend, iconClassName }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-ink-900">{value}</p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-ember-50", iconClassName)}>
          <Icon className="h-5 w-5 text-ember-600" />
        </span>
      </div>
      {trend && (
        <p className={cn("mt-3 text-xs font-medium", trend.positive ? "text-success-600" : "text-error-500")}>
          {trend.positive ? "▲" : "▼"} {trend.value} vs. yesterday
        </p>
      )}
    </div>
  );
}
