import { CONFLICT_ITEMS, LIVE_NEWS_SOURCES, NEWS_ITEMS } from "./data";
import type { ConflictItem, LiveNewsSource, NewsItem } from "./types";

export type TerminalSnapshot = {
  newsItems: NewsItem[];
  conflictItems: ConflictItem[];
  liveNewsSources: LiveNewsSource[];
  fetchedAt: number;
};

export async function fetchTerminalSnapshot(): Promise<TerminalSnapshot> {
  // TODO: replace with backend endpoint (Java/Python), e.g. /api/terminal/snapshot
  // const response = await fetch("/api/terminal/snapshot", { cache: "no-store" });
  // return response.json();
  await new Promise((resolve) => setTimeout(resolve, 120));

  return {
    newsItems: NEWS_ITEMS,
    conflictItems: CONFLICT_ITEMS,
    liveNewsSources: LIVE_NEWS_SOURCES,
    fetchedAt: Date.now(),
  };
}
