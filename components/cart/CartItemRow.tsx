"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartLine } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

interface CartItemRowProps {
  line: CartLine;
  onUpdateQuantity: (foodId: string, quantity: number) => void;
  onRemove: (foodId: string) => void;
}

export function CartItemRow({ line, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { food, quantity } = line;
  return (
    <div className="flex items-center gap-4 border-b border-ink-100 py-5 last:border-b-0">
      <Link href={`/menu/${food.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
        <Image src={food.image} alt={food.name} fill sizes="80px" className="object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/menu/${food.id}`} className="font-display text-sm font-semibold text-ink-900 hover:text-ember-600 sm:text-base">
          {food.name}
        </Link>
        <p className="mt-0.5 text-sm text-ink-400">{formatCurrency(food.price)} each</p>

        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-ink-200">
            <button
              onClick={() => onUpdateQuantity(food.id, quantity - 1)}
              aria-label={`Decrease quantity of ${food.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-medium text-ink-900" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(food.id, quantity + 1)}
              aria-label={`Increase quantity of ${food.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => onRemove(food.id)}
            aria-label={`Remove ${food.name} from cart`}
            className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-error-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-400"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>

      <p className="shrink-0 font-display text-sm font-semibold text-ink-900 sm:text-base">
        {formatCurrency(food.price * quantity)}
      </p>
    </div>
  );
}
