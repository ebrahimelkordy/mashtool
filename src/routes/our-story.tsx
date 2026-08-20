import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Sun } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import storyHero from "@/assets/story-hero.jpg";
import hands from "@/assets/artisan-hands.jpg";
import threads from "@/assets/threads.jpg";
import cords from "@/assets/cords-shadow.jpg";

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
              Woven with Passion.
              <br />
              Tailored with Grace.
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              At Mashtool, every creation tells a story of craftsmanship and feminine elegance. Our atelier is dedicated to turning natural cotton and merino wool into timeless textile art pieces that transform your sanctuary.
            </p>
          </div>
          <div className="aspect-square overflow-hidden rounded-3xl">
            <img src={storyHero} alt="Handcrafting process" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={hands} alt="Artisan weaving by hand" className="h-full w-full object-cover" />
          </div>
          <div className="rounded-3xl bg-blush/60 p-10 md:p-12">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">The Artisan Atelier</h2>
            <p className="mt-4 leading-relaxed text-foreground/75">
              The creative process begins long before the first knot is tied. We carefully source the finest ethically gathered fibers—organic cottons, shimmering silks, and soft merino wools that bring warmth and texture to your living space.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/75">
              Each piece is meticulously crafted by skilled women artisans. We blend traditional knotting techniques with modern minimalist aesthetics, ensuring every tapestry and decor accessory is truly unique.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 text-center md:px-10">
        <h2 className="font-serif text-4xl text-primary md:text-5xl">The Elements of Our Craft</h2>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <img src={threads} alt="Ethereal fibers" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-6 left-6 text-primary-foreground">
              <div className="font-serif text-2xl">Ethereal Fibers</div>
              <div className="text-sm opacity-90">Sourced for their lightness and luminous qualities.</div>
            </div>
          </div>
          <div className="rounded-3xl bg-blush/60 p-10 text-center">
            <Sun className="mx-auto h-6 w-6 text-primary" />
            <h3 className="mt-3 font-serif text-2xl text-primary">Intention & Design</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
              Our patterns are born from dreams and ancient geometries. We do not mass-produce; we
              manifest. Every curve and cluster is designed to flow with the natural grace of the wearer.
            </p>
          </div>
          <div className="rounded-3xl bg-blush/60 p-10">
            <h3 className="font-serif text-2xl text-foreground">The Artisan's Touch</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
              Handcrafted with precision. The slight variations in tension are not flaws, but the unique
              signature of the human hand—a reminder that magic is alive and imperfectly beautiful.
            </p>
            <button className="mt-6 rounded-full border border-primary/40 px-6 py-2 text-sm text-primary transition-colors hover:bg-primary/5">
              Discover Bespoke
            </button>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <img src={cords} alt="The final spell" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-6 left-6 text-primary-foreground">
              <div className="font-serif text-2xl">The Final Spell</div>
              <div className="text-sm opacity-90">Washed in moonlight before it finds you.</div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}