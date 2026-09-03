import { Order, Food, Category, DailyStat } from "@/types";

// Real analytics, computed from whatever orders/foods/categories are
// already loaded on the client (via CatalogContext / OrderContext) — no
// separate API route needed, since the admin dashboard and analytics page
// already fetch the full order list for their other stat cards.
//
// This replaces data/analytics.ts, which was sample data used before the
// database existed. That file is left in place only as a content reference
// (see README.md), not imported by any page anymore.

function dateKey(d: Date): string {
  // Local calendar day (not UTC) — matches isToday() in app/admin/page.tsx,
  // so "today" means the same thing everywhere on the dashboard.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Buckets orders into the last `days` calendar days (oldest first, ending
 * today). "orders" counts every order placed that day, matching the
 * existing "Today's Orders" stat card; "revenue" counts only orders whose
 * paymentStatus is "paid", matching the existing "Today's Revenue" card —
 * so an unpaid/failed order shows up in the order count but not revenue,
 * consistent with how the rest of the dashboard already treats payment
 * status.
 */
export function buildDailyStats(orders: Order[], days: number): DailyStat[] {
  const today = new Date();
  const buckets: DailyStat[] = [];
  const indexByKey = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label =
      days <= 7
        ? d.toLocaleDateString(undefined, { weekday: "short" })
        : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    indexByKey.set(dateKey(d), buckets.length);
    buckets.push({ label, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const idx = indexByKey.get(dateKey(new Date(order.createdAt)));
    if (idx === undefined) continue; // outside the requested window
    buckets[idx].orders += 1;
    if (order.paymentStatus === "paid") {
      buckets[idx].revenue += order.total;
    }
  }

  return buckets;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  percentage: number;
}

/** Revenue by category, from paid orders' line items, highest first. */
export function buildCategoryPerformance(
  orders: Order[],
  foods: Food[],
  categories: Category[]
): CategoryPerformance[] {
  const categoryIdByFoodId = new Map(foods.map((f) => [f.id, f.categoryId]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const revenueByCategory = new Map<string, number>();

  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    for (const item of order.items) {
      // A food can be deleted after an order that included it was placed —
      // the order's line item still has the name/price it was purchased
      // at, but foodId won't resolve to a category anymore. Group those
      // under "Other" rather than dropping that revenue from the chart.
      const categoryId = categoryIdByFoodId.get(item.foodId);
      const name = (categoryId && categoryNameById.get(categoryId)) || "Other";
      const lineRevenue = item.price * item.quantity;
      revenueByCategory.set(name, (revenueByCategory.get(name) ?? 0) + lineRevenue);
    }
  }

  const totalRevenue = [...revenueByCategory.values()].reduce((sum, v) => sum + v, 0);

  return [...revenueByCategory.entries()]
    .map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface PopularFoodStat {
  name: string;
  unitsSold: number;
  revenue: number;
}

/** Best-selling foods by units sold, from paid orders' line items. */
export function buildPopularFoods(orders: Order[], limit = 5): PopularFoodStat[] {
  const statsByFoodId = new Map<string, PopularFoodStat>();

  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    for (const item of order.items) {
      const existing = statsByFoodId.get(item.foodId);
      const lineRevenue = item.price * item.quantity;
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += lineRevenue;
      } else {
        // Use the name stored on the order line, not a live food lookup —
        // this keeps working correctly even for a food that's since been
        // renamed or deleted, showing what was actually sold at the time.
        statsByFoodId.set(item.foodId, { name: item.name, unitsSold: item.quantity, revenue: lineRevenue });
      }
    }
  }

  return [...statsByFoodId.values()].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
}

/** Average order value across paid orders. Returns 0 if there are none yet. */
export function buildAverageOrderValue(orders: Order[]): number {
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  if (paid.length === 0) return 0;
  return Math.round(paid.reduce((sum, o) => sum + o.total, 0) / paid.length);
}
