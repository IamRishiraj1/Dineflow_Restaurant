"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";
import { OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "placed", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const { orders, isLoading, error, updateOrderStatus, loadAll } = useOrders();
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (activeFilter === "all") return sorted;
    return sorted.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  async function handleStatusChange(orderId: string, orderNumber: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      showToast(`${orderNumber} marked as ${status}`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't update order status", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === filter.key
                ? "bg-ink-900 text-cream-50"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-100"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ClipboardList} title="No orders here" description="Nothing matches this filter yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-3 pl-5 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Items</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Payment</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-5 pl-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-ink-50 last:border-none hover:bg-ink-50/50">
                    <td className="py-3 pl-5 pr-4 font-medium text-ink-900">{order.orderNumber}</td>
                    <td className="py-3 pr-4 text-ink-600">{order.customer.fullName}</td>
                    <td className="py-3 pr-4 text-ink-500">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                    </td>
                    <td className="py-3 pr-4 font-medium text-ink-900">{formatCurrency(order.total)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "pending" ? "warning" : "error"}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-ink-400">{formatDateTime(order.createdAt)}</td>
                    <td className="py-3 pl-4 pr-5">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <Select
                          aria-label={`Update status for ${order.orderNumber}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, order.orderNumber, e.target.value as OrderStatus)
                          }
                          className="h-8 min-w-[9.5rem] py-0 text-xs"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              Set: {status}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
