import { useEffect, useState } from "react";
import { fetchCatalogStats, CatalogStats } from "../lib/supabaseAdapter";

const EMPTY_STATS: CatalogStats = {
  totalPublished: 0,
  totalOabVerified: 0, // skills revisadas contra OWASP Agentic Skills Top 10
  totalDownloads: 0,
  verticalCounts: {},
  taskCategoryCounts: {},
};

export function useCatalogStats() {
  const [stats, setStats] = useState<CatalogStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCatalogStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, isLoading, error };
}
