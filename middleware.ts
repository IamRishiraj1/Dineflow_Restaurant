import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This runs before every request to a matched route (see `matcher` below).
// It's the page-level equivalent of the requireAdmin() checks already on
// every mutating API route — those protect the data, this protects the UI
// so a logged-out visitor never even sees the admin dashboard render.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Logged in, but not an admin — this shouldn't normally happen since
    // there's no self-registration path to the ADMIN role, but it's cheap
    // insurance against a future bug. Send them home rather than showing
    // a confusing "not authorized" page.
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // withAuth calls this to decide whether to run the `middleware`
      // function above at all. Returning false here sends the user
      // straight to the sign-in page (see pages.signIn in lib/auth.ts)
      // before the ADMIN check above ever runs.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
