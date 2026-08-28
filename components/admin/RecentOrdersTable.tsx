import Link from "next/link";
import { Order } from "@/types";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
            <th className="py-3 pr-4 font-medium">Order</th>
            <th className="py-3 pr-4 font-medium">Customer</th>
            <th className="py-3 pr-4 font-medium">Amount</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-ink-50 last:border-none">
              <td className="py-3 pr-4">
                <Link href="/admin/orders" className="font-medium text-ink-900 hover:text-ember-600">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="py-3 pr-4 text-ink-600">{order.customer.fullName}</td>
              <td className="py-3 pr-4 font-medium text-ink-900">{formatCurrency(order.total)}</td>
              <td className="py-3 pr-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3 pr-4 text-ink-400">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
