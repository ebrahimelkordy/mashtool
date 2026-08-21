import heroDrape from "@/assets/hero-drape.jpg";
import storyHero from "@/assets/story-hero.jpg";
import hands from "@/assets/artisan-hands.jpg";
import threads from "@/assets/threads.jpg";
import cords from "@/assets/cords-shadow.jpg";
import macrame from "@/assets/macrame-wall.jpg";
import herbBag from "@/assets/herb-bag.jpg";
import roseThrow from "@/assets/rose-throw.jpg";
import wallArt from "@/assets/wall-art.jpg";

const assetMap: Record<string, string> = {
  "/images/hero-drape.jpg": heroDrape,
  "/images/story-hero.jpg": storyHero,
  "/images/artisan-hands.jpg": hands,
  "/images/threads.jpg": threads,
  "/images/cords-shadow.jpg": cords,
  "/images/macrame-wall.jpg": macrame,
  "/images/herb-bag.jpg": herbBag,
  "/images/rose-throw.jpg": roseThrow,
  "/images/wall-art.jpg": wallArt,
  "/src/assets/hero-drape.jpg": heroDrape,
  "/src/assets/story-hero.jpg": storyHero,
  "/src/assets/artisan-hands.jpg": hands,
  "/src/assets/threads.jpg": threads,
  "/src/assets/cords-shadow.jpg": cords,
  "/src/assets/macrame-wall.jpg": macrame,
  "/src/assets/herb-bag.jpg": herbBag,
  "/src/assets/rose-throw.jpg": roseThrow,
  "/src/assets/wall-art.jpg": wallArt,
};

export function resolveImageUrl(src?: string | null, fallback = heroDrape, width = 650): string {
  if (!src) return fallback;
  if (assetMap[src]) return assetMap[src];
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    if (src.includes("images.unsplash.com")) {
      // Strip any existing width/quality params and inject optimized WebP params
      const baseUrl = src.split("?")[0];
      return `${baseUrl}?w=${width}&q=75&auto=format&fit=crop&fm=webp`;
    }
    return src;
  }
  
  // Try matching by filename (e.g. hero-drape.jpg)
  const filename = src.split("/").pop() || "";
  for (const [key, val] of Object.entries(assetMap)) {
    if (key.endsWith(filename)) return val;
  }
  
  return fallback;
}

export function getBlurImageUrl(src?: string | null, fallback = heroDrape): string {
  if (!src) return fallback;
  if (src.includes("images.unsplash.com")) {
    const baseUrl = src.split("?")[0];
    return `${baseUrl}?w=30&q=20&blur=10&auto=format&fit=crop&fm=webp`;
  }
  return resolveImageUrl(src, fallback, 100);
}

export { heroDrape, storyHero, hands, threads, cords, macrame, herbBag, roseThrow, wallArt };
