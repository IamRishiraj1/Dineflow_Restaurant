import Link from "next/link";
import { ChefHat } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-cream-50">
        <ChefHat className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-3 max-w-sm text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-7 flex gap-3">
        <LinkButton href="/">Back to Home</LinkButton>
        <Link
          href="/menu"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-200 px-5 text-sm font-medium text-ink-800 hover:bg-ink-100"
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
}
