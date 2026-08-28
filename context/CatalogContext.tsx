"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Food, Category } from "@/types";
import { foods as initialFoods } from "@/data/foods";
import { categories as initialCategories } from "@/data/categories";
import { generateId } from "@/lib/utils";

const FOODS_KEY = "dineflow_foods";
const CATEGORIES_KEY = "dineflow_categories";

export type NewFoodInput = Omit<Food, "id" | "rating" | "reviewCount"> & {
  rating?: number;
  reviewCount?: number;
};
export type NewCategoryInput = Omit<Category, "id">;

interface CatalogContextValue {
  foods: Food[];
  categories: Category[];
  addFood: (input: NewFoodInput) => void;
  updateFood: (id: string, input: Partial<Food>) => void;
  deleteFood: (id: string) => void;
  toggleFoodAvailability: (id: string) => void;
  addCategory: (input: NewCategoryInput) => void;
  updateCategory: (id: string, input: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryActive: (id: string) => void;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>(initialFoods);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedFoods = window.localStorage.getItem(FOODS_KEY);
      const storedCategories = window.localStorage.getItem(CATEGORIES_KEY);
      if (storedFoods) setFoods(JSON.parse(storedFoods));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
    } catch {
      // ignore malformed storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
  }, [foods, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories, isHydrated]);

  function addFood(input: NewFoodInput) {
    const newFood: Food = {
      ...input,
      id: generateId("food"),
      rating: input.rating ?? 4.5,
      reviewCount: input.reviewCount ?? 0,
    };
    setFoods((prev) => [newFood, ...prev]);
  }

  function updateFood(id: string, input: Partial<Food>) {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } : f)));
  }

  function deleteFood(id: string) {
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }

  function toggleFoodAvailability(id: string) {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, isAvailable: !f.isAvailable } : f)));
  }

  function addCategory(input: NewCategoryInput) {
    const newCategory: Category = { ...input, id: generateId("cat") };
    setCategories((prev) => [newCategory, ...prev]);
  }

  function updateCategory(id: string, input: Partial<Category>) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...input } : c)));
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleCategoryActive(id: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  }

  return (
    <CatalogContext.Provider
      value={{
        foods,
        categories,
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
