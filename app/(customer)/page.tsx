import { Hero } from "@/components/customer/Hero";
import { CategoryCard } from "@/components/customer/CategoryCard";
import { FoodCard } from "@/components/customer/FoodCard";
import { WhyChooseUs } from "@/components/customer/WhyChooseUs";
import { RestaurantStory } from "@/components/customer/RestaurantStory";
import { CTASection } from "@/components/customer/CTASection";
import { LinkButton } from "@/components/ui/Button";
import { categories } from "@/data/categories";
import { getPopularFoods } from "@/data/foods";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const popularFoods = getPopularFoods(8);

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
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
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
