import { Link } from "wouter"
import type { Category } from "@/lib/products"

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/eshop?category=${category.id}`}>
      <div className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-border min-w-[72px] cursor-pointer hover:border-primary/40 transition-colors">
        <span className="text-2xl">{category.icon}</span>
        <span className="text-[11px] font-medium text-foreground text-center leading-tight whitespace-nowrap">
          {category.name}
        </span>
        <span className="text-[10px] text-muted-foreground">{category.count}</span>
      </div>
    </Link>
  )
}
