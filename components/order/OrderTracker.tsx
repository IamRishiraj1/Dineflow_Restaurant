import { Check, Package, ChefHat, Bell, PartyPopper, X } from "lucide-react";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "placed", label: "Order Placed", icon: Check },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Bell },
  { key: "completed", label: "Completed", icon: PartyPopper },
];

export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-error-50 bg-error-50 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-500 text-cream-50">
          <X className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-base font-semibold text-error-600">Order Cancelled</p>
          <p className="text-sm text-error-500/80">This order was cancelled and will not be prepared.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div>
      {/* Desktop: horizontal tracker */}
      <div className="hidden sm:flex sm:items-start">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isUpcoming = i > currentIndex;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted && "border-success-500 bg-success-500 text-cream-50",
                    isCurrent && "border-ember-500 bg-ember-500 text-cream-50 shadow-lift",
                    isUpcoming && "border-ink-200 bg-white text-ink-300"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 flex-1 rounded-full transition-colors",
                      isCompleted ? "bg-success-500" : "bg-ink-200"
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "mt-2.5 text-center text-xs font-medium",
                  isCurrent ? "text-ember-600" : isCompleted ? "text-success-600" : "text-ink-400"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical tracker */}
      <div className="flex flex-col gap-0 sm:hidden">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isUpcoming = i > currentIndex;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                    isCompleted && "border-success-500 bg-success-500 text-cream-50",
                    isCurrent && "border-ember-500 bg-ember-500 text-cream-50",
                    isUpcoming && "border-ink-200 bg-white text-ink-300"
                  )}
                >
                  {isCompleted ? <Check className="h-[18px] w-[18px]" /> : <step.icon className="h-[18px] w-[18px]" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("my-1 h-8 w-0.5 rounded-full", isCompleted ? "bg-success-500" : "bg-ink-200")} />
                )}
              </div>
              <div className="pb-6 pt-2">
                <p className={cn("text-sm font-medium", isCurrent ? "text-ember-600" : isCompleted ? "text-success-600" : "text-ink-400")}>
                  {step.label}
                </p>
                {isCurrent && <p className="text-xs text-ink-400">In progress</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
