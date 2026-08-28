import { Leaf, Timer, MousePointerClick, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Leaf,
    title: "Fresh ingredients",
    description: "Sourced daily from trusted local suppliers, never frozen.",
  },
  {
    icon: Timer,
    title: "Fast preparation",
    description: "Most dishes leave the kitchen in under 20 minutes.",
  },
  {
    icon: MousePointerClick,
    title: "Easy online ordering",
    description: "Browse, customize, and order in just a few taps.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Your details are protected at every step of the order.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Why DineFlow</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
          Built around a better ordering experience
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember-50">
              <b.icon className="h-5 w-5 text-ember-600" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{b.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
