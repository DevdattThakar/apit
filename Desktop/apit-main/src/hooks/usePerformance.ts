import { useState, useEffect, useRef, useCallback } from "react";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useLazyLoad - Intersection Observer based lazy loading hook
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This hook uses Intersection Observer API to detect when an element enters the viewport,
 * enabling lazy loading of images and other resources. This significantly improves:
 * - Initial page load time (LCP)
 * - Bandwidth usage
 * - Overall page performance
 * 
 * @param options - IntersectionObserver options
 * @returns [ref, isLoaded, isInView]
 */

interface UseLazyLoadOptions {
    /** Distance from viewport in pixels */
    rootMargin?: string;
    /** Whether to trigger once (default: true) */
    triggerOnce?: boolean;
    /** Whether the element is visible by default */
    defaultVisible?: boolean;
}

export function useLazyLoad({
    rootMargin = "50px",
    triggerOnce = true,
    defaultVisible = false,
} = {}) {
    const [isInView, setIsInView] = useState(defaultVisible);
    const [isLoaded, setIsLoaded] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        if (triggerOnce && observerRef.current) {
                            observerRef.current.disconnect();
                        }
                    } else if (!triggerOnce) {
                        setIsInView(false);
                    }
                });
            },
            {
                rootMargin,
                threshold: 0,
            }
        );

        observerRef.current = observer;
        observer.observe(element);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [rootMargin, triggerOnce]);

    const setLoaded = useCallback(() => {
        setIsLoaded(true);
    }, []);

    return { ref, isInView, isLoaded, setLoaded };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useImageLazyLoad - Specialized hook for lazy loading images
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface UseImageLazyLoadOptions {
    /** Image source URL */
    src?: string;
    /** Placeholder or low-quality image */
    placeholderSrc?: string;
    /** Distance from viewport */
    rootMargin?: string;
    /** Enable blur-up effect */
    enableBlurUp?: boolean;
}

export function useImageLazyLoad({
    src,
    placeholderSrc,
    rootMargin = "100px",
    enableBlurUp = true,
}: UseImageLazyLoadOptions) {
    const { ref, isInView, isLoaded, setLoaded } = useLazyLoad({
        rootMargin,
        triggerOnce: true,
    });

    const [currentSrc, setCurrentSrc] = useState(placeholderSrc || "");
    const [blurClass, setBlurClass] = useState(enableBlurUp ? "blur-lg" : "");

    useEffect(() => {
        if (isInView && src) {
            // Create an image to preload
            const img = new Image();
            img.onload = () => {
                setCurrentSrc(src);
                setLoaded();
                if (enableBlurUp) {
                    setBlurClass("blur-0 transition-all duration-500 ease-in-out");
                }
            };
            img.onerror = () => {
                // Keep placeholder on error
                console.warn("Failed to load image:", src);
            };
            img.src = src;
        }
    }, [isInView, src, enableBlurUp, setLoaded]);

    return {
        ref: ref as React.RefObject<HTMLImageElement>,
        src: currentSrc,
        isLoaded,
        isInView,
        blurClass,
    };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useVirtualScroll - Virtual scrolling for large lists
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This hook enables virtual scrolling - only rendering items that are visible in the viewport.
 * Essential for rendering large datasets efficiently.
 * 
 * @param items - Array of items to render
 * @param itemHeight - Height of each item in pixels
 * @param overscan - Number of items to render outside viewport
 */

interface UseVirtualScrollOptions<T> {
    items: T[];
    itemHeight: number;
    overscan?: number;
    containerHeight?: number;
}

export function useVirtualScroll<T>({
    items,
    itemHeight,
    overscan = 3,
    containerHeight = 500,
}: UseVirtualScrollOptions<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback((e: Event) => {
        const target = e.target as HTMLDivElement;
        setScrollTop(target.scrollTop);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
        containerRef,
        visibleItems,
        totalHeight,
        offsetY,
        startIndex,
        endIndex,
    };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useDebounce - Debounce values for performance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useThrottle - Throttle function calls for performance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useThrottle<T extends (...args: unknown[]) => unknown>(
    callback: T,
    limit: number
): T {
    const inThrottle = useRef(false);

    return useCallback(
        ((...args: unknown[]) => {
            if (!inThrottle.current) {
                callback(...args);
                inThrottle.current = true;
                setTimeout(() => {
                    inThrottle.current = false;
                }, limit);
            }
        }) as T,
        [callback, limit]
    );
}
