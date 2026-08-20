import { useState, type ImgHTMLAttributes } from "react";
import { resolveImageUrl } from "@/lib/images";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function LazyImage({
  src,
  alt = "",
  className = "",
  fallbackSrc,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolved = resolveImageUrl(typeof src === "string" ? src : undefined, fallbackSrc);
  const finalSrc = hasError ? resolveImageUrl(fallbackSrc) : resolved;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Yarn-weaving skeleton loader (visible only while loading) */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-tr from-rose-50/50 via-blush-soft/40 to-rose-100/50 flex items-center justify-center">
          <div 
            className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(120,50,60,0.15) 1px, transparent 1px),
                linear-gradient(0deg, rgba(120,50,60,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '12px 12px'
            }}
          />
          <div className="relative w-7 h-7 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}

      <img
        src={finalSrc}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}
