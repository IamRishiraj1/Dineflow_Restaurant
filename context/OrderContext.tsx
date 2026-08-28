"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Order, OrderStatus, OrderType, PaymentMethod } from "@/types";
import { mockOrders } from "@/data/orders";
import { generateId, generateOrderNumber } from "@/lib/utils";
import { CartLine } from "./CartContext";

const STORAGE_KEY = "dineflow_orders";

export interface PlaceOrderInput {
  customer: { fullName: string; email: string; phone: string };
  delivery: { address: string; city: string; postalCode: string } | null;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface OrderContextValue {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: Order["paymentStatus"]) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isHydrated, setIsHydrated] = useState(false);

  // On mount, merge any locally-placed orders (from a previous session)
  // on top of the base mock orders.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedOrders: Order[] = JSON.parse(stored);
        // savedOrders already includes the full list (mock + placed) from
        // last session, so it fully replaces the initial mock-only state.
        setOrders(savedOrders);
      }
    } catch {
      // ignore malformed storage, fall back to mock orders
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, isHydrated]);

  function placeOrder(input: PlaceOrderInput): Order {
    const newOrder: Order = {
      id: generateId("ord"),
      orderNumber: generateOrderNumber(),
      customer: input.customer,
      delivery: input.delivery,
      orderType: input.orderType,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cash" ? "pending" : "paid",
      items: input.items.map((line) => ({
        foodId: line.food.id,
        name: line.food.name,
        price: line.food.price,
        quantity: line.quantity,
        image: line.food.image,
      })),
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      total: input.total,
      status: "placed",
      createdAt: new Date().toISOString(),
      estimatedReadyMinutes: 25 + Math.round(Math.random() * 15),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }

  function getOrder(id: string) {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  }

  function updateOrderStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function updatePaymentStatus(id: string, status: Order["paymentStatus"]) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)));
  }

  return (
    <OrderContext.Provider
      value={{ orders, placeOrder, getOrder, updateOrderStatus, updatePaymentStatus }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within an OrderProvider");
  return ctx;
}
