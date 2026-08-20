import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, SectionHeading } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { categoryQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(categoryQuery(params.slug)),
  head: ({ loaderData }) => {
    const category = loaderData?.category;
    if (!category) {
      return {
        meta: [
          { title: "Collection not found — Mashtool" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${category.name} — Mashtool` },
        { name: "description", content: category.description },
        { property: "og:title", content: `${category.name} — Mashtool` },
        { property: "og:description", content: category.description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(slug));

  if (!data.category) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Collection not found</h1>
          <Link to="/products" className="mt-8 inline-block text-primary underline underline-offset-4">
            Browse all collections
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { category, products } = data;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="aspect-[16/9] max-h-[420px] w-full overflow-hidden sm:aspect-[21/9]">
          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <div className="mx-auto -mt-20 max-w-3xl px-5 pb-2 text-center sm:px-6 md:-mt-28">
          <span className="inline-flex rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-primary backdrop-blur">
            {category.tagline}
          </span>
          <h1 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {category.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:px-10 md:py-20">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            New pieces are on the loom. Check back soon.
          </div>
        ) : (
          <>
            <SectionHeading eyebrow={`${products.length} pieces`} title="Pieces in this collection" />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}