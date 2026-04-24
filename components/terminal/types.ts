export type NewsItem = {
  source: string;
  title: string;
  time: string;
  tags: string[];
};

export type ConflictItem = {
  name: string;
  score: number;
};

export type LiveNewsSource = {
  label: string;
  url: string;
  description: string;
};
