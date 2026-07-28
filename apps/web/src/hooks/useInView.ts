import { useCallback, useEffect, useState } from "react";

interface UseInViewOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook de scroll-reveal baseado em IntersectionObserver nativo.
 * Não depende de framer-motion nem de nenhuma lib externa.
 * Respeita prefers-reduced-motion: se o usuário pediu menos movimento,
 * o elemento já entra visível (sem animação).
 */
export function useInView<T extends HTMLElement>({
    threshold = 0.2,
    rootMargin = "0px",
    triggerOnce = true,
}: UseInViewOptions = {}) {
    const [node, setNode] = useState<T | null>(null);
    const [inView, setInView] = useState(false);

    // A callback ref notifies the hook when conditionally-rendered content is
    // mounted. A static useRef would not retrigger the effect if the element
    // did not exist during the hook's first render (for example, while data
    // was still loading).
    const ref = useCallback((element: T | null) => {
        setNode(element);
    }, []);

    useEffect(() => {
        if (!node) return;

        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReduced) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (triggerOnce) observer.unobserve(node);
                } else if (!triggerOnce) {
                    setInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [node, threshold, rootMargin, triggerOnce]);

    return { ref, inView };
}