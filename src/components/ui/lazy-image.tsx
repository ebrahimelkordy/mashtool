import { useState, type ImgHTMLAttributes } from "react";
import heroDrape from "@/assets/hero-drape.jpg";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function LazyImage({
  src,
  alt = "",
  className = "",
  fallbackSrc = heroDrape,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Yarn-weaving themed skeleton loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-tr from-rose-50/50 via-blush-soft/40 to-rose-100/50 flex items-center justify-center">
          {/* Subtle Knitted grid / weaving micro-pattern overlay */}
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
          {/* Decorative spinning thread/yarn icon representing knitting */}
          <div className="relative w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}

      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}
