"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { OrderCard } from "@/components/order/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { LinkButton } from "@/components/ui/Button";

// For this prototype, "my orders" shows orders placed in this browser session
// plus a couple of the most recent mock orders, so the page never looks empty
// on a first visit. Once real auth exists, this will filter by the logged-in
// customer's id instead.
export default function MyOrdersPage() {
  const { orders } = useOrders();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const myOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">My Orders</h1>
      <p className="mt-1.5 text-sm text-ink-500">Track and review your past orders.</p>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
        ) : myOrders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No orders yet"
            description="When you place an order, it will show up here so you can track it any time."
            action={<LinkButton href="/menu">Browse Menu</LinkButton>}
          />
        ) : (
          myOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
