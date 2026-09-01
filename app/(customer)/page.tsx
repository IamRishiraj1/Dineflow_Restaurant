import { Hero } from "@/components/customer/Hero";
import { CategoryCard } from "@/components/customer/CategoryCard";
import { FoodCard } from "@/components/customer/FoodCard";
import { WhyChooseUs } from "@/components/customer/WhyChooseUs";
import { RestaurantStory } from "@/components/customer/RestaurantStory";
import { CTASection } from "@/components/customer/CTASection";
import { LinkButton } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeCategory, serializeFood } from "@/lib/serializers";

// This is a Server Component, so it queries the database directly with
// Prisma rather than calling our own /api routes over HTTP — that's the
// idiomatic (and faster) pattern for Next.js Server Components. Everywhere
// else in the app that needs live data client-side (menu browsing, cart,
// admin) goes through CatalogContext -> the API routes instead, since
// those need to run after the page has already loaded in the browser.
export const revalidate = 0; // always fetch fresh data — this is a live storefront, not a static page

export default async function HomePage() {
  const [categories, popularFoods] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.food.findMany({ where: { isPopular: true, isAvailable: true }, take: 8 }),
  ]);

  const serializedCategories = categories.map(serializeCategory);
  const serializedFoods = popularFoods.map(serializeFood);

  return (
    <>
      <Hero />

      {/* Featured categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Browse</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">Featured Categories</h2>
          </div>
          <LinkButton href="/menu" variant="ghost" className="hidden sm:inline-flex">
            View full menu <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
        {serializedCategories.length === 0 ? (
          <p className="text-sm text-ink-400">No categories yet — add some from the admin dashboard.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
            {serializedCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Popular dishes */}
      <section className="bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-ember-600">Fan favorites</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">Popular Dishes</h2>
            </div>
            <LinkButton href="/menu" variant="ghost" className="hidden sm:inline-flex">
              See all <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          {serializedFoods.length === 0 ? (
            <p className="text-sm text-ink-400">No popular dishes marked yet — mark some as &quot;Popular&quot; from the admin dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {serializedFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <LinkButton href="/menu" variant="outline">
              View full menu
            </LinkButton>
          </div>
        </div>
      </section>

      <RestaurantStory />
      <WhyChooseUs />
      <CTASection />
    </>
  );
}
