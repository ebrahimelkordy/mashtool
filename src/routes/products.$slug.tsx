import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Truck, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, SectionHeading, PrimaryButton } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { LazyImage } from "@/components/ui/lazy-image";
import { productQuery } from "@/lib/queries";
import { submitReview } from "@/lib/api.functions";

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
              <LazyImage
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
                    <LazyImage src={img} alt="" className="h-full w-full object-cover" />
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
            <div className="mt-4 font-serif text-xl font-medium text-primary">
              Priced Upon Request & Order Evaluation
            </div>
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
              <span className="ml-1">(24 artisan reviews)</span>
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
                            {val.label || (val as any).name}
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

            <div className="mt-8 space-y-3">
              <Link
                to="/order/new"
                  search={(prev: any) => ({
                    ...prev,
                    productId: product.id,
                    quantity: quantity > 1 ? quantity : undefined,
                  })}
                className="block sm:inline-block w-full sm:w-auto"
              >
                <PrimaryButton className="w-full sm:w-auto text-center justify-center py-3.5 px-8 text-base">
                  Request Piece & Quote 🎯
                </PrimaryButton>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Estimated lead time: {product.leadTimeDays}. Exact price quoted after order review.
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

      {/* CUSTOMER REVIEWS & RATINGS */}
      <ProductReviewsSection productId={product.id} reviews={data.reviews || []} />

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

function ProductReviewsSection({
  productId,
  reviews: initialReviews,
}: {
  productId: string;
  reviews: any[];
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const reviews = initialReviews;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : "5.0";

  const addReview = useMutation({
    mutationFn: () =>
      submitReview({
        data: { productId, name: name.trim(), rating, comment: comment.trim() },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      setName("");
      setRating(5);
      setComment("");
      setShowForm(false);
      toast.success("شكراً لك! تم إضافة تقييمك بنجاح");
    },
    onError: () => toast.error("تعذر إضافة التقييم، يرجى المحاولة مرة أخرى"),
  });

  return (
    <section className="border-t border-border/60 bg-blush-soft/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <SectionHeading
              eyebrow="Customer Reviews & Ratings"
              title="آراء وتقييمات العملاء ⭐"
              description="اقرأ تجارب وتقييمات محبي الكروشيه أو أضف تقييمك الخاص بهذه القطعة."
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            {showForm ? "إلغاء التقييم" : "اكتب تقييمك الآن ✍️"}
          </button>
        </div>

        {/* SUMMARY STATS */}
        <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center sm:text-left">
            <div className="font-serif text-5xl font-bold text-primary">{avgRating}</div>
            <div className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(avgRating))
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              بناءً على {reviews.length} تقييم حقيقي
            </div>
          </div>

          <div className="h-12 w-px bg-border/60 hidden sm:block" />

          <div className="flex-1 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span>الجودة والتقفيل اليدوي</span>
              <div className="h-2 flex-1 rounded-full bg-blush overflow-hidden">
                <div className="h-full bg-primary w-[96%]" />
              </div>
              <span className="font-semibold text-foreground">96%</span>
            </div>
            <div className="flex items-center gap-2">
              <span>مطابقة الصور والتفاصيل</span>
              <div className="h-2 flex-1 rounded-full bg-blush overflow-hidden">
                <div className="h-full bg-primary w-[98%]" />
              </div>
              <span className="font-semibold text-foreground">98%</span>
            </div>
          </div>
        </div>

        {/* WRITE REVIEW FORM */}
        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addReview.mutate();
            }}
            className="mt-8 rounded-3xl border border-primary/20 bg-background p-6 shadow-md transition-all sm:p-8"
          >
            <h3 className="font-serif text-xl text-primary">إضافة تقييم جديد</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  الاسم بالكامل *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: سارة أحمد"
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  التقييم بالنجوم *
                </label>
                <div className="flex items-center gap-2 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="mr-2 text-sm font-semibold text-primary">{rating} من 5</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                رأيك وتجربتك مع المنتج *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تجربتك مع هذه القطعة الفنية..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={addReview.isPending || !name.trim() || !comment.trim()}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {addReview.isPending ? "جاري الإرسال..." : "إرسال التقييم 🌟"}
              </button>
            </div>
          </form>
        )}

        {/* REVIEWS LIST */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              لا توجد تقييمات مكتوبة لهذه القطعة بعد. كن أول من يشارك رأيه!
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (r.rating || 5)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">{r.comment}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}