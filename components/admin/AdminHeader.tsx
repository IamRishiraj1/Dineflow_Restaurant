"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, ChevronDown, LogOut } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { formatDateTime } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/foods": "Food Management",
  "/admin/categories": "Category Management",
  "/admin/orders": "Order Management",
  "/admin/payments": "Payments",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export function AdminHeader({ pathname, onOpenMobile }: { pathname: string; onOpenMobile: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: session } = useSession();
  const { orders } = useOrders();
  const title = PAGE_TITLES[pathname] ?? "Admin";

  const name = session?.user?.name || "Admin";
  const isDemoAccount = session?.user?.email?.toLowerCase() === "demo@dineflow.example";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Real data now — orders awaiting admin action, most recent first. This
  // list comes from the same `orders` the layout above is already polling
  // every 10 seconds, so it stays current without this component doing
  // any fetching of its own.
  const needsAttention = [...orders]
    .filter((o) => o.status === "placed" || o.status === "confirmed" || o.paymentStatus === "failed")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-cream-50/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-900 sm:text-xl">{title}</h1>
        {isDemoAccount && (
          <span
            title="Editing the menu, categories, settings, and image uploads are disabled on this shared demo account. Order status and payment actions are fully open."
            className="hidden rounded-full bg-ember-100 px-2.5 py-1 text-xs font-semibold text-ember-700 sm:inline-block"
          >
            Demo mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            <Bell className="h-5 w-5" />
            {needsAttention.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ember-500" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-ink-100 bg-white p-3 shadow-lift animate-fade-in">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Needs attention
              </p>
              <div className="mt-1 max-h-72 space-y-1 overflow-y-auto">
                {needsAttention.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-ink-400">Nothing needs attention right now.</p>
                ) : (
                  needsAttention.map((order) => (
                    <Link
                      key={order.id}
                      href="/admin/orders"
                      onClick={() => setNotifOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <span className="font-medium text-ink-900">{order.orderNumber}</span>
                      {order.paymentStatus === "failed" ? " — payment failed" : ` — ${order.status}`}
                      <span className="block text-xs text-ink-400">{formatDateTime(order.createdAt)}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-2.5 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-cream-50">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-ink-800 sm:inline">{name}</span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:inline" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-xl border border-ink-100 bg-white p-1.5 shadow-lift animate-fade-in">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

