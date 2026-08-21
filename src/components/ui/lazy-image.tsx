import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react";
import { resolveImageUrl, getBlurImageUrl } from "@/lib/images";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  targetWidth?: number;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt = "",
  className = "",
  fallbackSrc,
  targetWidth,
  priority = false,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const effectiveWidth = targetWidth || (priority ? 900 : 650);
  const rawSrc = typeof src === "string" ? src : undefined;
  const blurSrc = getBlurImageUrl(rawSrc, fallbackSrc);
  const resolved = resolveImageUrl(rawSrc, fallbackSrc, effectiveWidth);
  const finalSrc = hasError ? resolveImageUrl(fallbackSrc, undefined, effectiveWidth) : resolved;

  // Fix hydration issue where images loaded before React hydration don't fire onLoad
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [finalSrc]);

  return (
    <div className={`relative overflow-hidden bg-blush-soft/50 ${className}`}>
      {/* Progressive low-res blur backdrop (loads instantly, no placeholder icons) */}
      {!priority && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover scale-105 filter blur-lg transition-opacity duration-500 pointer-events-none ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Main crisp high-res image */}
      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        loading={props.loading || (priority ? "eager" : "lazy")}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-300 ease-out ${
          isLoaded ? "opacity-100 scale-100 blur-0" : priority ? "opacity-100" : "opacity-0 scale-102 blur-sm"
        }`}
        {...props}
      />
    </div>
  );
}
