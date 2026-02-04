"use client";

import { useEffect, useRef, useCallback } from "react";
import { Delaunay } from "d3-delaunay";

type Pt = [number, number];

interface VoronoiPoint {
  x: number;
  y: number;
}

export default function EnhancedVoronoiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const worldW = useRef(0);
  const worldH = useRef(0);
  const pointsRef = useRef<VoronoiPoint[]>([]);
  const densityRef = useRef(0);

  const createPoint = useCallback((x: number, y: number): VoronoiPoint => {
    return {
      x,
      y,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const initW = window.innerWidth;
    const initH = window.innerHeight;
    const initialCount = 20;

    worldW.current = initW;
    worldH.current = initH;
    densityRef.current = initialCount / (initW * initH);

    pointsRef.current = Array.from({ length: initialCount }, () =>
      createPoint(Math.random() * initW, Math.random() * initH)
    );

    const draw = () => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      const sx = w / worldW.current;
      const sy = h / worldH.current;

      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.fillStyle = "rgb(29, 35, 42)";

      ctx.fillRect(0, 0, worldW.current, worldH.current);

      if (pointsRef.current.length === 0) return;

      const points2D: Pt[] = pointsRef.current.map(p => [p.x, p.y]);
      const delaunay = Delaunay.from(points2D);
      const pad = 2;

      const voronoi = delaunay.voronoi([
        -pad,
        -pad,
        worldW.current + pad,
        worldH.current + pad,
      ]);

      for (let i = 0; i < pointsRef.current.length; i++) {
        const cell = voronoi.cellPolygon(i);
        if (!cell) continue;

        ctx.beginPath();
        ctx.moveTo(cell[0][0], cell[0][1]);
        for (let j = 1; j < cell.length; j++) {
          ctx.lineTo(cell[j][0], cell[j][1]);
        }
        ctx.closePath();

      }

      ctx.beginPath();
      for (let i = 0; i < pointsRef.current.length; i++) {
        const cell = voronoi.cellPolygon(i);

        if (!cell) continue;

        ctx.moveTo(cell[0][0], cell[0][1]);
        for (let j = 1; j < cell.length; j++) {
          ctx.lineTo(cell[j][0], cell[j][1]);
        }
        ctx.closePath();
      }

      ctx.strokeStyle = "rgb(202, 213, 226)";
      ctx.lineWidth = 0.8 / ((sx + sy) / 2);
      ctx.stroke();
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    const addRandomPointsInRect = (x0: number, y0: number, x1: number, y1: number) => {
      const width = Math.max(0, x1 - x0);
      const height = Math.max(0, y1 - y0);
      if (width <= 0 || height <= 0) return;

      const area = width * height;
      const n = Math.ceil(area * densityRef.current);
      for (let i = 0; i < n; i++) {
        pointsRef.current.push(createPoint(
          x0 + Math.random() * width,
          y0 + Math.random() * height
        ));
      }
    };

    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      const oldW = worldW.current;
      const oldH = worldH.current;

      const grewRight = newW > oldW;
      const grewDown = newH > oldH;
      const shrankLeft = newW < oldW;
      const shrankUp = newH < oldH;

      if (grewRight) {
        addRandomPointsInRect(oldW, 0, newW, oldH);
      }
      if (grewDown) {
        addRandomPointsInRect(0, oldH, oldW, newH);
      }
      if (grewRight && grewDown) {
        addRandomPointsInRect(oldW, oldH, newW, newH);
      }

      if (shrankLeft || shrankUp) {
        pointsRef.current = pointsRef.current.filter(point =>
          point.x >= 0 && point.x <= newW &&
          point.y >= 0 && point.y <= newH
        );
      }

      worldW.current = newW;
      worldH.current = newH;
    };


    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = worldW.current / rect.width;
      const sy = worldH.current / rect.height;

      const clickX = (e.clientX - rect.left) * sx;
      const clickY = (e.clientY - rect.top) * sy;

      pointsRef.current.push(createPoint(
        clickX,
        clickY
      ));
    };

    handleResize();
    animate();

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", handleClick);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [createPoint]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 cursor-auto block"
      style={{
        background: "#000",
        border: "none",
        outline: "none",
        display: "block",
      }}
    />

  );
}
