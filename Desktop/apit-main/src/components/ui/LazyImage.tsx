import { useState } from "react";
import { useImageLazyLoad } from "@/hooks/usePerformance";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LazyImage - Optimized Image Component with Lazy Loading and Blur-Up Effect
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Lazy loading using Intersection Observer
 * - Blur-up effect for smooth image loading
 * - Placeholder support for better UX
 * - Error handling with fallback
 * - Responsive srcset support (when available)
 * 
 * Core Web Vitals Impact:
 * - LCP: Improved by loading images only when in viewport
 * - CLS: Proper aspect-ratio containers prevent layout shifts
 * - FID: Reduced main thread work through async loading
 */

interface LazyImageProps {
    /** Image source URL */
    src: string;
    /** Alternative text for accessibility */
    alt: string;
    /** CSS classes */
    className?: string;
    /** Placeholder image while loading */
    placeholderSrc?: string;
    /** Image width */
    width?: number | string;
    /** Image height */
    height?: number | string;
    /** Priority loading (eager) - use for above-the-fold images */
    priority?: boolean;
    /** Custom root margin for intersection observer */
    rootMargin?: string;
    /** Callback when image loads */
    onLoad?: () => void;
    /** Callback on image error */
    onError?: () => void;
}

export function LazyImage({
    src,
    alt,
    className = "",
    placeholderSrc,
    width,
    height,
    priority = false,
    rootMargin = "100px",
    onLoad,
    onError,
}: LazyImageProps) {
    // Use lazy loading unless priority is set
    const { ref, src: currentSrc, isLoaded, blurClass } = useImageLazyLoad({
        src: priority ? src : undefined,
        placeholderSrc,
        rootMargin,
        enableBlurUp: true,
    });

    const handleLoad = () => {
        onLoad?.();
    };

    const handleError = () => {
        onError?.();
    };

    // For priority images, load immediately
    if (priority) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                width={width}
                height={height}
                loading="eager"
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
            />
        );
    }

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="relative overflow-hidden"
            style={{
                aspectRatio: width && height ? `${width} / ${height}` : undefined,
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
            }}
        >
            {/* Placeholder/loading state */}
            {!isLoaded && placeholderSrc && (
                <img
                    src={placeholderSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
                    aria-hidden="true"
                />
            )}

            {/* Loading skeleton */}
            {!isLoaded && !placeholderSrc && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Main image */}
            {currentSrc && (
                <img
                    src={currentSrc}
                    alt={alt}
                    className={`absolute inset-0 w-full h-full object-cover ${blurClass} ${className}`}
                    width={width}
                    height={height}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LazyImageWithSrcset - Responsive images with srcset support
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface SrcSetItem {
    /** Image URL */
    url: string;
    /** Width descriptor */
    width: number;
}

interface LazyImageWithSrcsetProps extends Omit<LazyImageProps, "src"> {
    /** Array of image URLs with widths */
    srcSet: SrcSetItem[];
    /** Default image size */
    defaultWidth?: number;
}

export function LazyImageWithSrcset({
    srcSet,
    defaultWidth = 800,
    ...props
}: LazyImageWithSrcsetProps) {
    // Find the closest matching src for the default
    const defaultSrc = srcSet.find((s) => s.width === defaultWidth)?.url || srcSet[0]?.url;

    // Generate srcset string
    const srcsetString = srcSet
        .map((s) => `${s.url} ${s.width}w`)
        .join(", ");

    // Generate sizes attribute
    const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

    return (
        <img
            src={defaultSrc}
            alt={props.alt || ""}
            srcSet={srcsetString}
            sizes={sizes}
            className={props.className}
            width={props.width}
            height={props.height}
            loading="lazy"
            decoding="async"
        />
    );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AvatarImage - Optimized avatar with fallback
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface AvatarImageProps {
    /** Avatar image URL */
    src?: string | null;
    /** Fallback name for initials */
    name?: string;
    /** Avatar size */
    size?: "sm" | "md" | "lg" | "xl";
    /** CSS classes */
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
};

export function AvatarImage({ src, name, size = "md", className = "" }: AvatarImageProps) {
    const [error, setError] = useState(false);

    // Generate initials from name
    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    // Use LazyImage if valid src and no error
    if (src && !error) {
        return (
            <LazyImage
                src={src}
                alt={name || "Avatar"}
                className={`rounded-full object-cover ${className}`}
                priority={true}
                onError={() => setError(true)}
            />
        );
    }

    // Fallback to initials
    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium ${className}`}
        >
            {initials}
        </div>
    );
}

export default LazyImage;
