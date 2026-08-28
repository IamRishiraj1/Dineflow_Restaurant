import { Category } from "@/types";

// Images use remote Unsplash URLs for the prototype. Swap the `image` field
// for a local path under /public/images/categories/ when real assets are
// ready — no other code needs to change.
export const categories: Category[] = [
  {
    id: "cat-burgers",
    name: "Burgers",
    slug: "burgers",
    description: "Juicy grilled patties, toasted buns",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-pizza",
    name: "Pizza",
    slug: "pizza",
    description: "Wood-fired, hand-tossed classics",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-chicken",
    name: "Chicken",
    slug: "chicken",
    description: "Crispy, grilled, and glazed",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-pasta",
    name: "Pasta",
    slug: "pasta",
    description: "Slow-cooked sauces, fresh herbs",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-desserts",
    name: "Desserts",
    slug: "desserts",
    description: "Something sweet to finish",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-drinks",
    name: "Drinks",
    slug: "drinks",
    description: "Refreshing sips, hot or cold",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80&auto=format&fit=crop",
    isActive: true,
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
