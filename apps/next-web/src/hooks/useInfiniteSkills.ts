import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LegalSkill } from "../lib/types";
import { fetchSkills, SkillQueryParams } from "../lib/api";

export type { SkillQueryParams } from "../lib/api";
export type SortOption = "stars" | "recent" | "score" | "hot";

export interface SkillQueryResult {
  items: LegalSkill[];
  nextCursor: number | null;
  totalCount: number;
}

export type SkillDataAdapter = (params: any, signal: AbortSignal) => Promise<any>;

export function createMockAdapter(allSkills: LegalSkill[]): SkillDataAdapter {
    return async () => ({ items: allSkills, nextCursor: null, totalCount: allSkills.length });
}

interface UseInfiniteSkillsArgs {
    search: string;
    vertical: string | null;
    taskCategory: string | null;
    minQualityScore: number;
    sortBy: SortOption;
    pageSize?: number;
    searchDebounceMs?: number;
}

interface UseInfiniteSkillsResult {
    items: LegalSkill[];
    totalCount: number;
    isLoading: boolean; // first page of a fresh filter set
    isLoadingMore: boolean; // subsequent pages
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    retry: () => void;
    mutateItems: (updater: (prev: LegalSkill[]) => LegalSkill[]) => void;
}

export function useInfiniteSkills({
    search,
    vertical,
    taskCategory,
    minQualityScore,
    sortBy,
    pageSize = 12,
    searchDebounceMs = 350,
}: UseInfiniteSkillsArgs): UseInfiniteSkillsResult {
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [items, setItems] = useState<LegalSkill[]>([]);
    const [cursor, setCursor] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);

    // Debounce search input — avoids firing a query per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), searchDebounceMs);
        return () => clearTimeout(t);
    }, [search, searchDebounceMs]);

    const params = useMemo<SkillQueryParams>(
        () => ({ search: debouncedSearch, vertical, taskCategory, minQualityScore, sortBy, pageSize }),
        [debouncedSearch, vertical, taskCategory, minQualityScore, sortBy, pageSize]
    );

    const runQuery = useCallback(
        async (cursorToFetch: number | null, mode: "replace" | "append") => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const requestId = ++requestIdRef.current;
            if (mode === "replace") {
                setIsLoading(true);
                setError(null);
            } else {
                setIsLoadingMore(true);
            }

            try {
                // we're not passing the abort signal into fetchSkills today because it uses next fetch, 
                // but the requestIdRef guard handles the stale response check anyway.
                const result = await fetchSkills({ ...params, cursor: cursorToFetch });
                if (requestId !== requestIdRef.current) return;

                setItems((prev) => (mode === "replace" ? result.skills : [...prev, ...result.skills]));
                setCursor(result.nextCursor);
                setTotalCount(result.total);
                setError(null);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return; // expected on rapid filter changes
                if (requestId !== requestIdRef.current) return;
                setError(err instanceof Error ? err.message : "Não foi possível carregar as skills.");
            } finally {
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        },
        [params]
    );

    // Re-fetch from page 1 whenever any filter/sort/debounced-search changes.
    useEffect(() => {
        void runQuery(null, "replace");
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const loadMore = useCallback(() => {
        if (isLoading || isLoadingMore || cursor === null) return;
        void runQuery(cursor, "append");
    }, [cursor, isLoading, isLoadingMore, runQuery]);

    const retry = useCallback(() => {
        void runQuery(null, "replace");
    }, [runQuery]);

    const mutateItems = useCallback((updater: (prev: LegalSkill[]) => LegalSkill[]) => {
        setItems((prev) => updater(prev));
        setTotalCount((prev) => prev + 1);
    }, []);

    return {
        items,
        totalCount,
        isLoading,
        isLoadingMore,
        error,
        hasMore: cursor !== null,
        loadMore,
        retry,
        mutateItems,
    };
}

// ---------------------------------------------------------------------------
// useInfiniteScrollSentinel
//
// Attaches an IntersectionObserver to a sentinel element; calls `onIntersect`
// when it scrolls into view. This is what actually drives "infinite scroll"
// — no scroll event listeners, no manual offset math.
// ---------------------------------------------------------------------------
export function useInfiniteScrollSentinel(onIntersect: () => void, enabled: boolean) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) onIntersect();
            },
            { rootMargin: "400px 0px 0px 0px" } // trigger ~400px before the sentinel is actually visible
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [onIntersect, enabled]);

    return sentinelRef;
}