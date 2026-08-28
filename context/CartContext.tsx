"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartItem, Food } from "@/types";
import { useCatalog } from "./CatalogContext";

const STORAGE_KEY = "dineflow_cart";
const DELIVERY_FEE = 60;

export interface CartLine {
  food: Food;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addToCart: (foodId: string, quantity?: number) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { foods } = useCatalog();
  const [rawItems, setRawItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage once, on mount (client-only).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setRawItems(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist any change back to localStorage.
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
  }, [rawItems, isHydrated]);

  function addToCart(foodId: string, quantity = 1) {
    setRawItems((prev) => {
      const existing = prev.find((i) => i.foodId === foodId);
      if (existing) {
        return prev.map((i) =>
          i.foodId === foodId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { foodId, quantity }];
    });
  }

  function updateQuantity(foodId: string, quantity: number) {
    setRawItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.foodId !== foodId);
      return prev.map((i) => (i.foodId === foodId ? { ...i, quantity } : i));
    });
  }

  function removeFromCart(foodId: string) {
    setRawItems((prev) => prev.filter((i) => i.foodId !== foodId));
  }

  function clearCart() {
    setRawItems([]);
  }

  const items: CartLine[] = useMemo(
    () =>
      rawItems
        .map((i) => {
          const food = foods.find((f) => f.id === i.foodId);
          if (!food) return null;
          return { food, quantity: i.quantity };
        })
        .filter((line): line is CartLine => line !== null),
    [rawItems, foods]
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);
  const deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
