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
// model. See TODO.md Phase 4 for wiring in a real payment gateway, which
// will introduce a genuine separate Transaction record (gateway reference
// IDs, retries, refunds, etc.) instead of this 1:1 mapping.
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

  const transactions = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((o) => ({
      id: `txn-${o.id.slice(0, 10)}`,
      orderId: o.orderNumber,
      amount: o.total,
      method: o.paymentMethod,
      status: o.paymentStatus,
      date: o.createdAt,
    }));

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
            Cash-on-delivery orders show as pending until collected. Real gateway payments arrive in Phase 4.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-3 pl-5 pr-4 font-medium">Transaction ID</th>
                <th className="py-3 pr-4 font-medium">Order ID</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Method</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-ink-50 last:border-none hover:bg-ink-50/50">
                  <td className="py-3 pl-5 pr-4 font-mono text-xs text-ink-600">{txn.id}</td>
                  <td className="py-3 pr-4 font-medium text-ink-900">{txn.orderId}</td>
                  <td className="py-3 pr-4 font-medium text-ink-900">{formatCurrency(txn.amount)}</td>
                  <td className="py-3 pr-4 capitalize text-ink-600">{txn.method === "cash" ? "Cash on delivery" : "Card"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={txn.status === "paid" ? "success" : txn.status === "pending" ? "warning" : "error"}>
                      {txn.status}
                    </Badge>
                  </td>
                  <td className="py-3 pr-5 text-ink-400">{formatDateTime(txn.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
