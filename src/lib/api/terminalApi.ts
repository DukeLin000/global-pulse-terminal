import type {
  AlertAckRequest,
  AlertAckResponse,
  AlertItem,
  ConflictItem,
  ConflictZone,
  GlobeRoute,
  NewsItem,
  RegionKey,
  TerminalSnapshot,
} from "@/src/types/terminal";

type QueryValue = string | number | boolean | undefined | null;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TERMINAL_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

function toQuery(params?: Record<string, QueryValue>) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getTerminalSnapshot(region?: RegionKey) {
  return request<TerminalSnapshot>(`/api/v1/terminal/snapshot${toQuery({ region })}`);
}

export function getNews(params?: {
  region?: RegionKey;
  q?: string;
  limit?: number;
  cursor?: string;
}) {
  return request<NewsItem[]>(`/api/v1/news${toQuery(params)}`);
}

export function getConflicts(params?: {
  region?: RegionKey;
  minScore?: number;
  sort?: "score" | "updatedAt";
}) {
  return request<ConflictItem[]>(`/api/v1/conflicts${toQuery(params)}`);
}

export function getGlobeRoutes(mode?: "flight" | "shipping" | "all") {
  return request<GlobeRoute[]>(`/api/v1/globe/routes${toQuery({ mode })}`);
}

export function getConflictZones(region?: RegionKey) {
  return request<ConflictZone[]>(`/api/v1/globe/conflict-zones${toQuery({ region })}`);
}

export function getAlerts(params?: { level?: "warning" | "critical"; limit?: number }) {
  return request<AlertItem[]>(`/api/v1/alerts${toQuery(params)}`);
}

export function ackAlert(payload: AlertAckRequest) {
  return request<AlertAckResponse>("/api/v1/alerts/ack", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getStreamUrl() {
  return `${API_BASE_URL}/api/v1/stream`;
}
