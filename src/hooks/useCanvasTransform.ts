import { useCallback, useState } from "react";
import { type CanvasTransform, zoomAtPoint } from "../lib/coords";

const INITIAL_TRANSFORM: CanvasTransform = { x: 0, y: 0, scale: 1 };

export function useCanvasTransform() {
  const [transform, setTransform] =
    useState<CanvasTransform>(INITIAL_TRANSFORM);

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    setTransform((current) => ({
      ...current,
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));
  }, []);

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setTransform((current) => zoomAtPoint(current, cx, cy, factor));
  }, []);

  const reset = useCallback(() => {
    setTransform(INITIAL_TRANSFORM);
  }, []);

  return { ...transform, panBy, zoomAt, reset };
}
