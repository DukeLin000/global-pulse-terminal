export type NewsItem = {
  id: string;
  title: string;
  region: string;
  summary: string;
  focus?: {
    lat: number;
    lon: number;
  };
  updatedAt: string;
  breaking: boolean;
};

export type ConflictItem = {
  id: string;
  name: string;
  score: number;
  region: string;
  updatedAt: string;
  detail: string;
};

export type LiveNewsSource = {
  id: string;
  label: string;
  url: string;
  embedUrl: string;
  description: string;
};

export type GlobeRoute = {
  id: string;
  from: {
    label: string;
    lat: number;
    lon: number;
  };
  to: {
    label: string;
    lat: number;
    lon: number;
  };
  mode: string;
  label: string;
};

export type ConflictZone = {
  name: string;
  lat: number;
  lon: number;
  tier: number;
  region: string;
  detail: string;
};

export type AlertItem = {
  id: string;
  level: string;
  message: string;
  region: string;
  createdAt: string;
  status: string;
  ackBy: string | null;
  ackAt: string | null;
};

export type AlertAckRequest = {
  alertId: string;
  ackBy: string;
};

export type AlertAckResponse = {
  alertId: string;
  status: string;
  ackBy: string;
  ackAt: string;
};

export type RouteLayers = Record<"flight" | "shipping", GlobeRoute[]>;

export type TerminalSnapshot = {
  newsItems: NewsItem[];
  conflictItems: ConflictItem[];
  liveNewsSources: LiveNewsSource[];
  routeLayers: RouteLayers;
  alerts: AlertItem[];
  serverTime: number;
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

export type NewsViewModel = {
  id: string;
  title: string;
  source: string;
  time: string;
  tags: string[];
  regions: string[];
  focusCoordinates?: {
    lat: number;
    lon: number;
    label: string;
  };
  breaking: boolean;
};

export type AlertViewModel = {
  id: string;
  level: string;
  title: string;
  message: string;
  region: string;
  createdAt: string;
  acknowledged: boolean;
};
