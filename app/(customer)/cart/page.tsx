"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

export default function CartPage() {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeFromCart, isHydrated } = useCart();

  if (!isHydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse the menu to find something good."
          action={<LinkButton href="/menu">Explore Menu</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">Your Cart</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card lg:col-span-2">
          {items.map((line) => (
            <CartItemRow
              key={line.food.id}
              line={line}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <div className="space-y-4">
          <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} total={total} minimumOrder={200} />
          <LinkButton href="/checkout" fullWidth size="lg">
            Proceed to Checkout
          </LinkButton>
          <LinkButton href="/menu" variant="outline" fullWidth>
            Continue Shopping
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
