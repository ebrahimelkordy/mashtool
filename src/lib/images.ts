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

export function compressImageFile(
  file: File,
  maxDim = 900,
  quality = 0.75
): Promise<{ base64: string; contentType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));
        ctx.drawImage(img, 0, 0, width, height);

        let contentType = "image/webp";
        let dataUrl = canvas.toDataURL(contentType, quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          contentType = "image/jpeg";
          dataUrl = canvas.toDataURL(contentType, quality);
        }

        const base64 = dataUrl.split(",")[1] ?? "";
        resolve({ base64, contentType, dataUrl });
      };
      img.onerror = () => reject(new Error("Failed to decode image file"));
      img.src = String(e.target?.result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export { heroDrape, storyHero, hands, threads, cords, macrame, herbBag, roseThrow, wallArt };
