/**
 * Conversion between client (viewport) coordinates and normalized image
 * coordinates.
 *
 * Image space: (0, 0) is the image's top-left corner and (1, 1) its
 * bottom-right corner, whatever size the image is rendered at. Thread anchors
 * are stored in this space, so a pin stays on the same spot of the image for
 * every viewer and every screen size.
 *
 * Pure functions only: no React and no DOM reads. Callers pass in the rect
 * from `img.getBoundingClientRect()`.
 */

export type Point = { x: number; y: number };

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

/** Inverse of `clientToImage`: normalized image point to client point. */
export function imageToClient(point: Point, imgRect: ImageRect): Point {
  return {
    x: imgRect.left + point.x * imgRect.width,
    y: imgRect.top + point.y * imgRect.height,
  };
}

/** True when a normalized point lies on the image (edges included). */
export function isInsideImage(point: Point): boolean {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

/** Clamps a normalized point onto the image, i.e. into [0, 1] on both axes. */
export function clampToImage(point: Point): Point {
  return { x: clamp01(point.x), y: clamp01(point.y) };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
