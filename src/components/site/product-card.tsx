import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/data/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blush-soft">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-primary backdrop-blur sm:left-4 sm:top-4">
            {product.badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {product.category}
          </div>
          <h3 className="mt-1 font-serif text-lg text-foreground sm:text-xl">{product.name}</h3>
        </div>
        <div className="whitespace-nowrap pt-1 text-sm text-primary">
          from ${product.priceFrom}
        </div>
      </div>
    </Link>
  );
}