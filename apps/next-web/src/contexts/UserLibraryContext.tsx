"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchMyDownloads,
  fetchMyStars,
  recordDownload as recordDownloadApi,
  starToggle as starToggleApi,
} from "../lib/interactions";

interface UserLibraryContextType {
  starredIds: string[];
  downloadedIds: string[];
  isStarred: (skillId: string) => boolean;
  isDownloaded: (skillId: string) => boolean;
  toggleStar: (skillId: string) => Promise<boolean>;
  recordDownload: (skillId: string) => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
}

const UserLibraryContext = createContext<UserLibraryContextType>({
  starredIds: [],
  downloadedIds: [],
  isStarred: () => false,
  isDownloaded: () => false,
  toggleStar: async () => false,
  recordDownload: async () => {},
  refresh: async () => {},
  loading: true,
});

export function UserLibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setStarredIds([]);
      setDownloadedIds([]);
      return;
    }
    setLoading(true);
    try {
      const [stars, downloads] = await Promise.all([fetchMyStars(), fetchMyDownloads()]);
      setStarredIds(stars);
      setDownloadedIds(downloads);
    } catch (err) {
      console.warn("[UserLibrary] Erro ao carregar biblioteca:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleStar = useCallback(async (skillId: string): Promise<boolean> => {
    const wasStarred = starredIds.includes(skillId);

    // Update otimista imediato.
    setStarredIds((prev) =>
      wasStarred ? prev.filter((id) => id !== skillId) : prev.includes(skillId) ? prev : [...prev, skillId]
    );

    try {
      const nowStarred = await starToggleApi(skillId);
      // Sincroniza com a resposta real do servidor.
      setStarredIds((prev) =>
        nowStarred
          ? prev.includes(skillId)
            ? prev
            : [...prev, skillId]
          : prev.filter((id) => id !== skillId)
      );
      return nowStarred;
    } catch (err) {
      // Reverte em caso de falha.
      setStarredIds((prev) =>
        wasStarred
          ? prev.includes(skillId)
            ? prev
            : [...prev, skillId]
          : prev.filter((id) => id !== skillId)
      );
      throw err;
    }
  }, [starredIds]);

  const recordDownload = useCallback(async (skillId: string) => {
    await recordDownloadApi(skillId);
    setDownloadedIds((prev) => (prev.includes(skillId) ? prev : [...prev, skillId]));
  }, []);

  const isStarred = useCallback((skillId: string) => starredIds.includes(skillId), [starredIds]);
  const isDownloaded = useCallback(
    (skillId: string) => downloadedIds.includes(skillId),
    [downloadedIds]
  );

  const value = useMemo(
    () => ({
      starredIds,
      downloadedIds,
      isStarred,
      isDownloaded,
      toggleStar,
      recordDownload,
      refresh,
      loading,
    }),
    [starredIds, downloadedIds, isStarred, isDownloaded, toggleStar, recordDownload, refresh, loading]
  );

  return <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>;
}

export const useUserLibrary = () => useContext(UserLibraryContext);
