import { Transaction } from "@/types";
import { mockOrders } from "./orders";

// Derived directly from mockOrders so the numbers stay consistent across
// the Orders, Payments, and Analytics admin pages.
export const mockTransactions: Transaction[] = mockOrders.map((order, i) => ({
  id: `txn-${(5000 + i).toString()}`,
  orderId: order.orderNumber,
  amount: order.total,
  method: order.paymentMethod,
  status: order.paymentStatus,
  date: order.createdAt,
}));

export function getPaymentSummary() {
  const totalRevenue = mockTransactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);
  const paidCount = mockTransactions.filter((t) => t.status === "paid").length;
  const pendingCount = mockTransactions.filter((t) => t.status === "pending").length;
  const failedCount = mockTransactions.filter((t) => t.status === "failed").length;

  return { totalRevenue, paidCount, pendingCount, failedCount };
}
