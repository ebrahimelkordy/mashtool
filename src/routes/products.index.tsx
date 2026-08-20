import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout, SectionHeading } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { categoriesQuery, productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/products/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(productsQuery());
  },
  head: () => ({
    meta: [
      { title: "Collections — Mashtool" },
      {
        name: "description",
        content: "Browse handcrafted crochet, macrame and woven textiles from Mashtool.",
      },
      { property: "og:title", content: "Collections — Mashtool" },
      { property: "og:description", content: "Handcrafted textiles, made to order." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery());
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = products.filter(
    (p) =>
      (active === "all" || p.categorySlug === active) &&
      p.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-6 md:px-10 md:pt-24">
        <SectionHeading
          eyebrow="Curated Threads"
          title="Every piece, a small ceremony"
          description="Filter by collection or search for a specific piece. Every item is crafted to order."
        />

        <div className="mt-8 flex flex-col gap-4 md:mt-12 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            <FilterChip active={active === "all"} onClick={() => setActive("all")} label="All" />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
                label={c.name}
              />
            ))}
          </div>
          <label className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the loom…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 md:px-10 md:pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center md:p-16">
            <p className="font-serif text-xl text-foreground sm:text-2xl">
              No threads match your search
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing filters or exploring another collection.
            </p>
            <button
              onClick={() => {
                setActive("all");
                setQ("");
              }}
              className="mt-6 text-sm text-primary underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <p className="mt-14 text-center text-xs text-muted-foreground">
          Looking for something else?{" "}
          <Link to="/special-order" className="text-primary underline underline-offset-4">
            Commission a bespoke piece
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground/70 hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}
