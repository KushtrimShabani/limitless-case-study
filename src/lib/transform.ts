import type { Point } from "./coords";

export type CanvasTransform = {
  x: number;
  y: number;
  scale: number;
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

export function zoomAtPoint(
  transform: CanvasTransform,
  point: Point,
  scaleFactor: number
): CanvasTransform {
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    return transform;
  }

  const scale = clampScale(transform.scale * scaleFactor);
  const ratio = scale / transform.scale;

  return {
    x: point.x - (point.x - transform.x) * ratio,
    y: point.y - (point.y - transform.y) * ratio,
    scale,
  };
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}
