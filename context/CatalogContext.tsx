"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Food, Category } from "@/types";

export type NewFoodInput = Omit<Food, "id" | "rating" | "reviewCount"> & {
  rating?: number;
  reviewCount?: number;
};
export type NewCategoryInput = Omit<Category, "id">;

interface CatalogContextValue {
  foods: Food[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addFood: (input: NewFoodInput) => Promise<Food>;
  updateFood: (id: string, input: Partial<Food>) => Promise<Food>;
  deleteFood: (id: string) => Promise<void>;
  toggleFoodAvailability: (id: string) => Promise<Food>;
  addCategory: (input: NewCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryActive: (id: string) => Promise<Category>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

// The API returns extra fields (`category`, `createdAt`, `updatedAt`) that
// aren't part of the Food/Category types in types/index.ts. Rather than
// widen those shared types for every consumer in the app, the extra fields
// are just dropped here, at the one place that talks to the API.
function toFood(apiFood: Food & { category?: unknown; createdAt?: string; updatedAt?: string }): Food {
  const { category: _category, createdAt: _createdAt, updatedAt: _updatedAt, ...food } = apiFood;
  return food;
}
function toCategory(apiCategory: Category & { createdAt?: string; updatedAt?: string }): Category {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...category } = apiCategory;
  return category;
}

async function parseJsonOrThrow(res: Response) {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // response had no JSON body — fall through to the generic error below
  }
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return body;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        fetch("/api/foods"),
        fetch("/api/categories"),
      ]);
      const [foodsData, categoriesData] = await Promise.all([
        parseJsonOrThrow(foodsRes),
        parseJsonOrThrow(categoriesRes),
      ]);
      setFoods((foodsData as Parameters<typeof toFood>[0][]).map(toFood));
      setCategories((categoriesData as Parameters<typeof toCategory>[0][]).map(toCategory));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addFood(input: NewFoodInput): Promise<Food> {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = toFood(await parseJsonOrThrow(res) as Parameters<typeof toFood>[0]);
    setFoods((prev) => [created, ...prev]);
    return created;
  }

  async function updateFood(id: string, input: Partial<Food>): Promise<Food> {
    const res = await fetch(`/api/foods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const updated = toFood(await parseJsonOrThrow(res) as Parameters<typeof toFood>[0]);
    setFoods((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  }

  async function deleteFood(id: string): Promise<void> {
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    await parseJsonOrThrow(res);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  function toggleFoodAvailability(id: string): Promise<Food> {
    const current = foods.find((f) => f.id === id);
    if (!current) return Promise.reject(new Error("Food not found."));
    return updateFood(id, { isAvailable: !current.isAvailable });
  }

  async function addCategory(input: NewCategoryInput): Promise<Category> {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = toCategory(await parseJsonOrThrow(res) as Parameters<typeof toCategory>[0]);
    setCategories((prev) => [created, ...prev]);
    return created;
  }

  async function updateCategory(id: string, input: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const updated = toCategory(await parseJsonOrThrow(res) as Parameters<typeof toCategory>[0]);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }

  async function deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await parseJsonOrThrow(res);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleCategoryActive(id: string): Promise<Category> {
    const current = categories.find((c) => c.id === id);
    if (!current) return Promise.reject(new Error("Category not found."));
    return updateCategory(id, { isActive: !current.isActive });
  }

  return (
    <CatalogContext.Provider
      value={{
        foods,
        categories,
        isLoading,
        error,
        refetch,
        addFood,
        updateFood,
        deleteFood,
        toggleFoodAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}