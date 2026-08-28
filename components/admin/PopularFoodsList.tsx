import Image from "next/image";
import { Food } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function PopularFoodsList({ foods }: { foods: Food[] }) {
  return (
    <ul className="space-y-3">
      {foods.map((food, i) => (
        <li key={food.id} className="flex items-center gap-3">
          <span className="w-4 shrink-0 text-sm font-semibold text-ink-300">{i + 1}</span>
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
            <Image src={food.image} alt="" fill sizes="44px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{food.name}</p>
            <p className="text-xs text-ink-400">{formatCurrency(food.price)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
