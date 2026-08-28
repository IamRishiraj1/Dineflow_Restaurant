"use client";

import { Wallet, ShoppingCart, Clock3, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { PopularFoodsList } from "@/components/admin/PopularFoodsList";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { useOrders } from "@/context/OrderContext";
import { useCatalog } from "@/context/CatalogContext";
import { last7DaysStats } from "@/data/analytics";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { orders } = useOrders();
  const { foods } = useCatalog();

  const todayRevenue = 42500;
  const todayOrders = 128;
  const pendingOrders = orders.filter((o) => ["placed", "confirmed", "preparing"].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const popularFoods = foods.filter((f) => f.isPopular).slice(0, 5);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={formatCurrency(todayRevenue)} icon={Wallet} trend={{ value: "12.4%", positive: true }} />
        <StatCard label="Today's Orders" value={String(todayOrders)} icon={ShoppingCart} trend={{ value: "8.1%", positive: true }} />
        <StatCard label="Pending Orders" value={String(pendingOrders)} icon={Clock3} />
        <StatCard label="Completed Orders" value={String(completedOrders)} icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-900">Revenue — Last 7 Days</h2>
          </div>
          <div className="mt-2">
            <RevenueChart data={last7DaysStats} />
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Top Selling Foods</h2>
          <div className="mt-4">
            <PopularFoodsList foods={popularFoods} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-1">
          <h2 className="font-display text-base font-semibold text-ink-900">Orders — Last 7 Days</h2>
          <div className="mt-2">
            <OrdersChart data={last7DaysStats} />
          </div>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-ink-900">Recent Orders</h2>
          <div className="mt-3">
            <RecentOrdersTable orders={recentOrders} />
          </div>
        </div>
      </div>
    </div>
  );
}
