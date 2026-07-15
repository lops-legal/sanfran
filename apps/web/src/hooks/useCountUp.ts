import { useEffect, useState, useRef } from "react";

interface UseCountUpOptions {
    end: number;
    duration?: number;
    start?: number;
    decimals?: number;
    triggerOnce?: boolean;
}

/**
 * Hook que anima um número de 0 até `end` quando o elemento fica visível.
 * Usa IntersectionObserver para disparar a animação apenas uma vez.
 */
export function useCountUp({
    end,
    duration = 2000,
    start = 0,
    decimals = 0,
    triggerOnce = true,
}: UseCountUpOptions) {
    const [count, setCount] = useState(start);
    const [hasTriggered, setHasTriggered] = useState(false);
    const ref = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReduced) {
            setCount(end);
            setHasTriggered(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggered) {
                    setHasTriggered(true);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [end, hasTriggered]);

    useEffect(() => {
        if (!hasTriggered) return;

        const range = end - start;
        const startTime = performance.now();

        let rafId: number;

        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + range * eased;

            setCount(current);

            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [hasTriggered, start, end, duration]);

    const formatted = count.toFixed(decimals);

    return { ref, count: formatted, hasTriggered };
}