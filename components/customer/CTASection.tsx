import { LinkButton } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-8 py-14 text-center sm:px-16">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-ember-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-ember-500/20 blur-3xl" aria-hidden="true" />
        <h2 className="relative font-display text-3xl font-semibold text-cream-50 sm:text-4xl">
          Hungry already?
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-base text-ink-300">
          Your next favorite meal is a couple of taps away. Order now and track it from kitchen
          to doorstep.
        </p>
        <div className="relative mt-7">
          <LinkButton href="/menu" size="lg">
            Order Now
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
