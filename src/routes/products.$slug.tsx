import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Truck, Star } from "lucide-react";
import { SiteLayout, SectionHeading, PrimaryButton } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { productQuery } from "@/lib/queries";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) {
      return {
        meta: [{ title: "Piece not found — Mashtool" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${product.name} — Mashtool` },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: `${product.name} — Mashtool` },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (data.product?.options) {
      for (const opt of data.product.options) {
        if (opt.values && opt.values.length > 0) {
          initial[opt.id] = opt.values[0].id;
        }
      }
    }
    return initial;
  });

  if (!data.product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Piece not found</h1>
          <p className="mt-3 text-muted-foreground">This thread may have been rewoven or removed.</p>
          <Link to="/products" className="mt-8 inline-block text-primary underline underline-offset-4">
            Browse the collections
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { product, related, testimonials } = data;
  const imageIndex = Math.min(active, product.images.length - 1);

  let optionsExtra = 0;
  if (product.options) {
    for (const opt of product.options) {
      const selectedValId = selectedOptions[opt.id];
      const valObj = opt.values.find((v) => v.id === selectedValId);
      if (valObj) {
        optionsExtra += valObj.priceDelta || 0;
      }
    }
  }
  const unitPrice = (product.priceFrom || 0) + optionsExtra;
  const calculatedPrice = unitPrice * quantity;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 md:px-10 md:pt-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-blush-soft">
              <img
                src={product.images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActive(i)}
                    className={`aspect-square overflow-hidden rounded-xl transition-all ${
                      imageIndex === i ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex rounded-full bg-blush/70 px-3 py-1 text-[11px] uppercase tracking-widest text-primary">
              {product.category}
            </div>
            <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 font-serif text-2xl text-primary">from ${product.priceFrom}</div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-foreground/70">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "text-primary/40"}`}
                  strokeWidth={1.5}
                />
              ))}
              <span className="ml-1">(24 woven tales)</span>
            </div>
            {product.options && product.options.length > 0 && (
              <div className="mt-6 space-y-4 border-t border-border pt-6">
                {product.options.map((opt) => (
                  <div key={opt.id}>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                      {opt.name} {opt.required && <span className="text-primary">*</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.id] === val.id;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({ ...prev, [opt.id]: val.id }))
                            }
                            className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-card text-foreground hover:border-primary/50"
                            }`}
                          >
                            {val.name}
                            {val.priceDelta > 0 && ` (+${val.priceDelta} EGP)`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Quantity:</label>
              <div className="flex items-center rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-lg font-medium hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-sm font-semibold min-w-[2rem] text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-lg font-medium hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/order/new"
                search={{
                  productId: product.id,
                  quantity: quantity > 1 ? quantity : undefined,
                }}
                className="block sm:inline-block w-full sm:w-auto"
              >
                <PrimaryButton className="w-full sm:w-auto text-center justify-center py-3.5 px-8 text-base">
                  Order Now — Total: {calculatedPrice} EGP
                </PrimaryButton>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Estimated lead time: {product.leadTimeDays}. Final price confirmed after review.
              </p>
            </div>
            <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm md:mt-10">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Handcrafted with ethically sourced fibers</span>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Free ethereal shipping on domestic orders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-24">
        <SectionHeading
          title="Echoes from the Loom"
          description="See how others have welcomed this magic into their spaces."
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 md:gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card p-6 shadow-sm sm:p-8">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" strokeWidth={1} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/85 sm:text-base">
                “{t.quote}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blush font-serif text-primary">
                  {t.initials}
                </div>
                <div className="text-sm text-muted-foreground">{t.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 md:px-10 md:pb-24">
          <SectionHeading eyebrow="You may also love" title="Threads nearby" />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}