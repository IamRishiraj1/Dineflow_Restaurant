import { formatCurrency } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  minimumOrder?: number;
}

export function CartSummary({ subtotal, deliveryFee, total, minimumOrder }: CartSummaryProps) {
  const belowMinimum = minimumOrder !== undefined && subtotal > 0 && subtotal < minimumOrder;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink-900">Order Summary</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Subtotal</dt>
          <dd className="font-medium text-ink-800">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Delivery fee</dt>
          <dd className="font-medium text-ink-800">{deliveryFee > 0 ? formatCurrency(deliveryFee) : "—"}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <p className="font-display text-base font-semibold text-ink-900">Total</p>
        <p className="font-display text-xl font-semibold text-ink-900">{formatCurrency(total)}</p>
      </div>
      {belowMinimum && (
        <p className="mt-3 rounded-lg bg-ember-50 px-3 py-2 text-xs text-ember-700">
          Minimum order is {formatCurrency(minimumOrder!)}. Add a bit more to check out.
        </p>
      )}
    </div>
  );
}
