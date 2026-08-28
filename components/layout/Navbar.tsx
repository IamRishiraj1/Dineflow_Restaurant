"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/menu?search=${encodeURIComponent(q)}` : "/menu");
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="DineFlow home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-cream-50">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink-900">
            DineFlow
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-ember-500 ${
                pathname === link.href ? "text-ember-500" : "text-ink-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  placeholder="Search dishes…"
                  aria-label="Search menu"
                  className="h-10 w-48 rounded-full border border-ink-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ember-400/50 lg:w-64"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>

          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ember-500 px-1 text-[10px] font-semibold text-cream-50">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/login"
            className="hidden h-10 items-center gap-1.5 rounded-full border border-ink-200 px-4 text-sm font-medium text-ink-800 hover:bg-ink-100 sm:flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            <User className="h-4 w-4" />
            Login
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-cream-50 px-4 pb-5 pt-3 md:hidden animate-slide-up">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes…"
              aria-label="Search menu"
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ember-400/50"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === link.href ? "bg-ember-50 text-ember-600" : "text-ink-800 hover:bg-ink-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-100">
              Login / Register
            </Link>
            <Link href="/my-orders" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-100">
              My Orders
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
