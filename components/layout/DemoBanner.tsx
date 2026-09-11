"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, LayoutDashboard } from "lucide-react";

// Shown on every customer-facing page so a recruiter browsing the live
// site actually discovers the admin dashboard exists — the ordering flow
// alone doesn't hint that there's a full backend behind it. Dismissal is
// remembered for the browser session only (not permanently), since most
// visitors here are one-time and it's worth resurfacing on a return visit.
const DISMISS_KEY = "dineflow-demo-banner-dismissed";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true); // default hidden until we check sessionStorage, to avoid a flash on first paint

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="relative bg-ink-950 px-4 py-2.5 text-sm text-cream-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 pr-8 text-center">
        <span className="font-medium text-cream-50">
          👋 This is a portfolio project — every feature here is fully real.
        </span>
        <Link
          href="/login?email=demo@dineflow.example"
          className="inline-flex items-center gap-1.5 rounded-full bg-ember-500 px-3 py-1 font-semibold text-ink-950 transition-colors hover:bg-ember-600"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Try the Admin Dashboard
        </Link>
        <span className="text-cream-300">
          Login: <code className="text-cream-50">demo@dineflow.example</code> / <code className="text-cream-50">TryMeOut2026</code>
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-300 hover:text-cream-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
