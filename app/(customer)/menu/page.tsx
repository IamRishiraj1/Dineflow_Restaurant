import { Suspense } from "react";
import { MenuBrowser } from "@/components/customer/MenuBrowser";

export const metadata = {
  title: "Menu — DineFlow",
};

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Our Menu</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Everything on the menu, made to order
        </h1>
        <p className="mt-3 text-ink-500">
          Search by name, filter by category or price, and add your favorites straight to cart.
        </p>
      </div>
      <Suspense fallback={<div className="h-96" />}>
        <MenuBrowser />
      </Suspense>
    </div>
  );
}
