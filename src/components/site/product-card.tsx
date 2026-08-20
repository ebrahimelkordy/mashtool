import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/data/types";
import { LazyImage } from "@/components/ui/lazy-image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blush-soft">
        <LazyImage
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-primary backdrop-blur sm:left-4 sm:top-4">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {product.category}
          </div>
          <h3 className="mt-0.5 font-serif text-base text-foreground sm:text-lg leading-tight truncate group-hover:text-primary transition-colors">{product.name}</h3>
        </div>
        <div className="whitespace-nowrap text-xs font-semibold tracking-wide text-primary/95 sm:pt-1">
          Priced Upon Request
        </div>
      </div>
    </Link>
  );
}