import type { ConflictItem, LiveNewsSource, NewsItem } from "./types";

export const NEWS_ITEMS: NewsItem[] = [
  {
    source: "ARJ News",
    title: "【地緣觀察】台海區域電子作戰干擾強度增加，導航系統穩定性受阻。",
    time: "1h",
    tags: ["地緣政治", "台海", "軍事"],
  },
  {
    source: "WHSR News",
    title: "【能源預報】中東原油產量調整協議達成，預期市場波動率將降至新低。",
    time: "3h",
    tags: ["能源", "中東", "金融市場"],
  },
  {
    source: "Market Pulse",
    title: "【市場監控】美元指數短線走弱，亞太風險資產同步反彈。",
    time: "5h",
    tags: ["金融市場", "美元", "亞太"],
  },
];

export const CONFLICT_ITEMS: ConflictItem[] = [
  { name: "Ukraine", score: 23 },
  { name: "Gaza", score: 239 },
  { name: "Red Sea", score: 88 },
  { name: "Taiwan Strait", score: 64 },
];

export const LIVE_NEWS_SOURCES: LiveNewsSource[] = [
  {
    label: "CNN即時新聞",
    url: "https://www.cnn.com/world/live-news",
    description: "國際突發事件與全球即時快訊",
  },
  {
    label: "台灣即時新聞",
    url: "https://news.pts.org.tw/category/1",
    description: "台灣本地焦點與政治社會動態",
  },
];
