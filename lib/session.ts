import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { session: null, error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { session, error: null };
}

// The public portfolio demo login (see components/DemoBanner.tsx and the
// README) shares ONE account across every visitor. Most admin actions are
// safe to leave fully open — that's the whole point of the demo — but
// anything that overwrites shared, publicly-visible content (the menu,
// categories, restaurant settings, uploaded images) needs to stay
// protected, or the first visitor to misuse it ruins the demo for
// everyone after them. Order status updates and payment reconciliation
// are deliberately NOT restricted here — that's the actual "try the
// backend" experience this demo exists to show off, and re-clicking a
// status dropdown or marking a test order paid doesn't damage anything.
export const DEMO_ADMIN_EMAIL = "demo@dineflow.example";

export function isDemoAccount(email?: string | null) {
  return email?.toLowerCase() === DEMO_ADMIN_EMAIL;
}

export function demoRestrictedError() {
  return NextResponse.json(
    {
      error:
        "This action is turned off on the public demo account so the portfolio stays intact for the next visitor. Everything else — including the full order status and payment workflow — is open to try.",
    },
    { status: 403 }
  );
}