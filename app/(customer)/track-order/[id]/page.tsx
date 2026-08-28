"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store, Phone } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { OrderTracker } from "@/components/order/OrderTracker";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { LinkButton } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const { getOrder } = useOrders();
  const order = getOrder(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">Tracking order</p>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{order.orderNumber}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-ink-400">Placed {formatDateTime(order.createdAt)}</p>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <OrderTracker status={order.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
            {order.orderType === "delivery" ? <MapPin className="h-[18px] w-[18px] text-ember-500" /> : <Store className="h-[18px] w-[18px] text-ember-500" />}
            {order.orderType === "delivery" ? "Delivery details" : "Pickup details"}
          </h2>
          {order.orderType === "delivery" && order.delivery ? (
            <p className="mt-2 text-sm text-ink-600">
              {order.delivery.address}, {order.delivery.city} {order.delivery.postalCode}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-600">Collect your order at the restaurant counter.</p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
            <Phone className="h-3.5 w-3.5" /> {order.customer.phone}
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Order total</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-600">
            {order.items.map((item) => (
              <li key={item.foodId} className="flex justify-between">
                <span className="truncate pr-2">{item.quantity}× {item.name}</span>
                <span className="shrink-0 font-medium text-ink-800">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="text-sm font-semibold text-ink-900">Total</span>
            <span className="font-display text-lg font-semibold text-ink-900">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/my-orders" variant="outline" fullWidth>
          View All Orders
        </LinkButton>
        <LinkButton href="/menu" fullWidth>
          Order More
        </LinkButton>
      </div>
    </div>
  );
}
