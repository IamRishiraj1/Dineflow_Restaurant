import { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

const CONFIG: Record<OrderStatus, { label: string; variant: "success" | "warning" | "error" | "neutral" | "info" }> = {
  placed: { label: "Placed", variant: "neutral" },
  confirmed: { label: "Confirmed", variant: "info" },
  preparing: { label: "Preparing", variant: "warning" },
  ready: { label: "Ready", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
