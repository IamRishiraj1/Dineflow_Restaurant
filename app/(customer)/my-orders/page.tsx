"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { PackageSearch, LogIn } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { OrderCard } from "@/components/order/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { LinkButton } from "@/components/ui/Button";

// Now that real accounts exist, "my orders" is genuinely scoped to the
// logged-in customer via GET /api/orders?mine=true — a guest who checked
// out without an account can still track that one order directly via the
// link on their confirmation page, but won't have an order *history* here
// unless they register. That's an intentional trade-off, not a bug.
export default function MyOrdersPage() {
  const { status } = useSession();
  const { orders, isLoading, loadMine } = useOrders();

  useEffect(() => {
    if (status === "authenticated") {
      loadMine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const myOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">My Orders</h1>
        <p className="mt-1.5 text-sm text-ink-500">Track and review your past orders.</p>
        <div className="mt-8">
          <EmptyState
            icon={LogIn}
            title="Log in to see your orders"
            description="Create an account or log in to keep track of your order history in one place."
            action={<LinkButton href="/login">Log In</LinkButton>}
          />
        </div>
      </div>
    );
  }

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
