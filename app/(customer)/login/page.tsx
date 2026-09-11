"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChefHat, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

const DEMO_EMAIL = "demo@dineflow.example";

// Wrapping in Suspense per Next's own guidance for useSearchParams() —
// this lets the DemoBanner's "?email=demo@dineflow.example" link
// pre-fill the field, and lets us show a "you're using the demo
// account" notice right on the form itself.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill) setEmail(prefill);
  }, [searchParams]);

  const isDemoLogin = email.trim().toLowerCase() === DEMO_EMAIL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showToast("Incorrect email or password.", "error");
        return;
      }

      showToast("Logged in successfully", "success");
      router.push("/");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
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

      {isDemoLogin && (
        <div className="mb-4 flex gap-2 rounded-xl border border-ember-200 bg-ember-50 p-3 text-sm text-ember-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Public demo account — feel free to explore everything, including updating order
            status and marking payments as collected. Editing the menu, categories, settings,
            and image uploads are disabled here so the demo stays intact for the next visitor.
          </p>
        </div>
      )}

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