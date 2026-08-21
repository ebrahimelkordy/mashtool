import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";
import { resolveImageUrl, getBlurImageUrl } from "@/lib/images";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  targetWidth?: number;
}

export function LazyImage({
  src,
  alt = "",
  className = "",
  fallbackSrc,
  targetWidth = 650,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const rawSrc = typeof src === "string" ? src : undefined;
  const blurSrc = getBlurImageUrl(rawSrc, fallbackSrc);
  const resolved = resolveImageUrl(rawSrc, fallbackSrc, targetWidth);
  const finalSrc = hasError ? resolveImageUrl(fallbackSrc, undefined, targetWidth) : resolved;

  // Fix hydration issue where images loaded before React hydration don't fire onLoad
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [finalSrc]);

  return (
    <div className={`relative overflow-hidden bg-blush-soft/50 ${className}`}>
      {/* Progressive low-res blur backdrop (loads instantly, no placeholder icons) */}
      <img
        src={blurSrc}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover scale-105 filter blur-lg transition-opacity duration-500 pointer-events-none ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Main crisp high-res image */}
      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        loading={props.loading || "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-102 blur-sm"
        }`}
        {...props}
      />
    </div>
  );
}
