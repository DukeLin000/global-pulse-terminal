import type { ConflictItem, LiveNewsSource, NewsItem, RegionOption } from "./types";

export const REGION_OPTIONS: RegionOption[] = [
  { key: "global", label: "全球總覽" },
  { key: "middle-east", label: "中東地區" },
  { key: "europe", label: "歐洲地區" },
  { key: "asia-pacific", label: "亞太地區" },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    source: "Frontline Desk",
    title: "【歐陸戰況】烏克蘭東部前線再現高密度無人機偵察與炮擊活動。",
    time: "15m",
    tags: ["烏克蘭", "歐洲", "軍事"],
    regions: ["europe"],
    focusCoordinates: { lat: 48.3, lon: 31.1, label: "Ukraine" },
  },
  {
    source: "ARJ News",
    title: "【地緣觀察】台海區域電子作戰干擾強度增加，導航系統穩定性受阻。",
    time: "1h",
    tags: ["地緣政治", "台海", "軍事"],
    regions: ["asia-pacific"],
    focusCoordinates: { lat: 24.0, lon: 119.0, label: "Taiwan Strait" },
  },
  {
    source: "WHSR News",
    title: "【能源預報】中東原油產量調整協議達成，預期市場波動率將降至新低。",
    time: "3h",
    tags: ["能源", "中東", "金融市場"],
    regions: ["middle-east"],
    focusCoordinates: { lat: 31.5, lon: 34.4, label: "Gaza" },
  },
  {
    source: "Market Pulse",
    title: "【市場監控】美元指數短線走弱，亞太風險資產同步反彈。",
    time: "5h",
    tags: ["金融市場", "美元", "亞太"],
    regions: ["asia-pacific", "global"],
  },
];

export const CONFLICT_ITEMS: ConflictItem[] = [
  { name: "Ukraine", score: 23, region: "europe" },
  { name: "Gaza", score: 239, region: "middle-east" },
  { name: "Red Sea", score: 88, region: "middle-east" },
  { name: "Taiwan Strait", score: 64, region: "asia-pacific" },
];

export const LIVE_NEWS_SOURCES: LiveNewsSource[] = [
  {
    label: "CNN即時新聞",
    url: "https://www.cnn.com/world/live-news",
    embedUrl: "https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=1&mute=1",
    description: "國際突發事件與全球即時快訊",
  },
  {
    label: "台灣即時新聞",
    url: "https://news.pts.org.tw/category/1",
    embedUrl: "https://www.youtube.com/embed/TCnaIE_SAtM?autoplay=1&mute=1",
    description: "台灣本地焦點與政治社會動態",
  },
];
