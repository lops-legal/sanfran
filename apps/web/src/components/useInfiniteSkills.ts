import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LegalSkill } from "../types";

// ---------------------------------------------------------------------------
// Data adapter contract
//
// This is the seam between "frontend logic" and "wherever the data actually
// lives". Today it's backed by an in-memory mock (see `createMockAdapter`
// below). Swapping to Supabase later means writing ONE function that matches
// this shape — nothing in the hook or the component needs to change.
//
// Expected real implementation shape (for when the backend is wired up):
//
//   async function fetchSkillsFromSupabase(params: SkillQueryParams): Promise<SkillQueryResult> {
//     let query = supabase.from("skills").select("*", { count: "exact" });
//     if (params.search) query = query.textSearch("search_vector", params.search);
//     if (params.vertical) query = query.eq("vertical", params.vertical);
//     if (params.taskCategory) query = query.contains("task_category_ids", [params.taskCategory]);
//     if (params.minQualityScore > 0) query = query.gte("quality_score", params.minQualityScore);
//     query = query.order(SORT_COLUMN[params.sortBy], { ascending: false });
//     const from = params.cursor ?? 0;
//     const to = from + params.pageSize - 1;
//     const { data, error, count } = await query.range(from, to);
//     if (error) throw error;
//     return { items: data as LegalSkill[], nextCursor: data.length === params.pageSize ? to + 1 : null, totalCount: count ?? 0 };
//   }
// ---------------------------------------------------------------------------

export type SortOption = "stars" | "recent" | "score" | "hot";

export interface SkillQueryParams {
    search: string;
    vertical: string | null;
    taskCategory: string | null;
    minQualityScore: number;
    sortBy: SortOption;
    cursor: number | null; // null = first page
    pageSize: number;
}

export interface SkillQueryResult {
    items: LegalSkill[];
    nextCursor: number | null; // null = no more pages
    totalCount: number;
}

export type SkillDataAdapter = (params: SkillQueryParams, signal: AbortSignal) => Promise<SkillQueryResult>;

// ---------------------------------------------------------------------------
// Mock adapter — stands in for Supabase today.
// Mimics real network behavior on purpose: artificial latency, cursor-based
// paging, server-side filtering/sorting — so the hook and UI are already
// exercising the real code paths (loading states, race conditions, empty
// states) instead of a flat synchronous array.
// ---------------------------------------------------------------------------
export function createMockAdapter(allSkills: LegalSkill[]): SkillDataAdapter {
    return async (params, signal) => {
        const latency = 280 + Math.random() * 320;
        await new Promise((resolve, reject) => {
            const t = setTimeout(resolve, latency);
            signal.addEventListener("abort", () => {
                clearTimeout(t);
                reject(new DOMException("aborted", "AbortError"));
            });
        });

        const q = params.search.trim().toLowerCase();
        let filtered = allSkills.filter((skill) => {
            const matchesSearch = q
                ? skill.name.toLowerCase().includes(q) ||
                skill.description.toLowerCase().includes(q) ||
                skill.tags.some((t) => t.toLowerCase().includes(q))
                : true;
            const matchesVertical = params.vertical ? skill.vertical === params.vertical : true;
            // NOTE: in a real schema this should be `skill.taskCategoryIds.includes(params.taskCategory)`,
            // a real array column — not a string-match heuristic against tags/description.
            const matchesCategory = params.taskCategory
                ? skill.tags.some((t) => t.toLowerCase() === params.taskCategory!.toLowerCase())
                : true;
            const matchesScore = skill.qualityScore >= params.minQualityScore;
            return matchesSearch && matchesVertical && matchesCategory && matchesScore;
        });

        filtered = [...filtered].sort((a, b) => {
            switch (params.sortBy) {
                case "stars":
                    return b.starsCount - a.starsCount;
                case "recent":
                    // Real schema: compare actual Date/timestamptz values, never formatted strings.
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                case "hot": {
                    // Real schema: a precomputed hot_score column (recent downloads + star
                    // velocity with time decay). Until that exists, fall back to quality
                    // score explicitly rather than silently pretending it's the same metric.
                    return b.qualityScore - a.qualityScore;
                }
                case "score":
                default:
                    return b.qualityScore - a.qualityScore;
            }
        });

        const from = params.cursor ?? 0;
        const to = from + params.pageSize;
        const page = filtered.slice(from, to);

        return {
            items: page,
            nextCursor: to < filtered.length ? to : null,
            totalCount: filtered.length,
        };
    };
}

// ---------------------------------------------------------------------------
// useInfiniteSkills
//
// Owns: debounced search, request cancellation / stale-response guarding,
// cursor-based pagination, and the four distinct UI states a marketplace
// actually needs (loading / loadingMore / error / empty).
// ---------------------------------------------------------------------------
interface UseInfiniteSkillsArgs {
    adapter: SkillDataAdapter;
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
    adapter,
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

    const params = useMemo<Omit<SkillQueryParams, "cursor">>(
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
                const result = await adapter({ ...params, cursor: cursorToFetch }, controller.signal);
                // Guard against stale responses: if a newer request has started
                // since this one was fired, discard this result entirely.
                if (requestId !== requestIdRef.current) return;

                setItems((prev) => (mode === "replace" ? result.items : [...prev, ...result.items]));
                setCursor(result.nextCursor);
                setTotalCount(result.totalCount);
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
        [adapter, params]
    );

    // Re-fetch from page 1 whenever any filter/sort/debounced-search changes.
    useEffect(() => {
        void runQuery(null, "replace");
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, adapter]);

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