"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { LinkButton } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { formatCurrency } from "@/lib/utils";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { getOrder } = useOrders();
  const order = getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-9 w-9 text-success-500" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900">Order confirmed!</h1>
        <p className="mt-2 text-ink-500">
          Thanks, {order.customer.fullName.split(" ")[0]}. We&apos;ve received your order and the kitchen is
          on it.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">Order number</p>
            <p className="font-display text-xl font-semibold text-ink-900">{order.orderNumber}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-ember-50 px-4 py-3 text-sm text-ember-700">
          <Clock className="h-4 w-4 shrink-0" />
          Estimated {order.orderType === "delivery" ? "delivery" : "pickup"} time: ~{order.estimatedReadyMinutes} minutes
        </div>

        <ul className="mt-5 divide-y divide-ink-100">
          {order.items.map((item) => (
            <li key={item.foodId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                <p className="text-xs text-ink-400">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
          <p className="font-display text-base font-semibold text-ink-900">Total paid</p>
          <p className="font-display text-xl font-semibold text-ink-900">{formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href={`/track-order/${order.id}`} fullWidth>
          Track Order
        </LinkButton>
        <LinkButton href="/my-orders" variant="outline" fullWidth>
          View My Orders
        </LinkButton>
        <LinkButton href="/menu" variant="ghost" fullWidth>
          Continue Shopping
        </LinkButton>
      </div>
    </div>
  );
}
