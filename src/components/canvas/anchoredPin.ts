import type { CSSProperties, PointerEvent } from "react";
import type { Point } from "../../lib/coords";

// With corner="top-left" the pin's tip is its top-left corner, so the
// counter-scale uses that as origin and the tip stays on the anchor.
export function anchoredPinStyle(
  point: Point,
  scale: number,
  zIndex?: number
): CSSProperties {
  return {
    position: "absolute",
    left: `${point.x * 100}%`,
    top: `${point.y * 100}%`,
    transform: `scale(${1 / scale})`,
    transformOrigin: "0 0",
    zIndex,
  };
}

export function stopPointerDown(event: PointerEvent): void {
  event.stopPropagation();
}
