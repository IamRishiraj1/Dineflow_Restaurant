import Image from "next/image";

export function RestaurantStory() {
  return (
    <section className="bg-cream-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card lg:order-1">
          <Image
            src="https://images.unsplash.com/photo-1760169799369-2b8574466735?w=1000&q=80&auto=format&fit=crop"
            alt="Chefs preparing dishes together in the DineFlow kitchen"
            fill
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Our story</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            A neighborhood kitchen, run like a modern kitchen should be
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            DineFlow started as a single kitchen in Dhaka focused on one idea: food this good
            shouldn&apos;t come with a complicated ordering process. Today our kitchen team preps
            every dish to order, and our platform gets it to you — or ready for pickup — without
            the wait.
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            No shortcuts on ingredients, no friction at checkout. Just food, made well, delivered
            simply.
          </p>
        </div>
      </div>
    </section>
  );
}
