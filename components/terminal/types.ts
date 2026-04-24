export type RegionKey = "global" | "middle-east" | "europe" | "asia-pacific";

export type RegionOption = {
  key: RegionKey;
  label: string;
};

export type NewsItem = {
  source: string;
  title: string;
  time: string;
  tags: string[];
  regions: RegionKey[];
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
