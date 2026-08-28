import Link from "next/link";
import { Order } from "@/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function OrderCard({ order }: { order: Order }) {
  const itemsSummary = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");

  return (
    <Link
      href={`/track-order/${order.id}`}
      className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-sm font-semibold text-ink-900">{order.orderNumber}</p>
          <OrderStatusBadge status={order.status} />
          <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "pending" ? "warning" : "error"}>
            {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Payment pending" : "Payment failed"}
          </Badge>
        </div>
        <p className="mt-1.5 line-clamp-1 text-sm text-ink-500">{itemsSummary}</p>
        <p className="mt-1 text-xs text-ink-400">{formatDateTime(order.createdAt)}</p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
        <p className="font-display text-lg font-semibold text-ink-900">{formatCurrency(order.total)}</p>
        <span className="flex items-center gap-1 text-sm font-medium text-ember-600">
          View order <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
