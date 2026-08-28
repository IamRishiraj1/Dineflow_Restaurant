import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="animate-fade-in">
          <span className="inline-flex items-center rounded-full border border-ember-500/40 bg-ember-500/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-ember-300">
            Now delivering across Dhaka
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-cream-50 sm:text-5xl lg:text-[3.4rem]">
            Good food,
            <br />
            served without friction.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-300 sm:text-lg">
            Order chef-prepared meals in a few taps. Fresh ingredients, fast kitchens,
            and a checkout that gets out of your way.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/menu" size="lg">
              Order Now
            </LinkButton>
            <LinkButton href="/menu" variant="outline" size="lg" className="border-ink-700 text-cream-50 hover:bg-ink-800">
              Explore Menu
            </LinkButton>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-ink-300">
            <ShieldCheck className="h-[18px] w-[18px] text-success-500" />
            <span>Secure checkout · Fresh ingredients · 15,000+ happy orders</span>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3.2] w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2rem] bg-ember-500/10 blur-2xl" aria-hidden="true" />
          <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80&auto=format&fit=crop"
              alt="Chef plating a freshly prepared gourmet burger with fries"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-cream-50 px-5 py-4 shadow-lift sm:block">
            <p className="font-display text-2xl font-semibold text-ink-900">18 min</p>
            <p className="text-xs text-ink-500">average prep time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
