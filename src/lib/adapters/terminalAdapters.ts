import type {
  AlertItem,
  AlertViewModel,
  GlobeRoute,
  NewsItem,
  NewsViewModel,
  RouteLayers,
  TerminalSnapshot,
} from "@/src/types/terminal";

export function toNewsViewModel(item: NewsItem): NewsViewModel {
  const iso = item.updatedAt ? new Date(item.updatedAt) : null;
  return {
    id: item.id,
    title: item.title,
    source: "GLOBALPULSE",
    time: iso && !Number.isNaN(iso.getTime()) ? iso.toLocaleTimeString() : item.updatedAt,
    tags: [item.region, item.breaking ? "breaking" : "normal"],
    regions: [item.region],
    focusCoordinates: item.focus
      ? {
          lat: item.focus.lat,
          lon: item.focus.lon,
          label: item.title,
        }
      : undefined,
    breaking: item.breaking,
  };
}

export function toRouteViewModel(route: GlobeRoute): {
  id?: string;
  mode: "flight" | "shipping";
  fromName: string;
  from: [number, number];
  toName: string;
  to: [number, number];
} {
  return {
    id: route.id,
    mode: route.mode === "shipping" ? "shipping" : "flight",
    fromName: route.from.label,
    from: [route.from.lat, route.from.lon],
    toName: route.to.label,
    to: [route.to.lat, route.to.lon],
  };
}

export function toAlertViewModel(alert: AlertItem): AlertViewModel {
  return {
    id: alert.id,
    level: alert.level,
    title: alert.level === "critical" ? "重大地緣警報" : "地緣警示",
    message: alert.message,
    region: alert.region,
    createdAt: alert.createdAt,
    acknowledged: alert.status === "acknowledged",
  };
}

export function toSnapshotViewModel(snapshot: TerminalSnapshot) {
  return {
    ...snapshot,
    newsItems: snapshot.newsItems.map(toNewsViewModel),
    alerts: snapshot.alerts.map(toAlertViewModel),
    routeLayers: {
      flight: snapshot.routeLayers.flight.map(toRouteViewModel),
      shipping: snapshot.routeLayers.shipping.map(toRouteViewModel),
    },
  };
}

export function toRouteLayerViewModel(routeLayers: RouteLayers) {
  return {
    flight: routeLayers.flight.map(toRouteViewModel),
    shipping: routeLayers.shipping.map(toRouteViewModel),
  };
}
