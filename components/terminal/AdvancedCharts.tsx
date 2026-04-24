"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: string; value: number };
type Candle = { x: string; open: number; high: number; low: number; close: number };

type BaseChartProps = {
  width?: number;
  height?: number;
};

export function RiskTrendAdvancedChart({ width = 240, height = 96 }: BaseChartProps) {
  const data = useMemo<Point[]>(
    () => [
      { x: "D1", value: 30 },
      { x: "D2", value: 44 },
      { x: "D3", value: 36 },
      { x: "D4", value: 58 },
      { x: "D5", value: 49 },
      { x: "D6", value: 67 },
    ],
    []
  );

  return <InteractiveLineCanvas data={data} width={width} height={height} />;
}

export function EconomicAdvancedChart({ width = 320, height = 120 }: BaseChartProps) {
  const data = useMemo<Candle[]>(
    () => [
      { x: "01", open: 32, high: 36, low: 30, close: 35 },
      { x: "02", open: 35, high: 38, low: 34, close: 36 },
      { x: "03", open: 36, high: 37, low: 31, close: 33 },
      { x: "04", open: 33, high: 39, low: 32, close: 38 },
      { x: "05", open: 38, high: 42, low: 37, close: 41 },
      { x: "06", open: 41, high: 43, low: 39, close: 40 },
      { x: "07", open: 40, high: 45, low: 39, close: 44 },
    ],
    []
  );

  return <InteractiveCandleCanvas data={data} width={width} height={height} />;
}

function InteractiveLineCanvas({ data, width, height }: { data: Point[]; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0a0f1c";
    ctx.fillRect(0, 0, width, height);

    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    const pad = 10;
    const stepX = (width - pad * 2) / (data.length - 1);

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = pad + index * stepX;
      const y = height - pad - ((point.value - min) / (max - min || 1)) * (height - pad * 2);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (cursorX !== null) {
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [data, width, height, cursorX]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded border border-white/10"
      style={{ width, height }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursorX(e.clientX - rect.left);
      }}
      onMouseLeave={() => setCursorX(null)}
    />
  );
}

function InteractiveCandleCanvas({ data, width, height }: { data: Candle[]; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0a0f1c";
    ctx.fillRect(0, 0, width, height);

    const min = Math.min(...data.map((d) => d.low));
    const max = Math.max(...data.map((d) => d.high));
    const pad = 8;
    const candleArea = width - pad * 2;
    const candleWidth = Math.max(4, (candleArea / data.length) * 0.55 * zoom);

    data.forEach((candle, index) => {
      const centerX = pad + index * ((candleArea / data.length) * zoom) - offset;
      const toY = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
      const yOpen = toY(candle.open);
      const yClose = toY(candle.close);
      const yHigh = toY(candle.high);
      const yLow = toY(candle.low);
      const isUp = candle.close >= candle.open;

      ctx.strokeStyle = isUp ? "#22d3ee" : "#f472b6";
      ctx.beginPath();
      ctx.moveTo(centerX, yHigh);
      ctx.lineTo(centerX, yLow);
      ctx.stroke();

      ctx.fillStyle = isUp ? "rgba(34,211,238,0.6)" : "rgba(244,114,182,0.6)";
      ctx.fillRect(centerX - candleWidth / 2, Math.min(yOpen, yClose), candleWidth, Math.abs(yClose - yOpen) || 1);
    });

    if (cursor) {
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(cursor.x, 0);
      ctx.lineTo(cursor.x, height);
      ctx.moveTo(0, cursor.y);
      ctx.lineTo(width, cursor.y);
      ctx.stroke();
    }
  }, [data, width, height, cursor, zoom, offset]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded border border-white/10 cursor-crosshair"
      style={{ width, height }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursor({ x, y });

        if (dragStart.current !== null) {
          const delta = dragStart.current - x;
          setOffset((prev) => Math.max(0, prev + delta * 0.5));
          dragStart.current = x;
        }
      }}
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        dragStart.current = e.clientX - rect.left;
      }}
      onMouseUp={() => {
        dragStart.current = null;
      }}
      onMouseLeave={() => {
        setCursor(null);
        dragStart.current = null;
      }}
      onWheel={(e) => {
        e.preventDefault();
        setZoom((prev) => Math.min(2.5, Math.max(0.7, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
      }}
    />
  );
}
