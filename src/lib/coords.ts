/**
 * Conversion between client (viewport) coordinates and normalized image
 * coordinates, plus the canvas pan/zoom transform math.
 *
 * Image space: (0, 0) is the image's top-left corner and (1, 1) its
 * bottom-right corner, whatever size the image is rendered at. Thread anchors
 * are stored in this space, so a pin stays on the same spot of the image for
 * every viewer and every screen size.
 *
 * Pure functions only: no React and no DOM reads. Callers pass in the rect
 * from `img.getBoundingClientRect()`.
 */

import {
  DOM_DELTA_LINE,
  DOM_DELTA_PAGE,
  MAX_SCALE,
  MIN_SCALE,
  THREAD_FLIP_MARGIN,
  THREAD_WIDTH,
  WHEEL_LINE_HEIGHT,
  WHEEL_MAX_STEP,
  WHEEL_ZOOM_SPEED,
} from "./constants";

export type Point = { x: number; y: number };

export type CanvasTransform = { x: number; y: number; scale: number };

export type ThreadSide = "left" | "right";

/** The parts of a DOMRect these functions need. Plain objects work too. */
export type ImageRect = Pick<DOMRect, "left" | "top" | "width" | "height">;

/**
 * Converts a client point (e.g. `event.clientX/Y`) to normalized image
 * coordinates. Points outside the image give values below 0 or above 1.
 *
 * Returns null when the rect has no area (image not laid out yet), because
 * no position on the image can be derived from it.
 */
export function clientToImage(
  clientX: number,
  clientY: number,
  imgRect: ImageRect
): Point | null {
  if (imgRect.width <= 0 || imgRect.height <= 0) {
    return null;
  }
  return {
    x: (clientX - imgRect.left) / imgRect.width,
    y: (clientY - imgRect.top) / imgRect.height,
  };
}

/** Clamps a normalized point onto the image, i.e. into [0, 1] on both axes. */
export function clampToImage(point: Point): Point {
  return { x: clamp(point.x, 0, 1), y: clamp(point.y, 0, 1) };
}

/**
 * Zooms by `factor` while keeping the point (cx, cy) fixed on screen.
 * (cx, cy) is relative to the transform origin, not the viewport.
 */
export function zoomAtPoint(
  transform: CanvasTransform,
  cx: number,
  cy: number,
  factor: number
): CanvasTransform {
  if (!Number.isFinite(factor) || factor <= 0) {
    return transform;
  }
  const next = clamp(transform.scale * factor, MIN_SCALE, MAX_SCALE);
  const ratio = next / transform.scale;
  return {
    x: cx - (cx - transform.x) * ratio,
    y: cy - (cy - transform.y) * ratio,
    scale: next,
  };
}

export function wheelZoomFactor(
  deltaY: number,
  deltaMode: number,
  pageHeight: number
): number {
  const unit =
    deltaMode === DOM_DELTA_LINE
      ? WHEEL_LINE_HEIGHT
      : deltaMode === DOM_DELTA_PAGE
        ? pageHeight
        : 1;
  const pixels = deltaY * unit;
  return clamp(
    Math.exp(-pixels * WHEEL_ZOOM_SPEED),
    1 / WHEEL_MAX_STEP,
    WHEEL_MAX_STEP
  );
}

export function threadSide(
  pinRight: number,
  viewportRight: number
): ThreadSide {
  return viewportRight - pinRight < THREAD_WIDTH + THREAD_FLIP_MARGIN
    ? "left"
    : "right";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
