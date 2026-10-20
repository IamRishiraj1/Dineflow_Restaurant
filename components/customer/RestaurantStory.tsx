import Image from "next/image";

export function RestaurantStory() {
  return (
    <section className="bg-cream-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card lg:order-1">
          <Image
            src="https://images.pexels.com/photos/3938919/pexels-photo-3938919.jpeg?auto=compress&w=1260&h=750&dpr=1"
            alt="Chefs preparing dishes together in a restaurant kitchen"
            fill
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-sm font-medium uppercase tracking-wide text-ember-600">About this project</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            A restaurant ordering experience, built end to end
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            DineFlow is built around one idea: great food shouldn&apos;t come with a complicated
            ordering process. Customers browse, order, pay, and track their order live — while the
            restaurant side manages the menu, orders, and payments from a real admin dashboard.
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            The restaurant, kitchen, and menu shown here are example content for demonstration
            purposes; the platform behind them is fully functional.
          </p>
        </div>
      </div>
    </section>
  );
}
