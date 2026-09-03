"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { defaultRestaurantSettings } from "@/data/restaurant";

export default function ContactPage() {
  const { showToast } = useToast();
  const settings = defaultRestaurantSettings;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // data.error is already a readable string from apiError /
        // apiValidationError — safe to show directly, no reformatting needed.
        showToast(data.error ?? "Something went wrong. Please try again.", "error");
        return;
      }

      showToast("Message sent — we'll get back to you soon", "success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      // fetch itself threw — a real network failure, not just a non-2xx response.
      showToast("Couldn't reach the server. Check your connection and try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Get in touch</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-ink-500">
          Questions about an order, catering, or partnerships? Send us a message and we&apos;ll respond
          within one business day.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card lg:col-span-3">
          <Input
            label="Your name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
          <Textarea
            label="Message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help?"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send Message"}
          </Button>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-base font-semibold text-ink-900">Visit or reach us</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" /> {settings.address}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-ember-500" /> {settings.phone}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-ember-500" /> {settings.email}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" />
                <span>
                  Mon – Thu: 10 AM – 10 PM
                  <br />
                  Fri: 2 PM – 11 PM
                  <br />
                  Sat – Sun: 10 AM – 11 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
