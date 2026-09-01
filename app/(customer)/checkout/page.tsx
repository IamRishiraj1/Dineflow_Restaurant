"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, Banknote, Truck, Store, Info, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrderContext";
import { Input } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";
import { OrderType, PaymentMethod } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const { isLoading: catalogLoading } = useCatalog();
  const { placeOrder } = useOrders();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const deliveryFee = orderType === "delivery" ? 60 : 0;
  const total = subtotal + deliveryFee;

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@")) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (orderType === "delivery") {
      if (!form.address.trim()) next.address = "Delivery address is required";
      if (!form.city.trim()) next.city = "City is required";
      if (!form.postalCode.trim()) next.postalCode = "Postal code is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const order = await placeOrder({
        customer: { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() },
        delivery:
          orderType === "delivery"
            ? { address: form.address.trim(), city: form.city.trim(), postalCode: form.postalCode.trim() }
            : null,
        orderType,
        paymentMethod,
        items,
        subtotal,
        deliveryFee,
        total,
      });

      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong placing your order. Please try again."
      );
    }
  }

  if (!isHydrated || catalogLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Your cart is empty. Add a few dishes before heading to checkout."
          action={<LinkButton href="/menu">Explore Menu</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Checkout</h1>
      <p className="mt-1.5 text-sm text-ink-500">Fill in your details to place your order.</p>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Customer information */}
          <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink-900">Customer Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  error={errors.fullName}
                  placeholder="Your full name"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                error={errors.phone}
                placeholder="01XXX-XXXXXX"
              />
            </div>
          </section>

          {/* Order type */}
          <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink-900">Order Type</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                  orderType === "delivery" ? "border-ember-500 bg-ember-50" : "border-ink-200 hover:bg-ink-50"
                )}
              >
                <Truck className={cn("h-5 w-5", orderType === "delivery" ? "text-ember-600" : "text-ink-400")} />
                <span className="text-sm font-semibold text-ink-900">Delivery</span>
                <span className="text-xs text-ink-500">Delivered to your address</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                  orderType === "pickup" ? "border-ember-500 bg-ember-50" : "border-ink-200 hover:bg-ink-50"
                )}
              >
                <Store className={cn("h-5 w-5", orderType === "pickup" ? "text-ember-600" : "text-ink-400")} />
                <span className="text-sm font-semibold text-ink-900">Pickup</span>
                <span className="text-xs text-ink-500">Collect from the restaurant</span>
              </button>
            </div>
          </section>

          {/* Delivery information */}
          {orderType === "delivery" && (
            <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card animate-fade-in">
              <h2 className="font-display text-lg font-semibold text-ink-900">Delivery Information</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Street address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    error={errors.address}
                    placeholder="House, road, area"
                  />
                </div>
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  error={errors.city}
                  placeholder="Dhaka"
                />
                <Input
                  label="Postal code"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  error={errors.postalCode}
                  placeholder="1212"
                />
              </div>
            </section>
          )}

          {/* Payment method */}
          <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink-900">Payment Method</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                  paymentMethod === "card" ? "border-ember-500 bg-ember-50" : "border-ink-200 hover:bg-ink-50"
                )}
              >
                <CreditCard className={cn("h-5 w-5", paymentMethod === "card" ? "text-ember-600" : "text-ink-400")} />
                <span className="text-sm font-semibold text-ink-900">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                  paymentMethod === "cash" ? "border-ember-500 bg-ember-50" : "border-ink-200 hover:bg-ink-50"
                )}
              >
                <Banknote className={cn("h-5 w-5", paymentMethod === "cash" ? "text-ember-600" : "text-ink-400")} />
                <span className="text-sm font-semibold text-ink-900">Cash on Delivery</span>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-ink-50 p-4 sm:grid-cols-2 animate-fade-in">
                <div className="sm:col-span-2">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" disabled />
                </div>
                <Input label="Expiry" placeholder="MM/YY" disabled />
                <Input label="CVC" placeholder="123" disabled />
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-ink-50 p-3.5 text-xs text-ink-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              This is a prototype — payment processing is mocked and no real charge will occur.
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink-900">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((line) => (
                <li key={line.food.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    <Image src={line.food.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{line.food.name}</p>
                    <p className="text-xs text-ink-400">Qty {line.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-ink-900">
                    {formatCurrency(line.food.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-4 text-sm">
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
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
              {submitError}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Placing order…" : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
