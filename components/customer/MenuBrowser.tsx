"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { FoodCard } from "./FoodCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

const PRICE_RANGES = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under ৳200", min: 0, max: 200 },
  { label: "৳200 – ৳400", min: 200, max: 400 },
  { label: "৳400 – ৳600", min: 400, max: 600 },
  { label: "Over ৳600", min: 600, max: Infinity },
];

export function MenuBrowser() {
  const searchParams = useSearchParams();
  const { foods, categories } = useCatalog();

  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [sort, setSort] = useState<SortOption>("popular");

  // Keep local state in sync if the URL changes (e.g. navbar search, category card link).
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    if (urlSearch !== null) setQuery(urlSearch);
    if (urlCategory !== null) setActiveCategory(urlCategory);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceRangeIndex];
    let result = foods.filter((food) => {
      const matchesQuery =
        query.trim() === "" ||
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.description.toLowerCase().includes(query.toLowerCase());
      const category = categories.find((c) => c.id === food.categoryId);
      const matchesCategory = activeCategory === "all" || category?.slug === activeCategory;
      const matchesPrice = food.price >= range.min && food.price <= range.max;
      return matchesQuery && matchesCategory && matchesPrice;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = [...result].sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
    }
    return result;
  }, [query, activeCategory, priceRangeIndex, sort, foods, categories]);

  const visibleCategories = categories.filter((c) => c.isActive);

  return (
    <div>
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for burgers, pizza, pasta…"
            aria-label="Search menu"
            className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ember-400/50"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            aria-label="Sort menu items"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-12"
          >
            <option value="popular">Sort: Popular</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
          </Select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "bg-ink-900 text-cream-50"
              : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-100"
          )}
        >
          All Items
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.slug
                ? "bg-ink-900 text-cream-50"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-100"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Price:
        </span>
        {PRICE_RANGES.map((range, i) => (
          <button
            key={range.label}
            onClick={() => setPriceRangeIndex(i)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              priceRangeIndex === i
                ? "bg-ember-500 text-cream-50"
                : "bg-white text-ink-600 border border-ink-200 hover:bg-ink-100"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-ink-500">
        {filtered.length} {filtered.length === 1 ? "dish" : "dishes"} found
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes match your search"
            description="Try a different keyword, category, or price range."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
