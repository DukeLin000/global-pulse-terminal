export type RegionKey = "global" | "middle-east" | "europe" | "asia-pacific";

export type FocusCoordinates = {
  lat: number;
  lon: number;
  label: string;
};

export type AlertLevel = "warning" | "critical";

export type NewsItem = {
  id?: string;
  source: string;
  title: string;
  time: string;
  tags: string[];
  regions: RegionKey[];
  focusCoordinates?: FocusCoordinates;
  publishedAt?: string;
};

export type ConflictItem = {
  id?: string;
  name: string;
  score: number;
  region: RegionKey;
  updatedAt?: string;
};

export type LiveNewsSource = {
  id?: string;
  label: string;
  url: string;
  embedUrl: string;
  description: string;
};

export type GlobeRoute = {
  id?: string;
  mode: "flight" | "shipping";
  fromName: string;
  from: [number, number];
  toName: string;
  to: [number, number];
};

export type ConflictZone = {
  id?: string;
  name: string;
  lat: number;
  lon: number;
  tier: 1 | 2;
  region: RegionKey;
  detail?: string;
};

export type AlertItem = {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  createdAt: number;
  acknowledged?: boolean;
};

export type AlertAckRequest = {
  alertId: string;
  ackBy?: string;
};

export type AlertAckResponse = {
  ok: boolean;
  alertId: string;
  acknowledgedAt?: number;
};

export type TerminalSnapshot = {
  newsItems: NewsItem[];
  conflictItems: ConflictItem[];
  liveNewsSources: LiveNewsSource[];
  fetchedAt: number;
};

export type StreamEventType =
  | "snapshot.updated"
  | "conflict.spike"
  | "alert.created"
  | "news.breaking"
  | "heartbeat";

export type StreamEvent<T = unknown> = {
  type: StreamEventType;
  data: T;
  ts?: number;
};
