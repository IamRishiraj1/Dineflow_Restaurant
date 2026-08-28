"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

// UI-only authentication. See README → "Future Architecture" for the plan
// to replace this with a real auth provider. Handlers below simulate a
// short network delay and then redirect, without validating credentials
// against any backend.
export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      showToast("Logged in successfully (mock)", "success");
      router.push("/");
    }, 600);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-cream-50">
          <ChefHat className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-500">Log in to track orders and check out faster.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-ember-500 focus:ring-ember-400"
            />
            Remember me
          </label>
          <button type="button" className="font-medium text-ember-600 hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Login"}
        </Button>

        <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          This is a prototype. Any email and password will work — no real account is created.
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-ember-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
