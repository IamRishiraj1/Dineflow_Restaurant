"use client";

import { TrendingUp, Receipt } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { StatCard } from "@/components/admin/StatCard";
import {
  last30DaysStats,
  categoryPerformance,
  popularFoodsAnalytics,
  averageOrderValue,
} from "@/data/analytics";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_COLORS = ["#C2700E", "#17130F", "#2E7D53", "#DC8A2F", "#9C9284", "#E8A455"];

export default function AdminAnalyticsPage() {
  const totalRevenue30d = last30DaysStats.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders30d = last30DaysStats.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (30 days)" value={formatCurrency(totalRevenue30d)} icon={TrendingUp} />
        <StatCard label="Orders (30 days)" value={totalOrders30d.toLocaleString()} icon={Receipt} />
        <StatCard label="Average Order Value" value={formatCurrency(averageOrderValue)} icon={Receipt} />
        <StatCard label="Top Category" value="Pizza" icon={TrendingUp} />
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="font-display text-base font-semibold text-ink-900">Revenue Trend — Last 30 Days</h2>
        <div className="mt-2">
          <RevenueChart data={last30DaysStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Order Trend — Last 30 Days</h2>
          <div className="mt-2">
            <OrdersChart data={last30DaysStats} />
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Category Performance</h2>
          <div className="mt-4 space-y-3.5">
            {categoryPerformance.map((cat, i) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700">{cat.category}</span>
                  <span className="text-ink-500">{formatCurrency(cat.revenue)}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="border-b border-ink-100 p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">Most Popular Foods</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-3 pl-5 pr-4 font-medium">Food</th>
                <th className="py-3 pr-4 font-medium">Units Sold</th>
                <th className="py-3 pr-5 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {popularFoodsAnalytics.map((food) => (
                <tr key={food.name} className="border-b border-ink-50 last:border-none">
                  <td className="py-3 pl-5 pr-4 font-medium text-ink-900">{food.name}</td>
                  <td className="py-3 pr-4 text-ink-600">{food.unitsSold}</td>
                  <td className="py-3 pr-5 font-medium text-ink-900">{formatCurrency(food.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
