"use client";

import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";

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
  const title = PAGE_TITLES[pathname] ?? "Admin";

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
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ember-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-xl border border-ink-100 bg-white p-3 shadow-lift animate-fade-in">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Notifications
              </p>
              <div className="mt-1 space-y-1">
                <div className="rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-50">
                  3 new orders placed in the last hour
                </div>
                <div className="rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-50">
                  1 payment marked as failed
                </div>
                <div className="rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-50">
                  &quot;Grilled Chicken Alfredo&quot; is out of stock
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-2.5 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-cream-50">
            RA
          </span>
          <span className="hidden text-sm font-medium text-ink-800 sm:inline">Restaurant Admin</span>
          <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:inline" />
        </button>
      </div>
    </header>
  );
}
