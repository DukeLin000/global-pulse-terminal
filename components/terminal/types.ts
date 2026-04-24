export type RegionKey = "global" | "middle-east" | "europe" | "asia-pacific";

export type RegionOption = {
  key: RegionKey;
  label: string;
};

export type FocusCoordinates = {
  lat: number;
  lon: number;
  label: string;
};

export type AlertLevel = "warning" | "critical";

export type AlertToast = {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  createdAt: number;
};

export type NewsItem = {
  source: string;
  title: string;
  time: string;
  tags: string[];
  regions: RegionKey[];
  focusCoordinates?: FocusCoordinates;
};

export type ConflictItem = {
  name: string;
  score: number;
  region: RegionKey;
};

export type LiveNewsSource = {
  label: string;
  url: string;
  embedUrl: string;
  description: string;
};
