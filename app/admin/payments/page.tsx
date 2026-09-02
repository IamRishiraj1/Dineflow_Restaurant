"use client";

import { useEffect } from "react";
import { Wallet, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrders } from "@/context/OrderContext";
import { formatCurrency, formatDateTime } from "@/lib/utils";

// Transactions are derived directly from real orders — every order that
// exists has exactly one associated "transaction" in this simplified
// model, rather than a genuinely separate Transaction table supporting
// partial refunds, multiple attempts per order, etc. That's a reasonable
// simplification for now; revisit if refund tracking becomes a real need.
export default function AdminPaymentsPage() {
  const { orders, isLoading, loadAll } = useOrders();

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");
  const failedOrders = orders.filter((o) => o.paymentStatus === "failed");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const transactions = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={Wallet} />
        <StatCard label="Paid Orders" value={String(paidOrders.length)} icon={CheckCircle2} />
        <StatCard label="Pending Payments" value={String(pendingOrders.length)} icon={Clock3} />
        <StatCard label="Failed Payments" value={String(failedOrders.length)} icon={XCircle} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="border-b border-ink-100 p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">Transactions</h2>
          <p className="mt-1 text-sm text-ink-500">
            Cash on Delivery orders show as pending until collected. Online payments are processed
            via SSLCommerz — the Gateway Ref below is SSLCommerz&apos;s own validation id, useful if
            you ever need to look a payment up on their dashboard directly.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-3 pl-5 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Method</th>
                <th className="py-3 pr-4 font-medium">Gateway Ref</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((order) => (
                <tr key={order.id} className="border-b border-ink-50 last:border-none hover:bg-ink-50/50">
                  <td className="py-3 pl-5 pr-4 font-medium text-ink-900">{order.orderNumber}</td>
                  <td className="py-3 pr-4 font-medium text-ink-900">{formatCurrency(order.total)}</td>
                  <td className="py-3 pr-4 text-ink-600">
                    {order.paymentMethod === "cash" ? "Cash on Delivery" : "Online (SSLCommerz)"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-500">
                    {order.paymentValId ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant={
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3 pr-5 text-ink-400">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
