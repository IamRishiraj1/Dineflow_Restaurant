import { Food } from "@/types";

// Prices are in BDT (৳). Images are remote Unsplash placeholders — see
// README for how to swap in local /public assets later.
export const foods: Food[] = [
  {
    id: "food-001",
    name: "Classic Chicken Burger",
    slug: "classic-chicken-burger",
    description:
      "Grilled chicken breast, lettuce, tomato, and house mayo in a toasted brioche bun.",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-burgers",
    rating: 4.6,
    reviewCount: 214,
    prepTimeMinutes: 15,
    ingredients: ["Chicken breast", "Brioche bun", "Lettuce", "Tomato", "House mayo"],
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "food-002",
    name: "Smoky Beef Burger",
    slug: "smoky-beef-burger",
    description:
      "Char-grilled beef patty with smoked cheddar, caramelized onion, and BBQ sauce.",
    price: 380,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-burgers",
    rating: 4.8,
    reviewCount: 356,
    prepTimeMinutes: 18,
    ingredients: ["Beef patty", "Smoked cheddar", "Caramelized onion", "BBQ sauce", "Bun"],
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "food-003",
    name: "Margherita Pizza",
    slug: "margherita-pizza",
    description:
      "San Marzano tomato sauce, fresh mozzarella, and basil on a thin, hand-tossed crust.",
    price: 540,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pizza",
    rating: 4.7,
    reviewCount: 289,
    prepTimeMinutes: 20,
    ingredients: ["Tomato sauce", "Mozzarella", "Basil", "Olive oil", "Pizza dough"],
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "food-004",
    name: "Spicy Chicken Pizza",
    slug: "spicy-chicken-pizza",
    description:
      "Cajun-spiced chicken, jalapeños, red onion, and mozzarella with a chili drizzle.",
    price: 620,
    image:
      "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pizza",
    rating: 4.5,
    reviewCount: 178,
    prepTimeMinutes: 22,
    ingredients: ["Chicken", "Jalapeños", "Red onion", "Mozzarella", "Chili drizzle"],
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "food-005",
    name: "Alfredo Pasta",
    slug: "alfredo-pasta",
    description:
      "Fettuccine tossed in a silky parmesan cream sauce with cracked black pepper.",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pasta",
    rating: 4.4,
    reviewCount: 132,
    prepTimeMinutes: 18,
    ingredients: ["Fettuccine", "Parmesan", "Cream", "Butter", "Black pepper"],
    isAvailable: true,
  },
  {
    id: "food-006",
    name: "Spicy Arrabbiata Pasta",
    slug: "spicy-arrabbiata-pasta",
    description: "Penne in a fiery tomato-chili sauce with garlic and fresh parsley.",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pasta",
    rating: 4.3,
    reviewCount: 96,
    prepTimeMinutes: 16,
    ingredients: ["Penne", "Tomato", "Chili", "Garlic", "Parsley"],
    isAvailable: true,
  },
  {
    id: "food-007",
    name: "Buffalo Chicken Wings",
    slug: "buffalo-chicken-wings",
    description: "Crispy fried wings tossed in classic buffalo sauce, served with dip.",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-chicken",
    rating: 4.7,
    reviewCount: 241,
    prepTimeMinutes: 17,
    ingredients: ["Chicken wings", "Buffalo sauce", "Celery", "Blue cheese dip"],
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "food-008",
    name: "Honey Glazed Chicken",
    slug: "honey-glazed-chicken",
    description: "Pan-seared chicken thighs in a sticky honey-soy glaze with sesame.",
    price: 390,
    image:
      "https://images.unsplash.com/photo-1600555379765-f82335a7b1b0?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-chicken",
    rating: 4.6,
    reviewCount: 154,
    prepTimeMinutes: 20,
    ingredients: ["Chicken thigh", "Honey", "Soy sauce", "Garlic", "Sesame seeds"],
    isAvailable: true,
  },
  {
    id: "food-009",
    name: "Golden French Fries",
    slug: "golden-french-fries",
    description: "Crispy skin-on fries, double-fried and lightly salted.",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-chicken",
    rating: 4.5,
    reviewCount: 302,
    prepTimeMinutes: 10,
    ingredients: ["Potato", "Sea salt", "Sunflower oil"],
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "food-010",
    name: "Chocolate Fudge Brownie",
    slug: "chocolate-fudge-brownie",
    description: "Rich, fudgy brownie served warm with a dusting of cocoa.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-desserts",
    rating: 4.8,
    reviewCount: 187,
    prepTimeMinutes: 8,
    ingredients: ["Dark chocolate", "Butter", "Eggs", "Flour", "Cocoa powder"],
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "food-011",
    name: "New York Cheesecake",
    slug: "new-york-cheesecake",
    description: "Creamy baked cheesecake on a buttery biscuit base with berry compote.",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1547414368-ac947d00b91d?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-desserts",
    rating: 4.7,
    reviewCount: 143,
    prepTimeMinutes: 8,
    ingredients: ["Cream cheese", "Biscuit base", "Berry compote", "Sugar"],
    isAvailable: true,
  },
  {
    id: "food-012",
    name: "Mango Lassi",
    slug: "mango-lassi",
    description: "Chilled yogurt drink blended with ripe mango and a hint of cardamom.",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-drinks",
    rating: 4.6,
    reviewCount: 121,
    prepTimeMinutes: 5,
    ingredients: ["Mango", "Yogurt", "Sugar", "Cardamom"],
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "food-013",
    name: "Fresh Lime Soda",
    slug: "fresh-lime-soda",
    description: "Sparkling soda water with fresh lime juice, mint, and a touch of salt.",
    price: 110,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-drinks",
    rating: 4.3,
    reviewCount: 88,
    prepTimeMinutes: 4,
    ingredients: ["Soda water", "Lime", "Mint", "Salt"],
    isAvailable: true,
  },
  {
    id: "food-014",
    name: "Soft Drinks (Can)",
    slug: "soft-drinks-can",
    description: "Choice of Coke, Sprite, or Fanta — served ice cold.",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1609951651467-713256d1a3be?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-drinks",
    rating: 4.2,
    reviewCount: 67,
    prepTimeMinutes: 2,
    ingredients: ["Carbonated soft drink"],
    isAvailable: true,
  },
  {
    id: "food-015",
    name: "Pepperoni Pizza",
    slug: "pepperoni-pizza",
    description: "Loaded pepperoni, mozzarella, and a rich tomato base on a crisp crust.",
    price: 590,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pizza",
    rating: 4.7,
    reviewCount: 265,
    prepTimeMinutes: 20,
    ingredients: ["Pepperoni", "Mozzarella", "Tomato sauce", "Pizza dough"],
    isAvailable: true,
  },
  {
    id: "food-016",
    name: "Double Cheese Beef Burger",
    slug: "double-cheese-beef-burger",
    description: "Two beef patties, double cheddar, pickles, and secret sauce.",
    price: 460,
    image:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-burgers",
    rating: 4.9,
    reviewCount: 198,
    prepTimeMinutes: 19,
    ingredients: ["Beef patty x2", "Cheddar", "Pickles", "Secret sauce", "Bun"],
    isAvailable: true,
  },
  {
    id: "food-017",
    name: "Grilled Chicken Alfredo",
    slug: "grilled-chicken-alfredo",
    description: "Alfredo pasta topped with sliced grilled chicken breast and parsley.",
    price: 480,
    image:
      "https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-pasta",
    rating: 4.6,
    reviewCount: 109,
    prepTimeMinutes: 20,
    ingredients: ["Fettuccine", "Grilled chicken", "Cream sauce", "Parmesan"],
    isAvailable: false,
  },
  {
    id: "food-018",
    name: "Crispy Fried Chicken Bucket",
    slug: "crispy-fried-chicken-bucket",
    description: "6 pieces of our signature crispy fried chicken, spice-marinated overnight.",
    price: 690,
    image:
      "https://images.unsplash.com/photo-1624153064067-566cae78993d?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-chicken",
    rating: 4.8,
    reviewCount: 276,
    prepTimeMinutes: 25,
    ingredients: ["Chicken", "Signature spice blend", "Flour coating"],
    isAvailable: true,
    isPopular: true,
  },
  {
    id: "food-019",
    name: "Vanilla Bean Ice Cream",
    slug: "vanilla-bean-ice-cream",
    description: "Two scoops of Madagascar vanilla bean ice cream with a wafer.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-desserts",
    rating: 4.5,
    reviewCount: 92,
    prepTimeMinutes: 3,
    ingredients: ["Vanilla bean", "Cream", "Sugar", "Wafer"],
    isAvailable: true,
  },
  {
    id: "food-020",
    name: "Cold Brew Iced Coffee",
    slug: "cold-brew-iced-coffee",
    description: "Slow-steeped cold brew over ice with a splash of milk.",
    price: 190,
    image:
      "https://images.unsplash.com/photo-1586734565008-fbdbc166fd6c?w=800&q=80&auto=format&fit=crop",
    categoryId: "cat-drinks",
    rating: 4.6,
    reviewCount: 74,
    prepTimeMinutes: 4,
    ingredients: ["Cold brew coffee", "Milk", "Ice"],
    isAvailable: true,
  },
];

export function getFoodById(id: string): Food | undefined {
  return foods.find((f) => f.id === id);
}

export function getFoodBySlug(slug: string): Food | undefined {
  return foods.find((f) => f.slug === slug);
}

export function getRelatedFoods(food: Food, limit = 4): Food[] {
  return foods
    .filter((f) => f.categoryId === food.categoryId && f.id !== food.id)
    .slice(0, limit);
}

export function getPopularFoods(limit = 8): Food[] {
  return foods.filter((f) => f.isPopular).slice(0, limit);
}

export function getFeaturedFoods(limit = 8): Food[] {
  return foods.filter((f) => f.isFeatured).slice(0, limit);
}
