"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  ChefHat,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/foods", label: "Foods", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember-500 text-ink-950">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold text-cream-50">DineFlow</span>
        </Link>
        <button
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="rounded-md p-1 text-ink-400 hover:text-cream-50 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {LINKS.map((link) => {
          const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-ember-500 text-cream-50" : "text-ink-300 hover:bg-ink-800 hover:text-cream-50"
              )}
            >
              <link.icon className="h-[18px] w-[18px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-cream-50"
        >
          <ArrowLeftRight className="h-[18px] w-[18px]" />
          Back to storefront
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink-950 lg:block">{content}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={onCloseMobile} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-up bg-ink-950 shadow-lift">{content}</aside>
        </div>
      )}
    </>
  );
}
