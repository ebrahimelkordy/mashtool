import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Sun } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { LazyImage } from "@/components/ui/lazy-image";
const storyHero = "/images/story-hero.jpg";
const hands = "/images/artisan-hands.jpg";
const threads = "/images/threads.jpg";
const cords = "/images/cords-shadow.jpg";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — Mashtool" },
      {
        name: "description",
        content:
          "Woven with intention, bound in beauty. The philosophy and ritual behind every Mashtool piece.",
      },
      { property: "og:title", content: "Our Story — Mashtool" },
      { property: "og:description", content: "Woven with intention." },
    ],
  }),
  component: OurStory,
});

function OurStory() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="font-serif text-5xl leading-tight text-primary md:text-6xl">
              Knitted with Passion.
              <br />
              Tailored with Grace.
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              At Mashtool, every creation tells a story of craftsmanship and feminine elegance. Our atelier is dedicated to turning premium threads and luxury cotton yarns into timeless crochet art pieces that transform your sanctuary.
            </p>
          </div>
          <div className="aspect-square overflow-hidden rounded-3xl">
            <LazyImage src={storyHero} alt="Handcrafting process" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-blush-soft py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-3xl md:order-2">
              <LazyImage src={hands} alt="Artisan weaving by hand" className="h-full w-full object-cover" />
            </div>
            <div className="md:order-1">
              <span className="text-xs uppercase tracking-[0.2em] text-primary">Ethical Craftsmanship</span>
              <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                The Artisan Atelier
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The creative process begins long before the first stitch is knitted. We carefully source the finest ethically gathered fibers—organic cottons, soft merino wool, and vibrant yarns that bring warmth and texture to your living space.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Each piece is meticulously crafted by skilled women artisans. We blend traditional crochet techniques with modern minimalist aesthetics, ensuring every flower bouquet and accessory is truly unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary">Our Pledge</span>
            <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">Feminine Empowerment</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We believe in creating sustainable livelihoods for artisan women. Every purchase directly supports independent makers, preserving traditional heritage crochet skills for future generations.
            </p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl">
            <LazyImage src={threads} alt="Ethereal fibers" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-blush-soft py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center md:px-10">
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">Bespoke Commissions</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
            Have a custom space or specific vision? We collaborate directly with interior designers and homeowners to craft bespoke textile and crochet art.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl md:order-2">
            <LazyImage src={cords} alt="The final spell" className="h-full w-full object-cover" />
          </div>
          <div className="md:order-1">
            <h3 className="font-serif text-3xl text-foreground md:text-4xl">The Artisan's Touch</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Handcrafted with precision. The slight variations in tension are not flaws, but the unique
              signature of the human hand—a reminder that magic is alive and imperfectly beautiful.
            </p>
            <button className="mt-6 rounded-full border border-primary/40 px-6 py-2 text-sm text-primary transition-colors hover:bg-primary/5">
              Discover Bespoke
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}