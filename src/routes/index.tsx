import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, BadgeCheck } from "lucide-react";
import { SiteLayout, SectionHeading, PrimaryButton, GhostButton } from "@/components/site/site-layout";
import { ProductCard } from "@/components/site/product-card";
import { LazyImage } from "@/components/ui/lazy-image";
import { homeQuery } from "@/lib/queries";
import { howItWorks } from "@/lib/content";
import heroImage from "@/assets/hero-drape.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeQuery);
  },
  head: () => ({
    meta: [
      { title: "Mashtool — Woven with Ethereal Magic" },
      {
        name: "description",
        content:
          "Handcrafted tapestries, macramé art, and bespoke woven textiles made to order.",
      },
      { property: "og:title", content: "Mashtool — Woven with Ethereal Magic" },
      { property: "og:description", content: "Handcrafted tapestries and bespoke textiles designed to bring serene luxury to your sacred space." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  const { categories, featured } = data;
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-soft via-background to-background">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-6 md:grid-cols-2 md:gap-12 md:px-10 md:py-28">
          {/* Text block: Shown second on mobile, first on desktop */}
          <div className="order-2 md:order-1">
            <div className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Curated Seasonal Atelier
            </div>
            <h1 className="font-serif text-[2.5rem] leading-[1.05] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Crochet Elegance,
              <br />
              <em className="not-italic text-primary" style={{ fontStyle: "italic" }}>Crafted for You</em>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover unique handcrafted crochet flower bouquets, custom accessories, and home decor woven with premium threads to infuse warmth into your refined living spaces.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link to="/products" className="w-full sm:w-auto">
                <PrimaryButton className="w-full sm:w-auto">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </Link>
              <Link to="/special-order" className="w-full sm:w-auto">
                <GhostButton className="w-full sm:w-auto">Bespoke Request</GhostButton>
              </Link>
            </div>
          </div>
          {/* Image block: Shown first on mobile, second on desktop */}
          <div className="relative mx-auto w-full max-w-sm md:max-w-none order-1 md:order-2">
            <div className="aspect-square overflow-hidden rounded-full bg-blush shadow-[0_30px_80px_-30px_rgba(120,50,60,0.35)]">
              <LazyImage
                src={heroImage}
                alt="Hand-knitted crochet flowers and crafts"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden md:flex absolute bottom-2 left-0 w-56 rounded-2xl bg-card p-4 shadow-lg sm:bottom-8 sm:w-64 sm:p-5 md:-left-10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-base text-foreground">Artisan Knitted</div>
                  <div className="text-xs text-muted-foreground">Handcrafted with premium threads and grace.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE ENCHANTED COLLECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-24">
        <SectionHeading
          title="The Enchanted Collection"
          description="Curated pieces that blend the mystical with modern minimalism."
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:mt-14 md:grid-cols-2">
          {categories.slice(0, 4).map((cat, idx) => (
            <Link
              key={cat.slug}
              to="/categories/$slug"
              params={{ slug: cat.slug }}
              className={`group relative overflow-hidden rounded-3xl bg-blush-soft ${
                idx === 0 ? "aspect-[16/11] md:row-span-2 md:aspect-auto" : "aspect-[16/11] sm:aspect-[16/10]"
              }`}
            >
              <LazyImage
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-5 text-primary-foreground sm:p-6 md:p-8">
                <span className="mb-2 inline-flex w-fit rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
                  {cat.tagline}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl">{cat.name}</h3>
                <p className="mt-2 line-clamp-3 max-w-sm text-xs text-primary-foreground/85 sm:text-sm">
                  {cat.description}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm underline underline-offset-4">
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:px-10 md:pb-24">
        <SectionHeading eyebrow="Signature Pieces" title="Threads of the Moment" />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:mt-14 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-blush-soft py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 md:px-10">
          <SectionHeading
            eyebrow="How It Works"
            title="A Ritual, Not a Transaction"
            description="Each piece is made to order. Here is the path from your first thread of curiosity to a finished heirloom."
          />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:mt-16 md:grid-cols-5 md:gap-8">
            {howItWorks.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 font-serif text-lg text-primary">
                  {s.step}
                </div>
                <div className="mt-4 font-serif text-lg text-foreground">{s.title}</div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BESPOKE */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10 md:p-16">
          <div className="relative max-w-xl">
            <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-[10px] uppercase tracking-widest">
              Bespoke Enchantments
            </span>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl">Commission a Unique Piece</h2>
            <p className="mt-4 text-sm text-primary-foreground/85 sm:text-base">
              Let us weave your personal story into a one-of-a-kind creation. Our bespoke service
              offers dedicated design consultations to craft textiles that perfectly align with your
              vision.
            </p>
            <div className="mt-8">
              <Link to="/special-order" className="block sm:inline-block">
                <GhostButton className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto">
                  Discover Bespoke <ArrowRight className="h-4 w-4" />
                </GhostButton>
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
      </section>
    </SiteLayout>
  );
}
