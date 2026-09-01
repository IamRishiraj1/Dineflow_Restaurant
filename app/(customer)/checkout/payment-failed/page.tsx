"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw } from "lucide-react";
import { LinkButton, Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrders } from "@/context/OrderContext";
import { formatCurrency } from "@/lib/utils";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const reason = searchParams.get("reason"); // "fail" | "cancel"
  const { fetchOrder } = useOrders();

  const [order, setOrder] = useState<Awaited<ReturnType<typeof fetchOrder>>>(undefined);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then(setOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleRetry() {
    if (!orderId) return;
    setIsRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch("/api/payments/sslcommerz/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Couldn't start a new payment attempt.");
      window.location.href = body.gatewayUrl;
    } catch (err) {
      setIsRetrying(false);
      setRetryError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
          <XCircle className="h-9 w-9 text-error-500" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900">
          {reason === "cancel" ? "Payment cancelled" : "Payment didn't go through"}
        </h1>
        <p className="mt-2 max-w-sm text-ink-500">
          {reason === "cancel"
            ? "You cancelled the payment before it completed. Your order is saved — you can try paying again."
            : "The payment gateway couldn't complete this transaction. No charge was made. Your order is saved — you can try again."}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        {order === undefined ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : order === null ? (
          <p className="text-sm text-ink-500">
            We couldn&apos;t find that order. If you were charged, please contact us with your payment
            reference.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-400">Order number</p>
              <p className="font-display text-lg font-semibold text-ink-900">{order.orderNumber}</p>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3">
              <p className="text-sm text-ink-500">Amount due</p>
              <p className="font-display text-lg font-semibold text-ink-900">{formatCurrency(order.total)}</p>
            </div>
          </>
        )}

        {retryError && (
          <p role="alert" className="mt-4 rounded-lg bg-error-50 px-3.5 py-2.5 text-sm text-error-600">
            {retryError}
          </p>
        )}

        {order && (
          <Button fullWidth size="lg" className="mt-5" onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw className="h-4 w-4" />
            {isRetrying ? "Redirecting to payment…" : "Try Payment Again"}
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/my-orders" variant="outline" fullWidth>
          View My Orders
        </LinkButton>
        <LinkButton href="/contact" variant="ghost" fullWidth>
          Contact Support
        </LinkButton>
      </div>
    </div>
  );
}
