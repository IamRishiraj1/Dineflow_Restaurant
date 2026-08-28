import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/menu?category=${category.slug}`}
      className="group relative flex h-40 shrink-0 w-40 flex-col justify-end overflow-hidden rounded-2xl shadow-card transition-transform duration-200 hover:-translate-y-1 sm:h-44 sm:w-full"
    >
      <Image
        src={category.image}
        alt=""
        fill
        sizes="(max-width: 640px) 160px, 20vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" aria-hidden="true" />
      <div className="relative p-4">
        <p className="font-display text-base font-semibold text-cream-50">{category.name}</p>
        <p className="text-xs text-cream-200/80">{category.description}</p>
      </div>
    </Link>
  );
}
