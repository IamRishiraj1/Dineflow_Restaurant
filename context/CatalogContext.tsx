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
  addFood: (input: NewFoodInput) => Promise<void>;
  updateFood: (id: string, input: Partial<Food>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  toggleFoodAvailability: (id: string) => Promise<void>;
  addCategory: (input: NewCategoryInput) => Promise<void>;
  updateCategory: (id: string, input: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryActive: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

/** Throws a readable error if a fetch to our own API didn't come back ok. */
async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        fetch("/api/foods"),
        fetch("/api/categories"),
      ]);
      const [foodsData, categoriesData] = await Promise.all([
        unwrap<Food[]>(foodsRes),
        unwrap<Category[]>(categoriesRes),
      ]);
      setFoods(foodsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the menu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function addFood(input: NewFoodInput) {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await unwrap<Food>(res);
    setFoods((prev) => [created, ...prev]);
  }

  async function updateFood(id: string, input: Partial<Food>) {
    const res = await fetch(`/api/foods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const updated = await unwrap<Food>(res);
    setFoods((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }

  async function deleteFood(id: string) {
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    await unwrap<{ success: boolean }>(res);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  async function toggleFoodAvailability(id: string) {
    const current = foods.find((f) => f.id === id);
    if (!current) return;
    await updateFood(id, { isAvailable: !current.isAvailable });
  }

  async function addCategory(input: NewCategoryInput) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await unwrap<Category>(res);
    setCategories((prev) => [created, ...prev]);
  }

  async function updateCategory(id: string, input: Partial<Category>) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const updated = await unwrap<Category>(res);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function deleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await unwrap<{ success: boolean }>(res);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleCategoryActive(id: string) {
    const current = categories.find((c) => c.id === id);
    if (!current) return;
    await updateCategory(id, { isActive: !current.isActive });
  }

  return (
    <CatalogContext.Provider
      value={{
        foods,
        categories,
        isLoading,
        error,
        addFood,
        updateFood,
        deleteFood,
        toggleFoodAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
        refetch: loadAll,
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
