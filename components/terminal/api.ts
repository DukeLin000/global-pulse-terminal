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
  const tick = Math.floor(Date.now() / 15000);
  const gazaSurge = tick % 4 === 0 ? 35 : 0;
  const ukraineShift = tick % 3 === 0 ? 12 : 0;
  const conflictItems = CONFLICT_ITEMS.map((item) => {
    if (item.name === "Gaza") return { ...item, score: item.score + gazaSurge };
    if (item.name === "Ukraine") return { ...item, score: item.score + ukraineShift };
    return item;
  });

  return {
    newsItems: NEWS_ITEMS,
    conflictItems,
    liveNewsSources: LIVE_NEWS_SOURCES,
    fetchedAt: Date.now(),
  };
}
