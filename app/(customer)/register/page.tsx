"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.includes("@")) next.email = "Enter a valid email";
    if (form.password.length < 6) next.password = "Use at least 6 characters";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      showToast("Account created successfully (mock)", "success");
      router.push("/");
    }, 600);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-cream-50">
          <ChefHat className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">Order faster and keep track of your history.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          placeholder="Your full name"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />
        <Input
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          placeholder="••••••••"
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>

        <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          This is a prototype. No real account is created and no data is sent anywhere.
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ember-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
